export type MembershipPlanCode = "monthly" | "six_month";

export type PublicMembershipPlan = {
  code: MembershipPlanCode;
  label: string;
  description: string;
  amountCents: number;
};

export type PublicMembershipPlans = {
  currency: "ARS";
  plans: PublicMembershipPlan[];
  turnstileSiteKey: string;
};

export function normalizeCuit(value: string) {
  return value.replace(/\D/gu, "");
}

export function isValidCuit(value: string) {
  const normalized = normalizeCuit(value);
  if (!/^\d{11}$/u.test(normalized)) return false;
  const weights = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  const sum = weights.reduce(
    (total, weight, index) => total + Number(normalized[index]) * weight,
    0,
  );
  const remainder = 11 - (sum % 11);
  const checkDigit = remainder === 11 ? 0 : remainder === 10 ? 9 : remainder;
  return checkDigit === Number(normalized[10]);
}

export function formatCuit(value: string) {
  const digits = normalizeCuit(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 10) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
}

export function isPublicMembershipPlans(value: unknown): value is PublicMembershipPlans {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Partial<PublicMembershipPlans>;
  if (candidate.currency !== "ARS" || typeof candidate.turnstileSiteKey !== "string" || !candidate.turnstileSiteKey) {
    return false;
  }
  if (!Array.isArray(candidate.plans) || candidate.plans.length !== 2) return false;
  const codes = new Set<MembershipPlanCode>();
  for (const plan of candidate.plans) {
    if (
      plan === null
      || typeof plan !== "object"
      || !["monthly", "six_month"].includes(plan.code)
      || typeof plan.label !== "string"
      || !plan.label
      || typeof plan.description !== "string"
      || !Number.isSafeInteger(plan.amountCents)
      || plan.amountCents <= 0
    ) return false;
    codes.add(plan.code);
  }
  return codes.size === 2;
}
