# Audit workflow

## Establish comparable measurements

- Read repository instructions and status. Determine the real production build and preview command. Do not assume a framework or package manager.
- Identify the deployed URL and representative public routes. Test a local production build if deployment is unavailable. SPA client routes should resolve on direct navigation.
- Use the same URL, Lighthouse version, viewport preset, throttling, and environment for each before/after comparison. Test mobile and desktop separately. Record redirect targets, authentication, consent banners, and service workers that affect results.
- Prefer at least three runs for a final claim about a variable Performance score. Report individual results and median. A single run is useful for diagnosis, not a guarantee.
- Save JSON reports outside the target repository when possible. Avoid committing generated reports or secrets.

## Read the evidence

Capture the four category scores, FCP, LCP, Speed Index, TBT, CLS, failing audits, console errors, and network failures. Inspect the actual elements or requests behind important findings. Determine whether the cause is project code, the server, a third party, or a limitation of the test environment.

Prioritize severe accessibility or functional issues, then largest user-facing performance gains, then SEO and remaining audits. Check relevant routes because a perfect homepage does not imply a perfect application.
