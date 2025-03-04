import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';
import { trigger, state, style, animate, transition } from '@angular/animations';


@Component({
    selector: 'contactUs',
    templateUrl: './contactUs.component.html',
    styleUrls: ['./contactUs.component.css'],
    animations: [
        trigger(
            'alertBox',
            [
                transition(
                    ':enter',
                    [
                        style({ transform: 'translateY(-50px)', opacity: 0 }),
                        animate('0.5s ease-out',
                            style({ transform: 'translateY(0px)', opacity: 0.3 }))
                    ]
                ),
                transition(
                    ':leave',
                    [
                        style({ transform: 'translateY(0px)', opacity: 0.3 }),
                        animate('0.5s ease-in',
                            style({ transform: 'translateY(-50px)', opacity: 0 }))
                    ]
                )
            ]
        ),
    ]
})
export class ContactUsComponent implements OnInit {

    constructor(public globalState: GlobalStateService) { }

    ngOnInit(): void {
    }

}
