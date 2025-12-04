import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface MaintenanceRequest {
    text: string;
}

export interface MaintenanceResponse {
    message: string;
    data?: any;
    status: string;
}

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    /**
     * Submit maintenance query to backend
     * @param text User input text
     * @returns Observable of the API response
     */
    submitMaintenanceQuery(text: string): Observable<MaintenanceResponse> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        const body: MaintenanceRequest = { text };

        return this.http.post<MaintenanceResponse>(
            `${this.apiUrl}/api/maintenance/query`,
            body,
            { headers }
        );
    }

    getMaintenanceEvents(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/api/maintenance/events`);
    }
}
