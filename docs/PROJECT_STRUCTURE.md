# FlowDirector — Project Structure

Generated: 2026-09-05

---

## Directory Tree

```
FlowDirector/
├── .gitignore
├── package.json                  # Root monorepo scripts
├── README.md
├── AGENT.md                      # Development context (excluded from git)
├── FlowDirector_Project_Requirements.md  # PRD (excluded from git)
│
├── client/                       # React Frontend
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── public/
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── pages/
│       │   ├── LandingPage.jsx       # Hero + 4 pillars + CTA
│       │   └── WorkflowCanvas.jsx    # Main workspace (chat + canvas + inspector)
│       ├── components/               # (to be built)
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       └── assets/
│
├── server/                       # Node.js + Express Backend
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js              # Main server entry
│       ├── routes/               # (to be built)
│       ├── services/
│       ├── models/
│       └── middleware/
│
├── agents/                       # Python + FastAPI + LangGraph
│   ├── requirements.txt
│   ├── .env.example
│   └── src/
│       ├── main.py               # FastAPI entry
│       └── agents/
│           ├── __init__.py
│           ├── creative_director.py   # Brief → Creative Plan
│           ├── workflow_builder.py    # Plan → Workflow Graph
│           ├── brand_guardian.py      # Rule validation
│           ├── model_router.py        # Model scoring & selection
│           └── optimizer.py           # "Make it 30% cheaper" logic
│
└── docs/
```

---

## Current Status

✅ **Scaffolding Complete**
- All directories created
- Core config files in place (Vite, Tailwind, package.json, .env.example)
- Landing page UI built
- Workflow canvas layout scaffolded
- Python agent stubs created
- Server health check endpoint working

⏳ **Next Steps**
1. Install dependencies: `npm run install:all`
2. Test the dev servers
3. Implement React Flow interactive canvas
4. Build the multi-step form chatbot
5. Connect Python agents to backend
6. Implement model router logic
7. Build the optimization algorithm

---

## How to Run

```bash
# Install all dependencies
npm run install:all

# Run all services concurrently
npm run dev
```

Services:
- Frontend: http://localhost:5173
- Node Server: http://localhost:5000
- Python Agents: http://localhost:8000
