import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  constructor(private electronService: ElectronService) { }
  
  async queryDatabase(query: string, params: any[] = []): Promise<any> {
    if (this.electronService.isElectronApp) {
      return await this.electronService.ipcRenderer.invoke('query-database', query, params);
    } else {
      throw new Error('Not running in Electron environment');
    }
  }
}
