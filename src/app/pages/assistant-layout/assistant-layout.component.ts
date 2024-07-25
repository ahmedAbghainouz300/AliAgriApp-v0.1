// assistant-layout.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DatabaseService } from '../../database.service';

@Component({
  selector: 'app-assistant-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './assistant-layout.component.html',
  styleUrls: ['./assistant-layout.component.css'],
})
export class AssistantLayoutComponent {
  isMenuOpen: boolean = false;
  users: any[] = [];

  constructor(
    private databaseService: DatabaseService,
    private router: Router
  ) {}

  async findUser() {
    try {
      this.users = await this.databaseService.queryDatabase(
        `SELECT * FROM USERS WHERE id = 1`
      );
      console.log('finded successfully ', this.users);
    } catch (err) {
      console.log('error finding data', err);
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    // Perform logout logic here if needed, such as clearing session data
    this.router.navigate(['/login']);
  }
}
