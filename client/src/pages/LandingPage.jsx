import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Workflow, Shield, Zap, Clock, MessageSquare, Bot, TrendingUp, X } from 'lucide-react'
import BriefChatbot from '../components/BriefChatbot'

export default function LandingPage() {
  const navigate = useNavigate()
  const [showChatbot, setShowChatbot] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  const handleNavigate = (path) => {
    if (!isNavigating) {
      setIsNavigating(true)
      navigate(path)
      setTimeout(() => setIsNavigating(false), 500)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white">
      {/* Demo Badge */}
      <div className="fixed top-4 right-4 z-50">
        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-600 text-xs font-semibold">
          <Sparkles className="w-3 h-3" />
          DEMO PROTOTYPE
        </span>
      </div>

      {/* Hero Section */}
      <section className="relative py-20 pt-28 pb-16 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 opacity-90" />
        </div>

        <div className="relative z-10 container mx-auto px-6 pt-20 text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent leading-tight">
            FlowDirector
          </h1>
          <p className="text-xl text-slate-600 mb-6 max-w-2xl mx-auto">
            AI Creative Production Director
          </p>
          <p className="text-lg text-slate-500 max-w-xl mx-auto mb-8 leading-relaxed">
            From creative brief to model-optimized AI workflow
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <button
              onClick={() => handleNavigate('/workflow')}
              className="btn-primary btn-hover-lg px-8 py-3 text-base flex items-center gap-2 transition-all duration-300"
            >
              <Clock className="w-4 h-4" />
              Start Creating
            </button>
            <button
              onClick={() => setShowChatbot(true)}
              className="btn-outline btn-hover-lg px-8 py-3 text-base flex items-center gap-2 transition-all duration-300"
            >
              <MessageSquare className="w-4 h-4" />
              Try the Demo
            </button>
          </div>

          <p className="text-slate-400 text-sm mt-6">
            No signup required • Free prototype • Deployed on Vercel
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="section section-tint pb-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              How FlowDirector Works
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto">
              Transform your creative vision into an optimized production workflow with intelligent AI orchestration
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1: Creative Brief */}
            <div className="card-elevated hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Bot className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 text-slate-900">
                  Creative Brief Input
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Start with a natural language description of your creative vision - no technical expertise needed
                </p>
              </div>
            </div>

            {/* Feature 2: AI Planning */}
            <div className="card-elevated hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 text-slate-900">
                  AI Creative Director
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Transforms briefs into structured concepts, storyboards, and execution plans
                </p>
              </div>
            </div>

            {/* Feature 3: Workflow Builder */}
            <div className="card-elevated hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="w-12 h-12 bg-teal-500/10 rounded-xl flex items-center justify-center mb-4">
                  <Workflow className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 text-slate-900">
                  Visual Workflow Canvas
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Edit and refine your AI-powered production workflow in an intuitive node-based interface
                </p>
              </div>
            </div>

            {/* Feature 4: Model Optimization */}
            <div className="card-elevated hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-slate-900 text-slate-900">
                  Intelligent Model Routing
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Automatically selects optimal AI models based on quality, cost, and speed requirements
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brand Consistency Section */}
      <section className="section section-tint pb-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6 text-slate-900">
              Brand Consistency Built-In
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Ensure every generated asset aligns perfectly with your brand guidelines
            </p>
          </div>

          <div className="glass p-8 rounded-xl border border-slate-600/30">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-cyan-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3 text-slate-900">
                  AI Brand Consistency Guardian
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  Every creative output is automatically evaluated against your Brand DNA - from color palette to tone, composition to restrictions. Get actionable feedback with one-click fixes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Preview */}
      <section className="section section-tint pb-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 bg-clip-text text-transparent">
              See Your Creative Workflow Come to Life
            </h2>
            <p className="text-slate-400 max-w-3xl mx-auto">
              Visual, editable, and optimizable - your workflow as a living production system
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-start">
            {/* Workflow Card */}
            <div className="card hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                    <Workflow className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-slate-900 text-slate-900">
                      Node-Based Workflow
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Drag, drop, connect, and configure AI generation tasks as visual nodes
                    </p>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-slate-50 bg-white rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3 h-3 text-cyan-400" />
                    <span className="font-medium text-slate-900 text-slate-900">Creative Brief</span>
                  </div>
                  <div className="h-0.5 bg-slate-200 bg-slate-100 mx-4 my-2" />
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="w-3 h-3 text-blue-400" />
                    <span className="font-medium text-slate-900 text-slate-900">Storyboard</span>
                  </div>
                  <div className="h-0.5 bg-slate-200 bg-slate-100 mx-4 my-2" />
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-3 h-3 text-blue-400" />
                    <span className="font-medium text-slate-900 text-slate-900">Scene Generation</span>
                  </div>
                  <div className="h-0.5 bg-slate-200 bg-slate-100 mx-4 my-2" />
                  <div className="flex items-center gap-2">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span className="font-medium text-slate-900 text-slate-900">Brand Check</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optimization Card */}
            <div className="card hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-slate-900 text-slate-900">
                      Smart Optimization
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Tell FlowDirector to make it cheaper, faster, or better - it understands
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-slate-50 bg-white rounded-lg border border-slate-200 dark:border-slate-700">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <div>
                        <span className="font-medium text-slate-900 text-slate-900">Original Estimate</span>
                        <span className="ml-auto text-slate-500">$1.84 • 4m 20s</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 bg-white rounded-lg border border-slate-200 dark:border-slate-700">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="font-medium text-slate-900 text-slate-900">After "Make it 30% cheaper"</span>
                        <span className="ml-auto text-slate-500">$1.29 • 4m 05s</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 bg-white rounded-lg border border-slate-200 dark:border-slate-700">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <div>
                        <span className="font-medium text-slate-900 text-slate-900">After "Maximize quality"</span>
                        <span className="ml-auto text-slate-500">$2.45 • 5m 10s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Chat Card */}
            <div className="card hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-1 text-slate-900 text-slate-900">
                      Conversational Interface
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Talk to your workflow like a creative partner - refine, optimize, and evolve
                    </p>
                  </div>
                </div>

                <div className="mt-4 h-40 bg-slate-50 bg-white rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
                      <span className="text-slate-600 dark:text-slate-300">FlowDirector</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-slate-600 text-sm font-medium">Workflow generated successfully.</p>
                      <p className="text-slate-500 text-xs">Available commands:</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Make cheaper</span>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Check brand</span>
                        <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">Optimize speed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section section-tint pb-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold mb-6 text-slate-900">
            Ready to Transform Your Creative Workflow?
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto mb-8">
            Experience the future of AI-powered creative production today
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button
              onClick={() => handleNavigate('/workflow')}
              className="btn-primary btn-hover-lg px-8 py-3 text-base flex items-center gap-2 transition-all duration-300"
            >
              <Clock className="w-4 h-4" />
              Start Creating
            </button>
            <button
              onClick={() => setShowChatbot(true)}
              className="btn-outline btn-hover-lg px-8 py-3 text-base flex items-center gap-2 transition-all duration-300"
            >
              <MessageSquare className="w-4 h-4" />
              Try the Demo
            </button>
          </div>
          <p className="text-slate-400 text-sm mt-6">
            Join creative professionals who are already directing their AI workflows with FlowDirector
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-100 border-slate-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-0 md:mb-0">
              <span className="font-bold text-slate-900 tracking-tight">FlowDirector</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                DEMO PROTOTYPE
              </span>
            </div>
            <div className="text-slate-400 text-sm">
              © 2026 FlowDirector. Built for HexCoded product role application.
            </div>
          </div>
        </div>
      </footer>

      {/* Chatbot Modal */}
      {showChatbot && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowChatbot(false)}
              className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <BriefChatbot />
          </div>
        </div>
      )}
    </div>
  )
}