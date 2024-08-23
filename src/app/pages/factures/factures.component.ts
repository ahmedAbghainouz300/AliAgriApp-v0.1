import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Produit } from '../produits/produits.component';
import { DatabaseService } from '../../database.service';
import { RightCurrencyPipe } from '../../right-currency.pipe';
import {
  MatFormField,
  MatLabel,
  MatOption,
  MatSelect,
} from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { Fournisseur } from '../fournisseurs/fournisseurs.component';
import { Client } from '../clients/clients.component';
@Component({
  selector: 'app-factures',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RightCurrencyPipe,
    MatSelect,
    MatFormField,
    MatLabel,
    MatOption,
    MatButton,
    MatInput,
  ],
  templateUrl: './factures.component.html',
  styleUrl: './factures.component.css',
})
export class FacturesComponent implements OnInit {
  constructor(private databaseservice: DatabaseService) {}
  ngOnInit(): void {
    this.loadProduits();
    this.loadClients();
    this.loadFournisseurs();
  }
  produits: Produit[] = [];
  transactions: string[] = [
    'Achat',
    'Vente',
    'payement(client)',
    'payement(fournisseur)',
  ];
  transaction: string = 'Vente';
  description: string = '';
  async loadProduits() {
    try {
      const produits = await this.databaseservice.queryDatabase(
        'SELECT * FROM produits'
      );
      if (Array.isArray(produits)) {
        this.produits = produits;
      } else {
        console.log('invalid data type');
      }
    } catch (err) {
      console.log('error loading products');
    }
  }
  fournisseurs: Fournisseur[] = [];
  selectedFournisseur: Fournisseur = this.fournisseurs[0];
  async loadFournisseurs() {
    try {
      const fournisseurs = await this.databaseservice.queryDatabase(
        'SELECT * FROM fournisseurs'
      );
      if (Array.isArray(fournisseurs)) {
        this.fournisseurs = fournisseurs;
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('Clients could not be loaded');
      console.error('Error loading clients:', err);
    }
  }

  clients: Client[] = [];
  selectedClient: Client = this.clients[0];
  async loadClients() {
    try {
      const clients = await this.databaseservice.queryDatabase(
        'SELECT * FROM CLIENTS'
      );
      if (Array.isArray(clients)) {
        this.clients = clients;
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      alert('Clients could not be loaded');
      console.error('Error loading clients:', err);
    }
  }
  selectedProduit: Produit = this.produits[1];
  prix: number = 0;
  quantite: number = 1;
  selectedProduits: {
    produit: Produit;
    prix: number;
    quantite: number;
    total: number;
  }[] = [];
  disabledButtons: boolean = false;
  disableButtons() {
    this.disabledButtons = this.selectedProduits.length != 0;
    return this.disabledButtons;
  }
  ajouterProduit() {
    if (this.selectedProduit && this.prix > 0 && this.quantite > 0) {
      // Find the full product object based on the selectedProduit's libelle
      const produit = this.produits.find(
        (p) => p.libelle === this.selectedProduit.libelle
      );

      if (produit) {
        const total = this.prix * this.quantite;
        this.selectedProduits.push({
          produit: produit,
          prix: this.prix,
          quantite: this.quantite,
          total: total,
        });

        // Reset fields after adding the product
        this.selectedProduit = this.produits[0]; // Adjust as needed
        this.prix = 0;
        this.quantite = 1;
      } else {
        alert('Selected product is not found.');
      }
    } else {
      alert('Please fill out all fields correctly.');
    }
  }

  supprimerProduit(produit: any) {
    const index = this.selectedProduits.indexOf(produit);
    if (index > -1) {
      this.selectedProduits.splice(index, 1);
    }
  }

  total: number = 0;
  getTotal(): number {
    this.total = this.selectedProduits.reduce(
      (accumulator, current) => accumulator + current.total,
      0
    );
    return this.total;
  }
  enregistrerFacture() {
    if (this.transaction === 'Vente') {
      try {
        this.databaseservice.queryDatabase(
          'INSERT INTO ventes(description,clientId,total) VALUES(?,?,?)',
          [this.description, this.selectedClient.id, this.total]
        );
      } catch (err) {
        alert('error adding facture');
      }
    } else if (this.transaction === 'Achat') {
      try {
        this.databaseservice.queryDatabase(
          'INSERT INTO achats(description,fournisseurId,total) VALUES(?,?,?)',
          [this.description, this.selectedFournisseur.id, this.total]
        );
      } catch (err) {
        alert('error adding facture');
      }
    }
  }
}
