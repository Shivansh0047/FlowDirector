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

1. **AI Creative Director** — Translates natural language briefs into structured campaign concepts, storyboards, and scripts.
2. **Workflow Auto-Builder** — Automatically converts creative plans into interactive, editable, node-based execution graphs.
3. **AI Brand Consistency Guardian** — Enforces Brand DNA (palette, tone, restrictions) and offers 1-click auto-fixes.
4. **AI Model Router** — Mathematically scores and selects the optimal AI model for each node based on Quality, Cost, and Speed tradeoffs.
5. **Agentic Optimizer ("Make this 30% cheaper")** — Dynamically rebalances the workflow without sacrificing critical hero shots.

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

- Frontend: `http://localhost:5173`
- Node Server: `http://localhost:5000`
- Python Agent API: `http://localhost:8000`

---

## 🎬 Demo Projects Included

1. **Aura Skin — Morning Reset** (Skincare Instagram Ad with 6-scene storyboard, strict visual brand constraints)
2. **Nova Headphones — Sound Unleashed** (Tech Product Launch, high motion 3D aesthetic)

---

## 📄 License

MIT
