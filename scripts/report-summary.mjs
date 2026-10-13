import { readFile } from "node:fs/promises";

export const categories = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
];
export const metrics = [
  ["first-contentful-paint", "FCP", 1000, "s"],
  ["largest-contentful-paint", "LCP", 1000, "s"],
  ["speed-index", "Speed Index", 1000, "s"],
  ["total-blocking-time", "TBT", 1, "ms"],
  ["cumulative-layout-shift", "CLS", 1, ""],
];

export async function loadReport(file) {
  const report = JSON.parse(await readFile(file, "utf8"));
  if (!report.categories || !report.audits || !report.finalUrl)
    throw new Error(`Not a Lighthouse JSON report: ${file}`);
  return report;
}

export function score(report, category) {
  const value = report.categories?.[category]?.score;
  return typeof value === "number" ? Math.round(value * 100) : null;
}

export function metric(report, id, divisor) {
  const value = report.audits?.[id]?.numericValue;
  return typeof value === "number" ? value / divisor : null;
}

export function display(value, unit) {
  if (value === null) return "n/a";
  const places = unit === "ms" ? 0 : unit === "" ? 3 : 2;
  return `${value.toFixed(places)}${unit ? ` ${unit}` : ""}`;
}

export function assertComparable(before, after) {
  if (before.finalUrl !== after.finalUrl)
    throw new Error("Reports use different final URLs; compare the same page.");
  for (const [key, label] of [
    ["formFactor", "form factors"],
    ["throttlingMethod", "throttling methods"],
    ["throttling", "throttling settings"],
    ["screenEmulation", "screen emulation settings"],
  ]) {
    if (
      JSON.stringify(before.configSettings?.[key]) !==
      JSON.stringify(after.configSettings?.[key])
    )
      throw new Error(
        `Reports use different ${label}; compare with matching settings.`,
      );
  }
  if (before.lighthouseVersion !== after.lighthouseVersion)
    throw new Error(
      "Reports use different Lighthouse versions; compare with the same version.",
    );
}
