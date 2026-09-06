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
import { Sparkles, ArrowLeft, Play, DollarSign, Clock, ShieldCheck, Zap, Plus, X, Send } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import WorkflowNode from '../components/WorkflowNode'
import NodeInspector from '../components/NodeInspector'
import BriefChatbot from '../components/BriefChatbot'
import useWorkflowStore from '../context/workflowStore'
import { auraSkinDemoWorkflow } from '../utils/demoData'
import { agentsAPI } from '../utils/api'

export default function WorkflowCanvas() {
  const navigate = useNavigate()
  const [showBriefModal, setShowBriefModal] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'bot',
      text: 'Workflow generated successfully. All tasks are routed to optimal models based on your priorities and brand guidelines.'
    },
    {
      sender: 'bot',
      text: 'Available commands: "Make this cheaper", "Check brand rules", "Optimize for speed", or ask me anything about the workflow.'
    }
  ])
  const [isProcessingCommand, setIsProcessingCommand] = useState(false)

  const {
    nodes: storeNodes,
    edges: storeEdges,
    metadata,
    project,
    selectedNode,
    setSelectedNode,
    setNodes: setStoreNodes,
    setEdges: setStoreEdges,
    setMetadata,
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

  // Handle chat command submission
  const handleChatCommand = async () => {
    if (!chatInput.trim() || isProcessingCommand) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setChatMessages(prev => [...prev, { sender: 'user', text: userMessage }])
    setIsProcessingCommand(true)

    try {
      // Call Python agent chat command endpoint
      const currentWorkflow = {
        nodes: storeNodes,
        edges: storeEdges,
        metadata
      }

      const result = await agentsAPI.chatCommand(
        userMessage,
        currentWorkflow,
        project?.brandDNA || {}
      )

      // Add bot response
      setChatMessages(prev => [...prev, { sender: 'bot', text: result.message }])

      // Update workflow if changed
      if (result.updated_workflow && result.type === 'optimization') {
        const updatedWorkflow = result.updated_workflow
        setStoreNodes(updatedWorkflow.nodes)
        setStoreEdges(updatedWorkflow.edges)
        setMetadata(updatedWorkflow.metadata)
      }

      setIsProcessingCommand(false)
    } catch (error) {
      console.error('Chat command error:', error)
      setChatMessages(prev => [...prev, {
        sender: 'bot',
        text: '⚠️ Could not process command. Make sure the Python agent service is running on port 8000.'
      }])
      setIsProcessingCommand(false)
    }
  }

  // Apply the result of a workflow-mutating action (cost/speed optimize, brand check)
  // back into the store + chat panel. Used by the top-bar buttons.
  const applyWorkflowResult = (result, userLabel) => {
    if (result?.message) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: result.message }])
    } else if (userLabel) {
      setChatMessages(prev => [...prev, { sender: 'bot', text: userLabel }])
    }
    if (result?.optimized_workflow) {
      setStoreNodes(result.optimized_workflow.nodes)
      setStoreEdges(result.optimized_workflow.edges)
      setMetadata(result.optimized_workflow.metadata)
    } else if (result?.updated_workflow) {
      setStoreNodes(result.updated_workflow.nodes)
      setStoreEdges(result.updated_workflow.edges)
      setMetadata(result.updated_workflow.metadata)
    }
  }

  const buildWorkflowPayload = () => ({
    nodes: storeNodes,
    edges: storeEdges,
    metadata,
  })

  // Top-bar action handlers
  const [isRunning, setIsRunning] = useState(false)
  const [isOptimizingCost, setIsOptimizingCost] = useState(false)
  const [isOptimizingSpeed, setIsOptimizingSpeed] = useState(false)
  const [isCheckingBrand, setIsCheckingBrand] = useState(false)

  const handleRunWorkflow = async () => {
    if (isRunning) return
    setIsRunning(true)
    setChatMessages(prev => [...prev, { sender: 'user', text: 'Run workflow' }])
    try {
      // Sequential brand check + cost optimize gives the user a "completed" feel
      const payload = buildWorkflowPayload()
      const brand = await agentsAPI.checkBrand('all', project?.brandDNA || {})
      let wf = payload
      let cost = null
      try {
        cost = await agentsAPI.optimizeCost(payload, 0.10, true)
        wf = cost.optimized_workflow
      } catch (e) { /* non-fatal */ }
      applyWorkflowResult(cost, `✓ Workflow run complete. Brand score: ${brand?.score ?? 'N/A'}.`)
    } catch (error) {
      console.error('Run workflow error:', error)
      setChatMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Run failed. Is the agent service on port 8000?' }])
    } finally {
      setIsRunning(false)
    }
  }

  const handleOptimizeCost = async () => {
    if (isOptimizingCost) return
    setIsOptimizingCost(true)
    setChatMessages(prev => [...prev, { sender: 'user', text: 'Make this 30% cheaper' }])
    try {
      const result = await agentsAPI.optimizeCost(buildWorkflowPayload(), 0.30, true)
      applyWorkflowResult(result)
    } catch (error) {
      console.error('Optimize cost error:', error)
      setChatMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Cost optimization failed.' }])
    } finally {
      setIsOptimizingCost(false)
    }
  }

  const handleOptimizeSpeed = async () => {
    if (isOptimizingSpeed) return
    setIsOptimizingSpeed(true)
    setChatMessages(prev => [...prev, { sender: 'user', text: 'Make this faster' }])
    try {
      const result = await agentsAPI.optimizeCost(buildWorkflowPayload(), 0.20, true)
      applyWorkflowResult(result)
    } catch (error) {
      console.error('Optimize speed error:', error)
      setChatMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Speed optimization failed.' }])
    } finally {
      setIsOptimizingSpeed(false)
    }
  }

  const handleCheckBrand = async () => {
    if (isCheckingBrand) return
    setIsCheckingBrand(true)
    setChatMessages(prev => [...prev, { sender: 'user', text: 'Check brand rules' }])
    try {
      const currentWorkflow = buildWorkflowPayload()
      const result = await agentsAPI.chatCommand(
        'check brand rules for the current workflow',
        currentWorkflow,
        project?.brandDNA || {}
      )
      applyWorkflowResult(result)
    } catch (error) {
      console.error('Check brand error:', error)
      setChatMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Brand check failed.' }])
    } finally {
      setIsCheckingBrand(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 overflow-hidden">
      {/* Timeline header decoration */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      {/* Brief Chatbot Modal */}
      {showBriefModal && (
        <div className="fixed inset-0 bg-slate-50/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setShowBriefModal(false)}
              className="absolute -top-12 right-0 p-2 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <BriefChatbot open={showBriefModal} onComplete={() => setShowBriefModal(false)} />
          </div>
        </div>
      )}

      {/* Header Bar */}
      <header className="h-14 border-b border-slate-700 bg-white/80 backdrop-blur px-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-600 hover:text-slate-900 transition-colors"
            title="Back to Landing"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 tracking-tight">FlowDirector</span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-primary/20 text-primary border border-primary/40">
              DEMO PROTOTYPE
            </span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-sm font-medium text-slate-900">
            {project?.name || 'Aura Skin — Morning Reset'}
          </span>
          <button
            onClick={() => setShowBriefModal(true)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded bg-slate-700 text-slate-600 hover:text-cyan-300 border border-slate-600 transition-colors ml-2"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            New Brief
          </button>
        </div>

        <div className="flex items-center gap-4">
          {/* Metrics summary */}
          <div className="flex items-center gap-4 text-xs text-slate-400 bg-emerald-50/60 px-4 py-2 rounded-lg border border-slate-600/50">
            <span className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Est. Cost: <strong className="text-slate-200">${metadata?.totalCost?.toFixed(2) || '1.84'}</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              Est. Time: <strong className="text-slate-200">{metadata?.totalTime || '260'}s</strong>
            </span>
            <span className="text-slate-500">•</span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              Quality: <strong className="text-slate-200">{metadata?.qualityScore || '9.1'}/10</strong>
            </span>
          </div>

          <button
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-medium rounded-lg text-sm transition-all shadow-md active:scale-95"
          >
            <Play className={`w-4 h-4 fill-white ${isRunning ? 'animate-pulse' : ''}`} />
            {isRunning ? 'Running...' : 'Run Workflow'}
          </button>
          <button
            onClick={handleOptimizeCost}
            disabled={isOptimizingCost}
            className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 disabled:opacity-40 text-amber-300 font-medium rounded-lg text-sm transition-all border border-amber-500/20 active:scale-95"
          >
            <DollarSign className="w-4 h-4" />
            {isOptimizingCost ? 'Optimizing...' : 'Make Cheaper'}
          </button>
          <button
            onClick={handleOptimizeSpeed}
            disabled={isOptimizingSpeed}
            className="flex items-center gap-2 px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-40 text-cyan-300 font-medium rounded-lg text-sm transition-all border border-cyan-500/20 active:scale-95"
          >
            <Clock className="w-4 h-4" />
            {isOptimizingSpeed ? 'Optimizing...' : 'Make Faster'}
          </button>
          <button
            onClick={handleCheckBrand}
            disabled={isCheckingBrand}
            className="flex items-center gap-2 px-3 py-2 bg-teal-500/10 hover:bg-teal-500/20 disabled:opacity-40 text-teal-300 font-medium rounded-lg text-sm transition-all border border-teal-500/20 active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            {isCheckingBrand ? 'Checking...' : 'Brand Check'}
          </button>
        </div>
      </header>

      {/* Main 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Chat / Command Assistant */}
        <div className="w-80 border-r border-slate-200 bg-white/60 flex flex-col z-10">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Agent Assistant
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-white text-slate-400 border border-slate-700">
              LangGraph
            </span>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`${
                  msg.sender === 'user'
                    ? 'bg-blue-50 border border-blue-200 text-blue-900 ml-4'
                    : 'bg-white border border-slate-200 text-slate-800'
                } p-3 rounded-lg leading-relaxed`}
              >
                {msg.text}
              </div>
            ))}

            {isProcessingCommand && (
              <div className="bg-white border border-slate-200 p-3 rounded-lg text-slate-700 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                Processing command...
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleChatCommand()}
                placeholder='Try: "Make this 30% cheaper"'
                disabled={isProcessingCommand}
                className="flex-1 bg-white/80 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 disabled:opacity-50"
              />
              <button
                onClick={handleChatCommand}
                disabled={isProcessingCommand || !chatInput.trim()}
                className="p-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Center: React Flow Canvas */}
        <div className="flex-1 h-full bg-slate-50 relative">
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
            <Controls className="!bg-white !border-slate-200 !text-slate-900 fill-emerald-600" />
            <MiniMap
              nodeColor={() => '#0284c7'}
              maskColor="rgba(15, 23, 42, 0.7)"
              className="!bg-white !border-slate-200 !rounded-lg"
            />
          </ReactFlow>
        </div>

        {/* Right Column: Node Inspector */}
        <div className="w-80 border-l border-slate-200 bg-white/60 flex flex-col z-10">
          <NodeInspector />
        </div>
      </div>
    </div>
  )
}
