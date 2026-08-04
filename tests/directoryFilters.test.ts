import { describe, expect, it } from "vitest";
import { professionals } from "../src/data/professionals";
import {
  distanceInKilometres,
  filterProfessionals,
  findNearestOffice,
  findNearestProfessional,
  matchesProfessional,
  normalizeFilterText,
  sortProfessionalsByDistance,
} from "../src/lib/directoryFilters";

const emptyFilters = {
  query: "",
  province: "",
  locality: "",
  certificationStatus: "",
  careMode: "",
  equipped: false,
};

describe("normalizeFilterText", () => {
  it("normalizes case and Spanish accents", () => {
    expect(normalizeFilterText("  CÓRDOBA  ")).toBe("cordoba");
    expect(normalizeFilterText("RÍO NEGRO")).toBe("rio negro");
  });
});

describe("matchesProfessional", () => {
  it("matches accented localities with an unaccented query", () => {
    expect(
      matchesProfessional(professionals[2], {
        ...emptyFilters,
        query: "cordoba",
      }),
    ).toBe(true);
  });

  it("matches an individual status", () => {
    const matches = filterProfessionals(professionals, {
      ...emptyFilters,
      certificationStatus: "complete",
    });
    expect(matches).toHaveLength(6);
  });

  it("matches an individual province", () => {
    const matches = filterProfessionals(professionals, {
      ...emptyFilters,
      province: "Río Negro",
    });
    expect(matches.map((person) => person.id)).toEqual(["professional-06"]);
  });

  it("matches a professional display name", () => {
    const matches = filterProfessionals(professionals, {
      ...emptyFilters,
      query: "aisa e",
    });
    expect(matches.map((person) => person.id)).toEqual(["professional-05"]);
  });

  it("matches a province through the free-text query", () => {
    const matches = filterProfessionals(professionals, {
      ...emptyFilters,
      query: "rio negro",
    });
    expect(matches.map((person) => person.id)).toEqual(["professional-06"]);
  });

  it("combines office location, status, and care mode", () => {
    const matches = filterProfessionals(professionals, {
      ...emptyFilters,
      province: "CABA",
      locality: "Palermo",
      certificationStatus: "complete",
      careMode: "virtual",
    });
    expect(matches.map((person) => person.id)).toEqual(["professional-01"]);
  });

  it("filters by equipped offices", () => {
    const matches = filterProfessionals(professionals, {
      ...emptyFilters,
      province: "Buenos Aires",
      equipped: true,
    });
    expect(matches.map((person) => person.id)).toEqual([
      "professional-02",
      "professional-07",
    ]);
  });

  it("returns every record after reset", () => {
    expect(filterProfessionals(professionals, emptyFilters)).toHaveLength(10);
  });

  it("returns no results for an unmatched query", () => {
    expect(
      filterProfessionals(professionals, {
        ...emptyFilters,
        query: "Ushuaia",
      }),
    ).toEqual([]);
  });
});

describe("location helpers", () => {
  it("returns zero kilometres for identical coordinates", () => {
    expect(
      distanceInKilometres(
        { latitude: -31.417, longitude: -64.183 },
        { latitude: -31.417, longitude: -64.183 },
      ),
    ).toBe(0);
  });

  it("selects Córdoba for a nearby browser location", () => {
    const nearest = findNearestProfessional(professionals, {
      latitude: -31.42,
      longitude: -64.19,
    });
    expect(nearest?.id).toBe("professional-03");
  });

  it("selects the closest office for a professional with several locations", () => {
    const nearestOffice = findNearestOffice(professionals[0], {
      latitude: -34.59,
      longitude: -58.4,
    });
    expect(nearestOffice?.id).toBe("office-01-recoleta");
  });

  it("sorts every professional from closest to farthest", () => {
    const sorted = sortProfessionalsByDistance(professionals, {
      latitude: -34.62,
      longitude: -58.44,
    });
    expect(sorted[0].id).toBe("professional-10");
    expect(sorted).toHaveLength(professionals.length);
  });
});
