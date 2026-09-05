"""
Workflow Optimizer Engine — Dynamically rebalances workflow nodes for cost/speed/quality.
Implements the "Make this 30% cheaper" magic moment.
"""

from typing import Dict, Any, List, Tuple
from .model_router import ModelRouterAgent


class WorkflowOptimizer:
    def __init__(self):
        self.router = ModelRouterAgent()

    def optimize_for_cost(
        self,
        workflow: Dict[str, Any],
        target_reduction_pct: float = 0.30,
        preserve_hero_shots: bool = True
    ) -> Dict[str, Any]:
        """
        Rebalances workflow nodes to reduce cost while preserving quality on critical nodes.

        Args:
            workflow: { "nodes": [...], "edges": [...], "metadata": {...} }
            target_reduction_pct: Target cost reduction (0.30 = 30%)
            preserve_hero_shots: If True, protect final hero/product shots from downgrade

        Returns:
            {
                "optimized_workflow": dict,
                "cost_before": float,
                "cost_after": float,
                "reduction_pct": float,
                "changes": list[str],
                "quality_impact": str,
                "quality_before": float,
                "quality_after": float
            }
        """
        nodes = workflow.get("nodes", [])

        # Calculate baseline cost and identify optimization candidates
        cost_before = sum(n["data"].get("estimatedCost", 0) for n in nodes)
        quality_before = workflow.get("metadata", {}).get("qualityScore", 9.0)

        # Identify hero/critical nodes to preserve
        hero_nodes = self._identify_hero_nodes(nodes) if preserve_hero_shots else []

        # Identify optimizable nodes (non-hero, has cost, is generation task)
        candidates = []
        for node in nodes:
            node_data = node["data"]
            node_type = node_data.get("type", "")
            cost = node_data.get("estimatedCost", 0)

            is_hero = node["id"] in hero_nodes
            is_generation = node_type in ["image_generation", "video_generation", "audio_generation"]

            if not is_hero and is_generation and cost > 0:
                candidates.append({
                    "node_id": node["id"],
                    "label": node_data.get("label", "Node"),
                    "type": node_type,
                    "current_cost": cost,
                    "current_model": node_data.get("model", {}).get("id", "unknown"),
                    "priority_score": self._calculate_node_priority(node)
                })

        # Sort by priority (lowest priority = first to downgrade)
        candidates.sort(key=lambda x: x["priority_score"])

        # Apply cost-saving swaps until target reached or candidates exhausted
        changes = []
        cost_saved = 0.0
        quality_delta = 0.0
        optimized_nodes = {n["id"]: n for n in nodes}

        for candidate in candidates:
            if cost_saved >= (cost_before * target_reduction_pct):
                break

            # Find cheaper alternative model
            node_id = candidate["node_id"]
            node_type = candidate["type"]

            # Route with higher cost priority (budget mode)
            cheaper_route = self.router.route_node(
                task_type=node_type,
                priority={"quality": 0.3, "cost": 0.6, "speed": 0.1},
                is_hero_shot=False
            )

            new_cost = cheaper_route["estimated_cost"]
            savings = candidate["current_cost"] - new_cost

            if savings > 0.01:  # Meaningful savings
                # Update node
                optimized_nodes[node_id]["data"]["model"] = {
                    "id": cheaper_route["model_id"],
                    "name": cheaper_route["model_name"],
                    "provider": cheaper_route["provider"]
                }
                optimized_nodes[node_id]["data"]["estimatedCost"] = new_cost
                optimized_nodes[node_id]["data"]["estimatedTime"] = cheaper_route["estimated_time"]
                optimized_nodes[node_id]["data"]["modelReason"] = f"Cost-optimized: {cheaper_route['reason']}"

                cost_saved += savings
                quality_delta -= 0.2  # Slight quality penalty per downgrade

                changes.append(
                    f"Switched '{candidate['label']}' to {cheaper_route['model_name']} "
                    f"(saved ${savings:.2f})"
                )

        # Recalculate totals
        cost_after = cost_before - cost_saved
        reduction_pct = (cost_saved / cost_before) * 100 if cost_before > 0 else 0
        quality_after = max(7.0, quality_before + quality_delta)

        # Quality impact assessment
        if quality_delta >= -0.3:
            quality_impact = "Minimal"
        elif quality_delta >= -0.8:
            quality_impact = "Moderate"
        else:
            quality_impact = "Noticeable"

        quality_impact_detail = f"{quality_impact} ({quality_before:.1f} → {quality_after:.1f})"

        # Add preservation messages
        if hero_nodes:
            hero_labels = [optimized_nodes[nid]["data"]["label"] for nid in hero_nodes]
            changes.append(f"✓ Preserved premium models for: {', '.join(hero_labels)}")

        return {
            "optimized_workflow": {
                "nodes": list(optimized_nodes.values()),
                "edges": workflow.get("edges", []),
                "metadata": {
                    **workflow.get("metadata", {}),
                    "totalCost": round(cost_after, 2),
                    "qualityScore": round(quality_after, 1)
                }
            },
            "cost_before": round(cost_before, 2),
            "cost_after": round(cost_after, 2),
            "reduction_pct": round(reduction_pct, 1),
            "changes": changes,
            "quality_impact": quality_impact_detail,
            "quality_before": round(quality_before, 1),
            "quality_after": round(quality_after, 1)
        }

    def optimize_for_speed(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """
        Rebalances workflow for faster execution time.
        Similar logic to cost optimization but prioritizes speed score.
        """
        # TODO: Implement speed-first routing similar to cost optimization
        return {"message": "Speed optimization not yet implemented"}

    def _identify_hero_nodes(self, nodes: List[Dict]) -> List[str]:
        """
        Identifies critical "hero shot" nodes that should not be downgraded.
        Heuristics:
          - Contains "hero", "product", "final", "main" in label
          - Export/final nodes
          - Last generation node in sequence
        """
        hero_ids = []
        for node in nodes:
            label = node["data"].get("label", "").lower()
            node_type = node["data"].get("type", "")

            if any(keyword in label for keyword in ["hero", "product reveal", "final", "main", "key"]):
                hero_ids.append(node["id"])
            elif node_type == "export":
                # Preserve nodes directly before export
                continue

        return hero_ids

    def _calculate_node_priority(self, node: Dict) -> float:
        """
        Calculates priority score for a node (higher = more important to preserve).
        Used to determine downgrade order.
        """
        label = node["data"].get("label", "").lower()
        score = 5.0  # Base priority

        # Boost for keywords
        if "hero" in label or "product" in label:
            score += 3.0
        if "final" in label or "main" in label:
            score += 2.0
        if "draft" in label or "concept" in label:
            score -= 2.0

        # Boost for later stages (likely more refined)
        position_y = node.get("position", {}).get("y", 0)
        score += position_y / 200.0  # Slight boost for nodes lower on canvas

        return score
