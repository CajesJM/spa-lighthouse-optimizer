# Optimization guidance

Use the sections tied to observed Lighthouse findings. Confirm the result in a browser and a new report.

## Performance

- LCP: inspect the reported LCP element and request waterfall. Improve image size/format, preload or high priority only for the actual LCP asset, remove unnecessary discovery delays, and inspect server response time.
- CLS: reserve dimensions for images, embeds, and dynamically inserted UI; inspect fonts and late content. Do not hide layout movement with arbitrary fixed heights.
- TBT and responsiveness: profile long tasks. Reduce unnecessary startup JavaScript, duplicate requests, rerenders, and main-thread animations. Code-split or defer work when it is not needed for the initial view.
- Assets: measure real source dimensions and display sizes. Use responsive sources and suitable compression where beneficial; keep original assets recoverable. Lazy-load below-the-fold images, not the LCP image.
- Fonts and CSS: load only needed faces/weights, avoid render-blocking imports where practical, and check the visual result of font-display changes.
- Cache and network: inspect actual response headers and compression. Change server or hosting configuration only when it is inside authorized scope.

## Accessibility

Repair semantics, labels, contrast, focus visibility/order, keyboard operation, alt text, and motion behavior according to the failing element. Automated scores do not replace manual keyboard checks. Retest interactions after changes.

## Best Practices

Investigate console errors, insecure requests, and failed resources. Do not suppress errors merely to improve the audit. Check whether third-party scripts or deployment headers cause the finding.

## SEO

Check page title, meta description, canonical URL, indexability, crawlable links, valid robots/sitemap configuration, and route-specific metadata where appropriate. A client-rendered SPA may need prerendering or server rendering for reliable discovery; recommend an architecture change only when evidence justifies it and the user authorizes that scope.

## Score integrity

Do not disable features, hide content from Lighthouse, condition behavior on the test runner, or alter Lighthouse settings between baseline and result. Explain any failure that depends on hosting or third-party systems.
