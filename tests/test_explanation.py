from agent.investigator import AgentInvestigator
from verification.food_verifier import FoodVerifier
from rules.rule_engine import RuleEngine
from agent.explanation import ExplanationGenerator

from models.test_data import patient, food


# 1. Agent investigation
agent = AgentInvestigator()

investigation = agent.investigate(
    patient,
    food
)


# 2. Verification
verifier = FoodVerifier()

verification = verifier.verify(
    food,
    investigation
)


# 3. Rule Engine
rule_engine = RuleEngine()

rule_result = rule_engine.assess(
    patient,
    verification
)


# 4. Explanation
explainer = ExplanationGenerator()

final_result = explainer.generate(
    patient,
    food,
    verification,
    rule_result
)


print("\n========== NUTRIAI RESULT ==========\n")

print("Food:")
print(final_result["food"])

print("\nCan I Eat This?")
print(final_result["decision_text"])

print("\nWhy?")

for reason in final_result["reasons"]:
    print("•", reason)

print("\nRules Applied:")

for rule in final_result["rules_applied"]:
    print("✓", rule)

print("\nVerification:")

for note in final_result["verification_notes"]:
    print("⚠", note)

print("\nEvidence:")

for item in final_result["evidence"]:
    print(f"• {item['title']}")
    print(f"  Source: {item['source']}")
    print(f"  {item['description']}")

print("\nDisclaimer:")
print(final_result["disclaimer"])