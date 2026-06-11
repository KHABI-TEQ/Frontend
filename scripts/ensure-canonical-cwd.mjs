import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const frontendRoot = fs.realpathSync.native(path.join(scriptDir, ".."));
const nextArgs = process.argv.slice(2).filter((arg) => arg !== "--clean");

if (process.argv.includes("--clean")) {
  try {
    fs.rmSync(path.join(frontendRoot, ".next"), { recursive: true, force: true });
    console.log("Cleared .next");
  } catch {
    // ignore missing .next
  }
}

const result = spawnSync("next", nextArgs, {
  cwd: frontendRoot,
  stdio: "inherit",
  shell: true,
});

process.exit(result.status ?? 1);
