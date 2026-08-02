export type CertificationStatus = "complete" | "in-progress";

export interface DemoProfessional {
  id: string;
  name: string;
  certificationStatus: CertificationStatus;
  province: string;
  locality: string;
  demo: true;
}

export const demoProfessionals: DemoProfessional[] = [
  {
    id: "demo-01",
    name: "Lic. Profesional de muestra A",
    certificationStatus: "complete",
    province: "CABA",
    locality: "Caballito",
    demo: true,
  },
  {
    id: "demo-02",
    name: "Lic. Profesional de muestra B",
    certificationStatus: "in-progress",
    province: "Buenos Aires",
    locality: "La Plata",
    demo: true,
  },
  {
    id: "demo-03",
    name: "Lic. Profesional de muestra C",
    certificationStatus: "complete",
    province: "Córdoba",
    locality: "Córdoba Capital",
    demo: true,
  },
  {
    id: "demo-04",
    name: "Lic. Profesional de muestra D",
    certificationStatus: "in-progress",
    province: "Santa Fe",
    locality: "Rosario",
    demo: true,
  },
  {
    id: "demo-05",
    name: "Lic. Profesional de muestra E",
    certificationStatus: "complete",
    province: "Mendoza",
    locality: "Mendoza",
    demo: true,
  },
  {
    id: "demo-06",
    name: "Lic. Profesional de muestra F",
    certificationStatus: "in-progress",
    province: "Río Negro",
    locality: "Bariloche",
    demo: true,
  },
];
