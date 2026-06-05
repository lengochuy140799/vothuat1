import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student, ExamSession, Registration } from '../../../types';
import { IconComponent } from '../icon/icon.component';
import { ExcelExporter } from '../../utils/excel-helper';
import { getExamFeeForBelt, getNextBelt } from '../../../mockData';

@Component({
  selector: 'app-registrations',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './registrations.component.html',
  styleUrls: ['./registrations.component.css']
})
export class RegistrationsComponent implements OnChanges {
  @Input() students: Student[] = [];
  @Input() sessions: ExamSession[] = [];
  @Input() registrations: Registration[] = [];
  @Input() activeSessionId: string = '';

  @Output() activeSessionIdChange = new EventEmitter<string>();
  @Output() addRegistration = new EventEmitter<Registration>();
  @Output() deleteRegistrationId = new EventEmitter<string>();
  @Output() togglePayment = new EventEmitter<string>();
  @Output() notify = new EventEmitter<string>();
  @Output() addStudent = new EventEmitter<Student>();

  currentBeltFilter: string = '';
  searchTerm: string = '';

  isRegisterModalOpen: boolean = false;
  studentSearchTerm: string = '';
  selectedStudentId: string = '';
  targetBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen' = 'Vàng';
  fee: number = 200000;
  paymentStatus: 'PAID' | 'UNPAID' = 'UNPAID';
  notes: string = '';

  // Quick Add Student fields
  isAddStudentModalOpen: boolean = false;
  newStudentName: string = '';
  newStudentGender: 'Nam' | 'Nữ' = 'Nam';
  newStudentBirth: string = '2012-01-01';
  newStudentPhone: string = '';
  newStudentAddress: string = '';
  newStudentBelt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen' = 'Trắng';

  activeSession: ExamSession | null = null;
  activeSessionRegs: Registration[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    this.recalculate();
  }

  isSessionClosed(): boolean {
    return this.activeSession?.status === 'CLOSED';
  }

  onSessionIdChange(newId: string) {
    this.activeSessionIdChange.emit(newId);
    this.searchTerm = '';
  }

  recalculate() {
    this.activeSession = this.sessions.find(s => s.id === this.activeSessionId) || this.sessions[0] || null;
    this.activeSessionRegs = this.registrations.filter(r => r.examSessionId === this.activeSessionId);
  }

  getFilteredRegs(): Registration[] {
    return this.activeSessionRegs.filter(reg => {
      const student = this.students.find(s => s.id === reg.studentId);
      const name = student ? student.name : '';
      const matchesSearch = 
        reg.studentId.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        name.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesBelt = this.currentBeltFilter === '' || reg.currentBelt === this.currentBeltFilter;
      return matchesSearch && matchesBelt;
    });
  }

  getUnregisteredStudents(): Student[] {
    return this.students.filter(student => {
      const isRegistered = this.activeSessionRegs.some(r => r.studentId === student.id);
      const matchesSearch = 
        student.name.toLowerCase().includes(this.studentSearchTerm.toLowerCase()) || 
        student.id.toLowerCase().includes(this.studentSearchTerm.toLowerCase());
      return !isRegistered && matchesSearch;
    });
  }

  getStudentName(studentId: string): string {
    const s = this.students.find(x => x.id === studentId);
    return s ? s.name : 'Võ sinh đã xóa';
  }

  getStudentGender(studentId: string): string {
    const s = this.students.find(x => x.id === studentId);
    return s ? s.gender : '-';
  }

  openRegisterModal() {
    if (this.activeSession && this.activeSession.status === 'CLOSED') {
      alert(`Kỳ thi "${this.activeSession.name}" đã ĐÓNG ĐĂNG KÝ, không thể nhận thêm hồ sơ!`);
      return;
    }
    this.studentSearchTerm = '';
    this.selectedStudentId = '';
    this.targetBelt = 'Vàng';
    this.fee = 200000;
    this.paymentStatus = 'UNPAID';
    this.notes = 'Đóng trực tiếp tại bàn lễ tân';
    this.isRegisterModalOpen = true;
  }

  closeRegisterModal() {
    this.isRegisterModalOpen = false;
  }

  selectStudent(studentId: string) {
    this.selectedStudentId = studentId;
    const student = this.students.find(s => s.id === studentId);
    if (student) {
      const next = getNextBelt(student.currentBelt);
      this.targetBelt = next;
      this.fee = getExamFeeForBelt(next);
    }
  }

  onTargetBeltChange(belt: 'Trắng' | 'Vàng' | 'Xanh' | 'Đỏ' | 'Đen') {
    this.targetBelt = belt;
    this.fee = getExamFeeForBelt(belt);
  }

  handleNewRegistrationSubmit(e: Event) {
    e.preventDefault();
    if (!this.selectedStudentId) {
      alert('Vui lòng chọn võ sinh đăng ký dự thi.');
      return;
    }

    if (this.activeSessionRegs.some(r => r.studentId === this.selectedStudentId)) {
      alert('Võ sinh này đã có hồ sơ đăng ký dự thi trong kỳ này rồi!');
      return;
    }

    const studentObj = this.students.find(s => s.id === this.selectedStudentId)!;

    const newReg: Registration = {
      id: `REG-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      studentId: this.selectedStudentId,
      examSessionId: this.activeSessionId,
      currentBelt: studentObj.currentBelt,
      targetBelt: this.targetBelt,
      examFee: this.fee,
      paymentStatus: this.paymentStatus,
      paymentDate: this.paymentStatus === 'PAID' ? new Date().toISOString().split('T')[0] : undefined,
      notes: this.notes.trim(),
      createdAt: new Date().toISOString()
    };

    this.addRegistration.emit(newReg);
    this.notify.emit(`Đã ghi danh võ sinh ${studentObj.name} dự thi lên đai ${this.targetBelt}`);
    this.closeRegisterModal();
  }

  handleDeleteRegistration(reg: Registration) {
    const studentName = this.getStudentName(reg.studentId);
    if (confirm(`Bạn chắc chắn muốn hủy đăng ký kỳ thi của võ sinh ${studentName}?`)) {
      this.deleteRegistrationId.emit(reg.id);
      this.notify.emit(`Đã hủy đăng ký mẫu của ${studentName}`);
    }
  }

  exportSessionList() {
    if (this.activeSessionRegs.length === 0) {
      this.notify.emit('Không có thí sinh để xuất dữ liệu!');
      return;
    }
    const sessionName = this.activeSession ? this.activeSession.name : this.activeSessionId;
    ExcelExporter.exportExamRegistrationsToExcel(this.activeSessionRegs, this.students, sessionName);
    this.notify.emit(`Đã xuất bảng đăng ký dự thi ${this.activeSessionId} định dạng Excel (.xlsx) thành công!`);
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
      case 'Đen': return 'bg-slate-900 text-slate-100 border-slate-950';
      default: return 'bg-slate-50 text-slate-600 border-slate-200';
    }
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

  openAddStudentModal() {
    this.newStudentName = '';
    this.newStudentGender = 'Nam';
    this.newStudentBirth = '2012-01-01';
    this.newStudentPhone = '';
    this.newStudentAddress = '';
    this.newStudentBelt = 'Trắng';
    this.isAddStudentModalOpen = true;
  }

  closeAddStudentModal() {
    this.isAddStudentModalOpen = false;
  }

  handleAddStudentSubmit(e: Event) {
    e.preventDefault();
    if (!this.newStudentName.trim()) {
      alert('Vui lòng nhập tên võ sinh!');
      return;
    }

    const newId = this.generateNewId();
    const studentData: Student = {
      id: newId,
      name: this.newStudentName.trim(),
      gender: this.newStudentGender,
      birth: this.newStudentBirth,
      phone: this.newStudentPhone.trim(),
      address: this.newStudentAddress.trim(),
      currentBelt: this.newStudentBelt,
      registrationDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    // Emit student add
    this.addStudent.emit(studentData);
    this.notify.emit(`Đã thêm thành công võ sinh mới: ${studentData.name} (${studentData.id})`);

    // Auto select this student
    this.selectedStudentId = studentData.id;
    this.targetBelt = getNextBelt(studentData.currentBelt);
    this.fee = getExamFeeForBelt(this.targetBelt);

    // Close student modal
    this.closeAddStudentModal();
  }
}
