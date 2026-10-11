# SPA Lighthouse Optimizer

A standalone Agent Skill that guides a coding agent through measuring and improving an existing single-page website toward 100 Lighthouse scores in Performance, Accessibility, Best Practices, and SEO. It can be used on projects built with any frontend framework. Results depend on the site, hosting, browser, and third-party resources; the skill reports measured results and remaining blockers.

## Install

The repository folder itself is the skill. Clone or copy it to a personal skills directory supported by your agent, outside the website you want to optimize. For Codex, place the complete folder at `$CODEX_HOME/skills/spa-lighthouse-optimizer` (or `~/.codex/skills/spa-lighthouse-optimizer` when `CODEX_HOME` is unset), then start a new session. Other Agent Skills-compatible hosts can use the same `SKILL.md` folder; follow that host's skill-directory instructions. The GitHub source URL can be used once this repository is published; no project-level installation is needed.

Install the optional Lighthouse runner dependency inside this skill folder:

```sh
npm ci
```

Node.js 20 or newer and a local Chrome/Chromium installation are required for the included runner. The agent may also use an existing Lighthouse installation or browser tool.

## Use

Open the target website repository in your agent and ask:

```text
Use $spa-lighthouse-optimizer to audit this SPA on mobile and desktop. The deployed URL is https://example.com. Fix the project issues you find, preserve its design and behavior, and report measured before/after scores. Do not deploy.
```

For an audit without edits:

```text
Use $spa-lighthouse-optimizer to audit this SPA and give me a prioritized report. Do not change files.
```

The runner and comparison tools are independent of the target project:

```sh
node scripts/run-lighthouse.mjs --url https://example.com --form-factor mobile --out reports/baseline-mobile.json
node scripts/run-lighthouse.mjs --url https://example.com --form-factor desktop --out reports/baseline-desktop.json
node scripts/compare-reports.mjs --before reports/baseline-mobile.json --after reports/current-mobile.json
```

Use the same URL and form factor for each comparison. For Windows, pass `--chrome-path` if Chrome is not discovered automatically.

## Scope

The agent diagnoses before editing, preserves existing project decisions, verifies the affected site, and distinguishes local measurements from deployed results. Deployment requires the user's authorization. A 100 score is a target rather than a guaranteed outcome.

This repository contains the skill and its local measurement tools. It does not need to be copied into each website.
