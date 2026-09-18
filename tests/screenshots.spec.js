import { test, expect } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { mockApi, assertNoOverflow } from './fixtures.js'

for (const width of [1440, 1024, 768, 390]) {
  test(`public screenshots at ${width}px`, async ({ page }) => {
    test.setTimeout(60000)
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await mkdir('artifacts/screenshots', { recursive: true })
    await mockApi(page, { authenticated: false })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
    for (const route of [
      '/',
      '/services',
      '/about',
      '/contact',
      '/privacy',
      '/terms',
      '/login',
      '/register',
    ]) {
      await page.goto(route)
      if (await page.locator('.commerce-scene:visible').count()) {
        await expect(page.locator('.commerce-scene:visible')).toHaveAttribute(
          'data-state',
          'ready',
        )
      }
      await page.evaluate(async () => {
        await document.fonts.ready
        await Promise.all(
          [...document.images].map((image) => {
            image.loading = 'eager'
            return image.decode()
          }),
        )
      })
      await assertNoOverflow(page, expect)
      await page.screenshot({
        path: `artifacts/screenshots/${route.slice(1) || 'home'}-${width}.png`,
        fullPage: true,
      })
      if (['/', '/services', '/login'].includes(route)) {
        await page.screenshot({
          path: `artifacts/screenshots/viewport-${route.slice(1) || 'home'}-${width}.png`,
        })
      }
    }
    expect(errors).toEqual([])
  })
  test(`workspace screenshots at ${width}px`, async ({ page }) => {
    await mkdir('artifacts/screenshots', { recursive: true })
    await mockApi(page, { showcase: true })
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
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
      await assertNoOverflow(page, expect)
      await page.screenshot({
        path: `artifacts/screenshots/${route.split('/').pop()}-${width}.png`,
        fullPage: true,
      })
      if (route === '/dashboard/product' || route === '/dashboard/pricing') {
        await page
          .getByRole('tab', {
            name: route.endsWith('/product')
              ? 'Market comparison'
              : 'Market evidence',
          })
          .click()
        await assertNoOverflow(page, expect)
        await page.screenshot({
          path: `artifacts/screenshots/${route.split('/').pop()}-market-${width}.png`,
          fullPage: true,
        })
      }
    }
  })
}
