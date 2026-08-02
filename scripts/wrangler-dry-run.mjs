import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";

const outputDirectory = resolve(".wrangler", "dry-run");
const logPath = resolve(".wrangler", "wrangler.log");

await mkdir(outputDirectory, { recursive: true });

const child = spawn(
  "wrangler",
  ["deploy", "--dry-run", "--outdir", outputDirectory],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      WRANGLER_LOG_PATH: logPath,
      WRANGLER_SEND_METRICS: "false",
    },
  },
);

child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
