# 🌿 NutriAgent

**Upgraded Agentic AI Project Plan — Tech Zephyr 4.0**

> An agentic AI dietary decision-support system that creates a patient's health profile from existing medical information, analyzes packaged food, verifies uncertain information, and explains whether the food is generally suitable for that patient.

---

## 1. Problem

Patients who already have diagnosed conditions such as **diabetes, hypertension, high cholesterol, or cardiovascular conditions** often receive dietary advice from doctors, but still find it difficult to decide whether a particular packaged food is appropriate for them.

Food labels can contain complicated serving sizes, sugars, sodium, carbohydrates, fats, and unfamiliar ingredients. Patients may also have **medicines or dietary restrictions** that need to be considered.

---

## 2. Proposed Solution

The patient creates a **personalized health profile** by uploading existing medical reports and prescriptions, or by entering their known diagnosed conditions and dietary restrictions.

The patient can then **scan or upload a packaged-food label**. NutriAgent:

1. **Extracts** the ingredients and nutrition information
2. **Verifies** important information using trusted sources
3. **Checks** relevant food–medicine interactions where applicable
4. **Passes** verified information to a transparent rule-based assessment engine

---

## 3. What Makes It Agentic?

| Stage | Agent Behavior |
|---|---|
| **Goal** | Understand the patient's health profile and the food-related question |
| **Plan** | Decide which patient, food, nutrition, ingredient, and evidence information is required |
| **Act** | Select and use medical-report, OCR, nutrition, ingredient, interaction, and evidence tools |
| **Observe** | Inspect extracted information, source quality, and confidence |
| **Evaluate** | Detect missing, uncertain, or conflicting information |
| **Adapt** | Retry OCR, use another source, verify information, or ask the patient for clearer input |
| **Outcome** | Generate an explainable, evidence-backed dietary assessment |

---

## 4. Patient Health Profile

The patient can provide information in two ways:

1. **Upload** existing medical reports and prescriptions
2. **Manually enter** known diagnosed conditions and dietary restrictions

AI extracts relevant information from uploaded documents, and the patient confirms the extracted information before it is used.

**Example profile:**

- 🩺 **Conditions:** Diabetes, Hypertension
- 💊 **Medicines:** Prescribed medicines entered or extracted from prescription
- 🥗 **Dietary restrictions:** Low sugar, Low sodium
- 📊 **Relevant test values:** Extracted when clearly available

---

## 5. Main Tools

| Tool | Purpose |
|---|---|
| **Medical Report OCR / Document AI** | Extract relevant health information from uploaded reports |
| **Prescription Extraction** | Identify prescribed medicines and relevant details |
| **Food OCR** | Extract nutrition and ingredient information from food labels |
| **Nutrition Lookup** | Retrieve or verify product nutrition data |
| **Ingredient Knowledge** | Identify and explain unfamiliar or relevant ingredients |
| **Food–Medicine Interaction** | Check only known, evidence-backed interactions when applicable |
| **Evidence Retrieval** | Retrieve information from curated authoritative sources |
| **Verification** | Compare information and detect conflicts or uncertainty |
| **Rule Engine** | Apply documented evidence-based dietary rules |

---

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Getting Started

```sh
git clone https://github.com/TEJASWINI8376/NutriAI.git
cd NutriAI
npm i
npm run dev
```

---

## Tech Stack

- **Frontend:** React 19 · TypeScript · Tailwind CSS v4 · Motion
- **Backend:** Express · Google GenAI
- **Build:** Vite
