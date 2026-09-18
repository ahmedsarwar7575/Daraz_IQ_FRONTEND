import { build } from 'vite'
import { parse, parseFragment, serialize } from 'parse5'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { getSeo, publicSeo } from '../src/shared/seo.js'
import { site } from '../src/shared/site.js'

const output = resolve('dist')
const ssrOutput = resolve('artifacts/ssr')
await build({
  build: { ssr: 'src/prerender.jsx', outDir: ssrOutput, emptyOutDir: true },
})
const { render } = await import(pathToFileURL(join(ssrOutput, 'prerender.js')))
const template = await readFile(join(output, 'index.html'), 'utf8')
const element = (name, attrs = {}, children = []) => ({
  nodeName: name,
  tagName: name,
  namespaceURI: 'http://www.w3.org/1999/xhtml',
  attrs: Object.entries(attrs).map(([name, value]) => ({
    name,
    value: String(value),
  })),
  childNodes: children,
})
const text = (value) => ({ nodeName: '#text', value })
const walk = (node, predicate) =>
  predicate(node)
    ? node
    : node.childNodes?.map((child) => walk(child, predicate)).find(Boolean)

function documentFor(page, html, privatePath = '') {
  const document = parse(template)
  const head = walk(document, (node) => node.tagName === 'head')
  const root = walk(document, (node) =>
    node.attrs?.some((attr) => attr.name === 'id' && attr.value === 'root'),
  )
  const seo = getSeo(page, privatePath)
  head.childNodes = head.childNodes.filter(
    (node) =>
      node.tagName !== 'title' &&
      !(!page && !privatePath && node.tagName === 'script'),
  )
  head.childNodes.push(element('title', {}, [text(seo.title)]))
  for (const [attribute, name, content] of seo.meta)
    head.childNodes.push(element('meta', { [attribute]: name, content }))
  head.childNodes.push(
    element('link', { rel: 'canonical', href: seo.canonical }),
  )
  if (seo.schema)
    head.childNodes.push(
      element('script', { type: 'application/ld+json', id: 'site-schema' }, [
        text(JSON.stringify(seo.schema).replace(/</g, '\\u003c')),
      ]),
    )
  root.childNodes = parseFragment(html).childNodes
  if (html) root.attrs.push({ name: 'data-prerendered', value: 'true' })
  return serialize(document)
}

for (const [page, { path }] of Object.entries(publicSeo)) {
  const directory = path === '/' ? output : join(output, path.slice(1))
  await mkdir(directory, { recursive: true })
  const html = documentFor(page, render(page))
  await writeFile(join(directory, 'index.html'), html)
  if (path !== '/') await writeFile(join(output, path.slice(1) + '.html'), html)
}
for (const path of [
  '/dashboard',
  '/dashboard/store',
  '/dashboard/product',
  '/dashboard/pricing',
  '/dashboard/mcp',
  '/dashboard/settings',
]) {
  const directory = join(output, path.slice(1))
  await mkdir(directory, { recursive: true })
  const html = documentFor(null, '', path)
  await writeFile(join(directory, 'index.html'), html)
  await writeFile(join(output, path.slice(1) + '.html'), html)
}
await writeFile(
  join(output, '404.html'),
  documentFor(
    null,
    '<main style="font-family:system-ui;padding:64px"><h1>Page not found</h1><p>This page is not available.</p><a href="/">Return to Daraz IQ</a></main>',
  ),
)
const urls = Object.values(publicSeo)
  .filter((page) => !page.noindex)
  .map((page) => `<url><loc>${site.url}${page.path}</loc></url>`)
  .join('')
await writeFile(
  join(output, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
)
await writeFile(
  join(output, 'robots.txt'),
  `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site.url}/sitemap.xml\n`,
)
console.log(
  'Prerendered 8 public/auth pages, private noindex shells, sitemap, robots, and 404 page.',
)
