
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

/**
 * Returns a promise that resolves to the Stripe object.
 * This ensures Stripe is only initialized once and handles missing keys gracefully.
 */
export const getStripe = () => {
    if (!stripePromise) {
        const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

        if (!key) {
            console.warn(
                '[STRIPE CLIENT] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined. ' +
                'Stripe features will be disabled. Please add it to your .env file.'
            );
            stripePromise = Promise.resolve(null);
        } else {
            stripePromise = loadStripe(key);
        }
    }
    return stripePromise;
};
