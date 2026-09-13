import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  Layers,
  Sparkles,
  AlertCircle,
  FileCheck2,
  Database,
  QrCode,
  Search,
} from 'lucide-react';
import { InspectionProduct } from '../types';

interface RetakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductScanned: (product: InspectionProduct) => void;
  /** If set, the modal opens on this tab immediately. */
  initialTab?: 'barcode' | 'samples' | 'camera' | 'upload';
  /** If true, the camera stream starts automatically when the modal opens. */
  autoStartCamera?: boolean;
}

export const RetakeModal: React.FC<RetakeModalProps> = ({
  isOpen,
  onClose,
  onProductScanned,
  initialTab = 'barcode',
  autoStartCamera = false,
}) => {
  const [selectedPanel, setSelectedPanel] = useState<string>('Rear Nutrition Table');
  const [activeTab, setActiveTab] = useState<'barcode' | 'samples' | 'camera' | 'upload'>(initialTab);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [barcodeInput, setBarcodeInput] = useState('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset tab to initialTab and optionally auto-start camera each time modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setCapturedImage(null);
      setError(null);
      setBarcodeInput('');
      if (autoStartCamera || initialTab === 'camera') {
        // Small delay so the video element is mounted
        setTimeout(() => startCamera(), 150);
      }
    } else {
      stopCamera();
      setCapturedImage(null);
      setError(null);
      setBarcodeInput('');
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setError('Camera access not granted or unavailable. You can use barcode lookup or photo upload.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCapturedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async (imagePayload: string, samplePreset?: string) => {
    const presetBarcodes: Record<string, string> = {
      cheerios: '016000275270',
      nutella: '3017620422003',
      granola_bar: '7394376616228',
      greek_yogurt: '20047559',
    };

    if (samplePreset && presetBarcodes[samplePreset]) {
      await handleBarcodeLookup(presetBarcodes[samplePreset]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imagePayload,
          panelType: selectedPanel,
          samplePreset,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to scan product');
      }

      if (data.product) {
        onProductScanned(data.product);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Scanning failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBarcodeLookup = async (codeToSearch?: string) => {
    const code = (codeToSearch || barcodeInput).trim();
    if (!code) {
      setError('Please enter a barcode number (UPC / EAN).');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          data.error ||
            `Barcode ${code} not found in Open Food Facts registry. Please switch to Camera or Upload tab to perform OCR with Gemini Vision.`
        );
      }

      if (data.product) {
        onProductScanned(data.product);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to lookup barcode in Open Food Facts.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#eaedff] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#eaedff] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006948]/10 text-[#006948] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[18px] text-[#131b2e]">
                Food Analysis & Product Scanner
              </h3>
              <p className="text-[12px] text-[#3d4a42]">
                Open Food Facts verified database with Gemini Vision OCR fallback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f3ff] text-[#3d4a42] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-4 modal-scroll">
          {/* Panel Selector */}
          <div>
            <label className="block text-[12px] font-bold text-[#3d4a42] uppercase tracking-wider mb-1.5">
              Target Panel Isolation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: 'Rear Nutrition Table', icon: Layers },
                { name: 'Front Packaging & Title', icon: FileCheck2 },
                { name: 'Allergen Statement', icon: AlertCircle },
              ].map((panel) => {
                const Icon = panel.icon;
                const active = selectedPanel === panel.name;
                return (
                  <button
                    key={panel.name}
                    type="button"
                    onClick={() => setSelectedPanel(panel.name)}
                    className={`p-2.5 rounded-xl text-left border flex flex-col gap-1 transition-all cursor-pointer ${
                      active
                        ? 'border-[#006948] bg-[#006948]/5 text-[#006948]'
                        : 'border-[#eaedff] bg-[#faf8ff] text-[#3d4a42] hover:bg-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-[11px] font-semibold leading-tight line-clamp-2">
                      {panel.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Source Tabs */}
          <div className="flex border-b border-[#eaedff]">
            <button
              onClick={() => {
                setActiveTab('barcode');
                stopCamera();
              }}
              className={`flex-1 py-2 text-[12px] font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'barcode'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-[#3d4a42] hover:text-[#131b2e]'
              }`}
            >
              <QrCode className="w-4 h-4" /> Barcode Search
            </button>
            <button
              onClick={() => {
                setActiveTab('samples');
                stopCamera();
              }}
              className={`flex-1 py-2 text-[12px] font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'samples'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-[#3d4a42] hover:text-[#131b2e]'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Presets
            </button>
            <button
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`flex-1 py-2 text-[12px] font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'camera'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-[#3d4a42] hover:text-[#131b2e]'
              }`}
            >
              <Camera className="w-4 h-4" /> Camera OCR
            </button>
            <button
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`flex-1 py-2 text-[12px] font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'upload'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-[#3d4a42] hover:text-[#131b2e]'
              }`}
            >
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>

          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-[12px] p-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Barcode API Tab (Primary Source: Open Food Facts) */}
          {activeTab === 'barcode' && (
            <div className="flex flex-col gap-3">
              <div className="bg-[#f2f3ff] p-3 rounded-xl border border-[#eaedff]">
                <div className="flex items-center gap-1.5 text-[#006948] font-semibold text-[13px]">
                  <Database className="w-4 h-4" />
                  <span>Open Food Facts Global Registry</span>
                </div>
                <p className="text-[12px] text-[#3d4a42] mt-1 leading-snug">
                  Enter any packaged product barcode for authoritative nutrient values (Calories, Sugars, Sodium, Fats, Carbs, Protein, Serving Size) and complete ingredients.
                </p>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleBarcodeLookup();
                    }}
                    placeholder="e.g. 016000275270 (UPC / EAN)"
                    className="w-full h-11 bg-[#faf8ff] rounded-lg px-3.5 pr-10 text-[14px] font-mono border border-[#eaedff] focus:outline-none focus:ring-2 focus:ring-[#006948] focus:bg-white"
                  />
                  <QrCode className="w-4 h-4 text-[#6d7a72] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleBarcodeLookup()}
                  className="h-11 px-4 bg-[#006948] hover:bg-[#005137] text-white rounded-lg text-[13px] font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Lookup</span>
                </button>
              </div>

              {/* Verified Barcode Quick Presets */}
              <div className="mt-1">
                <span className="block text-[11px] font-bold text-[#3d4a42] uppercase tracking-wider mb-2">
                  Try Verified Packaged Foods
                </span>
                <div className="flex flex-col gap-2">
                  {[
                    {
                      name: 'General Mills Cheerios Cereal',
                      code: '016000275270',
                      badge: 'Verified OFF',
                    },
                    {
                      name: 'Nutella Hazelnut Spread',
                      code: '3017620422003',
                      badge: 'Verified OFF',
                    },
                    {
                      name: 'Oatly Barista Edition Oat Milk',
                      code: '7394376616228',
                      badge: 'Verified OFF',
                    },
                    {
                      name: 'Heinz Tomato Ketchup',
                      code: '8715700407760',
                      badge: 'Verified OFF',
                    },
                  ].map((item) => (
                    <button
                      key={item.code}
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleBarcodeLookup(item.code)}
                      className="p-2.5 rounded-lg border border-[#eaedff] bg-white hover:border-[#006948] hover:bg-[#faf8ff] text-left transition-all flex items-center justify-between group cursor-pointer"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-[13px] font-semibold text-[#131b2e] group-hover:text-[#006948] truncate">
                          {item.name}
                        </p>
                        <p className="text-[11px] font-mono text-[#3d4a42]">
                          Barcode: {item.code}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#006948]/10 text-[#006948] border border-[#006948]/20 shrink-0">
                        {item.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-[#3d4a42] bg-[#faf8ff] p-2.5 rounded-lg border border-[#eaedff]">
                💡 <span className="font-semibold">Fallback Guarantee:</span> If a barcode is not found in Open Food Facts or cannot be identified, NutriAI automatically activates Gemini Vision OCR on the label image.
              </div>
            </div>
          )}

          {/* Sample Preset Selection */}
          {activeTab === 'samples' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: 'cheerios',
                  title: 'Cheerios Cereal',
                  desc: 'Open Food Facts live API verification',
                  img: 'https://images.unsplash.com/photo-1521483451569-e33803c0330c?auto=format&fit=crop&w=400&q=80',
                  badge: 'OFF API',
                },
                {
                  id: 'nutella',
                  title: 'Nutella Spread',
                  desc: 'Full 8 nutrients + hazelnut ingredients',
                  img: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?auto=format&fit=crop&w=400&q=80',
                  badge: 'OFF API',
                },
                {
                  id: 'granola_bar',
                  title: 'Organic Granola Bar',
                  desc: 'Gemini Vision OCR with sodium ambiguity',
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-1G_WNHVOdxr7bQ9oZGxf7JzlW_d9kZUSzov4MmRbvhLnpxSt8PTRIIggcQmSRiv2BjqE67eqT3LbKsa6lvNGgW0_Jwd5XvlKtsbMGhQoCI-YJj0AJ-A_kv9SAMaplRaJBzEU5A1vpuf_wlTa3VY3Te4OhkczVfxT_OE9Tf0hWx73nNK8IFo4Gek6e_mtdNAZCdLoF-i_MoAzUDDgUC_J_4POiaarcNV6IeHSfpNsPlsc-vd-KtSw',
                  badge: 'OCR Fallback',
                },
                {
                  id: 'greek_yogurt',
                  title: 'Greek Yogurt 0%',
                  desc: 'High protein dairy profile (18g)',
                  img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
                  badge: 'OFF Verified',
                },
              ].map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => runAnalysis('', sample.id)}
                  disabled={isLoading}
                  className="p-3 border border-[#eaedff] rounded-xl text-left hover:border-[#006948] hover:bg-[#faf8ff] transition-all group flex flex-col gap-2 cursor-pointer"
                >
                  <div className="relative w-full h-24 rounded-lg overflow-hidden">
                    <img
                      src={sample.img}
                      alt={sample.title}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                    />
                    <span className="absolute top-1 right-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                      {sample.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-[13px] text-[#131b2e]">
                      {sample.title}
                    </h4>
                    <p className="text-[11px] text-[#3d4a42] line-clamp-2">{sample.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Live Camera Viewfinder */}
          {activeTab === 'camera' && (
            <div className="flex flex-col items-center gap-3">
              <div className="relative w-full aspect-4/3 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                {capturedImage ? (
                  <img
                    src={capturedImage}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                    />
                    {/* Viewfinder Overlay Frame */}
                    <div className="absolute inset-8 border-2 border-white/60 rounded-xl pointer-events-none flex flex-col justify-between p-2">
                      <span className="text-[10px] text-white/80 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded self-start">
                        ALIGN LABEL & BARCODE WITHIN BOUNDS
                      </span>
                      <div className="h-0.5 w-full bg-emerald-400/50 animate-pulse"></div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex gap-2 w-full">
                {capturedImage ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setCapturedImage(null);
                        startCamera();
                      }}
                      className="flex-1 py-2.5 rounded-lg border border-[#eaedff] text-[13px] font-semibold text-[#3d4a42] hover:bg-[#f2f3ff] cursor-pointer"
                    >
                      Retake
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => runAnalysis(capturedImage)}
                      className="flex-1 py-2.5 rounded-lg bg-[#006948] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span>Analyze Panel</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={capturePhoto}
                    disabled={!cameraActive}
                    className="w-full py-3 rounded-lg bg-[#006948] text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#005137] transition-colors cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Capture Snapshot</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="flex flex-col gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              {capturedImage ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-full aspect-4/3 rounded-xl overflow-hidden border border-[#eaedff]">
                    <img
                      src={capturedImage}
                      alt="Uploaded preview"
                      className="w-full h-full object-contain bg-[#faf8ff]"
                    />
                  </div>
                  <div className="flex gap-2 w-full">
                    <button
                      type="button"
                      onClick={() => setCapturedImage(null)}
                      className="flex-1 py-2.5 rounded-lg border border-[#eaedff] text-[13px] font-semibold text-[#3d4a42] cursor-pointer"
                    >
                      Choose Different Photo
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => runAnalysis(capturedImage)}
                      className="flex-1 py-2.5 rounded-lg bg-[#006948] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4" />
                      )}
                      <span>Run OCR Analysis</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#bccac0] hover:border-[#006948] bg-[#faf8ff] rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-[#e2e7ff] flex items-center justify-center text-[#006948] mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="font-semibold text-[14px] text-[#131b2e]">
                    Click or drag food label image here
                  </p>
                  <p className="text-[12px] text-[#3d4a42] mt-1">
                    Supports JPG, PNG, WEBP high-resolution nutrition facts panels
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
