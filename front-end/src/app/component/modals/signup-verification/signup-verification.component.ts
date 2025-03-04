import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalStateService } from 'src/app/globalState.serivce';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-signup-verification',
  templateUrl: './signup-verification.component.html',
  styleUrls: ['./signup-verification.component.css'],
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
export class SignupVerificationComponent implements OnInit {
  success: boolean = false;
  error: boolean = false;
  constructor(
    private activeRoute: ActivatedRoute,
    public router: Router,
    public globalState: GlobalStateService
  ) { }

  async ngOnInit() {
    const code = this.activeRoute.snapshot.queryParams.code;
    const result = await this.globalState.getAccountVerification(code);
    if (result.outcome === 1) {
      this.success = !0;

      setTimeout(() => {
        this.router.navigate(['']);
      }, 2000);
		} else {
      this.error = !0;
    }
    
  }

}
