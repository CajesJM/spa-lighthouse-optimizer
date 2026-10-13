import { spawn } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertComparable,
  categories,
  display,
  loadReport,
  metric,
  metrics,
  score,
} from "./report-summary.mjs";

const usage = `Usage: node audit-site.mjs --url <http(s) URL> [--url <URL> ...] --out-dir <new-directory> [--runs 1-10] [--form-factor mobile|desktop|both] [--chrome-path <executable>]

Runs are sequential. Default: 3 runs per URL and form factor, both mobile and desktop.
The output directory must not already exist; reports may contain sensitive page data.`;

function parseArgs(args) {
  const options = { urls: [], runs: 3, formFactor: "both" };
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (key === "--help") return { help: true };
    if (
      ![
        "--url",
        "--out-dir",
        "--runs",
        "--form-factor",
        "--chrome-path",
      ].includes(key)
    )
      throw new Error(`Unknown option: ${key}`);
    const value = args[++index];
    if (!value || value.startsWith("--"))
      throw new Error(`Missing value for ${key}`);
    if (key === "--url") {
      const url = new URL(value);
      if (!["http:", "https:"].includes(url.protocol))
        throw new Error("URLs must use http or https");
      if (options.urls.includes(url.href))
        throw new Error(`Duplicate URL: ${url.href}`);
      options.urls.push(url.href);
    } else {
      if (options[key] !== undefined)
        throw new Error(`Duplicate option: ${key}`);
      options[key] = value;
    }
  }
  if (!options.urls.length || !options["--out-dir"])
    throw new Error("At least one --url and --out-dir are required");
  if (options["--runs"] !== undefined) {
    const runs = Number(options["--runs"]);
    if (!Number.isInteger(runs) || runs < 1 || runs > 10)
      throw new Error("--runs must be an integer from 1 to 10");
    options.runs = runs;
  }
  if (options["--form-factor"] !== undefined)
    options.formFactor = options["--form-factor"];
  if (!["mobile", "desktop", "both"].includes(options.formFactor))
    throw new Error("Invalid form factor");
  options.outDir = path.resolve(options["--out-dir"]);
  return options;
}

function median(values) {
  const available = values
    .filter((value) => value !== null)
    .sort((a, b) => a - b);
  if (!available.length) return null;
  const middle = Math.floor(available.length / 2);
  return available.length % 2
    ? available[middle]
    : (available[middle - 1] + available[middle]) / 2;
}

async function run(url, formFactor, out, chromePath) {
  const runner = fileURLToPath(
    new URL("./run-lighthouse.mjs", import.meta.url),
  );
  const args = [
    runner,
    "--url",
    url,
    "--form-factor",
    formFactor,
    "--out",
    out,
  ];
  if (chromePath) args.push("--chrome-path", chromePath);
  const child = spawn(process.execPath, args, { stdio: "inherit" });
  const code = await new Promise((resolve, reject) => {
    child.on("error", reject);
    child.on("close", resolve);
  });
  if (code !== 0)
    throw new Error(
      `Lighthouse failed for ${url} (${formFactor}); inspect reports already saved in the output directory.`,
    );
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) return process.stdout.write(`${usage}\n`);
  try {
    await stat(options.outDir);
    throw new Error(`Output directory already exists: ${options.outDir}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  await mkdir(options.outDir, { recursive: true });
  const modes =
    options.formFactor === "both"
      ? ["mobile", "desktop"]
      : [options.formFactor];
  const lines = [
    "# Lighthouse audit summary",
    "",
    `Runs per route/device: ${options.runs}`,
    "",
    "| URL | Device | Performance | Accessibility | Best Practices | SEO | FCP | LCP | Speed Index | TBT | CLS | Reports |",
    "| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |",
  ];
  for (const [urlIndex, url] of options.urls.entries()) {
    for (const mode of modes) {
      const reports = [];
      const names = [];
      for (let index = 1; index <= options.runs; index += 1) {
        const name = `route-${urlIndex + 1}-${mode}-${index}.json`;
        await run(
          url,
          mode,
          path.join(options.outDir, name),
          options["--chrome-path"],
        );
        const report = await loadReport(path.join(options.outDir, name));
        if (reports.length) assertComparable(reports[0], report);
        reports.push(report);
        names.push(name);
      }
      const scores = categories.map(
        (id) => median(reports.map((report) => score(report, id))) ?? "n/a",
      );
      const timings = metrics.map(([id, , divisor, unit]) =>
        display(
          median(reports.map((report) => metric(report, id, divisor))),
          unit,
        ),
      );
      lines.push(
        `| ${url.replaceAll("|", "\\|")} | ${mode} | ${[...scores, ...timings].join(" | ")} | ${names.join(", ")} |`,
      );
    }
  }
  lines.push(
    "",
    "Scores and metrics are medians. Review each JSON report and run analyze-report.mjs on failing runs; a median does not guarantee a stable 100.",
  );
  const summary = path.join(options.outDir, "summary.md");
  await writeFile(summary, `${lines.join("\n")}\n`);
  process.stdout.write(`Saved summary: ${summary}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
