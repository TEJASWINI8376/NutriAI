class MedicineContextChecker:

    # Prototype interaction data.
    # Only established examples should be added here.
    KNOWN_INTERACTIONS = {
        "warfarin": ["vitamin k rich foods"],
        "levothyroxine": ["calcium", "iron"],
    }

    def check(self, medicines, ingredients):
        medicines_lower = [medicine.lower() for medicine in medicines]
        ingredients_lower = [ingredient.lower() for ingredient in ingredients]

        relevant_checks = []
        possible_interactions = []

        for medicine in medicines_lower:

            if medicine in self.KNOWN_INTERACTIONS:
                relevant_checks.append(medicine)

                for food_item in self.KNOWN_INTERACTIONS[medicine]:

                    for ingredient in ingredients_lower:
                        if food_item in ingredient:
                            possible_interactions.append({
                                "medicine": medicine,
                                "food_component": food_item,
                                "message": (
                                    f"A known food-medicine interaction "
                                    f"may be relevant for {medicine} and "
                                    f"{food_item}."
                                )
                            })

        return {
            "medicine_checks_relevant": len(relevant_checks) > 0,
            "medicines_checked": relevant_checks,
            "possible_interactions": possible_interactions
        }