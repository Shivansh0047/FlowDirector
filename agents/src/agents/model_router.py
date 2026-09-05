"""
Model Router Agent — Scores and selects optimal AI models for each creative task.
Uses weighted multi-factor scoring (Quality, Cost, Speed, Task Fit, Style Fit).
"""

from typing import Dict, Any, List, Optional

# Comprehensive Model Registry with capability benchmarks (0 to 10 scale)
MODEL_REGISTRY = {
    # --- Image Generation Models ---
    "flux_pro": {
        "id": "flux_pro",
        "name": "Flux Pro",
        "provider": "Black Forest Labs",
        "type": "image_generation",
        "quality": 9.6,
        "cost": 0.08,           # $ per image
        "speed": 6.8,           # score (higher = faster)
        "latency_sec": 14,
        "realism": 9.8,
        "typography": 9.4,
        "styles": ["cinematic", "photorealistic", "macro", "luxury", "warm", "minimal"],
        "best_for": "Hero shots, packaging fidelity, natural skin texture"
    },
    "flux_schnell": {
        "id": "flux_schnell",
        "name": "Flux Schnell",
        "provider": "Black Forest Labs",
        "type": "image_generation",
        "quality": 8.4,
        "cost": 0.03,
        "speed": 9.2,
        "latency_sec": 4,
        "realism": 8.2,
        "typography": 8.0,
        "styles": ["cinematic", "lifestyle", "draft", "rapid"],
        "best_for": "Draft storyboards, rapid iteration, budget scenes"
    },
    "sdxl_turbo": {
        "id": "sdxl_turbo",
        "name": "SDXL Turbo",
        "provider": "Stability AI",
        "type": "image_generation",
        "quality": 7.6,
        "cost": 0.015,
        "speed": 9.8,
        "latency_sec": 2,
        "realism": 7.4,
        "typography": 6.5,
        "styles": ["general", "concept", "rapid", "budget"],
        "best_for": "High-speed drafts, volume generation"
    },
    "midjourney_v6": {
        "id": "midjourney_v6",
        "name": "Midjourney v6.1",
        "provider": "Midjourney",
        "type": "image_generation",
        "quality": 9.5,
        "cost": 0.09,
        "speed": 6.5,
        "latency_sec": 18,
        "realism": 9.5,
        "typography": 8.8,
        "styles": ["cinematic", "artistic", "cyberpunk", "stylized", "dark"],
        "best_for": "Stylized artistic aesthetics, complex lighting"
    },

    # --- Video Generation Models ---
    "runway_gen3": {
        "id": "runway_gen3",
        "name": "Runway Gen-3 Alpha",
        "provider": "Runway",
        "type": "video_generation",
        "quality": 9.3,
        "cost": 0.45,           # $ per 5s clip
        "speed": 6.0,
        "latency_sec": 45,
        "motion_smoothness": 9.5,
        "temporal_consistency": 9.2,
        "styles": ["cinematic", "fluid_motion", "camera_pan", "commercial"],
        "best_for": "Fluid camera movements, cinematic luxury ads"
    },
    "kling_pro": {
        "id": "kling_pro",
        "name": "Kling 1.5 Pro",
        "provider": "Kuaishou",
        "type": "video_generation",
        "quality": 9.1,
        "cost": 0.35,
        "speed": 7.0,
        "latency_sec": 38,
        "motion_smoothness": 9.2,
        "temporal_consistency": 9.3,
        "styles": ["3d_rotation", "dynamic", "speed_ramp", "physics"],
        "best_for": "Complex 3D motion, human physical actions"
    },
    "luma_dream_machine": {
        "id": "luma_dream_machine",
        "name": "Luma Dream Machine",
        "provider": "Luma AI",
        "type": "video_generation",
        "quality": 8.5,
        "cost": 0.22,
        "speed": 8.0,
        "latency_sec": 25,
        "motion_smoothness": 8.4,
        "temporal_consistency": 8.3,
        "styles": ["fast_motion", "environment", "concept"],
        "best_for": "Cost-effective scene backgrounds, rapid motion"
    },

    # --- Audio / Voiceover Models ---
    "elevenlabs_v2": {
        "id": "elevenlabs_v2",
        "name": "ElevenLabs Multilingual v2",
        "provider": "ElevenLabs",
        "type": "audio_generation",
        "quality": 9.7,
        "cost": 0.12,           # $ per script
        "speed": 8.5,
        "latency_sec": 8,
        "naturalness": 9.8,
        "styles": ["conversational", "emotional", "commercial", "cinematic"],
        "best_for": "Nuanced human voiceover, emotional tone control"
    },
    "openai_tts_hd": {
        "id": "openai_tts_hd",
        "name": "OpenAI TTS HD",
        "provider": "OpenAI",
        "type": "audio_generation",
        "quality": 8.8,
        "cost": 0.05,
        "speed": 9.2,
        "latency_sec": 4,
        "naturalness": 8.9,
        "styles": ["clean", "neutral", "instructional", "fast"],
        "best_for": "Crisp narration, high-speed audio synthesis"
    }
}


class ModelRouterAgent:
    def __init__(self):
        self.registry = MODEL_REGISTRY

    def route_node(
        self,
        task_type: str,
        priority: Dict[str, float],
        style_hint: Optional[str] = None,
        is_hero_shot: bool = False
    ) -> Dict[str, Any]:
        """
        Selects the best model for a specific task based on weighted scoring.

        Args:
            task_type: 'image_generation', 'video_generation', 'audio_generation'
            priority: {'quality': 0.6, 'cost': 0.2, 'speed': 0.2}
            style_hint: e.g. 'cinematic', 'macro', 'cyberpunk'
            is_hero_shot: If True, applies boost to photorealism/fidelity

        Returns:
            {
                "model_id": str,
                "model_name": str,
                "provider": str,
                "estimated_cost": float,
                "estimated_time": int,
                "score": float,
                "reason": str,
                "alternatives": list
            }
        """
        w_quality = priority.get("quality", 0.6)
        w_cost = priority.get("cost", 0.2)
        w_speed = priority.get("speed", 0.2)

        candidates = [m for m in self.registry.values() if m["type"] == task_type]

        if not candidates:
            return {
                "model_id": "default",
                "model_name": "Standard AI Engine",
                "provider": "Default",
                "estimated_cost": 0.05,
                "estimated_time": 10,
                "score": 8.0,
                "reason": "Default fallback model",
                "alternatives": []
            }

        scored = []
        for model in candidates:
            # Normalized cost score (lower cost = higher score out of 10)
            # Baseline $0.50 -> 0 score, $0.00 -> 10 score
            cost_score = max(0.0, min(10.0, 10.0 - (model["cost"] * 18.0)))

            # Base capability score
            base_score = (
                (w_quality * model["quality"]) +
                (w_cost * cost_score) +
                (w_speed * model["speed"])
            )

            # Style match bonus
            style_bonus = 0.0
            if style_hint and any(s in style_hint.lower() for s in model.get("styles", [])):
                style_bonus += 0.4

            # Hero shot priority boost for high quality
            hero_bonus = 0.0
            if is_hero_shot and model["quality"] >= 9.2:
                hero_bonus += 0.8

            total_score = round(base_score + style_bonus + hero_bonus, 2)

            scored.append({
                "model": model,
                "total_score": total_score,
                "cost_score": round(cost_score, 1)
            })

        # Sort descending by total score
        scored.sort(key=lambda x: x["total_score"], reverse=True)
        winner = scored[0]["model"]
        winner_score = scored[0]["total_score"]

        # Formulate human-readable explanation
        reasons = []
        if is_hero_shot:
            reasons.append("Preserved for hero shot visual fidelity")
        elif w_cost > 0.4:
            reasons.append(f"Optimized for budget (${winner['cost']}/unit)")
        elif w_speed > 0.4:
            reasons.append(f"Optimized for rapid generation ({winner['latency_sec']}s)")
        else:
            reasons.append(f"Best quality/performance balance ({winner['quality']}/10 quality)")

        if style_hint:
            reasons.append(f"strong fit for '{style_hint}' aesthetic")

        alternatives = [
            {
                "id": s["model"]["id"],
                "name": s["model"]["name"],
                "cost": s["model"]["cost"],
                "quality": s["model"]["quality"],
                "score": s["total_score"]
            }
            for s in scored[1:3]
        ]

        return {
            "model_id": winner["id"],
            "model_name": winner["name"],
            "provider": winner["provider"],
            "estimated_cost": winner["cost"],
            "estimated_time": winner["latency_sec"],
            "score": winner_score,
            "reason": "; ".join(reasons),
            "alternatives": alternatives
        }
