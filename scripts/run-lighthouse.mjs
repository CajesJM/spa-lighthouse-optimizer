import { spawn } from "node:child_process";
import { access, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const usage = `Usage: node run-lighthouse.mjs --url <http(s) URL> --out <report.json> [--form-factor mobile|desktop] [--chrome-path <executable>]

Run Lighthouse with the same URL and form factor before and after changes.
The output file must not already exist. Install this skill's dependencies with npm ci first.`;

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (key === "--help") return { help: true };
    if (!["--url", "--out", "--form-factor", "--chrome-path"].includes(key))
      throw new Error(`Unknown option: ${key}`);
    const value = args[++index];
    if (!value || value.startsWith("--"))
      throw new Error(`Missing value for ${key}`);
    if (options[key] !== undefined) throw new Error(`Duplicate option: ${key}`);
    options[key] = value;
  }
  if (!options["--url"] || !options["--out"])
    throw new Error("--url and --out are required");
  const url = new URL(options["--url"]);
  if (!["http:", "https:"].includes(url.protocol))
    throw new Error("URL must use http or https");
  const formFactor = options["--form-factor"] ?? "mobile";
  if (!["mobile", "desktop"].includes(formFactor))
    throw new Error("Form factor must be mobile or desktop");
  return {
    url: url.href,
    out: path.resolve(options["--out"]),
    formFactor,
    chromePath: options["--chrome-path"],
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(`${usage}\n`);
    return;
  }
  try {
    await access(options.out);
    throw new Error(`Output already exists: ${options.out}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  const cli = fileURLToPath(
    new URL("../node_modules/lighthouse/cli/index.js", import.meta.url),
  );
  await access(cli).catch(() => {
    throw new Error(
      "Lighthouse is not installed. Run npm ci in the skill folder.",
    );
  });
  if (options.chromePath) await access(options.chromePath);
  await mkdir(path.dirname(options.out), { recursive: true });

  const args = [
    cli,
    options.url,
    "--output=json",
    `--output-path=${options.out}`,
    "--only-categories=performance,accessibility,best-practices,seo",
    "--chrome-flags=--headless=new",
    "--quiet",
  ];
  if (options.formFactor === "desktop") args.push("--preset=desktop");
  const child = spawn(process.execPath, args, {
    stdio: "inherit",
    env: {
      ...process.env,
      ...(options.chromePath ? { CHROME_PATH: options.chromePath } : {}),
    },
  });
  const code = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  if (code !== 0) throw new Error(`Lighthouse exited with code ${code}`);
  process.stdout.write(`Saved ${options.formFactor} report: ${options.out}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
