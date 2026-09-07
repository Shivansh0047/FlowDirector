"""
Creative Director Agent — Generates campaign concepts, storyboards, and scripts from briefs.
Also routes natural-language chat commands to workflow actions via Groq.
Uses Groq API (openai/gpt-oss-120b) with smart template fallback.
"""

import os
from pathlib import Path
from typing import Dict, Any, Optional
from groq import Groq
import json
from dotenv import load_dotenv

# Load .env from agents/ regardless of cwd
load_dotenv(Path(__file__).resolve().parents[2] / ".." / ".env")


class CreativeDirectorAgent:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.groq_api_key) if self.groq_api_key else None
        self.model_name = "openai/gpt-oss-120b"

    def generate_creative_plan(self, brief: Dict[str, Any], brand_dna: Dict[str, Any]) -> Dict[str, Any]:
        """
        Transforms a creative brief into structured creative plan.

        Args:
            brief: { contentType, product, audience, visualStyle, duration, priority }
            brand_dna: { brandName, tone, restrictions, colors }

        Returns:
            {
                "concept": str,
                "hook": str,
                "tagline": str,
                "scenes": [{"id", "title", "description", "duration", "shot_type"}],
                "script": str,
                "visualDirection": str
            }
        """

        # Try Groq API if available
        if self.client:
            try:
                return self._generate_with_groq(brief, brand_dna)
            except Exception as e:
                print(f"[Creative Director] Groq API failed, using fallback: {e}")
                return self._generate_fallback(brief, brand_dna)
        else:
            print("[Creative Director] No Groq API key, using smart template fallback")
            return self._generate_fallback(brief, brand_dna)

    def _generate_with_groq(self, brief: Dict[str, Any], brand_dna: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generates creative plan using GPT-OSS 120B (Groq) model.
        """
        content_type = brief.get("contentType", "instagram_ad")
        product = brief.get("product", "Product")
        audience = brief.get("audience", "General audience")
        visual_style = brief.get("visualStyle", "cinematic")
        duration = brief.get("duration", 30)
        brand_name = brand_dna.get("brandName", product)
        tone = ", ".join(brand_dna.get("tone", ["premium"]))

        prompt = f"""You are a world-class creative director for {brand_name}. Create a compelling {content_type} campaign.

**Product:** {product}
**Target Audience:** {audience}
**Visual Style:** {visual_style}
**Duration:** {duration} seconds
**Brand Tone:** {tone}

Generate a structured creative campaign plan in JSON format with:
1. A memorable campaign concept title
2. An attention-grabbing hook (opening line)
3. A powerful tagline
4. A scene-by-scene breakdown (4-6 scenes for {duration}s)
5. Full script/voiceover text
6. Visual direction notes

Return ONLY valid JSON with this structure:
{{
  "concept": "Campaign Title",
  "hook": "Opening hook line",
  "tagline": "Memorable tagline",
  "scenes": [
    {{"id": 1, "title": "Scene Name", "description": "What happens visually", "duration": 5, "shot_type": "close-up/wide/pan"}},
  ],
  "script": "Full voiceover script",
  "visualDirection": "Camera, lighting, and mood notes"
}}"""

        # Try Groq's GPT-OSS-120B model as requested; if unavailable, fallback handles it gracefully
        try:
            response = self.client.chat.completions.create(
                model=self.model_name,
                messages=[
                    {"role": "system", "content": "You are an expert creative director. Return only valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.8,
                max_tokens=1500
            )
        except Exception as e:
            # If model call fails (decommissioned, rate limit, access denied), raise for fallback
            raise e

        content = response.choices[0].message.content.strip()

        # Extract JSON from markdown code blocks if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        return json.loads(content)

    def route_chat_command(
        self,
        command: str,
        current_workflow: Dict[str, Any],
        brand_dna: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Interprets a free-form user command and decides what workflow action to take.
        Uses Groq with a strict JSON contract. Always returns a human-facing message.

        Returns:
            {
                "action": "optimize_cost" | "speed_optimize" | "check_brand" | "chat",
                "params": { ... } | {},
                "message": str,
            }

        The caller (main.handle_chat_command) is responsible for executing the action
        against the optimizer/brand_guardian and merging any returned workflow back in.
        """

        workflow_summary = {
            "node_count": len(current_workflow.get("nodes", [])),
            "types": [n.get("data", {}).get("type", "?") for n in current_workflow.get("nodes", [])],
            "total_cost": sum(n.get("data", {}).get("estimatedCost", 0) for n in current_workflow.get("nodes", [])),
        }

        prompt = f"""You are FlowDirector's chat command router.

The user is editing an AI creative workflow in a visual node canvas. The current workflow has:
{json.dumps(workflow_summary, indent=2)}

Brand DNA: {json.dumps(brand_dna or {}, indent=2)}

User command: "{command}"

Classify the command into exactly ONE action, and produce a short, conversational reply.

Allowed actions:
- "optimize_cost"  — user wants the workflow cheaper (params: target_reduction_pct, default 0.30)
- "speed_optimize" — user wants the workflow faster (params: target_reduction_pct, default 0.20)
- "check_brand"    — user wants brand compliance / consistency check
- "chat"           — anything else (a question, a comment, no workflow change)

Return ONLY valid JSON with this exact shape:
{{
  "action": "optimize_cost" | "speed_optimize" | "check_brand" | "chat",
  "params": {{ ... action-specific ... }},
  "message": "A short, friendly reply to the user (1-3 sentences, no markdown bullets)."
}}"""

        if self.client:
            try:
                response = self.client.chat.completions.create(
                    model=self.model_name,
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a precise JSON-producing router for an AI workflow tool. Output only valid JSON.",
                        },
                        {"role": "user", "content": prompt},
                    ],
                    temperature=0.2,
                    max_tokens=400,
                )
                content = response.choices[0].message.content.strip()
                if "```json" in content:
                    content = content.split("```json")[1].split("```")[0].strip()
                elif "```" in content:
                    content = content.split("```")[1].split("```")[0].strip()
                parsed = json.loads(content)
                # Defensive: ensure required keys exist
                action = parsed.get("action", "chat")
                if action not in ("optimize_cost", "speed_optimize", "check_brand", "chat"):
                    action = "chat"
                return {
                    "action": action,
                    "params": parsed.get("params", {}) or {},
                    "message": parsed.get("message") or f"Got it — I'll work on: \"{command}\".",
                }
            except Exception as e:
                print(f"[Creative Director] Groq routing failed, using neutral fallback: {e}")
                # fall through to neutral fallback below

        # Neutral fallback when Groq is unavailable or failed
        return {
            "action": "chat",
            "params": {},
            "message": (
                "I can help with: **make this cheaper**, **make this faster**, or **check brand rules**. "
                f"You said: \"{command}\"."
            ),
        }

    def _generate_fallback(self, brief: Dict[str, Any], brand_dna: Dict[str, Any]) -> Dict[str, Any]:
        """
        Smart template-based fallback when Groq API is unavailable.
        Context-aware templates based on content type and product category.
        """
        content_type = brief.get("contentType", "instagram_ad")
        product = brief.get("product", "Product")
        audience = brief.get("audience", "General audience")
        visual_style = brief.get("visualStyle", "cinematic")
        duration = brief.get("duration", 30)
        brand_name = brand_dna.get("brandName", product)

        # Template selection based on content type
        if content_type == "instagram_ad":
            return {
                "concept": f"{brand_name} — Elevated Everyday",
                "hook": f"Discover {product}",
                "tagline": f"Your new essential, redefined.",
                "scenes": [
                    {
                        "id": 1,
                        "title": "Morning Ritual Hook",
                        "description": f"Close-up of user in natural morning light, authentic moment",
                        "duration": 5,
                        "shot_type": "close-up"
                    },
                    {
                        "id": 2,
                        "title": "The Problem",
                        "description": f"Subtle visual showing the need {product} solves",
                        "duration": 4,
                        "shot_type": "medium"
                    },
                    {
                        "id": 3,
                        "title": "Product Hero Reveal",
                        "description": f"Premium shot of {product} with elegant lighting and packaging detail",
                        "duration": 6,
                        "shot_type": "macro"
                    },
                    {
                        "id": 4,
                        "title": "Application / Usage",
                        "description": f"User interacting naturally with {product}",
                        "duration": 5,
                        "shot_type": "medium"
                    },
                    {
                        "id": 5,
                        "title": "Transformation / Result",
                        "description": f"Confident, glowing result after using {product}",
                        "duration": 5,
                        "shot_type": "portrait"
                    },
                    {
                        "id": 6,
                        "title": "CTA & Brand Lock",
                        "description": f"Final product shot with {brand_name} branding and clear CTA",
                        "duration": 5,
                        "shot_type": "product_hero"
                    }
                ],
                "script": f"Your routine just changed. Meet {product}. {brand_name}. Elevated everyday.",
                "visualDirection": f"{visual_style} lighting, authentic moments, premium product fidelity, {audience} representation"
            }

        elif content_type == "cinematic_film":
            return {
                "concept": f"{brand_name} — Engineering Perfection",
                "hook": f"Experience {product}. Reimagined.",
                "tagline": f"Precision meets performance.",
                "scenes": [
                    {
                        "id": 1,
                        "title": "Epic Reveal",
                        "description": f"Dramatic reveal of {product} with cinematic lighting and slow motion",
                        "duration": 8,
                        "shot_type": "wide_establishing"
                    },
                    {
                        "id": 2,
                        "title": "Exploded Technical View",
                        "description": f"3D technical breakdown showing {product} engineering and components",
                        "duration": 10,
                        "shot_type": "3d_animation"
                    },
                    {
                        "id": 3,
                        "title": "Lifestyle Integration",
                        "description": f"User immersed in environment showcasing {product} in action",
                        "duration": 12,
                        "shot_type": "cinematic_lifestyle"
                    },
                    {
                        "id": 4,
                        "title": "Dynamic Motion Sequence",
                        "description": f"Speed ramps and orbiting camera around {product} with visual effects",
                        "duration": 10,
                        "shot_type": "dynamic_motion"
                    },
                    {
                        "id": 5,
                        "title": "Signature Tagline Lock",
                        "description": f"Final hero shot of {product} with {brand_name} brand signature",
                        "duration": 5,
                        "shot_type": "product_hero"
                    }
                ],
                "script": f"Silence the noise. Unleash perfection. {product}. {brand_name}.",
                "visualDirection": f"High-contrast {visual_style} aesthetic, dramatic rim lighting, speed ramps, orbiting camera work, premium finishes"
            }

        else:  # Generic fallback
            return {
                "concept": f"{brand_name} — The New Standard",
                "hook": f"Introducing {product}",
                "tagline": f"Better by design.",
                "scenes": [
                    {"id": 1, "title": "Hook", "description": f"Opening attention grab", "duration": 5, "shot_type": "close-up"},
                    {"id": 2, "title": "Product Showcase", "description": f"{product} hero shot", "duration": 8, "shot_type": "product"},
                    {"id": 3, "title": "Lifestyle", "description": f"User enjoying {product}", "duration": 10, "shot_type": "lifestyle"},
                    {"id": 4, "title": "CTA", "description": f"Call to action and branding", "duration": 7, "shot_type": "cta"}
                ],
                "script": f"Meet {product}. {brand_name}.",
                "visualDirection": f"{visual_style} style with focus on {audience}"
            }
