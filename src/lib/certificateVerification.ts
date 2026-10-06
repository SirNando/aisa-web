type UnknownRecord = Record<string, unknown>;

/** What the verification page shows of a Certificado, ready to render. */
export interface CertificateVerificationView {
  fullName: string;
  levelLabel: string;
  /** Empty when the platform has no Número de socio to show. */
  memberNumber: string;
  generatedOn: string;
  validUntil: string;
  /** Computed live by the platform: false while the Certificación is not activa. */
  valid: boolean;
}

/** The platform issues base64url tokens of 256 random bits; nothing else can exist. */
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{22,128}$/u;
const VERIFY_PATH_PATTERN = /^\/verificar\/([^/]+)\/?$/u;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/u;
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const textValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

/** The token of a `/verificar/<token>` path (the QR on the Certificado), or null. */
export const verificationTokenFromPath = (pathname: string) => {
  const token = VERIFY_PATH_PATTERN.exec(pathname)?.[1] ?? "";
  return TOKEN_PATTERN.test(token) ? token : null;
};

export const certificateVerificationUrl = (apiUrl: string, token: string) =>
  `${apiUrl}/api/public/certificates/${encodeURIComponent(token)}`;

/** «6 de octubre de 2026» from `2026-10-06`, without a time zone that could shift the day. */
export const formatVerificationDate = (value: unknown) => {
  const match = ISO_DATE_PATTERN.exec(textValue(value));
  if (!match) return null;
  const [, year, month, day] = match;
  const monthName = MONTHS[Number(month) - 1];
  const dayNumber = Number(day);
  if (!monthName || dayNumber < 1 || dayNumber > 31) return null;
  return `${dayNumber} de ${monthName} de ${year}`;
};

/** The platform's `{ certificate }` answer, or null when it is not a verification. */
export const parseCertificateVerification = (payload: unknown): CertificateVerificationView | null => {
  if (!isRecord(payload) || !isRecord(payload.certificate)) return null;
  const certificate = payload.certificate;
  const firstName = textValue(certificate.firstName);
  const lastName = textValue(certificate.lastName);
  const level = certificate.level;
  const generatedOn = formatVerificationDate(certificate.generatedOn);
  const validUntil = formatVerificationDate(certificate.validUntil);
  const memberNumber = certificate.memberNumber;
  if (!firstName || !lastName || !generatedOn || !validUntil) return null;
  if (level !== 3 && level !== 4) return null;
  if (certificate.status !== "valid" && certificate.status !== "invalid") return null;
  return {
    fullName: `${firstName} ${lastName}`,
    levelLabel: `Nivel ${level}`,
    memberNumber: typeof memberNumber === "number" && Number.isInteger(memberNumber) ? String(memberNumber) : "",
    generatedOn,
    validUntil,
    valid: certificate.status === "valid",
  };
};
