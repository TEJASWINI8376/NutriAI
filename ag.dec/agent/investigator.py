from typing import List, Dict


class AgentInvestigator:

    def investigate(self, patient: Dict, food: Dict) -> Dict:

        conditions = [
            condition.lower()
            for condition in patient.get("conditions", [])
        ]

        restrictions = [
            restriction.lower()
            for restriction in patient.get("dietary_restrictions", [])
        ]

        medicines = patient.get("medicines", [])

        nutrition = food.get("nutrition", {})
        confidence = food.get("confidence", {})

        relevant_checks: List[str] = []
        uncertainties: List[str] = []
        actions: List[str] = []

        # --------------------------------
        # 1. Diabetes investigation
        # --------------------------------

        if "diabetes" in conditions or "low sugar" in restrictions:

            relevant_checks.append("sugar")

            actions.append(
                "Check sugar content because it is relevant to the patient's diabetes/dietary restriction."
            )

        # --------------------------------
        # 2. Hypertension investigation
        # --------------------------------

        if "hypertension" in conditions or "low sodium" in restrictions:

            relevant_checks.append("sodium")

            actions.append(
                "Check sodium content because it is relevant to the patient's hypertension/dietary restriction."
            )

        # --------------------------------
        # 3. Fat investigation
        # --------------------------------

        if "cardiovascular" in conditions:

            relevant_checks.append("fat")
            relevant_checks.append("saturated_fat")

            actions.append(
                "Check fat and saturated fat because cardiovascular considerations are relevant."
            )

        # --------------------------------
        # 4. Ingredient investigation
        # --------------------------------

        relevant_checks.append("ingredients")

        actions.append(
            "Inspect ingredients for potentially relevant dietary concerns."
        )

        # --------------------------------
        # 5. Serving size
        # --------------------------------

        relevant_checks.append("serving_size")

        actions.append(
            "Check serving size because nutrient values depend on the stated serving."
        )

        # --------------------------------
        # 6. Check uncertain information
        # --------------------------------

        for nutrient, value in confidence.items():

            if value < 0.80:

                uncertainties.append(
                    f"{nutrient} information has low OCR confidence ({value:.2f})."
                )

                actions.append(
                    f"Verify {nutrient} because the extracted value is uncertain."
                )

        # --------------------------------
        # 7. Medicine context
        # --------------------------------

        if medicines:

            actions.append(
                "Check whether a known food-medicine interaction is relevant."
            )

        # --------------------------------
        # Final investigation plan
        # --------------------------------

        return {
            "patient_conditions": patient.get("conditions", []),
            "food": food.get("product_name", "Unknown food"),
            "relevant_checks": relevant_checks,
            "uncertainties": uncertainties,
            "medicines_present": len(medicines) > 0,
            "actions": actions
        }