import {
  demoStatus,
  sampleProducts,
  sampleStoreReview,
  sampleCompetitors,
  sampleProductAnalysis,
  samplePriceAnalysis,
} from '../src/shared/demo.js'

export const syntheticUser = {
  id: 'synthetic-seller',
  name: 'Demo Seller',
  email: 'seller@example.com',
}
export const rules = {
  autonomyLevel: 'suggest_only',
  minMarginPercent: 5,
  maxDeltaPercent: 15,
  maxRepricesPerSkuPerDay: 3,
  priceFloor: null,
  priceCeiling: null,
  liveWritesEnabled: false,
}
export const syntheticSettings = {
  activeProvider: 'openrouter',
  defaults: { openaiModel: 'test-model', openrouterModel: 'openrouter/free' },
  providers: {
    openrouter: {
      model: 'openrouter/free',
      hasUserKey: false,
      hasPlatformKey: true,
      ready: true,
    },
    openai: {
      model: 'test-model',
      hasUserKey: true,
      hasPlatformKey: false,
      ready: true,
    },
  },
}

// Every API request is intercepted. These records represent no real seller.
export async function mockApi(
  page,
  {
    authenticated = true,
    connected = true,
    showcase = false,
    empty = false,
    fail = [],
    delay = 0,
  } = {},
) {
  const calls = []
  const logs = []
  let savedSettings = structuredClone(syntheticSettings)
  let savedRules = { ...rules }
  if (authenticated)
    await page.addInitScript((user) => {
      localStorage.setItem(
        'daraz_console_session',
        'synthetic-session-not-valid',
      )
      localStorage.setItem('daraz_console_user', JSON.stringify(user))
    }, syntheticUser)
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const pathname = new URL(request.url()).pathname.replace(/^\/api/, '')
    const body = request.postDataJSON()
    calls.push({ path: pathname, method: request.method(), body })
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay))
    if (fail.includes(pathname))
      return route.fulfill({
        status: 503,
        json: { error: { message: 'Test service unavailable.' } },
      })
    const products = empty
      ? []
      : sampleProducts.map((product) => ({
          ...product,
          source: showcase ? 'Demo data' : 'Synthetic test catalog',
        }))
    const competitors = {
      ...sampleCompetitors,
      source: showcase ? 'Demo data' : 'Synthetic test market',
      products: sampleCompetitors.products,
    }
    let result
    switch (pathname) {
      case '/contact':
        result = {
          sent: true,
          confirmationSent: true,
          reference: 'synthetic-contact-reference',
        }
        break
      case '/auth/me':
        result = { user: syntheticUser }
        break
      case '/auth/register':
      case '/auth/request-otp':
        result = { success: true }
        break
      case '/auth/login':
      case '/auth/verify-email':
      case '/auth/verify-otp':
      case '/auth/google':
        result = { token: 'synthetic-session-not-valid', user: syntheticUser }
        break
      case '/daraz/status':
        result = connected
          ? {
              ...demoStatus,
              showcase,
              connection: {
                ...demoStatus.connection,
                sellerName: 'Demo Store',
                sellerId: 'SYNTHETIC-ID',
              },
              stats: empty
                ? {
                    products: 0,
                    ordersLast30Days: 0,
                    revenue: null,
                    synced: 0,
                    totalSources: 3,
                    charts: {},
                  }
                : demoStatus.stats,
            }
          : { connected: false }
        break
      case '/daraz/connect':
        result = {
          authorizationUrl: 'http://127.0.0.1:5174/authorization-test',
        }
        break
      case '/daraz/connection':
        result = { connected: false }
        break
      case '/copilot/manifest':
        result = {
          tools: [
            'get_store_metrics',
            'analyze_product',
            'analyze_price',
            'apply_reprice',
          ],
          resources: ['store://metrics/latest'],
          prompts: ['weekly_store_review'],
        }
        break
      case '/copilot/products':
        result = { products, showcase }
        break
      case '/copilot/pricing/guardrails':
        if (request.method() === 'PUT') savedRules = { ...savedRules, ...body }
        result = { guardrails: savedRules }
        break
      case '/copilot/store/analyze':
        result = {
          ...sampleStoreReview,
          showcase,
          range: {
            from: body.from || '2026-08-10',
            to: body.to || '2026-09-08',
          },
          fetchedAt: '2026-09-08T16:00:00Z',
        }
        break
      case '/copilot/competitors/search':
        result = competitors
        break
      case '/copilot/products/analyze':
        result = {
          ...sampleProductAnalysis,
          ownProduct: products.find((p) => p.sku === body.sku) || products[0],
          competitors,
          showcase,
        }
        break
      case '/copilot/pricing/analyze':
        result = {
          ...samplePriceAnalysis,
          sku: body.sku,
          currentPrice: Number(body.currentPrice),
          cost: body.cost === '' ? null : Number(body.cost),
          guardrails: savedRules,
          competitors,
          showcase,
        }
        break
      case '/copilot/pricing/reprice': {
        const log = {
          id: 'synthetic-log',
          sku: body.sku,
          oldPrice: body.currentPrice,
          requestedPrice: body.price,
          newPrice: body.price,
          reason: body.reason,
          createdAt: '2026-09-08T16:30:00Z',
          status: 'suggested',
          guardrailResult: {
            blocked: false,
            clamped: false,
            runsToday: 0,
            liveWrite: false,
          },
        }
        logs.unshift(log)
        result = {
          applied: false,
          log,
          message: 'Recommendation logged. Daraz price unchanged.',
        }
        break
      }
      case '/copilot/ai/brief':
        result = {
          brief:
            'Executive summary\nSynthetic test brief generated from intercepted data.',
          providerLabel: 'Test provider',
          model: 'test-model',
          data:
            body.mode === 'store'
              ? { ...sampleStoreReview, showcase }
              : body.mode === 'pricing'
                ? {
                    ...samplePriceAnalysis,
                    competitors,
                    cost: Number(body.cost),
                    guardrails: savedRules,
                  }
                : { ...sampleProductAnalysis, competitors },
        }
        break
      case '/settings/ai': {
        if (request.method() === 'PUT') {
          savedSettings.activeProvider = body.activeProvider
          for (const provider of ['openai', 'openrouter']) {
            savedSettings.providers[provider].model = body[`${provider}Model`]
            if (
              body[
                provider === 'openai' ? 'clearOpenaiKey' : 'clearOpenrouterKey'
              ]
            )
              savedSettings.providers[provider].hasUserKey = false
            if (body[`${provider}ApiKey`])
              savedSettings.providers[provider].hasUserKey = true
            savedSettings.providers[provider].ready =
              savedSettings.providers[provider].hasUserKey ||
              savedSettings.providers[provider].hasPlatformKey
          }
        }
        result = { settings: savedSettings }
        break
      }
      default:
        if (pathname.startsWith('/copilot/pricing/history/')) result = { logs }
        else
          return route.fulfill({
            status: 404,
            json: { error: { message: `Unmocked API route: ${pathname}` } },
          })
    }
    return route.fulfill({ json: result })
  })
  await page.route('**/authorization-test', (route) =>
    route.fulfill({
      contentType: 'text/html',
      body: '<h1>Synthetic Daraz authorization</h1>',
    }),
  )
  return calls
}

export async function assertNoOverflow(page, expect) {
  const dimensions = await page.evaluate(() => ({
    viewport: window.innerWidth,
    scroll: document.documentElement.scrollWidth,
  }))
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport)
}
