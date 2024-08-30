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
import { MatListModule } from '@angular/material/list';
import { MatButton, MatFabButton } from '@angular/material/button';

export interface Fournisseur {
  id: number;
  cin: string;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  dateAjout: string;
  debit: number;
  limite: number;
  onediting: boolean;
}

@Component({
  selector: 'app-fournisseurs',
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
  templateUrl: './fournisseurs.component.html',
  styleUrl: './fournisseurs.component.css',
})
export class FournisseursComponent {
  imagePath = path.join(__dirname, 'public/assets/R.png');
  dataSource: any;
  ngOnInit(): void {
    this.loadFournisseurs();
  }

  searchTerm: string = '';
  fournisseurs: Fournisseur[] = [];
  onAdding: boolean = false;
  Editing: boolean = false;
  editedFournisseur: Fournisseur = {
    id: 0,
    cin: '',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    dateAjout: '',
    debit: 0,
    limite: 0,
    onediting: false,
  };
  newFournisseur: Fournisseur = {
    id: 0,
    cin: '',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    dateAjout: '',
    debit: 0,
    limite: 0,
    onediting: false,
  };
  constructor(
    public databaseservise: DatabaseService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _liveAnnouncer: LiveAnnouncer
  ) {}

  async loadFournisseurs() {
    try {
      const fournisseurs = await this.databaseservise.queryDatabase(
        'SELECT * FROM fournisseurs'
      );
      if (Array.isArray(fournisseurs)) {
        this.fournisseurs = fournisseurs;
        this.dataSource = new MatTableDataSource<Fournisseur>(
          this.fournisseurs
        );
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

  async addFournisseur() {
    this.onAdding = true;
    try {
      await this.databaseservise.queryDatabase(
        'INSERT INTO fournisseurs (cin ,nom, telephone, email, adresse) VALUES (?, ? , ?, ?, ?)',
        [
          this.newFournisseur.cin,
          this.newFournisseur.nom,
          this.newFournisseur.telephone,
          this.newFournisseur.email,
          this.newFournisseur.adresse,
        ]
      );
      this.showSuccessAlert();
      this.loadFournisseurs();
    } catch (err) {
      alert('Failed to add fournisseur');
      console.error('Error inserting fournisseur:', err);
    }
    this.newFournisseur = {
      id: 0,
      cin: '',
      nom: '',
      telephone: '',
      email: '',
      adresse: '',
      dateAjout: '',
      debit: 0,
      limite: 0,
      onediting: false,
    };
    this.onAdding = false;
  }

  onEditing(fournisseur: Fournisseur) {
    if (!fournisseur.onediting) {
      // Copy client data to newClient
      this.editedFournisseur = { ...fournisseur };
      fournisseur.onediting = true;
      this.onAdding = false;
    } else {
      fournisseur.onediting = false;
    }
  }
  editFournisseur(fournisseur: Fournisseur) {
    try {
      this.databaseservise.queryDatabase(
        `
        UPDATE fournisseurs
        SET cin = ?,nom = ?, telephone = ?,email = ?,adresse = ?,limite = ?
        WHERE id = ?;
      `,
        [
          this.editedFournisseur.cin,
          this.editedFournisseur.nom,
          this.editedFournisseur.telephone,
          this.editedFournisseur.email,
          this.editedFournisseur.adresse,
          this.editedFournisseur.limite,
          fournisseur.id,
        ]
      );
    } catch (err) {
      alert("fournisseur n'a pas pu etre modifie");
      console.log('erreur modifying client', err);
    }
    fournisseur.onediting = false;
    this.editedFournisseur = {
      id: 0,
      cin: '',
      nom: '',
      telephone: '',
      email: '',
      adresse: '',
      dateAjout: '',
      debit: 0,
      limite: 0,
      onediting: false,
    };
    this.showSuccessAlert();
    this.loadFournisseurs();
  }

  deleteFournisseur(fournisseur: Fournisseur) {
    Swal.fire({
      title: 'delete user : ' + fournisseur.nom,
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
            `DELETE FROM fournisseurs
WHERE id = ?`,
            [fournisseur.id]
          );
        } catch (err) {
          alert('ne peut pas supprimer ce fournisseur');
          console.log('error deleting fournisseur', err);
        }
        this.showSuccessAlert();
        this.loadFournisseurs();
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

  detailledFournisseur: Fournisseur = {
    id: 0,
    cin: '',
    nom: '',
    telephone: '',
    email: '',
    adresse: '',
    dateAjout: '',
    debit: 0,
    limite: 0,
    onediting: false,
  };
  showingdetails: boolean = false;
  showDetails(fournisseur: Fournisseur) {
    this.showingdetails = true;
    this.detailledFournisseur = fournisseur;
  }
}
