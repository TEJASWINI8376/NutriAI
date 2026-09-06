import { useEffect, useMemo, useState } from 'react';
import {
  Bell, Biohazard, Check, CirclePause, CirclePlay, FileText,
  Home, Image, Info, LockKeyhole, Play,
  ReceiptText, RefreshCw, ScanLine, ShieldCheck, Sparkles, UserRound, X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ScanStatus = 'active' | 'paused' | 'complete' | 'cancelled';
type ScanSession = { id: string; progress: number; is_paused: boolean; status: ScanStatus };
type Tab = 'home' | 'scan' | 'history' | 'profile';

const scannedImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDihowygc4oLvf529R26eQLyz9xxaKCS1AnW5geKK_GaVZea1cbVdgSGOQXeAn3l_h2bPwTcTlTaisF0PsydL1x2xxCTrfIHeFaYwLB2CQe-sFK-e4ScztOK6rFG-BbNmYR_bOUNMUEo5Yb0UQvL6iymd2S9KHoKZnmdCV5Ll1f-UazqaUB6jTJydKRg7jkFRgBJ7gIXv_8yHAtrpWzLJjLVdgzdlK41nG40dpZHMnc10_L2379k8tL';
const profileImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCYTePcv1xZgqSPswYzQhP8HyU44HZG_Th9s_IBGOy7M_SRfVSP5K3HaTWugilzl9yn8Qcqw64YfNUc5-IVTwfPpkNT26kkhLEvbz6N_mGff78MdnUPLznedxKcMR0xMeL0Xl_qfibhiNIHxttYm2mIbqmsGsOYPOfjSS0H4LkVhmGGeUNJibVFF4lqYFjytQntE257bQXNv_Hl2Bv9Jl5DrDXxdGGVRQM459SS16ZOY63dVkRm-5Mi';

const steps = [
  ['Reading food label', 'Parsed 28 textual lines across packaging bounding boxes.', 'Done'],
  ['Extracting ingredients', 'Isolated 14 distinct raw components & binder ratios.', 'Done'],
  ['Identifying additives', 'Cross-matching E322, Xanthan Gum, and Dipotassium Phosphate...', 'Active'],
  ['Analyzing nutrition', 'Bioavailability, macronutrients, and glycemic forecast.', 'Waiting'],
  ['Simplifying technical terms', 'Generating everyday plain-language ingredient cards.', 'Waiting'],
  ['Checking information', 'Double-checking allergy warnings with your profile.', 'Waiting'],
] as const;

function App() {
  const [session, setSession] = useState<ScanSession | null>(null);
  const [tab, setTab] = useState<Tab>('scan');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const updateSession = async (changes: Partial<ScanSession>) => {
    if (!session) return;
    const next = { ...session, ...changes };
    setSession(next);
    const { error } = await supabase.from('scan_sessions').update({
      progress: next.progress, is_paused: next.is_paused, status: next.status, updated_at: new Date().toISOString(),
    }).eq('id', next.id);
    if (error) setNotice('Your latest scan update could not be saved.');
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const { data, error } = await supabase.from('scan_sessions').select('id, progress, is_paused, status').order('updated_at', { ascending: false }).limit(1).maybeSingle();
      if (!mounted) return;
      if (error) {
        setNotice('We could not load your scan right now.');
      } else if (data) {
        setSession(data as ScanSession);
      } else {
        const { data: created, error: createError } = await supabase.from('scan_sessions').insert({ progress: 68, is_paused: false, status: 'active' }).select('id, progress, is_paused, status').maybeSingle();
        if (createError) setNotice('We could not start your scan right now.');
        else if (created) setSession(created as ScanSession);
      }
      setLoading(false);
    };
    void load();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!session || session.status !== 'active' || session.is_paused || session.progress >= 100) return;
    const timer = window.setInterval(() => {
      void updateSession({ progress: Math.min(session.progress + 4, 100), status: session.progress + 4 >= 100 ? 'complete' : 'active' });
    }, 1800);
    return () => window.clearInterval(timer);
  }, [session]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 3500);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const progress = session?.progress ?? 68;
  const paused = session?.is_paused ?? false;
  const complete = session?.status === 'complete';
  const activeStep = useMemo(() => complete ? 6 : progress > 84 ? 5 : 3, [complete, progress]);

  const handlePause = () => void updateSession({ is_paused: !paused, status: paused ? 'active' : 'paused' });
  const handleCancel = () => {
    if (!session) return;
    void updateSession({ progress: 0, is_paused: false, status: 'cancelled' });
    setNotice('Scan cancelled. Tap resume to start a fresh analysis.');
  };
  const handleResume = () => void updateSession({ progress: 12, is_paused: false, status: 'active' });

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] antialiased">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#e8e9f4]/70 bg-[#faf8ff]/90 pt-[env(safe-area-inset-top)] shadow-[0_1px_8px_rgba(0,0,0,.04)] backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4">
          <button className="flex items-center gap-2 text-left" onClick={() => setTab('scan')} aria-label="Open scanner">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d9f8e9] text-[#006948]"><Sparkles size={19} strokeWidth={2.5} /></div>
            <div><div className="text-[18px] font-bold leading-5 tracking-tight">NutriAI</div><div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#006948]"><span className="h-2 w-2 rounded-full bg-[#006948]" /> Scanner ready</div></div>
          </button>
          <div className="flex items-center gap-1">
            <button onClick={() => setNotice('You are all caught up.')} className="flex h-11 w-11 items-center justify-center rounded-full text-[#3d4a42] transition hover:bg-[#eaedff]" aria-label="Notifications"><Bell size={21} /></button>
            <button onClick={() => setTab('profile')} className="flex h-11 w-11 items-center justify-center" aria-label="Profile"><img alt="Profile" className="h-8 w-8 rounded-full object-cover shadow" src={profileImage} /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto min-h-screen max-w-3xl px-4 pb-28 pt-20">
        {tab !== 'scan' ? <Placeholder tab={tab} onScan={() => setTab('scan')} /> : (
          <>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-1.5 rounded-full bg-[#eaedff] px-3 py-1 text-xs font-bold text-[#006948]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#006948]" /> Neural Engine v2.4</div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] text-[#3d4a42]"><LockKeyhole size={16} /> Encrypted analysis</div>
            </div>

            <section className="animate-float-in relative mt-3 overflow-hidden rounded-2xl bg-white p-5 text-center shadow-[0_2px_10px_rgba(29,38,74,.04)] sm:p-8">
              <div className="pointer-events-none absolute -right-10 -top-12 h-48 w-48 rounded-full bg-[#39b8fd]/20 blur-3xl" /><div className="pointer-events-none absolute -bottom-10 -left-10 h-44 w-44 rounded-full bg-[#85f8c4]/30 blur-3xl" />
              <div className="relative mx-auto my-2 flex h-44 w-44 items-center justify-center sm:h-48 sm:w-48">
                <div className="absolute h-36 w-36 rounded-full bg-[#85f8c4]/20 animate-pulse" /><div className="absolute h-44 w-44 rounded-full border-[18px] border-[#c9e6ff]/45 animate-orbit" />
                <div className="relative z-10 h-28 w-28 rounded-full bg-[#f2f3ff] p-1.5 shadow-md"><div className="relative h-full w-full overflow-hidden rounded-full bg-[#dae2fd]"><img className="h-full w-full object-cover" src={scannedImage} alt="Oat milk label being analyzed" /><div className="absolute inset-0 flex flex-col justify-between bg-[#006948]/25 p-1.5"><div className="animate-scan-line h-0.5 w-full bg-[#85f8c4] shadow-[0_0_8px_#68dba9]" /><div className="flex items-end justify-between text-[10px] font-bold text-white"><span>OCR: 99.4%</span><ScanLine size={14} /></div></div></div><div className="absolute -bottom-2 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[#006948] text-white shadow-md"><Biohazard size={16} /></div></div>
              </div>
              <div className="relative mt-1 flex items-baseline justify-center gap-1"><span className="text-[34px] font-extrabold leading-none tracking-[-.04em] text-[#006948]">{progress}%</span><span className="text-[18px] font-semibold text-[#3d4a42]">{complete ? 'Complete' : 'Complete'}</span></div>
              <div className="relative mx-auto mt-3 h-2 max-w-[260px] overflow-hidden rounded-full bg-[#eaedff]"><div className="h-full rounded-full bg-[#006948] transition-all duration-700" style={{ width: `${progress}%` }} /></div>
              <h1 className="relative mt-5 text-[22px] font-bold tracking-[-.02em] sm:text-2xl">{complete ? 'Your food profile is ready.' : paused ? 'Analysis is paused.' : 'Understanding Your Food…'}</h1>
              <p className="relative mx-auto mt-1 max-w-md text-sm leading-6 text-[#3d4a42]">{complete ? 'Your ingredients, nutrients, and allergy information have been checked.' : paused ? 'Resume whenever you are ready to continue the clinical extraction.' : 'Our AI is analyzing label text, translating additives, and breaking down nutrients in real time.'}</p>
            </section>

            <section className="mt-5 rounded-2xl bg-white p-5 shadow-[0_2px_10px_rgba(29,38,74,.04)] sm:p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-xs font-bold uppercase tracking-[.08em]">Clinical extraction steps</h2><span className="rounded-full bg-[#eaedff] px-2.5 py-1 text-xs font-bold text-[#006591]">Step {complete ? 6 : activeStep} of 6</span></div><div className="space-y-3">
              {steps.map(([title, description, state], index) => { const done = complete || index < (complete ? 6 : 2); const active = !complete && index === 2 && !paused; return <div key={title} className={`flex items-start gap-3 rounded-xl ${active ? 'bg-[#f2f3ff] p-2' : ''} ${state === 'Waiting' && !done && !active ? 'opacity-60' : ''}`}><div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${done ? 'bg-[#85f8c4] text-[#002114]' : active ? 'bg-[#39b8fd] text-[#004666] animate-spin' : 'bg-[#eaedff] text-[#6d7a72]'}`}>{done ? <Check size={17} /> : active ? <RefreshCw size={17} /> : <span className="h-2 w-2 rounded-full bg-[#6d7a72]" />}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><span className={`truncate text-sm font-semibold ${active ? 'text-[#006591]' : ''}`}>{title}</span><span className={`shrink-0 text-[11px] font-bold ${done ? 'text-[#006948]' : active ? 'rounded-full bg-[#006591] px-2 py-0.5 text-white' : 'text-[#6d7a72]'}`}>{done ? 'Done' : active ? 'Active' : 'Waiting'}</span></div><p className="text-xs leading-4 text-[#3d4a42]">{description}</p></div></div>; })}
            </div></section>

            <div className="mt-3 flex items-start gap-3 rounded-2xl bg-[#e2e7ff] p-4 shadow-sm"><ShieldCheck className="mt-0.5 shrink-0 text-[#006591]" size={21} /><div><h3 className="text-sm font-bold">Evidence-based integrity</h3><p className="mt-0.5 text-xs leading-5 text-[#3d4a42]">Chemical names are cross-referenced with peer-reviewed medical food databases without commercial or brand bias.</p></div></div>
            <div className="mt-3 grid grid-cols-2 gap-3"><Metric icon={<Biohazard size={21} />} label="Detected items" value="14 Active" /><Metric icon={<Image size={20} />} label="Allergen scan" value="Clear So Far" accent /></div>
            <div className="mt-6 flex flex-col gap-2"><button onClick={paused ? handlePause : complete || session?.status === 'cancelled' ? handleResume : handlePause} className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition active:scale-[.99] ${paused ? 'bg-[#006948] text-white' : 'bg-[#e2e7ff] text-[#131b2e]'}`}>{paused ? <Play size={19} /> : complete || session?.status === 'cancelled' ? <CirclePlay size={19} /> : <CirclePause size={19} />} {paused ? 'Resume Analysis' : complete || session?.status === 'cancelled' ? 'Start New Analysis' : 'Pause Analysis'}</button><button onClick={handleCancel} className="flex items-center justify-center gap-1 py-2 text-sm font-semibold text-[#ba1a1a] transition hover:opacity-70"><X size={16} /> Cancel scan</button></div>
          </>
        )}
      </main>

      {notice && <div role="status" className="fixed left-1/2 top-20 z-[60] flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#131b2e] px-4 py-2 text-xs font-semibold text-white shadow-xl"><Info size={15} /> {notice}</div>}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-[#eaedff] bg-[#faf8ff]/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,.04)] backdrop-blur-xl"><div className="mx-auto flex h-16 max-w-3xl items-center justify-around px-4"><NavItem label="Home" icon={<Home size={22} />} active={tab === 'home'} onClick={() => setTab('home')} /><div className="relative -top-5 flex flex-col items-center"><button onClick={() => setTab('scan')} className="flex h-14 w-14 items-center justify-center rounded-full bg-[#006948] text-white shadow-[0_8px_20px_rgba(0,105,72,.35)] transition hover:scale-105 active:scale-95" aria-label="Scan"><ScanLine size={27} /></button><span className={`mt-1 text-[10px] font-bold ${tab === 'scan' ? 'text-[#006948]' : 'text-[#3d4a42]'}`}>Scan</span></div><NavItem label="History" icon={<ReceiptText size={22} />} active={tab === 'history'} onClick={() => setTab('history')} /><NavItem label="Profile" icon={<UserRound size={22} />} active={tab === 'profile'} onClick={() => setTab('profile')} /></div><div className="mx-auto mb-1 h-1 w-32 rounded-full bg-[#bccac0]/60" /></nav>
    </div>
  );
}

function Metric({ icon, label, value, accent = false }: { icon: React.ReactNode; label: string; value: string; accent?: boolean }) { return <div className="flex min-w-0 items-center gap-2 rounded-2xl bg-white p-3 shadow-[0_2px_10px_rgba(29,38,74,.04)]"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaedff] text-[#006948]">{icon}</div><div className="min-w-0"><div className="text-[10px] font-bold uppercase tracking-wide text-[#3d4a42]">{label}</div><div className={`text-lg font-bold leading-6 ${accent ? 'text-[#006948]' : ''}`}>{value}</div></div></div>; }
function NavItem({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) { return <button onClick={onClick} className={`flex h-14 w-16 flex-col items-center justify-center gap-0.5 transition ${active ? 'font-bold text-[#006948]' : 'text-[#3d4a42]'}`}>{icon}<span className="text-[10px]">{label}</span></button>; }
function Placeholder({ tab, onScan }: { tab: Tab; onScan: () => void }) { const title = tab === 'home' ? 'Welcome back.' : tab === 'history' ? 'Scan history' : 'Your profile'; const copy = tab === 'home' ? 'Your latest nutrition analysis is ready whenever you are.' : tab === 'history' ? 'Past analyses will appear here as you scan more foods.' : 'Your allergy preferences and health goals will live here.'; return <div className="flex min-h-[70vh] flex-col items-center justify-center text-center"><div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e2e7ff] text-[#006948]"><FileText size={28} /></div><h1 className="text-2xl font-bold">{title}</h1><p className="mt-2 max-w-sm text-sm leading-6 text-[#3d4a42]">{copy}</p><button onClick={onScan} className="mt-6 rounded-xl bg-[#006948] px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-[#005137]">Open scanner</button></div>; }

export default App;
