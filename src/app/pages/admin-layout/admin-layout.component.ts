import { Component } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { DatabaseService } from '../../database.service';
import { ClientsComponent } from '../clients/clients.component';
import Common from 'electron/common';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    MatDividerModule,
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent {
  isMenuOpen: boolean = false;
  menus: any[] = [];
  role: string = '';
  users: any[] = [];
  constructor(
    private router: Router,
    private databaseService: DatabaseService
  ) {}

  async findUser() {
    try {
      this.users = await this.databaseService.queryDatabase(
        `SELECT * FROM USERS WHERE id = 1`
      );
      console.log('finded succesfully ', this.users);
    } catch (err) {
      console.log('error finding data', err);
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout() {
    this.router.navigate(['/login']);
  }
}
