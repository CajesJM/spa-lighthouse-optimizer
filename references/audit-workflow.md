# Audit workflow

## Establish comparable measurements

- Read repository instructions and status. Determine the real production build and preview command. Do not assume a framework or package manager.
- Identify the deployed URL and representative public routes. Test a local production build if deployment is unavailable. SPA client routes should resolve on direct navigation.
- Use the same URL, Lighthouse version, viewport preset, throttling, and environment for each before/after comparison. Test mobile and desktop separately. Record redirect targets, authentication, consent banners, and service workers that affect results.
- Use `audit-site.mjs` for at least three runs per representative route and device before a final score claim. Its `summary.md` shows medians and links to individual JSON reports. A single run is useful for diagnosis, not a guarantee.
- Save JSON reports outside the target repository when possible. Avoid committing generated reports or secrets.

## Read the evidence

Run `analyze-report.mjs` on individual reports to surface scored failures and limited evidence. Capture the four category scores, FCP, LCP, Speed Index, TBT, CLS, console errors, and network failures. Read the full JSON and inspect the actual elements or requests behind important findings. Determine whether the cause is project code, the server, a third party, or a limitation of the test environment.

Prioritize severe accessibility or functional issues, then largest user-facing performance gains, then SEO and remaining audits. Check relevant routes because a perfect homepage does not imply a perfect application.
