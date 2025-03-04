import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  animations: [
    trigger(
      'inOutAnimation',
      [
        transition(
          ':enter',
          [
            style({ transform: 'translateY(50px)', opacity: 0 }),
            animate('0.5s ease-out',
              style({ transform: 'translateY(0px)', opacity: 1 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ transform: 'translateY(0px)', opacity: 1 }),
            animate('0.5s ease-in',
              style({ transform: 'translateY(-50px)', opacity: 0 }))
          ]
        )
      ]
    ),
    trigger(
      'backgroundOpacity',
      [
        transition(
          ':enter',
          [
            style({ opacity: 0 }),
            animate('0.5s ease-out',
              style({ opacity: 0.3 }))
          ]
        ),
        transition(
          ':leave',
          [
            style({ opacity: 0.3 }),
            animate('0.5s ease-in',
              style({ opacity: 0 }))
          ]
        )
      ]
    ),
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
export class SignupComponent implements OnInit {

  constructor(public globalState: GlobalStateService) { }

  ngOnInit(): void {
  }

}
