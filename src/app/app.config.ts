import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { ElectronService } from 'ngx-electron';
import { DatabaseService } from './database.service'; // Ensure the path is correct
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Import MatDividerModule

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    ElectronService,
    DatabaseService,
    provideAnimationsAsync(),
    // Add DatabaseService here
  ],
};
