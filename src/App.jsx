import { useEffect, useState } from 'react'
import {
  ArrowRight,
  Building2,
  Check,
  Database,
  Download,
  FileSpreadsheet,
  FileText,
  Rocket,
  Server,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Any Format Support',
    description: 'Works with all payslip designs — no template setup needed',
  },
  {
    icon: Upload,
    title: 'Bulk Processing',
    description: 'Upload 100s of payslips at once',
  },
  {
    icon: FileSpreadsheet,
    title: '15+ Fields Extracted',
    description: 'Name, CTC, Basic, HRA, PF, TDS, Net Pay and more',
  },
  {
    icon: Sparkles,
    title: 'Confidence Scoring',
    description: 'Each field shows accuracy confidence so you can verify',
  },
  {
    icon: Server,
    title: 'API Access',
    description: 'Integrate directly into your loan or HR system',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-Grade Security',
    description:
      'Documents deleted after processing. Never stored permanently.',
  },
]

const steps = [
  {
    icon: Upload,
    title: 'Upload PDFs',
    description: 'Drag and drop single or bulk payslips',
  },
  {
    icon: Database,
    title: 'AI Extracts',
    description: 'Our AI reads any payslip format instantly',
  },
  {
    icon: Download,
    title: 'Download Excel',
    description: 'Get a clean structured spreadsheet',
  },
]

const plans = [
  { name: 'Starter', price: '₹1,999/mo', details: '200 payslips' },
  {
    name: 'Growth',
    price: '₹4,999/mo',
    details: '1,000 payslips',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: '₹15,000/mo',
    details: 'Unlimited + API',
  },
]

function App() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen">
      <header
        className={`sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur transition-shadow ${
          scrolled ? 'shadow-navbar' : ''
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <a href="#" className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-5 w-5 text-brand" />
            PayslipIQ
          </a>
          <div className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#pricing" className="hover:text-slate-900">Pricing</a>
            <a href="#how-it-works" className="hover:text-slate-900">How it Works</a>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Login
            </button>
            <button className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-600">
              Start Free Trial
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-16 pt-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              <Rocket className="h-3.5 w-3.5" /> AI-powered payslip automation
            </p>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-5xl">
              Convert Any Payslip to Excel in Seconds
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              Upload bulk payslips — our AI extracts Employee name, Gross salary, Net pay, PF, TDS and 15+ fields automatically. No templates. No manual entry.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button className="rounded-lg bg-brand px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-600">
                Start Free Trial
              </button>
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                See How It Works
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Input PDF</p>
                <div className="space-y-2 text-xs text-slate-600">
                  <p className="rounded bg-white px-3 py-2">Employee Payslip - Jan.pdf</p>
                  <p className="rounded bg-white px-3 py-2">Employee Payslip - Feb.pdf</p>
                  <p className="rounded bg-white px-3 py-2">Employee Payslip - Mar.pdf</p>
                </div>
              </div>
              <div className="mx-auto rounded-full bg-indigo-50 p-3 text-brand">
                <ArrowRight className="h-5 w-5" />
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Output Excel</p>
                <div className="space-y-1 text-xs text-slate-700">
                  <p className="grid grid-cols-2 gap-2 rounded bg-white px-3 py-2"><span>Name</span><span>Net Pay</span></p>
                  <p className="grid grid-cols-2 gap-2 rounded bg-white px-3 py-2"><span>Asha</span><span>₹62,000</span></p>
                  <p className="grid grid-cols-2 gap-2 rounded bg-white px-3 py-2"><span>Vikram</span><span>₹58,500</span></p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-slate-200 bg-white/90 py-8">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 md:flex-row">
            <p className="text-sm font-medium text-slate-700">
              Trusted by 200+ CA firms and NBFCs across India
            </p>
            <div className="flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, idx) => (
                <Star key={idx} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              {['CA Firm', 'NBFC', 'HR Tech'].map((logo) => (
                <div key={logo} className="rounded-md border border-slate-200 bg-slate-50 px-4 py-2 text-center">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">How it Works</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <article key={step.title} className="rounded-xl border border-slate-200 bg-white p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-brand">
                      {index + 1}
                    </span>
                    <Icon className="h-5 w-5 text-slate-500" />
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{step.description}</p>
                </article>
              )
            })}
          </div>
        </section>

        <section id="features" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="text-center text-3xl font-bold tracking-tight">Features Built for Indian Businesses</h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <article key={feature.title} className="rounded-xl border border-slate-200 p-6">
                    <Icon className="h-6 w-6 text-brand" />
                    <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="text-center text-3xl font-bold tracking-tight">Simple Pricing</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-xl border bg-white p-6 ${
                  plan.popular ? 'border-brand shadow-md ring-2 ring-indigo-100' : 'border-slate-200'
                }`}
              >
                {plan.popular && (
                  <span className="mb-4 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-brand">
                    Most Popular
                  </span>
                )}
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-4 text-3xl font-bold">{plan.price}</p>
                <p className="mt-2 text-sm text-slate-600">{plan.details}</p>
                <ul className="mt-6 space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand" />
                    AI extraction pipeline
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-brand" />
                    Excel-ready exports
                  </li>
                </ul>
                <button
                  className={`mt-8 w-full rounded-lg px-4 py-2 text-sm font-semibold ${
                    plan.popular
                      ? 'bg-brand text-white hover:bg-indigo-600'
                      : 'border border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Get Started
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-slate-600 md:flex-row">
          <div className="flex items-center gap-2 font-semibold text-slate-900">
            <Building2 className="h-4 w-4 text-brand" />
            PayslipIQ <span className="font-normal text-slate-500">AI-powered payslip to Excel converter</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-900">Privacy Policy</a>
            <a href="#" className="hover:text-slate-900">Terms</a>
            <a href="#" className="hover:text-slate-900">Contact</a>
          </div>
          <p>Made in India 🇮🇳</p>
        </div>
      </footer>
    </div>
  )
}

export default App
