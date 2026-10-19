import { Webhooks } from "@dodopayments/nextjs";
import { createServiceClient } from "@/lib/supabase/service";

// ============================================
// Helper: Safely extract customer email from payload
// ============================================
function getCustomerEmail(payload: Record<string, unknown>): string | undefined {
  const data = payload.data as Record<string, unknown> | undefined;
  if (!data) return undefined;

  // Path 1: data.customer.email
  if (data.customer && typeof data.customer === "object") {
    const customer = data.customer as Record<string, unknown>;
    if (typeof customer.email === "string") {
      return customer.email;
    }
  }

  // Path 2: data.customer_email
  if (typeof data.customer_email === "string") {
    return data.customer_email;
  }

  return undefined;
}

// ============================================
// Webhook Handler
// ============================================
export const POST = Webhooks({
  webhookKey: process.env.DODO_PAYMENTS_WEBHOOK_SECRET!,
  onPayload: async (payload) => {
    console.log("🔔 Webhook received:", payload.type);

    const customerEmail = getCustomerEmail(
      payload as unknown as Record<string, unknown>
    );

    if (!customerEmail) {
      console.error("❌ Could not find customer email in payload");
      console.error("Payload keys:", Object.keys(payload.data || {}));
      return;
    }

    const supabase = createServiceClient();
    const eventType = payload.type;

    // 🟢 UPGRADE EVENTS (Pro)
    if (
      eventType === "payment.succeeded" ||
      eventType === "subscription.active"
    ) {
      console.log(`👤 Upgrading user: ${customerEmail}`);

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
      return;
    }

    // 🔴 DOWNGRADE EVENTS (Free)
    // Triggers when: subscription cancelled, expired, or payment refunded
    if (
      eventType === "subscription.cancelled" ||
      eventType === "subscription.expired" ||
      eventType === "refund.succeeded"
    ) {
      console.log(`🔴 Downgrading user: ${customerEmail} (${eventType})`);

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
      return;
    }

    // ⚪ IGNORE OTHER EVENTS
    console.log(`ℹ️ Ignoring event type: ${eventType}`);
  },
});