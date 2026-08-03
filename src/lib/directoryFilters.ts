import type { Professional } from "../data/professionals";

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
    Professional,
    "name" | "province" | "locality" | "certificationStatus"
  >,
  filters: DirectoryFilters,
) => {
  const normalizedQuery = normalizeFilterText(filters.query);
  const matchesQuery =
    normalizedQuery === "" ||
    normalizeFilterText(professional.name).includes(normalizedQuery) ||
    normalizeFilterText(professional.locality).includes(normalizedQuery) ||
    normalizeFilterText(professional.province).includes(normalizedQuery);

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
    Professional,
    "name" | "province" | "locality" | "certificationStatus"
  >,
>(
  professionals: T[],
  filters: DirectoryFilters,
) => professionals.filter((professional) => matchesProfessional(professional, filters));

export interface Coordinates {
  latitude: number;
  longitude: number;
}

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const distanceInKilometres = (origin: Coordinates, destination: Coordinates) => {
  const earthRadius = 6371;
  const latitudeDelta = toRadians(destination.latitude - origin.latitude);
  const longitudeDelta = toRadians(destination.longitude - origin.longitude);
  const originLatitude = toRadians(origin.latitude);
  const destinationLatitude = toRadians(destination.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(originLatitude) *
      Math.cos(destinationLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadius * Math.asin(Math.sqrt(haversine));
};

export const findNearestProfessional = <T extends Coordinates>(
  records: T[],
  origin: Coordinates,
) =>
  records.reduce<T | null>((nearest, record) => {
    if (!nearest) return record;
    return distanceInKilometres(origin, record) < distanceInKilometres(origin, nearest)
      ? record
      : nearest;
  }, null);
