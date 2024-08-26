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

export interface Vente {
  id: number;
  description: string;
  dateVente: string;
  clientId: number;
  total: number;
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
  ],
  templateUrl: './sales.component.html',
  styleUrl: './sales.component.css',
})
export class SalesComponent {
  imagePath = path.join(__dirname, 'public/assets/R.png');
  dataSource: any;
  ngOnInit(): void {
    this.loadVentes();
    this.loadClients();
    this.loadProduits();
  }

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
  };
  newVente: Vente = {
    id: 0,
    description: '',
    dateVente: '',
    clientId: 0,
    total: 0,
  };
  constructor(
    public databaseservise: DatabaseService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private _liveAnnouncer: LiveAnnouncer
  ) {}

  async loadVentes() {
    try {
      const ventes = await this.databaseservise.queryDatabase(
        'SELECT * FROM ventes'
      );
      if (Array.isArray(ventes)) {
        this.ventes = ventes;
        this.dataSource = new MatTableDataSource<Vente>(this.ventes);
        this.cdr.detectChanges();
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('ventes could not be loaded');
      console.error('Error loading ventes:', err);
    }
    this.ngAfterViewInit();
  }

  // async addFournisseur() {
  //   this.onAdding = true;
  //   try {
  //     await this.databaseservise.queryDatabase(
  //       'INSERT INTO ventes (ClientId ,nom, telephone, email, adresse) VALUES (?, ? , ?, ?, ?)',
  //       [
  //         this.newFournisseur.cin,
  //         this.newFournisseur.nom,
  //         this.newFournisseur.telephone,
  //         this.newFournisseur.email,
  //         this.newFournisseur.adresse,
  //       ]
  //     );
  //     this.showSuccessAlert();
  //     this.loadFournisseurs();
  //   } catch (err) {
  //     alert('Failed to add fournisseur');
  //     console.error('Error inserting fournisseur:', err);
  //   }
  //   this.newFournisseur = {
  //     id: 0,
  //     cin: '',
  //     nom: '',
  //     telephone: '',
  //     email: '',
  //     adresse: '',
  //     dateAjout: '',
  //     credit: 0,
  //     onediting: false,
  //   };
  //   this.onAdding = false;
  // }

  // onEditing(fournisseur: Fournisseur) {
  //   if (!fournisseur.onediting) {
  //     // Copy client data to newClient
  //     this.editedFournisseur = { ...fournisseur };
  //     fournisseur.onediting = true;
  //     this.onAdding = false;
  //   } else {
  //     fournisseur.onediting = false;
  //   }
  // }
  // editFournisseur(fournisseur: Fournisseur) {
  //   try {
  //     this.databaseservise.queryDatabase(
  //       `
  //       UPDATE fournisseurs
  //       SET cin = ?,nom = ?, telephone = ?,email = ?,adresse = ?
  //       WHERE id = ?;
  //     `,
  //       [
  //         this.editedFournisseur.cin,
  //         this.editedFournisseur.nom,
  //         this.editedFournisseur.telephone,
  //         this.editedFournisseur.email,
  //         this.editedFournisseur.adresse,
  //         fournisseur.id,
  //       ]
  //     );
  //   } catch (err) {
  //     alert("fournisseur n'a pas pu etre modifie");
  //     console.log('erreur modifying client', err);
  //   }
  //   fournisseur.onediting = false;
  //   this.editedFournisseur = {
  //     id: 0,
  //     cin: '',
  //     nom: '',
  //     telephone: '',
  //     email: '',
  //     adresse: '',
  //     dateAjout: '',
  //     credit: 0,
  //     onediting: false,
  //   };
  //   this.showSuccessAlert();
  //   this.loadFournisseurs();
  // }
  clients: Client[] = [];
  clientsMap: Map<number, string> = new Map(); // To store clientId and client name mapping

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
  getClientById(id: number) {
    for (let client of this.clients) {
      if (client.id === id) {
        return client.nom;
      }
    }
    return 'unknown';
  }
  // async loadClients() {
  //   try {
  //     const result = await this.databaseservise.queryDatabase(
  //       'SELECT * FROM clients'
  //     );
  //     this.clients = result;

  //     // Fill the map with client IDs and names
  //     this.clients.forEach((client) => {
  //       this.clientsMap.set(client.id, client.nom); // Assuming `nom` is the client's name
  //     });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  // getClientNameById(id: number): string {
  //   return this.clientsMap.get(id) || 'Unknown'; // Return 'Unknown' if client ID is not found
  // }

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
            `DELETE FROM ventes
WHERE id = ?`,
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

  displayedColumns: string[] = ['no', 'date', 'client', 'total', 'option'];

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
  };
  async loadProduits() {
    try {
      const result = await this.databaseservise.queryDatabase(
        'SELECT * FROM produits'
      );
      this.produits = result;
      console.log(this.produits);
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
      console.log(this.produits);
      console.log(id);
      if (produit.id === id) {
        return produit.libelle;
      }
    }
    return 'unknown';
  }
}
