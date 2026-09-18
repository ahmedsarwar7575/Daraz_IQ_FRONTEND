import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mockApi } from './fixtures.js'

for (const width of [1440, 390]) {
  for (const authenticated of [false, true]) {
    test(`accessibility at ${width}px on ${authenticated ? 'workspace' : 'public'} pages`, async ({ page }) => {
      test.setTimeout(120000)
      await mockApi(page, { authenticated, showcase: true })
      await page.setViewportSize({ width, height: 1000 })
      const routes = authenticated
        ? ['/dashboard', '/dashboard/store', '/dashboard/product', '/dashboard/pricing', '/dashboard/mcp', '/dashboard/settings']
        : ['/', '/services', '/about', '/contact', '/privacy', '/terms', '/login', '/register']
      const violations = []
      for (const route of routes) {
        await page.goto(route)
        await expect(page.locator('.skeleton-set')).toHaveCount(0)
        const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
        violations.push(...result.violations.map((violation) => ({ route, id: violation.id, nodes: violation.nodes.map((node) => ({ target: node.target, failure: node.failureSummary })) })))
      }
      expect(violations).toEqual([])
    })
  }
}
