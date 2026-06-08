import { createReducer, on } from '@ngrx/store';
import { Student, ExamSession, Registration } from '../../types';
import * as AppActions from './app.actions';
import { INITIAL_STUDENTS, INITIAL_EXAMS, INITIAL_REGISTRATIONS } from '../../mockData';

export interface AppState {
  students: Student[];
  sessions: ExamSession[];
  registrations: Registration[];
  activeSessionId: string;
  notification: {
    message: string;
    show: boolean;
    isError?: boolean;
  };
}

export const initialAppState: AppState = {
  students: [],
  sessions: [],
  registrations: [],
  activeSessionId: 'EX-2026-Q2',
  notification: {
    message: '',
    show: false,
    isError: false
  }
};

export const appReducer = createReducer(
  initialAppState,

  // Load state successfully
  on(AppActions.loadInitialStateSuccess, (state, { students, sessions, registrations, activeSessionId }) => {
    const studentMap = new Map<string, Student>();
    students.forEach(s => {
      if (s && s.id) {
        studentMap.set(s.id, s);
      }
    });
    const uniqueStudents = Array.from(studentMap.values());
    return {
      ...state,
      students: uniqueStudents,
      sessions,
      registrations,
      activeSessionId
    };
  }),

  // Student Actions
  on(AppActions.addStudent, (state, { student }) => {
    const filtered = state.students.filter(s => s.id !== student.id);
    return {
      ...state,
      students: [student, ...filtered]
    };
  }),

  on(AppActions.updateStudent, (state, { student }) => {
    // Sync currentBelt checks inside active open session registrations
    const updatedRegistrations = state.registrations.map(reg => {
      const session = state.sessions.find(s => s.id === reg.examSessionId);
      if (reg.studentId === student.id && session?.status === 'OPEN') {
        return {
          ...reg,
          currentBelt: student.currentBelt
        };
      }
      return reg;
    });

    return {
      ...state,
      students: state.students.map(s => s.id === student.id ? student : s),
      registrations: updatedRegistrations
    };
  }),

  on(AppActions.deleteStudent, (state, { id }) => ({
    ...state,
    students: state.students.filter(s => s.id !== id),
    registrations: state.registrations.filter(r => r.studentId !== id)
  })),

  on(AppActions.bulkImportStudents, (state, { students }) => {
    const existingIds = new Set(state.students.map(s => s.id));
    const uniqueNew = students.filter(s => !existingIds.has(s.id));
    return {
      ...state,
      students: [...uniqueNew, ...state.students]
    };
  }),

  // Session Actions
  on(AppActions.addSession, (state, { session }) => ({
    ...state,
    sessions: [...state.sessions, session]
  })),

  on(AppActions.updateSession, (state, { session }) => ({
    ...state,
    sessions: state.sessions.map(s => s.id === session.id ? session : s)
  })),

  on(AppActions.deleteSession, (state, { id }) => {
    const updatedSessions = state.sessions.filter(s => s.id !== id);
    let nextActiveId = state.activeSessionId;
    if (state.activeSessionId === id && updatedSessions.length > 0) {
      nextActiveId = updatedSessions[0].id;
    }
    return {
      ...state,
      sessions: updatedSessions,
      registrations: state.registrations.filter(r => r.examSessionId !== id),
      activeSessionId: nextActiveId
    };
  }),

  on(AppActions.setActiveSession, (state, { id }) => ({
    ...state,
    activeSessionId: id
  })),

  // Registrations Actions
  on(AppActions.addRegistration, (state, { registration }) => ({
    ...state,
    registrations: [registration, ...state.registrations]
  })),

  on(AppActions.deleteRegistration, (state, { id }) => ({
    ...state,
    registrations: state.registrations.filter(r => r.id !== id)
  })),

  on(AppActions.togglePayment, (state, { registrationId }) => {
    const updatedRegs = state.registrations.map(reg => {
      if (reg.id === registrationId) {
        const isPaidNow = reg.paymentStatus === 'PAID';
        return {
          ...reg,
          paymentStatus: isPaidNow ? 'UNPAID' : ('PAID' as any),
          paymentDate: !isPaidNow ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return reg;
    });
    return {
      ...state,
      registrations: updatedRegs
    };
  }),

  on(AppActions.updateRegistrationNotes, (state, { id, notes }) => ({
    ...state,
    registrations: state.registrations.map(r => r.id === id ? { ...r, notes } : r)
  })),

  // Notifications
  on(AppActions.showSuccessNotification, (state, { message, isError }) => ({
    ...state,
    notification: { message, show: true, isError: !!isError }
  })),

  on(AppActions.clearNotification, (state) => ({
    ...state,
    notification: { ...state.notification, show: false }
  })),

  // Reset System
  on(AppActions.resetToMockData, (state) => ({
    ...state,
    students: INITIAL_STUDENTS,
    sessions: INITIAL_EXAMS,
    registrations: INITIAL_REGISTRATIONS,
    activeSessionId: 'EX-2026-Q2',
    notification: { message: 'Đã thiết lập lại dữ liệu mẫu thành công!', show: true }
  }))
);
