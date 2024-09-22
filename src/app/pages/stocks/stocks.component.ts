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
import { MatOption, MatSelect } from '@angular/material/select';

export interface User {
  id: number;
  username: string;
  password: string;
  role: string;
  created_at: string;
  onediting: boolean;
}

@Component({
  selector: 'app-stocks',
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
    MatSelect,
    MatOption,
  ],
  templateUrl: './stocks.component.html',
  styleUrl: './stocks.component.css',
})
export class StocksComponent {
  imagePath = path.join(__dirname, 'public/assets/R.png');
  dataSource: any;
  ngOnInit(): void {
    this.loadUsers();
  }

  searchTerm: string = '';
  users: User[] = [];
  onAdding: boolean = false;
  Editing: boolean = false;
  editedUser: User = {
    id: 0,
    username: '',
    password: '',
    role: '',
    created_at: '',
    onediting: false,
  };
  newUser: User = {
    id: 0,
    username: '',
    password: '',
    role: '',
    created_at: '',
    onediting: false,
  };
  constructor(
    public databaseservise: DatabaseService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _liveAnnouncer: LiveAnnouncer
  ) {}

  async loadUsers() {
    try {
      const users = await this.databaseservise.queryDatabase(
        'SELECT * FROM USERS'
      );
      if (Array.isArray(users)) {
        this.users = users;
        this.dataSource = new MatTableDataSource<User>(this.users);
        console.log('users : ', this.users);
        console.log('datasource : ', this.dataSource);
        this.cdr.detectChanges();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('users could not be loaded');
      console.error('Error loading users:', err);
    }
    this.ngAfterViewInit();
  }

  async addUser() {
    this.onAdding = true;
    try {
      await this.databaseservise.queryDatabase(
        'INSERT INTO USERS (username , password, role) VALUES (?, ? , ?)',
        [this.newUser.username, this.newUser.password, this.newUser.role]
      );
      this.showSuccessAlert();
      this.loadUsers();
    } catch (err) {
      alert('Failed to add user');
      console.error('Error inserting user:', err);
    }
    this.newUser = {
      id: 0,
      username: '',
      password: '',
      role: '',
      created_at: '',
      onediting: false,
    };
    this.onAdding = false;
  }

  onEditing(user: User) {
    if (!user.onediting) {
      // Copy client data to newClient
      this.editedUser = { ...user };
      user.onediting = true;
      this.onAdding = false;
    } else {
      user.onediting = false;
    }
  }
  editUser(user: User) {
    try {
      this.databaseservise.queryDatabase(
        `
        UPDATE users
        SET username = ?,password = ?, role = ?
        WHERE id = ?;
      `,
        [
          this.editedUser.username,
          this.editedUser.password,
          this.editedUser.role,
          user.id,
        ]
      );
    } catch (err) {
      alert("user n'a pas pu etre modifie");
      console.log('erreur modifying user', err);
    }
    user.onediting = false;
    this.editedUser = {
      id: 0,
      username: '',
      password: '',
      role: '',
      created_at: '',
      onediting: false,
    };
    this.showSuccessAlert();
    this.loadUsers();
  }

  deleteUser(user: User) {
    Swal.fire({
      title: 'delete user : ' + user.username,
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
            `DELETE FROM USERS
WHERE id = ?`,
            [user.id]
          );
        } catch (err) {
          alert('ne peut pas supprimer ce user');
          console.log('error deleting user', err);
        }
        this.showSuccessAlert();
        this.loadUsers();
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
    'id',
    'username',
    'password',
    'role',
    'created_at',
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
  detailledUser: User = {
    id: 0,
    username: '',
    password: '',
    role: '',
    created_at: '',
    onediting: false,
  };
  showingdetails: boolean = false;
  showDetails(user: User) {
    this.showingdetails = true;
    this.detailledUser = user;
  }

  //print
  @ViewChild('pdfContent', { static: false }) pdfContent!: ElementRef;

  downloadPDF() {
    this.databaseservise.downloadPDF('client', this.pdfContent);
  }
}
