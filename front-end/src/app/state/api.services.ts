import { config } from "../../config"
import axios from "axios"


export default class APIService {
	private url: string = ''
	private token: string = ''
	private submittingContactUsFormAPILoader: boolean = false
	private isContactUsFormSubmittedSuccessful: boolean = false
	private showContactUsFormMissingInformation: boolean = false
	private submittingSignUpFormAPILoader: boolean = false
	private showSignUpFormMissingInformation: boolean = false
	private showIncorrectUsernamePasswordDiv: boolean = false
	private showResetPassword200Successful: boolean = false
	private showResetPasswordFail: boolean = false
	private submittingLoginAPILoader: boolean = false
	private waitingForAPIFlag: boolean = true
	private signUpAPIResponse: boolean = false
	private signUpUserExist: boolean = false

	constructor() {
		//
		if (config.environment === "production") {
			//
			this.url = config.production_url
			//
		} else {
			//
			this.url = config.dev_url
			//
		}
		//
	}

	public getURL = () => {
		return this.url
	}

	public setToken = (token: string) => {
		this.token = token
	}

	public getToken = () => {
		return this.token
	}

	public setWaitingForAPIFlag = (bool: boolean) => {
		this.waitingForAPIFlag = bool
	}

	public getWaitingForAPIFlag = () => {
		return this.waitingForAPIFlag
	}

	public login = async (email: string, password: string) => {
		return await this.request("/api/users/login", "post", {
			email: email,
			password: password,
		})
	}

	public submitSignUpFormInformation = async (signupFormInfo: any) => {
		// console.log(signupFormInfo)
		return await this.request("/api/users/signup", "post", signupFormInfo)
	}

	public info = async () => {
		return await this.request("/api/users/info", "get", {})
	}

	public packages = async () => {
		return await this.request("/api/packages", "get", {})
	}

	public submitContactFormInformation = async (contactUsInfo: any) => {
		return await this.request("/api/contactus", "post", contactUsInfo)
	}

	public uploadResult = async (paymentId: string, packageId: string, email: string, amount: number) => {
		return await this.request("/api/user/upload-result", "post", {
			paymentId: paymentId,
			packageId: packageId,
			email: email,
			amount: amount
		})
	}

	public resetUserPassword = async (email: string) => {
		return await this.request("/api/users/forgotpassword", "post", {
			email: email
		})
	}

	public request = async (path: string, method: "get" | "post", data: any) => {
		//
		try {
			//
			const res = await axios({
				withCredentials: true,
				baseURL: this.url,
				url: path,
				method: method,
				headers: { "Token": this.token },
				data: data || {},
			});
			// console.log('wwwwwwwwwwwwww');
			// console.log(res);
			//
			return {
				outcome: 1,
				data: res.data
			}
			//
		} catch (e) {
			//
			// console.log({ e });
			if (e && e.response && e.response.status === 409) {
				return {
					status: e.response.status,
					outcome: 4,
				}
			}
			//
			return {
				outcome: 0
			}
			//
		}
		//
	}

	public accountVerificationAPI = async (code: string) => {
		return await this.request("/api/account/verification", "post", {
			code
		});
	}

	public getIsContactUsFormSubmittedSuccessful = () => {
		return this.isContactUsFormSubmittedSuccessful
	}

	public setIsContactUsFormSubmittedSuccessful = (bool: boolean) => {
		//
		if (bool === true) {
			//
			this.isContactUsFormSubmittedSuccessful = true
			//
			setTimeout(() => {
				this.isContactUsFormSubmittedSuccessful = false
			}, 5000);
			//
		} else {
			this.isContactUsFormSubmittedSuccessful = false
		}
		this.isContactUsFormSubmittedSuccessful = bool
	}

	public getSubmittingLoginAPILoader = () => {
		return this.submittingLoginAPILoader
	}

	public setSubmittingLoginFlag = (bool: boolean) => {
		this.submittingLoginAPILoader = bool
	}

	public getSubmittingFormAPILoader = () => {
		return this.submittingContactUsFormAPILoader
	}

	public setSubmittingFormAPILoader = (bool: boolean) => {
		this.submittingContactUsFormAPILoader = bool
	}

	public getShowContactUsFormMissingInformation = () => {
		return this.showContactUsFormMissingInformation
	}

	public setShowContactUsFormMissingInformation = (bool: boolean) => {
		//
		if (bool === true) {
			//
			this.showContactUsFormMissingInformation = true
			//
			setTimeout(() => {
				this.showContactUsFormMissingInformation = false
			}, 5000);
			//
		} else {
			this.showContactUsFormMissingInformation = false
		}
	}

	public getSubmittingSignUpFormAPILoader = () => {
		return this.submittingSignUpFormAPILoader
	}

	public setSubmittingSignUpFormAPILoader = (bool: boolean) => {
		this.submittingSignUpFormAPILoader = bool
	}

	public getShowSignUpFormMissingInformation = () => {
		return this.showSignUpFormMissingInformation
	}

	public setShowSignUpFormMissingInformation = (bool: boolean) => {
		//
		if (bool === true) {
			//
			this.showSignUpFormMissingInformation = true
			//
			setTimeout(() => {
				this.showSignUpFormMissingInformation = false
			}, 5000);
			//
		} else {
			this.showSignUpFormMissingInformation = false
		}
		//
	}
	public setShowIncorrectUsernamePasswordDiv = (bool: boolean) => {
		//
		if (bool === true) {
			//
			this.showIncorrectUsernamePasswordDiv = true
			//
			setTimeout(() => {
				this.showIncorrectUsernamePasswordDiv = false
			}, 5000);
			//
		} else {
			this.showIncorrectUsernamePasswordDiv = false
		}
		//
	}

	public getSignUpUserExist = () => {
		return this.signUpUserExist;
	}

	public setSignUpUserExist = (value) => {
		this.signUpUserExist = value;
		setTimeout(() => {
			this.signUpUserExist = false;
		}, 5000);
	}

	public getSignUpAPIResponse = () => {
		return this.signUpAPIResponse;
	}

	public setSignUpAPIResponse = (value) => {
		this.signUpAPIResponse = value;
		setTimeout(() => {
			this.signUpAPIResponse = false;
		}, 3000);
	}

	public getShowIncorrectUsernamePasswordDiv = () => {
		return this.showIncorrectUsernamePasswordDiv
	}

	public getShowResetPassword200Successful = () => {
		return this.showResetPassword200Successful
	}

	public setShowResetPassword200Successful = (bool: boolean) => {
		//
		if (bool === true) {
			//
			this.showResetPassword200Successful = true
			//
			setTimeout(() => {
				this.showResetPassword200Successful = false
			}, 5000);
			//
		} else {
			this.showResetPassword200Successful = false
		}
		//
	}

	public getShowResetPasswordFail = () => {
		return this.showResetPasswordFail
	}

	public setShowResetPasswordFail = (bool: boolean) => {
		//
		if (bool === true) {
			//
			this.showResetPasswordFail = true
			//
			setTimeout(() => {
				this.showResetPasswordFail = false
			}, 10000);
			//
		} else {
			this.showResetPasswordFail = false
		}
		//
	}
}