import { describe, expect, it } from "vitest";
import { normalizePublicDirectoryResponse } from "../src/lib/publicDirectory";

describe("normalizePublicDirectoryResponse", () => {
  it("normalizes one public-safe API row per consultorio", () => {
    const records = normalizePublicDirectoryResponse({
      professionals: [{
        firstName: " Lucía ",
        lastName: " Fernández ",
        email: " consultorio.preview@example.test ",
        phone: "+54 11 0000-0128",
        address: {
          label: "Consultorio Palermo",
          street: "Avenida Santa Fe 3253",
          locality: "Palermo",
          city: "Ciudad Autónoma de Buenos Aires",
          province: "Ciudad Autónoma de Buenos Aires",
          postalCode: "C1425",
          latitude: -34.58889,
          longitude: -58.41135,
        },
      }],
    });

    expect(records).toEqual([{
      clientKey: "directory-listing-0",
      firstName: "Lucía",
      lastName: "Fernández",
      displayName: "Lucía Fernández",
      email: "consultorio.preview@example.test",
      phone: "+54 11 0000-0128",
      address: {
        label: "Consultorio Palermo",
        street: "Avenida Santa Fe 3253",
        locality: "Palermo",
        city: "Ciudad Autónoma de Buenos Aires",
        province: "Ciudad Autónoma de Buenos Aires",
        postalCode: "C1425",
        formatted: "Avenida Santa Fe 3253 · Palermo, Ciudad Autónoma de Buenos Aires · C1425",
        latitude: -34.58889,
        longitude: -58.41135,
      },
    }]);
  });

  it("uses only the fields present and skips malformed coordinates", () => {
    const records = normalizePublicDirectoryResponse({
      professionals: [
        {
          firstName: "Ana",
          lastName: "Pérez",
          address: { label: "Centro", latitude: -34, longitude: -58 },
        },
        {
          firstName: "Dato",
          lastName: "Inválido",
          address: { latitude: 250, longitude: -58 },
        },
      ],
    });

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      email: "",
      phone: "",
      address: { label: "Centro", formatted: "Centro" },
    });
  });
});
