import type {
  CareMode,
  CertificationStatus,
  Professional,
  ProfessionalOffice,
} from "../data/professionals";

type UnknownRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is UnknownRecord =>
  typeof value === "object" && value !== null;

const textValue = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const arrayValue = (value: unknown) =>
  Array.isArray(value) ? value : [];

const normalizeCareMode = (value: unknown): CareMode | null => {
  const mode = textValue(value);
  if (mode === "in_person" || mode === "in-person") return "in-person";
  if (mode === "virtual") return "virtual";
  return null;
};

const resolvePhotoUrl = (value: unknown, apiUrl: string) => {
  const photoUrl = textValue(value);
  if (!photoUrl) return null;

  try {
    const resolved = new URL(photoUrl, apiUrl);
    return resolved.protocol === "http:" || resolved.protocol === "https:"
      ? resolved.toString()
      : null;
  } catch {
    return null;
  }
};

const normalizeCertificationStatus = (
  certification: unknown,
): CertificationStatus => {
  if (!isRecord(certification)) return "none";
  return textValue(certification.code) ? "complete" : "none";
};

const officeLocation = (workplace: UnknownRecord) => {
  const locality = textValue(workplace.locality) || textValue(workplace.city);
  const province = textValue(workplace.province);
  return { locality, province };
};

const officeAddress = (workplace: UnknownRecord, label: string) => {
  const address = textValue(workplace.street);
  if (address) return address;
  return label || [textValue(workplace.city), textValue(workplace.province)]
    .filter(Boolean)
    .join(", ");
};

const officeId = (professionalId: string, workplace: UnknownRecord) =>
  textValue(workplace.id) || `${professionalId}-${textValue(workplace.label) || "location"}`;

const normalizeOffice = (
  professionalId: string,
  workplace: UnknownRecord,
): ProfessionalOffice | null => {
  const latitude = Number(workplace.latitude);
  const longitude = Number(workplace.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return null;
  }

  const label = textValue(workplace.label) || "Consultorio";
  const { locality, province } = officeLocation(workplace);
  return {
    id: officeId(professionalId, workplace),
    label,
    address: officeAddress(workplace, label),
    province,
    locality,
    latitude,
    longitude,
    equipped: workplace.equipped === true || textValue(workplace.equipped) === "yes",
  };
};

const normalizeProfessional = (
  value: unknown,
  apiUrl: string,
): (Professional & { photoUrl: string | null }) | null => {
  if (!isRecord(value) || !isRecord(value.workplace)) return null;

  const professionalId = textValue(value.professionalId);
  const name = textValue(value.displayName);
  const office = normalizeOffice(professionalId, value.workplace);
  if (!professionalId || !name || !office) return null;

  const careModes = arrayValue(value.careModes)
    .map(normalizeCareMode)
    .filter((mode): mode is CareMode => mode !== null);
  const populations = arrayValue(value.populations)
    .map(textValue)
    .filter(Boolean);

  return {
    id: professionalId,
    name,
    profession: textValue(value.profession) || "Profesional AISA",
    certificationStatus: normalizeCertificationStatus(value.certification),
    careModes: [...new Set(careModes)],
    populations: [...new Set(populations)],
    phone: textValue(value.workplace.phone),
    email: textValue(value.workplace.email),
    offices: [office],
    photoUrl: resolvePhotoUrl(value.photoUrl, apiUrl),
  };
};

export function normalizePublicDirectoryResponse(
  value: unknown,
  apiUrl: string,
): Professional[] {
  if (!isRecord(value) || !Array.isArray(value.professionals)) {
    throw new TypeError("La respuesta del directorio no tiene un formato válido.");
  }

  const records = new Map<string, Professional & { photoUrl: string | null }>();
  value.professionals.forEach((candidate) => {
    const professional = normalizeProfessional(candidate, apiUrl);
    if (!professional) return;

    const existing = records.get(professional.id);
    if (!existing) {
      records.set(professional.id, professional);
      return;
    }

    existing.offices.push(
      ...professional.offices.filter(
        (office) => !existing.offices.some((current) => current.id === office.id),
      ),
    );
    existing.careModes = [
      ...new Set([...existing.careModes, ...professional.careModes]),
    ];
    existing.populations = [
      ...new Set([...existing.populations, ...professional.populations]),
    ];
    if (existing.certificationStatus !== "complete") {
      existing.certificationStatus = professional.certificationStatus;
    }
    existing.phone ||= professional.phone;
    existing.email ||= professional.email;
    existing.photoUrl ||= professional.photoUrl;
  });

  return [...records.values()];
}
