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

export type MembershipDocumentType = "cuit_cuil" | "national_id" | "passport";

/** ISO 3166-1 alpha-2 codes; the platform (aisa-plataforma, ADR-0006) accepts exactly these. */
const COUNTRY_CODES = (
  "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ "
  + "CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR "
  + "GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP "
  + "KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT "
  + "MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW "
  + "SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG "
  + "UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW"
).split(" ");

const regionNames = new Intl.DisplayNames(["es-AR"], { type: "region" });

export function countryName(code: string) {
  return regionNames.of(code) ?? code;
}

const collator = new Intl.Collator("es-AR");

/** Argentina first, then Spanish alphabetical order. */
export const MEMBERSHIP_COUNTRY_CODES: readonly string[] = [...COUNTRY_CODES].sort((a, b) =>
  a === "AR" ? -1 : b === "AR" ? 1 : collator.compare(countryName(a), countryName(b)),
);

/** What the Formulario asks as the Documento de identidad for a País de residencia. */
export function documentFieldFor(residenceCountry: string) {
  return residenceCountry === "AR"
    ? {
        fixedType: "cuit_cuil" as const,
        label: "CUIL/CUIT",
        help: "Ingresá los 11 dígitos de tu CUIL o CUIT.",
        placeholder: "20-12345678-3",
        inputMode: "numeric" as const,
      }
    : {
        fixedType: null,
        label: "Número de documento",
        help: "Ingresá el número del documento o pasaporte de tu país de residencia.",
        placeholder: "",
        inputMode: "text" as const,
      };
}

export type MembershipDocumentResult =
  | { ok: true; residenceCountry: string; documentType: MembershipDocumentType; documentNumber: string }
  | { ok: false; message: string };

/** Mirrors the platform's validation so most mistakes are caught before the request. */
export function parseMembershipDocument(input: {
  residenceCountry: string;
  documentType: string;
  documentNumber: string;
}): MembershipDocumentResult {
  const residenceCountry = input.residenceCountry.trim().toUpperCase();
  if (!COUNTRY_CODES.includes(residenceCountry)) return { ok: false, message: "Elegí tu país de residencia." };
  if (residenceCountry === "AR") {
    if (input.documentType !== "cuit_cuil" || !isValidCuit(input.documentNumber)) {
      return { ok: false, message: "Ingresá un CUIL/CUIT válido." };
    }
    return { ok: true, residenceCountry, documentType: "cuit_cuil", documentNumber: normalizeCuit(input.documentNumber) };
  }
  if (input.documentType !== "national_id" && input.documentType !== "passport") {
    return { ok: false, message: "Elegí el tipo de documento." };
  }
  const documentNumber = input.documentNumber.toUpperCase().replace(/[^A-Z0-9]/gu, "");
  if (!/^[A-Z0-9]{4,20}$/u.test(documentNumber)) {
    return { ok: false, message: "El número de documento debe tener entre 4 y 20 letras o dígitos." };
  }
  return { ok: true, residenceCountry, documentType: input.documentType, documentNumber };
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
