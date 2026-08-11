import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";

const environment = process.argv[2] ?? "";
const configSource = await readFile("wrangler.jsonc", "utf8");
const config = JSON.parse(
  configSource
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, ""),
);
const environmentConfig = environment ? config.env?.[environment] : config;
const apiBaseUrl = environmentConfig?.vars?.PUBLIC_DIRECTORY_API_URL;

if (!apiBaseUrl || /localhost|127\.0\.0\.1/.test(apiBaseUrl)) {
  throw new Error(
    `Missing a deployed directory API URL for the ${environment || "production"} build.`,
  );
}

const parsedUrl = new URL(apiBaseUrl);
if (!(["http:", "https:"].includes(parsedUrl.protocol))) {
  throw new Error(`Invalid directory API URL: ${apiBaseUrl}`);
}

const child = spawn(
  process.platform === "win32" ? "astro.cmd" : "astro",
  ["build"],
  {
    env: {
      ...process.env,
      PUBLIC_DIRECTORY_API_URL: apiBaseUrl.replace(/\/+$/, ""),
    },
    stdio: "inherit",
  },
);

child.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
