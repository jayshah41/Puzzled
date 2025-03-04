type LoginOrSignupModal = 'Closed' | 'Login' | 'Signup'
import { Router } from "@angular/router";

export default class LoginService {
	private showLoginOrSignupModal: LoginOrSignupModal = "Closed"
	private showForgotPasswordModal: boolean = false
	private email: string = ''
	private password: string = ''
	private loggedIn: boolean = false
	private tier: string = ""
	private packages: any = []
	private info: any = {}

	// constructor(private router: Router) {}

	public setInfo = (newInfo: any) => {
		this.info = newInfo
	}

	public getInfo = () => {
		return this.info
	}

	public getInfoPaidUntil = () => {
		return this.info
	}

	public setPackages = (newPackages: any) => {
		this.packages = newPackages
	}

	public getPackages = () => {
		return this.packages
	}

	public setTier = (newTier: string) => {
		this.tier = newTier
	}

	public getTier = () => {
		return this.tier
	}

	public userLoggedIn = (token: string) => {
		this.loggedIn = true
	}

	public logout = () => {
		this.loggedIn = false
	}

	public setEmail = (email: string) => {
		this.email = email
	}

	public setPassword = (password: string) => {
		this.password = password
	}

	public getEmail = () => {
		return this.email
	}

	public getPassword = () => {
		return this.password
	}

	public getShowLoginOrSignupModal = () => {
		return this.showLoginOrSignupModal
	}

	public setShowLoginOrSignupModal = (modal: LoginOrSignupModal) => {

		this.showLoginOrSignupModal = modal

		if (this.showLoginOrSignupModal === 'Closed') {
			document.body.classList.add('overflow-auto')
			document.body.classList.remove('overflow-hidden')
		} else {
			document.body.classList.remove('overflow-auto')
			document.body.classList.add('overflow-hidden')
		}
	}

	public getShowForgotPasswordModal = () => {
		return this.showForgotPasswordModal
	}

	public setShowForgotPasswordModal = (bool: boolean) => {
		this.showForgotPasswordModal = bool
	}
}