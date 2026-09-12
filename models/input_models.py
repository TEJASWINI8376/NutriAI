from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from pydantic import field_validator


class PatientProfile(BaseModel):
    conditions: List[str]
    medicines: List[str]
    dietary_restrictions: List[str]
    test_values: Dict[str, float] = {}


class NutritionInfo(BaseModel):
    calories: Optional[float] = Field(None, ge=0)
    sugar: Optional[float] = Field(None, ge=0)
    sodium: Optional[float] = Field(None, ge=0)
    fat: Optional[float] = Field(None, ge=0)
    saturated_fat: Optional[float] = Field(None, ge=0)
    carbohydrates: Optional[float] = Field(None, ge=0)
    protein: Optional[float] = Field(None, ge=0)


class FoodInfo(BaseModel):
    product_name: str
    nutrition: NutritionInfo
    ingredients: List[str]
    serving_size: Optional[str] = None
    confidence: Dict[str, float] = Field(default_factory=dict)

    @field_validator("confidence")
    @classmethod
    def validate_confidence(cls, confidence):
        for field, value in confidence.items():
            if not 0 <= value <= 1:
                raise ValueError(
                    f"Confidence for {field} must be between 0 and 1."
                )
        return confidence