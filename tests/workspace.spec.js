import { test, expect } from '@playwright/test'
import { mockApi, assertNoOverflow } from './fixtures.js'
import { pricingChecks } from '../src/features/copilot/pricing.js'
import { formatCurrency, formatNumber } from '../src/shared/format.js'

test('price chart axes and keyboard tooltips stay readable after resizing', async ({
  page,
}) => {
  await mockApi(page, { showcase: true })
  await page.goto('/dashboard/pricing')
  await page.getByRole('tab', { name: 'Market evidence' }).click()
  const chart = page.locator('.chart > svg')
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    await expect
      .poll(() =>
        chart.evaluate((svg) =>
          Math.abs(
            svg.viewBox.baseVal.width - svg.getBoundingClientRect().width,
          ),
        ),
      )
      .toBeLessThan(2)
    const labelHeight = await chart
      .locator('text')
      .first()
      .evaluate((text) => text.getBoundingClientRect().height)
    expect(labelHeight).toBeGreaterThanOrEqual(10)
    await chart.locator('rect[tabindex]').first().focus()
    await expect(page.locator('.chart-tooltip')).toContainText('listings')
    await assertNoOverflow(page, expect)
  }
})

test('pricing errors remain visible inside the confirmation dialog', async ({
  page,
}) => {
  await mockApi(page, { fail: ['/copilot/pricing/reprice'] })
  await page.goto('/dashboard/pricing')
  await page.getByRole('button', { name: 'Analyze price', exact: true }).click()
  await page
    .getByRole('button', { name: 'Log recommendation', exact: true })
    .click()
  await page.getByRole('button', { name: 'Confirm & log' }).click()
  await expect(page.getByRole('dialog').getByRole('alert')).toContainText(
    'Test service unavailable',
  )
  await expect(
    page.getByRole('button', { name: 'Confirm & log' }),
  ).toBeEnabled()
})

test('mobile pricing keeps the product readable and primary action in the first viewport', async ({
  page,
}) => {
  await mockApi(page, { showcase: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/dashboard/pricing')
  const title = page.locator('.pricing-product h2')
  await expect(title).toContainText('AuroraSound')
  const box = await title.boundingBox()
  expect(box.width).toBeGreaterThan(240)
  expect(box.height).toBeLessThan(120)
  const action = await page
    .getByRole('button', { name: 'Analyze price', exact: true })
    .boundingBox()
  expect(action.y + action.height).toBeLessThan(844)
})

test('edited demo inputs cannot reuse an unrelated sample recommendation', async ({
  page,
}) => {
  await mockApi(page, { connected: false })
  await page.goto('/dashboard/pricing')
  await page.getByText('Analysis inputs', { exact: true }).click()
  await page.getByLabel('Current price (PKR)', { exact: true }).fill('1')
  await expect(
    page.getByRole('heading', { name: 'No recommendation yet' }),
  ).toBeVisible()
})

test('Daraz connection opens the authorization URL returned by the API', async ({
  page,
}) => {
  const calls = await mockApi(page, { connected: false })
  await page.goto('/dashboard')
  await page.getByRole('button', { name: 'Connect Daraz', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Synthetic Daraz authorization' }),
  ).toBeVisible()
  expect(calls.some((call) => call.path === '/daraz/connect')).toBe(true)
})

test('password sign-in and expired-session handling preserve authentication', async ({
  page,
}) => {
  await mockApi(page, { authenticated: false })
  await page.goto('/login')
  await page.getByLabel('Email address').fill('seller@example.com')
  await page
    .getByLabel('Password', { exact: true })
    .fill('SyntheticTestPassword123')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  await page.route('**/api/settings/ai', (route) =>
    route.fulfill({
      status: 401,
      json: { error: { code: 'SESSION_EXPIRED', message: 'Session expired.' } },
    }),
  )
  await page.getByRole('link', { name: 'Settings', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Welcome back', exact: true }),
  ).toBeVisible()
  expect(
    await page.evaluate(() => localStorage.getItem('daraz_console_session')),
  ).toBe(null)
})

test('missing numeric data stays missing and pricing checks match the cost-floor contract', () => {
  expect(formatCurrency(null)).toBe('-')
  expect(formatNumber(undefined)).toBe('-')
  expect(formatNumber(0)).toBe('0')
  const checks = pricingChecks({
    currentPrice: 1000,
    recommendedPrice: 900,
    cost: 880,
    guardrails: {
      minMarginPercent: 5,
      maxDeltaPercent: 5,
      priceFloor: 950,
      priceCeiling: 1100,
      maxRepricesPerSkuPerDay: 3,
    },
  })
  expect(checks.map((check) => check.passed)).toEqual([
    false,
    false,
    false,
    true,
    null,
  ])
  expect(
    pricingChecks({
      currentPrice: 1000,
      recommendedPrice: 1000,
      cost: null,
      guardrails: { minMarginPercent: 5, maxDeltaPercent: 15 },
    })[1].passed,
  ).toBe(null)
})

test('live empty data never falls back to demo products or conclusions', async ({
  page,
}) => {
  await mockApi(page, { empty: true })
  await page.goto('/dashboard/product')
  await expect(
    page.getByRole('heading', { name: 'Select a product to begin' }),
  ).toBeVisible()
  await expect(page.getByText('AuroraSound', { exact: false })).toHaveCount(0)
  await expect(page.getByText('Demo data', { exact: true })).toHaveCount(0)
  await page.goto('/dashboard/pricing')
  await expect(
    page.getByRole('button', { name: 'Analyze price', exact: true }),
  ).toBeDisabled()
  await expect(
    page.getByRole('heading', { name: 'No recommendation yet' }),
  ).toBeVisible()
  await page.goto('/dashboard/store')
  await expect(
    page.getByRole('heading', { name: 'Your store review starts here' }),
  ).toBeVisible()
})

test('product selection, analysis, pagination and pricing handoff preserve API inputs', async ({
  page,
}) => {
  const calls = await mockApi(page)
  await page.goto('/dashboard/product')
  await expect(page.locator('.product-snapshot h2')).toContainText(
    'AuroraSound',
  )
  await page
    .getByRole('button', { name: 'Analyze product', exact: true })
    .click()
  await expect(page.locator('.product-verdict')).toBeVisible()
  await page.getByRole('tab', { name: 'Market comparison' }).click()
  await expect(page.locator('.market-table tbody tr')).toHaveCount(5)
  await page.getByRole('button', { name: 'Next listings' }).click()
  await expect(page.getByText('6-10 of 12 listings')).toBeVisible()
  await page.getByLabel('Filter listings').fill('Karachi')
  await expect(page.getByText('1-3 of 3 listings')).toBeVisible()
  await page.getByRole('tab', { name: 'Overview', exact: true }).click()
  await page
    .getByRole('button', { name: 'Review pricing', exact: true })
    .click()
  await expect(page).toHaveURL(/\/dashboard\/pricing$/)
  await expect(page.locator('.pricing-product')).toContainText('AUR-EB-X7-BLK')
  await page.getByRole('button', { name: 'Change product' }).click()
  const dialog = page.getByRole('dialog', { name: 'Select product' })
  await dialog.getByLabel('Search products').fill('NovaFit')
  await dialog.locator('.product-option').click()
  await expect(page.locator('.pricing-product')).toContainText(
    'NOVA-FIT-S2-GRY',
  )
  await page.getByRole('button', { name: 'Analyze price', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Log recommendation', exact: true }),
  ).toBeVisible()
  expect(
    calls.find((call) => call.path === '/copilot/pricing/analyze').body,
  ).toMatchObject({
    sku: 'NOVA-FIT-S2-GRY',
    currentPrice: '6990',
    cost: '4550',
    refresh: true,
  })
})

test('pricing requires explicit confirmation and records audit history', async ({
  page,
}) => {
  const calls = await mockApi(page)
  await page.goto('/dashboard/pricing')
  await expect(page.locator('.pricing-product')).toContainText('AUR-EB-X7-BLK')
  await page.getByRole('button', { name: 'Analyze price', exact: true }).click()
  await page.getByRole('tab', { name: 'Risk checks' }).click()
  await expect(
    page.locator('.risk-row').filter({ hasText: 'Maximum price movement' }),
  ).toContainText('Passed')
  await expect(
    page.locator('.risk-row').filter({ hasText: 'Daily limit' }),
  ).toContainText('Not verified')
  await page
    .getByRole('button', { name: 'Log recommendation', exact: true })
    .click()
  expect(
    calls.filter((call) => call.path === '/copilot/pricing/reprice'),
  ).toHaveLength(0)
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Cancel', exact: true })
    .click()
  expect(
    calls.filter((call) => call.path === '/copilot/pricing/reprice'),
  ).toHaveLength(0)
  await page
    .getByRole('button', { name: 'Log recommendation', exact: true })
    .click()
  await expect(page.getByRole('dialog')).toContainText('AUR-EB-X7-BLK')
  await page.getByRole('button', { name: 'Confirm & log' }).click()
  await expect(page.locator('.latest-log')).toContainText(
    'Daraz price unchanged',
  )
  await page.getByRole('button', { name: 'Refresh history' }).click()
  await expect(
    page
      .getByRole('region', { name: 'Pricing action history' })
      .locator('tbody tr'),
  ).toHaveCount(1)
  expect(
    calls.filter((call) => call.path === '/copilot/pricing/reprice'),
  ).toHaveLength(1)
})

test('editing pricing inputs invalidates the previous recommendation', async ({
  page,
}) => {
  await mockApi(page)
  await page.goto('/dashboard/pricing')
  await page.getByRole('button', { name: 'Analyze price', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Log recommendation', exact: true }),
  ).toBeVisible()
  await page.getByText('Analysis inputs', { exact: true }).click()
  await page.getByLabel('Current price (PKR)').fill('8000')
  await expect(
    page.getByRole('button', { name: 'Log recommendation', exact: true }),
  ).toHaveCount(0)
  await expect(
    page.getByRole('heading', { name: 'No recommendation yet' }),
  ).toBeVisible()
})

test('guardrail validation, save, and live-write preference confirmation', async ({
  page,
}) => {
  const calls = await mockApi(page)
  await page.goto('/dashboard/pricing')
  await page.getByRole('button', { name: 'Pricing rules', exact: true }).click()
  const dialog = page.getByRole('dialog', { name: 'Pricing rules' })
  await dialog.getByLabel('Maximum price movement (%)').fill('10')
  await dialog.getByLabel('Allow live writes when available').check()
  await dialog.getByRole('button', { name: 'Save pricing rules' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Allow future live price writes?' }),
  ).toBeVisible()
  expect(
    calls.filter(
      (call) =>
        call.path === '/copilot/pricing/guardrails' && call.method === 'PUT',
    ),
  ).toHaveLength(0)
  await page.getByRole('button', { name: 'Save preference' }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'Pricing rules saved' }),
  ).toBeVisible()
  expect(
    calls.find(
      (call) =>
        call.path === '/copilot/pricing/guardrails' && call.method === 'PUT',
    ).body,
  ).toMatchObject({ maxDeltaPercent: '10', liveWritesEnabled: true })
})

test('settings show one provider and confirm personal-key removal', async ({
  page,
}) => {
  const calls = await mockApi(page)
  await page.goto('/dashboard/settings')
  await expect(
    page.getByText('Using platform credentials', { exact: true }),
  ).toBeVisible()
  await page.getByLabel('Provider', { exact: true }).selectOption('openai')
  await expect(page.getByText('Personal key saved securely')).toBeVisible()
  await expect(page.locator('input[type=password]')).toHaveCount(1)
  await expect(page.locator('input[type=password]')).toHaveValue('')
  await page.getByRole('button', { name: 'Remove key', exact: true }).click()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByText('Removal pending')).toHaveCount(0)
  await page.getByRole('button', { name: 'Remove key', exact: true }).click()
  await page.getByRole('button', { name: 'Mark for removal' }).click()
  await page.getByRole('button', { name: 'Save settings' }).click()
  await expect(
    page.getByText('Missing configuration', { exact: true }),
  ).toBeVisible()
  expect(
    calls.find((call) => call.path === '/settings/ai' && call.method === 'PUT')
      .body,
  ).toMatchObject({
    activeProvider: 'openai',
    clearOpenaiKey: true,
    openaiApiKey: '',
  })
})

test('store review sends the selected range and AI is on demand', async ({
  page,
}) => {
  const calls = await mockApi(page)
  await page.goto('/dashboard/store')
  await expect(
    page.getByRole('heading', { name: 'No brief generated' }),
  ).toHaveCount(0)
  await page.getByLabel('From', { exact: true }).fill('2026-08-01')
  await page.getByLabel('To', { exact: true }).fill('2026-08-31')
  await page
    .getByRole('button', { name: 'Review store', exact: true })
    .first()
    .click()
  await expect(
    page.getByRole('heading', { name: 'Findings & next steps' }),
  ).toBeVisible()
  expect(
    calls.find((call) => call.path === '/copilot/store/analyze').body,
  ).toMatchObject({ from: '2026-08-01', to: '2026-08-31' })
  await page.getByRole('button', { name: 'AI brief', exact: true }).click()
  await page.getByRole('button', { name: 'Generate brief' }).click()
  await expect(page.getByRole('dialog')).toContainText('Synthetic test brief')
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await expect(
    page.getByRole('button', { name: 'AI brief', exact: true }),
  ).toBeFocused()
})

test('mobile drawer, keyboard tabs, and disconnect confirmation work', async ({
  page,
}) => {
  const calls = await mockApi(page)
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/dashboard')
  await page.getByRole('button', { name: 'Open navigation' }).click()
  await expect(
    page.getByRole('dialog', { name: 'Workspace navigation' }),
  ).toBeVisible()
  await page.getByRole('link', { name: 'Products', exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard\/product$/)
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('tab', { name: 'Overview', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await expect(
    page.getByRole('tab', { name: 'Market comparison' }),
  ).toHaveAttribute('aria-selected', 'true')
  await assertNoOverflow(page, expect)
  await page.getByRole('button', { name: 'Daraz connected' }).click()
  await page
    .getByRole('button', { name: 'Disconnect Daraz', exact: true })
    .click()
  expect(calls.filter((call) => call.method === 'DELETE')).toHaveLength(0)
  await page
    .getByRole('button', { name: 'Disconnect account', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Store not connected' }),
  ).toBeVisible()
  expect(calls.filter((call) => call.method === 'DELETE')).toHaveLength(1)
})

test('disconnected demo mode is labeled and cannot write sample prices', async ({
  page,
}) => {
  const calls = await mockApi(page, { connected: false })
  await page.goto('/dashboard/pricing')
  await expect(page.getByText('Demo data').first()).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Store not connected' }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Analyze price', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Log recommendation', exact: true }),
  ).toHaveCount(0)
  expect(
    calls.filter((call) => call.path === '/copilot/pricing/reprice'),
  ).toHaveLength(0)
})

test('MCP setup copies the endpoint without exposing identity or claiming authorization', async ({
  page,
  context,
}) => {
  await mockApi(page)
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/dashboard/mcp')
  await expect(page.getByText('seller@example.com')).not.toBeVisible()
  await expect(
    page.getByText('get_store_metrics', { exact: true }),
  ).not.toBeVisible()
  await page.getByRole('button', { name: 'Copy endpoint', exact: true }).click()
  await expect(
    page.getByRole('status').filter({ hasText: 'endpoint copied' }),
  ).toBeVisible()
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(
    /\/api\/mcp$/,
  )
  await page.getByText('Developer details', { exact: true }).click()
  await expect(
    page.getByText('get_store_metrics', { exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Connect AI client' }).click()
  await expect(page.getByRole('dialog')).toContainText(
    'Authorization starts in the client.',
  )
})

test('registration and email verification keep the existing authentication contract', async ({
  page,
}) => {
  const calls = await mockApi(page, { authenticated: false })
  await page.goto('/register')
  await page.getByLabel('Full name').fill('Demo Seller')
  await page.getByLabel('Email address').fill('seller@example.com')
  await page
    .getByLabel('Password', { exact: true })
    .fill('SyntheticTestPassword123')
  await page
    .getByRole('button', { name: 'Create account', exact: true })
    .click()
  await expect(
    page.getByRole('heading', { name: 'Verify your email' }),
  ).toBeVisible()
  await page.getByLabel('6-digit code').fill('123456')
  await page.getByRole('button', { name: 'Verify and continue' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  expect(calls.some((call) => call.path === '/auth/register')).toBe(true)
  expect(calls.some((call) => call.path === '/auth/verify-email')).toBe(true)
})

test('passwordless sign-in requests and verifies a one-time code', async ({
  page,
}) => {
  const calls = await mockApi(page, { authenticated: false })
  await page.goto('/login')
  await page.getByRole('button', { name: 'Sign in with email code' }).click()
  await page.getByLabel('Email address').fill('seller@example.com')
  await page.getByRole('button', { name: 'Send sign-in code' }).click()
  await page.getByLabel('6-digit code').fill('123456')
  await page.getByRole('button', { name: 'Verify and sign in' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
  expect(calls.some((call) => call.path === '/auth/request-otp')).toBe(true)
  expect(calls.some((call) => call.path === '/auth/verify-otp')).toBe(true)
})

test('contact sends a validated inquiry and confirms the SMTP result', async ({
  page,
}) => {
  const { calls } = await mockApi(page, { authenticated: false })
  await page.goto('/contact')
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  expect(calls.filter((call) => call.path === '/contact')).toHaveLength(0)
  await page.getByLabel('Name', { exact: true }).fill('Demo Seller')
  await page.getByLabel('Email address').fill('seller@example.com')
  await page
    .getByLabel('What can we help with?')
    .selectOption('Product feedback')
  await page
    .getByLabel('Message', { exact: true })
    .fill('Synthetic feedback for a browser test.')
  await page.getByRole('button', { name: 'Send message', exact: true }).click()
  await expect(page.getByRole('status')).toContainText(
    'Your message has been sent to the Daraz IQ team.',
  )
  await expect(
    page.getByText('A confirmation email has also been sent to you.', {
      exact: false,
    }),
  ).toBeVisible()
  const messages = calls.filter((call) => call.path === '/contact')
  expect(messages).toHaveLength(1)
  expect(messages[0].body.email).toBe('seller@example.com')
  expect(messages[0].body.requestId).toMatch(/^[0-9a-f-]{36}$/)
  await expect(
    page.getByRole('button', { name: 'Send message', exact: true }),
  ).toBeDisabled()
  await page.getByRole('button', { name: 'Send another message' }).click()
  await expect(page.getByLabel('Email address')).toHaveValue('')
})

for (const partial of [false, true]) {
  test(`contact preserves truthful ${partial ? 'partial delivery' : 'failure'} feedback`, async ({
    page,
  }) => {
    await mockApi(page, {
      authenticated: false,
      fail: partial ? [] : ['/contact'],
    })
    if (partial)
      await page.route('**/api/contact', (route) =>
        route.fulfill({
          json: {
            sent: true,
            confirmationSent: false,
            reference: 'synthetic-reference',
          },
        }),
      )
    await page.goto('/contact')
    await page.getByLabel('Name', { exact: true }).fill('Demo Seller')
    await page.getByLabel('Email address').fill('seller@example.com')
    await page
      .getByLabel('Message', { exact: true })
      .fill('Please help with this synthetic inquiry.')
    await page
      .getByRole('button', { name: 'Send message', exact: true })
      .click()
    if (partial) {
      await expect(
        page.getByText('We could not send the confirmation email', {
          exact: false,
        }),
      ).toBeVisible()
      await expect(page.getByRole('status')).toContainText(
        'Your message has been sent',
      )
    } else {
      await expect(page.getByRole('alert')).toContainText(
        'Test service unavailable',
      )
      await expect(page.getByLabel('Email address')).toHaveValue(
        'seller@example.com',
      )
      await expect(
        page.getByRole('button', { name: 'Send message', exact: true }),
      ).toBeEnabled()
      await expect(page.getByRole('status')).toHaveCount(0)
    }
  })
}

test('failed settings and store requests show errors without fake readiness', async ({
  page,
}) => {
  await mockApi(page, { fail: ['/settings/ai', '/daraz/status'] })
  await page.goto('/dashboard/settings')
  await expect(
    page.getByRole('heading', { name: 'Settings could not be loaded' }),
  ).toBeVisible()
  await expect(page.getByText('Using platform credentials')).toHaveCount(0)
  await expect(page.getByText('Demo data', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Retry', exact: true }).click()
  await expect(page.getByRole('alert').last()).toContainText(
    'Test service unavailable',
  )
})

for (const width of [1440, 1024, 768, 390]) {
  test(`all routes are responsive with loaded images and no browser errors at ${width}px`, async ({
    page,
  }) => {
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await mockApi(page, { showcase: true })
    await page.setViewportSize({ width, height: 1000 })
    for (const route of [
      '/dashboard',
      '/dashboard/store',
      '/dashboard/product',
      '/dashboard/pricing',
      '/dashboard/mcp',
      '/dashboard/settings',
    ]) {
      await page.goto(route)
      await expect(page.locator('.skeleton-set')).toHaveCount(0)
      await expect(page.locator('main h1')).toHaveCount(1)
      await assertNoOverflow(page, expect)
      const broken = await page.evaluate(() =>
        [...document.images]
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.src),
      )
      expect(broken).toEqual([])
    }
    expect(errors).toEqual([])
  })
}
