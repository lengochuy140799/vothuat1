import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Student, ExamSession, Registration } from '../types';
import * as AppActions from './state/app.actions';
import { 
  selectStudents, 
  selectSessions, 
  selectRegistrations, 
  selectActiveSessionId, 
  selectNotification,
  selectCurrentOpenSession
} from './state/app.selectors';

// Standalone children imports
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StudentsComponent } from './components/students/students.component';
import { ExamsComponent } from './components/exams/exams.component';
import { RegistrationsComponent } from './components/registrations/registrations.component';
import { FeesComponent } from './components/fees/fees.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SidebarComponent,
    HeaderComponent,
    DashboardComponent,
    StudentsComponent,
    ExamsComponent,
    RegistrationsComponent,
    FeesComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  activeTab: string = 'dashboard';

  students$: Observable<Student[]>;
  sessions$: Observable<ExamSession[]>;
  registrations$: Observable<Registration[]>;
  activeSessionId$: Observable<string>;
  notification$: Observable<{ message: string; show: boolean }>;
  openSessionName$: Observable<string>;

  constructor(private store: Store) {
    this.students$ = this.store.select(selectStudents);
    this.sessions$ = this.store.select(selectSessions);
    this.registrations$ = this.store.select(selectRegistrations);
    this.activeSessionId$ = this.store.select(selectActiveSessionId);
    this.notification$ = this.store.select(selectNotification);
    
    this.openSessionName$ = this.store.select(selectCurrentOpenSession).pipe(
      map(session => session ? session.name : '')
    );
  }

  ngOnInit() {
    // Command initial load from API or localStorage
    this.store.dispatch(AppActions.loadInitialState());
  }

  onTabChange(tab: string) {
    this.activeTab = tab;
  }

  onNotificationTrigger(event: any) {
    if (typeof event === 'string') {
      this.store.dispatch(AppActions.showSuccessNotification({ message: event, isError: false }));
    } else if (event && typeof event === 'object' && event.message) {
      this.store.dispatch(AppActions.showSuccessNotification({ message: event.message, isError: !!event.isError }));
    }
  }

  // Active Session Filter handler
  onActiveSessionIdChange(id: string) {
    this.store.dispatch(AppActions.setActiveSession({ id }));
  }

  onReloadState() {
    this.store.dispatch(AppActions.loadInitialState());
  }

  // Students actions mappings
  onAddStudent(event: any) {
    if (event && event.student) {
      this.store.dispatch(AppActions.addStudent({ student: event.student, month: event.month }));
    } else if (event) {
      this.store.dispatch(AppActions.addStudent({ student: event, month: undefined }));
    }
  }

  onUpdateStudent(student: Student) {
    this.store.dispatch(AppActions.updateStudent({ student }));
  }

  onDeleteStudentId(id: string) {
    this.store.dispatch(AppActions.deleteStudent({ id }));
  }

  onBulkImportStudents(students: Student[]) {
    this.store.dispatch(AppActions.bulkImportStudents({ students }));
  }

  // Exam session actions mapping
  onAddSession(session: ExamSession) {
    this.store.dispatch(AppActions.addSession({ session }));
  }

  onUpdateSession(session: ExamSession) {
    this.store.dispatch(AppActions.updateSession({ session }));
  }

  onDeleteSessionId(id: string) {
    this.store.dispatch(AppActions.deleteSession({ id }));
  }

  // Registrations actions mappings
  onAddRegistration(registration: Registration) {
    this.store.dispatch(AppActions.addRegistration({ registration }));
  }

  onDeleteRegistrationId(id: string) {
    this.store.dispatch(AppActions.deleteRegistration({ id }));
  }

  onTogglePayment(registrationId: string) {
    this.store.dispatch(AppActions.togglePayment({ registrationId }));
  }

  // Fees actions mapping
  onUpdateRegistrationNotes(event: { id: string; notes: string }) {
    this.store.dispatch(AppActions.updateRegistrationNotes({ id: event.id, notes: event.notes }));
  }

  // Quick reset to mock data
  resetDatabase() {
    if (confirm('Bạn chắc chắn muốn khôi phục lại dữ liệu mẫu gốc? Mọi bổ sung của bạn sẽ bị xóa.')) {
      this.store.dispatch(AppActions.resetToMockData());
    }
  }
}
