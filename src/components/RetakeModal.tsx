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
} from 'lucide-react';
import { InspectionProduct } from '../types';

interface RetakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProductScanned: (product: InspectionProduct) => void;
}

export const RetakeModal: React.FC<RetakeModalProps> = ({
  isOpen,
  onClose,
  onProductScanned,
}) => {
  const [selectedPanel, setSelectedPanel] = useState<string>('Rear Nutrition Table');
  const [activeTab, setActiveTab] = useState<'camera' | 'upload' | 'samples'>('samples');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setCapturedImage(null);
      setError(null);
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
      setError('Camera access not granted or unavailable. You can use file upload or sample labels.');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#eaedff] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#eaedff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#006948]/10 text-[#006948] flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-[18px] text-[#131b2e]">
                Retake Specific Panel
              </h3>
              <p className="text-[12px] text-[#3d4a42]">
                Isolate package panel for precision optical character calibration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f3ff] text-[#3d4a42]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
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
                    className={`p-2.5 rounded-xl text-left border flex flex-col gap-1 transition-all ${
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
                setActiveTab('samples');
                stopCamera();
              }}
              className={`flex-1 py-2 text-[13px] font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'samples'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-[#3d4a42] hover:text-[#131b2e]'
              }`}
            >
              <Sparkles className="w-4 h-4" /> Demo Food Presets
            </button>
            <button
              onClick={() => {
                setActiveTab('camera');
                startCamera();
              }}
              className={`flex-1 py-2 text-[13px] font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'camera'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-[#3d4a42] hover:text-[#131b2e]'
              }`}
            >
              <Camera className="w-4 h-4" /> Live Camera
            </button>
            <button
              onClick={() => {
                setActiveTab('upload');
                stopCamera();
              }}
              className={`flex-1 py-2 text-[13px] font-semibold border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'upload'
                  ? 'border-[#006948] text-[#006948]'
                  : 'border-transparent text-[#3d4a42] hover:text-[#131b2e]'
              }`}
            >
              <Upload className="w-4 h-4" /> Upload Photo
            </button>
          </div>

          {error && (
            <div className="bg-[#ffdad6] text-[#93000a] text-[12px] p-3 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sample Preset Selection */}
          {activeTab === 'samples' && (
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: 'granola_bar',
                  title: 'Organic Granola Bar',
                  desc: 'Original scan with sodium curve ambiguity',
                  img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-1G_WNHVOdxr7bQ9oZGxf7JzlW_d9kZUSzov4MmRbvhLnpxSt8PTRIIggcQmSRiv2BjqE67eqT3LbKsa6lvNGgW0_Jwd5XvlKtsbMGhQoCI-YJj0AJ-A_kv9SAMaplRaJBzEU5A1vpuf_wlTa3VY3Te4OhkczVfxT_OE9Tf0hWx73nNK8IFo4Gek6e_mtdNAZCdLoF-i_MoAzUDDgUC_J_4POiaarcNV6IeHSfpNsPlsc-vd-KtSw',
                },
                {
                  id: 'greek_yogurt',
                  title: 'Greek Strained Yogurt',
                  desc: 'High protein, 98.8% aggregate fidelity',
                  img: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=400&q=80',
                },
              ].map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => runAnalysis('', sample.id)}
                  disabled={isLoading}
                  className="p-3 border border-[#eaedff] rounded-xl text-left hover:border-[#006948] hover:bg-[#faf8ff] transition-all group flex flex-col gap-2"
                >
                  <img
                    src={sample.img}
                    alt={sample.title}
                    className="w-full h-24 object-cover rounded-lg group-hover:scale-[1.02] transition-transform"
                  />
                  <div>
                    <h4 className="font-semibold text-[14px] text-[#131b2e]">
                      {sample.title}
                    </h4>
                    <p className="text-[11px] text-[#3d4a42]">{sample.desc}</p>
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
                        ALIGN LABEL WITHIN BOUNDS
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
                      className="flex-1 py-2.5 rounded-lg border border-[#eaedff] text-[13px] font-semibold text-[#3d4a42] hover:bg-[#f2f3ff]"
                    >
                      Retake
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => runAnalysis(capturedImage)}
                      className="flex-1 py-2.5 rounded-lg bg-[#006948] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm"
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
                    className="w-full py-3 rounded-lg bg-[#006948] text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#005137] transition-colors"
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
                      className="flex-1 py-2.5 rounded-lg border border-[#eaedff] text-[13px] font-semibold text-[#3d4a42]"
                    >
                      Choose Different Photo
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => runAnalysis(capturedImage)}
                      className="flex-1 py-2.5 rounded-lg bg-[#006948] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 shadow-sm"
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
