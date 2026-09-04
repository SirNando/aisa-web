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

  it("accepts only both configured ARS plans with positive integer amounts", () => {
    const valid = {
      currency: "ARS",
      turnstileSiteKey: "site-key",
      plans: [
        { code: "monthly", label: "Mensual", description: "Mensual", amountCents: 12000 },
        { code: "six_month", label: "Seis meses", description: "Semestral", amountCents: 60000 },
      ],
    };
    expect(isPublicMembershipPlans(valid)).toBe(true);
    expect(isPublicMembershipPlans({ ...valid, plans: [valid.plans[0], valid.plans[0]] })).toBe(false);
    expect(isPublicMembershipPlans({ ...valid, plans: [{ ...valid.plans[0], amountCents: 0 }, valid.plans[1]] })).toBe(false);
    expect(isPublicMembershipPlans({ ...valid, currency: "USD" })).toBe(false);
  });
});
