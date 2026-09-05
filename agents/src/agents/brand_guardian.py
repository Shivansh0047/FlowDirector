"""
Brand Guardian Agent — Validates prompts and outputs against Brand DNA rules.
Provides 1-click auto-fix suggestions.
Pure rule-based logic (no LLM required).
"""

from typing import Dict, Any, List
import re


class BrandGuardianAgent:
    def __init__(self):
        # Pattern matching rules for common violations
        self.violation_patterns = {
            "neon": {
                "keywords": ["neon", "saturated", "fluorescent", "vivid pink", "electric blue"],
                "severity": "warning",
                "fix_template": "Use {replacement} instead of high-saturation neon colors"
            },
            "cartoon": {
                "keywords": ["cartoon", "animated", "comic", "cel-shaded", "caricature"],
                "severity": "warning",
                "fix_template": "Switch to photorealistic rendering style"
            },
            "texture_smoothing": {
                "keywords": ["smooth skin", "airbrushed", "plastic texture", "porcelain skin", "flawless"],
                "severity": "warning",
                "fix_template": "Maintain natural skin texture with visible pores and authentic detail"
            },
            "vintage_filter": {
                "keywords": ["sepia", "vintage filter", "retro grain", "faded"],
                "severity": "info",
                "fix_template": "Remove vintage post-processing filters"
            }
        }

    def check_prompt(self, prompt: str, brand_dna: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validates a generation prompt against Brand DNA restrictions.

        Args:
            prompt: The AI generation prompt to validate
            brand_dna: { "brandName": str, "tone": list, "restrictions": list, "colors": list }

        Returns:
            {
                "passed": bool,
                "violations": [{"rule": str, "matched": str, "severity": str}],
                "suggested_fix": str | None,
                "score": float (0-10)
            }
        """
        violations = []
        restrictions = brand_dna.get("restrictions", [])
        prompt_lower = prompt.lower()

        # Check explicit brand restrictions
        for restriction in restrictions:
            # Pattern: "Avoid X" or "Do not use X" or "No X"
            if restriction.lower().startswith(("avoid", "do not", "no ")):
                forbidden_terms = self._extract_forbidden_terms(restriction)

                for term in forbidden_terms:
                    if term.lower() in prompt_lower:
                        violations.append({
                            "rule": restriction,
                            "matched": term,
                            "severity": "warning"
                        })

        # Check against built-in pattern library
        for pattern_name, pattern_data in self.violation_patterns.items():
            for keyword in pattern_data["keywords"]:
                if keyword.lower() in prompt_lower:
                    violations.append({
                        "rule": f"Detected potentially off-brand keyword: '{keyword}'",
                        "matched": keyword,
                        "severity": pattern_data["severity"],
                        "fix_hint": pattern_data["fix_template"]
                    })

        # Generate auto-fix suggestion
        suggested_fix = None
        if violations:
            primary_violation = violations[0]
            if "fix_hint" in primary_violation:
                suggested_fix = primary_violation["fix_hint"]
            else:
                suggested_fix = f"Review and revise to comply with: {primary_violation['rule']}"

            # Smart replacements for common patterns
            if "neon" in prompt_lower or "saturated" in prompt_lower:
                suggested_fix = "Use soft warm natural lighting with subtle color grading"
            elif "smooth" in prompt_lower and "skin" in prompt_lower:
                suggested_fix = "Emphasize natural skin texture with visible authentic detail"

        # Calculate compliance score (10 = perfect, deduct for violations)
        score = 10.0
        for v in violations:
            if v["severity"] == "warning":
                score -= 1.5
            elif v["severity"] == "info":
                score -= 0.5

        score = max(0.0, min(10.0, score))

        return {
            "passed": len(violations) == 0,
            "violations": violations,
            "suggested_fix": suggested_fix,
            "score": round(score, 1),
            "message": self._generate_message(violations, brand_dna)
        }

    def check_node(self, node: Dict[str, Any], brand_dna: Dict[str, Any]) -> Dict[str, Any]:
        """
        Checks a full workflow node (with prompt, model, params) against brand rules.
        """
        prompt = node.get("prompt", "")
        if not prompt:
            return {
                "passed": True,
                "violations": [],
                "suggested_fix": None,
                "score": 10.0,
                "message": "No prompt to validate"
            }

        return self.check_prompt(prompt, brand_dna)

    def _extract_forbidden_terms(self, restriction: str) -> List[str]:
        """
        Extracts forbidden terms from a natural-language restriction rule.
        Examples:
          "Avoid neon colors" -> ["neon colors"]
          "No cartoon aesthetics" -> ["cartoon aesthetics"]
        """
        restriction_lower = restriction.lower()

        # Remove prefix words
        for prefix in ["avoid", "do not use", "no ", "never use"]:
            if restriction_lower.startswith(prefix):
                restriction_lower = restriction_lower[len(prefix):].strip()

        # Split by commas or "and"
        terms = re.split(r',|\band\b', restriction_lower)
        return [term.strip() for term in terms if term.strip()]

    def _generate_message(self, violations: List[Dict], brand_dna: Dict) -> str:
        """
        Generates a human-readable compliance message.
        """
        if not violations:
            brand_name = brand_dna.get("brandName", "Brand")
            return f"✓ Fully aligned with {brand_name} guidelines"

        count = len(violations)
        severity = "minor" if all(v["severity"] == "info" for v in violations) else "potential"

        return f"⚠ {count} {severity} brand consistency {'issue' if count == 1 else 'issues'} detected"
