import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  Gauge,
  LockKeyhole,
  Mail,
  MapPin,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingUp,
} from 'lucide-react'
import './HomePage.css'

const navItems = [
  { page: 'home', label: 'Home', path: '/' },
  { page: 'services', label: 'Services', path: '/services' },
  { page: 'contact', label: 'Contact us', path: '/contact' },
  { page: 'about', label: 'About us', path: '/about' },
]

const landingImages = {
  hero: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1800&q=82',
  operations: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
  dashboard: 'https://images.unsplash.com/photo-1504868481965-a7679ed88ac1?auto=format&fit=crop&w=1200&q=80',
}

const heroStats = [
  { label: 'Store data', value: 'Live KPIs' },
  { label: 'Market signals', value: 'Price bands' },
  { label: 'MCP tools', value: '10+' },
]

const features = [
  {
    title: 'Store Analyst',
    text: 'Monitor orders, sync health, KPI snapshots, trends, and anomaly signals from your Daraz account.',
    icon: BarChart3,
  },
  {
    title: 'Product Lab',
    text: 'Compare your products with competitor listings, market prices, reviews, sales signals, and source links.',
    icon: Search,
  },
  {
    title: 'Pricing Guardrails',
    text: 'Analyze price changes using cost, competitor ranges, margin limits, and a clean reprice audit trail.',
    icon: Gauge,
  },
  {
    title: 'MCP Access',
    text: 'Connect Claude, ChatGPT-compatible agents, or other MCP clients to the same seller intelligence tools.',
    icon: Server,
  },
]

const proofStats = [
  {
    value: 'OAuth',
    title: 'Secure Daraz connection',
    detail: 'Seller tokens stay encrypted at rest',
    icon: ShieldCheck,
  },
  {
    value: 'Live',
    title: 'Competitor discovery',
    detail: 'Search market listings with browser automation',
    icon: Store,
  },
  {
    value: 'AI',
    title: 'Business briefs',
    detail: 'OpenAI or OpenRouter provider routing',
    icon: Bot,
  },
  {
    value: 'Logs',
    title: 'Reprice history',
    detail: 'Every pricing action gets an audit trail',
    icon: LockKeyhole,
  },
]

const workflowSteps = [
  {
    step: '01',
    title: 'Connect Daraz',
    text: 'Authorize the seller account once and bring orders, products, and account status into one workspace.',
    icon: Store,
  },
  {
    step: '02',
    title: 'Read the market',
    text: 'Compare catalog items with competitor listings, price bands, reviews, and listing signals.',
    icon: Search,
  },
  {
    step: '03',
    title: 'Act with control',
    text: 'Use AI briefs, margin checks, and guarded recommendations before making operational changes.',
    icon: Gauge,
  },
]

const mcpStats = [
  { value: '10+', label: 'seller tools' },
  { value: '7', label: 'resources' },
  { value: '3', label: 'agent prompts' },
]

const mcpCommands = [
  'get_store_metrics',
  'search_competitors',
  'analyze_product',
  'analyze_price',
  'weekly_store_review',
]

const trustLayers = [
  {
    title: 'OAuth connection',
    text: 'Seller access is scoped through Daraz authorization.',
    icon: ShieldCheck,
  },
  {
    title: 'Encrypted keys',
    text: 'Daraz tokens and AI provider keys stay encrypted at rest.',
    icon: LockKeyhole,
  },
  {
    title: 'Human review',
    text: 'Recommendations come first, live writes stay guarded.',
    icon: Check,
  },
  {
    title: 'Agent ready',
    text: 'MCP clients use the same protected seller workspace.',
    icon: Server,
  },
]

const faqs = [
  {
    question: 'What is daraziq.store used for?',
    answer: 'It helps Daraz sellers understand store performance, compare products against competitors, and make safer pricing decisions.',
  },
  {
    question: 'Do I need to connect my Daraz seller account?',
    answer: 'Yes for live seller metrics. Competitor benchmarking and cached workflows can still work when available.',
  },
  {
    question: 'Can AI agents use my seller tools?',
    answer: 'Yes. The app exposes OAuth-protected MCP tools for compatible AI clients, scoped to the authenticated seller.',
  },
  {
    question: 'Are seller credentials stored safely?',
    answer: 'Daraz access credentials and user AI keys are encrypted at rest and can be removed from the dashboard.',
  },
  {
    question: 'Does it change prices automatically?',
    answer: 'Live writes are guarded and disabled unless explicitly configured. Recommendations and logs come first.',
  },
]

const contactCards = [
  {
    title: 'Product support',
    text: 'Questions about connecting Daraz, seller metrics, or competitor workflows.',
    value: 'support@daraziq.store',
    icon: Mail,
  },
  {
    title: 'MCP setup',
    text: 'Connect Claude, GPT-compatible agents, or other MCP clients to your seller tools.',
    value: 'Remote connector ready',
    icon: Server,
  },
  {
    title: 'Seller workspace',
    text: 'Built for Daraz sellers who need cleaner decisions from store and market data.',
    value: 'Daraz intelligence',
    icon: MapPin,
  },
]

const pageTitles = {
  services: {
    kicker: 'Services',
    title: 'Seller tools that turn marketplace data into action.',
    text: 'Each page in the console maps to a focused seller workflow: store performance, product benchmarking, pricing control, and AI/MCP access.',
  },
  about: {
    kicker: 'About us',
    title: 'Built for Daraz sellers who want clarity before action.',
    text: 'daraziq.store brings seller data, competitor signals, AI summaries, and pricing safety into one focused operating system.',
  },
  contact: {
    kicker: 'Contact us',
    title: "Let's connect your seller workflow.",
    text: 'Reach out for support, MCP setup, Daraz connection guidance, or product feedback.',
  },
  privacy: {
    kicker: 'Privacy policy',
    title: 'Clear data practices for connected seller workspaces.',
    text: 'daraziq.store is designed to keep seller data scoped, protected, and removable from the product.',
  },
  terms: {
    kicker: 'Terms and conditions',
    title: 'A practical agreement for using daraziq.store.',
    text: 'These terms explain how sellers may use the workspace, AI workflows, and MCP access responsibly.',
  },
}

const legalContent = {
  privacy: {
    updated: 'September 8, 2026',
    sections: [
      {
        title: 'Information We Use',
        text: 'We use account profile details, authentication status, connected Daraz seller metadata, product snapshots, store metrics, competitor search results, pricing guardrails, and workflow logs to operate the workspace.',
      },
      {
        title: 'How The Product Uses Data',
        text: 'Seller data is used to show dashboards, generate store and product analysis, prepare AI briefs, support MCP tools, and keep pricing recommendations traceable.',
      },
      {
        title: 'Credentials And Access',
        text: 'Daraz access tokens and user-supplied AI provider keys are encrypted at rest. Sellers can disconnect Daraz and remove stored access from the dashboard.',
      },
      {
        title: 'AI And MCP Workflows',
        text: 'AI briefs and MCP responses are generated from the authenticated seller workspace. MCP clients must authorize through the product before they can access account-scoped tools.',
      },
      {
        title: 'Data Retention',
        text: 'Operational snapshots and audit logs are retained to support reporting, trend analysis, and pricing history. Account removal or disconnect requests are handled through the product support process.',
      },
      {
        title: 'No Public Sale Of Seller Data',
        text: 'daraziq.store is not designed to publish or sell individual seller account data. Product data is used to provide the seller intelligence service.',
      },
    ],
  },
  terms: {
    updated: 'September 8, 2026',
    sections: [
      {
        title: 'Product Use',
        text: 'daraziq.store provides seller intelligence, marketplace analysis, AI-assisted summaries, pricing guardrails, and MCP access for Daraz seller workflows.',
      },
      {
        title: 'Seller Responsibility',
        text: 'Sellers are responsible for keeping their account access secure, reviewing recommendations before acting, and ensuring marketplace activity follows Daraz rules and local law.',
      },
      {
        title: 'AI Recommendations',
        text: 'AI briefs and pricing suggestions are decision-support outputs. Sellers should review source metrics, margin limits, stock position, and business context before making changes.',
      },
      {
        title: 'MCP Connector Access',
        text: 'External MCP clients can only access the workspace after authorization. Sellers are responsible for the clients they connect and the actions they request through those clients.',
      },
      {
        title: 'Service Availability',
        text: 'Marketplace APIs, AI providers, browser automation, and third-party services can change or become unavailable. daraziq.store may update workflows to preserve product reliability.',
      },
      {
        title: 'Acceptable Use',
        text: 'The product may not be used to abuse marketplace systems, scrape prohibited content, interfere with other sellers, or attempt unauthorized access to accounts or data.',
      },
    ],
  },
}

const FooterColumn = ({ title, children }) => (
  <div>
    <h3>{title}</h3>
    <div className="footer-links">{children}</div>
  </div>
)

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
    </a>
    <nav aria-label="Landing page navigation">
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
    <button className="nav-login" onClick={onLogin}>Login</button>
  </header>
)

const HeroProductPanel = () => (
  <aside className="hero-product-panel" aria-label="Product workspace preview">
    <div className="hero-panel-header">
      <div>
        <img src="/favicon.svg" alt="" />
        <span>daraziq.store</span>
      </div>
      <strong>Live workspace</strong>
    </div>
    <div className="hero-panel-metrics">
      <div>
        <span>Orders</span>
        <strong>1.2K</strong>
      </div>
      <div>
        <span>Products</span>
        <strong>342</strong>
      </div>
      <div>
        <span>Sources</span>
        <strong>3/3</strong>
      </div>
    </div>
    <div className="hero-panel-review">
      <span>Sample analysis</span>
      <h2>Wireless Earbuds Pro</h2>
      <ul>
        <li><Check size={15} /> Competitor price band detected</li>
        <li><Check size={15} /> Margin guardrail healthy</li>
        <li><Check size={15} /> AI brief ready for review</li>
      </ul>
    </div>
  </aside>
)

const HomeScreen = ({ page, onNavigate, onLogin, onGetStarted }) => (
  <section
    className="landing-hero"
    style={{ '--hero-image': `url("${landingImages.hero}")` }}
  >
    <SiteHeader page={page} onNavigate={onNavigate} onLogin={onLogin} />

    <div className="hero-layout">
      <div className="hero-copy">
        <p className="hero-label">Daraz seller intelligence</p>
        <h1>
          One workspace for store performance, product research, and MCP access.
        </h1>
        <p>
          Connect Daraz, review seller metrics, compare products with market listings,
          and give AI clients controlled access to the same operational tools.
        </p>
        <div className="hero-actions">
          <button onClick={onGetStarted}>Get Started</button>
          <button className="ghost-action" onClick={() => onNavigate('services')}>See Details</button>
        </div>
      </div>

      <HeroProductPanel />
    </div>

    <div className="hero-stats">
      {heroStats.map((item) => (
        <div key={item.label}>
          <p>{item.label}</p>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  </section>
)

const HomeFeaturePreview = ({ onNavigate }) => (
  <section className="landing-section home-intelligence">
    <div className="section-heading compact-heading">
      <div>
        <p className="section-kicker">Seller intelligence</p>
        <h2>
          The core seller workflows stay close together.
        </h2>
      </div>
      <p>
        Store health, catalog research, pricing checks, and MCP access share the
        same account context instead of becoming separate admin work.
      </p>
    </div>

    <div className="home-feature-grid">
      {features.map((feature) => {
        const Icon = feature.icon
        return (
          <article key={feature.title}>
            <span><Icon size={22} /></span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
            <button onClick={() => onNavigate('services')} aria-label={`Open ${feature.title}`}>
              <ArrowUpRight size={17} />
            </button>
          </article>
        )
      })}
    </div>
  </section>
)

const MarketVisualSection = () => (
  <section className="market-visual-section">
    <div className="market-visual-media">
      <img src={landingImages.operations} alt="Ecommerce seller workspace with online order tools" />
    </div>
    <div className="market-visual-copy">
      <p className="section-kicker">Operational clarity</p>
      <h2>Understand what is moving before the market moves past you.</h2>
      <p>
        daraziq.store brings store activity, competitor listings, product signals,
        and pricing control into one seller workspace built for daily decisions.
      </p>
      <div className="market-signal-list">
        <span><Check size={15} /> Product snapshots stay tied to seller context</span>
        <span><Check size={15} /> Competitor data feeds product and price analysis</span>
        <span><Check size={15} /> MCP tools inherit the same protected workspace</span>
      </div>
    </div>
  </section>
)

const WorkflowSection = () => (
  <section className="workflow-section">
    <div className="workflow-inner">
      <div className="workflow-copy">
        <p className="section-kicker">Operating flow</p>
        <h2>From seller data to sharper action in three steps.</h2>
        <p>
          Start with authenticated seller data, compare it with the market, then
          review AI-backed recommendations before changing anything important.
        </p>
      </div>

      <div className="workflow-steps">
        {workflowSteps.map((item) => {
          const Icon = item.icon
          return (
            <article key={item.step} className="workflow-step">
              <strong>{item.step}</strong>
              <div>
                <span><Icon size={20} /></span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  </section>
)

const DashboardPreview = () => {
  const bars = [42, 64, 50, 78, 58, 86, 70, 94]

  return (
    <section className="dashboard-preview-section">
      <div className="dashboard-preview-copy">
        <p className="section-kicker">Command center</p>
        <h2>A cleaner console for performance, products, and margin signals.</h2>
        <p>
          The dashboard groups daily store context, product checks, and pricing
          guardrails into focused pages with direct navigation.
        </p>
      </div>

      <div className="console-preview">
        <div className="console-brand">
          <img src={landingImages.dashboard} alt="Analytics dashboard displayed on a laptop" />
        </div>
        <div className="console-toolbar">
          <span>Seller overview</span>
          <i />
        </div>
        <div className="console-metrics">
          <div>
            <span>Orders</span>
            <strong>1.2K</strong>
          </div>
          <div>
            <span>Products</span>
            <strong>342</strong>
          </div>
          <div>
            <span>Sources</span>
            <strong>3/3</strong>
          </div>
        </div>
        <div className="console-bars" aria-hidden="true">
          {bars.map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
        <div className="console-insights">
          <p><Check size={15} /> Competitor range detected</p>
          <p><Check size={15} /> Margin guardrail healthy</p>
          <p><Check size={15} /> AI brief ready</p>
        </div>
      </div>
    </section>
  )
}

const McpHomeSection = ({ onGetStarted }) => (
  <section className="mcp-home-section">
    <div className="mcp-copy">
      <p className="section-kicker">MCP access</p>
      <h2>Let your AI client use the same seller tools.</h2>
      <p>
        Connect compatible MCP clients to daraziq.store and let agents inspect store
        metrics, product context, competitor signals, and guarded pricing workflows.
      </p>
      <div className="mcp-stat-row">
        {mcpStats.map((item) => (
          <div key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <button onClick={onGetStarted}>Start MCP Setup <ArrowRight size={18} /></button>
    </div>

    <div className="mcp-terminal">
      <div className="terminal-top" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="endpoint-row">
        <span>Remote endpoint</span>
        <code>api.daraziq.store/api/mcp</code>
      </div>
      <div className="mcp-command-list">
        {mcpCommands.map((command) => (
          <p key={command}>
            <Check size={15} />
            <code>{command}</code>
          </p>
        ))}
      </div>
      <div className="terminal-footer">
        <Bot size={17} />
        <span>OAuth protected agent workspace</span>
      </div>
    </div>
  </section>
)

const TrustSection = () => (
  <section className="trust-section">
    <div className="section-title">
      <h2>Control stays visible at every step.</h2>
      <p>Security, source clarity, and guarded automation are part of the product flow.</p>
    </div>
    <div className="trust-grid">
      {trustLayers.map((item) => {
        const Icon = item.icon
        return (
          <article key={item.title}>
            <span><Icon size={20} /></span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        )
      })}
    </div>
  </section>
)

const HomeFaqSection = () => (
  <section className="faq-section home-faq-section">
    <div className="outline-shape outline-left" aria-hidden="true" />
    <div className="outline-shape outline-right" aria-hidden="true" />
    <div className="section-title">
      <h2>Frequently Asked<br />Questions</h2>
      <p>Quick answers before sellers connect Daraz, AI providers, and MCP clients.</p>
    </div>
    <div className="faq-list">
      {faqs.slice(0, 4).map((item, index) => (
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
      <h2>Ready to Sell Smarter?</h2>
      <p>
        Bring your store, competitor data, pricing checks, and AI summaries into one clean workflow.
      </p>
      <button onClick={onGetStarted}>Get Started <ArrowRight size={18} /></button>
    </div>
  </section>
)

const HomeLandingSections = ({ onNavigate, onGetStarted }) => (
  <>
    <HomeFeaturePreview onNavigate={onNavigate} />
    <MarketVisualSection />
    <WorkflowSection />
    <DashboardPreview />
    <McpHomeSection onGetStarted={onGetStarted} />
    <TrustSection />
    <HomeFaqSection />
    <FinalCta onGetStarted={onGetStarted} />
  </>
)

const SubpageHero = ({ page, onNavigate, onLogin }) => {
  const content = pageTitles[page]
  return (
    <section className="subpage-hero">
      <SiteHeader page={page} onNavigate={onNavigate} onLogin={onLogin} />
      <div className="subpage-copy">
        <p>{content.kicker}</p>
        <h1>{content.title}</h1>
        <span>{content.text}</span>
      </div>
    </section>
  )
}

const ServicesScreen = ({ onGetStarted }) => (
  <>
    <section className="landing-section feature-section">
      <div className="section-heading">
        <div>
          <h2>
            Built for Sellers.<br />
            Powered by <span>AI.</span>
          </h2>
          <p>
            Connect your Daraz account once, then run store reviews, product checks, competitor searches,
            and pricing workflows from one focused command center.
          </p>
        </div>
        <div className="wire-mark" aria-hidden="true" />
      </div>

      <div className="feature-grid">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <article key={feature.title} className={index === 2 ? 'wide-card' : ''}>
              <p>{feature.text}</p>
              <button aria-label={`${feature.title} details`}>
                <ArrowUpRight size={18} />
              </button>
              <h3>{feature.title}</h3>
              <Icon className="card-watermark" size={52} />
            </article>
          )
        })}
      </div>
    </section>

    <section className="proof-section">
      <div className="proof-intro">
        <span>2026</span>
        <p>
          Whether you manage a small catalog or a fast-growing store, daraziq.store helps you see
          what changed, why it matters, and what to do next.
        </p>
      </div>

      <div className="proof-grid">
        {proofStats.map((item) => {
          const Icon = item.icon
          return (
            <article key={item.title}>
              <strong>{item.value}</strong>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
              <div className="proof-line">
                <span><Icon size={17} /></span>
              </div>
            </article>
          )
        })}
      </div>

      <div className="proof-cta">
        <button onClick={onGetStarted}>Get Started <ArrowRight size={18} /></button>
        <span>Seller intelligence is ready <i /></span>
      </div>
    </section>
  </>
)

const AboutScreen = () => (
  <>
    <section className="about-story">
      <div>
        <p className="story-kicker">Why it exists</p>
        <h2>Daraz sellers should not need five tools to answer one business question.</h2>
      </div>
      <p>
        The app keeps marketplace connection, store analytics, product comparison, competitor discovery,
        pricing recommendations, AI briefs, and MCP access behind one account. The goal is simple:
        less guessing, fewer unsafe pricing moves, and faster product decisions.
      </p>
    </section>

    <section className="faq-section">
      <div className="outline-shape outline-left" aria-hidden="true" />
      <div className="outline-shape outline-right" aria-hidden="true" />
      <div className="section-title">
        <h2>Frequently Asked<br />Questions</h2>
        <p>Everything sellers usually ask before connecting Daraz, AI, and MCP workflows.</p>
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
              <span><Icon size={22} /></span>
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

const LegalScreen = ({ page, onNavigate, onGetStarted }) => {
  const content = legalContent[page]
  return (
    <>
      <section className="legal-section">
        <div className="legal-shell">
          <div className="legal-intro">
            <p className="section-kicker">Updated {content.updated}</p>
            <h2>{page === 'privacy' ? 'Privacy built for seller trust.' : 'Terms built for responsible seller operations.'}</h2>
            <p>
              daraziq.store keeps account access, marketplace data, AI workflows,
              and connected-client activity governed by clear product rules.
            </p>
          </div>
          <div className="legal-list">
            {content.sections.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <FinalCta onGetStarted={onGetStarted} onNavigate={onNavigate} />
    </>
  )
}

function HomePage({ page = 'home', onNavigate, onLogin, onGetStarted }) {
  const normalizedPage = ['home', 'services', 'about', 'contact', 'privacy', 'terms'].includes(page) ? page : 'home'

  return (
    <main className={`landing-page landing-page-${normalizedPage}`}>
      {normalizedPage === 'home' ? (
        <HomeScreen page={normalizedPage} onNavigate={onNavigate} onLogin={onLogin} onGetStarted={onGetStarted} />
      ) : (
        <SubpageHero page={normalizedPage} onNavigate={onNavigate} onLogin={onLogin} />
      )}

      {normalizedPage === 'home' && <HomeLandingSections onNavigate={onNavigate} onGetStarted={onGetStarted} />}
      {normalizedPage === 'services' && <ServicesScreen onGetStarted={onGetStarted} />}
      {normalizedPage === 'about' && <AboutScreen />}
      {normalizedPage === 'contact' && <ContactScreen onGetStarted={onGetStarted} />}
      {['privacy', 'terms'].includes(normalizedPage) && (
        <LegalScreen page={normalizedPage} onNavigate={onNavigate} onGetStarted={onGetStarted} />
      )}

      <footer className="landing-footer">
        <div className="footer-grid">
          <FooterColumn title="About Us">
            <p>
              daraziq.store is a seller intelligence workspace for Daraz teams who want clearer metrics,
              sharper product decisions, and safer pricing control.
            </p>
          </FooterColumn>
          <FooterColumn title="Useful Links">
            <button onClick={() => onNavigate('about')}>About</button>
            <button onClick={() => onNavigate('services')}>Services</button>
            <button onClick={() => onNavigate('privacy')}>Privacy Policy</button>
            <button onClick={() => onNavigate('terms')}>Terms</button>
            <button onClick={onGetStarted}>Get Started</button>
            <button onClick={onLogin}>Login</button>
          </FooterColumn>
          <FooterColumn title="Help">
            <button onClick={() => onNavigate('services')}>Store Analyst</button>
            <button onClick={() => onNavigate('services')}>Product Lab</button>
            <button onClick={() => onNavigate('services')}>MCP Access</button>
            <button onClick={() => onNavigate('about')}>FAQ</button>
          </FooterColumn>
          <FooterColumn title="Connect With Us">
            <a href="mailto:support@daraziq.store">support@daraziq.store</a>
            <span>Daraz seller intelligence</span>
            <span>Remote MCP ready</span>
          </FooterColumn>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 daraziq.store. All Rights Reserved.</span>
          <div>
            <Sparkles size={15} />
            <TrendingUp size={15} />
            <Check size={15} />
          </div>
        </div>
      </footer>
    </main>
  )
}

export default HomePage
