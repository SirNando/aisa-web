export type CertificationStatus = "complete" | "in-progress";
export type CareMode = "in-person" | "virtual";

export interface ProfessionalOffice {
  id: string;
  label: string;
  address: string;
  province: string;
  locality: string;
  latitude: number;
  longitude: number;
  equipped: boolean;
}

export interface Professional {
  id: string;
  name: string;
  profession: string;
  certificationStatus: CertificationStatus;
  careModes: CareMode[];
  populations: string[];
  phone: string;
  email: string;
  offices: ProfessionalOffice[];
}

export const professionals: Professional[] = [
  {
    id: "professional-01",
    name: "Lic. Profesional AISA A",
    profession: "Lic. en Terapia Ocupacional",
    certificationStatus: "complete",
    careModes: ["in-person", "virtual"],
    populations: ["Infancias", "Adolescentes"],
    phone: "+54 11 0000-0001",
    email: "profesional.a@example.com",
    offices: [
      {
        id: "office-01-palermo",
        label: "Consultorio Palermo",
        address: "Ubicación ilustrativa en Palermo",
        province: "CABA",
        locality: "Palermo",
        latitude: -34.5796,
        longitude: -58.4222,
        equipped: true,
      },
      {
        id: "office-01-recoleta",
        label: "Consultorio Recoleta",
        address: "Ubicación ilustrativa en Recoleta",
        province: "CABA",
        locality: "Recoleta",
        latitude: -34.5875,
        longitude: -58.3974,
        equipped: true,
      },
    ],
  },
  {
    id: "professional-02",
    name: "Lic. Profesional AISA B",
    profession: "Lic. en Terapia Ocupacional",
    certificationStatus: "in-progress",
    careModes: ["in-person"],
    populations: ["Infancias"],
    phone: "+54 221 000-0002",
    email: "profesional.b@example.com",
    offices: [
      {
        id: "office-02-la-plata",
        label: "Consultorio La Plata",
        address: "Ubicación ilustrativa en La Plata",
        province: "Buenos Aires",
        locality: "La Plata",
        latitude: -34.9214,
        longitude: -57.9544,
        equipped: true,
      },
    ],
  },
  {
    id: "professional-03",
    name: "Lic. Profesional AISA C",
    profession: "Lic. en Terapia Ocupacional",
    certificationStatus: "complete",
    careModes: ["in-person", "virtual"],
    populations: ["Infancias", "Personas adultas"],
    phone: "+54 351 000-0003",
    email: "profesional.c@example.com",
    offices: [
      {
        id: "office-03-cordoba",
        label: "Consultorio Córdoba",
        address: "Ubicación ilustrativa en Córdoba Capital",
        province: "Córdoba",
        locality: "Córdoba Capital",
        latitude: -31.4167,
        longitude: -64.1833,
        equipped: true,
      },
    ],
  },
  {
    id: "professional-04",
    name: "Lic. Profesional AISA D",
    profession: "Lic. en Terapia Ocupacional",
    certificationStatus: "in-progress",
    careModes: ["in-person"],
    populations: ["Infancias", "Adolescentes"],
    phone: "+54 341 000-0004",
    email: "profesional.d@example.com",
    offices: [
      {
        id: "office-04-rosario",
        label: "Consultorio Rosario",
        address: "Ubicación ilustrativa en Rosario",
        province: "Santa Fe",
        locality: "Rosario",
        latitude: -32.9587,
        longitude: -60.6939,
        equipped: false,
      },
    ],
  },
  {
    id: "professional-05",
    name: "Lic. Profesional AISA E",
    profession: "Lic. en Terapia Ocupacional",
    certificationStatus: "complete",
    careModes: ["in-person", "virtual"],
    populations: ["Infancias", "Personas adultas"],
    phone: "+54 261 000-0005",
    email: "profesional.e@example.com",
    offices: [
      {
        id: "office-05-mendoza",
        label: "Consultorio Mendoza",
        address: "Ubicación ilustrativa en Mendoza Capital",
        province: "Mendoza",
        locality: "Mendoza",
        latitude: -32.8895,
        longitude: -68.8458,
        equipped: true,
      },
    ],
  },
  {
    id: "professional-06",
    name: "Lic. Profesional AISA F",
    profession: "Lic. en Terapia Ocupacional",
    certificationStatus: "in-progress",
    careModes: ["in-person", "virtual"],
    populations: ["Infancias"],
    phone: "+54 294 000-0006",
    email: "profesional.f@example.com",
    offices: [
      {
        id: "office-06-bariloche",
        label: "Consultorio Bariloche",
        address: "Ubicación ilustrativa en Bariloche",
        province: "Río Negro",
        locality: "Bariloche",
        latitude: -41.1335,
        longitude: -71.3103,
        equipped: false,
      },
    ],
  },
  {
    id: "professional-07",
    name: "Lic. Profesional AISA G",
    profession: "Lic. en Terapia Ocupacional",
    certificationStatus: "complete",
    careModes: ["in-person"],
    populations: ["Infancias", "Adolescentes"],
    phone: "+54 11 0000-0007",
    email: "profesional.g@example.com",
    offices: [
      {
        id: "office-07-quilmes",
        label: "Consultorio Quilmes",
        address: "Ubicación ilustrativa en Quilmes",
        province: "Buenos Aires",
        locality: "Quilmes",
        latitude: -34.7205,
        longitude: -58.2545,
        equipped: true,
      },
      {
        id: "office-07-bernal",
        label: "Consultorio Bernal",
        address: "Ubicación ilustrativa en Bernal",
        province: "Buenos Aires",
        locality: "Bernal",
        latitude: -34.7066,
        longitude: -58.2803,
        equipped: false,
      },
    ],
  },
  {
    id: "professional-08",
    name: "Lic. Profesional AISA H",
    profession: "Lic. en Terapia Ocupacional",
    certificationStatus: "complete",
    careModes: ["in-person", "virtual"],
    populations: ["Infancias", "Personas adultas"],
    phone: "+54 387 000-0008",
    email: "profesional.h@example.com",
    offices: [
      {
        id: "office-08-salta",
        label: "Consultorio Salta",
        address: "Ubicación ilustrativa en Salta Capital",
        province: "Salta",
        locality: "Salta",
        latitude: -24.7821,
        longitude: -65.4232,
        equipped: true,
      },
    ],
  },
  {
    id: "professional-09",
    name: "Lic. Profesional AISA I",
    profession: "Lic. en Terapia Ocupacional",
    certificationStatus: "in-progress",
    careModes: ["virtual"],
    populations: ["Adolescentes", "Personas adultas"],
    phone: "+54 299 000-0009",
    email: "profesional.i@example.com",
    offices: [
      {
        id: "office-09-neuquen",
        label: "Referencia Neuquén",
        address: "Atención virtual con base en Neuquén",
        province: "Neuquén",
        locality: "Neuquén",
        latitude: -38.9516,
        longitude: -68.0591,
        equipped: false,
      },
    ],
  },
  {
    id: "professional-10",
    name: "Lic. Profesional AISA J",
    profession: "Lic. en Terapia Ocupacional",
    certificationStatus: "complete",
    careModes: ["in-person", "virtual"],
    populations: ["Infancias", "Adolescentes"],
    phone: "+54 11 0000-0010",
    email: "profesional.j@example.com",
    offices: [
      {
        id: "office-10-caballito",
        label: "Consultorio Caballito",
        address: "Ubicación ilustrativa en Caballito",
        province: "CABA",
        locality: "Caballito",
        latitude: -34.6185,
        longitude: -58.437,
        equipped: true,
      },
    ],
  },
];
