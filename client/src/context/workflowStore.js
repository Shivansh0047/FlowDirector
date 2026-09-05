import { create } from 'zustand'

const useWorkflowStore = create((set) => ({
  // Current project
  project: null,

  // Workflow nodes and edges (React Flow format)
  nodes: [],
  edges: [],

  // Selected node for inspector
  selectedNode: null,

  // Workflow metadata
  metadata: {
    totalCost: 0,
    totalTime: 0,
    qualityScore: 0,
  },

  // Actions
  setProject: (project) => set({ project }),

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  setSelectedNode: (nodeId) => set((state) => ({
    selectedNode: state.nodes.find(n => n.id === nodeId) || null
  })),

  updateNode: (nodeId, updates) => set((state) => ({
    nodes: state.nodes.map(node =>
      node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node
    )
  })),

  setMetadata: (metadata) => set({ metadata }),

  // Load a demo workflow
  loadDemoWorkflow: (workflowData) => set({
    nodes: workflowData.nodes,
    edges: workflowData.edges,
    metadata: workflowData.metadata,
  }),
}))

export default useWorkflowStore
