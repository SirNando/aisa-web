export type CertificationStatus = "complete" | "in-progress";

export interface Professional {
  id: string;
  name: string;
  certificationStatus: CertificationStatus;
  province: string;
  locality: string;
  latitude: number;
  longitude: number;
}

export const professionals: Professional[] = [
  {
    id: "professional-01",
    name: "Lic. Profesional AISA A",
    certificationStatus: "complete",
    province: "CABA",
    locality: "Caballito",
    latitude: -34.618,
    longitude: -58.437,
  },
  {
    id: "professional-02",
    name: "Lic. Profesional AISA B",
    certificationStatus: "in-progress",
    province: "Buenos Aires",
    locality: "La Plata",
    latitude: -34.921,
    longitude: -57.955,
  },
  {
    id: "professional-03",
    name: "Lic. Profesional AISA C",
    certificationStatus: "complete",
    province: "Córdoba",
    locality: "Córdoba Capital",
    latitude: -31.417,
    longitude: -64.183,
  },
  {
    id: "professional-04",
    name: "Lic. Profesional AISA D",
    certificationStatus: "in-progress",
    province: "Santa Fe",
    locality: "Rosario",
    latitude: -32.9587,
    longitude: -60.6939,
  },
  {
    id: "professional-05",
    name: "Lic. Profesional AISA E",
    certificationStatus: "complete",
    province: "Mendoza",
    locality: "Mendoza",
    latitude: -32.8895,
    longitude: -68.8458,
  },
  {
    id: "professional-06",
    name: "Lic. Profesional AISA F",
    certificationStatus: "in-progress",
    province: "Río Negro",
    locality: "Bariloche",
    latitude: -41.1335,
    longitude: -71.3103,
  },
];
