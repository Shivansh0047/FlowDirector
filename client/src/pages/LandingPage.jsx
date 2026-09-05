import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Workflow, Shield, Zap, X } from 'lucide-react'
import BriefChatbot from '../components/BriefChatbot'

export default function LandingPage() {
  const navigate = useNavigate()
  const [showChatbot, setShowChatbot] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Demo Badge */}
      <div className="fixed top-4 right-4 z-50">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-500/50 text-blue-400 text-sm font-semibold">
          <Sparkles className="w-4 h-4" />
          DEMO PROTOTYPE
        </span>
      </div>

      {/* Chatbot Modal */}
      {showChatbot && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowChatbot(false)}
              className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <BriefChatbot />
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="container mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
          FlowDirector
        </h1>
        <p className="text-2xl text-slate-300 mb-4">
          AI Creative Production Director
        </p>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
          From creative brief to model-optimized AI workflow
        </p>
      </div>

      {/* Context Section */}
      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-semibold mb-4 text-slate-100">What is FlowDirector?</h2>
          <p className="text-slate-300 mb-6 leading-relaxed">
            FlowDirector is an AI orchestration layer that sits above individual AI creative generation tools.
            It translates a creative brief into a structured, brand-consistent, cost-optimized, node-based production workflow.
          </p>
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-300 text-sm">
              <strong>Note:</strong> This prototype demonstrates orchestration intelligence and agent-driven workflow construction.
              The production version is designed to integrate with platforms like <strong>HexCoded</strong> using their actual AI models.
            </p>
          </div>
        </div>

        {/* Four Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <PillarCard
            icon={<Sparkles className="w-6 h-6" />}
            title="AI Creative Director"
            description="Translates briefs into structured campaign concepts, storyboards, and scripts"
          />
          <PillarCard
            icon={<Workflow className="w-6 h-6" />}
            title="Workflow Auto-Builder"
            description="Converts creative plans into interactive, editable, node-based execution graphs"
          />
          <PillarCard
            icon={<Shield className="w-6 h-6" />}
            title="Brand Consistency Guardian"
            description="Enforces Brand DNA (palette, tone, restrictions) with 1-click auto-fixes"
          />
          <PillarCard
            icon={<Zap className="w-6 h-6" />}
            title="AI Model Router"
            description="Scores and selects optimal models based on Quality, Cost, and Speed tradeoffs"
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => setShowChatbot(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            Try the Demo
          </button>
          <p className="text-slate-500 text-sm mt-4">
            No signup required • Free prototype
          </p>
        </div>
      </div>
    </div>
  )
}

function PillarCard({ icon, title, description }) {
  return (
    <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
      <div className="text-cyan-400 mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-100 mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{description}</p>
    </div>
  )
}
