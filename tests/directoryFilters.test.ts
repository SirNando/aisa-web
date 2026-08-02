import { describe, expect, it } from "vitest";
import { demoProfessionals } from "../src/data/demoProfessionals";
import {
  filterProfessionals,
  matchesProfessional,
  normalizeFilterText,
} from "../src/lib/directoryFilters";

const emptyFilters = {
  query: "",
  province: "",
  locality: "",
  certificationStatus: "",
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
      matchesProfessional(demoProfessionals[2], {
        ...emptyFilters,
        query: "cordoba",
      }),
    ).toBe(true);
  });

  it("matches an individual status", () => {
    const matches = filterProfessionals(demoProfessionals, {
      ...emptyFilters,
      certificationStatus: "complete",
    });
    expect(matches).toHaveLength(3);
  });

  it("matches an individual province", () => {
    const matches = filterProfessionals(demoProfessionals, {
      ...emptyFilters,
      province: "Río Negro",
    });
    expect(matches.map((person) => person.id)).toEqual(["demo-06"]);
  });

  it("matches a fictional display name", () => {
    const matches = filterProfessionals(demoProfessionals, {
      ...emptyFilters,
      query: "muestra e",
    });
    expect(matches.map((person) => person.id)).toEqual(["demo-05"]);
  });

  it("combines province, locality, and status", () => {
    const matches = filterProfessionals(demoProfessionals, {
      ...emptyFilters,
      province: "Santa Fe",
      locality: "Rosario",
      certificationStatus: "in-progress",
    });
    expect(matches.map((person) => person.id)).toEqual(["demo-04"]);
  });

  it("returns every record after reset", () => {
    expect(filterProfessionals(demoProfessionals, emptyFilters)).toHaveLength(6);
  });

  it("returns no results for an unmatched query", () => {
    expect(
      filterProfessionals(demoProfessionals, {
        ...emptyFilters,
        query: "Ushuaia",
      }),
    ).toEqual([]);
  });
});
