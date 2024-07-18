import { Component, NgModule, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DatabaseService } from './database.service';
import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet , CommonModule ],
  providers: [DatabaseService ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{
  constructor(private databaseService:DatabaseService){}
  title = 'aliagri';
  ngOnInit(): void {
    this.loadData()
  }
  data:any[] = [] ; 

  async loadData(){
    try{
      this.data = await this.databaseService.queryDatabase("SELECT * FROM data")
    console.log("data loaded " , this.data);
    }catch(err){
      console.log("error finding data" , err)
    }
  }
}
