# daraziq.store Frontend

Professional React dashboard for daraziq.store, a Daraz seller intelligence SaaS that helps marketplace sellers connect their Daraz account, inspect store performance, benchmark products, use AI-assisted workflows, and expose the same business tools through an MCP connector.

This frontend is built as a portfolio-grade SaaS interface with a clean, minimal visual system, feature-separated workspace navigation, and a seller-focused dashboard experience.

## Product Overview

daraziq.store gives Daraz sellers one workspace for:

- Connecting and disconnecting their Daraz seller account.
- Viewing store status, seller identity, and high-level operational stats.
- Reviewing store performance through a dedicated Store Analyst page.
- Searching competitor products and benchmarking listings in Product Lab.
- Running guarded pricing analysis in Pricing Control.
- Configuring AI provider settings for OpenAI or OpenRouter.
- Copying and testing the MCP endpoint for external AI clients such as Claude.

The frontend consumes a single Node/Express backend API. The backend owns authentication, Daraz OAuth, encrypted token storage, seller data, AI calls, browser automation, and MCP transport.

## Tech Stack

- React 19
- Vite
- Tailwind CSS 4
- Lucide React icons
- REST API integration
- JWT session storage
- Google Identity Services support

## Application Structure

```txt
frontend/
  src/
    features/
      auth/          # Login, signup, OTP, Google auth UI
      dashboard/     # SaaS shell, navigation, overview
      copilot/       # Store Analyst, Product Lab, Pricing Control, MCP Access
      settings/      # AI provider configuration
    shared/
      api.js         # API client and token persistence
    App.jsx
    main.jsx
    index.css
```

The structure is feature-oriented but intentionally compact. Shared logic is kept small, while each business area has a clear owner file for easier portfolio review.

## Main Screens

- **Overview**: Seller connection status, Daraz account metadata, dashboard KPIs, disconnect action.
- **Store Analyst**: Store metrics, historical snapshots, AI-generated business review, reconnect handling.
- **Product Lab**: Seller product list, competitor search, product health analysis, product cards.
- **Pricing Control**: Price recommendation workflow, guardrails, reprice audit history.
- **MCP Access**: Remote MCP endpoint, available tools, resources, and prompt surface.
- **Settings**: AI provider switch between OpenAI and OpenRouter with model/key configuration.

## Environment Variables

Create a frontend `.env` file:

```env
VITE_API_URL=https://daraz-mcp-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

For local development:

```env
VITE_API_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:5173
```

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Backend Contract

The frontend expects the backend to expose:

- `/api/auth/*` for email/password, OTP, Google sign-in, and session validation.
- `/api/daraz/*` for Daraz OAuth connection and seller account status.
- `/api/copilot/*` for seller analytics, competitor search, AI workflows, and pricing tools.
- `/api/settings/ai` for provider/model/API key configuration.
- `/api/mcp` as the MCP endpoint displayed to users.

## Portfolio Highlights

This frontend demonstrates:

- Building a real SaaS dashboard instead of a static landing page.
- Feature-based React organization.
- Authenticated API consumption with persisted session state.
- Marketplace OAuth connection UX.
- Multi-provider AI settings UX.
- MCP endpoint discovery and user-facing integration guidance.
- Responsive, minimal, professional UI styling with Tailwind.

## Deployment Notes

The frontend can be deployed to Vercel, Netlify, Render Static Sites, or any static hosting provider.

Production requirements:

- Set `VITE_API_URL` to the deployed backend `/api` URL.
- Set `VITE_GOOGLE_CLIENT_ID` if Google login is enabled.
- Ensure the backend CORS configuration allows the deployed frontend domain.
