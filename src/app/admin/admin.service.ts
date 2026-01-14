import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) { }

  me() {
    return this.http
      .get('/api/admin/me', { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .toPromise();
  }

  getMessages() {
    return this.http
      .get<any[]>('/api/admin/messages', { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .toPromise()
      .then((r) => r || []);
  }

  getReceipts() {
    return this.http
      .get<any[]>('/api/admin/receipts', { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .toPromise()
      .then((r) => r || []);
  }

  getReservations() {
    return this.http
      .get<any[]>('/api/admin/reservations', { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .toPromise()
      .then((r) => r || []);
  }

  createReceipt(data: any) {
    return this.http
      .post<any>('/api/admin/receipts', data, { headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` } })
      .toPromise();
  }

  downloadPdf(id: string) {
    const token = localStorage.getItem('token') || '';
    window.open(`/api/admin/receipts/${id}/pdf?token=${token}`, '_blank');
  }

  logout() {
    localStorage.removeItem('token');
    window.location.href = '/';
  }
}
