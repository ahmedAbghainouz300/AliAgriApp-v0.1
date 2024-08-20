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

export interface Categorie {
  id: number;
  libelle: String;
  onediting: boolean;
}

export interface Unite {
  id: number;
  libelle: String;
  onediting: boolean;
}
@Component({
  selector: 'app-categories',
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
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.css',
})
export class CategoriesComponent implements OnInit, AfterViewInit {
  // categorie setting up

  editedCategorie: Categorie = {
    id: 0,
    libelle: '',
    onediting: false,
  };
  categoriedataSource: any;
  newCategorie = {
    id: 0,
    libelle: '',
    onediting: false,
  };
  Categories: Categorie[] = [];
  categorieOnAdding: boolean = false;
  categorieEditing: boolean = false;
  ngOnInit(): void {
    this.loadCategories();
    this.loadUnites();
    this.ngAfterViewInit();
  }
  constructor(
    private databaseservise: DatabaseService,
    private cdr: ChangeDetectorRef,
    private _liveAnnouncer: LiveAnnouncer
  ) {}
  categoriesearchTerm: string = '';
  async loadCategories() {
    try {
      const categories = await this.databaseservise.queryDatabase(
        'SELECT * FROM categories'
      );
      if (Array.isArray(categories)) {
        this.Categories = categories;
        this.categoriedataSource = new MatTableDataSource<Categorie>(
          this.Categories
        );
        this.cdr.detectChanges();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('error loading categories');
      console.error('error : ', err);
    }
    this.ngAfterViewInit();
  }
  async addCategorie() {
    try {
      await this.databaseservise.queryDatabase(
        'INSERT INTO categories (libelle) VALUES (?)',
        [this.newCategorie.libelle]
      );
      this.showSuccessAlert();
      this.loadCategories();
    } catch (err) {
      console.log('error adding categorie : ', err);
    }
    this.newCategorie = {
      id: 0,
      libelle: '',
      onediting: false,
    };
  }
  categorieOnEditing(categorie: Categorie) {
    if (!categorie.onediting) {
      // Copy client data to newClient
      this.editedCategorie = { ...categorie };
      categorie.onediting = true;
      this.categorieEditing = true;
      this.categorieOnAdding = false;
    } else {
      categorie.onediting = false;
    }
  }
  editCategorie(categorie: Categorie) {
    try {
      this.databaseservise.queryDatabase(
        `
        UPDATE categories
        SET libelle = ?
        WHERE id = ?;
      `,
        [this.editedCategorie.libelle, categorie.id]
      );
      this.showSuccessAlert();
      this.loadCategories();
    } catch (err) {
      alert("categorie n'a pas pu etre modifie");
      console.log('erreur modifying categorie', err);
    }
    categorie.onediting = false;
    this.editedCategorie = {
      id: 0,
      libelle: '',
      onediting: false,
    };
  }
  deleteCategorie(categorie: Categorie) {
    Swal.fire({
      title: 'delete user : ' + categorie.libelle,
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
            `DELETE FROM categories
WHERE id = ?`,
            [categorie.id]
          );
        } catch (err) {
          alert('ne peut pas supprimer cette categorie');
          console.log('error deleting categorie', err);
        }
        this.showSuccessAlert();
        this.loadCategories();
      }
    });
  }

  //unites setting up
  editedUnite: Unite = {
    id: 0,
    libelle: '',
    onediting: false,
  };
  unitedataSource: any;
  newUnite = {
    id: 0,
    libelle: '',
    onediting: false,
  };
  Unites: Unite[] = [];

  uniteOnAdding: boolean = false;
  uniteEditing: boolean = false;
  uniteSearchTerm: string = '';
  async loadUnites() {
    try {
      const unites = await this.databaseservise.queryDatabase(
        'SELECT * FROM unites'
      );
      if (Array.isArray(unites)) {
        this.Unites = unites;
        this.unitedataSource = new MatTableDataSource<Unite>(this.Unites);
        this.cdr.detectChanges();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('error loading Unites');
      console.error('error : ', err);
    }
    this.ngAfterViewInit();
  }
  async addUnite() {
    try {
      await this.databaseservise.queryDatabase(
        'INSERT INTO unites (libelle) VALUES (?)',
        [this.newUnite.libelle]
      );
      this.showSuccessAlert();
      this.loadUnites();
    } catch (err) {
      console.log('error adding unite : ', err);
    }
    this.newCategorie = {
      id: 0,
      libelle: '',
      onediting: false,
    };
    this.uniteOnAdding = false;
  }
  uniteOnEditing(unite: Unite) {
    if (!unite.onediting) {
      // Copy client data to newClient
      this.editedUnite = { ...unite };
      unite.onediting = true;
      this.uniteEditing = true;
      this.uniteOnAdding = false;
    } else {
      unite.onediting = false;
    }
  }
  editUnite(unite: Unite) {
    try {
      this.databaseservise.queryDatabase(
        `
        UPDATE unites
        SET libelle = ?
        WHERE id = ?;
      `,
        [this.editedUnite.libelle, unite.id]
      );
      this.showSuccessAlert();
      this.loadUnites();
    } catch (err) {
      alert("unite n'a pas pu etre modifie");
      console.log('erreur modifying unite', err);
    }
    unite.onediting = false;
    this.editedUnite = {
      id: 0,
      libelle: '',
      onediting: false,
    };
  }
  deleteUnite(unite: Unite) {
    Swal.fire({
      title: 'delete user : ' + unite.libelle,
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
            `DELETE FROM unites
WHERE id = ?`,
            [unite.id]
          );
        } catch (err) {
          alert('ne peut pas supprimer cette unite');
          console.log('error deleting unite', err);
        }
        this.showSuccessAlert();
        this.loadUnites();
      }
    });
  }

  //   MATERIAL
  showSuccessAlert() {
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Your action was successful!',
      confirmButtonText: 'OK',
    });
  }
  displayedColumns: string[] = ['Libelle', 'Options'];

  @ViewChild('paginatorCategories', { static: true })
  paginatorCategories!: MatPaginator;
  @ViewChild('paginatorUnites', { static: true })
  paginatorUnites!: MatPaginator;
  @ViewChild(MatSort)
  sort!: MatSort;

  ngAfterViewInit() {
    if (this.paginatorCategories || this.paginatorUnites) {
      this.categoriedataSource.paginator = this.paginatorCategories;
      this.unitedataSource.paginator = this.paginatorUnites;
    }
    if (this.sort) {
      this.categoriedataSource.sort = this.sort;
      this.unitedataSource.sort = this.sort;
    }
  }
  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
  categoriefilterchange() {
    this.categoriedataSource.filter = this.categoriesearchTerm;
  }
  unitefilterchange() {
    this.unitedataSource.filter = this.uniteSearchTerm;
  }
}
