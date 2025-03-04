var Config = require("../../config")
var Auth = require("../../models/jwt");

describe('authentication', () => {
	beforeEach(async () => { });

	it('should be able to sign a JWT, verify the JWT, and pickup an invalid JWT', async () => {
		//
		const testData = {
			name: "Nick",
			admin: true
		}
		//
		const signedTokenResult = await Auth.JWTSERVICE.sign({
			exp: Config.JWT.expiry(),
			data: testData,
			secret: Config.JWT.secret,
			options: { noTimestamp: true },
		})
		expect(signedTokenResult.outcome).toEqual(1)
		expect(signedTokenResult.token).toBeTruthy()
		//
		const verifiedTokenGood = await Auth.JWTSERVICE.verify(signedTokenResult.token, Config.JWT.secret)
		//
		expect(verifiedTokenGood.outcome).toEqual(1)
		expect(verifiedTokenGood.decoded).toEqual(testData)
		//
		const verifiedTokenBad = await Auth.JWTSERVICE.verify(signedTokenResult.token + "AAA", Config.JWT.secret)
		expect(verifiedTokenBad.outcome).toEqual(0)
		//
	})
})
