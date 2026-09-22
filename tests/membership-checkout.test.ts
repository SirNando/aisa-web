import { describe, expect, it } from "vitest";
import {
  formatCuit,
  isPublicMembershipPlans,
  isValidCuit,
  normalizeCuit,
} from "../src/lib/membershipCheckout";

describe("membership checkout client rules", () => {
  it("normalizes, formats, and validates CUIT/CUIL", () => {
    expect(normalizeCuit("20-12345678-6")).toBe("20123456786");
    expect(formatCuit("20123456786")).toBe("20-12345678-6");
    expect(isValidCuit("20-12345678-6")).toBe(true);
    expect(isValidCuit("20-12345678-3")).toBe(false);
  });

  it("accepts any público plan the platform publishes, identified by its ID", () => {
    const valid = {
      currency: "ARS",
      turnstileRequired: true,
      turnstileSiteKey: "site-key",
      plans: [
        { id: "monthly", label: "Mensual", description: "Mensual", billingKind: "recurring", periodMonths: 1, amountCents: 12000 },
        { id: "plan-trimestral", label: "Trimestral", description: "Cada 3 meses", billingKind: "recurring", periodMonths: 3, amountCents: 33000 },
      ],
    };
    expect(isPublicMembershipPlans(valid)).toBe(true);
    expect(isPublicMembershipPlans({ ...valid, plans: [] })).toBe(true);
    expect(isPublicMembershipPlans({ ...valid, plans: [valid.plans[0], valid.plans[0]] })).toBe(false);
    expect(isPublicMembershipPlans({ ...valid, plans: [{ ...valid.plans[0], amountCents: 0 }] })).toBe(false);
    expect(isPublicMembershipPlans({ ...valid, plans: [{ ...valid.plans[0], id: "" }] })).toBe(false);
    expect(isPublicMembershipPlans({ ...valid, plans: [{ ...valid.plans[0], id: "p".repeat(121) }] })).toBe(false);
    expect(isPublicMembershipPlans({ ...valid, plans: [{ ...valid.plans[0], billingKind: "weekly" }] })).toBe(false);
    expect(isPublicMembershipPlans({ ...valid, plans: [{ ...valid.plans[0], periodMonths: 0 }] })).toBe(false);
    expect(isPublicMembershipPlans({
      ...valid,
      plans: [{ code: "monthly", label: "Mensual", description: "Mensual", amountCents: 12000 }],
    })).toBe(false);
    expect(isPublicMembershipPlans({ ...valid, currency: "USD" })).toBe(false);
    expect(isPublicMembershipPlans({ ...valid, turnstileRequired: false, turnstileSiteKey: null })).toBe(true);
    expect(isPublicMembershipPlans({ ...valid, turnstileRequired: true, turnstileSiteKey: null })).toBe(false);
    expect(isPublicMembershipPlans({ ...valid, turnstileRequired: false, turnstileSiteKey: "site-key" })).toBe(false);
  });
});
