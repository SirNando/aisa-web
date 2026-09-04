import type { PublicDirectoryListing } from "./publicDirectory";

export interface DirectoryFilters {
  query: string;
  province: string;
  locality: string;
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

export const matchesDirectoryListing = (
  listing: PublicDirectoryListing,
  filters: DirectoryFilters,
) => {
  const normalizedQuery = normalizeFilterText(filters.query);
  const searchableText = normalizeFilterText([
    listing.displayName,
    listing.address.label,
    listing.address.formatted,
  ].join(" "));

  return (
    (normalizedQuery === "" || searchableText.includes(normalizedQuery)) &&
    (filters.province === "" || listing.address.province === filters.province) &&
    (filters.locality === "" || listing.address.locality === filters.locality)
  );
};

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

export const sortDirectoryListingsByDistance = (
  records: PublicDirectoryListing[],
  origin: Coordinates,
) => [...records].sort(
  (first, second) =>
    distanceInKilometres(origin, first.address) -
    distanceInKilometres(origin, second.address),
);

export const findNearestListing = (
  records: PublicDirectoryListing[],
  origin: Coordinates,
) => sortDirectoryListingsByDistance(records, origin)[0] ?? null;
