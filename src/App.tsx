import { useEffect, useState, type ReactNode } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  Bolt,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  Crop,
  FileText,
  Lightbulb,
  Loader2,
  PackageCheck,
  PersonStanding,
  Plus,
  RefreshCw,
  ReceiptText,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Table2,
  Trash2,
  Verified,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Screen = 'scan' | 'history' | 'profile';
type Scan = {
  id: string;
  food_name: string;
  allergens: string;
  confidence: number;
  created_at: string;
};

const scannedImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBcflvzRQAx4VqtE9MvZNHAS4pRRbXW0A1MiKH0CElp1-_9OMlnSzqmDMNdHzmxhl5j68Z2zYb_r2gCJrQKpxPy98aofCxIu0U_5QHC2AmsshZHKG5MNJJAo1BYdz_WQVLB3aYVTX6KcKu5XqnlL2n0NG6oJIgkXT62_25bBF9NDAD1YsYb_fSTjl5d5Xt1-eUkfImF0SuF2yifLXcK25Bwrj5hYUx0v7AjdYQjRbirLlPnM1j9ZqUS';
const profileImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCYTePcv1xZgqSPswYzQhP8HyU44HZG_Th9s_IBGOy7M_SRfVSP5K3HaTWugilzl9yn8Qcqw64YfNUc5-IVTwfPpkNT26kkhLEvbz6N_mGff78MdnUPLznEdkXcMR0xMeL0Xl_qfibhiNIHxttYm2mIbqmsGsOYPOfjSS0H4LkVhmGGeUNJibVFF4lqYFjytQntE257bQXNv_Hl2Bv9Jl5DrDXxdGGVRQM459SS16ZOY63dVkRm-5Mi';

function App() {
  const [screen, setScreen] = useState<Screen>('scan');
  const [scans, setScans] = useState<Scan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    void loadScans();
  }, []);

  async function loadScans(): Promise<void> {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('scan_history')
      .select('id, food_name, allergens, confidence, created_at')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error) {
      setNotice('History is unavailable right now, but you can still analyze this label.');
    } else {
      setScans((data ?? []) as Scan[]);
    }
    setIsLoading(false);
  }

  async function analyzeFood(): Promise<void> {
    setIsAnalyzing(true);
    setNotice(null);
    const { data, error } = await supabase
      .from('scan_history')
      .insert({ food_name: 'Organic Whole Granola Bar', allergens: 'Almonds, Coconut', confidence: 94 })
      .select('id, food_name, allergens, confidence, created_at')
      .maybeSingle();
    setIsAnalyzing(false);
    if (error || !data) {
      setNotice('We could not save this scan. Please try again.');
      return;
    }
    setScans((current) => [data as Scan, ...current.filter((scan) => scan.id !== data.id)]);
    setShowResult(true);
  }

  async function deleteScan(id: string): Promise<void> {
    const { error } = await supabase.from('scan_history').delete().eq('id', id);
    if (error) {
      setNotice('That scan could not be removed. Please try again.');
      return;
    }
    setScans((current) => current.filter((scan) => scan.id !== id));
  }

  function retake(): void {
    setShowResult(false);
    setNotice('Camera preview reset. Your next label is ready to inspect.');
    window.setTimeout(() => setNotice(null), 3600);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><ScanLine size={24} strokeWidth={2.5} /></div>
          <div>
            <div className="brand-name">NutriAI</div>
            <div className="ready-label"><span className="ready-dot" /> Scanner Ready</div>
          </div>
        </div>
        <div className="top-actions">
          <button className="icon-button" aria-label="Notifications"><Bell size={22} /></button>
          <button className="profile-button" aria-label="Open profile" onClick={() => setScreen('profile')}><img src={profileImage} alt="Profile" /></button>
        </div>
      </header>

      <main className="page-content">
        {notice && <div className="notice" role="status"><AlertCircle size={17} /> {notice}<button onClick={() => setNotice(null)} aria-label="Dismiss"><X size={15} /></button></div>}
        {screen === 'scan' && <ScanView isAnalyzing={isAnalyzing} showResult={showResult} onAnalyze={analyzeFood} onRetake={retake} onHistory={() => setScreen('history')} />}
        {screen === 'history' && <HistoryView scans={scans} isLoading={isLoading} onDelete={deleteScan} onScan={() => setScreen('scan')} />}
        {screen === 'profile' && <ProfileView scans={scans} onScan={() => setScreen('scan')} />}
      </main>

      <BottomNav screen={screen} onChange={setScreen} />
    </div>
  );
}

function ScanView({ isAnalyzing, showResult, onAnalyze, onRetake, onHistory }: { isAnalyzing: boolean; showResult: boolean; onAnalyze: () => void; onRetake: () => void; onHistory: () => void }) {
  if (showResult) {
    return <ResultView onScan={onRetake} onHistory={onHistory} />;
  }
  return (
    <div className="content-column scan-screen">
      <div className="screen-heading">
        <div className="heading-row"><span className="status-pill"><span className="pulse-dot" /> Label Captured</span><span className="resolution"><Verified size={16} /> High Resolution • 1080p</span></div>
        <h1>Inspect Scanned Packet</h1>
        <p>Make sure the ingredients and nutrition information are clearly visible before diagnostic analysis.</p>
      </div>

      <div className="inspection-card">
        <div className="image-stage">
          <img src={scannedImage} alt="Scanned granola bar nutrition label" />
          <div className="image-shade" />
          <div className="hud-badge"><span className="ready-dot" /> OCR Regions Detected: 2</div>
          <DetectionBox className="nutrition-box" color="green" icon={<Table2 size={12} />} label="Nutrition Facts" />
          <DetectionBox className="ingredients-box" color="blue" icon={<FileText size={12} />} label="Ingredients" />
          <button className="adjust-button"><Crop size={17} /> Adjust</button>
        </div>
        <div className="quality-panel">
          <div className="quality-header"><strong>Capture Quality</strong><span>Ready to Decode</span></div>
          <div className="quality-chips"><span className="chip success"><CheckCircle2 size={15} /> Nutrition Facts OK</span><span className="chip success"><CheckCircle2 size={15} /> Ingredients Table OK</span><span className="chip info"><Lightbulb size={15} /> Lighting: Optimal</span></div>
        </div>
      </div>

      <div className="target-card"><div className="target-icon"><Sparkles size={22} /></div><div><strong>Auto-Extraction Target</strong><p>Organic Whole Granola Bar • Detected Allergens: <em>Almonds, Coconut</em></p></div></div>
      <div className="action-stack"><button className="primary-button" onClick={onAnalyze} disabled={isAnalyzing}>{isAnalyzing ? <Loader2 className="spin" size={21} /> : <Bolt size={21} fill="currentColor" />}<span>{isAnalyzing ? 'Analyzing label…' : 'Analyze Food'}</span>{!isAnalyzing && <ArrowRight size={21} />}</button><button className="secondary-button" onClick={onRetake}><RefreshCw size={21} /> Retake Photo</button></div>
      <div className="reassurance"><ShieldCheck size={21} /><p>NutriAI converts technical chemical additives into clear plain language and instantly cross-checks your personal allergen profile.</p></div>
    </div>
  );
}

function DetectionBox({ className, color, icon, label }: { className: string; color: 'green' | 'blue'; icon: ReactNode; label: string }) {
  return <div className={`detection-box ${className} ${color}`}><div className="box-tag">{icon}{label}</div><span className="corner top-left" /><span className="corner top-right" /><span className="corner bottom-left" /><span className="corner bottom-right" /></div>;
}

function ResultView({ onScan, onHistory }: { onScan: () => void; onHistory: () => void }) {
  return <div className="content-column result-screen"><div className="result-hero"><div className="result-check"><CheckCircle2 size={34} /></div><span className="status-pill"><span className="ready-dot" /> Analysis Complete</span><h1>Organic Whole<br />Granola Bar</h1><p>Clear, personalized insights from the label you captured.</p></div><div className="score-card"><div><span className="eyebrow">NUTRITION CONFIDENCE</span><strong>94%</strong></div><div className="score-ring"><span>94</span><small>/100</small></div></div><div className="insight-card"><div className="insight-title"><Sparkles size={18} /> Personalized insight</div><p>This label contains two ingredients matched to your profile.</p><div className="allergen-row"><span>Almonds</span><span>Coconut</span></div></div><button className="primary-button" onClick={onScan}><ScanLine size={20} /> Scan another label <ArrowRight size={20} /></button><button className="text-button" onClick={onHistory}>View scan history <ChevronRight size={18} /></button></div>;
}

function HistoryView({ scans, isLoading, onDelete, onScan }: { scans: Scan[]; isLoading: boolean; onDelete: (id: string) => Promise<void>; onScan: () => void }) {
  return <div className="content-column history-screen"><div className="history-heading"><div><span className="eyebrow">YOUR LIBRARY</span><h1>Scan History</h1><p>Every label you decode, in one place.</p></div><button className="round-action" onClick={onScan} aria-label="Start a new scan"><Plus size={21} /></button></div>{isLoading ? <div className="empty-state"><Loader2 className="spin" size={28} /><p>Loading your scans…</p></div> : scans.length === 0 ? <div className="empty-state"><ReceiptText size={32} /><p>No scans saved yet.</p><button className="primary-button" onClick={onScan}><ScanLine size={18} /> Start your first scan</button></div> : <div className="history-list">{scans.map((scan) => <article className="history-item" key={scan.id}><div className="history-icon"><PackageCheck size={21} /></div><div className="history-copy"><strong>{scan.food_name}</strong><p>{new Date(scan.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} · {scan.confidence}% confidence</p><span className="allergen-label">Allergens: {scan.allergens}</span></div><button className="delete-button" onClick={() => void onDelete(scan.id)} aria-label={`Delete ${scan.food_name}`}><Trash2 size={17} /></button></article>)}</div>}</div>;
}

function ProfileView({ scans, onScan }: { scans: Scan[]; onScan: () => void }) {
  return <div className="content-column profile-screen"><div className="profile-hero"><img src={profileImage} alt="Profile" /><span className="status-pill"><span className="ready-dot" /> Profile active</span><h1>Welcome back, Alex</h1><p>Your personal nutrition lens is ready.</p></div><div className="profile-stats"><div><strong>{scans.length}</strong><span>Labels scanned</span></div><div><strong>2</strong><span>Allergens tracked</span></div><div><strong>94%</strong><span>Avg. confidence</span></div></div><div className="settings-card"><button><PersonStanding size={20} /><span>Allergen profile</span><ChevronRight size={18} /></button><button><Bell size={20} /><span>Notifications</span><ChevronRight size={18} /></button><button><ShieldCheck size={20} /><span>Privacy & data</span><ChevronRight size={18} /></button></div><button className="primary-button" onClick={onScan}><ScanLine size={20} /> Scan a new label <ArrowRight size={20} /></button></div>;
}

function BottomNav({ screen, onChange }: { screen: Screen; onChange: (screen: Screen) => void }) {
  return <nav className="bottom-nav"><button className={screen === 'scan' ? 'active scan-tab' : ''} onClick={() => onChange('scan')}><ScanLine size={23} /><span>Scan</span></button><button className={screen === 'history' ? 'active' : ''} onClick={() => onChange('history')}><ReceiptText size={22} /><span>History</span></button><button className={screen === 'profile' ? 'active' : ''} onClick={() => onChange('profile')}><CircleUserRound size={22} /><span>Profile</span></button></nav>;
}

export default App;
