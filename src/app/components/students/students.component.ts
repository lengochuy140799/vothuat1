import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student } from '../../../types';
import { IconComponent } from '../icon/icon.component';
import { ExcelExporter } from '../../utils/excel-helper';

@Component({
  selector: 'app-students',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})
export class StudentsComponent {
  @Input() students: Student[] = [];
  
  @Output() addStudent = new EventEmitter<Student>();
  @Output() updateStudent = new EventEmitter<Student>();
  @Output() deleteStudentId = new EventEmitter<string>();
  @Output() bulkImport = new EventEmitter<Student[]>();
  @Output() notify = new EventEmitter<string>();

  searchTerm: string = '';
  beltFilter: string = '';
  genderFilter: string = '';

  isFormModalOpen: boolean = false;
  isImportModalOpen: boolean = false;
  selectedStudent: Student | null = null;
  bulkCsvText: string = '';

  // Form Field bindings
  formId: string = '';
  formName: string = '';
  formGender: 'Nam' | 'Nữ' = 'Nam';
  formBirth: string = '';
  formPhone: string = '';
  formBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen' = 'Trắng';
  formRegDate: string = '';

  getFilteredStudents(): Student[] {
    return this.students.filter(student => {
      const matchesSearch = 
        student.name.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        student.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.phone.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesBelt = this.beltFilter === '' || student.currentBelt === this.beltFilter;
      const matchesGender = this.genderFilter === '' || student.gender === this.genderFilter;
      return matchesSearch && matchesBelt && matchesGender;
    });
  }

  generateNewId(): string {
    const maxNum = this.students.reduce((max, s) => {
      const match = s.id.match(/VS-\d+-(\d+)/);
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const nextNumString = String(maxNum + 1).padStart(3, '0');
    return `VS-2026-${nextNumString}`;
  }

  openAddForm() {
    this.selectedStudent = null;
    this.formId = this.generateNewId();
    this.formName = '';
    this.formGender = 'Nam';
    this.formBirth = '2012-01-01';
    this.formPhone = '';
    this.formBelt = 'Trắng';
    this.formRegDate = new Date().toISOString().split('T')[0];
    this.isFormModalOpen = true;
  }

  openEditForm(student: Student) {
    this.selectedStudent = student;
    this.formId = student.id;
    this.formName = student.name;
    this.formGender = student.gender;
    this.formBirth = student.birth;
    this.formPhone = student.phone;
    this.formBelt = student.currentBelt;
    this.formRegDate = student.registrationDate;
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
      currentBelt: this.formBelt,
      registrationDate: this.formRegDate,
      createdAt: this.selectedStudent ? this.selectedStudent.createdAt : new Date().toISOString()
    };

    if (this.selectedStudent) {
      this.updateStudent.emit(studentData);
      this.notify.emit(`Đã cập nhật thông tin võ sinh ${this.formName}`);
    } else {
      if (this.students.some(s => s.id === studentData.id)) {
        this.notify.emit(`Mã võ sinh ${studentData.id} đã tồn tại trong hệ thống!`);
        return;
      }
      this.addStudent.emit(studentData);
      this.notify.emit(`Đã thêm mới võ sinh ${this.formName}`);
    }
    this.closeFormModal();
  }

  deleteStudent(student: Student) {
    if (confirm(`Bạn chắc chắn muốn xóa hồ sơ ${student.name} (${student.id})? Mọi đăng ký thi đai liên quan và hóa đơn cũng sẽ bị loại bỏ.`)) {
      this.deleteStudentId.emit(student.id);
      this.notify.emit(`Đã xóa võ sinh ${student.name}`);
    }
  }

  openImportModal() {
    this.bulkCsvText = '';
    this.isImportModalOpen = true;
  }

  closeImportModal() {
    this.isImportModalOpen = false;
  }

  submitCsvImport() {
    if (!this.bulkCsvText.trim()) {
      alert('Vui lòng dán dữ liệu CSV theo mẫu trước.');
      return;
    }
    const parsed = ExcelExporter.parseStudentsCsv(this.bulkCsvText);
    if (parsed.length === 0) {
      alert('Không nhận diện được dòng dữ liệu. Vui lòng kiểm tra tiêu đề.');
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
        currentBelt: item.currentBelt || 'Trắng',
        registrationDate: item.registrationDate || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
    });

    this.bulkImport.emit(newStudents);
    this.notify.emit(`Nạp dữ liệu thành công! Đã thêm ${newStudents.length} võ sinh mẫu.`);
    this.closeImportModal();
  }

  exportStudents() {
    if (this.students.length === 0) {
      this.notify.emit('Không có dữ liệu võ sinh để xuất!');
      return;
    }
    ExcelExporter.exportStudentsToCsv(this.students);
    this.notify.emit('Đã xuất danh sách võ sinh CSV thành công!');
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
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
