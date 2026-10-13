import {
  assertComparable,
  categories,
  display,
  loadReport,
  metric,
  metrics,
  score,
} from "./report-summary.mjs";

const usage =
  "Usage: node compare-reports.mjs --before <baseline.json> --after <current.json>";

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (key === "--help") return { help: true };
    if (!["--before", "--after"].includes(key))
      throw new Error(`Unknown option: ${key}`);
    const value = args[++index];
    if (!value || value.startsWith("--"))
      throw new Error(`Missing value for ${key}`);
    if (options[key] !== undefined) throw new Error(`Duplicate option: ${key}`);
    options[key] = value;
  }
  if (!options["--before"] || !options["--after"])
    throw new Error("--before and --after are required");
  return { before: options["--before"], after: options["--after"] };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(`${usage}\n`);
    return;
  }
  const [before, after] = await Promise.all([
    loadReport(options.before),
    loadReport(options.after),
  ]);
  assertComparable(before, after);
  const lines = [
    `Before: ${before.finalUrl}`,
    `After:  ${after.finalUrl}`,
    "",
    "| Category | Before | After | Change |",
    "| --- | ---: | ---: | ---: |",
  ];
  for (const category of categories) {
    const left = score(before, category);
    const right = score(after, category);
    const change =
      left === null || right === null
        ? "n/a"
        : `${right - left >= 0 ? "+" : ""}${right - left}`;
    lines.push(
      `| ${category} | ${left ?? "n/a"} | ${right ?? "n/a"} | ${change} |`,
    );
  }
  lines.push("", "| Metric | Before | After |", "| --- | ---: | ---: |");
  for (const [id, label, divisor, unit] of metrics) {
    lines.push(
      `| ${label} | ${display(metric(before, id, divisor), unit)} | ${display(metric(after, id, divisor), unit)} |`,
    );
  }
  process.stdout.write(`${lines.join("\n")}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
