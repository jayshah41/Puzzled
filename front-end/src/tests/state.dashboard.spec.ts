import DashboardService from "src/app/state/dashboard.service";


describe('dashboard state manager', () => {
    beforeEach(async () => { });
    let dashboardState = new DashboardService();

    xit('should add a Token to the URL of each iframeURL', () => {
        dashboardState.setIframeURLs({
            Dashboard: [
                'https://backend-elk.makcorp.net.au/app/dashboards#/view/902f8d00-a1b5-11eb-9ff3-c99ae3801db5?embed=true&_g=(filters%3A!()%2CrefreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15m%2Cto%3Anow))&show-query-input=true&show-time-filter=true'
            ],
            MarketData: [],
            Companies: [],
            Financials: [],
            CapitalRaises: [],
            Projects: [],
            Directors: [],
            Shareholders: [],
        })
        //
        //dashboardState.addTokenToAllDashboardURL('123')
        //
        const expectedResults =
            [
                'https://makcorp-cakxnfpecq-uw.a.run.app/makcorptoken/123/app/dashboards#/view/902f8d00-a1b5-11eb-9ff3-c99ae3801db5?embed=true&_g=(filters%3A!()%2CrefreshInterval%3A(pause%3A!t%2Cvalue%3A0)%2Ctime%3A(from%3Anow-15m%2Cto%3Anow))&show-query-input=true&show-time-filter=true'
            ]
        //
        expect(dashboardState.getIFrameURLs('Dashboard')).toEqual(expectedResults)
        //
    });
});