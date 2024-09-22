import { Injectable, ElementRef } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor(private electronService: ElectronService) {}

  async queryDatabase(query: string, params: any[] = []): Promise<any> {
    if (this.electronService.isElectronApp) {
      return await this.electronService.ipcRenderer.invoke(
        'query-database',
        query,
        params
      );
    } else {
      throw new Error('Not running in Electron environment');
    }
  }
  async queryDatabase2(query: string, params: any[] = []) {
    if (this.electronService.isElectronApp) {
      return await this.electronService.ipcRenderer.invoke(
        'query-database',
        query,
        params
      );
    } else {
      throw new Error('Not running in Electron environment');
    }
  }
  async downloadPDF(component: string, element: ElementRef) {
    const data = element.nativeElement;

    html2canvas(data, { scale: 2 }).then((canvas) => {
      const imgWidth = 148; // PDF width in mm for A5 size
      const pageHeight = 210; // PDF height in mm for A5 size
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a5');
      pdf.addImage(canvas, 'PNG', 0, 0, imgWidth, imgHeight);

      // Get the current date and format it as 'YYYY-MM-DD'
      const currentDate = new Date();
      const formattedDate = `${currentDate.getFullYear()}-${(
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}-${currentDate
        .getDate()
        .toString()
        .padStart(2, '0')}`;

      // Generate the filename with the formatted date
      const pdfFileName = `${component}-details-${formattedDate}.pdf`;

      // Save the PDF with the date in the filename
      pdf.save(pdfFileName);
    });
  }
}
