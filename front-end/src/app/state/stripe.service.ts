import { config } from "../../config"

// A reference to Stripe.js initialized with your real test publishable API key.
var stripe;
if (config.environment === "production") {
	///@ts-ignore
	stripe = Stripe(config.stripe.frontend.public_key_production);
} else {
	// console.log("development")
	///@ts-ignore
	stripe = Stripe(config.stripe.frontend.public_key_development);
	// console.log("########",config.stripe.frontend.public_key_development)
}

const style = {
	base: {
		color: "#32325d",
		fontFamily: 'Arial, sans-serif',
		fontSmoothing: "antialiased",
		fontSize: "16px",
		"::placeholder": {
			color: "#32325d"
		}
	},
	invalid: {
		fontFamily: 'Arial, sans-serif',
		color: "#fa755a",
		iconColor: "#fa755a"
	}
};

export default class StripeService {
	private loadingFlag = false
	private showPaymentComponent = false
	private clientSecret = ""
	private paymentId = ""
	private card;
	private packageId;
	private amount = 0;

	public getAmount = () => {
		return this.amount
	}

	public setPackageId = (newPackageId: string) => {
		this.packageId = newPackageId
	}

	public getPackageId = () => {
		return this.packageId
	}

	public getPaymentId = () => {
		return this.paymentId
	}

	public setLoading(newValue: boolean) {
		this.loadingFlag = newValue
	}

	public getLoading() {
		return this.loadingFlag
	}

	public setShowPaymentComponent(newValue: boolean) {
		this.showPaymentComponent = newValue
	}

	public getShowPaymentComponent() {
		return this.showPaymentComponent
	}

	// Calls stripe.confirmCardPayment
	// If the card requires authentication Stripe shows a pop-up modal to
	// prompt the user to enter authentication details without leaving your page.
	public payWithCard = async (stripe, card, clientSecret) => {
		let _this = this
		this.loading(true);
		const stripeResult = await stripe
			.confirmCardPayment(clientSecret, {
				payment_method: {
					card: card
				}
			})
		console.log("stripeResult", stripeResult)
		if (stripeResult.error) {
			// .then(function (result) {
			// if (result.error) {
			// Show error to your customer
			_this.showError(stripeResult.error.message);
		} else {
			// The payment succeeded!
			// this.orderComplete(result.paymentIntent.id);
			_this.loading(false)
			_this.paymentId = stripeResult.paymentIntent.id
		}

		return stripeResult;
	};


	// Show the customer the error from Stripe if their card fails to charge
	public showError = (errorMsgText) => {
		this.loading(false);
		var errorMsg = document.querySelector("#card-error");
		errorMsg.textContent = errorMsgText;
		setTimeout(function () {
			errorMsg.textContent = "";
		}, 4000);
	}

	// Show a spinner on payment submission
	public loading = (isLoading) => {
		if (isLoading) {
			// Disable the button and show a spinner
			document.querySelector("button").disabled = true;
			document.querySelector("#spinner").classList.remove("hidden");
			document.querySelector("#button-text").classList.add("hidden");
		} else {
			document.querySelector("button").disabled = false;
			document.querySelector("#spinner").classList.add("hidden");
			document.querySelector("#button-text").classList.remove("hidden");
		}
	}

	public formSubmitted = async (event: any) => {
		event.preventDefault();
		// Complete payment when the submit button is clicked
		let result = await this.payWithCard(stripe, this.card, this.clientSecret);
		return result;
	}

	public createPaymentIntent(packageId: string, amount: number, email: string) {
		this.packageId = packageId
		console.log({ amount })
		this.amount = amount
		var _this = this
		const url = config.environment === "production" ? "https://backend-elk.makcorp.net.au/create-payment-intent" : "http://localhost:8081/create-payment-intent"
		fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ amount: amount, email: email, paymentId: this.paymentId })

		}).then(function (result) {
			_this.showPaymentComponent = true
			return result.json();
			console.log("after payment", result.json())
		})
			.then(function (data) {
				var elements = stripe.elements();
				_this.paymentId = data.paymentId
				_this.clientSecret = data.clientSecret
				_this.card = elements.create("card", { style: style });
				// Stripe injects an iframe into the DOM
				_this.card.mount("#card-element");
				_this.card.on("change", function (event) {
					// Disable the Pay button if there are no card details in the Element
					document.querySelector("button").disabled = event.empty;
					document.querySelector("#card-error").textContent = event.error ? event.error.message : "";
				});
				// var form = document.getElementById("payment-form");
				// form.addEventListener("submit", function (event) {
				// 	event.preventDefault();
				// Complete payment when the submit button is clicked
				// payWithCard(stripe, card, data.clientSecret);
				// });
			});
	}
}