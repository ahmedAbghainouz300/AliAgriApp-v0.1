import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { DatabaseService } from '../../database.service';
import { NgClass, NgStyle } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    NgStyle,
    MatFormField,
    MatLabel,
    NgClass,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;

  constructor(
    private router: Router,
    private databaseservice: DatabaseService
  ) {}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (this.username && this.password) {
      try {
        const user = await this.databaseservice.queryDatabase(
          'SELECT ROLE FROM USERS WHERE USERNAME = ? AND PASSWORD = ?',
          [this.username, this.password]
        );
        if (user.length > 0) {
          const role = user[0].role;
          if (role === 'admin') {
            this.router.navigate(['/admin-layout']); // Navigate to admin layout
          } else if (role === 'assistant') {
            this.router.navigate(['/assistant-layout']); // Navigate to assistant layout
          } else {
            alert('Unknown role.');
          }
        } else {
          alert('Invalid username or password.');
        }
      } catch (error) {
        console.error('Error querying the database:', error);
        alert(
          'An error occurred while trying to log in. Please try again later.'
        );
      }
    } else {
      alert('Please enter both username and password.');
    }
  }
}
