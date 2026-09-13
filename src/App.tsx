import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Crop,
  CheckCircle,
  RefreshCw,
  Sparkles,
  HeartPulse,
  Pill,
  Activity,
  Loader2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';
import { Header } from './components/Header';
import { ContextCard } from './components/ContextCard';
import { AlertBanner } from './components/AlertBanner';
import { SodiumFieldCard } from './components/SodiumFieldCard';
import { FieldCard } from './components/FieldCard';
import { OcrScoreCard } from './components/OcrScoreCard';
import { EditFieldModal } from './components/EditFieldModal';
import { RetakeModal } from './components/RetakeModal';
import { HistoryModal } from './components/HistoryModal';
import { ClinicalInfoModal } from './components/ClinicalInfoModal';
import { ImagePreviewModal } from './components/ImagePreviewModal';
import { PatientProfileModal } from './components/PatientProfileModal';
import { DecisionResultModal } from './components/DecisionResultModal';
import { AuthScreen } from '../loginpage/src/components/AuthScreen';
import { PatientPortal } from '../loginpage/src/components/PatientPortal';
import type { User } from '../loginpage/src/types';
import { InspectionProduct, NutritionField, PatientProfile, DecisionResult } from './types';

export default function App() {
  const [products, setProducts] = useState<InspectionProduct[]>([]);
  const [activeProduct, setActiveProduct] = useState<InspectionProduct | null>(null);
  const [session, setSession] = useState(() => localStorage.getItem('nutriai.session'));
  const [authenticatedUser, setAuthenticatedUser] = useState<User | null>(() => {
    const email = localStorage.getItem('nutriai.session');
    return email
      ? {
          id: email,
          name: email.split('@')[0],
          email,
          phone: '',
          role: 'patient',
          mrn: 'NUTRIAI-PATIENT',
          createdAt: new Date().toISOString(),
        }
      : null;
  });
  const [showFoodAnalysis, setShowFoodAnalysis] = useState(false);
  const [hasProfile, setHasProfile] = useState(() => localStorage.getItem('nutriai.profile') === 'complete');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [editingField, setEditingField] = useState<NutritionField | null>(null);

  // Patient Health Profile state
  const [patientProfile, setPatientProfile] = useState<PatientProfile>({
    conditions: [],
    medicines: [],
    dietaryRestrictions: [],
  });

  // Agent Decision state
  const [decisionResult, setDecisionResult] = useState<DecisionResult | null>(null);
  const [isAnalyzingDecision, setIsAnalyzingDecision] = useState(false);

  // Modals state
  const [isRetakeOpen, setIsRetakeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isClinicalInfoOpen, setIsClinicalInfoOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDecisionOpen, setIsDecisionOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    subtitle: string;
  }>({
    show: false,
    title: 'Verification Stored',
    subtitle: 'Updating health analysis profile...',
  });

  // Fetch initial products from backend API
  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
          // Find matching active product or set first
          const found = data.products.find((p: InspectionProduct) => p.id === activeProduct?.id);
          if (found) setActiveProduct(found);
          else setActiveProduct(data.products[0]);
        }
      })
      .catch((err) => {
        console.log('Using local products cache:', err);
      });
  }, []);

  const triggerToast = (title = 'Verification Stored', subtitle = 'Updating health analysis profile...') => {
    setToast({ show: true, title, subtitle });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // Verify Sodium Field handler
  const handleVerifySodium = async (verifiedValue: string) => {
    if (!activeProduct) return;
    const sodiumField = activeProduct.fields.find((f) => f.key === 'sodium');
    if (!sodiumField) return;

    // Optimistic UI update
    const updatedFields = activeProduct.fields.map((f) => {
      if (f.id === sodiumField.id) {
        return {
          ...f,
          value: verifiedValue,
          confirmed: true,
          isActionRequired: false,
          confidence: 99,
        };
      }
      return f;
    });

    const updatedProduct: InspectionProduct = {
      ...activeProduct,
      fields: updatedFields,
      alertTitle: undefined,
      alertBadge: undefined,
      alertDescription: undefined,
      aggregateScore: 98.6,
    };

    setActiveProduct(updatedProduct);
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    triggerToast('Sodium Verified', `Reconciled as ${verifiedValue}mg (optimal confidence)`);

    // Sync with backend API
    try {
      await fetch(`/api/products/${activeProduct.id}/fields/${sodiumField.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          value: verifiedValue,
          confirmed: true,
        }),
      });
    } catch (err) {
      console.warn('Backend sync deferred:', err);
    }
  };

  // Save edited field handler
  const handleSaveField = async (fieldId: string, updates: Partial<NutritionField>) => {
    if (!activeProduct) return;
    const updatedFields = activeProduct.fields.map((f) => {
      if (f.id === fieldId) {
        return { ...f, ...updates };
      }
      return f;
    });

    const updatedProduct = {
      ...activeProduct,
      fields: updatedFields,
    };

    setActiveProduct(updatedProduct);
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    triggerToast('Field Updated', 'Clinical data manually recalibrated.');

    try {
      await fetch(`/api/products/${activeProduct.id}/fields/${fieldId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.warn('Field update error:', err);
    }
  };

  // Confirm entire food inspection
  const handleConfirmAll = async () => {
    if (!activeProduct) return;
    // Mark all fields confirmed
    const updatedFields = activeProduct.fields.map((f) => ({
      ...f,
      confirmed: true,
      isActionRequired: false,
    }));

    const updatedProduct: InspectionProduct = {
      ...activeProduct,
      fields: updatedFields,
      status: 'confirmed',
      confirmedAt: new Date().toISOString(),
      alertTitle: undefined,
      alertBadge: undefined,
      alertDescription: undefined,
      aggregateScore: Math.max(activeProduct.aggregateScore, 98.5),
    };

    setActiveProduct(updatedProduct);
    setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p)));
    triggerToast('Verification Stored', 'Updating health analysis profile...');

    try {
      await fetch('/api/products/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: activeProduct.id }),
      });
    } catch (err) {
      console.warn('Confirm sync error:', err);
    }
  };

  // New product scanned from camera/upload
  const handleProductScanned = (scannedProduct: InspectionProduct) => {
    setProducts((prev) => [scannedProduct, ...prev.filter((p) => p.id !== scannedProduct.id)]);
    setActiveProduct(scannedProduct);
    setDecisionResult(null);
    triggerToast('New Panel Scanned', `Processed ${scannedProduct.title} via OCR`);
  };

  // Run Agentic AI Decision
  const handleRunAgentDecision = async () => {
    if (!activeProduct) return;
    setIsAnalyzingDecision(true);
    try {
      const res = await fetch('/api/can-i-eat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: activeProduct.id,
          barcode: activeProduct.barcode,
          food: {
            product_name: activeProduct.title,
            barcode: activeProduct.barcode,
            ingredients: activeProduct.ingredientsText?.split(/[,;]+/).map((item) => item.trim()).filter(Boolean) || [],
            serving_size: activeProduct.fields.find((field) => field.key === 'serving_size')?.value,
            nutrition: Object.fromEntries(
              activeProduct.fields
                .filter((field) => ['calories', 'sugars', 'sodium', 'fat', 'saturated_fat', 'carbohydrates', 'protein'].includes(field.key))
                .map((field) => [field.key, Number.parseFloat(field.value) || 0]),
            ),
            confidence: Object.fromEntries(activeProduct.fields.map((field) => [field.key, field.confidence / 100])),
          },
          patient: patientProfile,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setDecisionResult(data.result);
        setIsDecisionOpen(true);
        triggerToast('Agent Analysis Complete', `Decision: ${data.result.decision.replace(/_/g, ' ')}`);
      } else {
        triggerToast('Analysis Failed', data.error || 'Please try again.');
      }
    } catch (err: any) {
      console.error('Agent decision fetch failed:', err);
      triggerToast('Network Error', 'Could not complete agent analysis.');
    } finally {
      setIsAnalyzingDecision(false);
    }
  };

  const handleSaveProfile = (updated: PatientProfile) => {
    setPatientProfile(updated);
    setDecisionResult(null); // invalidate previous decision since patient profile changed
    triggerToast('Profile Updated', 'Health context updated for agent analysis.');
  };

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    if (!loginEmail.trim() || loginPassword.length < 8) return;
    localStorage.setItem('nutriai.session', loginEmail.trim().toLowerCase());
    setSession(loginEmail.trim().toLowerCase());
  };

  const handleProfileSetup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const updatedProfile: PatientProfile = {
      conditions: String(formData.get('conditions') || '').split(',').map((item) => item.trim()).filter(Boolean),
      medicines: String(formData.get('medicines') || '').split(',').map((item) => item.trim()).filter(Boolean),
      dietaryRestrictions: String(formData.get('restrictions') || '').split(',').map((item) => item.trim()).filter(Boolean),
    };
    setPatientProfile(updatedProfile);
    localStorage.setItem('nutriai.profile', 'complete');
    setHasProfile(true);
  };

  if (!session) {
    return (
      <AuthScreen
        onSuccess={(user) => {
          localStorage.setItem('nutriai.session', user.email);
          setAuthenticatedUser(user);
          setSession(user.email);
        }}
        showToast={(message) => triggerToast(message, 'Clinical gateway updated.')}
      />
    );
  }

  if (!showFoodAnalysis && authenticatedUser) {
    return (
      <PatientPortal
        user={authenticatedUser}
        onLogout={() => {
          localStorage.removeItem('nutriai.session');
          localStorage.removeItem('nutriai_auth_token');
          setAuthenticatedUser(null);
          setSession(null);
        }}
        onOpenFoodAnalysis={() => setShowFoodAnalysis(true)}
        showToast={(message) => triggerToast(message, 'Clinical gateway updated.')}
      />
    );
  }

  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex items-center justify-center px-4">
        <form onSubmit={handleProfileSetup} className="w-full max-w-lg bg-white border border-[#eaedff] rounded-2xl p-7 shadow-sm">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-[#006948]">Step 2 of 2</p>
          <h1 className="text-3xl font-bold mt-2">Create your health profile</h1>
          <p className="text-sm text-[#3d4a42] mt-2 mb-7">Add only information you want NutriAI to use for personalized food decisions.</p>
          <label className="block text-sm font-semibold mb-2" htmlFor="conditions">Conditions</label>
          <input id="conditions" name="conditions" placeholder="For example: diabetes, hypertension" className="w-full h-11 px-3 rounded-xl border border-[#dfe5e1] mb-4 outline-none focus:border-[#006948]" />
          <label className="block text-sm font-semibold mb-2" htmlFor="medicines">Medicines</label>
          <input id="medicines" name="medicines" placeholder="For example: metformin" className="w-full h-11 px-3 rounded-xl border border-[#dfe5e1] mb-4 outline-none focus:border-[#006948]" />
          <label className="block text-sm font-semibold mb-2" htmlFor="restrictions">Dietary restrictions</label>
          <input id="restrictions" name="restrictions" placeholder="For example: low sodium, low sugar" className="w-full h-11 px-3 rounded-xl border border-[#dfe5e1] mb-6 outline-none focus:border-[#006948]" />
          <button type="submit" className="w-full h-12 rounded-xl bg-[#006948] text-white font-bold">Open dashboard</button>
        </form>
      </div>
    );
  }

  if (!activeProduct) {
    return (
      <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-white border border-[#eaedff] rounded-2xl p-8 text-center shadow-sm">
          <HeartPulse className="w-10 h-10 text-[#006948] mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Your dashboard is ready</h1>
          <p className="text-sm text-[#3d4a42] mt-2 mb-6">Scan a food label to begin your first personalized analysis. No sample products are loaded.</p>
          <button type="button" onClick={() => setIsRetakeOpen(true)} className="h-12 px-6 rounded-xl bg-[#006948] text-white font-bold">Scan a food label</button>
          <RetakeModal isOpen={isRetakeOpen} onClose={() => setIsRetakeOpen(false)} onProductScanned={handleProductScanned} />
        </div>
      </div>
    );
  }

  const hasUnconfirmedItems = activeProduct.fields.some((f) => !f.confirmed);

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col antialiased">
      {/* Top Header */}
      <Header
        onBack={() => {
          setShowFoodAnalysis(false);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={products.length}
        onOpenProfile={() => setIsProfileOpen(true)}
        profileConditionsCount={patientProfile.conditions.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-12 bg-[#faf8ff]">
        <div className="flex flex-col w-full max-w-xl mx-auto px-4 pb-12">
          {/* Active Patient Health Profile Bar */}
          <div className="mb-4 mt-2 p-3.5 bg-white rounded-2xl border border-[#eaedff] shadow-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#006948]/10 text-[#006948] flex items-center justify-center shrink-0">
                <HeartPulse className="w-5 h-5 text-[#006948]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[12px] font-bold text-[#131b2e]">Patient Profile:</span>
                  {patientProfile.conditions.map((c) => (
                    <span
                      key={c}
                      className="px-2 py-0.5 rounded-md bg-[#ba1a1a]/10 text-[#ba1a1a] text-[11px] font-semibold border border-[#ba1a1a]/20"
                    >
                      {c}
                    </span>
                  ))}
                  {patientProfile.medicines.map((m) => (
                    <span
                      key={m}
                      className="px-2 py-0.5 rounded-md bg-[#006948]/10 text-[#006948] text-[11px] font-semibold border border-[#006948]/20 flex items-center gap-1"
                    >
                      <Pill className="w-3 h-3" />
                      {m}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-[#3d4a42] truncate mt-0.5">
                  Restrictions: {patientProfile.dietaryRestrictions.join(', ') || 'None'}
                </p>
              </div>
            </div>
            <button
              type="button"
              id="editProfileBtn"
              onClick={() => setIsProfileOpen(true)}
              className="px-3 py-1.5 text-[11px] font-bold text-[#006948] bg-[#f2f3ff] hover:bg-[#e2e7ff] rounded-xl transition-all border border-[#eaedff] shrink-0 cursor-pointer"
            >
              Edit Profile
            </button>
          </div>

          {/* Quick Product Switcher Bar */}
          <div className="flex flex-col gap-1.5 mb-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold text-[#3d4a42] uppercase tracking-wider">
                Select Inspected Food Product
              </span>
              <span className="text-[11px] font-semibold text-[#006948]">
                Verified Food Database
              </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {products.map((p) => {
                const isSelected = p.id === activeProduct.id;
                const isOff = p.dataSource === 'open_food_facts';
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActiveProduct(p);
                      setDecisionResult(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 shrink-0 transition-all border cursor-pointer ${
                      isSelected
                        ? 'bg-[#006948] text-white border-[#006948] shadow-sm ring-2 ring-[#006948]/20'
                        : 'bg-white text-[#131b2e] border-[#eaedff] hover:bg-[#faf8ff] hover:border-[#bccac0]'
                    }`}
                  >
                    <span>{p.title.split(' ').slice(0, 3).join(' ')}</span>
                    {isOff ? (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-[#006948]/10 text-[#006948]'
                        }`}
                      >
                        Verified
                      </span>
                    ) : (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-purple-100 text-purple-700'
                        }`}
                      >
                        OCR Scan
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Context Card with Thumbnail */}
          <ContextCard
            imageThumbnail={activeProduct.imageThumbnail}
            categorySubtitle={activeProduct.categorySubtitle}
            title={activeProduct.title}
            captureSource={activeProduct.captureSource}
            explanationTitle={activeProduct.explanationTitle}
            explanationDescription={activeProduct.explanationDescription}
            barcode={activeProduct.barcode}
            dataSource={activeProduct.dataSource}
            onPreviewImage={() => setIsImagePreviewOpen(true)}
          />

          {/* Attention / Low Confidence Alert Banner */}
          <AlertBanner
            title={activeProduct.alertTitle}
            badge={activeProduct.alertBadge}
            description={activeProduct.alertDescription}
            isResolved={!hasUnconfirmedItems}
          />

          {/* Fields List Section Header */}
          <section className="mt-4 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <span className="font-semibold text-[14px] text-[#131b2e]">
                Detected Nutrition Fields ({activeProduct.fields.length})
              </span>
              <span className="font-bold text-[10px] text-[#006948] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006948] animate-pulse"></span>
                Ready to sync
              </span>
            </div>

            {/* List of Detected Nutrition Fields */}
            <div className="flex flex-col gap-3">
              {activeProduct.fields.map((field) => {
                // If it is the active sodium field needing verification, render the specialized card
                if (field.key === 'sodium' && field.isActionRequired && !field.confirmed) {
                  return (
                    <SodiumFieldCard
                      key={field.id}
                      field={field}
                      onVerify={handleVerifySodium}
                    />
                  );
                }

                // If sodium is already verified, render the clean FieldCard or verified card
                if (field.key === 'sodium' && field.confirmed) {
                  return (
                    <SodiumFieldCard
                      key={field.id}
                      field={field}
                      onVerify={handleVerifySodium}
                    />
                  );
                }

                return (
                  <FieldCard
                    key={field.id}
                    field={field}
                    onEdit={(f) => setEditingField(f)}
                  />
                );
              })}
            </div>
          </section>

          {/* Confidence Summary Card & Clinical Integrity Statement */}
          <OcrScoreCard
            score={activeProduct.aggregateScore}
            scoreLabel={activeProduct.scoreLabel}
            onOpenDetails={() => setIsClinicalInfoOpen(true)}
          />

          {/* Mobile Action Deck */}
          <div className="mt-8 flex flex-col gap-3">
            {/* Primary Agentic AI Decision Button */}
            <button
              id="canIEatBtn"
              onClick={handleRunAgentDecision}
              disabled={isAnalyzingDecision}
              className="w-full h-14 bg-gradient-to-r from-[#006948] to-[#005137] text-white font-bold text-[17px] rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-75"
              type="button"
            >
              {isAnalyzingDecision ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Agent Evaluating Food & Medicine Context...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-emerald-200" />
                  <span>Can I Eat This?</span>
                </>
              )}
            </button>

            {/* Quick Result Summary if already evaluated */}
            {decisionResult && (
              <div
                onClick={() => setIsDecisionOpen(true)}
                className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  decisionResult.decision === 'GENERALLY_SUITABLE'
                    ? 'bg-[#e8f5e9] border-[#006948]/30 text-[#006948]'
                    : decisionResult.decision === 'CONSUME_WITH_CAUTION'
                    ? 'bg-[#fff8e1] border-[#7c5800]/30 text-[#7c5800]'
                    : 'bg-[#ffebee] border-[#ba1a1a]/30 text-[#ba1a1a]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {decisionResult.decision === 'GENERALLY_SUITABLE' ? (
                    <CheckCircle className="w-5 h-5 shrink-0" />
                  ) : decisionResult.decision === 'CONSUME_WITH_CAUTION' ? (
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                  ) : (
                    <AlertOctagon className="w-5 h-5 shrink-0" />
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-[12px] uppercase tracking-wide">
                      Decision: {decisionResult.decision.replace(/_/g, ' ')}
                    </span>
                    <span className="text-[12px] opacity-90 truncate max-w-[280px]">
                      {decisionResult.decisionText}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold shrink-0">
                  <span>View Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            <button
              id="confirmFoodInfoBtn"
              onClick={handleConfirmAll}
              className="w-full h-12 bg-white text-[#131b2e] font-semibold text-[15px] rounded-xl shadow-xs border border-[#eaedff] flex items-center justify-center gap-2 active:scale-[0.98] hover:bg-[#f2f3ff] transition-all cursor-pointer"
              type="button"
            >
              <span>Confirm Food Information</span>
              <CheckCircle2 className="w-4 h-4 text-[#006948]" />
            </button>

            <button
              id="retakePanelBtn"
              onClick={() => setIsRetakeOpen(true)}
              className="w-full h-11 bg-[#faf8ff] text-[#3d4a42] font-semibold text-[13px] rounded-xl border border-[#eaedff] flex items-center justify-center gap-2 hover:bg-[#f2f3ff] active:scale-[0.99] transition-all cursor-pointer"
              type="button"
            >
              <Crop className="w-4 h-4 text-[#3d4a42]" />
              <span>Retake Specific Panel</span>
            </button>
          </div>
        </div>
      </main>

      {/* Micro-interaction Success Toast */}
      {toast.show && (
        <div
          id="confirmationToast"
          className="fixed bottom-6 inset-x-4 max-w-sm mx-auto z-50 bg-[#283044] text-[#eef0ff] rounded-xl p-3.5 shadow-2xl flex items-center gap-3 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
        >
          <div className="w-8 h-8 rounded-full bg-[#006948] text-white flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <p className="font-semibold text-[14px] text-white leading-tight">
              {toast.title}
            </p>
            <p className="font-normal text-[12px] text-[#eef0ff]/80">
              {toast.subtitle}
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <EditFieldModal
        field={editingField}
        isOpen={Boolean(editingField)}
        onClose={() => setEditingField(null)}
        onSave={handleSaveField}
      />

      <RetakeModal
        isOpen={isRetakeOpen}
        onClose={() => setIsRetakeOpen(false)}
        onProductScanned={handleProductScanned}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        products={products}
        activeProductId={activeProduct.id}
        onSelectProduct={(p) => {
          setActiveProduct(p);
          setDecisionResult(null);
        }}
      />

      <ClinicalInfoModal
        isOpen={isClinicalInfoOpen}
        onClose={() => setIsClinicalInfoOpen(false)}
        product={activeProduct}
      />

      <ImagePreviewModal
        isOpen={isImagePreviewOpen}
        onClose={() => setIsImagePreviewOpen(false)}
        imageUrl={activeProduct.imageThumbnail}
        title={activeProduct.title}
      />

      <PatientProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={patientProfile}
        onSave={handleSaveProfile}
      />

      <DecisionResultModal
        isOpen={isDecisionOpen}
        onClose={() => setIsDecisionOpen(false)}
        result={decisionResult}
        patientConditions={patientProfile.conditions}
        patientMedicines={patientProfile.medicines}
      />
    </div>
  );
}
