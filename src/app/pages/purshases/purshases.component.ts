import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
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

export interface Achat {
  id: number;
  description: string;
  dateAchat: string;
  fournisseurId: number;
  total: number;
}

@Component({
  selector: 'app-purshases',
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
  templateUrl: './purshases.component.html',
  styleUrl: './purshases.component.css',
})
export class PurshasesComponent {
  imagePath = path.join(__dirname, 'public/assets/R.png');
  dataSource: MatTableDataSource<Achat>; // Explicitly set type for dataSource

  searchTerm: string = '';
  achats: Achat[] = [];
  onAdding: boolean = false;
  Editing: boolean = false;
  editedAchat: Achat = {
    id: 0,
    description: '',
    dateAchat: '',
    fournisseurId: 0,
    total: 0,
  };
  newAchat: Achat = {
    id: 0,
    description: '',
    dateAchat: '',
    fournisseurId: 0,
    total: 0,
  };

  constructor(
    public databaseservise: DatabaseService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _liveAnnouncer: LiveAnnouncer
  ) {
    this.dataSource = new MatTableDataSource<Achat>(this.achats);
    this.dataSource.filterPredicate = (data: Achat, filter: string) => {
      const filterValue = filter.trim().toLowerCase();
      return (
        data.description.toLowerCase().includes(filterValue) ||
        data.dateAchat.toLowerCase().includes(filterValue) ||
        this.getClientById(data.fournisseurId)
          .toLowerCase()
          .includes(filterValue) ||
        data.total.toString().includes(filterValue)
      );
    };
  }

  ngOnInit(): void {
    this.loadAchats();
    this.loadClients();
    this.loadProduits();
  }

  async loadAchats() {
    try {
      const achats = await this.databaseservise.queryDatabase(
        'SELECT * FROM achats'
      );
      if (Array.isArray(achats)) {
        this.achats = achats;
        this.dataSource.data = this.achats;
        this.cdr.detectChanges();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('achats could not be loaded');
      console.error('Error loading achats:', err);
    }
    this.ngAfterViewInit();
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

  deleteAchat(achat: Achat) {
    Swal.fire({
      title: 'delete achat . ',
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
            `DELETE FROM achats WHERE id = ?`,
            [achat.id]
          );
          this.showSuccessAlert();
          this.loadAchats();
        } catch (err) {
          alert('ne peut pas supprimer cet achat');
          console.log('error deleting achat', err);
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

  displayedColumns: string[] = ['no', 'date', 'fournisseur', 'total', 'option'];

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
  produitsAchetes: {
    produitId: number;
    prix: number;
    quantite: number;
    total: number;
  }[] = [];
  detailledAchat: Achat = {
    id: 0,
    description: '',
    dateAchat: '',
    fournisseurId: 0,
    total: 0,
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

  async getProduits(achat: Achat) {
    try {
      const result = await this.databaseservise.queryDatabase(
        'SELECT * FROM facturesachat WHERE achatId = ?',
        [achat.id]
      );
      this.produitsAchetes = result;
    } catch (error) {
      console.log(error);
    }
  }

  showDetails(achat: Achat) {
    this.showingDetails = true;
    this.detailledAchat = achat;
    this.getProduits(achat);
  }

  getProduitById(id: number) {
    for (let produit of this.produits) {
      if (produit.id === id) {
        return produit.libelle;
      }
    }
    return 'unknown';
  }
}
