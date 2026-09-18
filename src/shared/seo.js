import { site } from './site.js'

export const publicSeo = {
  home: {
    path: '/',
    title: 'Daraz Seller Tools, Analytics & Pricing | Daraz IQ',
    description:
      'Daraz IQ helps sellers in Pakistan track store performance, compare competitor products, and review pricing recommendations with guardrails.',
  },
  services: {
    path: '/services',
    title: 'Daraz Seller Analytics & Competitor Research Tools | Daraz IQ',
    description:
      'Explore Daraz store analytics, product and competitor research, pricing guardrails, and AI briefs. One toolkit for informed seller decisions.',
  },
  about: {
    path: '/about',
    title: 'About Daraz IQ | Seller Intelligence from Islamabad',
    description:
      'Learn how Daraz IQ brings store analytics, competitor research, and pricing evidence together for Daraz sellers. Based in Islamabad, Pakistan.',
  },
  contact: {
    path: '/contact',
    title: 'Contact Daraz IQ | Seller Support in Islamabad, Pakistan',
    description:
      'Contact Daraz IQ for store connection, pricing, or AI setup help. Send a message, call +92 320 7160645, or reach us on WhatsApp in Islamabad, Pakistan.',
  },
  privacy: {
    path: '/privacy',
    title: 'Privacy Policy | Daraz IQ',
    description:
      'Read how Daraz IQ handles account information, connected store data, credentials, and your privacy choices.',
  },
  terms: {
    path: '/terms',
    title: 'Terms and Conditions | Daraz IQ',
    description:
      'Review the terms for using Daraz IQ seller tools, store connections, AI features, pricing recommendations, and account services.',
  },
  login: {
    path: '/login',
    title: 'Sign In to Your Seller Workspace | Daraz IQ',
    description:
      'Sign in to Daraz IQ to manage your store analytics, products, pricing recommendations, and integrations.',
    noindex: true,
  },
  register: {
    path: '/register',
    title: 'Create Your Seller Workspace | Daraz IQ',
    description:
      'Create a Daraz IQ account to connect your store and review your products, market comparisons, and pricing rules.',
    noindex: true,
  },
}

export function getSeo(page, privatePath = '') {
  const data = privatePath
    ? {
        path: privatePath,
        title: 'Seller Workspace | Daraz IQ',
        description: 'Your private Daraz IQ seller workspace.',
        noindex: true,
      }
    : publicSeo[page]
  const selected = data || {
    path: '/404',
    title: 'Page Not Found | Daraz IQ',
    description: 'The requested page could not be found.',
    noindex: true,
  }
  const canonical = site.url + selected.path
  const graph = [
    {
      '@type': 'Organization',
      '@id': site.url + '/#organization',
      name: site.name,
      url: site.url,
      email: site.email,
      telephone: site.phone,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Islamabad',
        addressCountry: 'PK',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: site.phone,
        email: site.email,
        areaServed: 'PK',
        availableLanguage: ['English'],
      },
    },
    {
      '@type': 'WebSite',
      '@id': site.url + '/#website',
      name: site.name,
      url: site.url,
      publisher: { '@id': site.url + '/#organization' },
    },
    {
      '@type':
        page === 'contact'
          ? 'ContactPage'
          : page === 'about'
            ? 'AboutPage'
            : 'WebPage',
      '@id': canonical + '#webpage',
      url: canonical,
      name: selected.title,
      description: selected.description,
      isPartOf: { '@id': site.url + '/#website' },
    },
  ]
  if (page === 'home' || page === 'services')
    graph.push({
      '@type': 'SoftwareApplication',
      name: site.name,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      url: site.url,
      description: publicSeo.home.description,
      provider: { '@id': site.url + '/#organization' },
    })
  return {
    ...selected,
    canonical,
    meta: [
      ['name', 'description', selected.description],
      [
        'name',
        'robots',
        selected.noindex
          ? 'noindex, nofollow'
          : 'index, follow, max-image-preview:large',
      ],
      ['name', 'theme-color', '#fff8f5'],
      ['property', 'og:type', 'website'],
      ['property', 'og:site_name', site.name],
      ['property', 'og:title', selected.title],
      ['property', 'og:description', selected.description],
      ['property', 'og:url', canonical],
      ['property', 'og:locale', 'en_PK'],
      ['property', 'og:image', site.url + '/seller-toolkit-3d.png'],
      [
        'property',
        'og:image:alt',
        'Daraz IQ seller toolkit: shopping bag, parcels, price tag, and growth arrow',
      ],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', selected.title],
      ['name', 'twitter:description', selected.description],
      ['name', 'twitter:image', site.url + '/seller-toolkit-3d.png'],
    ],
    schema: selected.noindex
      ? null
      : { '@context': 'https://schema.org', '@graph': graph },
  }
}

export function applySeo(page, privatePath = '') {
  const data = getSeo(page, privatePath)
  document.title = data.title
  for (const [attribute, key, value] of data.meta) {
    let element = document.head.querySelector(`meta[${attribute}="${key}"]`)
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute(attribute, key)
      document.head.appendChild(element)
    }
    element.content = value
  }
  let canonical = document.head.querySelector('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = data.canonical
  document.getElementById('site-schema')?.remove()
  if (data.schema) {
    const script = document.createElement('script')
    script.id = 'site-schema'
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data.schema)
    document.head.appendChild(script)
  }
}
