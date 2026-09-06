import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Crop,
  CheckCircle,
  RefreshCw,
  Sparkles,
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
import { INITIAL_PRODUCTS } from './data/mockProducts';
import { InspectionProduct, NutritionField } from './types';

export default function App() {
  const [products, setProducts] = useState<InspectionProduct[]>(INITIAL_PRODUCTS);
  const [activeProduct, setActiveProduct] = useState<InspectionProduct>(INITIAL_PRODUCTS[0]);
  const [editingField, setEditingField] = useState<NutritionField | null>(null);

  // Modals state
  const [isRetakeOpen, setIsRetakeOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isClinicalInfoOpen, setIsClinicalInfoOpen] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);

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
          const found = data.products.find((p: InspectionProduct) => p.id === activeProduct.id);
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
    triggerToast('New Panel Scanned', `Processed ${scannedProduct.title} via OCR`);
  };

  const hasUnconfirmedItems = activeProduct.fields.some((f) => !f.confirmed);

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col antialiased">
      {/* Top Header */}
      <Header
        onBack={() => {
          setIsHistoryOpen(true);
        }}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={products.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-12 bg-[#faf8ff]">
        <div className="flex flex-col w-full max-w-xl mx-auto px-4 pb-12">
          {/* Interactive Context Card with Thumbnail */}
          <ContextCard
            imageThumbnail={activeProduct.imageThumbnail}
            categorySubtitle={activeProduct.categorySubtitle}
            title={activeProduct.title}
            captureSource={activeProduct.captureSource}
            explanationTitle={activeProduct.explanationTitle}
            explanationDescription={activeProduct.explanationDescription}
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
          <div className="mt-8 flex flex-col gap-2.5">
            <button
              id="confirmFoodInfoBtn"
              onClick={handleConfirmAll}
              className="w-full h-14 bg-[#006948] text-white font-semibold text-[18px] rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] hover:bg-[#005137] transition-all cursor-pointer"
              type="button"
            >
              <span>Confirm Food Information</span>
              <CheckCircle2 className="w-5 h-5 text-white" />
            </button>

            <button
              id="retakePanelBtn"
              onClick={() => setIsRetakeOpen(true)}
              className="w-full h-12 bg-white text-[#131b2e] font-semibold text-[14px] rounded-xl shadow-xs border border-[#eaedff] flex items-center justify-center gap-2 hover:bg-[#f2f3ff] active:scale-[0.99] transition-all cursor-pointer"
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
        onSelectProduct={(p) => setActiveProduct(p)}
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
    </div>
  );
}
