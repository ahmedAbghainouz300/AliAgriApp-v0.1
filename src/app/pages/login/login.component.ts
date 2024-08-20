import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { DatabaseService } from '../../database.service';
import { NgStyle } from '@angular/common';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterOutlet, FormsModule, NgStyle],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private databaseservice: DatabaseService
  ) {}

  async login() {
    if (this.username && this.password) {
      try {
        const user = await this.databaseservice.queryDatabase(
          'SELECT ROLE FROM USERS WHERE USERNAME = ? AND PASSWORD = ?',
          [this.username, this.password]
        );
        console.log('user : ', user);
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
