import { ChangeEvent, ReactNode, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Bell,
  Camera,
  Check,
  ChevronRight,
  CircleUserRound,
  Crop,
  FlaskConical,
  GalleryHorizontalEnd,
  Home,
  Image as ImageIcon,
  Lightbulb,
  LoaderCircle,
  ScanLine,
  ShieldCheck,
  Sparkles,
  UserRound,
  Verified,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Scan = {
  id: string;
  product_name: string;
  brand: string;
  grade: string;
  health_score: number;
  image_url: string;
  scanned_at: string;
};

const productImages = {
  almond: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkTH-6uwTAvqzxPC88AESbmfAodcajEQNSLc2AryRSUcUaKMydtr5HsvRznxJ_09iYM4dqqGL9UM6ERuS23w1q41nkq4MSKtJhi9mrvUSu5PmV1vfWIlfnMQEDLJA5lMx5ErGpb9HHiMUtWUHLQ3mqtz1vOZ1x9_Mr7W4R-d5ggOq5lLvGEFVwSWAb7v66_3jXOxGYOvxfJ7AfSNH9f04nJdC4ZMBaMTTOfk5X_hDTqs1YFyX9f8mh',
  cacao: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3VBhM_9KDAjYLMoT_8ENmAU6OY3GvrjYuTYIwwyas8_Fj3POLNRVzfTCU0pqkRc-QIKP-9SxhqCF7vZVaax-tezV-oVSxyoTY9WitEi8S6or-yDVwGQ9YFmQd68ZHCkGKriOT-Vibsuyyj0kYmmMZCKlzqaGJYeyeZ4t6cwB7osRiVV-98yfPbi19PguuHTGhBgETbGuSwxWJZEuZVZFJmMRMjZX9wQQgM_tMnMD8_9OGhcWq8lwe',
  scanner: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8qrIUT3WVDy9EZ96WHG1xvqTHvKu5Ue_rQxbfCgQFo_SBFJrIg_CRZlXi62B0frsV3CnKAv2OVZdt5HMlvLtSI_Mxms2JCqxH65QPDhK1s-07FD_93ep2ez0AEDWuq-gGr7Kuh4-ZCh-TJNPjQDcCyNe4T7rFaPFDi8q6zhwtONPb8PSpWQyhmHwXJmzqXiDpIG8-3R20BREOsz3uXMIzVdO0B2wmfiP8NeaViVTOw6va3gl2EJ6j',
};

const starterScans: Scan[] = [
  { id: 'starter-almond', product_name: 'Pure Almond Silk Drink', brand: 'Earth Pure Co.', grade: 'Grade A', health_score: 94, image_url: productImages.almond, scanned_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { id: 'starter-cacao', product_name: 'Dark Cacao Super-Bar', brand: 'BioHarvest', grade: 'Grade B+', health_score: 82, image_url: productImages.cacao, scanned_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
];

function formatAge(date: string): string {
  const hours = Math.floor((Date.now() - new Date(date).getTime()) / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  if (hours < 48) return 'Yesterday';
  return `${Math.floor(hours / 24)}d ago`;
}

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [scans, setScans] = useState<Scan[]>([]);
  const [loadingScans, setLoadingScans] = useState(true);
  const [busy, setBusy] = useState<'camera' | 'gallery' | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadScans(): Promise<void> {
      const { data, error: fetchError } = await supabase
        .from('scan_history')
        .select('*')
        .order('scanned_at', { ascending: false })
        .limit(8);

      if (fetchError) {
        setError('Your recent scans are temporarily unavailable.');
        setScans(starterScans);
      } else if (data?.length) {
        setScans(data as Scan[]);
      } else {
        setScans(starterScans);
        await supabase.from('scan_history').insert(starterScans.map(({ id: _id, ...scan }) => scan));
      }
      setLoadingScans(false);
    }
    void loadScans();
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  async function openCamera(): Promise<void> {
    setError('');
    setBusy('camera');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      setCameraOpen(true);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 0);
    } catch {
      setError('Camera access was not available. You can still choose a photo from your gallery.');
    } finally {
      setBusy(null);
    }
  }

  function closeCamera(): void {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraOpen(false);
  }

  async function handleGallery(event: ChangeEvent<HTMLInputElement>): Promise<void> {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    setBusy('gallery');
    const imageUrl = URL.createObjectURL(file);
    const scan: Omit<Scan, 'id'> = {
      product_name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ') || 'New food scan',
      brand: 'Personal scan',
      grade: 'Pending',
      health_score: 0,
      image_url: imageUrl,
      scanned_at: new Date().toISOString(),
    };
    const { data, error: insertError } = await supabase.from('scan_history').insert(scan).select().maybeSingle();
    if (insertError) {
      setError('This scan could not be saved. Please try again.');
    } else if (data) {
      setScans((current) => [data as Scan, ...current].slice(0, 8));
    }
    setBusy(null);
    event.target.value = '';
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><ScanLine size={21} strokeWidth={2.5} /></div>
          <div>
            <div className="brand-name">NutriAI</div>
            <div className="ready-state"><span /> Scanner ready</div>
          </div>
        </div>
        <div className="top-actions">
          <button className="icon-button" aria-label="Notifications"><Bell size={23} /></button>
          <button className="profile-avatar" aria-label="Open profile"><img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYTePcv1xZgqSPswYzQhP8HyU44HZG_Th9s_IBGOy7M_SRfVSP5K3HaTWugilzl9yn8Qcqw64YfNUc5-IVTwfPpkNT26kkhLEvbz6N_mGff78MdnUPLznEdkXcMR0xMeL0Xl_qfibhiNIHxttYm2mIbqmsGsOYPOfjSS0H4LkVhmGGeUNJibVFF4lqYFjytQntE257bQXNv_Hl2Bv9Jl5DrDXxdGGVRQM459SS16ZOY63dVkRm-5Mi" alt="Profile" /></button>
        </div>
      </header>

      <main className="content">
        <section className="intro">
          <div className="eyebrow"><span className="eyebrow-icon"><ScanLine size={15} /></span> Bio-intelligence vision</div>
          <h1>Scan your food</h1>
          <p>Scan a food label to instantly decode ingredients, additives, and clinical nutritional health ratings.</p>
        </section>

        {error && <div className="error-banner" role="alert">{error}<button onClick={() => setError('')} aria-label="Dismiss"><X size={16} /></button></div>}

        <section className="action-stack">
          <article className="action-card camera-card">
            <div className="card-title-row">
              <div className="action-icon mint"><Camera size={28} /></div>
              <div><div className="action-title">Scan with camera <span className="live-pill">LIVE</span></div><p>Point at the barcode or ingredient label</p></div>
            </div>
            <div className="scanner-preview">
              <img src={productImages.scanner} alt="Food nutrition label preview" />
              <div className="viewfinder"><div className="align-row"><Crop size={15} /><span>Auto-align</span><Crop size={15} /></div><div className="scan-line" /><span className="capture-copy">Ready for capture</span></div>
            </div>
            <button className="primary-button" onClick={() => void openCamera()} disabled={busy !== null}><Camera size={20} />{busy === 'camera' ? 'Initializing lens...' : 'Open camera scanner'}</button>
          </article>

          <article className="action-card gallery-card">
            <div className="card-title-row"><div className="action-icon blue"><GalleryHorizontalEnd size={28} /></div><div><div className="action-title">Upload from gallery</div><p>Select a clear screenshot or saved receipt</p></div></div>
            <div className="gallery-footer"><div className="support-copy"><ImageIcon size={18} /><span>Supports JPG, PNG,<br /> HEIC</span></div><button className="secondary-button" onClick={() => fileInputRef.current?.click()} disabled={busy !== null}>{busy === 'gallery' ? <LoaderCircle className="spin" size={18} /> : null}<span>{busy === 'gallery' ? 'Analyzing...' : 'Browse photos'}</span><ArrowRight size={19} /></button></div>
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(event) => void handleGallery(event)} />
          </article>
        </section>

        <section className="tip-card"><div className="tip-icon"><Lightbulb size={20} /></div><div><div className="tip-title">Scanning tip <span>•</span></div><p>For 99.8% precision, flatten any foil glare and frame the complete ingredients panel along with the nutritional values.</p></div></section>

        <section className="standards"><div className="section-kicker">NutriAI verification standard <ShieldCheck size={17} /></div><div className="standard-grid"><Standard icon={<Check size={18} />} tone="mint" title="Zero jargon" copy="Plain talk" /><Standard icon={<FlaskConical size={18} />} tone="blue" title="Additive lab" copy="E-code safety" /><Standard icon={<ShieldCheck size={18} />} tone="amber" title="Allergen fit" copy="Tailored alerts" /></div></section>

        <section className="recent"><div className="section-heading"><div><h2>Recent scans <span>{scans.length}</span></h2></div><button>View all <ChevronRight size={16} /></button></div>{loadingScans ? <div className="loading-row"><LoaderCircle className="spin" size={22} /> Loading scan history</div> : scans.map((scan) => <ScanRow key={scan.id} scan={scan} />)}</section>
      </main>

      <nav className="bottom-nav"><NavItem icon={<Home size={22} />} label="Home" /><div className="scan-nav"><button onClick={() => void openCamera()} aria-label="Scan"><Camera size={27} /></button><span>Scan</span></div><NavItem icon={<GalleryHorizontalEnd size={22} />} label="History" /><NavItem icon={<UserRound size={22} />} label="Profile" /></nav>

      {cameraOpen && <div className="camera-modal" role="dialog" aria-modal="true"><div className="modal-panel"><button className="close-modal" onClick={closeCamera} aria-label="Close camera"><X size={21} /></button><div className="modal-heading"><Sparkles size={18} /> Live scanner</div><div className="live-view"><video ref={videoRef} autoPlay playsInline muted /><div className="modal-frame"><span /><span /><span /><span /></div><div className="modal-label">Center the ingredients panel</div></div><button className="primary-button" onClick={closeCamera}><Check size={19} /> Done scanning</button></div></div>}
    </div>
  );
}

function Standard({ icon, tone, title, copy }: { icon: ReactNode; tone: string; title: string; copy: string }) {
  return <div className="standard-card"><div className={`standard-icon ${tone}`}>{icon}</div><strong>{title}</strong><span>{copy}</span></div>;
}

function ScanRow({ scan }: { scan: Scan }) {
  const isPending = scan.grade === 'Pending';
  return <article className="scan-row"><img src={scan.image_url} alt="" /><div className="scan-info"><div className="scan-name">{scan.product_name} {!isPending && <Verified size={16} />}</div><div className="scan-meta">{scan.brand}<i /> {formatAge(scan.scanned_at)}</div></div><div className="scan-score"><span className={`grade ${isPending ? 'pending' : scan.grade.startsWith('A') ? 'green' : 'blue'}`}><b />{scan.grade}</span><small>{isPending ? 'Analysis queued' : `${scan.health_score}/100 Health`}</small></div></article>;
}

function NavItem({ icon, label }: { icon: ReactNode; label: string }) {
  return <button className="nav-item">{icon}<span>{label}</span></button>;
}

export default App;
