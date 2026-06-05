import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExamSession, Registration } from '../../../types';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-exams',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './exams.component.html',
  styleUrls: ['./exams.component.css']
})
export class ExamsComponent {
  @Input() sessions: ExamSession[] = [];
  @Input() registrations: Registration[] = [];

  @Output() addSession = new EventEmitter<ExamSession>();
  @Output() updateSession = new EventEmitter<ExamSession>();
  @Output() deleteSessionId = new EventEmitter<string>();
  @Output() notify = new EventEmitter<string>();

  isOpenFormModal: boolean = false;
  selectedSession: ExamSession | null = null;

  // Form Fields
  formId: string = '';
  formName: string = '';
  formDate: string = '';
  formLocation: string = '';
  formStatus: 'OPEN' | 'CLOSED' = 'OPEN';

  getRegisteredCount(sessionId: string): number {
    return this.registrations.filter(r => r.examSessionId === sessionId).length;
  }

  openAddForm() {
    this.selectedSession = null;
    const predictedId = `EX-2026-Q${this.sessions.length + 1}`;
    this.formId = predictedId;
    this.formName = `Kỳ thi thăng cấp đai Quý ${this.sessions.length + 1}/2026`;
    this.formDate = new Date('2026-06-20').toISOString().split('T')[0];
    this.formLocation = 'Võ đường tổ hợp cơ sở chính';
    this.formStatus = 'OPEN';
    this.isOpenFormModal = true;
  }

  openEditForm(session: ExamSession) {
    this.selectedSession = session;
    this.formId = session.id;
    this.formName = session.name;
    this.formDate = session.date;
    this.formLocation = session.location;
    this.formStatus = session.status;
    this.isOpenFormModal = true;
  }

  closeFormModal() {
    this.isOpenFormModal = false;
    this.selectedSession = null;
  }

  submitForm(e: Event) {
    e.preventDefault();
    if (!this.formName.trim() || !this.formId.trim()) {
      this.notify.emit('Vui lòng điền đủ thông tin bắt buộc!');
      return;
    }

    const sessionData: ExamSession = {
      id: this.formId.toUpperCase().trim(),
      name: this.formName.trim(),
      date: this.formDate,
      location: this.formLocation.trim(),
      status: this.formStatus,
      createdAt: this.selectedSession ? this.selectedSession.createdAt : new Date().toISOString()
    };

    if (this.selectedSession) {
      this.updateSession.emit(sessionData);
      this.notify.emit(`Đã sửa kì thi: ${this.formName}`);
    } else {
      if (this.sessions.some(s => s.id === sessionData.id)) {
        this.notify.emit(`Mã kì thi ${sessionData.id} đã tồn tại!`);
        return;
      }
      this.addSession.emit(sessionData);
      this.notify.emit(`Đã công bố kì thi mới: ${this.formName}`);
    }
    this.closeFormModal();
  }

  deleteSession(session: ExamSession) {
    if (confirm(`Bạn chắc chắn muốn xóa kì thi "${session.name}" (${session.id})? Khi xóa, tất cả các hồ sơ đăng ký dự thi đi kèm cũng bị xóa bỏ hoàn toàn.`)) {
      this.deleteSessionId.emit(session.id);
      this.notify.emit(`Đã xóa kì thi: ${session.name}`);
    }
  }

  toggleStatus(session: ExamSession) {
    const updated: ExamSession = {
      ...session,
      status: session.status === 'OPEN' ? 'CLOSED' : 'OPEN'
    };
    this.updateSession.emit(updated);
    this.notify.emit(`Đã chuyển trạng thái kì thi ${session.id} thành ${updated.status === 'OPEN' ? 'MỞ (OPEN)' : 'ĐÓNG (CLOSED)'}`);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    if (dateStr.includes('T')) {
      dateStr = dateStr.split('T')[0];
    }
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }
}
