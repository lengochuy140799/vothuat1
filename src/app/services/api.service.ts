import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Student, ExamSession, Registration } from '../../types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // --- Students APIs ---
  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/students`);
  }

  addStudent(student: Student, month?: string): Observable<Student> {
    const url = month ? `${this.baseUrl}/students?month=${encodeURIComponent(month)}` : `${this.baseUrl}/students`;
    return this.http.post<Student>(url, student).pipe(
      catchError((err) => {
        console.warn('Backend API offline. Graced addStudent locally.', err);
        return of(student);
      })
    );
  }

  updateStudent(student: Student): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/students/${student.id}`, student).pipe(
      catchError((err) => {
        console.warn('Backend API offline. Graced updateStudent locally.', err);
        return of(student);
      })
    );
  }

  deleteStudent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/students/${id}`).pipe(
      catchError((err) => {
        console.warn('Backend API offline. Graced deleteStudent locally.', err);
        return of(undefined);
      })
    );
  }

  bulkImportStudents(students: Student[], month?: string): Observable<Student[]> {
    const url = month ? `${this.baseUrl}/students/import?month=${encodeURIComponent(month)}` : `${this.baseUrl}/students/import`;
    return this.http.post<Student[]>(url, students).pipe(
      catchError((err) => {
        console.warn('Backend API offline. Graced bulkImportStudents locally.', err);
        return of(students);
      })
    );
  }

  // --- Exam Sessions APIs ---
  getSessions(): Observable<ExamSession[]> {
    return this.http.get<ExamSession[]>(`${this.baseUrl}/sessions`);
  }

  addSession(session: ExamSession): Observable<ExamSession> {
    return this.http.post<ExamSession>(`${this.baseUrl}/sessions`, session).pipe(
      catchError((err) => {
        console.warn('Backend API offline. Graced addSession locally.', err);
        return of(session);
      })
    );
  }

  updateSession(session: ExamSession): Observable<ExamSession> {
    return this.http.put<ExamSession>(`${this.baseUrl}/sessions/${session.id}`, session).pipe(
      catchError((err) => {
        console.warn('Backend API offline. Graced updateSession locally.', err);
        return of(session);
      })
    );
  }

  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions/${id}`).pipe(
      catchError((err) => {
        console.warn('Backend API offline. Graced deleteSession locally.', err);
        return of(undefined);
      })
    );
  }

  // --- Registrations APIs ---
  getRegistrations(): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.baseUrl}/registrations`);
  }

  addRegistration(registration: Registration): Observable<Registration> {
    return this.http.post<Registration>(`${this.baseUrl}/registrations`, registration).pipe(
      catchError((err) => {
        console.warn('Backend API offline. Graced addRegistration locally.', err);
        return of(registration);
      })
    );
  }

  deleteRegistration(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/registrations/${id}`).pipe(
      catchError((err) => {
        console.warn('Backend API offline. Graced deleteRegistration locally.', err);
        return of(undefined);
      })
    );
  }

  togglePayment(registrationId: string): Observable<Registration> {
    return this.http.patch<Registration>(`${this.baseUrl}/registrations/${registrationId}/toggle-payment`, {}).pipe(
      catchError((err) => {
        console.warn('Backend API offline. Graced togglePayment locally.', err);
        return of({ id: registrationId } as any);
      })
    );
  }

  updateRegistrationNotes(id: string, notes: string): Observable<Registration> {
    return this.http.patch<Registration>(`${this.baseUrl}/registrations/${id}/notes`, { notes }).pipe(
      catchError((err) => {
        console.warn('Backend API offline. Graced updateRegistrationNotes locally.', err);
        return of({ id, notes } as any);
      })
    );
  }

  // --- Tuitions APIs ---
  getTuitionMonths(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tuition-months`).pipe(
      catchError((err) => {
        console.warn('Backend API is offline. Loading tuition months from localStorage.', err);
        const stored = localStorage.getItem('mabu_tuition_months');
        const months = stored ? JSON.parse(stored) : [{ month: '06/2026' }, { month: '07/2026' }];
        if (!stored) {
          localStorage.setItem('mabu_tuition_months', JSON.stringify(months));
        }
        return of(months);
      })
    );
  }

  addTuitionMonth(monthObj: { month: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tuition-months`, monthObj).pipe(
      catchError((err) => {
        console.warn('Backend API is offline. Adding tuition month to localStorage.', err);
        const stored = localStorage.getItem('mabu_tuition_months');
        const months = stored ? JSON.parse(stored) : [{ month: '06/2026' }, { month: '07/2026' }];
        if (!months.some((m: any) => m.month === monthObj.month)) {
          months.push(monthObj);
          localStorage.setItem('mabu_tuition_months', JSON.stringify(months));
        }
        return of(monthObj);
      })
    );
  }

  deleteTuitionMonth(month: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tuition-months/${month}`).pipe(
      catchError((err) => {
        console.warn('Backend API is offline. Deleting tuition month from localStorage.', err);
        const storedMonths = localStorage.getItem('mabu_tuition_months');
        if (storedMonths) {
          const months = JSON.parse(storedMonths).filter((m: any) => m.month !== month);
          localStorage.setItem('mabu_tuition_months', JSON.stringify(months));
        }
        const storedTuitions = localStorage.getItem('mabu_tuitions');
        if (storedTuitions) {
          const tuitions = JSON.parse(storedTuitions).filter((t: any) => t.month !== month);
          localStorage.setItem('mabu_tuitions', JSON.stringify(tuitions));
        }
        return of(undefined);
      })
    );
  }

  getTuitions(month?: string): Observable<any[]> {
    const url = month ? `${this.baseUrl}/tuitions?month=${encodeURIComponent(month)}` : `${this.baseUrl}/tuitions`;
    return this.http.get<any[]>(url).pipe(
      catchError((err) => {
        console.warn('Backend API is offline. Loading tuitions from localStorage.', err);
        const stored = localStorage.getItem('mabu_tuitions');
        let tuitions = stored ? JSON.parse(stored) : [];
        if (month) {
          tuitions = tuitions.filter((t: any) => t.month === month);
        }
        return of(tuitions);
      })
    );
  }

  addTuition(tuition: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tuitions`, tuition).pipe(
      catchError((err) => {
        console.warn('Backend API is offline. Adding tuition to localStorage.', err);
        const stored = localStorage.getItem('mabu_tuitions');
        const tuitions = stored ? JSON.parse(stored) : [];
        const newTuition = {
          ...tuition,
          id: tuition.id || 'TUI-' + Date.now() + '-' + Math.floor(Math.random() * 1000)
        };
        tuitions.push(newTuition);
        localStorage.setItem('mabu_tuitions', JSON.stringify(tuitions));
        return of(newTuition);
      })
    );
  }

  updateTuition(id: string, tuition: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/tuitions/${id}`, tuition).pipe(
      catchError((err) => {
        console.warn('Backend API is offline. Updating tuition in localStorage.', err);
        const stored = localStorage.getItem('mabu_tuitions');
        let tuitions = stored ? JSON.parse(stored) : [];
        let updatedItem: any = null;
        tuitions = tuitions.map((t: any) => {
          if (t.id === id || (t.studentId === tuition.studentId && t.month === tuition.month)) {
            updatedItem = { ...t, ...tuition };
            return updatedItem;
          }
          return t;
        });
        if (!updatedItem) {
          updatedItem = { ...tuition, id: id };
          tuitions.push(updatedItem);
        }
        localStorage.setItem('mabu_tuitions', JSON.stringify(tuitions));
        return of(updatedItem);
      })
    );
  }

  deleteTuition(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tuitions/${id}`).pipe(
      catchError((err) => {
        console.warn('Backend API is offline. Deleting tuition from localStorage.', err);
        const stored = localStorage.getItem('mabu_tuitions');
        if (stored) {
          const tuitions = JSON.parse(stored).filter((t: any) => t.id !== id);
          localStorage.setItem('mabu_tuitions', JSON.stringify(tuitions));
        }
        return of(undefined);
      })
    );
  }

  cloneTuitionMonth(currentMonth: string, prevMonth: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/tuitions/clone?currentMonth=${encodeURIComponent(currentMonth)}&prevMonth=${encodeURIComponent(prevMonth)}`, {}).pipe(
      catchError((err) => {
        console.warn('Backend API is offline. Cloning tuition month in localStorage.', err);
        const storedMonths = localStorage.getItem('mabu_tuition_months');
        const months = storedMonths ? JSON.parse(storedMonths) : [{ month: '06/2026' }, { month: '07/2026' }];
        if (!months.some((m: any) => m.month === currentMonth)) {
          months.push({ month: currentMonth });
          localStorage.setItem('mabu_tuition_months', JSON.stringify(months));
        }

        const storedTuitions = localStorage.getItem('mabu_tuitions');
        const tuitions = storedTuitions ? JSON.parse(storedTuitions) : [];
        const prevTuitions = tuitions.filter((t: any) => t.month === prevMonth);
        const cloned: any[] = [];

        prevTuitions.forEach((t: any) => {
          const clonedT = {
            ...t,
            id: 'TUI-' + Date.now() + '-' + Math.floor(Math.random() * 100000),
            month: currentMonth
          };
          cloned.push(clonedT);
          tuitions.push(clonedT);
        });

        localStorage.setItem('mabu_tuitions', JSON.stringify(tuitions));
        return of(cloned);
      })
    );
  }
}

