import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(
  resolve(process.cwd(), "src/components/ProfessionalDirectory.astro"),
  "utf8",
);

describe("public directory lifecycle", () => {
  it("loads its complete public data through one fetch and one Astro lifecycle entrypoint", () => {
    expect(source.match(/fetch\(DIRECTORY_API_URL/gu)).toHaveLength(1);
    expect(source).toContain(
      'document.addEventListener("astro:page-load", initializeDirectory)',
    );
    expect(source).not.toMatch(/^\s*initializeDirectory\(\);\s*$/gmu);
  });
});
