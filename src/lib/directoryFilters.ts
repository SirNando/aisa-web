import type { DemoProfessional } from "../data/demoProfessionals";

export interface DirectoryFilters {
  query: string;
  province: string;
  locality: string;
  certificationStatus: string;
}

export const normalizeFilterText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es-AR")
    .trim();

export const matchesProfessional = (
  professional: Pick<
    DemoProfessional,
    "name" | "province" | "locality" | "certificationStatus"
  >,
  filters: DirectoryFilters,
) => {
  const normalizedQuery = normalizeFilterText(filters.query);
  const matchesQuery =
    normalizedQuery === "" ||
    normalizeFilterText(professional.name).includes(normalizedQuery) ||
    normalizeFilterText(professional.locality).includes(normalizedQuery);

  return (
    matchesQuery &&
    (filters.province === "" || professional.province === filters.province) &&
    (filters.locality === "" || professional.locality === filters.locality) &&
    (filters.certificationStatus === "" ||
      professional.certificationStatus === filters.certificationStatus)
  );
};

export const filterProfessionals = <
  T extends Pick<
    DemoProfessional,
    "name" | "province" | "locality" | "certificationStatus"
  >,
>(
  professionals: T[],
  filters: DirectoryFilters,
) => professionals.filter((professional) => matchesProfessional(professional, filters));
