import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';


@Component({
    selector: 'products',
    templateUrl: './products.component.html',
    styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {

    constructor(public globalState: GlobalStateService) { }

    ngOnInit(): void {
    }

}
