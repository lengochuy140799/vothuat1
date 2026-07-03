import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student, ExamSession, Registration, BeltType } from '../../../types';
import { IconComponent } from '../icon/icon.component';
import { ExcelExporter } from '../../utils/excel-helper';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IconComponent, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnChanges {
  @Input() students: Student[] = [];
  @Input() sessions: ExamSession[] = [];
  @Input() registrations: Registration[] = [];
  @Input() activeSessionId: string = '';
  
  @Output() activeSessionIdChange = new EventEmitter<string>();
  @Output() notify = new EventEmitter<string>();
  @Output() updateStudent = new EventEmitter<Student>();

  activeSession: ExamSession | null = null;
  activeRegs: Registration[] = [];

  paidTotal: number = 0;
  unpaidTotal: number = 0;
  paidCount: number = 0;
  unpaidCount: number = 0;

  // Student search & filter
  searchTerm: string = '';
  selectedBeltFilter: string = '';
  
  // Pagination
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Edit Student Modal state
  isEditModalOpen: boolean = false;
  editingStudent: Student | null = null;

  // Form Fields
  formId: string = '';
  formName: string = '';
  formGender: 'Nam' | 'Nữ' = 'Nam';
  formBirth: string = '';
  formPhone: string = '';
  formAddress: string = '';
  formBelt: BeltType = 'Đen';
  formRegDate: string = '';

  beltTypes: BeltType[] = [
    'Trắng', 'Xanh', 'Xanh 1', 'Xanh 2', 'Xanh 3', 'Đen Xanh', 'Đỏ', 'Đỏ 1', 'Đỏ 2', 'Đỏ 3', 'Vàng', 'Vàng 1', 'Vàng 2', 'Vàng 3', 'Vàng 4', 'Đen'
  ];

  ngOnChanges(changes: SimpleChanges): void {
    this.recalculate();
  }

  onSessionIdChange(newId: string) {
    this.activeSessionIdChange.emit(newId);
  }

  recalculate() {
    this.activeSession = this.sessions.find(s => s.id === this.activeSessionId) || this.sessions[0] || null;
    this.activeRegs = this.registrations.filter(r => r.examSessionId === this.activeSessionId);

    this.paidCount = this.activeRegs.filter(r => r.paymentStatus === 'PAID').length;
    this.unpaidCount = this.activeRegs.filter(r => r.paymentStatus === 'UNPAID').length;

    this.paidTotal = this.activeRegs
      .filter(r => r.paymentStatus === 'PAID')
      .reduce((sum, r) => sum + r.examFee, 0);

    this.unpaidTotal = this.activeRegs
      .filter(r => r.paymentStatus === 'UNPAID')
      .reduce((sum, r) => sum + r.examFee, 0);
  }

  countOpenSessions(): number {
    return this.sessions.filter(s => s.status === 'OPEN').length;
  }

  getPaidPercent(): number {
    const total = this.activeRegs.length;
    if (total === 0) return 0;
    return Math.round((this.paidCount / total) * 100);
  }

  getStudentName(studentId: string): string {
    const s = this.students.find(x => x.id === studentId);
    return s ? s.name : 'Võ sinh đã xóa';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  exportAllReport() {
    if (this.sessions.length === 0) {
      this.notify.emit('Không có dữ liệu kỳ thi để xuất báo cáo!');
      return;
    }
    ExcelExporter.exportComprehensiveReport(this.sessions, this.registrations, this.students);
    this.notify.emit('Đã xuất báo cáo toàn diện CLB Nguyễn Thanh Vũ thành công!');
  }

  getFilteredStudents(): Student[] {
    return this.students.filter(student => {
      const matchSearch = !this.searchTerm.trim() || 
        student.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        student.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (student.phone && student.phone.includes(this.searchTerm));
      
      const matchBelt = !this.selectedBeltFilter || student.currentBelt === this.selectedBeltFilter;
      
      return matchSearch && matchBelt;
    });
  }

  getPaginatedStudents(): Student[] {
    const filtered = this.getFilteredStudents();
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return filtered.slice(startIndex, startIndex + this.itemsPerPage);
  }

  getTotalPages(): number {
    const filteredCount = this.getFilteredStudents().length;
    return Math.ceil(filteredCount / this.itemsPerPage) || 1;
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  onFilterChange() {
    this.currentPage = 1;
  }

  openEditModal(student: Student) {
    this.editingStudent = student;
    this.formId = student.id;
    this.formName = student.name;
    this.formGender = student.gender;
    this.formBirth = student.birth;
    this.formPhone = student.phone || '';
    this.formAddress = student.address || '';
    this.formBelt = student.currentBelt;
    this.formRegDate = student.registrationDate;
    
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.editingStudent = null;
  }

  submitEditForm(e: Event) {
    e.preventDefault();
    if (!this.formName.trim()) {
      this.notify.emit('Vui lòng nhập tên võ sinh!');
      return;
    }

    const updatedStudent: Student = {
      id: this.formId,
      name: this.formName.trim(),
      gender: this.formGender,
      birth: this.formBirth,
      phone: this.formPhone.trim(),
      address: this.formAddress.trim(),
      currentBelt: this.formBelt,
      registrationDate: this.formRegDate,
      createdAt: this.editingStudent ? this.editingStudent.createdAt : new Date().toISOString()
    };

    this.updateStudent.emit(updatedStudent);
    this.notify.emit(`Đã cập nhật thông tin võ sinh ${this.formName.trim()} thành công!`);
    this.closeEditModal();
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }
}
