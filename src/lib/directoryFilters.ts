import type {
  Professional,
  ProfessionalOffice,
} from "../data/professionals";

export interface DirectoryFilters {
  query: string;
  province: string;
  locality: string;
  certificationStatus: string;
  careMode: string;
  equipped: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export const normalizeFilterText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("es-AR")
    .trim();

export const matchesOfficeFilters = (
  office: Pick<ProfessionalOffice, "province" | "locality" | "equipped">,
  filters: Pick<DirectoryFilters, "province" | "locality" | "equipped">,
) =>
  (filters.province === "" || office.province === filters.province) &&
  (filters.locality === "" || office.locality === filters.locality) &&
  (!filters.equipped || office.equipped);

export const matchesProfessional = (
  professional: Professional,
  filters: DirectoryFilters,
) => {
  const normalizedQuery = normalizeFilterText(filters.query);
  const searchableText = normalizeFilterText(
    [
      professional.name,
      professional.profession,
      ...professional.populations,
      ...professional.offices.flatMap((office) => [
        office.label,
        office.address,
        office.locality,
        office.province,
      ]),
    ].join(" "),
  );

  return (
    (normalizedQuery === "" || searchableText.includes(normalizedQuery)) &&
    (filters.certificationStatus === "" ||
      professional.certificationStatus === filters.certificationStatus) &&
    (filters.careMode === "" ||
      professional.careModes.includes(filters.careMode as "in-person" | "virtual")) &&
    professional.offices.some((office) => matchesOfficeFilters(office, filters))
  );
};

export const filterProfessionals = (
  records: Professional[],
  filters: DirectoryFilters,
) => records.filter((professional) => matchesProfessional(professional, filters));

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const distanceInKilometres = (
  origin: Coordinates,
  destination: Coordinates,
) => {
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

export const findNearestOffice = (
  professional: Professional,
  origin: Coordinates,
) =>
  professional.offices.reduce<ProfessionalOffice | null>((nearest, office) => {
    if (!nearest) return office;
    return distanceInKilometres(origin, office) <
      distanceInKilometres(origin, nearest)
      ? office
      : nearest;
  }, null);

export const professionalDistanceInKilometres = (
  professional: Professional,
  origin: Coordinates,
) => {
  const office = findNearestOffice(professional, origin);
  return office ? distanceInKilometres(origin, office) : Number.POSITIVE_INFINITY;
};

export const sortProfessionalsByDistance = (
  records: Professional[],
  origin: Coordinates,
) =>
  [...records].sort(
    (first, second) =>
      professionalDistanceInKilometres(first, origin) -
      professionalDistanceInKilometres(second, origin),
  );

export const findNearestProfessional = (
  records: Professional[],
  origin: Coordinates,
) => sortProfessionalsByDistance(records, origin)[0] ?? null;
