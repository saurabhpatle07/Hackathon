import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent {
    username = '';
    password = '';
    isLoading = false;
    error = '';

    constructor(private authService: AuthService, private router: Router) {
        console.log('LoginComponent initialized');
    }

    onSubmit() {
        if (!this.username || !this.password) {
            this.error = 'Please enter username and password';
            return;
        }

        this.isLoading = true;
        this.error = '';

        this.authService.login(this.username, this.password).subscribe({
            next: () => {
                this.router.navigate(['/']);
            },
            error: (err) => {
                this.isLoading = false;
                this.error = 'Invalid username or password';
                console.error('Login error:', err);
            }
        });
    }
}
