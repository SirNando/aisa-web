import { describe, expect, it } from "vitest";
import { normalizePublicDirectoryResponse } from "../src/lib/publicDirectory";

describe("normalizePublicDirectoryResponse", () => {
  it("normalizes published workplaces and resolves R2 photo URLs through the API host", () => {
    const records = normalizePublicDirectoryResponse(
      {
        professionals: [
          {
            professionalId: "professional-preview-001",
            displayName: "Lucía Fernández",
            profession: "Terapia ocupacional",
            careModes: ["in_person", "virtual"],
            populations: ["Infancias"],
            workplace: {
              id: "practice-location-preview-001",
              label: "Consultorio Palermo Demo",
              street: "Avenida Santa Fe 3253",
              locality: "Palermo",
              province: "Ciudad Autónoma de Buenos Aires",
              latitude: -34.58889,
              longitude: -58.41135,
              equipped: true,
              email: "consultorio.preview@example.test",
              phone: "+54 11 0000-0128",
            },
            certification: null,
            photoUrl: "/api/professionals/professional-preview-001/photo?v=photo-1",
          },
        ],
      },
      "http://localhost:8787/api/public/professionals",
    );

    expect(records).toHaveLength(1);
    expect(records[0]).toMatchObject({
      id: "professional-preview-001",
      name: "Lucía Fernández",
      certificationStatus: "none",
      careModes: ["in-person", "virtual"],
      photoUrl:
        "http://localhost:8787/api/professionals/professional-preview-001/photo?v=photo-1",
      offices: [
        {
          id: "practice-location-preview-001",
          equipped: true,
          locality: "Palermo",
        },
      ],
    });
  });

  it("groups multiple published workplaces under one professional", () => {
    const records = normalizePublicDirectoryResponse(
      {
        professionals: [
          {
            professionalId: "professional-preview-001",
            displayName: "Lucía Fernández",
            workplace: {
              id: "office-1",
              latitude: -34,
              longitude: -58,
            },
          },
          {
            professionalId: "professional-preview-001",
            displayName: "Lucía Fernández",
            workplace: {
              id: "office-2",
              latitude: -35,
              longitude: -59,
            },
          },
        ],
      },
      "http://localhost:8787/api/public/professionals",
    );

    expect(records[0]?.offices.map((office) => office.id)).toEqual([
      "office-1",
      "office-2",
    ]);
  });
});
