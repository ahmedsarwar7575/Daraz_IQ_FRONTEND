import { useEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Tags,
  X,
} from 'lucide-react'
import {
  Brand,
  Button,
  Dialog,
  Feedback,
  Field,
  IconButton,
  Select,
} from '../../shared/ui'
import CommerceScene from '../marketing/CommerceScene'
import { apiBaseUrl, contactApi } from '../../shared/api'
import { site } from '../../shared/site'
import { legalContent } from './legal'
import './HomePage.css'

const navItems = [
  { page: 'home', label: 'Home', path: '/' },
  { page: 'services', label: 'Services', path: '/services' },
  { page: 'about', label: 'About', path: '/about' },
  { page: 'contact', label: 'Contact', path: '/contact' },
]
const outcomes = [
  {
    id: 'store-health',
    icon: ChartNoAxesCombined,
    title: 'Find your focus.',
    label: 'Store insights',
    text: 'Orders, revenue, and fulfillment. Get the whole picture, then go straight to what needs attention.',
    color: 'aqua',
  },
  {
    id: 'product-intelligence',
    icon: Tags,
    title: 'Know your market.',
    label: 'Product intelligence',
    text: 'See how your listings compare with competitors on price, sales, and reviews.',
    color: 'lilac',
  },
  {
    id: 'safer-pricing',
    icon: ShieldCheck,
    title: 'Make a smarter move.',
    label: 'Safer pricing',
    text: 'Turn market evidence into a price recommendation, checked against your own rules.',
    color: 'coral',
  },
]
const faqs = [
  [
    'Do I need to connect my Daraz account?',
    'Connect your account to load your real orders and products.',
  ],
  [
    'Does Daraz IQ change my prices automatically?',
    'The current service analyzes prices and logs recommendations. Live marketplace writes are unavailable. Your pricing rules remain visible for every review.',
  ],
  [
    'Can I use my own AI provider?',
    'Yes. Choose a provider and model in Settings, and optionally add a personal API key. Saved keys are encrypted and are never displayed in the workspace.',
  ],
  [
    'Can I connect an AI client?',
    'Compatible AI clients can use the protected MCP endpoint after authorization. Start in Integrations to get the connection address.',
  ],
]

function ContactForm() {
  const formRef = useRef(null)
  const requestId = useRef(null)
  const submitting = useRef(false)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const submit = async (event) => {
    event.preventDefault()
    if (submitting.current || result?.sent) return
    const values = new FormData(event.currentTarget)
    requestId.current ||= crypto.randomUUID()
    submitting.current = true
    setSending(true)
    setError('')
    try {
      const response = await contactApi.send({
        name: values.get('name'),
        email: values.get('email'),
        topic: values.get('topic'),
        message: values.get('message'),
        website: values.get('website'),
        requestId: requestId.current,
      })
      if (!response.sent)
        throw new Error(
          'The server did not confirm delivery. Please try again.',
        )
      setResult(response)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      submitting.current = false
      setSending(false)
    }
  }
  return (
    <form
      ref={formRef}
      className="contact-form form-stack"
      action={apiBaseUrl + '/contact'}
      method="post"
      onSubmit={submit}
      onChange={() => {
        requestId.current = null
        setError('')
      }}
    >
      <h2>Send a message</h2>
      <noscript>
        Enable JavaScript to send this form, or use the email and phone links on
        this page.
      </noscript>
      <fieldset
        className="form-stack"
        disabled={sending || Boolean(result?.sent)}
      >
        <div className="form-grid">
          <Field
            label="Name"
            name="name"
            required
            minLength={2}
            autoComplete="name"
            maxLength={100}
            placeholder="Your name"
          />
          <Field
            label="Email address"
            name="email"
            type="email"
            required
            maxLength={254}
            autoComplete="email"
            placeholder="you@example.com"
          />
        </div>
        <Select label="What can we help with?" name="topic">
          <option>Connecting my Daraz store</option>
          <option>Products and pricing</option>
          <option>AI client setup</option>
          <option>Account and data access</option>
          <option>Product feedback</option>
        </Select>
        <label className="field">
          <span>Message</span>
          <textarea
            name="message"
            required
            minLength={10}
            maxLength={4000}
            placeholder="Tell us what happened and what you expected."
          />
        </label>
        <label className="contact-honeypot" aria-hidden="true">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
        <p className="muted">
          We will email a confirmation to the address you provide. Please leave
          out passwords, API keys, and private order details.
        </p>
        <p className="muted">
          Your details are used to respond to this inquiry.{' '}
          <a href="/privacy">Privacy policy</a>
        </p>
        <div>
          <Button
            type="submit"
            icon={Mail}
            disabled={sending || Boolean(result?.sent)}
          >
            {sending ? 'Sending...' : 'Send message'}
          </Button>
        </div>
      </fieldset>
      {error && <Feedback error={error} />}
      {result?.sent && (
        <div className="contact-draft">
          <Feedback>Your message has been sent to the Daraz IQ team.</Feedback>
          <p className="muted">
            {result.confirmationSent
              ? 'A confirmation email has also been sent to you. Please check your spam folder if it does not appear.'
              : 'We could not send the confirmation email, but the team has your message. You do not need to resend it.'}
          </p>
          <p className="muted">Reference: {result.reference}</p>
          <Button
            variant="secondary"
            onClick={() => {
              formRef.current.reset()
              requestId.current = null
              setResult(null)
              setError('')
            }}
          >
            Send another message
          </Button>
        </div>
      )}
    </form>
  )
}

function ToolkitImage({ className = '' }) {
  return (
    <img
      className={'toolkit-image ' + className}
      src="/seller-toolkit-3d.png"
      width="1254"
      height="1254"
      loading="lazy"
      alt="Coral shopping bag, parcels, a teal price tag, and a lilac growth arrow"
    />
  )
}

function PriceStory() {
  const [step, setStep] = useState('evidence')
  const steps = {
    evidence: {
      title: 'Start with the market.',
      text: 'Compare competitor prices, sales, and reviews before choosing your next move.',
      icon: Tags,
    },
    rules: {
      title: 'Keep your limits close.',
      text: 'Check movement limits, your cost floor, and daily limits before recording a recommendation.',
      icon: ShieldCheck,
    },
    review: {
      title: 'You make the call.',
      text: 'Review the rationale and record the recommendation. The current service does not write live prices.',
      icon: Check,
    },
  }
  const active = steps[step]
  const Icon = active.icon
  return (
    <div className="price-story">
      <div
        className="price-story-tabs"
        role="group"
        aria-label="Pricing review steps"
      >
        {['evidence', 'rules', 'review'].map((id, index) => (
          <button
            key={id}
            aria-pressed={step === id}
            onClick={() => setStep(id)}
          >
            <span>0{index + 1}</span>
            {id === 'evidence'
              ? 'Evidence'
              : id === 'rules'
                ? 'Your rules'
                : 'Review'}
          </button>
        ))}
      </div>
      <div className="price-story-content" aria-live="polite">
        <Icon size={52} strokeWidth={1.6} />
        <h3>{active.title}</h3>
        <p>{active.text}</p>
      </div>
      <span className="story-footnote">Your store. Your final say.</span>
    </div>
  )
}

export default function HomePage({
  page = 'home',
  onNavigate,
  onLogin,
  onGetStarted,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const legal = legalContent[page]
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (window.location.hash)
        document
          .getElementById(window.location.hash.slice(1))
          ?.scrollIntoView({ behavior: 'instant' })
    })
    return () => cancelAnimationFrame(frame)
  }, [page])
  const link = (target) => (event) => {
    if (
      !event.metaKey &&
      !event.ctrlKey &&
      !event.shiftKey &&
      !event.altKey &&
      event.button === 0
    ) {
      event.preventDefault()
      setMenuOpen(false)
      onNavigate(target)
    }
  }
  const siteLinks = navItems.map((item) => (
    <a
      key={item.page}
      href={item.path}
      onClick={link(item.page)}
      aria-current={page === item.page ? 'page' : undefined}
    >
      {item.label}
    </a>
  ))
  const startButton = (
    <Button onClick={onGetStarted}>
      Start free <ArrowRight size={17} />
    </Button>
  )

  return (
    <div className="public-site">
      <a className="skip-link" href="#public-main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-nav">
          <a href="/" onClick={link('home')} aria-label="daraziq.store home">
            <Brand />
          </a>
          <nav aria-label="Website navigation">{siteLinks}</nav>
          <div className="site-nav-actions">
            <Button variant="ghost" onClick={onLogin}>
              Log in
            </Button>
            {startButton}
            <span className="public-menu-button">
              <IconButton
                icon={menuOpen ? X : Menu}
                label="Open site navigation"
                onClick={() => setMenuOpen(true)}
              />
            </span>
          </div>
        </div>
      </header>
      <main id="public-main">
        {page === 'home' && (
          <>
            <section className="marketing-hero">
              <CommerceScene />
              <div className="hero-intro">
                <span className="public-eyebrow">
                  A LITTLE INTELLIGENCE. A BIG NEXT STEP.
                </span>
                <h1>
                  Daraz seller
                  <br />
                  <span className="ink-underline">intelligence.</span>
                </h1>
                <p>
                  Big plans for your Daraz store? Daraz IQ helps sellers in
                  Pakistan track store performance, compare competitors, and
                  review pricing recommendations with confidence.
                </p>
                <div className="hero-actions">
                  {startButton}
                  <a className="button ghost" href="#how-it-works">
                    Meet your toolkit <ArrowDown size={16} />
                  </a>
                </div>
                <span className="hero-note">
                  Your ambition. Your store. Your next chapter.
                </span>
              </div>
            </section>
            <div className="capability-strip public-container">
              <span>
                Made for your
                <br />
                <strong>working day.</strong>
              </span>
              <p>Store performance</p>
              <p>Product intelligence</p>
              <p>Guarded pricing</p>
              <p>AI on your terms</p>
            </div>
            <section className="public-band" id="your-toolkit">
              <div className="public-container">
                <div className="band-heading centered">
                  <span className="public-eyebrow">
                    SMALLER GUESSWORK. BIGGER POSSIBILITIES.
                  </span>
                  <h2>
                    Your store has potential.
                    <br />
                    Let's <span className="ink-underline">find it.</span>
                  </h2>
                  <p>
                    Less tab-hopping. More time for the work that moves you
                    forward.
                  </p>
                </div>
                <div className="outcome-grid">
                  {outcomes.map(
                    ({ id, icon: Icon, title, text, label, color }) => (
                      <article className={'outcome-item ' + color} key={id}>
                        <Icon
                          className="feature-symbol"
                          size={44}
                          strokeWidth={1.6}
                        />
                        <span className="feature-label">{label}</span>
                        <h3>{title}</h3>
                        <p>{text}</p>
                        <a
                          href={'/services#' + id}
                          className="feature-link"
                          aria-label={'Explore ' + label}
                        >
                          Explore <ArrowRight size={18} />
                        </a>
                      </article>
                    ),
                  )}
                </div>
              </div>
            </section>
            <section className="public-band" id="how-it-works">
              <div className="public-container editorial-layout">
                <div className="toolkit-visual">
                  <ToolkitImage />
                  <span className="visual-caption">
                    A little more clarity for everything you sell.
                  </span>
                </div>
                <div className="editorial-copy">
                  <span className="public-eyebrow">
                    FROM BUSY TO ON TOP OF IT
                  </span>
                  <h2>
                    Bring the pieces
                    <br />
                    <span className="ink-underline">together.</span>
                  </h2>
                  <p>
                    From your first store check to your next price review, start
                    with what matters.
                  </p>
                  <ol className="public-workflow">
                    <li>
                      <span>01</span>
                      <div>
                        <h3>Connect your store</h3>
                        <p>
                          Authorize with Daraz to bring your orders and catalog
                          into view.
                        </p>
                      </div>
                    </li>
                    <li>
                      <span>02</span>
                      <div>
                        <h3>Find your next move</h3>
                        <p>
                          Follow the evidence across store performance,
                          listings, and the market.
                        </p>
                      </div>
                    </li>
                    <li>
                      <span>03</span>
                      <div>
                        <h3>Review, then act</h3>
                        <p>
                          Check your limits and log your recommendation with a
                          clear record.
                        </p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </section>
            <section className="public-band mint-band">
              <div className="public-container editorial-layout reverse-layout">
                <div className="editorial-copy">
                  <span className="public-eyebrow">
                    CONFIDENCE COMES FROM CONTEXT
                  </span>
                  <h2>
                    Better pricing.
                    <br />
                    <span className="ink-underline">Still your call.</span>
                  </h2>
                  <p>
                    A recommendation should come with reasons. See the market
                    evidence, check your rules, and decide with the whole
                    picture.
                  </p>
                  <a className="text-link" href="/services#safer-pricing">
                    Explore pricing <ArrowRight size={18} />
                  </a>
                </div>
                <PriceStory />
              </div>
            </section>
            <section className="public-band">
              <div className="public-container security-layout">
                <div>
                  <span className="public-eyebrow">
                    CONNECTED, WITH CONTROL
                  </span>
                  <h2>
                    Your data works for you.
                    <br />
                    On <span className="ink-underline">your terms.</span>
                  </h2>
                </div>
                <div className="trust-list">
                  <div>
                    <ShieldCheck size={22} />
                    <h3>Authorized by you</h3>
                    <p>
                      Connect through Daraz authorization. Stored credentials
                      are encrypted.
                    </p>
                  </div>
                  <div>
                    <Check size={22} />
                    <h3>Clear from the start</h3>
                    <p>
                      Real data, visible sources, and clearly labeled demos. No
                      invented conclusions.
                    </p>
                  </div>
                  <div>
                    <Tags size={22} />
                    <h3>AI, when you need it</h3>
                    <p>
                      Request a brief, choose your provider, or authorize a
                      compatible AI client.
                    </p>
                  </div>
                </div>
              </div>
            </section>
            <section className="public-band faq-band">
              <div className="public-container faq-layout">
                <div>
                  <span className="public-eyebrow">
                    LET'S CLEAR A FEW THINGS UP
                  </span>
                  <h2>
                    Good questions.
                    <br />
                    Straight answers.
                  </h2>
                </div>
                <div className="faq-list">
                  {faqs.map(([question, answer]) => (
                    <details key={question}>
                      <summary>
                        {question}
                        <ChevronDown size={18} />
                      </summary>
                      <p>{answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
            <section className="final-cta">
              <div className="public-container">
                <span className="public-eyebrow">
                  YOUR NEXT CHAPTER STARTS HERE
                </span>
                <h2>
                  Big plans?
                  <br />
                  Bring a <span className="ink-underline">better toolkit.</span>
                </h2>
                <p>Make more room for the business you want to build.</p>
                {startButton}
              </div>
            </section>
          </>
        )}

        {page === 'services' && (
          <>
            <section className="marketing-hero services-hero">
              <CommerceScene />
              <div className="hero-intro">
                <span className="public-eyebrow">THE DARAZ IQ TOOLKIT</span>
                <h1>
                  Daraz seller tools.
                  <br />
                  <span className="ink-underline">Clearer next steps.</span>
                </h1>
                <p>
                  Store analytics, competitor research, and pricing guardrails.
                  Know how your Daraz business is doing and what to review next.
                </p>
                <div className="hero-actions">
                  {startButton}
                  <a className="button ghost" href="#store-health">
                    Explore the tools <ArrowDown size={16} />
                  </a>
                </div>
              </div>
            </section>
            <div className="service-index public-container">
              {outcomes.map((item, i) => (
                <a key={item.id} href={'#' + item.id}>
                  <span>0{i + 1}</span>
                  {item.label}
                  <ArrowDown size={15} />
                </a>
              ))}
            </div>
            <section id="store-health" className="public-band">
              <div className="public-container editorial-layout">
                <div className="toolkit-visual">
                  <ToolkitImage />
                </div>
                <div className="editorial-copy">
                  <span className="public-eyebrow">01 / STORE INSIGHTS</span>
                  <h2>
                    Daraz store analytics.
                    <br />
                    <span className="ink-underline">A clearer picture.</span>
                  </h2>
                  <p>
                    Connect the dots between your orders, revenue, and
                    fulfillment. Get priorities you can follow, then dig into
                    the detail when you need it.
                  </p>
                  <ul className="feature-checklist">
                    <li>
                      <Check size={18} />
                      Order trends and fulfillment breakdowns
                    </li>
                    <li>
                      <Check size={18} />
                      Date ranges, source health, and freshness
                    </li>
                    <li>
                      <Check size={18} />
                      An AI brief, only when you ask
                    </li>
                  </ul>
                </div>
              </div>
            </section>
            <section
              id="product-intelligence"
              className="public-band lilac-band"
            >
              <div className="public-container editorial-layout reverse-layout">
                <div className="editorial-copy">
                  <span className="public-eyebrow">
                    02 / PRODUCT INTELLIGENCE
                  </span>
                  <h2>
                    Product research.
                    <br />
                    <span className="ink-underline">Meet your market.</span>
                  </h2>
                  <p>
                    Give every listing a closer look. Compare the market, review
                    listing quality, and follow the evidence into your next
                    pricing decision.
                  </p>
                  <ul className="feature-checklist">
                    <li>
                      <Check size={18} />
                      Your catalog, stock, and product details
                    </li>
                    <li>
                      <Check size={18} />
                      Competitor prices, sales, and reviews
                    </li>
                    <li>
                      <Check size={18} />
                      Listing quality and optional AI analysis
                    </li>
                  </ul>
                </div>
                <div className="product-still-life">
                  <div className="product-photo">
                    <img
                      src="/demo-headset.jpg"
                      alt="Headphones used as an illustrative product example"
                      width="400"
                      height="400"
                      loading="lazy"
                    />
                  </div>
                  <span className="product-tag">
                    <Tags size={26} />A place in the market.
                  </span>
                  <span className="example-caption">Illustrative product</span>
                </div>
              </div>
            </section>
            <section id="safer-pricing" className="public-band">
              <div className="public-container editorial-layout">
                <PriceStory />
                <div className="editorial-copy">
                  <span className="public-eyebrow">03 / SAFER PRICING</span>
                  <h2>
                    Pricing recommendations.
                    <br />
                    <span className="ink-underline">Your rules first.</span>
                  </h2>
                  <p>
                    Put competitor evidence next to your costs and limits.
                    Review the rationale, check each rule, and keep an audit
                    trail of your recommendation.
                  </p>
                  <p className="service-limit">
                    Currently log-only. Daraz IQ does not apply live marketplace
                    price changes.
                  </p>
                  {startButton}
                </div>
              </div>
            </section>
            <section className="public-band mint-band">
              <div className="public-container service-ai">
                <div>
                  <span className="public-eyebrow">
                    A LITTLE EXTRA PERSPECTIVE
                  </span>
                  <h2>Meet your AI side of the team.</h2>
                  <p>
                    Choose your provider, request a brief, or connect a
                    compatible AI client through protected MCP access.
                  </p>
                </div>
                <a
                  className="button secondary"
                  href="/contact"
                  onClick={link('contact')}
                >
                  Let's talk setup <ArrowRight size={17} />
                </a>
              </div>
            </section>
          </>
        )}

        {page === 'about' && (
          <>
            <section className="marketing-hero about-hero">
              <CommerceScene />
              <div className="hero-intro">
                <span className="public-eyebrow">MEET DARAZ IQ</span>
                <h1>
                  About Daraz IQ.
                  <br />
                  <span className="ink-underline">Built for sellers.</span>
                </h1>
                <p>
                  Based in Islamabad, Pakistan, Daraz IQ brings store analytics,
                  product research, and pricing evidence together for the daily
                  work of selling on Daraz.
                </p>
                <a className="button ghost" href="#our-story">
                  Our story <ArrowDown size={16} />
                </a>
              </div>
            </section>
            <section className="public-band" id="our-story">
              <div className="public-container editorial-layout">
                <ToolkitImage />
                <div className="editorial-copy">
                  <span className="public-eyebrow">
                    BUILT AROUND THE SELLER
                  </span>
                  <h2>
                    Less chasing information.
                    <br />
                    <span className="ink-underline">More moving forward.</span>
                  </h2>
                  <p>
                    Orders in one place. Competitors in another. Pricing
                    decisions somewhere in between. We bring that daily work
                    into one focused workspace.
                  </p>
                  <p>
                    Our job is to make the next step easier to understand, with
                    enough evidence for you to judge it yourself. AI can help
                    explain the picture. You stay in charge.
                  </p>
                </div>
              </div>
            </section>
            <section className="public-band mint-band">
              <div className="public-container">
                <div className="band-heading centered">
                  <span className="public-eyebrow">WHAT WE STAND FOR</span>
                  <h2>
                    Good tools.{' '}
                    <span className="ink-underline">Clear principles.</span>
                  </h2>
                </div>
                <div className="principle-grid">
                  <article>
                    <span>01</span>
                    <h3>Show what is known.</h3>
                    <p>
                      Make data sources, missing information, and demo states
                      explicit.
                    </p>
                  </article>
                  <article>
                    <span>02</span>
                    <h3>Keep you in control.</h3>
                    <p>
                      Make account access, pricing limits, and actions easy to
                      review.
                    </p>
                  </article>
                  <article>
                    <span>03</span>
                    <h3>Respect your day.</h3>
                    <p>
                      Clear priorities, useful detail, and fewer distractions
                      between you and your work.
                    </p>
                  </article>
                </div>
              </div>
            </section>
          </>
        )}

        {page === 'contact' && (
          <>
            <section className="public-page-intro contact-intro">
              <div className="public-container">
                <span className="public-eyebrow">LET'S TALK</span>
                <h1>
                  Contact Daraz IQ.
                  <br />
                  <span className="ink-underline">Let's talk.</span>
                </h1>
                <p>
                  Get help with your Daraz store connection, pricing rules,
                  competitor research, or AI setup. Reach our team in Islamabad,
                  Pakistan.
                </p>
              </div>
            </section>
            <section className="public-band contact-band">
              <div className="public-container contact-layout">
                <div className="contact-aside">
                  <h2>We're listening.</h2>
                  <address className="contact-details">
                    <a href={'mailto:' + site.email}>
                      <Mail size={19} />
                      <span>{site.email}</span>
                    </a>
                    <a href={'tel:' + site.phone}>
                      <Phone size={19} />
                      <span>{site.phoneDisplay}</span>
                    </a>
                    <a
                      href={site.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle size={19} />
                      <span>Chat on WhatsApp</span>
                      <ArrowRight size={16} />
                    </a>
                    <p>
                      <MapPin size={19} />
                      <span>{site.address}</span>
                    </p>
                  </address>
                  <ToolkitImage />
                  <div className="contact-note">
                    <h3>Account and data requests</h3>
                    <p>
                      Choose "Account and data access" for help with account
                      removal or connected-client access.
                    </p>
                  </div>
                </div>
                <ContactForm />
              </div>
            </section>
          </>
        )}

        {legal && (
          <>
            <div className="public-container public-page-intro legal-intro">
              <span className="public-eyebrow">THE DETAILS</span>
              <h1>
                {page === 'privacy' ? 'Privacy policy' : 'Terms and conditions'}
              </h1>
              <p>Last updated {legal.updated}</p>
            </div>
            <div className="public-container legal-layout">
              <aside>
                <nav aria-label="On this page">
                  <h2>On this page</h2>
                  {legal.sections.map(([title], index) => (
                    <a href={'#legal-' + index} key={title}>
                      {title}
                    </a>
                  ))}
                </nav>
              </aside>
              <article>
                {legal.sections.map(([title, text], index) => (
                  <section id={'legal-' + index} key={title}>
                    <span className="muted">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h2>{title}</h2>
                    <p>{text}</p>
                  </section>
                ))}
                <p className="legal-contact">
                  Questions?{' '}
                  <a href="/contact" onClick={link('contact')}>
                    Contact the team.
                  </a>
                </p>
              </article>
            </div>
          </>
        )}
      </main>
      <footer className="site-footer">
        <div className="public-container">
          <div className="footer-top">
            <div>
              <a href="/" onClick={link('home')}>
                <Brand />
              </a>
              <p>For the business you're building.</p>
              <p className="footer-contact">
                <a href={'mailto:' + site.email}>{site.email}</a>
                <br />
                <a href={'tel:' + site.phone}>{site.phoneDisplay}</a>
                <span>{site.address}</span>
              </p>
            </div>
            <nav aria-label="Footer navigation">{siteLinks}</nav>
          </div>
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} daraziq.store</span>
            <div>
              <a href="/privacy" onClick={link('privacy')}>
                Privacy
              </a>
              <a href="/terms" onClick={link('terms')}>
                Terms
              </a>
            </div>
            <span>Independent seller intelligence.</span>
          </div>
        </div>
      </footer>
      <Dialog
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        title="Site navigation"
        drawer
      >
        <nav className="mobile-site-nav" aria-label="Mobile website navigation">
          {siteLinks}
          <Button
            onClick={() => {
              setMenuOpen(false)
              onGetStarted()
            }}
          >
            Start free
          </Button>
        </nav>
      </Dialog>
    </div>
  )
}
