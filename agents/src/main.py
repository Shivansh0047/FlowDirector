from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import os
from pathlib import Path
import uvicorn
from dotenv import load_dotenv

from .agents.creative_director import CreativeDirectorAgent
from .agents.workflow_builder import WorkflowBuilderAgent
from .agents.brand_guardian import BrandGuardianAgent
from .agents.model_router import ModelRouterAgent
from .agents.optimizer import WorkflowOptimizer

# Load .env from the agents/ directory regardless of cwd (uvicorn reload runs from project root)
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

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



class OrchestrateRequest(BaseModel):
    brief: Dict[str, Any]
    brand_dna: Dict[str, Any] = Field(default_factory=dict)
    priority: Optional[Dict[str, float]] = Field(default_factory=lambda: {"quality": 0.6, "cost": 0.2, "speed": 0.2})


@app.post("/api/orchestrate")
def orchestrate_full_chain(req: OrchestrateRequest):
    trace = {}
    trace["step_1_creative_plan"] = creative_director.generate_creative_plan(req.brief, req.brand_dna or {})
    trace["step_2_workflow"] = workflow_builder.build_workflow(
        trace["step_1_creative_plan"],
        req.brand_dna or {},
        req.priority or {"quality": 0.6, "cost": 0.2, "speed": 0.2}
    )
    brand_issues = []
    for node in trace["step_2_workflow"].get("nodes", []):
        prompt_text = node.get("data", {}).get("prompt", "")
        if prompt_text:
            check = brand_guardian.check_prompt(prompt_text, req.brand_dna or {})
            if not check["passed"]:
                brand_issues.append({"node": node.get("id"), "violations": check.get("violations", [])})
    trace["step_2_brand_check"] = {"passed": len(brand_issues) == 0, "issues": brand_issues}
    routed_models = {}
    for node in trace["step_2_workflow"].get("nodes", []):
        task_type = node.get("data", {}).get("taskType", "image_generation")
        score_result = model_router.route_node(task_type, req.priority or {"quality": 0.6, "cost": 0.2, "speed": 0.2})
        routed_models[node.get("id")] = score_result.get("best_model", score_result.get("scored", {}))
    trace["step_2_model_routing"] = routed_models
    trace["step_3_optimized"] = optimizer.optimize_for_cost(
        trace["step_2_workflow"], target_reduction_pct=0.30, preserve_hero_shots=True
    )
    return {"status": "success", "chain": "brief -> creative_director -> workflow_builder -> brand_guardian + model_router -> optimizer", "trace": trace}

@app.post("/api/chat-command")
def handle_chat_command(req: ChatCommandRequest):
    """
    Processes natural-language commands from the user (e.g. "Make it 30% cheaper", "Check brand").
    Fast path uses keyword matching for the obvious cases; otherwise routes through Groq
    so the user can say anything and the system figures out which action (if any) to take.
    """
    cmd = req.command.lower().strip()
    workflow = req.current_workflow
    brand_dna = req.brand_dna or {}

    # --- Fast path: obvious keywords, no LLM call needed ---
    fast_action: Optional[Dict[str, Any]] = None
    if any(p in cmd for p in ["cheaper", "reduce cost", "save money", "lower budget"]):
        fast_action = {"action": "optimize_cost", "params": {"target_reduction_pct": 0.30}}
    elif any(p in cmd for p in ["faster", "speed up", "quicker", "optimize for speed"]):
        fast_action = {"action": "speed_optimize", "params": {"target_reduction_pct": 0.20}}
    elif any(p in cmd for p in ["brand check", "verify brand", "check brand", "brand rules"]):
        fast_action = {"action": "check_brand", "params": {}}

    # --- Slow path: ask Groq to classify the intent ---
    if not fast_action:
        decision = creative_director.route_chat_command(req.command, workflow, brand_dna)
        action = decision["action"]
        params = decision.get("params", {}) or {}
        message = decision.get("message", "")
    else:
        action = fast_action["action"]
        params = fast_action["params"]
        message = ""

    # --- Execute the decided action ---
    if action == "optimize_cost":
        target = float(params.get("target_reduction_pct", 0.30))
        opt_result = optimizer.optimize_for_cost(workflow, target_reduction_pct=target)
        return {
            "status": "success",
            "type": "optimization",
            "action": action,
            "message": message or (
                f"âš¡ **Workflow optimized for lower cost!**\n\n"
                f"â€¢ **Cost:** ${opt_result['cost_before']:.2f} â†’ ${opt_result['cost_after']:.2f} "
                f"({opt_result['reduction_pct']:.1f}% reduction)\n"
                f"â€¢ **Quality impact:** {opt_result['quality_impact']}\n\n"
                f"**Changes applied:**\n" +
                "\n".join(f"- {c}" for c in opt_result['changes'])
            ),
            "updated_workflow": opt_result["optimized_workflow"],
        }

    if action == "speed_optimize":
        # Speed optimization reuses the cost optimizer with a smaller target.
        # (For a real prototype this would be a separate model-time-aware path.)
        target = float(params.get("target_reduction_pct", 0.20))
        opt_result = optimizer.optimize_for_cost(workflow, target_reduction_pct=target)
        return {
            "status": "success",
            "type": "optimization",
            "action": action,
            "message": message or (
                f"âš¡ **Workflow rebalanced for speed!**\n\n"
                f"â€¢ **Cost:** ${opt_result['cost_before']:.2f} â†’ ${opt_result['cost_after']:.2f}\n"
                f"â€¢ **Quality impact:** {opt_result['quality_impact']}\n\n"
                f"**Changes applied:**\n" +
                "\n".join(f"- {c}" for c in opt_result['changes'])
            ),
            "updated_workflow": opt_result["optimized_workflow"],
        }

    if action == "check_brand":
        issues = []
        for node in workflow.get("nodes", []):
            prompt = node.get("data", {}).get("prompt", "")
            if prompt:
                check = brand_guardian.check_prompt(prompt, brand_dna)
                if not check["passed"]:
                    issues.append(f"â€¢ **{node['data']['label']}**: {check['violations'][0]['rule']}")

        if issues:
            default_msg = "âš  **Brand Guardian detected potential conflicts:**\n\n" + "\n".join(issues)
        else:
            default_msg = "âœ“ **All nodes passed Brand DNA consistency checks!**"

        return {
            "status": "success",
            "type": "brand_check",
            "action": action,
            "message": message or default_msg,
            "updated_workflow": workflow,
        }

    # action == "chat" â€” pure conversational reply, no workflow change
    return {
        "status": "success",
        "type": "chat",
        "action": "chat",
        "message": message,
        "updated_workflow": workflow,
    }


if __name__ == "__main__":
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=True)
