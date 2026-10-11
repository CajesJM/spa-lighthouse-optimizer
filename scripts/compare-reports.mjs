#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
const metrics = [
  ['first-contentful-paint', 'FCP', 1000, 's'],
  ['largest-contentful-paint', 'LCP', 1000, 's'],
  ['speed-index', 'Speed Index', 1000, 's'],
  ['total-blocking-time', 'TBT', 1, 'ms'],
  ['cumulative-layout-shift', 'CLS', 1, ''],
];

const usage = 'Usage: node compare-reports.mjs --before <baseline.json> --after <current.json>';

function parseArgs(args) {
  const options = {};
  for (let index = 0; index < args.length; index += 1) {
    const key = args[index];
    if (key === '--help') return { help: true };
    if (!['--before', '--after'].includes(key)) throw new Error(`Unknown option: ${key}`);
    const value = args[++index];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${key}`);
    if (options[key] !== undefined) throw new Error(`Duplicate option: ${key}`);
    options[key] = value;
  }
  if (!options['--before'] || !options['--after']) throw new Error('--before and --after are required');
  return { before: options['--before'], after: options['--after'] };
}

function score(report, category) {
  const value = report.categories?.[category]?.score;
  return typeof value === 'number' ? Math.round(value * 100) : null;
}

function metric(report, id, divisor) {
  const value = report.audits?.[id]?.numericValue;
  return typeof value === 'number' ? value / divisor : null;
}

function display(value, unit) {
  if (value === null) return 'n/a';
  const places = unit === 'ms' ? 0 : unit === '' ? 3 : 2;
  return `${value.toFixed(places)}${unit ? ` ${unit}` : ''}`;
}

async function loadReport(file) {
  const report = JSON.parse(await readFile(file, 'utf8'));
  if (!report.categories || !report.audits || !report.finalUrl) throw new Error(`Not a Lighthouse JSON report: ${file}`);
  return report;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    process.stdout.write(`${usage}\n`);
    return;
  }
  const [before, after] = await Promise.all([loadReport(options.before), loadReport(options.after)]);
  if (before.finalUrl !== after.finalUrl) throw new Error('Reports use different final URLs; compare the same page.');
  const beforeFormFactor = before.configSettings?.formFactor;
  const afterFormFactor = after.configSettings?.formFactor;
  if (beforeFormFactor && afterFormFactor && beforeFormFactor !== afterFormFactor) {
    throw new Error('Reports use different form factors; compare mobile with mobile or desktop with desktop.');
  }
  const lines = [
    `Before: ${before.finalUrl}`,
    `After:  ${after.finalUrl}`,
    '',
    '| Category | Before | After | Change |',
    '| --- | ---: | ---: | ---: |',
  ];
  for (const category of categories) {
    const left = score(before, category);
    const right = score(after, category);
    const change = left === null || right === null ? 'n/a' : `${right - left >= 0 ? '+' : ''}${right - left}`;
    lines.push(`| ${category} | ${left ?? 'n/a'} | ${right ?? 'n/a'} | ${change} |`);
  }
  lines.push('', '| Metric | Before | After |', '| --- | ---: | ---: |');
  for (const [id, label, divisor, unit] of metrics) {
    lines.push(`| ${label} | ${display(metric(before, id, divisor), unit)} | ${display(metric(after, id, divisor), unit)} |`);
  }
  process.stdout.write(`${lines.join('\n')}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
});
