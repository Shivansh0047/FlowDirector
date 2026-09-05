import { useState } from 'react'
import { Sparkles, ArrowLeft, Play, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function WorkflowCanvas() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('workflow')

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100">FlowDirector</span>
            <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30">
              DEMO
            </span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-sm text-slate-400">Project: Aura Skin — Morning Reset</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-slate-400 bg-slate-800/50 px-4 py-1.5 rounded-lg border border-slate-700">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Est. Cost: <strong className="text-slate-200">$1.84</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              Est. Time: <strong className="text-slate-200">4m 20s</strong>
            </span>
          </div>

          <button className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg text-sm transition-all shadow-md">
            <Play className="w-4 h-4" />
            Run Workflow
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chat / Command Panel */}
        <div className="w-80 border-r border-slate-800 bg-slate-900/30 flex flex-col">
          <div className="p-4 border-b border-slate-800">
            <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Agent Assistant
            </h3>
          </div>
          <div className="flex-1 p-4 overflow-y-auto text-sm text-slate-400">
            <p className="bg-slate-800/40 p-3 rounded-lg border border-slate-800 text-slate-300">
              👋 I generated the 6-scene production workflow for <strong>Aura Skin</strong>.
              Try saying: <br />
              <span className="text-cyan-400 font-mono text-xs block mt-2">"Make this 30% cheaper"</span>
            </p>
          </div>
          <div className="p-4 border-t border-slate-800">
            <input
              type="text"
              placeholder="Ask agent to modify workflow..."
              className="w-full bg-slate-800/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Center: Workflow Canvas Placeholder */}
        <div className="flex-1 bg-slate-950 flex items-center justify-center relative">
          <div className="text-center text-slate-500">
            <p className="text-lg font-medium text-slate-400">Interactive Canvas Scaffolding</p>
            <p className="text-sm">React Flow node canvas will render here</p>
          </div>
        </div>

        {/* Right: Inspector / Node Details */}
        <div className="w-80 border-l border-slate-800 bg-slate-900/30 p-4">
          <h3 className="font-semibold text-sm text-slate-200 mb-4">Node Inspector</h3>
          <p className="text-xs text-slate-500">Select any node on the canvas to configure prompt, model routing, and brand checks.</p>
        </div>
      </div>
    </div>
  )
}
