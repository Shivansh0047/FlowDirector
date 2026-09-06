import axios from 'axios'

const AGENTS_API_BASE = import.meta.env.VITE_AGENTS_API_URL || 'http://localhost:8000'
const SERVER_API_BASE = import.meta.env.VITE_SERVER_API_URL || 'http://localhost:5000'

// Python Agents Service (FastAPI)
export const agentsAPI = {
  // Health check
  health: async () => {
    const response = await axios.get(`${AGENTS_API_BASE}/health`)
    return response.data
  },

  // Generate creative plan from brief
  generateCreativePlan: async (brief, brandDNA) => {
    const response = await axios.post(`${AGENTS_API_BASE}/api/creative-plan`, {
      brief,
      brand_dna: brandDNA
    })
    return response.data.plan
  },

  // Build workflow graph from creative plan
  buildWorkflow: async (creativePlan, brandDNA, priority) => {
    const response = await axios.post(`${AGENTS_API_BASE}/api/build-workflow`, {
      creative_plan: creativePlan,
      brand_dna: brandDNA,
      priority: priority || { quality: 0.6, cost: 0.2, speed: 0.2 }
    })
    return response.data.workflow
  },

  // Check brand compliance for a prompt
  checkBrand: async (prompt, brandDNA) => {
    const response = await axios.post(`${AGENTS_API_BASE}/api/check-brand`, {
      prompt,
      brand_dna: brandDNA
    })
    return response.data.result
  },

  // Optimize workflow for cost (Magic Moment!)
  optimizeCost: async (workflow, targetReduction = 0.30, preserveHeroShots = true) => {
    const response = await axios.post(`${AGENTS_API_BASE}/api/optimize-cost`, {
      workflow,
      target_reduction_pct: targetReduction,
      preserve_hero_shots: preserveHeroShots
    })
    return response.data
  },

  // Full orchestration chain (brief → plan → workflow → brand + router → optimize)
  orchestrate: async (brief, brandDNA, priority) => {
    const response = await axios.post(`${AGENTS_API_BASE}/api/orchestrate`, {
      brief,
      brand_dna: brandDNA,
      priority: priority || { quality: 0.6, cost: 0.2, speed: 0.2 }
    })
    return response.data
  },

  // Handle natural language chat commands
  // Export workflow as JSON (Polish)
  exportWorkflow: async (workflow) => {
    const blob = new Blob([JSON.stringify(workflow, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'flowdirector_workflow.json'
    a.click()
    URL.revokeObjectURL(url)
  },

  chatCommand: async (command, currentWorkflow, brandDNA) => {
    const response = await axios.post(`${AGENTS_API_BASE}/api/chat-command`, {
      command,
      current_workflow: currentWorkflow,
      brand_dna: brandDNA
    })
    return response.data
  }
}

// Node.js Server API (Express)
export const serverAPI = {
  // Get demo project
  getDemoProject: async (projectId = 'demo') => {
    const response = await axios.get(`${SERVER_API_BASE}/api/projects/${projectId}`)
    return response.data
  },

  // Health check
  health: async () => {
    const response = await axios.get(`${SERVER_API_BASE}/api/health`)
    return response.data
  }
}
