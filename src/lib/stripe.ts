import "server-only";

import Stripe from "stripe";

let stripe: Stripe;

// Lazy initialization - only create Stripe instance when needed
export const getStripe = () => {
	if (!stripe) {
		const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

		if (!stripeSecretKey) {
			throw new Error(
				"STRIPE_SECRET_KEY is not defined. Please check your environment variables."
			);
		}

		stripe = new Stripe(stripeSecretKey, {
			apiVersion: "2025-08-27.basil",
		});
	}

	return stripe;
};

// Keep the old export for backward compatibility
export { getStripe as stripe };
