import { NextResponse } from "next/server";
import axios, { AxiosResponse } from "axios";

// Validate environment variable exists
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;

if (!COINBASE_API_KEY) {
	console.error("COINBASE_API_KEY is not defined in environment variables");
}

interface CoinbaseResponse {
	data: {
		code: string;
		hosted_url: string;
	};
}

export async function POST(request: Request) {
	try {
		// Check if API key is available
		if (!COINBASE_API_KEY) {
			console.error("Missing COINBASE_API_KEY environment variable");
			return NextResponse.json(
				{ error: "Coinbase API configuration error" },
				{ status: 500 }
			);
		}

		const { amount } = await request.json();

		console.log(
			"Creating Coinbase charge with API key:",
			COINBASE_API_KEY ? "***PRESENT***" : "MISSING"
		);

		// Create the charge using Coinbase Commerce API
		const response: AxiosResponse<CoinbaseResponse> = await axios.post(
			"https://api.commerce.coinbase.com/charges",
			{
				name: "Support My Journey",
				description: "A contribution to support my development projects.",
				pricing_type: "fixed_price",
				local_price: {
					amount: amount,
					currency: "USD",
				},
				redirect_url: `${request.headers.get(
					"origin"
				)}/thank-you?method=crypto&amount=${amount}`,
				cancel_url: `${request.headers.get("origin")}`,
			},
			{
				headers: {
					"Content-Type": "application/json",
					"X-CC-Api-Key": COINBASE_API_KEY,
					"X-CC-Version": "2018-03-22",
				},
			}
		);

		// Return the hosted payment page URL
		return NextResponse.json({ hosted_url: response.data.data.hosted_url });
	} catch (error) {
		console.error("Error creating crypto charge:", error);
		return NextResponse.json(
			{ error: "Failed to create crypto donation charge" },
			{ status: 500 }
		);
	}
}
