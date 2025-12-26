import { NextResponse } from "next/server";
import axios, { AxiosResponse } from "axios";
import { z } from "zod";
import { paymentRateLimiter, checkRateLimit, getClientIp } from "@/lib/rate-limit";

// Validate environment variable exists
const COINBASE_API_KEY = process.env.COINBASE_API_KEY;

if (!COINBASE_API_KEY) {
	console.error("COINBASE_API_KEY is not defined in environment variables");
}

// Validation schema for donation request
const donationSchema = z.object({
	amount: z
		.number({ message: "Amount must be a number" })
		.positive("Amount must be positive")
		.min(1, "Minimum donation is $1")
		.max(10000, "Maximum donation is $10,000"),
});

interface CoinbaseResponse {
	data: {
		code: string;
		hosted_url: string;
	};
}

export async function POST(request: Request) {
	// Rate limiting check
	const ip = getClientIp(request);
	const { success, remaining } = await checkRateLimit(paymentRateLimiter, ip);

	if (!success) {
		return NextResponse.json(
			{ error: "Too many requests. Please try again later." },
			{
				status: 429,
				headers: {
					'Retry-After': '60',
					'X-RateLimit-Remaining': String(remaining ?? 0),
				}
			}
		);
	}

	try {
		// Check if API key is available
		if (!COINBASE_API_KEY) {
			console.error("Missing COINBASE_API_KEY environment variable");
			return NextResponse.json(
				{ error: "Coinbase API configuration error" },
				{ status: 500 }
			);
		}

		// Parse and validate request body
		const body = await request.json();
		const validation = donationSchema.safeParse(body);

		if (!validation.success) {
			return NextResponse.json(
				{
					error: "Invalid donation amount",
					details: validation.error.flatten().fieldErrors
				},
				{ status: 400 }
			);
		}

		const { amount } = validation.data;

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
