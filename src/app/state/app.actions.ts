import { createAction, props } from '@ngrx/store';
import { Student, ExamSession, Registration } from '../../types';

// State Initialization
export const loadInitialState = createAction('[App] Load Initial State');
export const loadInitialStateSuccess = createAction(
  '[App] Load Initial State Success',
  props<{ students: Student[]; sessions: ExamSession[]; registrations: Registration[]; activeSessionId: string }>()
);

// Students Actions
export const addStudent = createAction('[Student] Add Student', props<{ student: Student; month?: string }>());
export const updateStudent = createAction('[Student] Update Student', props<{ student: Student }>());
export const deleteStudent = createAction('[Student] Delete Student', props<{ id: string }>());
export const bulkImportStudents = createAction('[Student] Bulk Import Students', props<{ students: Student[] }>());

// Exam Sessions Actions
export const addSession = createAction('[Session] Add Session', props<{ session: ExamSession }>());
export const updateSession = createAction('[Session] Update Session', props<{ session: ExamSession }>());
export const deleteSession = createAction('[Session] Delete Session', props<{ id: string }>());
export const setActiveSession = createAction('[Session] Set Active Session', props<{ id: string }>());

// Registrations Actions
export const addRegistration = createAction('[Registration] Add Registration', props<{ registration: Registration }>());
export const deleteRegistration = createAction('[Registration] Delete Registration', props<{ id: string }>());
export const togglePayment = createAction('[Registration] Toggle Payment', props<{ registrationId: string }>());
export const updateRegistrationNotes = createAction('[Registration] Update Registration Notes', props<{ id: string; notes: string }>());

// System Reset Actions
export const resetToMockData = createAction('[App] Reset To Mock Data');

// Notifications
export const showSuccessNotification = createAction('[Notification] Show Success', props<{ message: string }>());
export const clearNotification = createAction('[Notification] Clear');
