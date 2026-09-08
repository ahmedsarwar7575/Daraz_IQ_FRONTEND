import {
  Activity,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  Gauge,
  LineChart,
  LockKeyhole,
  Mail,
  MapPin,
  Search,
  Server,
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
} from 'lucide-react'
import './HomePage.css'

const navItems = [
  { page: 'home', label: 'Home', path: '/' },
  { page: 'services', label: 'Services', path: '/services' },
  { page: 'about', label: 'About', path: '/about' },
  { page: 'contact', label: 'Contact', path: '/contact' },
]

const landingImages = {
  hero: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=82',
  operations: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
}

const heroStats = [
  { label: 'Orders reviewed', value: '1,190' },
  { label: 'Products tracked', value: '8' },
  { label: 'Price change suggested', value: '-8%' },
]

const featureGroups = [
  {
    title: 'Know what changed',
    text: 'See orders, revenue, seller rating, fulfillment status, and the SKUs driving the week.',
    icon: BarChart3,
  },
  {
    title: 'Compare your product',
    text: 'Check your listing against competitor price, sales, reviews, image depth, and rank signals.',
    icon: Search,
  },
  {
    title: 'Price with limits',
    text: 'Review the recommended price beside margin, floor, ceiling, and daily movement rules.',
    icon: Gauge,
  },
  {
    title: 'Connect an AI client',
    text: 'Authorize MCP clients so they can use the same seller tools without guessing account context.',
    icon: Server,
  },
]

const workflowRows = [
  {
    title: 'Connect the seller account',
    text: 'Daraz authorization brings seller profile, order, and catalog context into the workspace.',
    icon: Store,
  },
  {
    title: 'Review the current signal',
    text: 'Charts and snapshots show where the store is healthy and where a product needs attention.',
    icon: Activity,
  },
  {
    title: 'Approve the next move',
    text: 'Pricing and AI outputs stay grounded in the same data, with guardrails visible before action.',
    icon: ShieldCheck,
  },
]

const trustRows = [
  {
    title: 'Seller access is scoped',
    text: 'Connected clients and dashboard requests resolve to the signed-in seller workspace.',
    icon: LockKeyhole,
  },
  {
    title: 'Recommendations show their evidence',
    text: 'Price bands, competitor counts, source status, and history stay visible near the action.',
    icon: LineChart,
  },
  {
    title: 'Live writes stay controlled',
    text: 'Guardrails and logs keep pricing recommendations reviewable before anything changes.',
    icon: Check,
  },
]

const faqs = [
  {
    question: 'What does daraziq.store help me do?',
    answer: 'It helps Daraz sellers review store performance, compare products, and price with guardrails from one workspace.',
  },
  {
    question: 'Do I have to connect Daraz?',
    answer: 'Live seller metrics require a Daraz connection. Demo and cached views can still show how the workflow works.',
  },
  {
    question: 'Can an AI client use my seller tools?',
    answer: 'Yes. MCP access is authorized and scoped to the signed-in seller account.',
  },
  {
    question: 'Will the app change prices by itself?',
    answer: 'No. Pricing recommendations are review-first and bounded by the guardrails shown in the product.',
  },
]

const contactCards = [
  {
    title: 'Product support',
    text: 'Help with seller connection, dashboard data, and workspace access.',
    value: 'support@daraziq.store',
    icon: Mail,
  },
  {
    title: 'MCP setup',
    text: 'Guidance for connecting an external AI client to the seller tools.',
    value: 'OAuth protected',
    icon: Server,
  },
  {
    title: 'Seller workspace',
    text: 'Built for Daraz sellers reviewing store and product decisions.',
    value: 'Pakistan marketplace focus',
    icon: MapPin,
  },
]

const pageTitles = {
  services: {
    label: 'Services',
    title: 'The workspace is organized around seller decisions.',
    text: 'Review store health, compare one product, check the recommended price, and connect MCP clients from separate focused pages.',
  },
  about: {
    label: 'About',
    title: 'daraziq.store exists to make seller decisions easier to review.',
    text: 'The product brings Daraz data, competitor signals, AI summaries, and pricing controls into one account-scoped workspace.',
  },
  contact: {
    label: 'Contact',
    title: 'Get help connecting your seller workflow.',
    text: 'Reach out for account connection support, MCP setup, or product feedback.',
  },
  privacy: {
    label: 'Privacy policy',
    title: 'Seller data should stay scoped, protected, and removable.',
    text: 'This policy explains how daraziq.store handles account access, connected marketplace data, AI workflows, and logs.',
  },
  terms: {
    label: 'Terms and conditions',
    title: 'Use daraziq.store as a decision-support workspace.',
    text: 'These terms explain responsible use of seller analytics, pricing recommendations, AI briefs, and MCP access.',
  },
}

const legalContent = {
  privacy: {
    updated: 'September 8, 2026',
    sections: [
      ['Information we use', 'We use account profile details, authentication status, connected Daraz seller metadata, product snapshots, store metrics, competitor search results, pricing guardrails, and workflow logs to operate the workspace.'],
      ['How the product uses data', 'Seller data powers dashboards, store reviews, product comparisons, AI briefs, MCP responses, and pricing history.'],
      ['Credentials and access', 'Daraz access tokens and user-supplied AI provider keys are encrypted at rest. Sellers can disconnect Daraz and remove stored access from the dashboard.'],
      ['AI and MCP workflows', 'AI briefs and MCP responses are generated from the authenticated seller workspace. MCP clients must authorize before they can access seller-scoped tools.'],
      ['Retention', 'Operational snapshots and audit logs are retained for reporting, trend analysis, and pricing history. Account removal requests are handled through support.'],
      ['No public sale of seller data', 'daraziq.store is not designed to publish or sell individual seller data. Product data is used to provide the seller intelligence service.'],
    ],
  },
  terms: {
    updated: 'September 8, 2026',
    sections: [
      ['Product use', 'daraziq.store provides seller intelligence, marketplace analysis, AI-assisted summaries, pricing guardrails, and MCP access for Daraz seller workflows.'],
      ['Seller responsibility', 'Sellers are responsible for keeping account access secure, reviewing recommendations before acting, and following marketplace rules and local law.'],
      ['AI recommendations', 'AI briefs and pricing suggestions are decision-support outputs. Sellers should review source metrics, margins, stock, and business context before making changes.'],
      ['MCP connector access', 'External MCP clients can access the workspace only after authorization. Sellers are responsible for the clients they connect and the actions they request.'],
      ['Service availability', 'Marketplace APIs, AI providers, browser automation, and third-party services can change or become unavailable. daraziq.store may update workflows to preserve reliability.'],
      ['Acceptable use', 'The product may not be used to abuse marketplace systems, scrape prohibited content, interfere with other sellers, or attempt unauthorized access.'],
    ],
  },
}

const SiteHeader = ({ page, onNavigate, onLogin }) => (
  <header className="landing-nav">
    <a
      href="/"
      className="brand-lockup"
      aria-label="daraziq.store home"
      onClick={(event) => {
        event.preventDefault()
        onNavigate('home')
      }}
    >
      <img src="/favicon.svg" alt="" />
      <span>daraziq.store</span>
    </a>
    <nav aria-label="Website navigation">
      {navItems.map((item) => (
        <a
          key={item.page}
          className={page === item.page ? 'active' : ''}
          href={item.path}
          onClick={(event) => {
            event.preventDefault()
            onNavigate(item.page)
          }}
        >
          {item.label}
        </a>
      ))}
    </nav>
    <button className="nav-login" onClick={onLogin}>Log in</button>
  </header>
)

const HeroMetricBoard = () => (
  <div className="hero-metric-board" aria-label="Sample seller workspace data">
    <div className="metric-board-heading">
      <span>Today</span>
      <strong>Review price for AUR-EB-X7-BLK</strong>
    </div>
    <div className="metric-board-grid">
      {heroStats.map((item) => (
        <div key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
    <div className="mini-chart" aria-hidden="true">
      {[38, 46, 44, 58, 61, 68, 74, 70, 82, 88, 84, 93].map((height, index) => (
        <span key={index} style={{ height: `${height}%` }} />
      ))}
    </div>
  </div>
)

const HomeScreen = ({ page, onNavigate, onLogin, onGetStarted }) => (
  <section
    className="landing-hero"
    style={{ '--hero-image': `url("${landingImages.hero}")` }}
  >
    <SiteHeader page={page} onNavigate={onNavigate} onLogin={onLogin} />
    <div className="hero-layout">
      <div className="hero-copy">
        <p className="plain-label">Daraz seller decision console</p>
        <h1>Review the next seller decision before you change the store.</h1>
        <p>
          See store health, product context, competitor price bands, and pricing guardrails
          in one light workspace made for Daraz operators.
        </p>
        <div className="hero-actions">
          <button onClick={onGetStarted}>Open workspace</button>
          <button className="secondary-action" onClick={() => onNavigate('services')}>View services</button>
        </div>
      </div>
      <HeroMetricBoard />
    </div>
  </section>
)

const FeatureSection = () => (
  <section className="landing-section feature-section">
    <div className="section-heading">
      <p className="plain-label">What sellers check</p>
      <h2>Each page answers one operational question.</h2>
    </div>
    <div className="feature-grid">
      {featureGroups.map((feature) => {
        const Icon = feature.icon
        return (
          <article key={feature.title}>
            <Icon size={20} />
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </article>
        )
      })}
    </div>
  </section>
)

const OperationsSection = () => (
  <section className="operations-section">
    <div className="operations-image">
      <img src={landingImages.operations} alt="Online seller reviewing ecommerce activity" />
    </div>
    <div className="operations-copy">
      <p className="plain-label">Daily operating view</p>
      <h2>Less hunting. More reviewing.</h2>
      <p>
        The console separates store review, product comparison, pricing, and MCP setup
        so the seller can focus on one decision at a time.
      </p>
      <div className="signal-list">
        <span><ShoppingBag size={16} /> Orders and revenue stay close to product context.</span>
        <span><TrendingUp size={16} /> Competitor data is shown as ranges, not guesswork.</span>
        <span><Bot size={16} /> AI summaries use the same visible seller data.</span>
      </div>
    </div>
  </section>
)

const WorkflowSection = () => (
  <section className="workflow-section">
    <div className="section-heading">
      <p className="plain-label">How the workspace works</p>
      <h2>The product keeps action behind evidence.</h2>
    </div>
    <div className="workflow-list">
      {workflowRows.map((row) => {
        const Icon = row.icon
        return (
          <article key={row.title}>
            <Icon size={20} />
            <div>
              <h3>{row.title}</h3>
              <p>{row.text}</p>
            </div>
          </article>
        )
      })}
    </div>
  </section>
)

const TrustSection = () => (
  <section className="trust-section">
    <div className="section-heading">
      <p className="plain-label">Why sellers can trust it</p>
      <h2>Control is part of the interface.</h2>
    </div>
    <div className="trust-list">
      {trustRows.map((row) => {
        const Icon = row.icon
        return (
          <article key={row.title}>
            <Icon size={19} />
            <h3>{row.title}</h3>
            <p>{row.text}</p>
          </article>
        )
      })}
    </div>
  </section>
)

const FaqSection = () => (
  <section className="faq-section">
    <div className="section-heading">
      <p className="plain-label">Questions</p>
      <h2>Before you connect a store.</h2>
    </div>
    <div className="faq-list">
      {faqs.map((item, index) => (
        <details key={item.question} open={index === 0}>
          <summary>
            <span>{item.question}</span>
            <ChevronDown size={18} />
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  </section>
)

const FinalCta = ({ onGetStarted }) => (
  <section className="final-cta">
    <div>
      <p className="plain-label">Ready when the seller is</p>
      <h2>Open the workspace and review today’s decision.</h2>
      <button onClick={onGetStarted}>Open workspace</button>
    </div>
  </section>
)

const SubpageHero = ({ page, onNavigate, onLogin }) => {
  const content = pageTitles[page]
  return (
    <section className="subpage-hero">
      <SiteHeader page={page} onNavigate={onNavigate} onLogin={onLogin} />
      <div className="subpage-copy">
        <p className="plain-label">{content.label}</p>
        <h1>{content.title}</h1>
        <p>{content.text}</p>
      </div>
    </section>
  )
}

const ServicesScreen = ({ onGetStarted }) => (
  <>
    <FeatureSection />
    <WorkflowSection />
    <TrustSection />
    <FinalCta onGetStarted={onGetStarted} />
  </>
)

const AboutScreen = () => (
  <>
    <section className="about-story">
      <div>
        <p className="plain-label">Product point of view</p>
        <h2>Daraz sellers do not need more noise. They need a reviewable next move.</h2>
      </div>
      <p>
        daraziq.store keeps marketplace connection, store analytics, product comparison,
        competitor discovery, pricing recommendations, AI briefs, and MCP access behind one seller account.
      </p>
    </section>
    <FaqSection />
  </>
)

const ContactScreen = ({ onGetStarted }) => (
  <>
    <section className="contact-section">
      <div className="contact-grid">
        {contactCards.map((item) => {
          const Icon = item.icon
          return (
            <article key={item.title}>
              <Icon size={21} />
              <h2>{item.title}</h2>
              <p>{item.text}</p>
              <strong>{item.value}</strong>
            </article>
          )
        })}
      </div>
    </section>
    <FinalCta onGetStarted={onGetStarted} />
  </>
)

const LegalScreen = ({ page, onGetStarted }) => {
  const content = legalContent[page]
  return (
    <>
      <section className="legal-section">
        <div className="legal-shell">
          <div className="legal-intro">
            <p className="plain-label">Updated {content.updated}</p>
            <h2>{page === 'privacy' ? 'Privacy for connected seller data.' : 'Terms for seller decision support.'}</h2>
          </div>
          <div className="legal-list">
            {content.sections.map(([title, text]) => (
              <article key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <FinalCta onGetStarted={onGetStarted} />
    </>
  )
}

const FooterColumn = ({ title, children }) => (
  <div>
    <h3>{title}</h3>
    <div className="footer-links">{children}</div>
  </div>
)

function HomePage({ page = 'home', onNavigate, onLogin, onGetStarted }) {
  const normalizedPage = ['home', 'services', 'about', 'contact', 'privacy', 'terms'].includes(page) ? page : 'home'

  return (
    <main className={`landing-page landing-page-${normalizedPage}`}>
      {normalizedPage === 'home' ? (
        <HomeScreen page={normalizedPage} onNavigate={onNavigate} onLogin={onLogin} onGetStarted={onGetStarted} />
      ) : (
        <SubpageHero page={normalizedPage} onNavigate={onNavigate} onLogin={onLogin} />
      )}

      {normalizedPage === 'home' && (
        <>
          <FeatureSection />
          <OperationsSection />
          <WorkflowSection />
          <TrustSection />
          <FaqSection />
          <FinalCta onGetStarted={onGetStarted} />
        </>
      )}
      {normalizedPage === 'services' && <ServicesScreen onGetStarted={onGetStarted} />}
      {normalizedPage === 'about' && <AboutScreen />}
      {normalizedPage === 'contact' && <ContactScreen onGetStarted={onGetStarted} />}
      {['privacy', 'terms'].includes(normalizedPage) && (
        <LegalScreen page={normalizedPage} onGetStarted={onGetStarted} />
      )}

      <footer className="landing-footer">
        <div className="footer-grid">
          <FooterColumn title="Product">
            <p>daraziq.store is a Daraz seller workspace for store review, product comparison, pricing control, and MCP access.</p>
          </FooterColumn>
          <FooterColumn title="Pages">
            <button onClick={() => onNavigate('services')}>Services</button>
            <button onClick={() => onNavigate('about')}>About</button>
            <button onClick={() => onNavigate('contact')}>Contact</button>
          </FooterColumn>
          <FooterColumn title="Legal">
            <button onClick={() => onNavigate('privacy')}>Privacy Policy</button>
            <button onClick={() => onNavigate('terms')}>Terms and Conditions</button>
          </FooterColumn>
          <FooterColumn title="Contact">
            <a href="mailto:support@daraziq.store">support@daraziq.store</a>
            <span>Daraz seller intelligence</span>
            <span>MCP-ready workspace</span>
          </FooterColumn>
        </div>
        <div className="footer-bottom">
          <span>© 2026 daraziq.store. All rights reserved.</span>
          <span>Built for reviewable seller decisions.</span>
        </div>
      </footer>
    </main>
  )
}

export default HomePage
