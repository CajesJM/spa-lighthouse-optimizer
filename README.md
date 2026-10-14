# SPA Lighthouse Optimizer

An installable Agent Skill that helps a coding agent **audit and improve an existing single-page app (SPA)** across Lighthouse Performance, Accessibility, Best Practices, and SEO. It works with any frontend framework because it measures the finished website, then guides changes in that website's own repository.

The [showcase landing page](docs/index.html) lives in `docs/`. To preview it locally, run `python -m http.server 8000 --directory docs` and open `http://localhost:8000`.

| 🟦 Install once | 🟩 Open your project |
| --- | --- |
| Install the skill in your agent's skills directory, outside your website. | Start a new agent session in the website repository and ask it to use the skill. |
| 🟨 Measure and improve | 🟪 Verify the result |
| Audit representative routes on mobile and desktop, then fix findings supported by evidence. | Rebuild, test behavior, and compare new Lighthouse reports with the baseline. |

> **100 is a goal, not a guarantee.** Scores can vary between runs and depend on hosting, third-party services, and the tested page. The skill reports measured results and unresolved issues; it does not deploy your site without authorization.

## Requirements

- Node.js 20 or newer and a local Chrome/Chromium installation for the included Lighthouse tools.
- An AI coding agent that supports `SKILL.md`-style skills. The default installer target is **Codex**; for another compatible agent, provide its skills directory with `--target`.
- Access to the website's repository if you want the agent to make fixes. A deployed URL alone is enough for an audit, not for editing its source.

## 1. Install the skill

When the package is available on npm, choose **one** of these commands:

| Package manager | Command |
| --- | --- |
| npm | `npx spa-lighthouse-optimizer` |
| Yarn 2+ | `yarn dlx spa-lighthouse-optimizer` |

This installs to `$CODEX_HOME/skills/spa-lighthouse-optimizer`, or `~/.codex/skills/spa-lighthouse-optimizer` if `CODEX_HOME` is unset. It also installs Lighthouse in the skill directory. **Restart your agent session** after installation.

If the package is not yet published, use this checked-out repository instead:

```sh
npm ci
node scripts/install.mjs
```

Run those two commands **from this repository**. The installer will not overwrite an existing installation; move or remove the old skill folder before reinstalling.

For another compatible agent, install into its documented skills directory:

```sh
npx spa-lighthouse-optimizer --target /path/to/agent/skills
```

For an unpublished checkout, use `node scripts/install.mjs --target /path/to/agent/skills` instead. The target is the **parent skills directory**; the installer creates `spa-lighthouse-optimizer` inside it. Installation does not make a model with no skills support understand the format automatically.

## 2. Ask your agent to use it

Open your **website's repository** in a new agent session. For an audit and authorized fixes, ask:

```text
Use $spa-lighthouse-optimizer to audit this SPA on mobile and desktop.
The deployed URL is https://example.com. Fix issues in this project that the
reports support, preserve its design and behavior, and report measured
before/after scores. Do not deploy.
```

For a report without changes:

```text
Use $spa-lighthouse-optimizer to audit this SPA and give me a prioritized
report. Do not change files.
```

Replace the example URL with your site. Tell the agent which routes matter, whether it may edit the project, and whether deployment is allowed. It should test a production build or the deployed site—not only a development server.

## 3. Run the audit tools yourself (optional)

Run these commands **from the installed skill directory or this checkout**, not from the website repository. The URLs should point to a deployed site or a locally served production build.

```sh
node scripts/audit-site.mjs --url https://example.com --url https://example.com/about --out-dir reports/baseline
node scripts/analyze-report.mjs reports/baseline/route-1-mobile-1.json
```

By default, `audit-site.mjs` runs **three times per route on both mobile and desktop**. It saves individual JSON reports and `reports/baseline/summary.md` with median scores. The output directory must be new. Use `--runs 1` for a quick diagnostic pass, not a final score claim. If Chrome is not found automatically, add `--chrome-path <path-to-chrome>`.

After project changes, audit the **same URLs** into a different directory and compare corresponding individual runs:

```sh
node scripts/audit-site.mjs --url https://example.com --url https://example.com/about --out-dir reports/current
node scripts/compare-reports.mjs --before reports/baseline/route-1-mobile-1.json --after reports/current/route-1-mobile-1.json
```

Use the same Lighthouse version and settings for meaningful comparisons. A local production-build result does not prove the deployed site has the same score. Keep reports private when pages may contain sensitive data.

## What the skill will and will not do

It diagnoses before editing, aims for the smallest evidence-based changes, checks affected interactions, and distinguishes local results from deployed results. It will not remove required features merely to boost a score, claim perfect accessibility from an automated audit, or promise four 100s. See [the skill workflow](SKILL.md) and [audit guidance](references/audit-workflow.md) for the full process.
