import { Component, OnInit } from '@angular/core';
import { GlobalStateService } from 'src/app/globalState.serivce';


@Component({
	selector: 'dashboardHome',
	templateUrl: './dashboardHome.component.html',
	styleUrls: ['./dashboardHome.component.css']
})
export class DashboardHomeComponent implements OnInit {

	constructor(public globalState: GlobalStateService) { }

	async ngOnInit() {
		await this.globalState.refreshTokenFromCookie()
		await this.globalState.getIframeURLSandAddTokenAndChangeDomain()
		await this.globalState.refreshInfo()
	}
}
