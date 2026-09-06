import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors({ origin: ['http://localhost:5177', 'https://flowdirector-frontend.onrender.com', 'https://flowdirector-server.onrender.com', 'https://flowdirector-agents.onrender.com'] }))
app.use(express.json())

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'FlowDirector Server',
    timestamp: new Date().toISOString()
  })
})

// Sample pre-loaded demo project data endpoint
app.get('/api/projects/demo', (req, res) => {
  res.json({
    id: 'demo_aura_skin',
    name: 'Aura Skin — Morning Reset',
    status: 'draft',
    brief: {
      contentType: 'instagram_ad',
      product: 'Aura Glow Serum',
      audience: 'Gen Z / Young Professionals',
      visualStyle: 'Cinematic, authentic, soft warm morning lighting',
      duration: 30,
      priority: { quality: 0.6, cost: 0.2, speed: 0.2 }
    },
    brandDNA: {
      colors: ['#F5E6D3', '#8B7355', '#FFFFFF'],
      tone: ['premium', 'authentic', 'minimal'],
      restrictions: [
        'Avoid high-saturation neon colors',
        'Maintain natural skin texture',
        'No cartoon aesthetics'
      ]
    },
    metadata: {
      estimatedCost: 1.84,
      estimatedTime: '4m 20s',
      qualityScore: 9.1
    }
  })
})

app.listen(PORT, () => {
  console.log(`[FlowDirector Server] Running on http://localhost:${PORT}`)
})
