from main import NutriAIDecisionPipeline
from models.test_data import patient, food


pipeline = NutriAIDecisionPipeline()

result = pipeline.process(
    patient,
    food
)


print("\n")
print("========================================")
print("          NUTRIAI DECISION")
print("========================================")

print("\nFood:")
print(result["food"])

print("\nCan I Eat This?")
print(result["decision_text"])

print("\nWhy?")

for reason in result["reasons"]:
    print("•", reason)


print("\nVerification:")

for note in result["verification_notes"]:
    print("⚠", note)


print("\nEvidence:")

for evidence in result["evidence"]:
    print("•", evidence["title"])
    print(" ", evidence["source"])


print("\nAgent Timeline:")

for step in result["agent_timeline"]:

    print(
        f"→ {step['step']}: {step['status']}"
    )


print("\n========================================")


from main import NutriAIDecisionPipeline


def test_medicine_interaction_pipeline():

    patient = {
        "conditions": [],
        "medicines": ["warfarin"],
        "dietary_restrictions": [],
        "test_values": {}
    }

    food = {
        "product_name": "Test Food",
        "nutrition": {
            "calories": 100,
            "sugar": 5,
            "sodium": 100,
            "fat": 3,
            "saturated_fat": 1,
            "carbohydrates": 10,
            "protein": 2
        },
        "ingredients": ["vitamin k rich foods"],
        "serving_size": "50 g",
        "confidence": {}
    }

    pipeline = NutriAIDecisionPipeline()
    result = pipeline.process(patient, food)

    assert result["medicine_context"]["medicine_checks_relevant"] is True

    assert len(
        result["medicine_context"]["possible_interactions"]
    ) > 0

    assert "medicine_food_interaction_rule" in result["rules_applied"]

    assert result["decision"] == "CONSUME_WITH_CAUTION"

    print("Medicine interaction pipeline test passed.")


if __name__ == "__main__":
    test_medicine_interaction_pipeline()