class FoodVerifier:

    def verify(self, food, investigation):

        verified_nutrition = food.get("nutrition", {}).copy()

        verification_actions = []
        conflicts = []
        verified_fields = []

        # Check which fields the agent marked as uncertain
        uncertainties = investigation.get("uncertainties", [])

        for uncertainty in uncertainties:

            if "sodium" in uncertainty.lower():

                # Simulated trusted verification source
                verified_sodium = 450

                original_sodium = food["nutrition"].get("sodium")

                if original_sodium != verified_sodium:

                    conflicts.append({
                        "field": "sodium",
                        "ocr_value": original_sodium,
                        "verified_value": verified_sodium
                    })

                    verification_actions.append(
                        f"Sodium conflict detected: OCR={original_sodium} mg, "
                        f"verified source={verified_sodium} mg."
                    )

                    # Adapt: use verified value
                    verified_nutrition["sodium"] = verified_sodium

                    verification_actions.append(
                        "Agent adapted by replacing the uncertain sodium value "
                        "with the verified value."
                    )

                verified_fields.append("sodium")

        return {
        "verified_nutrition": verified_nutrition,
        "ingredients": food.get("ingredients", []),
        "serving_size": food.get("serving_size"),
        "verified_fields": verified_fields,
        "conflicts": conflicts,
        "verification_actions": verification_actions,
        "verification_status": (
            "verified" if verified_fields else "no_verification_needed"
        )
    }