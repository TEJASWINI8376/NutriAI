from evidence.evidence_data import EVIDENCE


class ExplanationGenerator:

    def generate(self, patient, food, verification, rule_result, medicine_result=None):

        decision = rule_result["decision"]
        concerns = rule_result["concerns"]
        rules = rule_result["rules_applied"]

        # --------------------------------
        # Decision text
        # --------------------------------

        decision_text = {
            "GENERALLY_SUITABLE":
                "Generally suitable",

            "CONSUME_WITH_CAUTION":
                "Consume with caution",

            "HIGHER_CONCERN":
                "Higher concern / clinical confirmation"
        }

        # --------------------------------
        # Build reasons
        # --------------------------------

        reasons = []

        for concern in concerns:
            reasons.append(concern["message"])

        if not reasons:
            reasons.append(
                "No major concern was identified from the available "
                "information and applied rules."
            )

        # --------------------------------
        # Evidence
        # --------------------------------

        evidence = []

        for rule in rules:

            if rule in EVIDENCE:

                evidence.append({
                    "rule": rule,
                    "title": EVIDENCE[rule]["title"],
                    "source": EVIDENCE[rule]["source"],
                    "url": EVIDENCE[rule]["url"],
                    "description": EVIDENCE[rule]["description"]
                })

        # --------------------------------
        # Verification information
        # --------------------------------

        verification_notes = []

        for conflict in verification.get("conflicts", []):

            verification_notes.append(
                f"{conflict['field']} was uncertain in OCR. "
                f"Original value: {conflict['ocr_value']}; "
                f"verified value: {conflict['verified_value']}."
            )

        medicine_notes = []
        if medicine_result:
            for interaction in medicine_result.get("possible_interactions", []):
                medicine_notes.append(interaction["message"])

        if not medicine_notes:
            medicine_notes.append(
                "No known food-medicine interaction was identified from the available interaction data."
            )

        # --------------------------------
        # Final response
        # --------------------------------

        return {
            "food": food.get("product_name"),
            "decision": decision,
            "decision_text": decision_text.get(
                decision,
                decision
            ),
            "reasons": reasons,
            "rules_applied": rules,
            "verification_notes": verification_notes,
            "medicine_notes": medicine_notes,
            "evidence": evidence,
            "disclaimer": (
                "This is dietary decision support and does not diagnose "
                "disease or replace advice from a healthcare professional."
            )
        }