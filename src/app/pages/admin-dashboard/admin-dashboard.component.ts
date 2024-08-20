import { Component, OnInit } from '@angular/core';
import { DatabaseService } from '../../database.service';
import { Client } from '../clients/clients.component';
import { count } from 'rxjs';
import path from 'path';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  imagePath = path.join(__dirname, 'public/assets/R.png');
  ngOnInit(): void {
    this.loadClients();
    this.loadFournisseurs();
  }
  clients: Client[] = [];
  clients_count = 0;
  fournisseurs_count = 0;
  constructor(
    private databaseservice: DatabaseService,
    private router: Router
  ) {}
  async loadClients() {
    try {
      const clients = await this.databaseservice.queryDatabase(
        'SELECT COUNT(id) FROM clients;'
      );
      this.clients_count = clients[0]['COUNT(id)'];
    } catch (err) {
      alert('Clients could not be loaded');
      console.error('Error loading clients:', err);
    }
  }
  async loadFournisseurs() {
    try {
      const fournisseurs = await this.databaseservice.queryDatabase(
        'SELECT COUNT(id) FROM fournisseurs;'
      );
      this.fournisseurs_count = fournisseurs[0]['COUNT(id)'];
    } catch (err) {
      alert('Clients could not be loaded');
      console.error('Error loading clients:', err);
    }
  }

  gotoClients() {
    this.router.navigate(['/admin-layout/clients']);
    console.log('clicked');
  }
  gotoFournisseurs() {
    this.router.navigate(['/admin-layout/fournisseurs']);
  }
}
