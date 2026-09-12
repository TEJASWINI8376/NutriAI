from pydantic import BaseModel
from typing import List, Dict, Optional


class PatientProfile(BaseModel):
    conditions: List[str]
    medicines: List[str]
    dietary_restrictions: List[str]
    test_values: Dict[str, float] = {}


class NutritionInfo(BaseModel):
    calories: Optional[float] = None
    sugar: Optional[float] = None
    sodium: Optional[float] = None
    fat: Optional[float] = None
    saturated_fat: Optional[float] = None
    carbohydrates: Optional[float] = None
    protein: Optional[float] = None


class FoodInfo(BaseModel):
    product_name: str
    nutrition: NutritionInfo
    ingredients: List[str]
    serving_size: Optional[str] = None
    confidence: Dict[str, float] = {}