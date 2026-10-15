import { Checkout } from "@dodopayments/nextjs";

export const POST = Checkout({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/app?payment=success`,
  environment: process.env.DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode",
  type: "session",
});