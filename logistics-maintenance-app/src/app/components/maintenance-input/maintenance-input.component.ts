import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, MaintenanceResponse } from '../../services/api.service';

@Component({
    selector: 'app-maintenance-input',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './maintenance-input.component.html',
    styleUrls: ['./maintenance-input.component.css']
})
export class MaintenanceInputComponent {
    inputText: string = '';
    isLoading: boolean = false;
    response: MaintenanceResponse | null = null;
    error: string | null = null;

    constructor(private apiService: ApiService) { }

    /**
     * Handle form submission
     */
    onSubmit(): void {
        // Validate input
        if (!this.inputText.trim()) {
            this.error = 'Please enter some text';
            return;
        }

        // Reset states
        this.error = null;
        this.response = null;
        this.isLoading = true;

        // Make API call
        this.apiService.submitMaintenanceQuery(this.inputText).subscribe({
            next: (response) => {
                this.isLoading = false;
                this.response = response;
                console.log('Response received:', response);
            },
            error: (error) => {
                this.isLoading = false;
                this.error = error.error?.message || 'Failed to connect to backend. Please ensure the backend server is running.';
                console.error('Error:', error);
            }
        });
    }

    /**
     * Clear the form and reset states
     */
    clearForm(): void {
        this.inputText = '';
        this.response = null;
        this.error = null;
    }
}
