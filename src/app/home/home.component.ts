import { Component, OnInit, SimpleChanges, OnChanges,ViewChild, ChangeDetectorRef } from '@angular/core';
import { HunterService } from '../hunter.service';
import { Observable } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

import { DomSanitizer } from '@angular/platform-browser';
import { LocalstorageService } from '../localstorage.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  row_nbr: number = 3;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  obs: Observable<any>;
  dataSource: MatTableDataSource<any> ;

  constructor(private hunterService: HunterService,
    private domSanitizer: DomSanitizer, 
    private localStorageService: LocalstorageService,
    private changeDetectorRef: ChangeDetectorRef) { 

   

  }


  public my_data: Array<any>;
  
  public loading: boolean = false;
 public today: boolean = true;

  ngOnInit(): void {

    this.changeDetectorRef.detectChanges();
    var tomorrow = new Date();
    var today = new Date();
    
    tomorrow.setDate(new Date().getDate()+1);
    var tomorrow_final = new Date(tomorrow).toLocaleString().split(',')[0];
    var today_final = new Date(today).toLocaleString().split(',')[0];
    
    var day_after = new Date(today_final).toISOString();
    var day_before = new Date(tomorrow_final).toISOString();
    //Local storage to optimize initial loading
    //this.localStorageService.clearStorage();
    var local_data = this.localStorageService.getLocalStorage();
    if(local_data && local_data[0].day_before == day_before && local_data[0].day_after == day_after){
      this.my_data = local_data[0].title;
      this.dataSource = new MatTableDataSource<any>(local_data[0].title);
        this.dataSource.paginator = this.paginator;
        this.obs = this.dataSource.connect();
    }else{
      console.log("ngONINIT from API");
      
      console.log('NG ON INIT searchProducts between: '+day_after, day_before); 
      this.hunterService.getData(day_after, day_before).subscribe( d => {
        this.loading = false;
       
        console.log(this.dataSource)
        this.my_data = d.data.posts.edges;
        this.my_data.sort(function(a,b){
          
          return b.createdAt - a.createdAt;
        });
        this.localStorageService.storeOnLocalStorage(this.my_data, day_before, day_after);
        this.dataSource = new MatTableDataSource<any>(this.my_data);
        
        this.dataSource.paginator = this.paginator;
        this.obs = this.dataSource.connect();
      });

    }

    
    
  }

//  ngOnChanges(changes: SimpleChanges) {}

  searchProducts(date){
    this.changeDetectorRef.detectChanges();
    this.today = false;
    console.log(new Date(Date.now()).toLocaleString().split(',')[0]);  
    var tomorrow = new Date();
    tomorrow.setDate(new Date(date).getDate()+1);
    var tomorrow_final = new Date(tomorrow).toLocaleString().split(',')[0];
    console.log(tomorrow_final)
    var day_after = new Date(date).toISOString();
    var day_before = new Date(tomorrow_final).toISOString();
    

    this.loading = true;
    this.hunterService.getData(day_after, day_before).subscribe( d => {
      
      
      
      
      this.my_data = d.data.posts.edges;
      this.my_data.sort(function(a,b){
     
        return b.createdAt - a.createdAt;
      });
      this.dataSource = new MatTableDataSource<any>(this.my_data);
      this.dataSource.paginator = this.paginator;
      this.obs = this.dataSource.connect();
      this.loading = false;
      
      
      
    });
    

  }

  getPage(nbr){
    console.log(nbr);
    if(nbr.pageSize > nbr.length){
      this.row_nbr = nbr.length/2;
    }else{
      this.row_nbr = nbr.pageSize/2;
    }
    
  }

}
