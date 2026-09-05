import { useEffect, useCallback, useMemo, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { Sparkles, ArrowLeft, Play, DollarSign, Clock, ShieldCheck, Zap, Plus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import WorkflowNode from '../components/WorkflowNode'
import NodeInspector from '../components/NodeInspector'
import BriefChatbot from '../components/BriefChatbot'
import useWorkflowStore from '../context/workflowStore'
import { auraSkinDemoWorkflow } from '../utils/demoData'

export default function WorkflowCanvas() {
  const navigate = useNavigate()
  const [showBriefModal, setShowBriefModal] = useState(false)
  const {
    nodes: storeNodes,
    edges: storeEdges,
    metadata,
    project,
    selectedNode,
    setSelectedNode,
    loadDemoWorkflow,
  } = useWorkflowStore()

  // Node types registration for React Flow
  const nodeTypes = useMemo(() => ({ custom: WorkflowNode }), [])

  // React Flow state hooks
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Load demo workflow on mount
  useEffect(() => {
    loadDemoWorkflow(auraSkinDemoWorkflow)
  }, [loadDemoWorkflow])

  // Sync store nodes/edges with local React Flow state
  useEffect(() => {
    if (storeNodes.length > 0) setNodes(storeNodes)
    if (storeEdges.length > 0) setEdges(storeEdges)
  }, [storeNodes, storeEdges, setNodes, setEdges])

  // Connection handler
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge({ ...params, animated: true }, eds)),
    [setEdges]
  )

  // Node click handler
  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNode(node.id)
    },
    [setSelectedNode]
  )

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">
      {/* Brief Chatbot Modal */}
      {showBriefModal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowBriefModal(false)}
              className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <BriefChatbot onComplete={() => setShowBriefModal(false)} />
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            title="Back to Landing"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 tracking-tight">FlowDirector</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/40">
              DEMO PROTOTYPE
            </span>
          </div>
          <span className="text-slate-700">|</span>
          <span className="text-sm font-medium text-slate-300">
            {project?.name || 'Aura Skin — Morning Reset'}
          </span>
          <button
            onClick={() => setShowBriefModal(true)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 border border-slate-700 transition-colors ml-2"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            New Brief
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Metrics summary */}
          <div className="flex items-center gap-4 text-xs text-slate-400 bg-slate-800/60 px-4 py-2 rounded-lg border border-slate-700/60">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Est. Cost: <strong className="text-slate-200">${metadata?.totalCost?.toFixed(2) || '1.84'}</strong>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-400" />
              Est. Time: <strong className="text-slate-200">{metadata?.totalTime || '260'}s</strong>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Quality: <strong className="text-slate-200">{metadata?.qualityScore || '9.1'}/10</strong>
            </span>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-lg text-sm transition-all shadow-md active:scale-95">
            <Play className="w-4 h-4 fill-white" />
            Run Workflow
          </button>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Chat / Command Assistant */}
        <div className="w-80 border-r border-slate-800 bg-slate-900/40 flex flex-col z-10">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Agent Assistant
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              LangGraph
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            <div className="bg-slate-800/60 p-3 rounded-lg border border-slate-700/60 text-slate-300 leading-relaxed">
              👋 I generated the 6-scene production workflow for <strong>Aura Skin</strong>. All tasks are routed to optimal models based on your brand guidelines.
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-slate-300">
              <p className="font-semibold text-cyan-400 text-xs mb-1">⚡ Try the Magic Moment:</p>
              <button className="w-full mt-2 text-left px-2.5 py-1.5 rounded bg-blue-500/20 hover:bg-blue-500/30 text-cyan-300 font-mono text-[11px] border border-blue-500/40 transition-colors flex items-center justify-between">
                <span>"Make this 30% cheaper"</span>
                <Zap className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-slate-800">
            <input
              type="text"
              placeholder="Ask agent to modify workflow..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Center: React Flow Canvas */}
        <div className="flex-1 h-full bg-slate-950 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
          >
            <Background color="#1e293b" gap={16} size={1} />
            <Controls className="!bg-slate-900 !border-slate-800 !text-slate-200 fill-slate-200" />
            <MiniMap
              nodeColor={() => '#0284c7'}
              maskColor="rgba(15, 23, 42, 0.7)"
              className="!bg-slate-900 !border-slate-800 !rounded-lg"
            />
          </ReactFlow>
        </div>

        {/* Right Column: Node Inspector */}
        <div className="w-80 border-l border-slate-800 bg-slate-900/40 flex flex-col z-10">
          <NodeInspector />
        </div>
      </div>
    </div>
  )
}
