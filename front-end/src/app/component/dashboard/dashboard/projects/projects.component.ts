import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  constructor(public globalState: GlobalStateService) { }

  ngOnInit(): void {
  }

}
