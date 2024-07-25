import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { DatabaseService } from './database.service';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { ElectronService } from 'ngx-electron';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    LoginComponent,
    LoginComponent,
    AdminLayoutComponent,
    FormsModule,
  ],
  providers: [DatabaseService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title(title: any) {
    throw new Error('Method not implemented.');
  }
  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private databaseservice: DatabaseService,
    private electronservice: ElectronService
  ) {}
  ngOnInit(): void {}
}
