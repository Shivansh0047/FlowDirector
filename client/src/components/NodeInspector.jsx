import { useState } from 'react'
import { X, DollarSign, Clock, Shield, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react'
import useWorkflowStore from '../context/workflowStore'

export default function NodeInspector() {
  const { selectedNode, setSelectedNode, updateNode } = useWorkflowStore()
  const [prompt, setPrompt] = useState(selectedNode?.data?.prompt || '')

  if (!selectedNode) {
    return (
      <div className="p-4 text-center text-slate-500">
        <Sparkles className="w-8 h-8 mx-auto mb-2 text-slate-600" />
        <p className="text-sm font-medium text-slate-400">No node selected</p>
        <p className="text-xs mt-1">Click any node on the canvas to inspect its configuration and model routing.</p>
      </div>
    )
  }

  const { data } = selectedNode

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm text-slate-100">{data.label}</h3>
          <p className="text-xs text-slate-500 capitalize">{data.type?.replace('_', ' ')}</p>
        </div>
        <button
          onClick={() => setSelectedNode(null)}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Model Selection */}
        {data.model && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Selected Model
            </label>
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-sm font-medium text-cyan-400">
                  {data.model.name}
                </span>
                <span className="text-xs text-slate-500">Provider: {data.model.provider || 'AI'}</span>
              </div>
              {data.modelReason && (
                <p className="text-xs text-slate-400 mt-2 bg-slate-900/50 p-2 rounded border border-slate-800">
                  💡 <strong>Router explanation:</strong> {data.modelReason}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Cost & Time Metrics */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            Estimates
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3">
              <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Est. Cost
              </div>
              <div className="text-lg font-bold text-slate-100">
                ${data.estimatedCost?.toFixed(2) || '0.00'}
              </div>
            </div>
            <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-3">
              <div className="text-xs text-slate-500 flex items-center gap-1 mb-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Est. Time
              </div>
              <div className="text-lg font-bold text-slate-100">
                {data.estimatedTime || 0}s
              </div>
            </div>
          </div>
        </div>

        {/* Brand Check Status */}
        {data.brandCheck && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Brand Guardian
            </label>
            <div className={`p-3 rounded-lg border ${
              data.brandCheck.passed
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-amber-500/10 border-amber-500/30'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {data.brandCheck.passed ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-medium text-emerald-300">Brand Consistent</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-medium text-amber-300">Brand Rule Warning</span>
                  </>
                )}
              </div>
              {data.brandCheck.message && (
                <p className="text-xs text-slate-400 mt-1">{data.brandCheck.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Prompt Configuration */}
        {data.prompt !== undefined && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Prompt / Template
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onBlur={() => updateNode(selectedNode.id, { prompt })}
              rows={4}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="Enter node prompt template..."
            />
            <p className="text-[11px] text-slate-500 mt-1">Changes are saved automatically on blur.</p>
          </div>
        )}
      </div>
    </div>
  )
}
