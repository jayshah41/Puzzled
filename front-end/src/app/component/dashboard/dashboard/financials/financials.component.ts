import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';

@Component({
  selector: 'app-financials',
  templateUrl: './financials.component.html',
  styleUrls: ['./financials.component.css']
})
export class FinancialsComponent implements OnInit {

  constructor(public globalState: GlobalStateService) { }

  ngOnInit(): void {
  }

}
