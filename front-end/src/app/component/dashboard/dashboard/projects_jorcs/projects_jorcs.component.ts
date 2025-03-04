import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';

@Component({
  selector: 'app-projects-jorcs',
  templateUrl: './projects_jorcs.component.html',
  styleUrls: ['./projects_jorcs.component.css']
})
export class ProjectsJorcsComponent implements OnInit {

  constructor(public globalState: GlobalStateService) { }

  ngOnInit(): void {
  }

}
