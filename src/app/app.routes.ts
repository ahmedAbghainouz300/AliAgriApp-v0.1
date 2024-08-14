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
import { CategoriesComponent } from './pages/categories/categories.component';
import { ProduitsComponent } from './pages/produits/produits.component';

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
      {
        path: 'products',
        component: ProductsComponent,
        children: [
          { path: 'produits', component: ProduitsComponent },
          { path: 'categories', component: CategoriesComponent },
          { path: '', redirectTo: 'produits', pathMatch: 'full' },
        ],
      },
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
      { path: 'admin-dashboard', component: AdminDashboardComponent },
      {
        path: 'products',
        component: ProductsComponent,
        children: [
          { path: 'produits', component: ProduitsComponent },
          { path: 'categories', component: CategoriesComponent },
          { path: '', redirectTo: 'produits', pathMatch: 'full' },
        ],
      },
      { path: 'ventes', component: SalesComponent },
      { path: 'achats', component: PurshasesComponent },
      { path: 'factures', component: FacturesComponent },
      { path: '', redirectTo: 'admin-dashboard', pathMatch: 'full' },
    ],
  },
];
