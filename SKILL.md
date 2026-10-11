---
name: spa-lighthouse-optimizer
description: Audit and improve an existing single-page website toward 100 Lighthouse Performance, Accessibility, Best Practices, and SEO scores. Use for local or deployed SPA diagnosis and authorized fixes across frontend frameworks; do not use for a new site or a visual redesign.
---

# SPA Lighthouse Optimizer

Use this skill in the website's repository. The skill is installed separately from the website. Treat 100 in each Lighthouse category as a target, not a promised result: scores vary and hosting, third-party code, or inaccessible routes may be outside the project.

## Workflow

1. Establish scope: identify the repo, framework, package manager, build/preview commands, target routes, mobile/desktop targets, deployed URL, and whether the user asked for an audit or also authorized changes. Read project instructions and inspect uncommitted changes before editing. A deployed URL alone permits diagnosis, not repository edits or deployment.
2. Measure a baseline against a production build or deployed URL, never only a development server. Run Lighthouse with `scripts/run-lighthouse.mjs` when Node and Chrome are available. Run mobile and desktop on representative routes; inspect both Lighthouse findings and browser behavior. See [audit workflow](references/audit-workflow.md).
3. Rank actual failing audits by likely user impact and fixability. Trace each finding to project code, assets, server behavior, or external services. For specific guidance, read the relevant sections in [optimization guidance](references/optimization-guidance.md). Avoid applying every recommendation mechanically.
4. For an authorized fix request, make the smallest changes supported by evidence. Preserve the site's framework, appearance, functionality, keyboard behavior, and existing work. Do not remove features, analytics, or third-party services merely to raise scores. Do not overwrite original assets without a reason.
5. Rebuild, exercise affected interactions and viewports in a browser when available, rerun the same Lighthouse URLs and settings, and compare the before/after results with `scripts/compare-reports.mjs`. See [verification](references/verification.md). For a deployed site, distinguish local results from production results; redeploy only when the user authorized it.
6. Report the measured scores, important metrics, changes made, tests actually run, and remaining blockers. If Chrome, Lighthouse, network access, credentials, or repository access are missing, explain the limit and continue with the useful checks available. Never claim a 100 score or smooth interaction without measuring it.

## Tools

The scripts require Node.js 20 or newer. Install their dependency once with `npm ci` in this skill's folder. Invoke scripts by absolute path or from this folder; they do not depend on the website framework. `run-lighthouse.mjs` saves JSON reports; `compare-reports.mjs` summarizes score and metric changes. Read each script's `--help` before using it.
