import LoginService from "src/app/state/login.service";


describe('login state manager', () => {
    beforeEach(async () => {
    });

    it('should change the value of investment criteria selection when the value matches the investment criteria list', () => {
        let loginState = new LoginService();
        //
        loginState.setInvestmentCriteriaSelection('People')
        //
        const expectedResult = {
            value: "People",
            name: "People (Board & Senior Management SH, Remuneration, Exp, Qual)",
        }
        //
        expect(loginState.getInvestmentCriteriaSelection()).toEqual(expectedResult)
    });

    it('should keep the same value of investment criteria selection when the value does not match the investment criteria list', () => {
        let loginState = new LoginService();
        //
        loginState.setInvestmentCriteriaSelection('Not In List')
        //
        const expectedResult = {
            value: "",
            name: "Investment Criteria",
        }
        //
        expect(loginState.getInvestmentCriteriaSelection()).toEqual(expectedResult)
        //
    });
});