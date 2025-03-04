import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';

@Component({
  selector: 'app-shareholders',
  templateUrl: './shareholders.component.html',
  styleUrls: ['./shareholders.component.css']
})
export class ShareholdersComponent implements OnInit {

  constructor(public globalState: GlobalStateService) { }

  ngOnInit(): void {
  }

}
