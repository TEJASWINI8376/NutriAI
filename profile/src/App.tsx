import React, { useState } from 'react';
import { Navbar, ScreenId } from './components/Navbar';
import { DashboardScreen } from './components/DashboardScreen';
import { MealScannerScreen } from './components/MealScannerScreen';
import { MedicationTimelineScreen } from './components/MedicationTimelineScreen';
import { DietPlansScreen } from './components/DietPlansScreen';
import { ClinicalAdvisorScreen } from './components/ClinicalAdvisorScreen';
import { PatientRecordsScreen } from './components/PatientRecordsScreen';
import { NutriAILogo } from './components/NutriAILogo';
import {
  initialPatientProfile,
  initialVitals,
  initialLoggedMeals,
  initialMedications,
  initialDietPlans,
  initialLabBiomarkers,
} from './data/mockData';
import { LoggedMeal, MedicationItem, PatientProfile } from './types';
import { ShieldCheck, Heart, Sparkles, ExternalLink } from 'lucide-react';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [patient, setPatient] = useState<PatientProfile>(initialPatientProfile);
  const [vitals, setVitals] = useState(initialVitals);
  const [loggedMeals, setLoggedMeals] = useState<LoggedMeal[]>(initialLoggedMeals);
  const [medications, setMedications] = useState<MedicationItem[]>(initialMedications);
  const [plans, setPlans] = useState(initialDietPlans);
  const [labBiomarkers, setLabBiomarkers] = useState(initialLabBiomarkers);

  // When a meal is logged, update meals and reflect in vitals
  const handleAddMeal = (meal: LoggedMeal) => {
    const updatedMeals = [meal, ...loggedMeals];
    setLoggedMeals(updatedMeals);

    // Recalculate total calories
    const totalCal = updatedMeals.reduce((acc, m) => acc + m.calories, 0);

    setVitals((prev) =>
      prev.map((v) => {
        if (v.id === 'vital-cal') {
          return {
            ...v,
            value: `${totalCal} / ${patient.calorieTarget}`,
            trendLabel: `${Math.round((totalCal / patient.calorieTarget) * 100)}% of daily target`,
          };
        }
        if (v.id === 'vital-gsi') {
          return {
            ...v,
            value: 96,
            trendLabel: '+2 pts after low-GI meal',
          };
        }
        return v;
      })
    );
  };

  // Toggle medication adherence
  const handleToggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m))
    );
  };

  const handleAddMedication = (item: MedicationItem) => {
    setMedications((prev) => [...prev, item]);
  };

  const pendingMedsCount = medications.filter((m) => !m.taken).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0B1C30]">
      {/* Sticky Top Header Navigation */}
      <Navbar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        patient={patient}
        onOpenQuickScan={() => setActiveScreen('scanner')}
        pendingMedsCount={pendingMedsCount}
      />

      {/* Main Screen Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeScreen === 'dashboard' && (
          <DashboardScreen
            patient={patient}
            vitals={vitals}
            loggedMeals={loggedMeals}
            medications={medications}
            onNavigate={setActiveScreen}
            onOpenQuickScan={() => setActiveScreen('scanner')}
            onToggleMedication={handleToggleMedication}
          />
        )}

        {activeScreen === 'scanner' && (
          <MealScannerScreen
            patient={patient}
            onAddMeal={handleAddMeal}
            onViewDashboard={() => setActiveScreen('dashboard')}
          />
        )}

        {activeScreen === 'medications' && (
          <MedicationTimelineScreen
            medications={medications}
            patient={patient}
            onToggleMedication={handleToggleMedication}
            onAddMedication={handleAddMedication}
          />
        )}

        {activeScreen === 'diet-plans' && (
          <DietPlansScreen
            plans={plans}
            patient={patient}
            onAddMeal={handleAddMeal}
          />
        )}

        {activeScreen === 'advisor' && (
          <ClinicalAdvisorScreen patient={patient} />
        )}

        {activeScreen === 'records' && (
          <PatientRecordsScreen
            patient={patient}
            labBiomarkers={labBiomarkers}
            onUpdatePatient={setPatient}
          />
        )}
      </main>

      {/* Clinical Footer */}
      <footer className="bg-white border-t border-[#E2E8F0] py-8 px-4 sm:px-6 mt-12 text-xs text-[#64748B]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <NutriAILogo size="sm" />
            <span className="text-xs text-[#64748B]">
              CarePulse Clinical Intelligence System • Certified Metabolic Architecture
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-[#047857] font-semibold bg-[#ECFDF5] px-2.5 py-1 rounded-full border border-[#A7F3D0]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              HIPAA & Clinical Standards Aligned
            </span>
            <span>Gemini 3.8 Flash Core</span>
            <span>Patient ID: {patient.id}</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-4 pt-4 border-t border-[#F1F5F9] text-center text-[11px] text-[#94A3B8]">
          NutriAI CarePulse is an auxiliary diagnostic & medical nutrition platform. Nutritional advice, glycemic estimations, and drug-nutrient warnings are designed to assist healthcare compliance under professional guidance.
        </div>
      </footer>
    </div>
  );
}
