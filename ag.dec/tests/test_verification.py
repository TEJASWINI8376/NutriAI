from agent.investigator import AgentInvestigator
from verification.food_verifier import FoodVerifier
from models.test_data import patient, food


# Step 1: Agent investigates
agent = AgentInvestigator()

investigation = agent.investigate(
    patient,
    food
)


# Step 2: Agent sends uncertain information for verification
verifier = FoodVerifier()

verification = verifier.verify(
    food,
    investigation
)


print("\n========== VERIFICATION ==========\n")

print("Verification Status:")
print(verification["verification_status"])


print("\nVerified Fields:")

for field in verification["verified_fields"]:
    print("✓", field)


print("\nConflicts:")

for conflict in verification["conflicts"]:
    print(
        f"⚠ {conflict['field']}: "
        f"OCR={conflict['ocr_value']} → "
        f"Verified={conflict['verified_value']}"
    )


print("\nVerification Actions:")

for action in verification["verification_actions"]:
    print("→", action)


print("\nFinal Verified Nutrition:")
print(verification["verified_nutrition"])
