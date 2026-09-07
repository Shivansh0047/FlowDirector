import { useState, useRef, useEffect } from 'react'
import { Sparkles, ArrowRight, Check, Zap, Layers, Shield, DollarSign, Gauge, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useWorkflowStore from '../context/workflowStore'
import { DEMO_PRESETS } from '../utils/demoData'
import { agentsAPI } from '../utils/api'

const CONTENT_TYPES = [
  { id: 'instagram_ad', label: 'Instagram Ad (30s)', desc: 'Polished vertical video with product reveal & CTA' },
  { id: 'tiktok_ugc', label: 'TikTok UGC Style (15s)', desc: 'Fast-paced, authentic creator-first format' },
  { id: 'youtube_short', label: 'YouTube Short (60s)', desc: 'Story-driven hook with dynamic pacing' },
  { id: 'cinematic_film', label: 'Cinematic Product Film (45s)', desc: 'High-end lighting, 3D renders & epic audio' },
]

const VISUAL_STYLES = [
  { id: 'cinematic_warm', label: 'Cinematic Warm Morning', desc: 'Soft golden hour, natural skin texture, lens flares' },
  { id: 'minimal_luxury', label: 'Minimalist Luxury Studio', desc: 'Monochrome contrast, elegant shadows, crisp textures' },
  { id: 'cyber_dark', label: 'Cyberpunk Dark / Neon Rim', desc: 'High contrast, futuristic glow, deep shadows' },
  { id: 'raw_authentic', label: 'Raw Documentary / UGC', desc: 'Natural grain, approachable daylight, handheld feel' },
]

export default function BriefChatbot({ open = false, onClose, onComplete }) {
  const navigate = useNavigate()
  const { setProject, loadDemoWorkflow } = useWorkflowStore()

  // Form state
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    contentType: 'instagram_ad',
    product: '',
    productDescription: '',
    audience: 'Gen Z / Young Professionals',
    visualStyle: 'cinematic_warm',
    brandName: '',
    brandTone: 'premium, authentic, minimal',
    restrictions: 'Avoid saturated neon colors, maintain natural textures',
    priority: { quality: 0.6, cost: 0.2, speed: 0.2 },
  })

  // Chat message history representation
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "ðŸ‘‹ Welcome! I'm your AI Creative Director. Let's build your brand-consistent, model-optimized production workflow step-by-step.",
      step: 1
    }
  ])

  const [isGenerating, setIsGenerating] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, step])

  const handleNextStep = (nextStep, botResponse, userSummary) => {
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: userSummary },
      { sender: 'bot', text: botResponse, step: nextStep }
    ])
    setStep(nextStep)
  }

  // Load a demo preset directly
  const handleSelectPreset = (preset) => {
    setProject({
      id: preset.id,
      name: preset.name,
      brief: preset.brief,
      brandDNA: preset.brandDNA
    })
    loadDemoWorkflow(preset.workflow)
    navigate('/workflow')
  }

  // Submit and generate workflow
  const handleGenerateWorkflow = async () => {
    setIsGenerating(true)

    try {
      if (!formData.product.trim()) {
        alert("Enter product name and brand first.")
        setIsGenerating(false)
        return
      }
      // Build brief and brand DNA from formData
      const brief = {
        contentType: formData.contentType,
        product: formData.product,
        productDescription: formData.productDescription,
        audience: formData.audience,
        visualStyle: formData.visualStyle,
        duration: 30,
        priority: formData.priority,
      }

      const brandDNA = {
        brandName: formData.brandName || formData.product,
        tone: formData.brandTone.split(',').map(t => t.trim()),
        restrictions: formData.restrictions.split(',').map(r => r.trim()),
      }

      // Full orchestration: brief -> gpt-oss-120b plan -> router selects model -> brand guard -> optimizer
      const orchestration = await agentsAPI.orchestrate(brief, brandDNA, formData.priority)
      const creativePlan = orchestration.trace.step_1_creative_plan
      const workflow = orchestration.trace.step_2_workflow
      const brandCheck = orchestration.trace.step_2_brand_check
      const routed = orchestration.trace.step_2_model_routing
      const optimized = orchestration.trace.step_3_optimized

      // Step 3: Create Project State
      const newProject = {
        id: `project_${Date.now()}`,
        name: `${formData.product || 'Custom Project'} Campaign`,
        brief,
        brandDNA,
        creativePlan
      }

      setProject({ ...newProject, routing: routed, brandCheck, optimized })
      loadDemoWorkflow(optimized ? optimized.optimized_workflow || workflow : workflow)

      setIsGenerating(false)
      navigate('/workflow')
    } catch (error) {
      console.error('Error generating workflow:', error)

      // Fallback to demo workflow on error
      const baseDemo = DEMO_PRESETS[0].workflow
      const newProject = {
        id: `project_${Date.now()}`,
        name: `${formData.product || 'Demo Project'} Campaign`,
        brief: {
          contentType: formData.contentType,
          product: formData.product,
          productDescription: formData.productDescription,
          audience: formData.audience,
          visualStyle: formData.visualStyle,
          priority: formData.priority,
        },
        brandDNA: {
          brandName: formData.brandName || formData.product,
          tone: formData.brandTone.split(',').map(t => t.trim()),
          restrictions: formData.restrictions.split(',').map(r => r.trim()),
        }
      }

      setProject(newProject)
      loadDemoWorkflow(baseDemo)

      setIsGenerating(false)
      navigate('/workflow')
    }
  }

  return (
    <>
      {open && (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 px-4" onClick={onClose}>
      <div className="max-w-4xl w-full bg-white/90 border border-slate-200 rounded-2xl shadow-2xl backdrop-blur overflow-hidden flex flex-col h-[700px]" onClick={e => e.stopPropagation()}>
      {/* Top Bar with Demo Switcher */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white/90 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-green-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-slate-950" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              FlowDirector Creative Assistant
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40">
                Step {step} of 6
              </span>
            </h2>
            <p className="text-xs text-slate-500">Interactive brief questionnaire</p>
          </div>
        </div>

        {/* Quick Load Demo Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-900 hidden sm:inline">Or quick load:</span>
          {DEMO_PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-700 text-slate-600 hover:text-cyan-300 border border-slate-300 transition-colors flex items-center gap-1.5"
              title={preset.tagline}
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              {preset.name.split('â€”')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat / Questionnaire Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.sender === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </div>
            )}
            <div
              className={`max-w-xl rounded-2xl p-4 text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-button text-white rounded-tr-none'
                  : 'bg-slate-100/80 text-slate-800 border border-slate-300/60 rounded-tl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {/* Step-specific Input Controls */}
        <div className="mt-4 bg-white/90 border border-slate-200 rounded-xl p-5 shadow-inner">
          {/* STEP 1: Content Type */}
          {step === 1 && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Select Content Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONTENT_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => {
                      setFormData({ ...formData, contentType: type.id })
                      handleNextStep(
                        2,
                        `Got it! ${type.label} selected. What product, service, or creative subject are we promoting?`,
                        `Format: ${type.label}`
                      )
                    }}
                    className={`p-3.5 text-left rounded-xl border transition-all ${
                      formData.contentType === type.id
                        ? 'border-cyan-500 bg-cyan-500/10 text-slate-900'
                        : 'border-slate-200 bg-slate-100/60 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-sm">{type.label}</div>
                    <div className="text-xs text-slate-900 mt-1">{type.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Product / Subject */}
          {step === 2 && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Product Details
              </label>
              <input
                type="text"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                placeholder="e.g., Aura Glow Botanical Serum"
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-400"
              />
              <textarea
                value={formData.productDescription}
                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                placeholder="Key features (e.g., Amber glass bottle, hyaluronic acid, dewy glow finish)"
                rows={2}
                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-800 focus:outline-none focus:border-emerald-400"
              />
              <button
                disabled={!formData.product.trim()}
                onClick={() => handleNextStep(
                  3,
                  `Awesome! "${formData.product}" sounds compelling. Who is your primary target audience?`,
                  `Product: ${formData.product} â€” ${formData.productDescription}`
                )}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 disabled:opacity-50 text-white font-medium rounded-lg text-xs flex items-center gap-2"
              >
                Continue <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 3: Target Audience */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Target Audience Demographics & Persona
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  'Gen Z & Young Adults (18-25)',
                  'Millennial Professionals (26-38)',
                  'Tech Enthusiasts & Creators',
                  'Eco-conscious Luxury Consumers'
                ].map(aud => (
                  <button
                    key={aud}
                    onClick={() => {
                      setFormData({ ...formData, audience: aud })
                      handleNextStep(
                        4,
                        `Targeting ${aud}. Now, what visual style & lighting atmosphere should FlowDirector mandate?`,
                        `Audience: ${aud}`
                      )
                    }}
                    className="p-3 text-left rounded-lg border border-slate-200 bg-slate-100/60 hover:border-emerald-400 text-xs font-medium text-slate-800 transition-all"
                  >
                    {aud}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Visual Style */}
          {step === 4 && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Visual Style & Camera Direction
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VISUAL_STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => {
                      setFormData({ ...formData, visualStyle: style.id })
                      handleNextStep(
                        5,
                        `Selected "${style.label}". Next, let's configure your Brand DNA so the Brand Guardian can protect consistency across models.`,
                        `Visual Style: ${style.label}`
                      )
                    }}
                    className="p-3.5 text-left rounded-xl border border-slate-200 bg-slate-100/60 hover:border-emerald-400 text-slate-800 transition-all"
                  >
                    <div className="font-semibold text-sm">{style.label}</div>
                    <div className="text-xs text-slate-900 mt-1">{style.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: Brand DNA & Rules */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-wider">
                <Shield className="w-4 h-4" /> Brand DNA & Restrictions
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Brand Name</label>
                  <input
                    type="text"
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="e.g. Aura Skin"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Tone Keywords</label>
                  <input
                    type="text"
                    value={formData.brandTone}
                    onChange={(e) => setFormData({ ...formData, brandTone: e.target.value })}
                    placeholder="premium, authentic, minimal"
                    className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Brand Restrictions (Guardian Rules)</label>
                <input
                  type="text"
                  value={formData.restrictions}
                  onChange={(e) => setFormData({ ...formData, restrictions: e.target.value })}
                  placeholder="Avoid saturated neon colors, maintain natural skin texture"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800"
                />
              </div>
              <button
                onClick={() => handleNextStep(
                  6,
                  `Brand DNA saved! Lastly, set your optimization priorities for the Model Router (Quality vs Cost vs Speed).`,
                  `Brand DNA: ${formData.brandName || 'Configured'} with restrictions`
                )}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-lg text-xs flex items-center gap-2"
              >
                Set Priorities <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* STEP 6: Priorities & Generate */}
          {step === 6 && (
            <div className="space-y-5">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <Gauge className="w-4 h-4 text-cyan-400" />
                Model Router Optimization Weights
              </label>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Quality Priority</span>
                    <strong className="text-cyan-400">{Math.round(formData.priority.quality * 100)}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={formData.priority.quality}
                    onChange={(e) => setFormData({
                      ...formData,
                      priority: { ...formData.priority, quality: parseFloat(e.target.value) }
                    })}
                    className="w-full accent-cyan-400"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Cost Sensitivity</span>
                    <strong className="text-emerald-400">{Math.round(formData.priority.cost * 100)}%</strong>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.05"
                    value={formData.priority.cost}
                    onChange={(e) => setFormData({
                      ...formData,
                      priority: { ...formData.priority, cost: parseFloat(e.target.value) }
                    })}
                    className="w-full accent-emerald-400"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Start Over
                </button>

                <button
                  onClick={handleGenerateWorkflow}
                  disabled={isGenerating}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl text-sm shadow-lg flex items-center gap-2 transition-all transform active:scale-95"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Building AI Workflow...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Build Production Workflow
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        <div ref={chatEndRef} />
      </div>
    </div>
  </div>
)}
</>
)
}