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
import { MatSelectModule } from '@angular/material/select';
import { Categorie } from '../categories/categories.component';
import { Unite } from '../categories/categories.component';
import { MatListModule } from '@angular/material/list';

import path from 'path';
import { MatButton, MatFabButton } from '@angular/material/button';
export interface Produit {
  id: number;
  reference: string;
  libelle: string;
  prixAchat: number;
  prixVente: number;
  unite: number;
  categorie: number;
  stock: number;
  limite: number;
  onediting: boolean;
}
@Component({
  selector: 'app-produits',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    RightCurrencyPipe,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatSelectModule,
    MatListModule,
    MatButton,
    MatFabButton,
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
  imagePath = path.join(__dirname, 'public/assets/productIcon.png');
  Categories: Categorie[] = [];
  Unites: Unite[] = [];
  Editing: boolean = false;
  async loadCategories() {
    try {
      const categories = await this.databaseservise.queryDatabase(
        'SELECT * FROM categories'
      );
      if (Array.isArray(categories)) {
        this.Categories = categories;
        this.cdr.detectChanges();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('error loading categories');
      console.error('error : ', err);
    }
  }
  async loadUnites() {
    try {
      const unites = await this.databaseservise.queryDatabase(
        'SELECT * FROM unites'
      );
      if (Array.isArray(unites)) {
        this.Unites = unites;
        this.cdr.detectChanges();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('error loading Unites');
      console.error('error : ', err);
    }
  }
  dataSource: any;
  ngOnInit(): void {
    this.loadProduits();
    this.loadCategories();
    this.loadUnites();
  }
  selectedUnite: number = 0;
  selectedCategorie: number = 0;

  searchTerm: string = '';
  Produits: Produit[] = [];
  onAdding: boolean = false;
  editedProduit: Produit = {
    id: 0,
    reference: '',
    libelle: '',
    prixAchat: 0,
    prixVente: 0,
    unite: 0,
    categorie: 0,
    stock: 0,
    limite: 0,
    onediting: false,
  };
  newProduit: Produit = {
    id: 0,
    reference: '',
    libelle: '',
    prixAchat: 0,
    prixVente: 0,
    unite: 0,
    categorie: 0,
    stock: 0,
    limite: 0,
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
        'INSERT INTO produits (reference ,libelle, prixAchat, prixVente, unite, categorie) VALUES (?, ? , ?, ?, ?, ?)',
        [
          this.newProduit.reference,
          this.newProduit.libelle,
          this.newProduit.prixAchat,
          this.newProduit.prixVente,
          this.selectedUnite,
          this.selectedCategorie,
        ]
      );
      this.showSuccessAlert();
      this.loadProduits();
    } catch (err) {
      alert('Failed to add product');
      console.error('Error inserting client:', err);
    }
    this.newProduit = {
      id: 0,
      reference: '',
      libelle: '',
      prixAchat: 0,
      prixVente: 0,
      unite: 0,
      categorie: 0,
      stock: 0,
      limite: 0,
      onediting: false,
    };
    this.selectedUnite = 0;
    this.selectedCategorie = 0;
    this.onAdding = false;
  }
  getUnite(id: number) {
    for (let unite of this.Unites) {
      if (unite.id === id) return unite.libelle;
    }
    return 'unkown libelle';
  }
  getCategorie(id: number) {
    for (let categorie of this.Categories) {
      if (categorie.id === id) return categorie.libelle;
    }
    return 'unkown libelle';
  }

  onEditing(produit: Produit) {
    if (!produit.onediting) {
      // Copy client data to newClient
      this.editedProduit = { ...produit };
      produit.onediting = true;
      this.Editing = true;
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
        SET reference = ?,libelle = ?, prixAchat = ?,prixVente = ?,unite = ?,categorie = ?,limite = ?
        WHERE id = ?;
      `,
        [
          this.editedProduit.reference,
          this.editedProduit.libelle,
          this.editedProduit.prixAchat,
          this.editedProduit.prixVente,
          this.editedProduit.unite,
          this.editedProduit.categorie,
          this.editedProduit.limite,
          produit.id,
        ]
      );
    } catch (err) {
      alert("produit n'a pas pu etre modifie");
      console.log('erreur modifying produit', err);
    }
    produit.onediting = false;
    this.editedProduit = {
      id: 0,
      reference: '',
      libelle: '',
      prixAchat: 0,
      prixVente: 0,
      unite: 0,
      categorie: 0,
      stock: 0,
      limite: 0,
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
    'stock',
    'limite',
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

  detailledproduit: Produit = {
    id: 0,
    reference: '',
    libelle: '',
    prixAchat: 0,
    prixVente: 0,
    unite: 0,
    categorie: 0,
    stock: 0,
    limite: 0,
    onediting: false,
  };

  showingdetails: boolean = false;
  showDetails(produit: Produit) {
    this.showingdetails = true;
    console.log('showing details : ', this.showingdetails);
    this.detailledproduit = produit;
  }
}
