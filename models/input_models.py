from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from pydantic import field_validator


class PatientProfile(BaseModel):
    conditions: List[str] = Field(
        default_factory=list,
        description="Patient's known health conditions relevant to dietary decisions."
    )

    medicines: List[str] = Field(
        default_factory=list,
        description="Medicines currently taken by the patient."
    )

    dietary_restrictions: List[str] = Field(
        default_factory=list,
        description="Patient's dietary restrictions or preferences relevant to the decision."
    )

    test_values: Dict[str, float] = Field(
        default_factory=dict,
        description="Relevant patient test values provided as name-value pairs."
    )

    @field_validator(
        "conditions",
        "medicines",
        "dietary_restrictions"
    )
    @classmethod
    def validate_text_lists(cls, values):
        for value in values:
            if not value.strip():
                raise ValueError("List items cannot be empty.")
        return values


class NutritionInfo(BaseModel):
    calories: Optional[float] = Field(
        None,
        ge=0,
        description="Calories per serving."
    )

    sugar: Optional[float] = Field(
        None,
        ge=0,
        description="Sugar in grams per serving."
    )

    sodium: Optional[float] = Field(
        None,
        ge=0,
        description="Sodium in milligrams per serving."
    )

    fat: Optional[float] = Field(
        None,
        ge=0,
        description="Total fat in grams per serving."
    )

    saturated_fat: Optional[float] = Field(
        None,
        ge=0,
        description="Saturated fat in grams per serving."
    )

    carbohydrates: Optional[float] = Field(
        None,
        ge=0,
        description="Carbohydrates in grams per serving."
    )

    protein: Optional[float] = Field(
        None,
        ge=0,
        description="Protein in grams per serving."
    )


class FoodInfo(BaseModel):
    product_name: str = Field(
        ...,
        min_length=1,
        description="Name of the packaged food product."
    )

    nutrition: NutritionInfo = Field(
        ...,
        description="Nutrition values extracted from the food label."
    )

    ingredients: List[str] = Field(
        ...,
        min_length=1,
        description="List of ingredients extracted from the food label."
    )

    serving_size: Optional[str] = Field(
        None,
        min_length=1,
        description="Serving size stated on the food label."
    )

    confidence: Dict[str, float] = Field(
        default_factory=dict,
        description="OCR confidence scores for extracted food-label fields, from 0 to 1."
    )

    @field_validator("confidence")
    @classmethod
    def validate_confidence(cls, confidence):
        for field, value in confidence.items():
            if not field.strip():
                raise ValueError("Confidence field name cannot be empty.")

            if not 0 <= value <= 1:
                raise ValueError(
                    f"Confidence for {field} must be between 0 and 1."
                )

        return confidence

class DecisionResponse(BaseModel):
    food: str
    decision: str
    decision_text: str

    reasons: List[str] = Field(
        default_factory=list,
        description="Reasons supporting the final food suitability decision."
    )

    rules_applied: List[str] = Field(
        default_factory=list,
        description="Rule-engine rules applied during the assessment."
    )

    verification_notes: List[str] = Field(
        default_factory=list,
        description="Notes about uncertain information and verification actions."
    )

    medicine_notes: List[str] = Field(
        default_factory=list,
        description="Notes about relevant food-medicine interaction checks."
    )

    evidence: List[Dict] = Field(
        default_factory=list,
        description="Evidence and authoritative sources supporting the applied rules."
    )

    disclaimer: str = Field(
        default="This is dietary decision support and does not diagnose disease or replace advice from a healthcare professional.",
        description="Safety disclaimer for the decision-support output."
    )

    agent_timeline: List[Dict] = Field(
        default_factory=list,
        description="Timeline showing the major agent investigation and decision steps."
    )

    medicine_context: Dict = Field(
        default_factory=dict,
        description="Details of the medicine-food interaction check."
    )