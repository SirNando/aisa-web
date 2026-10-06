import { describe, expect, it } from "vitest";
import {
  certificateVerificationUrl,
  formatVerificationDate,
  parseCertificateVerification,
  verificationTokenFromPath,
} from "../src/lib/certificateVerification";

const TOKEN = "Ab3_-xYz".repeat(5) + "abc";

describe("certificate verification client rules", () => {
  it("reads the token from /verificar/<token>, with or without a trailing slash", () => {
    expect(verificationTokenFromPath(`/verificar/${TOKEN}`)).toBe(TOKEN);
    expect(verificationTokenFromPath(`/verificar/${TOKEN}/`)).toBe(TOKEN);
  });

  it("rejects paths that cannot carry a verification token", () => {
    expect(verificationTokenFromPath("/verificar/")).toBeNull();
    expect(verificationTokenFromPath("/verificar-certificado/")).toBeNull();
    expect(verificationTokenFromPath("/verificar/short")).toBeNull();
    expect(verificationTokenFromPath(`/verificar/${TOKEN}/extra`)).toBeNull();
    expect(verificationTokenFromPath(`/verificar/${TOKEN.slice(0, 30)}%2F..`)).toBeNull();
  });

  it("builds the platform endpoint for a token", () => {
    expect(certificateVerificationUrl("https://plataforma.example", TOKEN)).toBe(
      `https://plataforma.example/api/public/certificates/${TOKEN}`,
    );
  });

  it("accepts exactly the public verification the platform answers", () => {
    const certificate = {
      firstName: "Cecilia",
      lastName: "Capurro",
      level: 4,
      memberNumber: 1842,
      generatedOn: "2026-10-06",
      validUntil: "2026-11-04",
      status: "valid",
    };
    expect(parseCertificateVerification({ certificate })).toEqual({
      fullName: "Cecilia Capurro",
      levelLabel: "Nivel 4",
      memberNumber: "1842",
      generatedOn: "6 de octubre de 2026",
      validUntil: "4 de noviembre de 2026",
      valid: true,
    });
    expect(parseCertificateVerification({ certificate: { ...certificate, status: "invalid", memberNumber: null } })).toMatchObject({
      memberNumber: "",
      valid: false,
    });
  });

  it("refuses a malformed verification", () => {
    const certificate = {
      firstName: "Cecilia",
      lastName: "Capurro",
      level: 3,
      memberNumber: 1842,
      generatedOn: "2026-10-06",
      validUntil: "2026-11-04",
      status: "valid",
    };
    expect(parseCertificateVerification(null)).toBeNull();
    expect(parseCertificateVerification({})).toBeNull();
    expect(parseCertificateVerification({ certificate: { ...certificate, level: 2 } })).toBeNull();
    expect(parseCertificateVerification({ certificate: { ...certificate, status: "expired" } })).toBeNull();
    expect(parseCertificateVerification({ certificate: { ...certificate, firstName: " " } })).toBeNull();
    expect(parseCertificateVerification({ certificate: { ...certificate, validUntil: "04/11/2026" } })).toBeNull();
  });

  it("formats ISO dates in es-AR without shifting the day", () => {
    expect(formatVerificationDate("2026-01-01")).toBe("1 de enero de 2026");
    expect(formatVerificationDate("2026-12-31")).toBe("31 de diciembre de 2026");
    expect(formatVerificationDate("2026-13-01")).toBeNull();
  });
});
