import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student, Registration } from '../../../types';
import { IconComponent } from '../icon/icon.component';
import { ExcelExporter } from '../../utils/excel-helper';
import { ApiService } from '../../services/api.service';
import * as XLSX from 'xlsx';

export interface MonthlyBilling {
  studentId: string;
  status: 'Đã đóng' | 'Chưa đóng';
  fee: number;
  isDeleted?: boolean;
}

export interface MonthlyBillingItem {
  id: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  birth: string;
  phone: string;
  currentBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen';
  registrationDate: string;
  tuitionFee: number;
  tuitionStatus: 'Đã đóng' | 'Chưa đóng';
  address?: string;
  monthRecordIdx: number;
}

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent implements OnInit {
  @Input() students: Student[] = [];
  @Input() registrations: Registration[] = [];
  
  @Output() addStudent = new EventEmitter<{ student: Student; month?: string }>();
  @Output() updateStudent = new EventEmitter<Student>();
  @Output() deleteStudentId = new EventEmitter<string>();
  @Output() bulkImport = new EventEmitter<Student[]>();
  @Output() notify = new EventEmitter<any>();
  @Output() reloadState = new EventEmitter<void>();

  // Filter and input bounds
  searchTerm: string = '';
  beltFilter: string = '';
  tuitionStatusFilter: string = '';
  genderFilter: string = '';

  isFormModalOpen: boolean = false;
  isImportModalOpen: boolean = false;
  isAddMonthModalOpen: boolean = false;
  isDeleteMonthModalOpen: boolean = false;
  monthToDelete: string = '';
  
  selectedStudent: Student | null = null;
  bulkCsvText: string = '';

  // Form Field bindings
  formId: string = '';
  formName: string = '';
  formGender: 'Nam' | 'Nữ' = 'Nam';
  formBirth: string = '';
  formPhone: string = '';
  formAddress: string = '';
  formBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen' = 'Trắng';
  formRegDate: string = '';
  formFee: number = 400000;
  formTuitionStatus: 'Đã đóng' | 'Chưa đóng' = 'Chưa đóng';

  // Month-by-month database
  activeMonth: string = '06/2026';
  tuitionDb: { [key: string]: MonthlyBilling[] } = {};
  dbMonths: string[] = [];

  // Pagination bounds
  studentCurrentPage: number = 1;
  studentRowsPerPage: number = 8;

  // Month input binding
  formNewMonthValue: string = '';
  copyFromPreviousMonth: boolean = true;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.initializeMonthlyData();
  }

  initializeMonthlyData() {
    this.apiService.getTuitionMonths().subscribe({
      next: (monthList) => {
        if (monthList && monthList.length > 0) {
          this.dbMonths = monthList.map(m => m.month);
        } else {
          this.dbMonths = [];
        }

        this.apiService.getTuitions().subscribe({
          next: (list) => {
            const db: { [key: string]: MonthlyBilling[] } = {};
            if (list && list.length > 0) {
              list.forEach(item => {
                const m = item.month;
                if (!db[m]) {
                  db[m] = [];
                }
                db[m].push({
                  studentId: item.studentId,
                  status: item.status as any,
                  fee: Number(item.fee),
                  isDeleted: item.isDeleted || false
                });
              });
            }
            this.tuitionDb = db;

            // fallback activeMonth if list is empty
            const months = this.getMonths();
            if (months.length > 0 && !months.includes(this.activeMonth)) {
              this.activeMonth = months[months.length - 1];
            }
          },
          error: (err) => {
            console.error('Failed to load tuitions from DB:', err);
            this.tuitionDb = {};
          }
        });
      },
      error: (err) => {
        console.error('Failed to load tuition months from DB:', err);
      }
    });
  }

  getMonths(): string[] {
    return [...this.dbMonths].sort((a, b) => {
      const partsA = a.split('/');
      const partsB = b.split('/');
      if (partsA.length < 2 || partsB.length < 2) return 0;
      const [mA, yA] = partsA.map(Number);
      const [mB, yB] = partsB.map(Number);
      return yA !== yB ? yA - yB : mA - mB;
    });
  }

  selectMonth(month: string) {
    this.activeMonth = month;
    this.studentCurrentPage = 1;
    this.notify.emit(`Đã chuyển sang xem dữ liệu Tháng ${month}`);
  }

  openAddMonthModal() {
    this.formNewMonthValue = '';
    this.copyFromPreviousMonth = true;
    this.isAddMonthModalOpen = true;
  }

  closeAddMonthModal() {
    this.isAddMonthModalOpen = false;
  }

  submitAddMonth(e: Event) {
    e.preventDefault();
    if (!this.formNewMonthValue) {
      alert('Vui lòng chọn hoặc nhập Tháng/Năm đầy đủ!');
      return;
    }

    const [year, month] = this.formNewMonthValue.split('-'); // e.g., "2026-07"
    const newMonthKey = `${month}/${year}`;

    if (this.dbMonths.includes(newMonthKey)) {
      alert(`Trang dữ liệu Tháng ${newMonthKey} đã tồn tại trong danh mục!`);
      return;
    }

    const sortedMonths = this.getMonths();
    const prevMonthKey = sortedMonths.length > 0 ? sortedMonths[sortedMonths.length - 1] : null;

    // Sync clone or empty new month to backend DB
    if (this.copyFromPreviousMonth && prevMonthKey) {
      this.apiService.cloneTuitionMonth(newMonthKey, prevMonthKey).subscribe({
        next: () => {
          console.log('Successfully cloned tuition month in database');
          this.activeMonth = newMonthKey;
          this.initializeMonthlyData();
          this.notify.emit(`Đã khởi tạo thành công sổ theo dõi học phí Tháng ${newMonthKey}!`);
          this.studentCurrentPage = 1;
          this.reloadState.emit(); // Sync NgRx store state (registrations etc)
        },
        error: (err) => {
          console.error('Failed to sync cloned tuition month in DB:', err);
          const errorMsg = this.getErrorMessage(err, 'Lỗi khi sao chép tháng học phí.');
          this.notify.emit({ message: `Lỗi: ${errorMsg}`, isError: true });
        }
      });
    } else {
      // Just save the simple empty tuition month to DB
      this.apiService.addTuitionMonth({ month: newMonthKey }).subscribe({
        next: () => {
          console.log('Successfully saved initialized empty month to database');
          this.activeMonth = newMonthKey;
          this.initializeMonthlyData();
          this.notify.emit(`Đã khởi tạo thành công sổ theo dõi học phí Tháng ${newMonthKey}!`);
          this.studentCurrentPage = 1;
        },
        error: (err) => {
          console.error('Failed to save initialized month to DB:', err);
          const errorMsg = this.getErrorMessage(err, 'Lỗi khi tạo tháng học phí mới.');
          this.notify.emit({ message: `Lỗi: ${errorMsg}`, isError: true });
        }
      });
    }

    this.isAddMonthModalOpen = false;
  }

  confirmDeleteMonth(month: string) {
    this.monthToDelete = month;
    this.isDeleteMonthModalOpen = true;
  }

  closeDeleteMonthModal() {
    this.isDeleteMonthModalOpen = false;
    this.monthToDelete = '';
  }

  submitDeleteMonth() {
    if (!this.monthToDelete) return;
    const targetMonth = this.monthToDelete;

    this.apiService.deleteTuitionMonth(targetMonth).subscribe({
      next: () => {
        console.log('Successfully deleted tuition month from database:', targetMonth);
        this.dbMonths = this.dbMonths.filter(m => m !== targetMonth);
        delete this.tuitionDb[targetMonth];

        const remainingMonths = this.getMonths();
        if (remainingMonths.length > 0) {
          this.activeMonth = remainingMonths[remainingMonths.length - 1];
        } else {
          this.activeMonth = '06/2026'; // fallback to standard default instead of empty
        }
        
        this.notify.emit(`Đã xóa hoàn toàn Sổ Thu Phí Tháng ${targetMonth}`);
        this.studentCurrentPage = 1;
        this.reloadState.emit(); // Sync NgRx store state (registrations etc)
        this.closeDeleteMonthModal();
      },
      error: (err) => {
        console.error('Failed to delete tuition month from DB:', err);
        const errorMsg = this.getErrorMessage(err, 'Không thể xóa sổ tháng từ hệ thống database.');
        this.notify.emit({ message: `Lỗi: ${errorMsg}`, isError: true });
        this.closeDeleteMonthModal();
      }
    });
  }

  syncMonthStudents() {
    // Left empty purposely as "mỗi tháng có võ sinh riêng" layout is requested,
    // avoiding automatic pool mirroring that pollutes separate months.
  }

  // Active items for activeMonth
  getActiveMonthItems(): MonthlyBillingItem[] {
    const regsForMonth = this.registrations.filter(r => r.month === this.activeMonth);
    const items: MonthlyBillingItem[] = [];

    regsForMonth.forEach((reg, idx) => {
      const student = this.students.find(s => s.id === reg.studentId);
      if (student) {
        let status: 'Đã đóng' | 'Chưa đóng' = reg.paymentStatus === 'PAID' ? 'Đã đóng' : 'Chưa đóng';
        let fee = 400000;

        const records = this.tuitionDb[this.activeMonth] || [];
        const tuitionRec = records.find(r => r.studentId === student.id);
        if (tuitionRec) {
          if (tuitionRec.isDeleted) return;
          fee = tuitionRec.fee;
          status = tuitionRec.status;
        }

        items.push({
          id: student.id,
          name: student.name,
          gender: student.gender,
          birth: student.birth,
          phone: student.phone,
          currentBelt: student.currentBelt,
          registrationDate: student.registrationDate,
          address: student.address || '',
          tuitionFee: fee,
          tuitionStatus: status,
          monthRecordIdx: idx
        });
      }
    });

    return items;
  }

  // Filtered lists matching requested options
  getFilteredMonthItems(): MonthlyBillingItem[] {
    const list = this.getActiveMonthItems();
    const search = this.searchTerm.toLowerCase().trim();
    const belt = this.beltFilter;
    const tStatus = this.tuitionStatusFilter;
    const gender = this.genderFilter;

    return list.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(search) || 
        item.id.toLowerCase().includes(search) || 
        item.phone.toLowerCase().includes(search);
      const matchesBelt = belt === '' || item.currentBelt === belt;
      const matchesTuition = tStatus === '' || item.tuitionStatus === tStatus;
      const matchesGender = gender === '' || item.gender === gender;

      return matchesSearch && matchesBelt && matchesTuition && matchesGender;
    });
  }

  // Paginated elements
  get paginatedFilteredItems(): MonthlyBillingItem[] {
    const list = this.getFilteredMonthItems();
    const startIdx = (this.studentCurrentPage - 1) * this.studentRowsPerPage;
    return list.slice(startIdx, startIdx + this.studentRowsPerPage);
  }

  get totalPages(): number {
    return Math.ceil(this.getFilteredMonthItems().length / this.studentRowsPerPage) || 1;
  }

  prevPage() {
    if (this.studentCurrentPage > 1) {
      this.studentCurrentPage--;
    }
  }

  nextPage() {
    if (this.studentCurrentPage < this.totalPages) {
      this.studentCurrentPage++;
    }
  }

  // KPI Calculations
  get kpiTotalStudents(): number {
    return this.getActiveMonthItems().length;
  }

  get kpiPaidCount(): number {
    return this.getActiveMonthItems().filter(i => i.tuitionStatus === 'Đã đóng').length;
  }

  get kpiUnpaidCount(): number {
    return this.getActiveMonthItems().filter(i => i.tuitionStatus === 'Chưa đóng').length;
  }

  get kpiTotalRevenue(): number {
    return this.getActiveMonthItems().reduce((sum, item) => sum + item.tuitionFee, 0);
  }

  resetFilters() {
    this.searchTerm = '';
    this.beltFilter = '';
    this.tuitionStatusFilter = '';
    this.genderFilter = '';
    this.studentCurrentPage = 1;
    this.notify.emit('Đã đặt lại toàn bộ bộ lọc hoàn toàn!');
  }

  toggleTuitionStatus(item: MonthlyBillingItem) {
    const records = this.tuitionDb[this.activeMonth] || [];
    const tuitionRec = records.find(r => r.studentId === item.id);
    if (tuitionRec) {
      const current = tuitionRec.status;
      const newStatus = current === 'Đã đóng' ? 'Chưa đóng' : 'Đã đóng';
      tuitionRec.status = newStatus;

      // Sync update to backend
      const tuiId = `TUI-${this.activeMonth.replace("/", "")}-${item.id.replace("-", "")}`;
      this.apiService.updateTuition(tuiId, {
        studentId: item.id,
        month: this.activeMonth,
        status: newStatus,
        fee: tuitionRec.fee
      }).subscribe({
        next: () => {
          console.log('Successfully toggled tuition status in DB');
          this.notify.emit(`Đã cập nhật trạng thái học phí của ${item.name}`);
        },
        error: (err) => {
          console.error('Failed to sync toggle tuition status in DB:', err);
          tuitionRec.status = current; // Rollback
          const errorMsg = this.getErrorMessage(err, 'Lỗi cập nhật học phí.');
          this.notify.emit({ message: `Lỗi: ${errorMsg}`, isError: true });
        }
      });
    }
  }

  generateNewId(): string {
    let nextNum = this.students.reduce((max, s) => {
      const match = s.id.match(/(HV|VS)-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[2]);
        return num > max ? num : max;
      }
      return max;
    }, 0) + 1;

    let idCandidate = `VS-2026-${String(nextNum).padStart(3, '0')}`;
    while (this.students.some(s => s.id === idCandidate)) {
      nextNum++;
      idCandidate = `VS-2026-${String(nextNum).padStart(3, '0')}`;
    }
    return idCandidate;
  }

  openAddForm() {
    this.selectedStudent = null;
    this.formId = this.generateNewId();
    this.formName = '';
    this.formGender = 'Nam';
    this.formBirth = '2012-01-01';
    this.formPhone = '';
    this.formAddress = '';
    this.formBelt = 'Trắng';
    this.formRegDate = new Date().toISOString().split('T')[0];
    this.formFee = 400000;
    this.formTuitionStatus = 'Chưa đóng';
    this.isFormModalOpen = true;
  }

  openEditForm(item: MonthlyBillingItem) {
    const student = this.students.find(s => s.id === item.id);
    if (!student) return;

    this.selectedStudent = student;
    this.formId = student.id;
    this.formName = student.name;
    this.formGender = student.gender;
    this.formBirth = student.birth;
    this.formPhone = student.phone;
    this.formAddress = student.address || '';
    this.formBelt = student.currentBelt;
    this.formRegDate = student.registrationDate;
    
    this.formFee = item.tuitionFee;
    this.formTuitionStatus = item.tuitionStatus;
    
    this.isFormModalOpen = true;
  }

  closeFormModal() {
    this.isFormModalOpen = false;
    this.selectedStudent = null;
  }

  submitForm(e: Event) {
    e.preventDefault();
    if (!this.formName.trim()) {
      this.notify.emit('Vui lòng nhập tên võ sinh!');
      return;
    }

    const studentData: Student = {
      id: this.formId.toUpperCase().trim(),
      name: this.formName.trim(),
      gender: this.formGender,
      birth: this.formBirth,
      phone: this.formPhone.trim(),
      address: this.formAddress.trim(),
      currentBelt: this.formBelt,
      registrationDate: this.formRegDate,
      createdAt: this.selectedStudent ? this.selectedStudent.createdAt : new Date().toISOString()
    };

    if (this.selectedStudent) {
      // General profile update
      this.updateStudent.emit(studentData);
      
      // Monthly billing fee & status update
      const records = this.tuitionDb[this.activeMonth] || [];
      const rec = records.find(r => r.studentId === studentData.id);
      if (rec) {
        rec.fee = this.formFee;
        rec.status = this.formTuitionStatus;

        // Sync update to backend
        const tuiId = `TUI-${this.activeMonth.replace("/", "")}-${studentData.id.replace("-", "")}`;
        this.apiService.updateTuition(tuiId, {
          studentId: studentData.id,
          month: this.activeMonth,
          status: this.formTuitionStatus,
          fee: this.formFee
        }).subscribe({
          next: () => {
            console.log('Successfully updated tuition in DB');
            this.notify.emit(`Đã cập nhật thông tin võ sinh ${this.formName}`);
          },
          error: (err) => {
            console.error('Failed to sync tuition update in DB:', err);
            const errorMsg = this.getErrorMessage(err, 'Lỗi cập nhật học phí.');
            this.notify.emit({ message: `Lỗi: ${errorMsg}`, isError: true });
          }
        });
      } else {
        this.notify.emit(`Đã cập nhật thông tin võ sinh ${this.formName}`);
      }
    } else {
      if (this.students.some(s => s.id === studentData.id)) {
        this.notify.emit({ message: `Mã võ sinh ${studentData.id} đã tồn tại trong hệ thống!`, isError: true });
        return;
      }
      
      // Monthly state mapping creation locally (instant UI feedback)
      if (!this.tuitionDb[this.activeMonth]) {
        this.tuitionDb[this.activeMonth] = [];
      }
      const existingIdx = this.tuitionDb[this.activeMonth].findIndex(r => r.studentId === studentData.id);
      if (existingIdx > -1) {
        this.tuitionDb[this.activeMonth][existingIdx].fee = this.formFee;
        this.tuitionDb[this.activeMonth][existingIdx].status = this.formTuitionStatus;
        this.tuitionDb[this.activeMonth][existingIdx].isDeleted = false;
      } else {
        this.tuitionDb[this.activeMonth].push({
          studentId: studentData.id,
          status: this.formTuitionStatus,
          fee: this.formFee
        });
      }

      // Sync creation to backend DB (sequential requests to avoid race conditions/duplicate primary keys)
      this.apiService.addStudent(studentData, this.activeMonth).subscribe({
        next: (savedStudent) => {
          console.log('Successfully saved student profile:', savedStudent);
          
          const tuitionPayload = {
            studentId: studentData.id,
            month: this.activeMonth,
            status: this.formTuitionStatus,
            fee: this.formFee
          };
          
          this.apiService.addTuition(tuitionPayload).subscribe({
            next: (savedTuition) => {
              console.log('Successfully saved tuition to database:', savedTuition);
              
              // Now update NgRx state
              this.addStudent.emit({ student: studentData, month: this.activeMonth });
              this.notify.emit(`Đã ghi danh và cập nhật bách khoa học phí võ sinh ${this.formName}`);
            },
            error: (err) => {
              console.error('Failed to sync tuition to database:', err);
              const errorMsg = this.getErrorMessage(err, 'Lỗi khởi tạo học phí võ sinh.');
              this.notify.emit({ message: `Lỗi: ${errorMsg}`, isError: true });
            }
          });
        },
        error: (err) => {
          console.error('Failed to sync student:', err);
          const errorMsg = this.getErrorMessage(err, 'Lỗi thêm mới võ sinh.');
          this.notify.emit({ message: `Lỗi: ${errorMsg}`, isError: true });
        }
      });
    }
    this.closeFormModal();
  }

  deleteStudent(item: MonthlyBillingItem) {
    if (confirm(`Bạn chắc chắn muốn XÓA VĨNH VIỄN võ sinh ${item.name} (${item.id}) khỏi toàn bộ hệ thống? Thao tác này sẽ xóa hồ sơ gốc và lịch sử thuộc tất cả các bảng (học phí, kì thi).`)) {
      // Remove from local tuition database across all months immediately
      Object.keys(this.tuitionDb).forEach(monthKey => {
        if (this.tuitionDb[monthKey]) {
          this.tuitionDb[monthKey] = this.tuitionDb[monthKey].filter(r => r.studentId !== item.id);
        }
      });

      // Dispatch action to update store and call backend Student DELETE API
      this.deleteStudentId.emit(item.id);
      
      this.notify.emit(`Đã xóa vĩnh viễn võ sinh ${item.name} khỏi hệ thống.`);
      this.studentCurrentPage = 1;
    }
  }

  selectedImportFile: File | null = null;
  selectedImportFileName: string = '';

  onFileChange(event: any) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      this.selectedImportFile = target.files[0];
      this.selectedImportFileName = this.selectedImportFile.name;
    }
  }

  downloadExcelTemplate() {
    ExcelExporter.downloadSampleExcel();
    this.notify.emit('Đã tải mẫu nhập hồ sơ võ sinh Excel (.xlsx) thành công!');
  }

  openImportModal() {
    this.bulkCsvText = '';
    this.selectedImportFile = null;
    this.selectedImportFileName = '';
    this.isImportModalOpen = true;
  }

  closeImportModal() {
    this.isImportModalOpen = false;
  }

  submitImport() {
    if (this.selectedImportFile) {
      ExcelExporter.parseStudentsExcelFile(this.selectedImportFile).then(parsed => {
        this.processParsedStudents(parsed);
      }).catch(err => {
        alert('Có lỗi xảy ra khi đọc file Excel. Vui lòng kiểm tra lại cấu trúc file mẫu!');
        console.error(err);
      });
    } else {
      if (!this.bulkCsvText.trim()) {
        alert('Vui lòng tải file Excel lên hoặc dán dữ liệu bảng tính theo mẫu trước.');
        return;
      }
      const parsed = ExcelExporter.parseStudentsClipboardText(this.bulkCsvText);
      this.processParsedStudents(parsed);
    }
  }

  private processParsedStudents(parsed: Partial<Student>[]) {
    if (parsed.length === 0) {
      alert('Không nhận diện được dòng dữ liệu võ sinh nào. Vui lòng kiểm tra lại cấu trúc hàng cột.');
      return;
    }

    const newStudents: Student[] = parsed.map((item, idx) => {
      const uniqueId = item.id && !this.students.some(s => s.id === item.id) 
        ? item.id 
        : `VS-2026-${String(this.students.length + idx + 1).padStart(3, '0')}`;
      
      return {
        id: uniqueId.toUpperCase().trim(),
        name: item.name || 'Học viên chưa đặt tên',
        gender: item.gender || 'Nam',
        birth: item.birth || '2012-01-01',
        phone: item.phone || '0901234567',
        address: '',
        currentBelt: item.currentBelt || 'Trắng',
        registrationDate: item.registrationDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
    });

    this.bulkImport.emit(newStudents);
    this.notify.emit(`Nạp hồ sơ thành công! Đã thêm ${newStudents.length} võ sinh mới.`);
    this.studentCurrentPage = 1;
    this.closeImportModal();
  }

  // Active month single sheet export
  exportStudents() {
    const list = this.getFilteredMonthItems();
    if (list.length === 0) {
      this.notify.emit('Không có dữ liệu trong tháng này để xuất!');
      return;
    }
    
    const headers = ['STT', 'Mã Võ Sinh', 'Họ Và Tên', 'Giới Tính', 'Ngày Sinh', 'Số Điện Thoại', 'Địa Chỉ', 'Cấp Đai Hiện Tại', 'Mức Học Phí', 'Học Phí Tháng'];
    const rows = list.map((item, index) => [
      index + 1,
      item.id,
      item.name,
      item.gender,
      this.formatDate(item.birth),
      item.phone,
      item.address || '',
      item.currentBelt,
      item.tuitionFee,
      item.tuitionStatus
    ]);

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    const colWidths = headers.map((_, i) => ({
      wch: Math.max(...worksheetData.map(row => row[i] ? row[i].toString().length + 3 : 10))
    }));
    worksheet['!cols'] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Thu Phí Tháng ${this.activeMonth.replace('/', '-')}`);

    XLSX.writeFile(workbook, `Hoc_Phi_MABU_Thang_${this.activeMonth.replace('/', '_')}.xlsx`);
    this.notify.emit(`Đã xuất báo cáo học phí Tháng ${this.activeMonth} Excel (.xlsx) thành công!`);
  }

  // Multi-sheet complete monthly log exports
  exportAllMonths() {
    try {
      const workbook = XLSX.utils.book_new();
      const sortedMonths = this.getMonths();

      sortedMonths.forEach(monthKey => {
        // Build active list for that particular month
        const records = this.tuitionDb[monthKey] || [];
        const monthlyRowData = records
          .filter(r => !r.isDeleted)
          .map((rec, index) => {
            const s = this.students.find(student => student.id === rec.studentId);
            return [
              index + 1,
              rec.studentId,
              s ? s.name : 'N/A',
              s ? s.gender : 'N/A',
              s ? this.formatDate(s.birth) : 'N/A',
              s ? s.phone : 'N/A',
              s ? (s.address || '') : '',
              s ? s.currentBelt : 'N/A',
              rec.fee,
              rec.status
            ];
          });

        const headers = ['STT', 'Mã Võ Sinh', 'Họ và Tên', 'Giới Tính', 'Ngày Sinh', 'Số Điện Thoại', 'Địa Chỉ', 'Cấp Đai', 'Học Phí Hàng Tháng', 'Trạng Thái'];
        const wsData = [headers, ...monthlyRowData];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        ws['!cols'] = headers.map((_, i) => ({ wch: 15 }));
        XLSX.utils.book_append_sheet(workbook, ws, `Tháng ${monthKey.replace('/', '-')}`);
      });

      XLSX.writeFile(workbook, 'So_Theo_Doi_Hoc_Phi_MABU_Tron_Goi.xlsx');
      this.notify.emit('Đã xuất sổ sách theo dõi học phí trọn gói (.XLSX) thành công!');
    } catch (err) {
      console.error(err);
      this.notify.emit('Có lỗi xảy ra khi tổng hợp dữ liệu!');
    }
  }

  getErrorMessage(err: any, defaultMsg: string): string {
    if (err && err.error) {
      if (typeof err.error === 'string') {
        try {
          const parsed = JSON.parse(err.error);
          if (parsed && parsed.details && typeof parsed.details === 'object' && !Array.isArray(parsed.details)) {
            const messages = Object.values(parsed.details).filter(v => !!v).map(v => String(v));
            if (messages.length > 0) {
              return messages.join(', ');
            }
          }
          if (parsed && parsed.message) {
            return parsed.message;
          }
        } catch {
          return err.error;
        }
      }

      if (err.error.details && typeof err.error.details === 'object' && !Array.isArray(err.error.details)) {
        const details = err.error.details;
        const messages: string[] = [];
        for (const key of Object.keys(details)) {
          if (details[key]) {
            messages.push(String(details[key]));
          }
        }
        if (messages.length > 0) {
          return messages.join(', ');
        }
      }

      if (err.error.message) {
        return err.error.message;
      }
    }
    if (err && err.message) {
      return err.message;
    }
    return defaultMsg;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, d] = parts;
    return `${d}/${m}/${y}`;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  getBeltColorClass(belt: string): string {
    switch (belt) {
      case 'Trắng': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'Vàng': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Xanh': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Đỏ': return 'bg-red-50 text-red-800 border-red-200';
      case 'Đen': return 'bg-slate-900 text-slate-100 border-slate-950 p-[3px_7px] shadow-sm';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  }
}
