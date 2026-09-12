export interface EvidenceEntry {
  title: string;
  source: string;
  url: string;
  description: string;
}

export const EVIDENCE: Record<string, EvidenceEntry> = {
  diabetes_sugar_rule: {
    title: 'Diabetes and sugar/carbohydrates',
    source: 'CDC',
    url: 'https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html',
    description:
      'CDC guidance recommends meal planning that considers carbohydrates and fewer added sugars for people managing diabetes.',
  },

  hypertension_sodium_rule: {
    title: 'Hypertension and sodium',
    source: 'American Heart Association',
    url: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sodium/how-much-sodium-should-i-eat-per-day',
    description:
      'The American Heart Association recommends limiting sodium intake and emphasizes checking nutrition labels and serving sizes.',
  },

  cardiovascular_saturated_fat_rule: {
    title: 'Cardiovascular health and saturated fat',
    source: 'American Heart Association',
    url: 'https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/fats/saturated-fats',
    description:
      'The American Heart Association recommends limiting saturated fat as part of an overall heart-healthy dietary pattern.',
  },

  medicine_food_interaction_rule: {
    title: 'Food–medicine interactions',
    source: 'FDA',
    url: 'https://www.fda.gov/consumers/consumer-updates/grapefruit-juice-and-some-drugs-dont-mix',
    description:
      'Certain foods can interact with medicines, affecting how the medicine works or increasing side effects.',
  },
};
