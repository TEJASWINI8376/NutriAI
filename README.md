# 🌿 NutriAI — Personalized Food & Health Intelligence

**NutriAI** is an AI-powered personalized nutrition assistant that helps users make informed food choices based on their individual health profile. Instead of generic dietary advice, NutriAI connects **patient health data with real-world food information** to provide a personalized, explainable **"Can I Eat This?"** assessment.

> Patients with diagnosed conditions (diabetes, hypertension, high cholesterol, etc.) often find packaged food labels confusing. NutriAI bridges that gap — instantly, transparently, and personally.

---

## ✨ Key Features

### 👤 Patient Health Profile
- Create a health profile by entering diagnosed conditions, medicines, and dietary restrictions
- Upload medical reports & prescriptions — AI (OCR) extracts relevant information
- User confirms extracted data before it is used in any analysis
- Profile persists across sessions and powers the AI decision engine

### 📷 Food Scanning & Analysis
- **Quick Scan** directly from the main dashboard — no extra navigation required
  - Prominent "Scan Food" card at the top of the dashboard
  - Floating AI bot button (bottom-right) for one-tap access from anywhere
- Scan food labels via **Camera** or **Upload an image**
- OCR extracts: ingredients, serving size, calories, sugar, sodium, fat, carbohydrates, protein
- Low-confidence fields are flagged for verification before use
- Switch between multiple scanned products in the product switcher

### 🤖 Agentic AI Decision Engine
- Combines verified patient profile + analyzed food data
- Investigates relevant factors, verifies uncertain information, applies evidence-based rules
- Checks food–medicine interactions where applicable
- Returns a clear **🟢 Suitable · 🟡 Use Caution · 🔴 Not Recommended** verdict
- Every decision includes a transparent explanation and supporting evidence

### 🏥 Patient Portal (Medical Dashboard)
- Full EHR-style dashboard with tabs: **Vitals & Metrics, Appointments, Medical Records, Medications Protocol, Care Team**
- Log vitals (heart rate, blood pressure, oxygen, glucose, temperature)
- Schedule and manage appointments
- Upload and manage medical records
- Track medication adherence
- HIPAA-compliant audit ledger

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ and npm
- A server-side `GEMINI_API_KEY` for Camera/Upload OCR (see `.env.example`)

### Run Locally

```sh
git clone https://github.com/TEJASWINI8376/NutriAI.git
cd NutriAI
npm install
npm run dev
```

The app will be available at **http://localhost:3000**.

### Render deployment — important

The food scanner intentionally uses **Open Food Facts as the primary source for barcode lookups** and **Gemini Vision as the OCR fallback for Camera/Upload scans**. A Camera/Upload scan without a barcode therefore needs a server-side Gemini API key.

If the deployed scanner shows:

```text
Food scanning requires a Gemini API key or a barcode found in Open Food Facts.
```

this means the deployed server does not have `GEMINI_API_KEY` available. The key must be configured in the hosting provider's **Environment Variables/Secrets**; it must **not** be committed to this repository.

For Render:
1. Open the NutriAI Web Service.
2. Open **Environment**.
3. Add `GEMINI_API_KEY` with your Google AI Studio/Gemini API key as the value.
4. Save the environment change and redeploy the service.
5. Open the deployed app and retry **Camera OCR → Analyze Panel**.

Barcode Search continues to work without Gemini when the product barcode exists in Open Food Facts.

> **Security:** Never paste a real API key into `.env.example`, source code, GitHub issues, or commits. Use the hosting provider's secret/environment-variable store.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19 · TypeScript · Tailwind CSS v4 · Lucide React · Motion |
| **Backend** | Express · Google GenAI (`@google/genai`) |
| **AI / OCR** | Gemini Vision API (food label & medical document OCR) |
| **Build** | Vite · esbuild |
| **Auth** | Salted scrypt password hashes · opaque session tokens |
| **Database** | SQLite (via `loginpage/server/db`) |

---

## 🤖 Agentic Pipeline

| Stage | Behavior |
|---|---|
| **Goal** | Understand the patient's health profile and the food question |
| **Plan** | Decide which patient, food, nutrition, ingredient, and evidence data is needed |
| **Act** | Use OCR, nutrition lookup, ingredient knowledge, and interaction tools |
| **Observe** | Inspect extracted data, source quality, and confidence scores |
| **Evaluate** | Detect missing, uncertain, or conflicting information |
| **Adapt** | Retry OCR, use another source, verify, or request clearer input |
| **Outcome** | Generate an explainable, evidence-backed dietary assessment |

---

## 🔐 Authentication

A dependency-free `AuthService` in `auth.js` handles account flows:

- Registers normalized email addresses with **salted scrypt** password hashes
- Creates **opaque, expiring session tokens** on login
- Rejects weak passwords, duplicate accounts, invalid credentials, and expired sessions

Run the auth tests with:

```bash
node --test auth.test.js
```

---

## 📁 Project Structure

```
NutriAI/
├── src/
│   ├── App.tsx                      # Root app — auth/journey/portal/food-analysis routing
│   ├── components/
│   │   ├── RetakeModal.tsx           # Food scanner (camera, upload, barcode, samples)
│   │   ├── Header.tsx                # Food analysis header
│   │   ├── ContextCard.tsx           # Product context card
│   │   ├── FieldCard.tsx             # Nutrition field display
│   │   ├── DecisionResultModal.tsx   # "Can I Eat This?" result
│   │   └── ...
│   └── agent/
│       ├── pipeline.ts               # Agentic pipeline orchestration
│       ├── investigator.ts           # Evidence investigation
│       └── explanation.ts            # Decision explanation generation
├── loginpage/src/components/
│   ├── PatientPortal.tsx             # Main patient dashboard (Quick Scan card + floating bot)
│   ├── AuthScreen.tsx                # Login / registration
│   ├── VitalsModule.tsx              # Vitals tab
│   ├── AppointmentsModule.tsx        # Appointments tab
│   ├── RecordsModule.tsx             # Medical records tab
│   ├── MedicationsModule.tsx         # Medications tab
│   └── CareTeamModule.tsx            # Care team tab
└── server.ts                         # Express server + Vite SSR + API routes
```

---

**NutriAI: Know your health. Understand your food. Make informed choices.**
