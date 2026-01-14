import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = '/auth';

    constructor(
        private http: HttpClient,
        @Inject(PLATFORM_ID) private platformId: Object
    ) { }

    login(credentials: { email: string, password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
            tap((response: any) => this.setSession(response))
        );
    }

    register(userData: { name: string, email: string, password: string }): Observable<any> {
        return this.http.post(`${this.apiUrl}/register`, userData).pipe(
            tap((response: any) => this.setSession(response))
        );
    }

    logout() {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    private setSession(authResult: any) {
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('token', authResult.token);
            localStorage.setItem('user', JSON.stringify(authResult.user));
        }
    }

    getToken(): string | null {
        if (isPlatformBrowser(this.platformId)) {
            return localStorage.getItem('token');
        }
        return null;
    }

    createReservation(data: any): Observable<any> {
        return this.http.post('/api/reservations', data);
    }

    getAdminReservations(): Observable<any[]> {
        return this.http.get<any[]>('/api/admin/reservations');
    }
}
