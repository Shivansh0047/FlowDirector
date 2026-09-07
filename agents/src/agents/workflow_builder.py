"""
Workflow Builder Agent — Converts creative plans into executable node-based graphs.
Integrates with ModelRouter and BrandGuardian for optimal node configuration.
"""

from typing import Dict, Any, List
from .model_router import ModelRouterAgent
from .brand_guardian import BrandGuardianAgent


class WorkflowBuilderAgent:
    def __init__(self):
        self.router = ModelRouterAgent()
        self.guardian = BrandGuardianAgent()

    def build_workflow(self, creative_plan: Dict[str, Any], brand_dna: Dict[str, Any], priority: Dict[str, float]) -> Dict[str, Any]:
        """
        Converts a creative plan and brand constraints into a connected node graph.

        Args:
            creative_plan: Output from CreativeDirectorAgent
            brand_dna: Brand DNA rules and guidelines
            priority: Quality/Cost/Speed weights

        Returns:
            { "nodes": [...], "edges": [...], "metadata": {...} }
        """
        nodes = []
        edges = []

        scenes = creative_plan.get("scenes", [])
        visual_style = creative_plan.get("visualDirection", "cinematic")
        script = creative_plan.get("script", "")

        # 1. Brief Node (Root)
        brief_node = {
            "id": "node_brief",
            "type": "custom",
            "position": {"x": 280, "y": 0},
            "data": {
                "label": "Creative Brief",
                "type": "brief",
                "status": "completed",
                "estimatedCost": 0.0,
                "estimatedTime": 0,
                "prompt": f"{creative_plan.get('concept', 'Campaign')}: {creative_plan.get('hook', '')}",
            }
        }
        nodes.append(brief_node)

        # 2. Creative Director Agent Node
        director_node = {
            "id": "node_director",
            "type": "custom",
            "position": {"x": 280, "y": 120},
            "data": {
                "label": "Creative Director Agent",
                "type": "agent",
                "status": "completed",
                "model": {"name": "GPT-OSS 120B (Groq)", "provider": "Groq"},
                "modelReason": "Selected for structured creative planning and storyboard drafting",
                "estimatedCost": 0.02,
                "estimatedTime": 5,
            }
        }
        nodes.append(director_node)
        edges.append({"id": "e_brief_director", "source": "node_brief", "target": "node_director", "animated": True})

        # 3. Scene Generation Nodes (Image / 3D)
        scene_node_ids = []
        x_offsets = [80, 480, 80, 480]  # Staggered 2-column layout

        for i, scene in enumerate(scenes[:4]):  # Max 4 key visual scenes for graph clarity
            is_hero = "hero" in scene.get("title", "").lower() or "reveal" in scene.get("title", "").lower()
            node_id = f"node_scene_{i+1}"
            y_pos = 260 + ((i // 2) * 160)
            x_pos = x_offsets[i % 2]

            # Route model for this visual scene
            route = self.router.route_node(
                task_type="image_generation",
                priority=priority,
                style_hint=visual_style,
                is_hero_shot=is_hero
            )

            prompt = f"{scene.get('title')}: {scene.get('description')}, {visual_style}"
            brand_check = self.guardian.check_prompt(prompt, brand_dna)

            scene_node = {
                "id": node_id,
                "type": "custom",
                "position": {"x": x_pos, "y": y_pos},
                "data": {
                    "label": scene.get("title", f"Scene {i+1}"),
                    "type": "image_generation",
                    "status": "ready",
                    "model": {
                        "id": route["model_id"],
                        "name": route["model_name"],
                        "provider": route["provider"]
                    },
                    "modelReason": route["reason"],
                    "estimatedCost": route["estimated_cost"],
                    "estimatedTime": route["estimated_time"],
                    "prompt": prompt,
                    "brandCheck": {
                        "passed": brand_check["passed"],
                        "message": brand_check["message"],
                        "suggested_fix": brand_check.get("suggested_fix")
                    }
                }
            }
            nodes.append(scene_node)
            scene_node_ids.append(node_id)
            edges.append({"id": f"e_dir_{node_id}", "source": "node_director", "target": node_id})

        # 4. Video Motion Generation Node
        video_y = 260 + (((len(scenes[:4]) + 1) // 2) * 160)
        video_route = self.router.route_node(
            task_type="video_generation",
            priority=priority,
            style_hint=visual_style,
            is_hero_shot=True
        )

        video_node = {
            "id": "node_video_gen",
            "type": "custom",
            "position": {"x": 180, "y": video_y},
            "data": {
                "label": "Cinematic Motion Gen",
                "type": "video_generation",
                "status": "ready",
                "model": {
                    "id": video_route["model_id"],
                    "name": video_route["model_name"],
                    "provider": video_route["provider"]
                },
                "modelReason": video_route["reason"],
                "estimatedCost": video_route["estimated_cost"],
                "estimatedTime": video_route["estimated_time"],
                "prompt": f"Smooth cinematic camera motion across generated scenes with {visual_style} grading.",
            }
        }
        nodes.append(video_node)

        # Connect intermediate scenes to video generator
        for sid in scene_node_ids:
            edges.append({"id": f"e_{sid}_video", "source": sid, "target": "node_video_gen"})

        # 5. Audio / Voiceover Node
        audio_route = self.router.route_node(
            task_type="audio_generation",
            priority=priority,
            style_hint="commercial",
            is_hero_shot=False
        )

        audio_node = {
            "id": "node_voice",
            "type": "custom",
            "position": {"x": 480, "y": video_y},
            "data": {
                "label": "Voiceover & Audio Synthesis",
                "type": "audio_generation",
                "status": "ready",
                "model": {
                    "id": audio_route["model_id"],
                    "name": audio_route["model_name"],
                    "provider": audio_route["provider"]
                },
                "modelReason": audio_route["reason"],
                "estimatedCost": audio_route["estimated_cost"],
                "estimatedTime": audio_route["estimated_time"],
                "prompt": script or f"Voiceover for {creative_plan.get('tagline', '')}",
            }
        }
        nodes.append(audio_node)
        edges.append({"id": "e_dir_voice", "source": "node_director", "target": "node_voice"})

        # 6. Final Export Node
        export_y = video_y + 140
        export_node = {
            "id": "node_export",
            "type": "custom",
            "position": {"x": 330, "y": export_y},
            "data": {
                "label": "Final Master Assembly & Export",
                "type": "export",
                "status": "ready",
                "estimatedCost": 0.0,
                "estimatedTime": 10,
            }
        }
        nodes.append(export_node)
        edges.append({"id": "e_video_export", "source": "node_video_gen", "target": "node_export"})
        edges.append({"id": "e_voice_export", "source": "node_voice", "target": "node_export"})

        # Calculate total workflow metrics
        total_cost = sum(n["data"].get("estimatedCost", 0) for n in nodes)
        total_time = sum(n["data"].get("estimatedTime", 0) for n in nodes)

        return {
            "nodes": nodes,
            "edges": edges,
            "metadata": {
                "totalCost": round(total_cost, 2),
                "totalTime": total_time,
                "qualityScore": 9.2
            }
        }
