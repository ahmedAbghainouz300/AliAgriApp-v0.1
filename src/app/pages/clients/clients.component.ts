import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseService } from '../../database.service';
import { MatDividerModule } from '@angular/material/divider';
interface Client {
  id: string;
  nom: string;
  telephone: string;
  onediting: boolean;
}

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDividerModule,
    MatButtonModule,
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
})
export class ClientsComponent implements OnInit {
  ngOnInit(): void {
    this.loadClients();
  }

  searchTerm: string = '';
  clients: Client[] = [];
  filteredClients: Client[] = [...this.clients];
  onAdding: boolean = false;
  newClient: Client = {
    id: '',
    nom: '',
    telephone: '',
    onediting: false,
  };

  constructor(
    public databaseservise: DatabaseService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}

  async loadClients() {
    try {
      const clients = await this.databaseservise.queryDatabase(
        'SELECT * FROM CLIENTS'
      );

      if (Array.isArray(clients)) {
        this.clients = clients;
        console.log(this.clients);
        this.cdr.detectChanges();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('Clients could not be loaded');
      console.error('Error loading clients:', err);
    }
  }

  async addClient() {
    this.onAdding = true;
    try {
      await this.databaseservise.queryDatabase(
        'INSERT INTO CLIENTS (id ,nom, telephone) VALUES (?, ? , ?)',
        [this.newClient.id, this.newClient.nom, this.newClient.telephone]
      );
      this.showSuccessAlert();
      this.loadClients();
    } catch (err) {
      alert('Failed to add client');
      console.error('Error inserting client:', err);
    }
    this.newClient = { id: '', nom: '', telephone: '', onediting: false };
    this.onAdding = false;
  }

  filterClients() {
    this.filteredClients = this.clients.filter((client) =>
      client.nom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  editClient(client: Client) {
    try {
      this.databaseservise.queryDatabase(
        `
        UPDATE clients
        SET id = ?,nom = ?, telephone = ?
        WHERE id = ?;
      `,
        [
          this.newClient.id,
          this.newClient.nom,
          this.newClient.telephone,
          client.id,
        ]
      );
    } catch (err) {
      alert("client n'a pas pu etre modifie");
      console.log('erreur modifying client', err);
    }
    client.onediting = false;
    this.newClient = { id: '', nom: '', telephone: '', onediting: false };
    this.showSuccessAlert();
    this.loadClients();
  }

  deleteClient(client: Client) {
    Swal.fire({
      title: 'delete user : ' + client.nom,
      text: 'vous ne pouvez pas annuler cette action plus tard !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'supprimer',
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          this.databaseservise.queryDatabase(
            `DELETE FROM clients
WHERE id = ?`,
            [client.id]
          );
        } catch (err) {
          alert('ne peut pas supprimer ce client');
          console.log('error deleting client', err);
        }
        this.showSuccessAlert();
        this.loadClients();
      }
    });
  }
  showSuccessAlert() {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Your action was successful!',
      confirmButtonText: 'OK',
    });
  }
}
