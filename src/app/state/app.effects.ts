import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, forkJoin } from 'rxjs';
import { map, mergeMap, tap, delay, catchError, withLatestFrom } from 'rxjs/operators';
import * as AppActions from './app.actions';
import { AppState } from './app.reducer';
import { selectAppState } from './app.selectors';
import { ApiService } from '../services/api.service';
import { INITIAL_STUDENTS, INITIAL_EXAMS, INITIAL_REGISTRATIONS } from '../../mockData';

@Injectable({
  providedIn: 'root'
})
export class AppEffects {
  constructor(
    private actions$: Actions,
    private store: Store<any>,
    private apiService: ApiService
  ) {}

  loadInitialState$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.loadInitialState),
      mergeMap(() => {
        // Attempt to load from the real Spring Boot REST API
        return forkJoin({
          students: this.apiService.getStudents().pipe(catchError(() => of(null))),
          sessions: this.apiService.getSessions().pipe(catchError(() => of(null))),
          registrations: this.apiService.getRegistrations().pipe(catchError(() => of(null)))
        }).pipe(
          map(({ students, sessions, registrations }) => {
            const storedActiveId = localStorage.getItem('mabu_active_session_id') || 'EX-2026-Q2';

            if (students && sessions && registrations) {
              console.log('Successfully loaded initial state from Spring Boot API!');
              return AppActions.loadInitialStateSuccess({
                students,
                sessions,
                registrations,
                activeSessionId: storedActiveId
              });
            } else {
              console.warn('Backend API is offline or unconfigured. Falling back to local/localStorage mode.');
              const storedStudents = localStorage.getItem('mabu_students');
              const storedSessions = localStorage.getItem('mabu_exams');
              const storedRegs = localStorage.getItem('mabu_registrations');

              const localStudents = storedStudents ? JSON.parse(storedStudents) : INITIAL_STUDENTS;
              const localSessions = storedSessions ? JSON.parse(storedSessions) : INITIAL_EXAMS;
              const localRegs = storedRegs ? JSON.parse(storedRegs) : INITIAL_REGISTRATIONS;

              return AppActions.loadInitialStateSuccess({
                students: localStudents,
                sessions: localSessions,
                registrations: localRegs,
                activeSessionId: storedActiveId
              });
            }
          })
        );
      })
    )
  );

  // Sync state mutations to Spring Boot API
  apiSync$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        AppActions.addStudent,
        AppActions.updateStudent,
        AppActions.deleteStudent,
        AppActions.bulkImportStudents,
        AppActions.addSession,
        AppActions.updateSession,
        AppActions.deleteSession,
        AppActions.addRegistration,
        AppActions.deleteRegistration,
        AppActions.togglePayment,
        AppActions.updateRegistrationNotes
      ),
      tap((action) => {
        console.log('Syncing action to backend:', action.type);
        try {
          switch (action.type) {
            case AppActions.addStudent.type:
              this.apiService.addStudent((action as any).student, (action as any).month).subscribe({
                next: () => console.log('Successfully saved student to database'),
                error: (err) => console.error('Failed to sync student:', err)
              });
              break;
            case AppActions.updateStudent.type:
              this.apiService.updateStudent((action as any).student).subscribe({
                next: () => console.log('Successfully updated student in database'),
                error: (err) => console.error('Failed to sync student update:', err)
              });
              break;
            case AppActions.deleteStudent.type:
              this.apiService.deleteStudent((action as any).id).subscribe({
                next: () => console.log('Successfully deleted student from database'),
                error: (err) => console.error('Failed to sync student deletion:', err)
              });
              break;
            case AppActions.bulkImportStudents.type:
              this.apiService.bulkImportStudents((action as any).students, (action as any).month).subscribe({
                next: () => console.log('Successfully bulk-imported students to database'),
                error: (err) => console.error('Failed to sync bulk import:', err)
              });
              break;
            case AppActions.addSession.type:
              this.apiService.addSession((action as any).session).subscribe({
                next: () => console.log('Successfully saved session to database'),
                error: (err) => console.error('Failed to sync session:', err)
              });
              break;
            case AppActions.updateSession.type:
              this.apiService.updateSession((action as any).session).subscribe({
                next: () => console.log('Successfully updated session in database'),
                error: (err) => console.error('Failed to sync session update:', err)
              });
              break;
            case AppActions.deleteSession.type:
              this.apiService.deleteSession((action as any).id).subscribe({
                next: () => console.log('Successfully deleted session from database'),
                error: (err) => console.error('Failed to sync session deletion:', err)
              });
              break;
            case AppActions.addRegistration.type:
              this.apiService.addRegistration((action as any).registration).subscribe({
                next: () => console.log('Successfully saved registration to database'),
                error: (err) => console.error('Failed to sync registration:', err)
              });
              break;
            case AppActions.deleteRegistration.type:
              this.apiService.deleteRegistration((action as any).id).subscribe({
                next: () => console.log('Successfully deleted registration from database'),
                error: (err) => console.error('Failed to sync registration deletion:', err)
              });
              break;
            case AppActions.togglePayment.type:
              this.apiService.togglePayment((action as any).registrationId).subscribe({
                next: () => console.log('Successfully toggled payment in database'),
                error: (err) => console.error('Failed to sync payment status:', err)
              });
              break;
            case AppActions.updateRegistrationNotes.type:
              const payload = action as any;
              this.apiService.updateRegistrationNotes(payload.id, payload.notes).subscribe({
                next: () => console.log('Successfully updated registration notes in database'),
                error: (err) => console.error('Failed to sync notes update:', err)
              });
              break;
          }
        } catch (e) {
          console.error('Error in apiSync$:', e);
        }
      })
    ),
    { dispatch: false }
  );

  syncToLocalStorage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        AppActions.addStudent,
        AppActions.updateStudent,
        AppActions.deleteStudent,
        AppActions.bulkImportStudents,
        AppActions.addSession,
        AppActions.updateSession,
        AppActions.deleteSession,
        AppActions.setActiveSession,
        AppActions.addRegistration,
        AppActions.deleteRegistration,
        AppActions.togglePayment,
        AppActions.updateRegistrationNotes,
        AppActions.resetToMockData
      ),
      withLatestFrom(this.store.select(selectAppState)),
      tap(([action, state]) => {
        try {
          localStorage.setItem('mabu_students', JSON.stringify(state.students));
          localStorage.setItem('mabu_exams', JSON.stringify(state.sessions));
          localStorage.setItem('mabu_registrations', JSON.stringify(state.registrations));
          localStorage.setItem('mabu_active_session_id', state.activeSessionId);
        } catch (e) {
          console.error('Error saving state to localStorage:', e);
        }
      })
    ),
    { dispatch: false }
  );

  triggerNotification$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AppActions.showSuccessNotification),
      delay(3000),
      map(() => AppActions.clearNotification())
    )
  );

  reloadAfterMutation$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        AppActions.addStudent,
        AppActions.updateStudent,
        AppActions.deleteStudent,
        AppActions.bulkImportStudents,
        AppActions.addRegistration,
        AppActions.deleteRegistration,
        AppActions.togglePayment
      ),
      delay(300),
      map(() => AppActions.loadInitialState())
    )
  );
}
