// app/api/crypto-charge/route.ts
import { NextResponse } from "next/server";
import axios from "axios";

const COINBASE_API_KEY = process.env.COINBASE_API_KEY;

interface CoinbaseChargeResponse {
	data: {
		code: string;
		name: string;
		pricing_type: string;
		local_price: {
			amount: string;
			currency: string;
		};
		timeline: {
			status: string;
			time: string;
		}[];
		payments: {
			value: {
				local: {
					amount: string;
					currency: string;
				};
			};
			network: string;
			transaction_id: string;
		}[];
	};
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const chargeCode = searchParams.get("code");

	if (!chargeCode) {
		return NextResponse.json({ error: "Missing charge code" }, { status: 400 });
	}

	try {
		const response = await axios.get<CoinbaseChargeResponse>(
			`https://api.commerce.coinbase.com/charges/${chargeCode}`,
			{
				headers: {
					"X-CC-Api-Key": COINBASE_API_KEY,
					"X-CC-Version": "2018-03-22",
				},
			}
		);


		return NextResponse.json(response.data);
	} catch (error) {
		console.error("Error fetching charge details:", error);
		return NextResponse.json(
			{ error: "Failed to fetch transaction details" },
			{ status: 500 }
		);
	}
}
