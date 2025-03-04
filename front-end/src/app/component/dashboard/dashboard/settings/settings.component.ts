import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

	constructor(public globalState: GlobalStateService) { }

	ngOnInit(): void {
	}

	ngAfterViewInit() {
		this.globalState.settingsPageOpened()
	}

}
