import { Webhooks } from "@dodopayments/nextjs";
import { createClient } from "@/lib/supabase/server";

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log("Webhook received:", payload.type);

    // Only handle subscription payment success
    if (payload.type === "subscription.payment_succeeded") {
      const customerEmail = payload.data.customer.email;
      
      if (!customerEmail) {
        console.error("No customer email in payload");
        return;
      }

      const supabase = await createClient();

      // Find user by email and upgrade to Pro
      const { error } = await supabase
        .from("companies")
        .update({
          plan: "pro",
          pro_since: new Date().toISOString(),
        })
        .eq("email", customerEmail);

      if (error) {
        console.error("Failed to upgrade user:", error);
        throw new Error("Failed to update user plan in database");
      }

      console.log(`✅ User upgraded to Pro: ${customerEmail}`);
    }
  },
});