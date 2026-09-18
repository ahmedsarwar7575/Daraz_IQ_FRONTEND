import { test, expect } from '@playwright/test'
import { mockApi, assertNoOverflow } from './fixtures.js'

async function coloredPixels(page, screenshot, excludeCopy = true) {
  return page.evaluate(
    async ({ bytes, excludeCopy }) => {
      const bitmap = await createImageBitmap(
        new Blob([new Uint8Array(bytes)], { type: 'image/png' }),
      )
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const context = canvas.getContext('2d')
      context.drawImage(bitmap, 0, 0)
      const { data } = context.getImageData(0, 0, canvas.width, canvas.height)
      let colored = 0
      for (let i = 0; i < data.length; i += 16) {
        const x = (i / 4) % canvas.width,
          y = Math.floor(i / 4 / canvas.width)
        // Ignore the central copy/CTA so only the surrounding objects count.
        if (
          excludeCopy &&
          x > canvas.width * 0.28 &&
          x < canvas.width * 0.72 &&
          y < canvas.height * 0.65
        )
          continue
        const max = Math.max(data[i], data[i + 1], data[i + 2])
        const min = Math.min(data[i], data[i + 1], data[i + 2])
        if (max - min > 45 && min < 200) colored++
      }
      bitmap.close()
      return colored
    },
    { bytes: [...screenshot], excludeCopy },
  )
}

for (const width of [1440, 1024, 768, 390]) {
  test(`3D scene is rendered, moving, and pausable at ${width}px`, async ({
    page,
  }) => {
    await mockApi(page, { authenticated: false })
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 })
    await page.goto('/')
    const scene = page.locator('.commerce-scene')
    await expect(scene).toHaveAttribute('data-state', 'ready')
    await expect(scene).toHaveAttribute('data-motion', 'playing')
    const canvas = scene.locator('canvas')
    const first = await canvas.screenshot()
    expect(await coloredPixels(page, first)).toBeGreaterThan(800)
    await page.mouse.move(width * 0.1, 220)
    await page.waitForTimeout(250)
    const second = await canvas.screenshot()
    expect(first.equals(second)).toBe(false)
    await page.getByRole('button', { name: 'Pause animation' }).click()
    await expect(scene).toHaveAttribute('data-motion', 'paused')
    const paused = await canvas.screenshot()
    await page.waitForTimeout(200)
    expect(paused.equals(await canvas.screenshot())).toBe(true)
    await page.getByRole('button', { name: 'Play animation' }).click()
    await expect(scene).toHaveAttribute('data-motion', 'playing')
    const hero = await page.locator('.marketing-hero').boundingBox()
    expect(hero.y + hero.height).toBeLessThan(width === 390 ? 844 : 1000)
    await expect(
      page.locator('.hero-actions').getByRole('button', { name: 'Start free' }),
    ).toBeVisible()
    await assertNoOverflow(page, expect)
  })
}

test('public services, reduced motion, and signup keep a working path', async ({
  page,
}) => {
  await mockApi(page, { authenticated: false })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/services#safer-pricing')
  await expect(page.locator('#safer-pricing')).toBeInViewport()
  await expect(page.locator('.commerce-scene')).toHaveAttribute(
    'data-motion',
    'paused',
  )
  await expect(
    page.getByRole('button', { name: 'Pause animation' }),
  ).toBeHidden()
  await page.getByRole('button', { name: '03 Review', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'You make the call.' }),
  ).toBeVisible()
  await expect(page.locator('img[src*="preview.png"]')).toHaveCount(0)
  await expect(page.locator('[style*="preview.png"]')).toHaveCount(0)
  await page
    .locator('#safer-pricing')
    .getByRole('button', { name: 'Start free' })
    .click()
  await expect(page).toHaveURL(/\/register$/)
  await expect(
    page.getByRole('heading', { name: 'Create your workspace' }),
  ).toBeVisible()
  await expect(page.locator('.commerce-scene')).toHaveAttribute(
    'data-state',
    'ready',
  )
  expect(
    await coloredPixels(
      page,
      await page.locator('.commerce-scene canvas').screenshot(),
      false,
    ),
  ).toBeGreaterThan(800)
})

test('WebGL failure leaves a static illustration and usable login action', async ({
  page,
}) => {
  await mockApi(page, { authenticated: false })
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (
        type === 'webgl' ||
        type === 'webgl2' ||
        type === 'experimental-webgl'
      )
        return null
      return original.call(this, type, ...args)
    }
  })
  await page.goto('/')
  await expect(page.locator('.commerce-scene')).toHaveAttribute(
    'data-state',
    'fallback',
  )
  await expect(page.locator('.scene-fallback')).toBeVisible()
  await page.getByRole('button', { name: 'Log in', exact: true }).click()
  await expect(page).toHaveURL(/\/login$/)
  await expect(
    page.getByRole('heading', { name: 'Welcome back' }),
  ).toBeVisible()
})
