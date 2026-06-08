import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Student, ExamSession, Registration } from '../../../types';
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

  activeSession: ExamSession | null = null;
  activeRegs: Registration[] = [];

  paidTotal: number = 0;
  unpaidTotal: number = 0;
  paidCount: number = 0;
  unpaidCount: number = 0;

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
}
