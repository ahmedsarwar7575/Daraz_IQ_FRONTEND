# SEO and contact delivery

## Public pages and styling

The reference-led public/authentication redesign is preserved. The seller workspace keeps its layout and workflows, with a restrained coral, mint, and lilac palette matching the public site. It does not load decorative 3D scenes.

Public copy now explicitly describes Daraz seller analytics, competitor research, pricing rules, and the Islamabad-based contact team. The provided phone, WhatsApp number, email, and city appear on Contact and in public organization metadata.

## SEO output

`src/shared/seo.js` owns unique page titles, descriptions, canonical URLs, Open Graph/Twitter metadata, and Organization/WebSite/WebPage/SoftwareApplication JSON-LD. No ratings, reviews, user counts, or paid-plan prices are invented.

`npm run build` prerenders eight public/auth pages using the real React components. The HTML has readable content before JavaScript; React hydrates it afterward. Both directory indexes and `.html` aliases are emitted so extensionless routes work on common static hosts and Vite preview. Canonical URLs use the existing extensionless routes.

The build also emits:

- `sitemap.xml`, containing only the six indexable public pages.
- `robots.txt`, with the production sitemap URL.
- `noindex, nofollow` HTML for login, register, and every existing dashboard URL.
- A static `404.html` that does not hydrate into the homepage.

The Three.js implementation is lazy-loaded separately from the main app. Its export surface was reduced to the classes used by the scene. The remaining 3D chunk is approximately 140 KB gzipped and still triggers Vite's uncompressed 500 KB advisory. It is not downloaded by the dashboard.

Deployment must serve the generated page files before any generic SPA fallback. Serve `404.html` with HTTP 404 for unknown paths. Preserve HTTPS and consistent host redirects, and submit `https://daraziq.store/sitemap.xml` to Search Console after deployment. Search indexing, rankings, and rich-result eligibility are not guaranteed or verified by local tests.

Sources: [Google JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Google organization structured data](https://developers.google.com/search/docs/appearance/structured-data/organization).

## Contact endpoint

`POST /api/contact` accepts a name, one email address, an allowed topic, a 10-4,000 character message, a UUID request ID, and an empty honeypot field.

The endpoint reuses the backend's existing Nodemailer transport and SMTP environment settings. The first email delivers the inquiry to the configured owner, with the sender as Reply-To. The second is a fixed acknowledgement to the sender. Arbitrary user content is never reflected into the acknowledgement, and no HTML supplied by visitors is rendered.

The frontend only reports success after the server confirms the owner message was accepted by SMTP. If the acknowledgement fails, the UI explains that the team still received the inquiry and no resubmission is necessary. SMTP acceptance does not guarantee inbox placement.

Controls include a 12 KB body limit, server validation, origin checking, header-injection rejection, a honeypot, per-IP/per-email limits, and bounded one-hour duplicate-request tracking. These limits and duplicate records are in memory per process. For multiple instances or stricter abuse protection, use a shared limiter/deduplication store or an edge anti-abuse layer. SMTP delivery is not an exactly-once protocol, and provider outages may leave delivery status uncertain.

Existing environment variables: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, and `MAIL_FROM`. No secret values are included in the frontend or documentation. Optional `CONTACT_RECIPIENT` overrides the provided owner address. Configure `TRUST_PROXY_HOPS` only to match the actual trusted reverse-proxy topology; do not blindly trust forwarded IP headers.

SMTP connection and authentication were verified without sending a real test email. Delivery, rejection, and partial-success handling are tested with injected SMTP transports. Configure SPF/DKIM/DMARC with the actual sender-domain provider for deliverability; DNS records were not modified.

## Local preview

The contact-only preview loads the existing SMTP settings without connecting to or synchronizing the database:

```sh
# backend
npm run dev:contact
# frontend, separate terminal
VITE_CONTACT_API_URL=http://127.0.0.1:4001/api npm run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

This local form sends real emails when submitted. Automated browser tests intercept requests and never send real inquiries. In production, leave `VITE_CONTACT_API_URL` unset to use the existing `VITE_API_URL` backend. Deploy the backend endpoint as well as the frontend build.

## Verification

Run commands sequentially, especially Playwright tests and screenshots:

```sh
# backend
npm test
npm run check
# frontend
npm run lint
npm run build
npm run check:seo
npm test
npm run screenshots
```

The SEO checks inspect emitted HTML and open production pages with and without JavaScript, including canonical aliases and hydration. Browser checks cover the 3D canvas, motion settings, authentication, contact success/error/partial delivery, dashboard workflows, accessibility, and the four requested widths.
