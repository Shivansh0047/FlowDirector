from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import os
import uvicorn
from dotenv import load_dotenv

from .agents.creative_director import CreativeDirectorAgent
from .agents.workflow_builder import WorkflowBuilderAgent
from .agents.brand_guardian import BrandGuardianAgent
from .agents.model_router import ModelRouterAgent
from .agents.optimizer import WorkflowOptimizer

load_dotenv()

app = FastAPI(
    title="FlowDirector AI Agent Service",
    description="Orchestration & Agent Service for FlowDirector",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Agent Singletons
creative_director = CreativeDirectorAgent()
workflow_builder = WorkflowBuilderAgent()
brand_guardian = BrandGuardianAgent()
model_router = ModelRouterAgent()
optimizer = WorkflowOptimizer()


# Request / Response Schemas
class CreativePlanRequest(BaseModel):
    brief: Dict[str, Any]
    brand_dna: Dict[str, Any]


class BuildWorkflowRequest(BaseModel):
    creative_plan: Dict[str, Any]
    brand_dna: Dict[str, Any]
    priority: Optional[Dict[str, float]] = Field(
        default_factory=lambda: {"quality": 0.6, "cost": 0.2, "speed": 0.2}
    )


class BrandCheckRequest(BaseModel):
    prompt: str
    brand_dna: Dict[str, Any]


class OptimizeCostRequest(BaseModel):
    workflow: Dict[str, Any]
    target_reduction_pct: Optional[float] = 0.30
    preserve_hero_shots: Optional[bool] = True


class ChatCommandRequest(BaseModel):
    command: str
    current_workflow: Dict[str, Any]
    brand_dna: Optional[Dict[str, Any]] = None


# --- Endpoints ---

@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "FlowDirector Agent Service",
        "groq_configured": bool(os.getenv("GROQ_API_KEY")),
        "version": "0.1.0"
    }


@app.post("/api/creative-plan")
def generate_creative_plan(req: CreativePlanRequest):
    """
    Step 1: Generates structured creative concept, script, and storyboard from brief.
    """
    try:
        plan = creative_director.generate_creative_plan(req.brief, req.brand_dna)
        return {"status": "success", "plan": plan}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/build-workflow")
def build_workflow(req: BuildWorkflowRequest):
    """
    Step 2: Builds editable React Flow graph from creative plan and model routing.
    """
    try:
        workflow = workflow_builder.build_workflow(
            req.creative_plan,
            req.brand_dna,
            req.priority or {"quality": 0.6, "cost": 0.2, "speed": 0.2}
        )
        return {"status": "success", "workflow": workflow}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/check-brand")
def check_brand(req: BrandCheckRequest):
    """
    Step 3: Validates a prompt against Brand DNA rules with 1-click auto-fix.
    """
    try:
        result = brand_guardian.check_prompt(req.prompt, req.brand_dna)
        return {"status": "success", "result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/optimize-cost")
def optimize_cost(req: OptimizeCostRequest):
    """
    Magic Moment: Rebalances workflow nodes to reduce cost (e.g. 30%) while preserving hero shots.
    """
    try:
        result = optimizer.optimize_for_cost(
            workflow=req.workflow,
            target_reduction_pct=req.target_reduction_pct or 0.30,
            preserve_hero_shots=req.preserve_hero_shots if req.preserve_hero_shots is not None else True
        )
        return {"status": "success", **result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat-command")
def handle_chat_command(req: ChatCommandRequest):
    """
    Processes natural-language commands from the user (e.g. "Make it 30% cheaper", "Check brand").
    """
    cmd = req.command.lower().strip()
    workflow = req.current_workflow

    # 1. Cost optimization command
    if any(phrase in cmd for phrase in ["cheaper", "reduce cost", "save money", "budget"]):
        opt_result = optimizer.optimize_for_cost(workflow, target_reduction_pct=0.30)
        return {
            "status": "success",
            "type": "optimization",
            "message": (
                f"⚡ **Workflow optimized for lower cost!**\n\n"
                f"• **Cost:** ${opt_result['cost_before']:.2f} → ${opt_result['cost_after']:.2f} "
                f"({opt_result['reduction_pct']:.1f}% reduction)\n"
                f"• **Quality impact:** {opt_result['quality_impact']}\n\n"
                f"**Changes applied:**\n" +
                "\n".join(f"- {c}" for c in opt_result['changes'])
            ),
            "updated_workflow": opt_result["optimized_workflow"]
        }

    # 2. Brand check command
    elif any(phrase in cmd for phrase in ["brand check", "verify brand", "check brand", "brand rules"]):
        brand_dna = req.brand_dna or {}
        issues = []
        for node in workflow.get("nodes", []):
            prompt = node.get("data", {}).get("prompt", "")
            if prompt:
                check = brand_guardian.check_prompt(prompt, brand_dna)
                if not check["passed"]:
                    issues.append(f"• **{node['data']['label']}**: {check['violations'][0]['rule']}")

        if issues:
            msg = "⚠ **Brand Guardian detected potential conflicts:**\n\n" + "\n".join(issues)
        else:
            msg = "✓ **All nodes passed Brand DNA consistency checks!**"

        return {
            "status": "success",
            "type": "brand_check",
            "message": msg,
            "updated_workflow": workflow
        }

    # 3. Generic assistant response
    else:
        return {
            "status": "success",
            "type": "chat",
            "message": f"Understood! I've noted your instruction: \"{req.command}\". Try asking me to **'Make this 30% cheaper'** or **'Check brand rules'**.",
            "updated_workflow": workflow
        }


if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
