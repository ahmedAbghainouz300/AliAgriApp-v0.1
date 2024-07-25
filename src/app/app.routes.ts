// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { ClientsComponent } from './pages/clients/clients.component';
import { FournisseursComponent } from './pages/fournisseurs/fournisseurs.component';
import { ProductsComponent } from './pages/products/products.component';
import { SalesComponent } from './pages/sales/sales.component';
import { PurshasesComponent } from './pages/purshases/purshases.component';
import { FacturesComponent } from './pages/factures/factures.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AssistantDashboardComponent } from './pages/assistant-dashboard/assistant-dashboard.component';
import { AssistantLayoutComponent } from './pages/assistant-layout/assistant-layout.component';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },
  { path: 'login', component: LoginComponent },
  {
    path: 'admin-layout',
    component: AdminLayoutComponent,
    children: [
      { path: 'admin-dashboard', component: AdminDashboardComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'fournisseurs', component: FournisseursComponent },
      { path: 'produits', component: ProductsComponent },
      { path: 'ventes', component: SalesComponent },
      { path: 'achats', component: PurshasesComponent },
      { path: 'factures', component: FacturesComponent },
      { path: '', redirectTo: 'admin-dashboard', pathMatch: 'full' }, // Default route for admin-layout
    ],
  },
  {
    path: 'assistant-layout',
    component: AssistantLayoutComponent,
    children: [
      { path: 'produits', component: ProductsComponent },
      { path: 'ventes', component: SalesComponent },
      { path: 'achats', component: PurshasesComponent },
      { path: 'factures', component: FacturesComponent },
      { path: 'assistant-dashboard', component: AssistantDashboardComponent },
      { path: '', redirectTo: 'assistant-dashboard', pathMatch: 'full' }, // Default route for assistant-layout
    ],
  },
];
