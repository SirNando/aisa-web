import { describe, expect, it } from "vitest";
import {
  distanceInKilometres,
  findNearestListing,
  matchesDirectoryListing,
  normalizeFilterText,
  sortDirectoryListingsByDistance,
} from "../src/lib/directoryFilters";
import type { PublicDirectoryListing } from "../src/lib/publicDirectory";

const listing = (
  clientKey: string,
  displayName: string,
  locality: string,
  province: string,
  latitude: number,
  longitude: number,
): PublicDirectoryListing => ({
  clientKey,
  firstName: displayName.split(" ")[0] ?? displayName,
  lastName: displayName.split(" ").slice(1).join(" "),
  displayName,
  email: "",
  phone: "",
  certificationLevel: 3,
  certificationLabel: "Nivel 3",
  address: {
    label: `Consultorio ${locality}`,
    street: "",
    floor: "",
    apartment: "",
    locality,
    city: locality,
    province,
    postalCode: "",
    formatted: `${locality} · ${province}`,
    latitude,
    longitude,
  },
});

const records = [
  listing("cordoba", "Ana Pérez", "Córdoba", "Córdoba", -31.417, -64.183),
  listing("palermo", "Beatriz Gómez", "Palermo", "CABA", -34.58, -58.42),
  listing("recoleta", "Carla Díaz", "Recoleta", "CABA", -34.59, -58.4),
];

const emptyFilters = { query: "", province: "", locality: "" };

describe("directory filters", () => {
  it("normalizes case and Spanish accents", () => {
    expect(normalizeFilterText("  CÓRDOBA  ")).toBe("cordoba");
  });

  it("matches names and address components", () => {
    expect(matchesDirectoryListing(records[0], { ...emptyFilters, query: "cordoba" })).toBe(true);
    expect(matchesDirectoryListing(records[1], { ...emptyFilters, query: "beatriz" })).toBe(true);
    expect(matchesDirectoryListing(records[1], { ...emptyFilters, province: "Córdoba" })).toBe(false);
    expect(matchesDirectoryListing(records[2], { ...emptyFilters, locality: "Recoleta" })).toBe(true);
  });
});

describe("location helpers", () => {
  it("returns zero kilometres for identical coordinates", () => {
    expect(distanceInKilometres(
      { latitude: -31.417, longitude: -64.183 },
      { latitude: -31.417, longitude: -64.183 },
    )).toBe(0);
  });

  it("finds and sorts the nearest consultorio", () => {
    const origin = { latitude: -34.588, longitude: -58.405 };
    expect(findNearestListing(records, origin)?.clientKey).toBe("recoleta");
    expect(sortDirectoryListingsByDistance(records, origin).map((item) => item.clientKey)).toEqual([
      "recoleta",
      "palermo",
      "cordoba",
    ]);
  });
});
