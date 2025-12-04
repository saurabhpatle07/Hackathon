import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaintenanceInputComponent } from '../maintenance-input/maintenance-input.component';
import { TemperatureGraphComponent } from '../temperature-graph/temperature-graph.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, MaintenanceInputComponent, TemperatureGraphComponent, CalendarComponent],
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
    constructor(public authService: AuthService) { }

    logout() {
        this.authService.logout();
    }
}
