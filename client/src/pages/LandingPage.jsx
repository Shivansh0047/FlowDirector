import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  const callBackend = async (url, payload) => {
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('http://localhost:8000' + url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      setPlan(data.plan || data)
      setMsg(data.message || 'Done')
    } catch (e) {
      setMsg('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const links = [
    { label: 'About', href: '#about' },
  ]

  return (
    <div className="min-h-screen bg-[#faf9f6] text-[#0a0a0a] selection:bg-emerald-200 selection:text-emerald-900">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#faf9f6]/80 backdrop-blur-md border-b border-[#ececea]/60">
        <div className="mx-auto max-w-[1280px] px-8 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">F</span>
            FlowDirector
          </a>
          <div className="hidden md:flex items-center gap-3">
            <a href="#about" className="px-6 py-2.5 rounded-full text-sm font-semibold bg-[#0a0a0a] text-white hover:bg-[#222] transition-colors shadow-lg shadow-black/10">About</a>
          </div>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 -mr-2" aria-label="Menu">{mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
        </div>
        {mobileOpen && (
          <div className="md:hidden bg-[#faf9f6] border-t border-[#ececea]/60 px-8 py-6 space-y-4 shadow-2xl">
            {links.map(l => <a key={l.label} href={l.href} onClick={() => setMobileOpen(false)} className="block text-lg font-medium text-[#4a4a4a]">{l.label}</a>)}
            <div className="pt-4 flex flex-col gap-3"><button onClick={() => navigate('/')} className="text-sm font-medium text-[#4a4a4a] text-left">About</button><a href="#about" className="text-center py-3 rounded-full bg-[#0a0a0a] text-white font-semibold">About</a></div>
          </div>
        )}
      </nav>

      {/* Hero */}
      <header className="relative overflow-hidden bg-[#faf9f6] border-b border-[#ececea]/60">
        <div className="mx-auto max-w-[1280px] px-8 pt-28 pb-24 md:pt-36 md:pb-32 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#ececea]/80 text-[11px] font-semibold uppercase tracking-[0.15em] text-emerald-700 shadow-sm mb-10">
            <Sparkles className="w-3.5 h-3.5" /> AI Creative Production
          </div>
          <h1 className="text-[4.5rem] md:text-[6rem] font-extrabold leading-[1.05] tracking-[-0.04em] mb-7 text-[#0a0a0a]">
            Direct the creative <br className="hidden md:block" />
            <span className="text-[#0a0a0a]">with intelligence.</span>
          </h1>
          <p className="text-xl md:text-2xl text-[#5a5a5a] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            From brief to optimized workflow. Build, refine, and ship AI-powered content faster than ever.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-14">
            <button
              onClick={() => { callBackend('/api/creative-plan', { brief: { contentType: 'instagram_ad', product: 'Demo Product', audience: 'General', visualStyle: 'cinematic', duration: 30 }, brand_dna: { brandName: 'Demo', tone: ['premium'], colors: ['#10b981'] } }); setTimeout(() => navigate('/workflow'), 1200); }}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#0a0a0a] text-white font-medium shadow-xl shadow-black/10 hover:bg-[#222] transition-all"
            >
              {loading ? 'Generating...' : 'Start Generating'} <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => navigate('/workflow')} className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#0a0a0a] font-medium border border-[#ececea] hover:border-[#d6d6d6] transition-all">Try Demos</button>
          </div>
          <div className="flex justify-center gap-14 md:gap-20 text-[#8a8a8a] text-sm font-medium">
            <div><span className="block text-3xl font-extrabold text-[#0a0a0a] mb-1">3</span>Steps to workflow</div>
            <div><span className="block text-3xl font-extrabold text-[#0a0a0a] mb-1">100%</span>Brand aligned</div>
            <div><span className="block text-3xl font-extrabold text-[#0a0a0a] mb-1">&lt;5m</span>To delivery</div>
          </div>
        </div>
      <div className="relative mx-auto max-w-xl -mb-2 z-10"><div className="bg-[#fdfcf8]/95 backdrop-blur rounded-2xl shadow-xl border border-[#ececea] p-6 md:p-7 text-left"><div className="flex items-center gap-3 mb-3"><div className="w-1.5 h-8 rounded-full bg-emerald-500" /><span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-600">Workflow Preview</span></div><h3 className="text-xl font-bold mb-2 tracking-tight">Campaign Concept → Storyboard → Script</h3><p className="text-[#5a5a5a] text-sm mb-4">From brief to finished workflow in one connected canvas.</p><div className="flex gap-2"><span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-md text-xs font-medium border border-emerald-100">AI Creative</span><span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-medium border border-blue-100">Brand Guardian</span></div></div></div>
      </header>

      {/* Product / Ecosystem */}
      <main id="product" className="mx-auto max-w-[1280px] px-8">
        <section id="features" className="py-28 md:py-36">
          <div className="md:flex md:items-end md:justify-between mb-16 gap-8">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">Capabilities</h2>
              <h3 className="text-5xl md:text-7xl font-extrabold tracking-[-0.03em] leading-[1.1] text-[#0a0a0a]">Built for the full <br/>creative pipeline.</h3>
            </div>
            <p className="text-lg text-[#5a5a5a] max-w-md leading-relaxed md:text-right">Every tool connected. No context lost between ideation, production, and delivery.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'Creative Director', desc: 'Generate concepts, scripts, and storyboards from a single brief.', tag: 'AI Planning' },
              { title: 'Workflow Builder', desc: 'Turn plans into editable node-based production graphs.', tag: 'Graph Engine' },
              { title: 'Brand Guardian', desc: 'Auto-check prompts and outputs against your brand DNA.', tag: 'Compliance' },
            ].map((item) => (
              <button
                onClick={() => callBackend('/api/creative-plan', { brief: { contentType: 'instagram_ad', product: 'Demo Product', audience: 'General', visualStyle: 'cinematic', duration: 30 }, brand_dna: { brandName: 'Demo', tone: ['premium'], colors: ['#10b981'] } })}
                className="group block w-full text-left bg-white rounded-2xl p-8 md:p-10 border border-[#ececea] hover:border-emerald-200 transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-xl hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm"><Sparkles className="w-5 h-5" /></div>
                <h4 className="text-2xl font-bold mb-3 tracking-tight">{item.title}</h4>
                <p className="text-[#5a5a5a] leading-relaxed mb-6">{item.desc}</p>
                <span className="inline-block px-2.5 py-1 rounded-md bg-[#f5f5f0] text-[11px] font-bold uppercase tracking-wider text-[#6a6a6a]">{item.tag}</span>
              </button>
            ))}
          </div>
        </section>

        <section id="solutions" className="py-28 md:py-36 border-t border-[#ececea]/60">
          <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-start">
            <div className="md:w-1/2">
              <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">Creative Ecosystem</h2>
              <h3 className="text-5xl md:text-6xl font-extrabold tracking-[-0.03em] leading-[1.1] text-[#0a0a0a] mb-8">Tools that talk to each other.</h3>
              <p className="text-lg text-[#5a5a5a] leading-relaxed mb-8">Every module in the platform connects through a shared context layer. Your brief flows into the graph, your graph feeds back into the safeguard, and your safeguard informs the next iteration.</p>
              <ul className="space-y-4 text-[#3a3a3a]">
                {['Brief → Plan → Workflow', 'Real-time cost optimization', 'Brand DNA consistency guard'].map(i => (
                  <li key={i} className="flex items-center gap-3"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> <span className="font-medium">{i}</span></li>
                ))}
              </ul>
            </div>
            <div className="md:w-1/2">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Creative Director', cat: 'Planning' },
                  { name: 'Workflow Builder', cat: 'Graph Engine' },
                  { name: 'Brand Guardian', cat: 'Compliance' },
                  { name: 'Optimizer', cat: 'Cost / Speed' },
                  { name: 'Model Router', cat: 'AI Routing' },
                  { name: 'Chat Command', cat: 'Interaction' },
                ].map(i => (
                  <a key={i.name} href="#" className="group bg-white border border-[#ececea] hover:border-emerald-200 rounded-2xl p-6 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-lg hover:-translate-y-0.5">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a8a] mb-2">{i.cat}</div>
                    <div className="text-lg font-bold tracking-tight mb-1 group-hover:text-emerald-700 transition-colors">{i.name}</div>
                    <div className="text-sm text-[#7a7a7a]">Connected via context layer</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="py-20 md:py-28 bg-[#fdfcf8] border-t border-[#ececea]/60">
        <div className="mx-auto max-w-[1280px] px-8 text-center">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 mb-3">About FlowDirector</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold tracking-[-0.03em] text-[#0a0a0a] mb-6">AI Creative Orchestration</h3>
          <p className="text-base text-[#5a5a5a] max-w-2xl mx-auto leading-relaxed">FlowDirector connects briefs, storyboards, and production workflows through intelligent agent routing. It turns creative ideas into optimized, brand-consistent outputs — faster.</p>
        </div>
      </section>
      </main>

      <footer className="border-t border-[#ececea]/60 bg-[#fefefc]">
        <div className="mx-auto max-w-[1280px] px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-[#8a8a8a]">
          <div className="flex items-center gap-2 font-bold text-[#0a0a0a]">FlowDirector</div>
          <div className="flex gap-8"><a href="#" className="hover:text-[#0a0a0a]">Product</a><a href="#" className="hover:text-[#0a0a0a]">Features</a><a href="#" className="hover:text-[#0a0a0a]">Pricing</a></div>
          <div>© 2026 FlowDirector. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
