# Daraz IQ frontend redesign

## Structure

The existing React/Vite application and all public and dashboard URLs are preserved. Authentication, session storage, Daraz OAuth, API requests, AI provider payloads, and server pricing rules retain their existing contracts. The later contact/SEO follow-up adds an SMTP contact endpoint without changing those contracts. See `docs/seo-and-contact.md` for the current implementation and deployment details.

Shared components in `src/shared/ui.jsx` provide page headers, status badges, form controls, KPIs, action rows, tabs, native dialogs, confirmations, feedback, and loading states. `charts.jsx` provides labeled order and price charts. `MarketTable.jsx` adds filtering, sorting, five-row pagination, and mobile listing cards.

The workspace visual system uses a neutral off-white canvas, white surfaces, ink text, orange primary actions, and semantic success/warning colors. The desktop sidebar is 228px wide, collapses to an icon rail on tablets, and becomes a native modal drawer on phones.

## Reference-led public refresh

The supplied `figma-to-html (29).zip` contains a flat reference image. Its centered composition, floating dimensional objects, coral actions, and cyan/lilac accents informed the revised public pages. It was treated as visual reference, not as instructions or an application to embed.

- Home, Services, About, Contact, legal navigation, Login, and Register share the new marketing styling. The dashboard subsequently received a light matching palette update without layout changes.
- Dashboard screenshots are no longer referenced by public or authentication pages. A new generated still life, original animated Three.js objects, and an illustrative product photo replace them.
- Three.js is dynamically imported. Scenes respond to pointer movement, support pause and reduced motion, stop when offscreen or in a background tab, resize without obscuring the copy, and dispose resources on unmount. A bitmap fallback remains usable without WebGL.
- Services links support direct section anchors. The pricing example has working Evidence, Your rules, and Review controls without fictional commercial results.
- Existing authentication handlers, validation, passwordless login, and Google setup are preserved. Contact drafts were replaced by real SMTP delivery. The original legal text remains, with an added factual contact-inquiry privacy section.
- Asset provenance and the generation prompt are in `docs/assets.md`.

## Feature locations

| Existing route | New experience | Preserved detail and actions |
| --- | --- | --- |
| `/` | Product-led home | Animated seller toolkit, outcomes, workflow, security, FAQ, signup |
| `/services` | Workflow examples | Store analysis, product photography, interactive pricing explanation, AI integration context |
| `/about` | Product mission | Seller problem and operating principles |
| `/contact` | Topic-based contact form | Validated SMTP inquiry, sender acknowledgement, phone, WhatsApp, email, and city |
| `/privacy`, `/terms` | Readable legal pages | Existing legal text, section anchors and table of contents |
| `/login`, `/register` | Illustrated split authentication | Animated seller objects, password login, email-code login, signup, verification and configured Google sign-in |
| `/dashboard` | Today's priorities | Four KPIs, order trend/bar view, fulfillment tab, best sellers, connection drawer |
| `/dashboard/store` | Store Insights | Date range, store review, source health, fulfillment, findings, on-demand AI brief |
| `/dashboard/product` | Products | Searchable catalog; Overview, Market comparison, Listing quality and AI brief tabs |
| `/dashboard/pricing` | Guided pricing | Product selection, analysis inputs, recommendation, evidence, risk checks, rules drawer, confirmation and history |
| `/dashboard/mcp` | Integrations | Endpoint copy, client setup, OAuth context and expandable tools/resources/prompts |
| `/dashboard/settings` | AI settings | Selected provider/model, credential state, password-style key input, confirmed key removal, save |

The former product heatmap is now a labeled catalog comparison table. Order visualizations are consolidated into the trend/bar toggle and fulfillment distribution. Account details and Daraz disconnection remain accessible in menus/dialogs.

## Data and pricing

- Synthetic fixtures are isolated in `src/shared/demo.js`. The fixtures were moved from the original frontend and are explicitly marked as demo data.
- Missing live metrics render as unavailable, not zero. Missing live products, analyses, AI briefs and settings do not fall back to sample records.
- Product and pricing input changes invalidate prior analysis. Sample recommendations only match the original demo product inputs.
- Pricing rule checks use the existing backend formula: `minMarginPercent` is a percentage above cost. Gross margin is displayed separately and excludes marketplace fees.
- Daily reprice limits are marked unverified until the server checks them. Server results and audit history remain authoritative.
- Recording a recommendation requires confirmation. Demo prices cannot be logged against the authenticated account.

## Verification

```sh
npm install
npx playwright install chromium
npm run lint
npm test
npm run screenshots
npm run build
npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

Browser tests intercept all API requests and use synthetic identities. They exercise authentication, session expiry, product selection, market pagination, pricing payloads/confirmation/history, settings/key removal, date ranges, AI briefs, clipboard behavior, dialogs, error states, and empty/demo states. Marketing tests additionally check canvas pixels, motion/pause, reduced motion, WebGL fallback, and service-to-signup navigation. Run test and screenshot commands sequentially because Playwright clears its shared artifact directory at startup.

Automated axe checks scan every public and workspace page at desktop and mobile widths for WCAG A/AA issues. Keyboard tests cover tab selection, dialog dismissal and focus return. These checks complement visual inspection and do not replace a full assistive-technology audit.

Screenshot coverage includes all 14 pages at 1440, 1024, 768 and 390px. Captures are saved under `artifacts/screenshots/` and are verification artifacts only, not in-app marketing assets. Public captures use reduced motion for deterministic 3D positioning. Regenerate them after layout changes with `npm run screenshots`.

The repository is JavaScript and has no TypeScript project or standalone type-check command. ESLint and the production build validate source syntax; browser tests exercise the runtime contracts.

## Existing service limits

- The repricing backend currently records recommendations and always reports no live marketplace write. The UI does not promise a live update.
- The backend has no OAuth connection-list or token-revocation endpoint. Integrations explains client-side removal and provides the existing support contact for account-wide access removal. It does not invent an authorization status.
- Contact email now uses the added SMTP endpoint. Per-process rate limits, delivery caveats, and deployment requirements are documented in `docs/seo-and-contact.md`.
- Production credentials, live Daraz writes, real AI charges and Google OAuth were not exercised by browser tests.
