import { NextResponse } from "next/server";
import { getStripe } from "../../../../lib/stripe";
import { paymentRateLimiter, checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
	// Rate limiting check
	const ip = getClientIp(req);
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
		const stripe = getStripe();

		const session = await stripe.checkout.sessions.create({
			line_items: [
				{
					price: process.env.STRIPE_PRICE_ID!, // <-- reference your created Stripe price
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: `${process.env.SITE_URL}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.SITE_URL}/cancel`,
		});

		return NextResponse.json({ id: session.id }, { status: 200 });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ error: "Failed to create Stripe session" },
			{ status: 500 }
		);
	}
}
