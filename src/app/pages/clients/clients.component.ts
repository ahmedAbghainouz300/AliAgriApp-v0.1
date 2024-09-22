import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { DatabaseService } from '../../database.service';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { RightCurrencyPipe } from '../../right-currency.pipe';
import path from 'path';
import { MatListModule } from '@angular/material/list';
import { MatButton, MatFabButton } from '@angular/material/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface Client {
  id: number;
  cin: string;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  dateAjout: string;
  limite: number;
  credit: number;
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
    RightCurrencyPipe,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatListModule,
    MatButton,
    MatFabButton,
  ],
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.css'],
})
export class ClientsComponent implements OnInit, AfterViewInit {
  imagePath = path.join(__dirname, 'public/assets/R.png');
  dataSource: any;
  ngOnInit(): void {
    this.loadClients();
  }

  searchTerm: string = '';
  clients: Client[] = [];
  onAdding: boolean = false;
  Editing: boolean = false;
  editedClient: Client = {
    id: 0,
    cin: '',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    dateAjout: '',
    limite: 0,
    credit: 0,
    onediting: false,
  };
  newClient: Client = {
    id: 0,
    cin: '',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    dateAjout: '',
    limite: 0,
    credit: 0,
    onediting: false,
  };
  constructor(
    public databaseservise: DatabaseService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _liveAnnouncer: LiveAnnouncer
  ) {}

  async loadClients() {
    try {
      const clients = await this.databaseservise.queryDatabase(
        'SELECT * FROM CLIENTS'
      );
      if (Array.isArray(clients)) {
        this.clients = clients;
        this.dataSource = new MatTableDataSource<Client>(this.clients);
        console.log('clients : ', this.clients);
        console.log('datasource : ', this.dataSource);
        this.cdr.detectChanges();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('Clients could not be loaded');
      console.error('Error loading clients:', err);
    }
    this.ngAfterViewInit();
  }

  async addClient() {
    this.onAdding = true;
    try {
      await this.databaseservise.queryDatabase(
        'INSERT INTO CLIENTS (cin ,nom, telephone, email, adresse) VALUES (?, ? , ?, ?, ?)',
        [
          this.newClient.cin,
          this.newClient.nom,
          this.newClient.telephone,
          this.newClient.email,
          this.newClient.adresse,
        ]
      );
      this.showSuccessAlert();
      this.loadClients();
    } catch (err) {
      alert('Failed to add client');
      console.error('Error inserting client:', err);
    }
    this.newClient = {
      id: 0,
      cin: '',
      nom: '',
      telephone: '',
      email: '',
      adresse: '',
      dateAjout: '',
      limite: 0,
      credit: 0,
      onediting: false,
    };
    this.onAdding = false;
  }

  onEditing(client: Client) {
    if (!client.onediting) {
      // Copy client data to newClient
      this.editedClient = { ...client };
      client.onediting = true;
      this.onAdding = false;
    } else {
      client.onediting = false;
    }
  }
  editClient(client: Client) {
    try {
      this.databaseservise.queryDatabase(
        `
        UPDATE clients
        SET cin = ?,nom = ?, telephone = ?,email = ?,adresse = ?,limite = ?
        WHERE id = ?;
      `,
        [
          this.editedClient.cin,
          this.editedClient.nom,
          this.editedClient.telephone,
          this.editedClient.email,
          this.editedClient.adresse,
          this.editedClient.limite,
          client.id,
        ]
      );
    } catch (err) {
      alert("client n'a pas pu etre modifie");
      console.log('erreur modifying client', err);
    }
    client.onediting = false;
    this.editedClient = {
      id: 0,
      cin: '',
      nom: '',
      telephone: '',
      email: '',
      adresse: '',
      dateAjout: '',
      limite: 0,
      credit: 0,
      onediting: false,
    };
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

  displayedColumns: string[] = [
    'cin',
    'nom',
    'telephone',
    'email',
    'adresse',
    'limite',
    'credit',
    'options',
  ];

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  filterchange() {
    this.dataSource.filter = this.searchTerm;
  }
  detailledClient: Client = {
    id: 0,
    cin: '',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    dateAjout: '',
    limite: 0,
    credit: 0,
    onediting: false,
  };
  showingdetails: boolean = false;
  showDetails(client: Client) {
    this.showingdetails = true;
    this.detailledClient = client;
  }

  //print
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  downloadPDF() {
    this.databaseservise.downloadPDF('client', this.pdfContent);
  }
}
