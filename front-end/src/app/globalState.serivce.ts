import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Router } from "@angular/router";
import APIService from "./state/api.services";
import CookieService from "./state/cookies.service";
import DashboardService from "./state/dashboard.service";
import LoginService from "./state/login.service";
import StripeService from "./state/stripe.service";
import TopNavService from "./state/topNav.service";
import { DateTime } from "luxon"
import { ActivatedRoute } from '@angular/router';

@Injectable({
	providedIn: 'root',
})

export class GlobalStateService {
	private topNavService = new TopNavService();
	private loginService = new LoginService();
	private dashboardService = new DashboardService();
	private cookieService = new CookieService();
	private apiService = new APIService();
	private stripeService = new StripeService();
	public selectedPlan = '';
	public plans = [
		{ 'plan_id': 1, price: 395, tier: 1, user: 1 },
		{ 'plan_id': 2, price: 895, tier: 1, user: 1 },
		{ 'plan_id': 3, price: 1495, tier: 1, user: 1 },
		{ 'plan_id': 4, price: 895, tier: 2, user: 1 },
		{ 'plan_id': 5, price: 1495, tier: 2, user: 1 },
		{ 'plan_id': 6, price: 3995, tier: 2, user: 1 },
		{ 'plan_id': 7, price: 1295, tier: 2, user: 5 },
		{ 'plan_id': 8, price: 2995, tier: 2, user: 5 },
		{ 'plan_id': 9, price: 9995, tier: 2, user: 5 },		
	]

	constructor(private router: Router, private sanitizer: DomSanitizer, private route: ActivatedRoute) {
		// window.addEventListener("scroll", this.topNavService.changeTopNavOnScrollPosition, false);
		// window.removeEventListener('scroll', this.topNavService.changeTopNavOnScrollPosition)
		// this.addTokenToDashboardURLs()
		this.selectedPlan = this.route.snapshot.queryParamMap.get('plan');

		console.log(this.loginService.getPackages())
		// this.stripeService.setShowPaymentComponent(true)
	}

	public getInfo = () => {
		let info = JSON.parse(JSON.stringify(this.loginService.getInfo()))
		// console.log({ info })
		info.paid_until = DateTime.fromISO(info.paid_until).toLocaleString(DateTime.DATE_FULL)
		info.paid_date = DateTime.fromISO(info.paid_date).toLocaleString(DateTime.DATE_FULL)
		return info
	}

	public getPackageAmount = () => {
		return this.stripeService.getAmount()
	}

	public createPaymentIntent = (packageId: string, amount: number) => {
		this.selectedPlan = packageId;
		this.router.navigate(['/home/payments'], { queryParams: { plan: packageId } });
		this.stripeService.createPaymentIntent(packageId, amount, this.loginService.getEmail())
	}

	public getShowPaymentComponent = () => {
		return this.stripeService.getShowPaymentComponent()
	}

	public getWaitingForAPIFlag = () => {
		return this.apiService.getWaitingForAPIFlag()
	}

	public settingsPageOpened = () => {

	}

	public getPackages = () => {
		return this.loginService.getPackages()
	}

	public getStripeLoading = () => {
		return this.stripeService.getLoading()
	}

	public paymentsPageOpened = async () => {
		//
		this.stripeService.setLoading(true)
		this.stripeService.setShowPaymentComponent(false)
		//
		await this.refreshInfo()
		//
		if (this.loginService.getTier() === "") {
			//
			// User does not have a tier. They need to pay
			const packages = await this.apiService.packages()
			this.loginService.setPackages(packages.data.packages)
			//
			// this.stripeService.setShowPaymentComponent(true)
			this.stripeService.setLoading(false)
			//
		} else {
			// User has a tier. Get their info to display in the payments area
			this.stripeService.setLoading(false)
		}
	}

	public changeRoute = (path: string) => {
		this.router.navigate([path])
		window.scrollTo(0, 0)

		this.dashboardService.setDropdownMenuButtonDropdownFlag(false)
	}

	public getRoute = () => {
		return this.router.url
	}

	public getTopNavMobileMenuFlag = () => {
		return this.topNavService.getTopNavMobileMenuFlag()
	}

	public setTopNavMobileMenuFlag = () => {
		this.topNavService.setTopNavMobileMenuFlag()
	}

	public getShowLoginOrSignupModal = () => {
		return this.loginService.getShowLoginOrSignupModal()
	}

	public stripeFormSubmitted = async (event: any) => {
		let stripeResult = await this.stripeService.formSubmitted(event)
		console.log("stripeResult2 ", stripeResult)
		if(stripeResult.paymentIntent != undefined && stripeResult.paymentIntent.status == "succeeded") {
			await this.apiService.uploadResult(this.stripeService.getPaymentId(), this.stripeService.getPackageId(), this.loginService.getEmail(), this.stripeService.getAmount())
			await this.refreshInfo()
			await this.getIframeURLSandAddTokenAndChangeDomain()
			console.log(this.stripeService.getPaymentId())
		}
	}

	public refreshInfo = async () => {
		this.apiService.setWaitingForAPIFlag(true)
		const infoResult = await this.apiService.info()
		this.loginService.setTier(infoResult.data.tier)
		this.loginService.setInfo(infoResult.data)
		// console.log(infoResult)
		this.dashboardService.setFirstName(infoResult.data.firstName)
		this.apiService.setWaitingForAPIFlag(false)
	}

	public getTier = () => {
		return this.loginService.getTier()
	}

	public setShowLoginOrSignupModal = (modal, planId = null) => {

		if(planId != null) {
			const queryParams = { plan: planId };
			this.router.navigate(['/pricing'], { queryParams: { plan: planId } });
		}

		this.loginService.setShowLoginOrSignupModal(modal)
		//
		if (modal === "Closed") {
			this.loginService.setShowForgotPasswordModal(false)
		}
		//
	}

	public getShowIncorrectUsernamePasswordDiv = () => {
		return this.apiService.getShowIncorrectUsernamePasswordDiv()
	}

	public getSubmittingLoginAPILoader = () => {
		return this.apiService.getSubmittingLoginAPILoader()
	}

	public getSideBarNavSelection = () => {
		return this.dashboardService.getSideBarNavSelection()
	}

	// public addTokenToDashboardURLs = () => {
	//     //
	//     const token = this.apiService.getToken()
	//     //
	//     this.dashboardService.addTokenToAllDashboardURL(token)
	// }

	public getIFrameURL = (dashboard: string) => {
		//
		const urls = this.dashboardService.getIFrameURLs(dashboard)
		// const unsafeURLs = this.dashboardService.getIFrameURLs(dashboard)
		// const safeURLS = unsafeURLs.map(url => this.sanitizer.bypassSecurityTrustResourceUrl(url))
		//
		return urls
	}

	public apiLogin = async (email: string, password: string, firstLogin: boolean) => {
		//
		this.apiService.setSubmittingLoginFlag(true)
		if (email === '' || password === '') {
			this.apiService.setSubmittingLoginFlag(false)
			this.apiService.setShowIncorrectUsernamePasswordDiv(true)
		} else {

			const loginResult = await this.apiService.login(email, password)
			//)
			// console.log({ loginResult })
			if (loginResult.outcome === 1) {
				//
				this.apiService.setToken(loginResult.data.token)
				this.loginService.setEmail(email)
				//
				await this.refreshInfo()
				//
				this.apiService.setSubmittingLoginFlag(false)
				this.loginService.setShowLoginOrSignupModal('Closed')
				//
				this.cookieService.setCookie("token", loginResult.data.token, 1)
				this.cookieService.setCookie("email", email, 1)
				//
				this.getIframeURLSandAddTokenAndChangeDomain()
				//
				let planId = this.route.snapshot.queryParamMap.get('plan');


				if(planId == undefined) {
					if (firstLogin) {
						this.router.navigate(['/home/payments'])
					} else {
						this.router.navigate(['/home/company_details'])
					}
				}
				else {
					this.selectedPlan = planId;
					this.router.navigate(['/home/payments'], { queryParams: { plan: planId } });
				}

				//
			} else {
				//
				this.apiService.setSubmittingLoginFlag(false)
				this.apiService.setShowIncorrectUsernamePasswordDiv(true)
				//
				this.loginService.logout()
				//
			}
		}
		//
	}

	public refreshTokenFromCookie = async () => {
		//
		const token = this.cookieService.getCookie("token")
		const email = this.cookieService.getCookie("email")
		if (token === "") {
			this.router.navigate(['/'])
			this.setShowLoginOrSignupModal('Login')
		} else {
			await this.apiService.setToken(token)
			this.loginService.setEmail(email)
		}
		//
	}

	public logout() {
		this.apiService.setToken("")
		//
		this.cookieService.setCookie("token", "", 1)
		//
		this.dashboardService.setDropdownMenuButtonDropdownFlag(false)
		//
		this.router.navigate(['/'])
		//
	}

	public getIframeURLSandAddTokenAndChangeDomain = async () => {
		this.dashboardService.setIFrameDashboardLoader(true)
		//
		const iframeURLs = await this.apiService.request("/api/users/info", "get", {})
		//
		const keys = Object.keys(iframeURLs.data.links)
		//
		keys.forEach(linkGroupName => {
			const cleanURLs = iframeURLs.data.links[linkGroupName].map(url => {
				return this.sanitizer.bypassSecurityTrustResourceUrl(url)
			})
			iframeURLs.data.links[linkGroupName] = cleanURLs
		})
		this.dashboardService.setIframeURLs(iframeURLs.data.links)
		// console.log("$$$$$$$$$$$$",iframeURLs.data.links)
		//
		this.dashboardService.setIFrameDashboardLoader(false)
	}

	public getIFrameDashboardLoader = () => {
		return this.dashboardService.getIFrameDashboardLoader()
	}

	public submitContactFormInformation = async (firstName: string, lastName, phoneNumber: string, email: string, country: string, state: string, referredBy: string, commodityType1: string, commodityType2: string, commodityType3: string, investmentCriteria: string) => {
		this.apiService.setSubmittingFormAPILoader(true)
		//
		const dirtyContactInfo: any = [firstName, lastName, phoneNumber, email, country, referredBy, commodityType1, commodityType2, commodityType3, investmentCriteria]
		//
		const isAnyElementsEmpty = dirtyContactInfo.includes('')
		//
		if (!isAnyElementsEmpty) {
			//
			const commodityTypes: string[] = [commodityType1, commodityType2, commodityType3]
			//
			const contactUsInfo: any = { firstName, lastName, phoneNumber, email, country, state, referredBy, commodityTypes, investmentCriteria }
			//
			const result = await this.apiService.submitContactFormInformation(contactUsInfo)
			//
			if (result.outcome === 1) {
				this.apiService.setShowContactUsFormMissingInformation(false)
				this.apiService.setSubmittingFormAPILoader(false)
				this.apiService.setIsContactUsFormSubmittedSuccessful(true)
			} else {
				this.apiService.setShowContactUsFormMissingInformation(true)
				this.apiService.setSubmittingFormAPILoader(false)
			}
			//
		} else {
			//
			this.apiService.setShowContactUsFormMissingInformation(true)
			this.apiService.setSubmittingFormAPILoader(false)
			//
		}
	}

	public getIsContactUsFormSubmittedSuccessful = () => {
		return this.apiService.getIsContactUsFormSubmittedSuccessful()
	}
	public getSubmittingFormAPILoader = () => {
		return this.apiService.getSubmittingFormAPILoader()
	}

	public getShowContactUsFormMissingInformation = () => {
		return this.apiService.getShowContactUsFormMissingInformation()
	}

	public getSubmittingSignUpFormAPILoader = () => {
		return this.apiService.getSubmittingSignUpFormAPILoader()
	}

	public getShowSignUpFormMissingInformation = () => {
		return this.apiService.getShowSignUpFormMissingInformation()
	}

	public getSignUpUserExist = () => {
		return this.apiService.getSignUpUserExist();
	}

	public getSignUpAPIResponse = () => {
		return this.apiService.getSignUpAPIResponse();
	}

	public submitSignUpFormInformation = async (firstName: string, lastName: string, phoneNumber: string, email: string, country: string, state: string, referredBy: string, commodityType1: string, commodityType2: string, commodityType3: string, investmentCriteria: string, password: string) => {
		this.apiService.setSubmittingSignUpFormAPILoader(true)
		//
		const dirtyContactInfo: any = [firstName, lastName, phoneNumber, email, country, referredBy, commodityType1, commodityType2, commodityType3, investmentCriteria, password]
		//
		const isAnyElementsEmpty = dirtyContactInfo.includes('')

		if (!isAnyElementsEmpty) {
			//
			const commodityTypes: string[] = [commodityType1, commodityType2, commodityType3]
			//
			const signUpFormInfo: any = { firstName, lastName, phoneNumber, email, country, state, referredBy, commodityTypes, investmentCriteria, password }
			//
			// console.log({ signUpFormInfo })
			const result = await this.apiService.submitSignUpFormInformation(signUpFormInfo)
			//
			// console.log(result)
			if (result.outcome === 1) {
				
				this.apiService.setShowSignUpFormMissingInformation(false)
				this.apiService.setSubmittingSignUpFormAPILoader(false)
				this.apiService.setSignUpAPIResponse(true);
				setTimeout(() => {
					this.loginService.setShowLoginOrSignupModal('Closed')
				}, 3000);
				// this.apiLogin(email, password, true)
			}
			else if (result.outcome === 4) {
				this.apiService.setSubmittingSignUpFormAPILoader(false)
				this.apiService.setSignUpUserExist(true);
			}
			else {
				this.apiService.setShowSignUpFormMissingInformation(true)
				this.apiService.setSubmittingSignUpFormAPILoader(false)
				this.apiService.setSignUpAPIResponse(false);
			}
			//
		} else {
			//
			this.apiService.setShowSignUpFormMissingInformation(true)
			this.apiService.setSubmittingSignUpFormAPILoader(false)
			this.apiService.setSignUpAPIResponse(false);
			//
		}
	}

	public getAccountVerification = async (code: string) => {
		//
		return await this.apiService.accountVerificationAPI(code);
		//
	}

	public getFirstName = () => {
		return this.dashboardService.getFirstName()
	}

	public setDropdownMenuButtonDropdownFlag = (bool: boolean) => {
		this.dashboardService.setDropdownMenuButtonDropdownFlag(bool)
	}

	public getDropdownMenuButtonDropdownFlag = () => {
		return this.dashboardService.getDropdownMenuButtonDropdownFlag()
	}

	public getShowForgotPasswordModal = () => {
		return this.loginService.getShowForgotPasswordModal()
	}

	public setShowForgotPasswordModal = (bool: boolean) => {
		this.loginService.setShowForgotPasswordModal(bool)
	}

	public resetPasswordAPICall = async (email: string) => {
		//
		this.apiService.setSubmittingFormAPILoader(true)
		const result = await this.apiService.resetUserPassword(email)
		// console.log('rrrrrrrrrrrrrrrr');
		// console.log(result);
		//
		if (result.outcome === 1) {
			this.apiService.setShowResetPassword200Successful(true)
			this.apiService.setSubmittingFormAPILoader(false)
		} else {
			this.apiService.setShowResetPasswordFail(true)
			this.apiService.setSubmittingFormAPILoader(false)
		}
		//
	}

	public getShowResetPassword200Successful = () => {
		return this.apiService.getShowResetPassword200Successful()
	}

	public getShowResetPasswordFail = () => {
		return this.apiService.getShowResetPasswordFail()
	}
}
