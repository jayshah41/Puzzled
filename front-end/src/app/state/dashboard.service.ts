type sideBarNavigation = 'Dashboard' | 'Companies' | 'MarketData' | 'MarketNewData'| 'Directors' | 'Shareholders' | 'CapitalRaises' | 'Projects' | 'Projects_Jorc' | 'Financials' | 'Payments' | 'Settings'
type iframeURLs = {
	Dashboard: string[]
	MarketData: string[],
	MarketNewData: string[],
	Companies: string[],
	Financials: string[],
	CapitalRaises: string[],
	Projects: string[],
	Directors: string[],
	Shareholders: string[],
}

export default class DashboardService {
	private sideBarNavSelection: sideBarNavigation
	private iframeURLs: iframeURLs
	// {
	//     Dashboard: [
	//         // 'https://backend.makcorp.net.au/app/dashboards#/view/902f8d00-a1b5-11eb-9ff3-c99ae3801db5?embed=true&_g=(filters%3A!()%2CrefreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15m%2Cto%3Anow))&show-query-input=true&show-time-filter=true'
	//     ],
	//     MarketData: [],
	//     Companies: [],
	//     Financials: [],
	//     CapitalRaises: [],
	//     Projects: [],
	//     Directors: [],
	//     Shareholders: [],
	// }
	private firstName: string
	private iFrameDashboardLoader: boolean = true
	private dropdownMenuButtonDropdownFlag: boolean = false

	public getSideBarNavSelection = () => {
		return this.sideBarNavSelection
	}

	public setSideBarNavSelection = (selection: sideBarNavigation) => {
		this.sideBarNavSelection = selection
	}

	public getIFrameURLs = (dashboard: string) => {
		// console.log({ urls: this.iframeURLs })
		if (this.iframeURLs[dashboard] !== undefined) {
			return this.iframeURLs[dashboard]
		} else {
			return []
		}
	}

	public setIframeURLs = (data: iframeURLs) => {
		this.iframeURLs = data
		// this.iframeURLs = {
		// 	Dashboard: [],
		// 	MarketData: [],
		// 	Companies: [],
		// 	Financials: [],
		// 	CapitalRaises: [
		// 		"https://back.greenfox.dev/app/dashboards#/view/fa3979e0-ab56-11eb-b560-17679d4e9d4a?embed=true&_g=(filters%3A!()%2CrefreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-1y%2Cto%3Anow))&show-query-input=true&show-time-filter=true"
		// 	],
		// 	Projects: [],
		// 	Directors: [],
		// 	Shareholders: [],
		// }
	}

	// public addTokenToAllDashboardURL = (token: string) => {
	// 	//
	// 	for (var dashboard in this.iframeURLs) {
	// 		//
	// 		const addedTokenToIframeURL = this.iframeURLs[dashboard].map((element) => {
	// 			//
	// 			return element.split('/').slice(0, 3).join('/') + '/makcorptoken/' + token + "/" + element.split('/').slice(3, element.split('/').length).join('/')
	// 			//
	// 		})
	// 		//
	// 		this.iframeURLs[dashboard] = addedTokenToIframeURL
	// 	}
	// 	// 
	// }

	public getIFrameDashboardLoader = () => {
		return this.iFrameDashboardLoader
	}

	public setIFrameDashboardLoader = (bool: boolean) => {
		this.iFrameDashboardLoader = bool
	}

	public setFirstName = (firstName: string) => {
		this.firstName = firstName
	}

	public getFirstName = () => {
		return this.firstName
	}

	public getDropdownMenuButtonDropdownFlag = () => {
		return this.dropdownMenuButtonDropdownFlag
	}

	public setDropdownMenuButtonDropdownFlag = (bool: boolean) => {
		this.dropdownMenuButtonDropdownFlag = bool
	}
}