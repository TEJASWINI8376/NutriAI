from agent.investigator import AgentInvestigator
from models.test_data import patient, food


agent = AgentInvestigator()

result = agent.investigate(patient, food)

print("\n========== AGENT INVESTIGATION ==========\n")

print("Patient:")
print(result["patient_conditions"])

print("\nFood:")
print(result["food"])

print("\nRelevant Checks:")
for check in result["relevant_checks"]:
    print("✓", check)

print("\nUncertainties:")
for uncertainty in result["uncertainties"]:
    print("⚠", uncertainty)

print("\nAgent Actions:")
for action in result["actions"]:
    print("→", action)