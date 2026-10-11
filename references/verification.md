# Verification and stopping criteria

1. Review the diff for unrelated changes and inspect any preexisting user edits.
2. Run the least costly check that covers each change: build for bundling changes, targeted tests for behavior, browser checks for layout/interaction/animation, and Lighthouse for score claims.
3. Check direct navigation and reload on representative SPA routes. Test relevant viewport widths, keyboard access, and reduced motion when affected.
4. Compare the same URL and Lighthouse mode before and after. Record all four scores and key metrics. Investigate regressions rather than trading away a category silently.
5. A local production build score does not establish a deployed score. After authorized deployment, rerun production measurements. Without deployment authorization, state that production remains unverified.
6. Stop when targets are met with stable results, remaining work requires outside access or authorization, or further optimization would damage required behavior. Give precise remaining findings and evidence rather than claiming 100.
