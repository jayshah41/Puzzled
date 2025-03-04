import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';


@Component({
    selector: 'pricing',
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.css']
})
export class PricingComponent implements OnInit {

    constructor(public globalState: GlobalStateService) { }

    ngOnInit(): void {
    }

}
