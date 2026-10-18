import { Webhooks } from "@dodopayments/nextjs";
import { createServiceClient } from "@/lib/supabase/service";

export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log("🔔 Webhook received:", payload.type);
    console.log("📦 Full payload:", JSON.stringify(payload, null, 2));

    // Handle payment success events
    const eventType = payload.type;
    
    // 🔴 Handle cancellations (downgrade to free)
    if (
      eventType === "subscription.cancelled" ||
      eventType === "subscription.expired"
    ) {
      console.log(`🔴 Subscription cancelled/expired, downgrading user`);

      const data = payload.data as Record<string, unknown>;
      let customerEmail: string | undefined;
      
      if (data?.customer && typeof data.customer === "object") {
        const customer = data.customer as Record<string, unknown>;
        if (typeof customer.email === "string") {
          customerEmail = customer.email;
        }
      }
      
      if (!customerEmail && typeof data?.customer_email === "string") {
        customerEmail = data.customer_email;
      }

      if (!customerEmail) {
        console.error("❌ Could not find customer email in cancel payload");
        return;
      }

      console.log(`👤 Downgrading user: ${customerEmail}`);

      const supabase = createServiceClient();
      const { error } = await supabase
        .from("companies")
        .update({
          plan: "free",
          pro_since: null,
        })
        .eq("email", customerEmail);

      if (error) {
        console.error("❌ Failed to downgrade user:", error);
        throw new Error("Failed to downgrade user plan");
      }

      console.log(`✅ User downgraded to Free: ${customerEmail}`);
      return; // ⭐ වැදගත්: මේකෙන් පස්සේ අනිත් code එක run වෙන්නේ නෑ
    }

    // 🟢 Handle successful payments (upgrade to pro)
    if (
      eventType === "payment.succeeded" ||
      eventType === "subscription.active"
    ) {
      // Try to extract email from various possible locations
      const data = payload.data as Record<string, unknown>;
      
      let customerEmail: string | undefined;
      
      // Try different paths (Dodo payload structure varies)
      if (data?.customer && typeof data.customer === "object") {
        const customer = data.customer as Record<string, unknown>;
        if (typeof customer.email === "string") {
          customerEmail = customer.email;
        }
      }
      
      // Fallback: try nested paths
      if (!customerEmail && typeof data?.customer_email === "string") {
        customerEmail = data.customer_email;
      }
      
      if (!customerEmail) {
        console.error("❌ Could not find customer email in payload");
        console.error("Payload keys:", Object.keys(data || {}));
        return;
      }

      console.log(`👤 Upgrading user: ${customerEmail}`);

      const supabase = createServiceClient();

      const { error } = await supabase
        .from("companies")
        .update({
          plan: "pro",
          pro_since: new Date().toISOString(),
        })
        .eq("email", customerEmail);

      if (error) {
        console.error("❌ Failed to upgrade user:", error);
        throw new Error("Failed to update user plan in database");
      }

      console.log(`✅ User upgraded to Pro: ${customerEmail}`);
    } else {
      console.log(`ℹ️ Ignoring event type: ${eventType}`);
    }
  },
});