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
import { MatButton, MatFabButton } from '@angular/material/button';

export interface Vente {
  id: number;
  description: string;
  dateVente: string;
  clientId: number;
  total: number;
  type: string;
  avance: number;
}

@Component({
  selector: 'app-sales',
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
    MatButton,
    MatFabButton,
  ],
  templateUrl: './sales.component.html',
  styleUrls: ['../purshases/purshases.component.css'], // Corrected from `styleUrl` to `styleUrls`
})
export class SalesComponent {
  imagePath = path.join(__dirname, 'public/assets/R.png');
  dataSource: MatTableDataSource<Vente>;

  searchTerm: string = '';
  ventes: Vente[] = [];
  onAdding: boolean = false;
  Editing: boolean = false;
  editedVente: Vente = {
    id: 0,
    description: '',
    dateVente: '',
    clientId: 0,
    total: 0,
    type: '',
    avance: 0,
  };
  newVente: Vente = {
    id: 0,
    description: '',
    dateVente: '',
    clientId: 0,
    total: 0,
    type: '',
    avance: 0,
  };

  constructor(
    public databaseservise: DatabaseService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _liveAnnouncer: LiveAnnouncer
  ) {
    this.dataSource = new MatTableDataSource<Vente>(this.ventes);
    this.dataSource.filterPredicate = (data: Vente, filter: string) => {
      const filterValue = filter.trim().toLowerCase();
      return (
        data.description.toLowerCase().includes(filterValue) ||
        data.dateVente.toLowerCase().includes(filterValue) ||
        this.getClientById(data.clientId).toLowerCase().includes(filterValue) ||
        data.total.toString().includes(filterValue)
      );
    };
  }

  ngOnInit(): void {
    this.loadVentes();
    this.loadClients();
    this.loadProduits();
  }

  async loadVentes() {
    try {
      const ventes = await this.databaseservise.queryDatabase(
        'SELECT * FROM ventes'
      );
      if (Array.isArray(ventes)) {
        this.ventes = ventes;
        this.dataSource.data = this.ventes; // Set the data for MatTableDataSource
        this.cdr.detectChanges();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('ventes could not be loaded');
      console.error('Error loading ventes:', err);
    }
    this.ngAfterViewInit();
    console.log(this.ventes);
  }

  clients: Client[] = [];

  async loadClients() {
    try {
      const result = await this.databaseservise.queryDatabase(
        'SELECT * FROM clients'
      );
      this.clients = result;
    } catch (error) {
      console.log(error);
    }
  }

  getClientById(id: number): string {
    const client = this.clients.find((client) => client.id === id);
    return client ? client.nom : 'unknown';
  }

  deleteVente(vente: Vente) {
    Swal.fire({
      title: 'delete vente . ',
      text: 'vous ne pouvez pas annuler cette action plus tard !',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'blue',
      confirmButtonText: 'supprimer',
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          this.databaseservise.queryDatabase(
            `DELETE FROM ventes WHERE id = ?`,
            [vente.id]
          );
          this.showSuccessAlert();
          this.loadVentes();
        } catch (err) {
          alert('ne peut pas supprimer ce fournisseur');
          console.log('error deleting fournisseur', err);
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
    'client',
    'total',
    'type',
    'avance',
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
  detailledvente: Vente = {
    id: 0,
    description: '',
    dateVente: '',
    clientId: 0,
    total: 0,
    type: '',
    avance: 0,
  };

  async loadProduits() {
    try {
      const result = await this.databaseservise.queryDatabase(
        'SELECT * FROM produits'
      );
      this.produits = result;
    } catch (err) {
      console.log(err);
    }
  }

  async getProduits(vente: Vente) {
    try {
      const result = await this.databaseservise.queryDatabase(
        'SELECT * FROM facturesvente WHERE VenteId = ?',
        [vente.id]
      );
      this.produitsVendus = result;
    } catch (error) {
      console.log(error);
    }
  }

  showDetails(vente: Vente) {
    this.showingDetails = true;
    this.detailledvente = vente;
    this.getProduits(vente);
  }

  getProduitById(id: number) {
    for (let produit of this.produits) {
      if (produit.id === id) {
        return produit.libelle;
      }
    }
    return 'unknown';
  }

  //print
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  downloadPDF() {
    this.databaseservise.downloadPDF('sale', this.pdfContent);
  }
}
