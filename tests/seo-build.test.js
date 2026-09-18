import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { parse } from 'parse5'
import { preview } from 'vite'
import { chromium } from '@playwright/test'
import { publicSeo } from '../src/shared/seo.js'

const nodes = (node, predicate) => [
  ...(predicate(node) ? [node] : []),
  ...(node.childNodes || []).flatMap((child) => nodes(child, predicate)),
]
const attr = (node, key) => node.attrs?.find((item) => item.name === key)?.value
const content = (node) =>
  node.value || (node.childNodes || []).map(content).join('')

test('built HTML contains unique SEO metadata, content, and truthful structured data', async () => {
  const titles = new Set()
  for (const [page, seo] of Object.entries(publicSeo)) {
    const html = await readFile(
      `dist${seo.path === '/' ? '' : seo.path}/index.html`,
      'utf8',
    )
    const document = parse(html)
    const title = nodes(document, (node) => node.tagName === 'title')
    assert.equal(title.length, 1)
    assert.equal(content(title[0]), seo.title)
    titles.add(content(title[0]))
    const description = nodes(
      document,
      (node) => node.tagName === 'meta' && attr(node, 'name') === 'description',
    )
    assert.equal(description.length, 1)
    assert.ok(attr(description[0], 'content').length >= 80)
    const canonical = nodes(
      document,
      (node) => node.tagName === 'link' && attr(node, 'rel') === 'canonical',
    )
    assert.equal(canonical.length, 1)
    assert.equal(attr(canonical[0], 'href'), 'https://daraziq.store' + seo.path)
    assert.equal(nodes(document, (node) => node.tagName === 'h1').length, 1)
    const root = nodes(document, (node) => attr(node, 'id') === 'root')[0]
    assert.ok(content(root).length > 100, page)
    const robots = nodes(
      document,
      (node) => node.tagName === 'meta' && attr(node, 'name') === 'robots',
    )[0]
    assert.equal(
      attr(robots, 'content').startsWith('noindex'),
      Boolean(seo.noindex),
    )
    const scripts = nodes(
      document,
      (node) => attr(node, 'id') === 'site-schema',
    )
    if (seo.noindex) assert.equal(scripts.length, 0)
    else {
      const schema = JSON.parse(content(scripts[0]))
      const organization = schema['@graph'].find(
        (item) => item['@type'] === 'Organization',
      )
      assert.equal(organization.address.addressLocality, 'Islamabad')
      assert.equal(organization.telephone, '+923207160645')
      assert.equal(organization.email, 'ahmedsarwar7575@gmail.com')
      assert.equal(JSON.stringify(schema).includes('aggregateRating'), false)
    }
    assert.equal(html.includes('-preview.png'), false)
  }
  assert.equal(titles.size, 8)
  for (const path of [
    'dashboard',
    'dashboard/store',
    'dashboard/product',
    'dashboard/pricing',
    'dashboard/mcp',
    'dashboard/settings',
  ]) {
    const document = parse(await readFile(`dist/${path}/index.html`, 'utf8'))
    const robots = nodes(
      document,
      (node) => node.tagName === 'meta' && attr(node, 'name') === 'robots',
    )[0]
    assert.equal(attr(robots, 'content'), 'noindex, nofollow')
    assert.equal(
      content(nodes(document, (node) => attr(node, 'id') === 'root')[0]),
      '',
    )
  }
})

test('production pages work without JavaScript, hydrate cleanly, and expose a valid sitemap', async (t) => {
  const server = await preview({
    preview: { host: '127.0.0.1', port: 5180, strictPort: true, open: false },
  })
  t.after(() => new Promise((resolve) => server.httpServer.close(resolve)))
  const browser = await chromium.launch()
  t.after(() => browser.close())
  const base = 'http://127.0.0.1:5180'
  const staticPage = await browser.newPage({ javaScriptEnabled: false })
  for (const path of [
    '/',
    '/services',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
    '/login',
    '/register',
  ]) {
    await staticPage.goto(base + path)
    assert.equal(await staticPage.title(), Object.values(publicSeo).find((seo) => seo.path === path).title, path)
    assert.equal(await staticPage.locator('main h1').count(), 1, path)
    assert.ok((await staticPage.locator('main').innerText()).length > 100, path)
  }
  await staticPage.close()
  const page = await browser.newPage({ reducedMotion: 'reduce' })
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })
  for (const path of ['/', '/services', '/contact', '/login', '/services.html', '/contact/index.html']) {
    await page.goto(base + path)
    await page.waitForFunction(
      () => document.querySelector('meta[name="description"]')?.content,
    )
    if (await page.locator('.commerce-scene:visible').count())
      await page.locator('.commerce-scene[data-state="ready"]').waitFor()
    assert.equal(await page.locator('main h1').count(), 1)
  }
  await page.goto(base + '/')
  await page
    .getByRole('navigation', { name: 'Website navigation', exact: true })
    .getByRole('link', { name: 'Contact' })
    .click()
  await page.waitForURL(/\/contact$/)
  assert.equal(await page.title(), publicSeo.contact.title)
  const sitemap = await (await page.request.get(base + '/sitemap.xml')).text()
  const links = await page.evaluate((xml) => {
    const document = new DOMParser().parseFromString(xml, 'application/xml')
    if (document.querySelector('parsererror')) return null
    return [...document.querySelectorAll('loc')].map((node) => node.textContent)
  }, sitemap)
  assert.equal(links.length, 6)
  assert.equal(
    links.some((link) => /dashboard|login|register/.test(link)),
    false,
  )
  assert.match(
    await (await page.request.get(base + '/robots.txt')).text(),
    /Sitemap: https:\/\/daraziq\.store\/sitemap\.xml/,
  )
  assert.deepEqual(errors, [])
})
