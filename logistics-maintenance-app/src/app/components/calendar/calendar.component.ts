import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ApiService } from '../../services/api.service';

@Component({
    selector: 'app-calendar',
    standalone: true,
    imports: [CommonModule, FullCalendarModule],
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.css']
})
export class CalendarComponent implements OnInit {
    calendarOptions: CalendarOptions = {
        initialView: 'dayGridMonth',
        plugins: [dayGridPlugin, interactionPlugin],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek'
        },
        events: []
    };

    constructor(private apiService: ApiService) { }

    ngOnInit() {
        this.loadEvents();
    }

    loadEvents() {
        this.apiService.getMaintenanceEvents().subscribe({
            next: (events) => {
                this.calendarOptions = {
                    ...this.calendarOptions,
                    events: events
                };
            },
            error: (error) => {
                console.error('Error loading calendar events:', error);
            }
        });
    }
}
