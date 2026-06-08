import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Student, ExamSession, Registration } from '../../types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // --- Students APIs ---
  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/students`);
  }

  addStudent(student: Student, month?: string): Observable<Student> {
    const url = month ? `${this.baseUrl}/students?month=${encodeURIComponent(month)}` : `${this.baseUrl}/students`;
    return this.http.post<Student>(url, student);
  }

  updateStudent(student: Student): Observable<Student> {
    return this.http.put<Student>(`${this.baseUrl}/students/${student.id}`, student);
  }

  deleteStudent(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/students/${id}`);
  }

  bulkImportStudents(students: Student[]): Observable<Student[]> {
    return this.http.post<Student[]>(`${this.baseUrl}/students/import`, students);
  }

  // --- Exam Sessions APIs ---
  getSessions(): Observable<ExamSession[]> {
    return this.http.get<ExamSession[]>(`${this.baseUrl}/sessions`);
  }

  addSession(session: ExamSession): Observable<ExamSession> {
    return this.http.post<ExamSession>(`${this.baseUrl}/sessions`, session);
  }

  updateSession(session: ExamSession): Observable<ExamSession> {
    return this.http.put<ExamSession>(`${this.baseUrl}/sessions/${session.id}`, session);
  }

  deleteSession(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/sessions/${id}`);
  }

  // --- Registrations APIs ---
  getRegistrations(): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.baseUrl}/registrations`);
  }

  addRegistration(registration: Registration): Observable<Registration> {
    return this.http.post<Registration>(`${this.baseUrl}/registrations`, registration);
  }

  deleteRegistration(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/registrations/${id}`);
  }

  togglePayment(registrationId: string): Observable<Registration> {
    return this.http.patch<Registration>(`${this.baseUrl}/registrations/${registrationId}/toggle-payment`, {});
  }

  updateRegistrationNotes(id: string, notes: string): Observable<Registration> {
    return this.http.patch<Registration>(`${this.baseUrl}/registrations/${id}/notes`, { notes });
  }

  // --- Tuitions APIs ---
  getTuitionMonths(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/tuition-months`);
  }

  addTuitionMonth(monthObj: { month: string }): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tuition-months`, monthObj);
  }

  deleteTuitionMonth(month: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tuition-months/${month}`);
  }

  getTuitions(month?: string): Observable<any[]> {
    const url = month ? `${this.baseUrl}/tuitions?month=${encodeURIComponent(month)}` : `${this.baseUrl}/tuitions`;
    return this.http.get<any[]>(url);
  }

  addTuition(tuition: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/tuitions`, tuition);
  }

  updateTuition(id: string, tuition: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/tuitions/${id}`, tuition);
  }

  deleteTuition(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/tuitions/${id}`);
  }

  cloneTuitionMonth(currentMonth: string, prevMonth: string): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/tuitions/clone?currentMonth=${encodeURIComponent(currentMonth)}&prevMonth=${encodeURIComponent(prevMonth)}`, {});
  }
}
