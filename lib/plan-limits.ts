// ============================================
// Plan Definitions
// ============================================
export type Plan = "free" | "pro";

export type PlanLimits = {
  invoicesPerMonth: number;
  watermark: boolean;
  customBrandColor: boolean;
  logoUpload: boolean;
  toolsTabAccess: boolean;
};

export const PLAN_LIMITS: Record<Plan, PlanLimits> = {
  free: {
    invoicesPerMonth: 5,
    watermark: true,
    customBrandColor: false,
    logoUpload: false,
    toolsTabAccess: false,
  },
  pro: {
    invoicesPerMonth: Infinity,
    watermark: false,
    customBrandColor: true,
    logoUpload: true,
    toolsTabAccess: true,
  },
};

// ============================================
// Get limits for a specific plan
// ============================================
export function getPlanLimits(plan: Plan): PlanLimits {
  return PLAN_LIMITS[plan];
}

// ============================================
// Check if user has Pro plan
// ============================================
export function isPro(plan: Plan): boolean {
  return plan === "pro";
}

// ============================================
// Count invoices created in current month
// ============================================
export function countInvoicesThisMonth(
  invoices: { createdAt: number }[],
  referenceTime: number
): number {
  // ⭐ referenceTime = 0 අයි, ඒ කියන්නේ client එකේ තාම set වෙලා නෑ
  if (referenceTime === 0) return 0;
  const now = new Date(referenceTime);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // ⭐ CRITICAL: Count ALL invoices (including soft-deleted)
  // මොකද user කෙනෙක් delete කළත් — creation count එකේ ඒක තියෙන්න ඕන
  return invoices.filter((inv) => inv.createdAt >= monthStart).length;
}

// ============================================
// Get remaining invoices this month
// ============================================
export function getRemainingInvoices(plan: Plan, currentCount: number): number {
  const limit = PLAN_LIMITS[plan].invoicesPerMonth;
  if (limit === Infinity) return Infinity;
  return Math.max(0, limit - currentCount);
}

// ============================================
// Can user create another invoice?
// ============================================
export function canCreateInvoice(plan: Plan, currentCount: number): boolean {
  return currentCount < PLAN_LIMITS[plan].invoicesPerMonth;
}

// ============================================
// Get user-friendly message for limit
// ============================================
export function getLimitMessage(plan: Plan, currentCount: number): string {
  const limit = PLAN_LIMITS[plan].invoicesPerMonth;
  if (limit === Infinity) return "Unlimited invoices";

  const remaining = getRemainingInvoices(plan, currentCount);
  if (remaining === 0) {
    return `You've used all ${limit} invoices this month`;
  }
  return `${currentCount} / ${limit} invoices this month`;
}