import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';


@Component({
    selector: 'landingPage',
    templateUrl: './landingPage.component.html',
    styleUrls: ['./landingPage.component.css']
})
export class LandingPageComponent implements OnInit {

    constructor(public globalState: GlobalStateService) { }

    ngOnInit(): void {
    }

}
