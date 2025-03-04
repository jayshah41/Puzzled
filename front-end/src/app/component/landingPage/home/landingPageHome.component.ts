import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
    selector: 'landingPageHome',
    templateUrl: './landingPageHome.component.html',
    styleUrls: ['./landingPageHome.component.css']
})
export class LandingPageHomeComponent implements OnInit {
    urlSafe: SafeResourceUrl;

    constructor(public globalState: GlobalStateService, public sanitizer: DomSanitizer) { }

    ngOnInit(): void {
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl('');
    }

}
