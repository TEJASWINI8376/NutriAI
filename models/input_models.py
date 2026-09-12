from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from pydantic import field_validator


class PatientProfile(BaseModel):
    conditions: List[str] = Field(default_factory=list)
    medicines: List[str] = Field(default_factory=list)
    dietary_restrictions: List[str] = Field(default_factory=list)
    test_values: Dict[str, float] = Field(default_factory=dict)

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
    calories: Optional[float] = Field(None, ge=0)
    sugar: Optional[float] = Field(None, ge=0)
    sodium: Optional[float] = Field(None, ge=0)
    fat: Optional[float] = Field(None, ge=0)
    saturated_fat: Optional[float] = Field(None, ge=0)
    carbohydrates: Optional[float] = Field(None, ge=0)
    protein: Optional[float] = Field(None, ge=0)


class FoodInfo(BaseModel):
    product_name: str = Field(..., min_length=1)
    nutrition: NutritionInfo
    ingredients: List[str] = Field(..., min_length=1)
    serving_size: Optional[str] = Field( None,min_length=1 )
    confidence: Dict[str, float] = Field(default_factory=dict)

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