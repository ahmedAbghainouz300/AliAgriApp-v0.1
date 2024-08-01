import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
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
import { promises } from 'fs';

export interface Produit {
  id: number;
  reference: string;
  libelle: string;
  prixAcahat: string;
  prixVente: string;
  unite: string;
  categorie: string;
  onediting: boolean;
}
@Component({
  selector: 'app-produits',
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
  ],
  templateUrl: './produits.component.html',
  styleUrl: './produits.component.css',
})
export class ProduitsComponent implements OnInit, AfterViewInit {
  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
  dataSource: any;
  ngOnInit(): void {
    this.loadProduits();
  }

  searchTerm: string = '';
  Produits: Produit[] = [];
  onAdding: boolean = false;
  editedProduit: Produit = {
    id: 0,
    reference: '',
    libelle: '',
    prixAcahat: '',
    prixVente: '',
    unite: '',
    categorie: '',
    onediting: false,
  };
  newProduit: Produit = {
    id: 0,
    reference: '',
    libelle: '',
    prixAcahat: '',
    prixVente: '',
    unite: '',
    categorie: '',
    onediting: false,
  };
  constructor(
    public databaseservise: DatabaseService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _liveAnnouncer: LiveAnnouncer
  ) {}

  async loadProduits() {
    try {
      const produits = await this.databaseservise.queryDatabase(
        'SELECT * FROM produits'
      );
      if (Array.isArray(produits)) {
        this.Produits = produits;
        this.dataSource = new MatTableDataSource<Produit>(this.Produits);
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

  async addProduit() {
    this.onAdding = true;
    try {
      await this.databaseservise.queryDatabase(
        'INSERT INTO produits (reference ,libelle, prixAchat, prixVente, unite, categorieId) VALUES (?, ? , ?, ?, ?, ?)',
        [
          this.newProduit.reference,
          this.newProduit.libelle,
          this.newProduit.prixAcahat,
          this.newProduit.prixVente,
          this.newProduit.unite,
          this.newProduit.categorie,
        ]
      );
      this.showSuccessAlert();
      this.loadProduits();
    } catch (err) {
      alert('Failed to add client');
      console.error('Error inserting client:', err);
    }
    this.newProduit = {
      id: 0,
      reference: '',
      libelle: '',
      prixAcahat: '',
      prixVente: '',
      unite: '',
      categorie: '',
      onediting: false,
    };
    this.onAdding = false;
  }

  onEditing(produit: Produit) {
    if (!produit.onediting) {
      // Copy client data to newClient
      this.editedProduit = { ...produit };
      produit.onediting = true;
      this.onAdding = false;
    } else {
      produit.onediting = false;
    }
  }
  editProduit(produit: Produit) {
    try {
      this.databaseservise.queryDatabase(
        `
        UPDATE produits
        SET reference = ?,libelle = ?, prixAchat = ?,prixVente = ?,unite = ?,categorie
        WHERE id = ?;
      `,
        [
          this.editedProduit.reference,
          this.editedProduit.libelle,
          this.editedProduit.prixAcahat,
          this.editedProduit.prixVente,
          this.editedProduit.unite,
          this.editedProduit.categorie,
          produit.id,
        ]
      );
    } catch (err) {
      alert("client n'a pas pu etre modifie");
      console.log('erreur modifying client', err);
    }
    produit.onediting = false;
    this.editedProduit = {
      id: 0,
      reference: '',
      libelle: '',
      prixAcahat: '',
      prixVente: '',
      unite: '',
      categorie: '',
      onediting: false,
    };
    this.showSuccessAlert();
    this.loadProduits();
  }

  deleteProduit(produit: Produit) {
    Swal.fire({
      title: 'delete product : ' + produit.libelle,
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
            `DELETE FROM produits
WHERE id = ?`,
            [produit.id]
          );
        } catch (err) {
          alert('ne peut pas supprimer ce client');
          console.log('error deleting client', err);
        }
        this.showSuccessAlert();
        this.loadProduits();
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
    'reference',
    'libelle',
    'prix-achat',
    'prix-vente',
    'unite',
    'categorie',
    'options',
  ];

  @ViewChild(MatPaginator)
  paginator!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;
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
}
