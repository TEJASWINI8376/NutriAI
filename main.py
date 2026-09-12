from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import HTMLResponse

from models.input_models import (
    PatientProfile,
    FoodInfo,
    DecisionResponse
)

from agent.investigator import AgentInvestigator
from verification.food_verifier import FoodVerifier
from rules.rule_engine import RuleEngine
from agent.explanation import ExplanationGenerator
from agent.medicine_context import MedicineContextChecker


class NutriAIDecisionPipeline:

    def __init__(self):
        self.agent = AgentInvestigator()
        self.verifier = FoodVerifier()
        self.rule_engine = RuleEngine()
        self.explainer = ExplanationGenerator()
        self.medicine_checker = MedicineContextChecker()

    def process(self, patient, food):

        investigation = self.agent.investigate(
            patient,
            food
        )

        verification = self.verifier.verify(
            food,
            investigation
        )

        medicine_result = self.medicine_checker.check(
            patient.get("medicines", []),
            verification.get("ingredients", [])
        )

        rule_result = self.rule_engine.assess(
            patient,
            verification,
            medicine_result
        )

        final_result = self.explainer.generate(
            patient,
            food,
            verification,
            rule_result,
            medicine_result
        )

        final_result["agent_timeline"] = [
            {
                "step": "Agent Investigation",
                "status": "completed",
                "details": investigation["actions"]
            },
            {
                "step": "Information Verification",
                "status": verification["verification_status"],
                "details": verification["verification_actions"]
            },
            {
                "step": "Medicine Context Check",
                "status": "completed",
                "details": (
                    medicine_result["medicines_checked"]
                    if medicine_result["medicines_checked"]
                    else [
                        "No known medicine-food interaction check was triggered."
                    ]
                )
            },
            {
                "step": "Rule-Based Assessment",
                "status": "completed",
                "details": rule_result["rules_applied"]
            },
            {
                "step": "Final Decision",
                "status": "completed",
                "details": [final_result["decision_text"]]
            }
        ]

        final_result["medicine_context"] = medicine_result

        return final_result


app = FastAPI(
    title="NutriAI Agent Decision API",
    description="Agentic food suitability decision support system",
    version="1.0.0",
    docs_url=None
)


pipeline = NutriAIDecisionPipeline()


@app.get("/")
def home():
    return {
        "message": "NutriAI Agent Decision API is running"
    }


@app.post(
    "/can-i-eat",
    response_model=DecisionResponse
)
def can_i_eat(
    patient: PatientProfile,
    food: FoodInfo
):
    result = pipeline.process(
        patient.model_dump(),
        food.model_dump()
    )

    return result


@app.get("/docs", include_in_schema=False)
def custom_swagger_docs():

    html = get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title="NutriAI Agent Decision API - Features"
    )

    html_content = html.body.decode("utf-8")

    custom_script = """
    <script>
        const observer = new MutationObserver(() => {
            document.querySelectorAll("*").forEach(element => {
                if (
                    element.childNodes.length === 1 &&
                    element.textContent.trim() === "Schemas"
                ) {
                    element.textContent = "Features";
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    </script>
    """

    html_content = html_content.replace(
        "</body>",
        custom_script + "</body>"
    )

    return HTMLResponse(content=html_content)