import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student, ExamSession, Registration } from '../../../types';
import { IconComponent } from '../icon/icon.component';
import { ExcelExporter } from '../../utils/excel-helper';

@Component({
  selector: 'app-fees',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './fees.component.html',
  styleUrls: ['./fees.component.css']
})
export class FeesComponent implements OnChanges {
  @Input() students: Student[] = [];
  @Input() sessions: ExamSession[] = [];
  @Input() registrations: Registration[] = [];
  @Input() activeSessionId: string = '';

  @Output() activeSessionIdChange = new EventEmitter<string>();
  @Output() togglePayment = new EventEmitter<string>();
  @Output() updateRegistrationNotes = new EventEmitter<{ id: string; notes: string }>();
  @Output() notify = new EventEmitter<string>();

  paymentFilter: string = '';
  searchTerm: string = '';

  // Editing notes bindings
  editingRegId: string = '';
  tempNotes: string = '';

  // Metrics state
  activeSession: ExamSession | null = null;
  activeSessionRegs: Registration[] = [];

  totalPaid: number = 0;
  totalUnpaid: number = 0;
  predictedTotal: number = 0;
  countPaid: number = 0;
  countUnpaid: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.recalculate();
  }

  onSessionIdChange(newId: string) {
    this.activeSessionIdChange.emit(newId);
    this.searchTerm = '';
  }

  recalculate() {
    this.activeSession = this.sessions.find(s => s.id === this.activeSessionId) || this.sessions[0] || null;
    this.activeSessionRegs = this.registrations.filter(r => r.examSessionId === this.activeSessionId);

    this.countPaid = this.activeSessionRegs.filter(r => r.paymentStatus === 'PAID').length;
    this.countUnpaid = this.activeSessionRegs.filter(r => r.paymentStatus === 'UNPAID').length;

    this.totalPaid = this.activeSessionRegs
      .filter(r => r.paymentStatus === 'PAID')
      .reduce((sum, r) => sum + r.examFee, 0);

    this.totalUnpaid = this.activeSessionRegs
      .filter(r => r.paymentStatus === 'UNPAID')
      .reduce((sum, r) => sum + r.examFee, 0);

    this.predictedTotal = this.totalPaid + this.totalUnpaid;
  }

  getFilteredRegs(): Registration[] {
    return this.activeSessionRegs.filter(reg => {
      const student = this.students.find(s => s.id === reg.studentId);
      const name = student ? student.name : '';
      const matchesSearch = 
        reg.studentId.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
        name.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesPayment = this.paymentFilter === '' || reg.paymentStatus === this.paymentFilter;

      return matchesSearch && matchesPayment;
    });
  }

  getStudentName(studentId: string): string {
    const s = this.students.find(x => x.id === studentId);
    return s ? s.name : 'Võ sinh đã xóa';
  }

  startEditingNotes(regId: string, currentNotes: string) {
    this.editingRegId = regId;
    this.tempNotes = currentNotes;
  }

  saveNotes(regId: string) {
    this.updateRegistrationNotes.emit({ id: regId, notes: this.tempNotes.trim() });
    this.editingRegId = '';
    this.notify.emit('Đã cập nhật đóng ghi chú thu phí!');
  }

  exportBilling() {
    if (this.activeSessionRegs.length === 0) {
      this.notify.emit('Không có dữ liệu thu phí để xuất báo cáo!');
      return;
    }
    const filenameId = this.activeSession ? this.activeSession.id : this.activeSessionId;
    ExcelExporter.exportExamRegistrationsToCsv(this.activeSessionRegs, this.students, `${filenameId}_Bao_Cao_Thu_Chi`);
    this.notify.emit(`Đã xuất báo cáo thu chi đợt thi ${this.activeSessionId} thành công!`);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value);
  }

  getBeltColorClass(belt: string): string {
    switch (belt) {
      case 'Trắng': return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'Vàng': return 'bg-amber-50 text-amber-850 border-amber-200';
      case 'Xanh': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Đỏ': return 'bg-red-50 text-red-800 border-red-200';
      case 'Đen': return 'bg-slate-900 text-slate-100 border-slate-950 p-[2px_5px] shadow-sm';
      default: return 'bg-slate-50 text-slate-650 border-slate-200';
    }
  }
}
