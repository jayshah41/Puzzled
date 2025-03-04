import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';

@Component({
	selector: 'app-capital-raises',
	templateUrl: './capital-raises.component.html',
	styleUrls: ['./capital-raises.component.css']
})
export class CapitalRaisesComponent implements OnInit {

	constructor(public globalState: GlobalStateService) {
	}

	ngOnInit(): void {
	}

}
