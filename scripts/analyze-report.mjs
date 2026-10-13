import {
  categories,
  display,
  loadReport,
  metric,
  metrics,
  score,
} from "./report-summary.mjs";

function evidence(item) {
  const values = [
    item.url,
    item.sourceLocation?.url,
    item.node?.selector,
    item.node?.snippet,
    item.description,
  ]
    .filter((value) => typeof value === "string")
    .map((value) => value.replace(/\s+/g, " ").slice(0, 180));
  return [...new Set(values)].slice(0, 2).join(" — ");
}

function summarize(report) {
  const lines = [
    `# Lighthouse findings: ${report.finalUrl}`,
    `Lighthouse ${report.lighthouseVersion ?? "unknown"} · ${report.configSettings?.formFactor ?? "unknown"}`,
    "",
    `Scores: ${categories.map((id) => `${id} ${score(report, id) ?? "n/a"}`).join(" · ")}`,
    `Metrics: ${metrics.map(([id, label, divisor, unit]) => `${label} ${display(metric(report, id, divisor), unit)}`).join(" · ")}`,
  ];
  for (const category of categories) {
    const failures = (report.categories[category]?.auditRefs ?? [])
      .filter(
        (ref) =>
          ref.weight > 0 &&
          typeof report.audits[ref.id]?.score === "number" &&
          report.audits[ref.id].score < 1,
      )
      .sort(
        (a, b) =>
          b.weight * (1 - report.audits[b.id].score) -
          a.weight * (1 - report.audits[a.id].score),
      );
    lines.push("", `## ${category}: ${failures.length} scored failing audits`);
    for (const ref of failures) {
      const audit = report.audits[ref.id];
      lines.push(
        `- ${audit.title} (${ref.id}; score ${audit.score.toFixed(2)}, weight ${ref.weight})`,
      );
      for (const item of (audit.details?.items ?? []).slice(0, 3)) {
        const detail = evidence(item);
        if (detail) lines.push(`  - ${detail}`);
      }
    }
  }
  lines.push(
    "",
    "Scored failures are prioritized by audit weight × score gap, not by predicted score gain. Inspect full JSON and the page before editing; automated audits do not cover all accessibility or behavior.",
  );
  return lines.join("\n");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === "--help") {
    process.stdout.write(
      "Usage: node analyze-report.mjs <lighthouse-report.json>\n",
    );
    return;
  }
  if (args.length !== 1)
    throw new Error(
      "Expected one Lighthouse JSON report path. Use --help for usage.",
    );
  process.stdout.write(`${summarize(await loadReport(args[0]))}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
