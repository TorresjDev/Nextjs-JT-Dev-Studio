import { NextResponse } from "next/server";
import { getStripe } from "../../../../lib/stripe";

export async function GET(request: Request) {
	try {
		// Extract session ID from query parameters
		const { searchParams } = new URL(request.url);
		const session_id = searchParams.get('session_id');

		if (!session_id) {
			return NextResponse.json(
				{ error: "Session ID is required" },
				{ status: 400 }
			);
		}

		// Get Stripe instance
		const stripe = getStripe();

		// Retrieve session and customer details
		const session = await stripe.checkout.sessions.retrieve(session_id);

		if (!session.customer || typeof session.customer !== "string") {
			return NextResponse.json(
				{ error: "Invalid customer data" },
				{ status: 400 }
			);
		}

		const customer = await stripe.customers.retrieve(session.customer);

		// Return a simple HTML response
		return new Response(
			`
      <html>
        <body>
          <h1>Thanks for your order, ${"name" in customer ? customer.name : "Customer"
			}!</h1>
        </body>
      </html>
      `,
			{
				headers: { "Content-Type": "text/html" },
				status: 200,
			}
		);
	} catch (error) {
		console.error("Error retrieving order:", error);
		return NextResponse.json(
			{ error: "Internal Server Error" },
			{ status: 500 }
		);
	}
}
