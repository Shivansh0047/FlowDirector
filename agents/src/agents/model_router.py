"""
Model Router Agent — Scores and selects optimal AI models for each creative task.
Uses weighted multi-factor scoring (Quality, Cost, Speed, Task Fit, Style Fit).
"""

from typing import Dict, Any, List, Optional

# Comprehensive Model Registry with capability benchmarks (0 to 10 scale)
MODEL_REGISTRY = {
    "nano_banana_pro": {"id":"nano_banana_pro","name":"Nano Banana Pro","provider":"Nano","type":"image_generation","quality":9.2,"cost":0.12,"speed":7.5,"latency_sec":12,"realism":9.3,"styles":["pro","high_fidelity"],"best_for":"Pro image generation"},
    "nano_banana_2": {"id":"nano_banana_2","name":"Nano Banana 2","provider":"Nano","type":"image_generation","quality":9.0,"cost":0.10,"speed":8.0,"latency_sec":10,"styles":["general"],"best_for":"General high-quality images"},
    "nano_banana_2_lite": {"id":"nano_banana_2_lite","name":"Nano Banana 2 Lite","provider":"Nano","type":"image_generation","quality":8.2,"cost":0.05,"speed":9.5,"latency_sec":6,"styles":["lite","fast"],"best_for":"Quick lightweight images"},
    "gpt_image_2": {"id":"gpt_image_2","name":"GPT Image 2","provider":"OpenAI","type":"image_generation","quality":9.5,"cost":0.15,"speed":6.5,"latency_sec":15,"realism":9.6,"styles":["photoreal","creative"],"best_for":"Photoreal creative images"},
    "gpt_image_1_mini": {"id":"gpt_image_1_mini","name":"GPT Image 1 Mini","provider":"OpenAI","type":"image_generation","quality":8.4,"cost":0.06,"speed":9.2,"latency_sec":7,"styles":["mini","fast"],"best_for":"Fast mini images"},
    "flux_2_max": {"id":"flux_2_max","name":"FLUX.2 Max","provider":"Black Forest Labs","type":"image_generation","quality":9.7,"cost":0.09,"speed":6.0,"latency_sec":18,"realism":9.9,"styles":["max","premium"],"best_for":"Maximum quality image"},
    "flux_2_pro": {"id":"flux_2_pro","name":"FLUX.2 Pro","provider":"Black Forest Labs","type":"image_generation","quality":9.4,"cost":0.07,"speed":7.2,"latency_sec":14,"realism":9.6,"styles":["pro"],"best_for":"Pro image generation"},
    "flux_2_klein_4b": {"id":"flux_2_klein_4b","name":"FLUX.2 Klein 4B","provider":"Black Forest Labs","type":"image_generation","quality":8.8,"cost":0.04,"speed":8.5,"latency_sec":9,"styles":["small","fast"],"best_for":"Small fast images"},
    "seedream_5_0_pro": {"id":"seedream_5_0_pro","name":"Seedream 5.0 Pro","provider":"ByteDance","type":"image_generation","quality":9.3,"cost":0.11,"speed":7.0,"latency_sec":13,"realism":9.4,"styles":["pro"],"best_for":"Pro image generation"},
    "seedream_4_5": {"id":"seedream_4_5","name":"Seedream 4.5","provider":"ByteDance","type":"image_generation","quality":8.5,"cost":0.08,"speed":8.0,"latency_sec":11,"styles":["general"],"best_for":"General image generation"},
    "recraft_4_1": {"id":"recraft_4_1","name":"Recraft 4.1","provider":"Recraft","type":"image_generation","quality":9.1,"cost":0.13,"speed":6.8,"latency_sec":16,"styles":["creative","artistic"],"best_for":"Creative artistic images"},
    "kling_omni_edit": {"id":"kling_omni_edit","name":"Kling Omni-Edit","provider":"Kuaishou","type":"edit_model","quality":9.0,"cost":0.25,"speed":7.0,"latency_sec":30,"styles":["edit","omni"],"best_for":"Omni image/video editing"},
    "kling_motion_control": {"id":"kling_motion_control","name":"Kling Motion Control","provider":"Kuaishou","type":"edit_model","quality":9.3,"cost":0.30,"speed":6.5,"latency_sec":35,"styles":["motion","control"],"best_for":"Precise motion-controlled edits"},
    "gemini_omni_flash": {"id":"gemini_omni_flash","name":"Gemini Omni Flash","provider":"Google","type":"edit_model","quality":8.7,"cost":0.20,"speed":7.8,"latency_sec":25,"styles":["flash","fast"],"best_for":"Fast flash edits"},
    "talking_actors": {"id":"talking_actors","name":"Talking Actors","provider":"HexCoded","type":"video_generation","quality":8.9,"cost":0.25,"speed":7.0,"latency_sec":40,"styles":["actor","script","multilingual"],"best_for":"AI actor speaking scripted video in 70+ languages","note":"Pick actor, type script, generate. Supports AI twins and licensed actors."},

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
    "seedance_2_5": {"id":"seedance_2_5","name":"Seedance 2.5","provider":"ByteDance","type":"video_generation","quality":9.3,"cost":0.45,"speed":6.5,"latency_sec":55,"motion_smoothness":9.1,"temporal_consistency":9.2,"styles":["cinematic","dynamic"],"best_for":"High-fidelity cinematic video"},
    "seedance_2_0": {"id":"seedance_2_0","name":"Seedance 2.0","provider":"ByteDance","type":"video_generation","quality":8.9,"cost":0.30,"speed":7.5,"latency_sec":42,"styles":["cinematic"],"best_for":"Balanced quality-speed video"},
    "seedance_2_fast": {"id":"seedance_2_fast","name":"Seedance 2 Fast","provider":"ByteDance","type":"video_generation","quality":8.5,"cost":0.15,"speed":9.2,"latency_sec":18,"styles":["fast","social"],"best_for":"Quick social video"},
    "seedance_2_mini": {"id":"seedance_2_mini","name":"Seedance 2 Mini","provider":"ByteDance","type":"video_generation","quality":7.8,"cost":0.08,"speed":9.8,"latency_sec":10,"styles":["mini","fast"],"best_for":"Ultra-fast low-cost previews"},
    "kling_3_0": {"id":"kling_3_0","name":"Kling 3.0","provider":"Kuaishou","type":"video_generation","quality":9.5,"cost":0.50,"speed":6.0,"latency_sec":60,"motion_smoothness":9.5,"temporal_consistency":9.4,"styles":["3d_rotation","physics"],"best_for":"Complex 3D motion, human action"},
    "kling_3_0_turbo": {"id":"kling_3_0_turbo","name":"Kling 3.0 Turbo","provider":"Kuaishou","type":"video_generation","quality":9.2,"cost":0.35,"speed":7.8,"latency_sec":30,"styles":["fast","dynamic"],"best_for":"Fast high-quality video"},
    "veo_3_1": {"id":"veo_3_1","name":"Veo 3.1","provider":"Google","type":"video_generation","quality":9.4,"cost":0.40,"speed":6.8,"latency_sec":45,"styles":["cinematic","photoreal"],"best_for":"Cinematic photoreal video"},
    "veo_3_1_fast": {"id":"veo_3_1_fast","name":"Veo 3.1 Fast","provider":"Google","type":"video_generation","quality":9.0,"cost":0.25,"speed":8.2,"latency_sec":28,"styles":["fast"],"best_for":"Quick cinematic drafts"},
    "veo_3_1_lite": {"id":"veo_3_1_lite","name":"Veo 3.1 Lite","provider":"Google","type":"video_generation","quality":8.3,"cost":0.12,"speed":9.0,"latency_sec":15,"styles":["lite","fast"],"best_for":"Low-cost previews"},
    "grok_imagine_1_5": {"id":"grok_imagine_1_5","name":"Grok Imagine 1.5","provider":"xAI","type":"video_generation","quality":8.6,"cost":0.18,"speed":7.0,"latency_sec":35,"styles":["imaginative","artistic"],"best_for":"Creative artistic video"},
    "hailuo_2_3": {"id":"hailuo_2_3","name":"Hailuo 2.3","provider":"MiniMax","type":"video_generation","quality":8.8,"cost":0.22,"speed":7.5,"latency_sec":32,"styles":["natural","authentic"],"best_for":"Natural authentic video"},
    "minimax_h3": {"id":"minimax_h3","name":"MiniMax H3","provider":"MiniMax","type":"video_generation","quality":9.0,"cost":0.30,"speed":7.0,"latency_sec":40,"styles":["high_fidelity"],"best_for":"High-fidelity video"},
    "wan_2_7": {"id":"wan_2_7","name":"Wan 2.7","provider":"Alibaba","type":"video_generation","quality":8.7,"cost":0.20,"speed":7.8,"latency_sec":30,"styles":["general"],"best_for":"General purpose video"},
    "wan_2_6": {"id":"wan_2_6","name":"Wan 2.6","provider":"Alibaba","type":"video_generation","quality":8.2,"cost":0.15,"speed":8.5,"latency_sec":22,"styles":["general"],"best_for":"Fast general video"},
    "vidu_q3_turbo": {"id":"vidu_q3_turbo","name":"Vidu Q3-Turbo","provider":"Vidu","type":"video_generation","quality":8.9,"cost":0.28,"speed":7.2,"latency_sec":38,"styles":["turbo"],"best_for":"Turbo video generation"},
    "ltx_2_3_fast": {"id":"ltx_2_3_fast","name":"LTX-2.3 Fast","provider":"Lightricks","type":"video_generation","quality":8.4,"cost":0.10,"speed":9.5,"latency_sec":12,"styles":["fast"],"best_for":"Ultra-fast low-cost video"},
    "happyhorse_1_1": {"id":"happyhorse_1_1","name":"HappyHorse 1.1","provider":"HappyHorse","type":"video_generation","quality":7.5,"cost":0.05,"speed":9.9,"latency_sec":8,"styles":["fast","minimal"],"best_for":"Minimal fast previews"},

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
