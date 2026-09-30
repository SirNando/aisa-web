import { describe, expect, it } from "vitest";
import {
  MEMBERSHIP_COUNTRY_CODES,
  countryName,
  documentFieldFor,
  formatCuit,
  isPublicMembershipPlans,
  isValidCuit,
  normalizeCuit,
  parseMembershipDocument,
  parseMembershipProfile,
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

  it("asks residents of Argentina for the CUIL/CUIT and everyone else for a national document or passport", () => {
    expect(documentFieldFor("AR")).toMatchObject({ fixedType: "cuit_cuil", label: "CUIL/CUIT" });
    expect(documentFieldFor("CL")).toMatchObject({ fixedType: null, label: "Número de documento" });
  });

  it("validates the Documento de identidad by País de residencia like the platform does", () => {
    expect(parseMembershipDocument({ residenceCountry: "AR", documentType: "cuit_cuil", documentNumber: "20-12345678-6" }))
      .toEqual({ ok: true, residenceCountry: "AR", documentType: "cuit_cuil", documentNumber: "20123456786" });
    expect(parseMembershipDocument({ residenceCountry: "AR", documentType: "cuit_cuil", documentNumber: "20-12345678-3" }).ok).toBe(false);
    expect(parseMembershipDocument({ residenceCountry: "CL", documentType: "national_id", documentNumber: "12.345.678-k" }))
      .toEqual({ ok: true, residenceCountry: "CL", documentType: "national_id", documentNumber: "12345678K" });
    expect(parseMembershipDocument({ residenceCountry: "CL", documentType: "passport", documentNumber: "123" }).ok).toBe(false);
    expect(parseMembershipDocument({ residenceCountry: "CL", documentType: "cuit_cuil", documentNumber: "20123456786" }).ok).toBe(false);
    expect(parseMembershipDocument({ residenceCountry: "ZZ", documentType: "passport", documentNumber: "C123456" }).ok).toBe(false);
  });

  it("lists the countries with Argentina first, in Spanish", () => {
    expect(MEMBERSHIP_COUNTRY_CODES[0]).toBe("AR");
    expect(MEMBERSHIP_COUNTRY_CODES).toContain("CL");
    expect(countryName("CL")).toBe("Chile");
  });
});

const applicant = { mobile: "+54 9 11 5555-1234", nationality: "AR", profession: "Licenciatura en Terapia Ocupacional", university: "Universidad de Buenos Aires", postgraduateStudies: "" };
describe("Formulario private personal and academic fields", () => {
  it.each(["mobile", "nationality", "profession", "university"])("identifies missing %s before requesting payment", (field) => {
    expect(parseMembershipProfile({ ...applicant, [field]: " " })).toMatchObject({ ok: false, field });
  });
});
