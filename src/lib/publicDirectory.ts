type UnknownRecord = Record<string, unknown>;

export interface PublicDirectoryAddress {
  label: string;
  street: string;
  locality: string;
  city: string;
  province: string;
  postalCode: string;
  formatted: string;
  latitude: number;
  longitude: number;
}

export interface PublicDirectoryListing {
  clientKey: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  address: PublicDirectoryAddress;
}

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const textValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const uniqueText = (values: string[]) => [...new Set(values.filter(Boolean))];

const formattedAddress = (address: Omit<PublicDirectoryAddress, "formatted">) => {
  const localityCityAndProvince = uniqueText([
    address.locality,
    address.city,
    address.province,
  ]).join(", ");
  const parts = uniqueText([
    address.street,
    localityCityAndProvince,
    address.postalCode,
  ]);
  return parts.join(" · ") || address.label;
};

const normalizeListing = (
  value: unknown,
  index: number,
): PublicDirectoryListing | null => {
  if (!isRecord(value) || !isRecord(value.address)) return null;

  const firstName = textValue(value.firstName);
  const lastName = textValue(value.lastName);
  const latitude = Number(value.address.latitude);
  const longitude = Number(value.address.longitude);
  if (!firstName || !lastName || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  const addressWithoutDisplay = {
    label: textValue(value.address.label) || "Consultorio",
    street: textValue(value.address.street),
    locality: textValue(value.address.locality),
    city: textValue(value.address.city),
    province: textValue(value.address.province),
    postalCode: textValue(value.address.postalCode),
    latitude,
    longitude,
  };

  return {
    clientKey: `directory-listing-${index}`,
    firstName,
    lastName,
    displayName: `${firstName} ${lastName}`,
    email: textValue(value.email),
    phone: textValue(value.phone),
    address: {
      ...addressWithoutDisplay,
      formatted: formattedAddress(addressWithoutDisplay),
    },
  };
};

export function normalizePublicDirectoryResponse(value: unknown): PublicDirectoryListing[] {
  if (!isRecord(value) || !Array.isArray(value.professionals)) {
    throw new TypeError("La respuesta del directorio no tiene un formato válido.");
  }

  return value.professionals.flatMap((candidate, index) => {
    const listing = normalizeListing(candidate, index);
    return listing ? [listing] : [];
  });
}
