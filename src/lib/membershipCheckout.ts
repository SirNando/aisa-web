export type PublicMembershipPlan = {
  id: string;
  label: string;
  description: string;
  billingKind: "one_time" | "recurring";
  periodMonths: number;
  amountCents: number;
};

export type PublicMembershipPlans = {
  currency: "ARS";
  plans: PublicMembershipPlan[];
  turnstileRequired: boolean;
  turnstileSiteKey: string | null;
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
  if (
    candidate.currency !== "ARS"
    || typeof candidate.turnstileRequired !== "boolean"
    || (candidate.turnstileRequired
      ? typeof candidate.turnstileSiteKey !== "string" || !candidate.turnstileSiteKey
      : candidate.turnstileSiteKey !== null)
  ) {
    return false;
  }
  if (!Array.isArray(candidate.plans) || candidate.plans.length > 100) return false;
  const ids = new Set<string>();
  for (const plan of candidate.plans) {
    if (
      plan === null
      || typeof plan !== "object"
      || typeof plan.id !== "string"
      || !plan.id
      || plan.id.length > 120
      || ids.has(plan.id)
      || !["one_time", "recurring"].includes(plan.billingKind)
      || !Number.isSafeInteger(plan.periodMonths)
      || plan.periodMonths < 1
      || typeof plan.label !== "string"
      || !plan.label
      || typeof plan.description !== "string"
      || !Number.isSafeInteger(plan.amountCents)
      || plan.amountCents <= 0
    ) return false;
    ids.add(plan.id);
  }
  return true;
}
