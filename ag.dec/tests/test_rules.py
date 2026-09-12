from agent.investigator import AgentInvestigator
from verification.food_verifier import FoodVerifier
from rules.rule_engine import RuleEngine

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

result = rule_engine.assess(
    patient,
    verification
)


print("\n========== RULE ENGINE ==========\n")

print("Decision:")
print(result["decision"])


print("\nRules Applied:")

for rule in result["rules_applied"]:
    print("✓", rule)


print("\nConcerns:")

for concern in result["concerns"]:
    print("⚠", concern["message"])