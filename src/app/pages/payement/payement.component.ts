import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
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
import { Client } from '../clients/clients.component';
import { Produit } from '../produits/produits.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatButton, MatFabButton } from '@angular/material/button';
import { Fournisseur } from '../fournisseurs/fournisseurs.component';

export interface Payement {
  id: number;
  montant: number;
  clientId?: number;
  fournisseurId?: number;
  datePayement: string;
}

@Component({
  selector: 'app-payement',
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
    MatOption,
    MatSelect,
    MatButton,
    MatFabButton,
  ],
  templateUrl: './payement.component.html',
  styleUrls: ['../purshases/purshases.component.css'],
})
export class PayementComponent {
  imagePath = path.join(__dirname, 'public/assets/R.png');
  dataSource: MatTableDataSource<Payement>; // Explicitly set type for dataSource
  actionneur: string = 'client';
  actionneurs: string[] = ['client', 'fournisseur'];

  searchTerm: string = '';
  payements: Payement[] = [];
  onAdding: boolean = false;
  Editing: boolean = false;
  editedpayement: Payement = {
    id: 0,
    montant: 0,
    datePayement: '',
  };
  newpayement: Payement = {
    id: 0,
    montant: 0,
    datePayement: '',
  };
  constructor(
    public databaseservise: DatabaseService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _liveAnnouncer: LiveAnnouncer
  ) {
    this.dataSource = new MatTableDataSource<Payement>(this.payements);
    this.dataSource.filterPredicate = (data: Payement, filter: string) => {
      const filterValue = filter.trim().toLowerCase();
      const clientName = data.clientId ? this.getClientById(data) : '';
      return (
        data.montant.toString().includes(filterValue) ||
        data.datePayement.toLowerCase().includes(filterValue) ||
        clientName.toLowerCase().includes(filterValue)
      );
    };
  }

  ngOnInit(): void {
    this.loadpayements();
    this.loadActionneurs();
  }

  async loadpayements() {
    try {
      const query =
        this.actionneur === 'client'
          ? 'SELECT * FROM payementsclient'
          : 'SELECT * FROM payementsfournisseur';
      const payements = await this.databaseservise.queryDatabase(query);
      if (Array.isArray(payements)) {
        this.payements = payements;
        this.dataSource.data = this.payements;
        this.cdr.detectChanges();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('payements could not be loaded');
      console.error('Error loading payements :', err);
    }
    this.ngAfterViewInit();
  }

  clients: Client[] = [];
  fournisseurs: Fournisseur[] = [];

  async loadActionneurs() {
    try {
      const query =
        this.actionneur === 'fournisseur'
          ? 'SELECT * FROM fournisseurs'
          : 'SELECT * FROM clients';

      const result = await this.databaseservise.queryDatabase(query);

      if (this.actionneur === 'fournisseur') {
        this.fournisseurs = result;
        this.clients = [];
      } else {
        this.clients = result;
        this.fournisseurs = [];
      }

      console.log('Fournisseurs:', this.fournisseurs);
      console.log('Clients:', this.clients);
    } catch (error) {
      console.error('Error loading actionneurs:', error);
    }
  }
  getClientById(payment: Payement): string {
    console.log('payement' + payment);
    console.log('id pay ' + payment.clientId);
    console.log('action' + this.actionneur);

    if (this.actionneur === 'fournisseur') {
      const fournisseur = this.fournisseurs.find(
        (fournisseur) => fournisseur.id === payment.fournisseurId
      );
      return fournisseur ? fournisseur.nom : 'unknown';
    } else {
      const client = this.clients.find(
        (client) => client.id === payment.clientId
      );
      return client ? client.nom : 'unknown';
    }
  }

  deletePayement(payement: Payement) {
    Swal.fire({
      title: 'delete payement . ',
      text: 'vous ne pouvez pas annuler cette action plus tard !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'supprimer',
    }).then((result) => {
      if (result.isConfirmed) {
        alert(payement.id);

        try {
          const query =
            this.actionneur === 'client'
              ? 'DELETE FROM payementsclient WHERE id = ?'
              : 'DELETE FROM payementsfournisseur WHERE id = ?';

          this.databaseservise.queryDatabase(query, [payement.id]);
          this.showSuccessAlert();
          this.loadpayements();
        } catch (err) {
          alert('ne peut pas supprimer ce payement');
          console.log('error deleting payement', err);
        }
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
    'no',
    'date',
    'actionneur',
    'montant',
    'option',
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  filterchange() {
    this.dataSource.filter = this.searchTerm.trim().toLowerCase();
  }

  produits: Produit[] = [];
  showingDetails = false;
  produitsVendus: {
    ProduitId: number;
    prix: number;
    quantite: number;
    total: number;
  }[] = [];
  detailledpayement: Payement = {
    id: 0,
    montant: 0,
    datePayement: '',
  };

  showDetails(payement: Payement) {
    this.showingDetails = true;
    this.detailledpayement = payement;
  }

  //print
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  downloadPDF() {
    this.databaseservise.downloadPDF('payement', this.pdfContent);
  }
}
