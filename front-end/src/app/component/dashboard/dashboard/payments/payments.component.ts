import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';

@Component({
	selector: 'app-payments',
	templateUrl: './payments.component.html',
	styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit {

	constructor(public globalState: GlobalStateService) { }

	ngOnInit(): void {
	}

	ngAfterViewInit() {
		setTimeout(() => {
			this.globalState.paymentsPageOpened()
		}, 0);
	}

}
