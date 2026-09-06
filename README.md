# FlowDirector

> **AI Creative Production Director** — from creative brief to model-optimized AI workflow.

![Demo Badge](https://img.shields.io/badge/Prototype-Demo%20Mode-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 What is FlowDirector?

FlowDirector is an AI orchestration layer that sits one level above individual AI creative generation tools. It translates a creative brief into a structured, brand-consistent, cost-optimized, node-based production workflow.

Built as an interactive product prototype for creative professionals (editors, designers, filmmakers, agencies, and content teams).

> **Note:** This is a working prototype demonstrating orchestration intelligence, agent-driven workflow construction, brand consistency protection, and model routing. In a production environment, it is designed to integrate with platforms like **HexCoded**.

---

## 🌟 Core Pillars

1. **AI Creative Director** — Translates natural language briefs into structured campaign concepts, storyboards, and scripts (Groq Llama 3 + smart fallback templates).
2. **Workflow Auto-Builder** — Automatically converts creative plans into interactive, editable, node-based execution graphs.
3. **AI Brand Consistency Guardian** — Enforces Brand DNA (palette, tone, restrictions) with rule-based validation and 1-click auto-fixes.
4. **AI Model Router** — Mathematically scores and selects the optimal AI model for each node based on Quality, Cost, and Speed tradeoffs.
5. **Workflow Optimizer** — Dynamically rebalances workflows (e.g., "Make this 30% cheaper") by swapping models while preserving critical nodes.

---

## ⚙️ What's Live vs. Demo

### Fully Functional (Real AI/Logic):
- ✅ **Model Router** — 43 registered models with weighted scoring (updated: Nano Banana, GPT Image, FLUX 2, Seedream, Kling, Veo 3.1, Seedance, Talking Actors, etc.)
- ✅ **Brand Guardian** — Pattern-based rule validation with auto-fix suggestions
- ✅ **Workflow Optimizer** — Cost/speed optimization algorithms (real node swapping & recalculation)
- ✅ **Workflow Builder** — Dynamic graph construction with routing & brand checks per node
- ✅ **Creative Director** — Smart context-aware templates (switches to Groq Llama 3 if API key provided)

### Demo/Placeholder:
- 📦 Node output images — mock Unsplash photos only; no real image/video/audio generation yet
- 📦 2 preset projects (Aura Skin & Nova Headphones)

**Everything else is live** — custom briefs trigger real agent orchestration with dynamic workflows.

---


---

## 🌐 Deployed URLs (Render)

- **Frontend:** https://flowdirector-frontend.onrender.com
- **Agent (Python, 8000):** https://flowdirector.onrender.com
- **Server (Node, 5000):** https://flowdirector-server.onrender.com

---

## 🔍 What Uses Real AI vs Mock (Current State)

**Real AI / Code:**
- Creative Director (`gpt-oss-120b` via Groq when key set; smart fallback templates otherwise)
- Model Router (43-model scoring algorithm — pure Python, no live model call)
- Brand Guardian (rule-based validation)
- Workflow Builder / Optimizer (graph construction + cost math)
- Chat interface (natural-language command routing)

**Mock / Placeholder:**
- Node output images/videos/audio (mock Unsplash URLs only)
- No live image/video/audio generation APIs connected yet

> This is a working demo prototype for the HexCoded product-role application.

---
## 🏗️ Architecture & Tech Stack

```
FlowDirector/
├── client/              # React + Vite + Tailwind CSS + React Flow + Zustand
├── server/              # Node.js + Express API bridge
└── agents/              # Python + FastAPI + LangGraph + Groq (Llama 3)
```

- **Frontend:** React (SPA), Tailwind CSS, React Flow (interactive node canvas), Zustand (state management)
- **Backend:** Node.js / Express
- **AI Agent Service:** Python, FastAPI, LangGraph, Groq API (free-tier Llama 3)
- **Cost:** 100% Free / Zero-cost setup

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- Python >= 3.10
- (Optional) Groq API Key (free from [console.groq.com](https://console.groq.com)) — *built-in smart fallback works without a key as well!*

### 1. Clone & Install Dependencies

```bash
# Install root, client, and server dependencies
npm run install:all
```

### 2. Configure Environment Variables

```bash
# In /agents
cp agents/.env.example agents/.env
# Add your GROQ_API_KEY if available (optional)
```

### 3. Run Development Servers

```bash
npm run dev
```

- Frontend: `http://localhost:5177`
- Node Server: `http://localhost:5000`
- Python Agent API: `http://localhost:8000`

### Quick Test
```bash
# Health check
curl http://localhost:8000/health

# Full orchestration (brief → plan → workflow → brand + router → optimize)
curl -X POST http://localhost:8000/api/orchestrate \
  -H 'Content-Type: application/json' \
  -d '{"brief":{"contentType":"instagram_ad","product":"Demo","audience":"Gen Z"},"brand_dna":{"brandName":"Demo"}}'
```

---

## 🎬 Demo Projects Included

1. **Aura Skin — Morning Reset** (Skincare Instagram Ad with 6-scene storyboard, strict visual brand constraints)
2. **Nova Headphones — Sound Unleashed** (Tech Product Launch, high motion 3D aesthetic)

---

## 📄 License

MIT
