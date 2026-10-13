# SPA Lighthouse Optimizer

A standalone Agent Skill that guides a coding agent through measuring and improving an existing single-page website toward 100 Lighthouse scores in Performance, Accessibility, Best Practices, and SEO. It can be used on projects built with any frontend framework. Results depend on the site, hosting, browser, and third-party resources; the skill reports measured results and remaining blockers.

## Install

Once the package is published to npm, install the skill with one command:

```sh
npm exec --yes --package=spa-lighthouse-optimizer -- spa-lighthouse-optimizer install
```

With Yarn 2 or newer:

```sh
yarn dlx spa-lighthouse-optimizer install
```

Both commands install the skill under `$CODEX_HOME/skills/spa-lighthouse-optimizer`, or `~/.codex/skills/spa-lighthouse-optimizer` when `CODEX_HOME` is unset. For another agent, pass its skills directory with `--target`. With npm, use `--call` so npm passes the option to the installer:

```sh
npm exec --yes --package=spa-lighthouse-optimizer --call "spa-lighthouse-optimizer install --target /path/to/agent/skills"
```

The installer refuses to replace an existing skill folder, so move or remove an old installation before reinstalling. Start a new agent session after installation.

For a persistent command, use `npm install -g spa-lighthouse-optimizer` and then `spa-lighthouse-optimizer install`. The package must be published before these registry commands work. Until then, the checked-out repository can be packed with `npm pack` and installed from the resulting tarball.

Node.js 20 or newer and a local Chrome/Chromium installation are required for the included Lighthouse runner. The installer installs the runner dependency in the agent's skill folder. A manual copy of this repository also works; run `npm ci` in the copied folder first.

## Use

Open the target website repository in your agent and ask:

```text
Use $spa-lighthouse-optimizer to audit this SPA on mobile and desktop. The deployed URL is https://example.com. Fix the project issues you find, preserve its design and behavior, and report measured before/after scores. Do not deploy.
```

For an audit without edits:

```text
Use $spa-lighthouse-optimizer to audit this SPA and give me a prioritized report. Do not change files.
```

The audit tools are independent of the target project. For a repeatable baseline:

```sh
node scripts/audit-site.mjs --url https://example.com --url https://example.com/about --out-dir reports/baseline
node scripts/analyze-report.mjs reports/baseline/route-1-mobile-1.json
```

After changes, run the same audit into a new directory, then compare matching individual reports:

```sh
node scripts/audit-site.mjs --url https://example.com --url https://example.com/about --out-dir reports/current
node scripts/compare-reports.mjs --before reports/baseline/route-1-mobile-1.json --after reports/current/route-1-mobile-1.json
```

Use the same URLs, Lighthouse version, and settings for comparisons. The summary reports medians; inspect individual runs for instability. For Windows, pass `--chrome-path` if Chrome is not discovered automatically. Keep reports private if pages contain sensitive data.

## Scope

The agent diagnoses before editing, preserves existing project decisions, verifies the affected site, and distinguishes local measurements from deployed results. Deployment requires the user's authorization. A 100 score is a target rather than a guaranteed outcome.

This repository contains the skill and its local measurement tools. It does not need to be copied into each website.
