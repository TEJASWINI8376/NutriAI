class RuleEngine:

    # These are prototype/demo thresholds.
    # They should be replaced with evidence-backed values later.
    SUGAR_CAUTION = 15
    SODIUM_CAUTION = 400
    SATURATED_FAT_CAUTION = 5

    def assess(self, patient, verified_food, medicine_result=None):
        conditions = [
            condition.lower()
            for condition in patient.get("conditions", [])
        ]

        restrictions = [
            restriction.lower()
            for restriction in patient.get("dietary_restrictions", [])
        ]

        nutrition = verified_food.get("verified_nutrition", {})
        ingredients = [
            ingredient.lower()
            for ingredient in verified_food.get("ingredients", [])
        ]

        concerns = []
        rules_applied = []
        if medicine_result:
            possible_interactions = medicine_result.get(
                "possible_interactions", []
            )

            if possible_interactions:
                rules_applied.append("medicine_food_interaction_rule")

                for interaction in possible_interactions:
                    concerns.append({
                        "type": "medicine_food_interaction",
                        "medicine": interaction["medicine"],
                        "food_component": interaction["food_component"],
                        "message": interaction["message"]
                    })

        # --------------------------------
        # Diabetes / Low Sugar
        # --------------------------------

        sugar = nutrition.get("sugar")

        if (
            ("diabetes" in conditions or "low sugar" in restrictions)
            and sugar is not None
        ):

            rules_applied.append("diabetes_sugar_rule")

            if sugar >= self.SUGAR_CAUTION:

                concerns.append({
                    "type": "sugar",
                    "value": sugar,
                    "message": (
                        f"Sugar is {sugar} g per serving, "
                        "which exceeds the prototype caution threshold."
                    )
                })

        # --------------------------------
        # Hypertension / Low Sodium
        # --------------------------------

        sodium = nutrition.get("sodium")

        if (
            ("hypertension" in conditions or "low sodium" in restrictions)
            and sodium is not None
        ):

            rules_applied.append("hypertension_sodium_rule")

            if sodium >= self.SODIUM_CAUTION:

                concerns.append({
                    "type": "sodium",
                    "value": sodium,
                    "message": (
                        f"Sodium is {sodium} mg per serving, "
                        "which exceeds the prototype caution threshold."
                    )
                })

        # --------------------------------
        # Cardiovascular considerations
        # --------------------------------

        saturated_fat = nutrition.get("saturated_fat")

        if "cardiovascular" in conditions:

            rules_applied.append("cardiovascular_saturated_fat_rule")

            if (
                saturated_fat is not None
                and saturated_fat >= self.SATURATED_FAT_CAUTION
            ):

                concerns.append({
                    "type": "saturated_fat",
                    "value": saturated_fat,
                    "message": (
                        f"Saturated fat is {saturated_fat} g per serving, "
                        "which exceeds the prototype caution threshold."
                    )
                })

        # --------------------------------
        # Final Decision
        # --------------------------------

        if len(concerns) >= 2:

            decision = "HIGHER_CONCERN"

        elif len(concerns) == 1:

            decision = "CONSUME_WITH_CAUTION"

        else:

            decision = "GENERALLY_SUITABLE"

        return {
            "decision": decision,
            "concerns": concerns,
            "rules_applied": rules_applied
        }