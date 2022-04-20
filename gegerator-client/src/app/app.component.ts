import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { MovielistComponent } from './components/movies/movielist/movielist.component';
import { MovieActions } from './ngrx/actions/movie.actions';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = "Gegerator"

  constructor(private store: Store){}

  ngOnInit(): void {
  }

  downloadAppState(){
    
  }

}
