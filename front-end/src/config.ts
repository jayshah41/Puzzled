declare let process: any;

export const config = {
	environment: process.env.NODE_ENV || "production",
	production_url: 'https://backend-elk.makcorp.net.au',
	dev_url: "http://localhost:8081",
	stripe: {
		frontend: {
			public_key_production: "pk_live_KacjDYpl1ElEnpo2yu9J1y6b",
			public_key_development: "pk_test_TIXCzPVxYRGvbBw44v1Pz05N"
		}
	}
}
