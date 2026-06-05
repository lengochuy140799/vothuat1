import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AppState } from './app.reducer';

export const selectAppState = createFeatureSelector<AppState>('app');

export const selectStudents = createSelector(
  selectAppState,
  (state) => state.students
);

export const selectSessions = createSelector(
  selectAppState,
  (state) => state.sessions
);

export const selectRegistrations = createSelector(
  selectAppState,
  (state) => state.registrations
);

export const selectActiveSessionId = createSelector(
  selectAppState,
  (state) => state.activeSessionId
);

export const selectActiveSession = createSelector(
  selectSessions,
  selectActiveSessionId,
  (sessions, activeId) => sessions.find(s => s.id === activeId) || sessions[0]
);

export const selectActiveRegistrationList = createSelector(
  selectRegistrations,
  selectActiveSessionId,
  (registrations, activeId) => registrations.filter(r => r.examSessionId === activeId)
);

export const selectCurrentOpenSession = createSelector(
  selectSessions,
  (sessions) => sessions.find(s => s.status === 'OPEN')
);

export const selectNotification = createSelector(
  selectAppState,
  (state) => state.notification
);
