import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  ArrowRight, Camera, Check, CircleHelp, Clock3, FileImage,
  History, Info, Leaf, Loader2, Menu, RefreshCw, ScanLine, ShieldCheck,
  Sprout, Upload, X, Zap, AlertTriangle, BookOpen, BarChart3, Layers3,
  Sparkles, CheckCircle2,
} from 'lucide-react';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

type Crop = string;
type ScanResult = {
  crop: Crop;
  healthy: boolean;
  disease: string;
  confidence: number;
  advice: string[];
  image?: string;
  createdAt: string;
};


function LeafMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] ${small ? 'h-8 w-8' : 'h-10 w-10'}`} aria-hidden="true">
      <Leaf className={small ? 'h-4 w-4' : 'h-5 w-5'} strokeWidth={1.8} />
    </span>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const links = [
    { href: '/', label: 'Home' },
    { href: '/scan', label: 'Scan a leaf' },
    { href: '/how-it-works', label: 'How it works' },
    { href: '/about', label: 'About the research' },
  ];
  useEffect(() => setMenuOpen(false), [location]);
  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--background))]">
      <header className="sticky top-0 z-40 border-b border-[hsl(var(--border)/.72)] bg-[hsl(var(--background)/.9)] backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3" data-testid="link-logo">
            <LeafMark small />
            <span className="font-display text-xl font-semibold tracking-[-.02em]">LeafCheck <span className="text-[hsl(var(--accent))]">AI</span></span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
            {links.slice(1).map((link) => (
              <Link key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase().replaceAll(' ', '-')}`} className={`text-sm transition-colors hover:text-[hsl(var(--primary))] ${location === link.href ? 'font-semibold text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}>
                {link.label}
              </Link>
            ))}
            <Link href="/scan" data-testid="link-header-scan" className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2">
              Start a scan <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
          <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label="Open navigation" data-testid="button-open-navigation" className="rounded-lg p-2 text-[hsl(var(--primary))] md:hidden focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {menuOpen && (
          <nav className="border-t border-[hsl(var(--border)/.7)] px-5 py-4 md:hidden" aria-label="Mobile navigation">
            {links.slice(1).map((link) => <Link key={link.href} href={link.href} data-testid={`link-mobile-${link.label.toLowerCase().replaceAll(' ', '-')}`} className="block border-b border-[hsl(var(--border)/.6)] py-3 text-sm text-[hsl(var(--foreground))]">{link.label}</Link>)}
            <Link href="/scan" data-testid="link-mobile-scan" className="mt-4 flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-4 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))]">Start a scan <ArrowRight className="h-4 w-4" /></Link>
          </nav>
        )}
      </header>
      <main className="page-in">{children}</main>
      <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.38)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-8 text-sm text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div className="flex items-center gap-2"><LeafMark small /><span>Practical crop care, one leaf at a time.</span></div>
          <div className="flex gap-5"><Link href="/about" data-testid="link-footer-about" className="hover:text-[hsl(var(--primary))]">About</Link><Link href="/how-it-works" data-testid="link-footer-how" className="hover:text-[hsl(var(--primary))]">How it works</Link></div>
        </div>
      </footer>
    </div>
  );
}

function LeafScanIllustration({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`relative mx-auto aspect-square w-full max-w-[430px] overflow-hidden rounded-[2rem] bg-[#dce8d7] ${compact ? 'max-w-[300px]' : ''}`}>
      <div className="absolute inset-0 opacity-50 leaf-grid" />
      <div className="pulse-ring absolute inset-[14%] rounded-full border border-[#58765c]/25" />
      <div className="absolute inset-[23%] rounded-full border border-[#58765c]/30" />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" role="img" aria-label="Illustration of a leaf inside a scanning frame">
        <path d="M313 83C224 78 119 113 98 207c-19 86 47 128 111 99 67-30 92-125 104-223Z" fill="#6d9970" />
        <path d="M99 300C160 244 221 176 295 96" stroke="#355e45" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M165 237c-30-6-45-17-59-34M204 194c-31-1-52-10-69-25M237 153c-23-1-37-8-54-20M157 247c-6 22-6 38-1 58M203 197c4 22 4 40-2 58M239 157c7 15 9 30 7 46" stroke="#477652" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M56 104v34M56 104h34M344 104v34M344 104h-34M56 296v-34M56 296h34M344 296v-34M344 296h-34" stroke="#f8f5ec" strokeWidth="5" strokeLinecap="round" />
        <path d="M71 200h258" stroke="#f8f5ec" strokeWidth="2" strokeDasharray="6 8" opacity=".7" className="scan-line" />
      </svg>
      <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl bg-[#f8f5ec]/80 px-4 py-3 text-xs text-[#355e45] backdrop-blur-sm">
        <span className="flex items-center gap-2 font-medium"><ScanLine className="h-4 w-4" /> Ready to look closer</span>
        <span className="font-mono-app text-[10px] tracking-wide">FIELD MODE</span>
      </div>
    </div>
  );
}

function Home() {
  useEffect(() => {
    document.title = 'LeafCheck AI — A clearer first read for your crop';
    const meta = document.querySelector('meta[name="description"]') ?? document.createElement('meta');
    meta.setAttribute('name', 'description');
    meta.setAttribute('content', 'LeafCheck AI gives farmers and home growers a calm, quick first read on Tomato, Potato, and Capsicum leaves.');
    document.head.appendChild(meta);
  }, []);
  return (
    <Shell>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-12 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-20 lg:pb-28">
        <div className="rise-in">
          <p className="mb-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-[hsl(var(--accent))]"><span className="h-2 w-2 rounded-full bg-[hsl(var(--accent))]" /> Made for the growing day</p>
          <h1 className="max-w-[680px] font-display text-[clamp(3.25rem,8vw,6.5rem)] leading-[.92] tracking-[-.06em] text-[hsl(var(--primary))]">A clearer first read for your crop.</h1>
          <p className="mt-7 max-w-[520px] text-lg leading-8 text-[hsl(var(--muted-foreground))]">Take a photo of a Tomato, Potato, or Capsicum leaf. LeafCheck helps you notice what may be going on — and what to do next.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/scan" data-testid="link-hero-scan" className="group inline-flex items-center justify-center gap-3 rounded-full bg-[hsl(var(--primary))] px-6 py-3.5 font-semibold text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-md)] transition-all hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2">Check a leaf <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            <Link href="/how-it-works" data-testid="link-hero-learn" className="inline-flex items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] px-6 py-3.5 font-semibold text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--secondary))]">See how it works</Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[hsl(var(--muted-foreground))]"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[hsl(var(--primary))]" /> AI-powered analysis</span><span className="flex items-center gap-2"><Zap className="h-4 w-4 text-[hsl(var(--primary))]" /> A few seconds</span></div>
        </div>
        <div className="rise-in delay-2 relative">
          <div className="absolute -right-4 -top-5 rounded-full bg-[hsl(var(--accent))] px-4 py-2 font-mono-app text-[10px] font-medium tracking-wide text-[hsl(var(--accent-foreground))] shadow-[var(--shadow-sm)] sm:right-2">FIELD NOTE  /  01</div>
          <LeafScanIllustration />
        </div>
      </section>

      <section className="border-y border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.42)]">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 md:grid-cols-3">
          {[
            ['01', 'Notice sooner', 'A small change on a leaf is worth a closer look. Start with an image, not a guess.'],
            ['02', 'Understand simply', 'Get a plain-language result with a confidence signal — no textbook needed.'],
            ['03', 'Choose your next step', 'Use practical care guidance while you decide whether to ask a local expert.'],
          ].map(([num, title, copy], index) => <div key={num} className={`rise-in delay-${index + 1}`}><span className="font-mono-app text-xs text-[hsl(var(--accent))]">{num}</span><h2 className="mt-4 font-display text-2xl text-[hsl(var(--primary))]">{title}</h2><p className="mt-2 max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">{copy}</p></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
          <div><p className="font-mono-app text-xs uppercase tracking-[.18em] text-[hsl(var(--accent))]">A little reassurance</p><h2 className="mt-4 max-w-sm font-display text-4xl leading-tight tracking-[-.04em] text-[hsl(var(--primary))]">When the leaf changes, you do not have to panic.</h2></div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[1.5rem] bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))]"><CircleHelp className="h-6 w-6 opacity-70" /><h3 className="mt-10 font-display text-2xl">Not a final diagnosis</h3><p className="mt-3 text-sm leading-6 opacity-75">LeafCheck is a helpful first signal. Weather, soil, pests, and the full plant story still matter.</p></div>
            <div className="rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7"><Sprout className="h-6 w-6 text-[hsl(var(--accent))]" /><h3 className="mt-10 font-display text-2xl text-[hsl(var(--primary))]">Built around real crops</h3><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Focused on three crops common in Indian fields and gardens, with care notes you can actually use.</p></div>
          </div>
        </div>
      </section>
      <section className="mx-5 mb-16 overflow-hidden rounded-[2rem] bg-[hsl(var(--accent))] sm:mx-8 lg:mx-auto lg:max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-8 px-7 py-10 sm:px-12 sm:py-14 md:flex-row md:items-center"><div><p className="font-mono-app text-xs uppercase tracking-[.18em] text-[hsl(var(--accent-foreground)/.68)]">Your next check</p><h2 className="mt-3 max-w-lg font-display text-4xl leading-tight text-[hsl(var(--accent-foreground))]">One good photo can make the next step easier.</h2></div><Link href="/scan" data-testid="link-bottom-scan" className="inline-flex shrink-0 items-center gap-3 rounded-full bg-[hsl(var(--accent-foreground))] px-6 py-3.5 font-semibold text-[hsl(var(--primary))] transition-transform hover:-translate-y-1">Start with a leaf <ArrowRight className="h-4 w-4" /></Link></div>
      </section>
    </Shell>
  );
}

type DetectionMode = 'auto' | 'Potato' | 'Tomato' | 'Capsicum';

function ScanPage() {
  const [detectionMode, setDetectionMode] = useState<DetectionMode>('auto');
  const [image, setImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => { document.title = 'Scan a leaf — LeafCheck AI'; }, []);
  const onFile = (file?: File) => {
    setError('');
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please choose an image file, such as a JPG or PNG.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('That image is larger than 10 MB. Try a smaller photo.'); return; }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => { setImage(String(reader.result)); setFileName(file.name); };
    reader.readAsDataURL(file);
  };
  const reset = () => { setImage(null); setSelectedFile(null); setFileName(''); setError(''); if (inputRef.current) inputRef.current.value = ''; };
  const analyze = async () => {
    if (!selectedFile || !image) { setError('Add a clear leaf photo before starting the check.'); return; }
    setAnalyzing(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      if (detectionMode !== 'auto') {
        formData.append('crop', detectionMode);
      }

      const res = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg = data && typeof data.error === 'string'
          ? data.error
          : `Server error (${res.status}): Unable to process image.`;
        throw new Error(errorMsg);
      }

      if (!data || typeof data.crop !== 'string' || typeof data.healthy !== 'boolean' || typeof data.confidence !== 'number') {
        throw new Error('Received malformed response from the prediction server.');
      }

      const defaultAdvice = data.healthy ? [
        'Keep watering at the soil level, avoiding the leaves.',
        'Check leaves periodically for changes in color or spots.',
        'Ensure adequate sunlight and proper air circulation.',
      ] : [
        'Isolate or remove severely affected leaves to prevent spread.',
        'Avoid overhead watering to keep leaf surfaces dry.',
        'Consult a local agricultural extension or specialist if symptoms persist.',
      ];

      const displayCrop = data.crop === 'Pepper' ? 'Capsicum (Pepper)' : data.crop;

      const result: ScanResult = {
        crop: displayCrop,
        healthy: data.healthy,
        disease: data.disease ?? (data.healthy ? 'Healthy' : 'Unspecified disease'),
        confidence: data.confidence,
        advice: defaultAdvice,
        image: image ?? undefined,
        createdAt: new Date().toISOString(),
      };

      const previous = JSON.parse(localStorage.getItem('leafcheck-history') ?? '[]') as ScanResult[];
      localStorage.setItem('leafcheck-result', JSON.stringify(result));
      localStorage.setItem('leafcheck-history', JSON.stringify([result, ...previous].slice(0, 5)));

      setLocation('/result');
    } catch (err: any) {
      setError(err.message || 'Network error: Unable to connect to prediction server.');
    } finally {
      setAnalyzing(false);
    }
  };
  return (
    <Shell>
      <div className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16">
        <div className="max-w-2xl"><p className="font-mono-app text-xs uppercase tracking-[.18em] text-[hsl(var(--accent))]">Leaf check / 01</p><h1 className="mt-4 font-display text-5xl leading-[.98] tracking-[-.05em] text-[hsl(var(--primary))] sm:text-6xl">Let us take a closer look.</h1><p className="mt-5 text-base leading-7 text-[hsl(var(--muted-foreground))]">Upload one clear leaf photo. Use Auto-detect or select your crop below for targeted diagnosis.</p></div>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <section className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-sm)] sm:p-8" aria-label="Upload a leaf photo">
            <div className={`relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-[1.4rem] border-2 border-dashed ${image ? 'border-[hsl(var(--primary)/.45)] bg-[hsl(var(--secondary)/.35)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.28)]'}`}>
              {image ? <><img src={image} alt="Selected leaf preview" data-testid="img-leaf-preview" className="absolute inset-0 h-full w-full object-contain p-3" /><div className="absolute left-4 top-4 rounded-full bg-[hsl(var(--card)/.88)] px-3 py-1.5 text-xs font-medium text-[hsl(var(--primary))] shadow-[var(--shadow-sm)]"><Check className="mr-1 inline h-3.5 w-3.5" /> Photo ready</div></> : <div className="px-6 text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Upload className="h-7 w-7" /></div><h2 className="mt-5 font-display text-2xl text-[hsl(var(--primary))]">Add a leaf photo</h2><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-[hsl(var(--muted-foreground))]">Use a well-lit photo. Keep the leaf steady and fill most of the frame.</p><button type="button" onClick={() => inputRef.current?.click()} data-testid="button-choose-photo" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))]"><Camera className="h-4 w-4" /> Take or choose photo</button></div>}
              <input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={(event) => onFile(event.target.files?.[0])} data-testid="input-leaf-photo" className="sr-only" aria-label="Choose a leaf image" />
            </div>
            {image && <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-[hsl(var(--secondary)/.65)] px-4 py-3 text-sm"><span className="flex min-w-0 items-center gap-2 truncate text-[hsl(var(--foreground))]"><FileImage className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" /> <span className="truncate">{fileName}</span></span><button type="button" onClick={reset} data-testid="button-reset-photo" className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[hsl(var(--primary))] hover:underline"><RefreshCw className="h-3.5 w-3.5" /> Replace</button></div>}
          </section>
          <section className="flex flex-col rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-[var(--shadow-sm)] sm:p-8">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-3 py-1 text-xs font-semibold text-[hsl(var(--primary))]">
                <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--accent))]" />
                <span>AI Crop & Health Scan</span>
              </div>
              <h2 className="mt-4 font-display text-3xl leading-tight text-[hsl(var(--primary))]">
                Leaf Check & Diagnosis
              </h2>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
                Leave on <strong>Auto-detect</strong> for full automatic recognition, or select your crop below for targeted diagnosis.
              </p>
            </div>

            <div className="mt-5 rounded-2xl border border-[hsl(var(--border)/.8)] bg-[hsl(var(--secondary)/.3)] p-4">
              <div className="flex items-center justify-between">
                <p className="font-mono-app text-[10px] font-medium uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">
                  Crop Detection Mode
                </p>
                {detectionMode !== 'auto' && (
                  <button
                    type="button"
                    onClick={() => setDetectionMode('auto')}
                    className="text-[11px] font-semibold text-[hsl(var(--accent))] hover:underline"
                  >
                    Reset to Auto
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <button
                  type="button"
                  onClick={() => setDetectionMode('auto')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] ${detectionMode === 'auto' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-sm)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/.5)]'}`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Auto</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetectionMode('Potato')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] ${detectionMode === 'Potato' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-sm)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/.5)]'}`}
                >
                  <span>🥔</span>
                  <span>Potato</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetectionMode('Tomato')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] ${detectionMode === 'Tomato' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-sm)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/.5)]'}`}
                >
                  <span>🍅</span>
                  <span>Tomato</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetectionMode('Capsicum')}
                  className={`flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-2.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] ${detectionMode === 'Capsicum' ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-sm)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary)/.5)]'}`}
                >
                  <span>🫑</span>
                  <span>Capsicum</span>
                </button>
              </div>
              <p className="mt-2.5 text-[11px] leading-4 text-[hsl(var(--muted-foreground))]">
                {detectionMode === 'auto' && '✨ AI will auto-detect whether the leaf is Tomato, Potato, or Capsicum.'}
                {detectionMode === 'Potato' && '🥔 Diagnosing specifically across Potato Early Blight, Late Blight & Healthy leaf conditions.'}
                {detectionMode === 'Tomato' && '🍅 Diagnosing specifically across 10 Tomato conditions & leaf health.'}
                {detectionMode === 'Capsicum' && '🫑 Diagnosing specifically across Capsicum / Bell Pepper conditions.'}
              </p>
            </div>

            <div className="mt-6 space-y-2.5">
              <p className="font-mono-app text-[10px] font-medium uppercase tracking-[.18em] text-[hsl(var(--muted-foreground))]">
                For clear results
              </p>
              <div className="grid gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                <div className="flex items-center gap-2.5 rounded-xl bg-[hsl(var(--secondary)/.35)] px-3.5 py-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                  <span><strong>Single leaf focus:</strong> Fill most of the camera frame with one leaf.</span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl bg-[hsl(var(--secondary)/.35)] px-3.5 py-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[hsl(var(--primary))]" />
                  <span><strong>Natural daylight:</strong> Avoid harsh flash glare or dark shadows.</span>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-7">
              {image ? (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-[hsl(var(--primary)/.08)] px-3.5 py-2.5 text-xs font-medium text-[hsl(var(--primary))]">
                  <Check className="h-3.5 w-3.5 shrink-0" />
                  <span>Photo ready — click below to start analysis</span>
                </div>
              ) : (
                <div className="mb-4 flex items-center gap-2 rounded-xl bg-[hsl(var(--secondary)/.5)] px-3.5 py-2.5 text-xs text-[hsl(var(--muted-foreground))]">
                  <Info className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--accent))]" />
                  <span>Upload or take a photo on the left to begin.</span>
                </div>
              )}

              {error && (
                <p role="alert" data-testid="status-scan-error" className="mb-4 flex items-start gap-2 text-sm leading-5 text-[hsl(var(--destructive))]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </p>
              )}

              {analyzing ? (
                <div data-testid="status-analysis-progress" className="flex items-center justify-center gap-3 rounded-full bg-[hsl(var(--secondary))] px-5 py-3.5 text-sm font-medium text-[hsl(var(--primary))]">
                  <Loader2 className="h-4 w-4 animate-spin text-[hsl(var(--accent))]" />
                  <span>Identifying crop & analyzing health...</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={analyze}
                  disabled={analyzing}
                  data-testid="button-analyze-leaf"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3.5 font-semibold text-[hsl(var(--primary-foreground))] shadow-[var(--shadow-sm)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring))] focus:ring-offset-2 disabled:opacity-50"
                >
                  Check this leaf <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>
        </div>
        <HistoryBlock />
      </div>
    </Shell>
  );
}

function HistoryBlock() {
  const history = useMemo(() => { try { return JSON.parse(localStorage.getItem('leafcheck-history') ?? '[]') as ScanResult[]; } catch { return []; } }, []);
  if (!history.length) return <div className="mt-10 flex items-center gap-3 rounded-2xl border border-dashed border-[hsl(var(--border))] px-5 py-4 text-sm text-[hsl(var(--muted-foreground))]"><Clock3 className="h-4 w-4 text-[hsl(var(--accent))]" /> Your recent checks will appear here on this device.</div>;
  return <div className="mt-10"><div className="mb-4 flex items-center gap-2 text-sm font-semibold text-[hsl(var(--primary))]"><History className="h-4 w-4" /> Recent checks</div><div className="flex flex-wrap gap-3">{history.slice(0, 3).map((item, i) => <Link href="/result" key={`${item.createdAt}-${i}`} data-testid={`link-history-${i}`} className="flex items-center gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm transition-colors hover:border-[hsl(var(--primary)/.5)]"><span className={`h-2 w-2 rounded-full ${item.healthy ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--accent))]'}`} /><span>{item.crop}</span><span className="text-[hsl(var(--muted-foreground))]">{item.healthy ? 'Looks healthy' : item.disease}</span></Link>)}</div></div>;
}

function ResultPage() {
  const [, setLocation] = useLocation();
  const [result, setResult] = useState<ScanResult | null>(null);
  useEffect(() => {
    document.title = 'Your leaf check — LeafCheck AI';
    try {
      const saved = localStorage.getItem('leafcheck-result');
      setResult(saved ? JSON.parse(saved) as ScanResult : null);
    } catch { setResult(null); }
  }, []);
  if (!result) return <Shell><div className="mx-auto max-w-2xl px-5 py-24 text-center"><p className="text-sm text-[hsl(var(--destructive))]">We could not open that check.</p><Link href="/scan" data-testid="link-result-retry" className="mt-5 inline-flex rounded-full bg-[hsl(var(--primary))] px-5 py-3 text-sm font-semibold text-[hsl(var(--primary-foreground))]">Try another photo</Link></div></Shell>;
  
  const displayConfidence = typeof result.confidence === 'number'
    ? (result.confidence <= 1 ? result.confidence * 100 : result.confidence)
    : 0;

  return <Shell><div className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="font-mono-app text-xs uppercase tracking-[.18em] text-[hsl(var(--accent))]">Leaf check / result</p><h1 className="mt-4 font-display text-5xl leading-[.98] tracking-[-.05em] text-[hsl(var(--primary))]">Here is your first read.</h1></div><span className="font-mono-app text-xs text-[hsl(var(--muted-foreground))]">{new Date(result.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></div>
    <div className="mt-12 grid gap-8 lg:grid-cols-[.85fr_1.15fr]">
      <div className="overflow-hidden rounded-[2rem] bg-[#dce8d7]">{result.image ? <img src={result.image} alt={`Uploaded ${result.crop} leaf`} data-testid="img-result-leaf" className="aspect-square w-full object-contain p-4" /> : <div className="p-6"><LeafScanIllustration compact /></div>}</div>
      <div className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-[var(--shadow-sm)] sm:p-9">
        <div className="flex flex-wrap items-center gap-3"><span className="rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--primary))]">{result.crop}</span><span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${result.healthy ? 'bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : 'bg-[hsl(var(--accent)/.14)] text-[hsl(var(--accent-foreground))]'}`}><span className={`h-1.5 w-1.5 rounded-full ${result.healthy ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--accent))]'}`} />{result.healthy ? 'Looks healthy' : 'Needs a closer look'}</span></div>
        <h2 data-testid="text-result-disease" className="mt-8 font-display text-4xl leading-tight tracking-[-.035em] text-[hsl(var(--primary))]">{result.healthy ? 'No clear signs of disease' : result.disease}</h2>
        <p className="mt-4 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))]">{result.healthy ? 'The photo looks like a healthy leaf to us. Keep an eye on the plant as it grows.' : 'The photo shows patterns that can be associated with this issue. It is a useful signal, not a final diagnosis.'}</p>
        <div className="mt-8 border-y border-[hsl(var(--border))] py-5"><div className="flex items-center justify-between text-sm"><span className="text-[hsl(var(--muted-foreground))]">Confidence in this first read</span><strong data-testid="text-result-confidence" className="font-mono-app text-[hsl(var(--primary))]">{displayConfidence.toFixed(1)}%</strong></div><div className="mt-3 h-2 rounded-full bg-[hsl(var(--secondary))]"><div className="h-full rounded-full bg-[hsl(var(--accent))]" style={{ width: `${Math.min(100, Math.max(0, displayConfidence))}%` }} /></div></div>
        <div className="mt-7"><h3 className="flex items-center gap-2 font-semibold text-[hsl(var(--foreground))]"><Sprout className="h-4 w-4 text-[hsl(var(--accent))]" /> What you can do now</h3><ul className="mt-4 space-y-3">{result.advice.map((advice, i) => <li key={advice} data-testid={`text-result-advice-${i}`} className="flex gap-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]"><span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--secondary))] font-mono-app text-[10px] text-[hsl(var(--primary))]">{i + 1}</span>{advice}</li>)}</ul></div>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/scan" data-testid="link-result-rescan" className="inline-flex items-center justify-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5"><RefreshCw className="h-4 w-4" /> Check another leaf</Link><button type="button" onClick={() => { localStorage.removeItem('leafcheck-result'); setLocation('/scan'); }} data-testid="button-clear-result" className="inline-flex items-center justify-center gap-2 rounded-full border border-[hsl(var(--border))] px-5 py-3 font-semibold text-[hsl(var(--primary))] hover:bg-[hsl(var(--secondary))]">Clear result</button></div>
      </div>
    </div>
    <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-5 text-[hsl(var(--muted-foreground))]">A photo-based check cannot see everything a farmer can. If your plant is declining quickly, use this as a starting point and speak with a local expert.</p>
  </div></Shell>;
}

function HowItWorks() {
  useEffect(() => { document.title = 'How LeafCheck works — LeafCheck AI'; }, []);
  const steps = [
    { icon: Camera, number: '01', title: 'You share a leaf', copy: 'Take a clear photo of a Tomato, Potato, or Capsicum leaf. Our AI automatically detects the crop and evaluates health.' },
    { icon: ScanLine, number: '02', title: 'We look for patterns', copy: 'LeafCheck compares what it sees with crop examples and looks for visual clues that stand out.' },
    { icon: Check, number: '03', title: 'You get a next step', copy: 'The result keeps the language simple: what it may be, how sure the signal is, and what you can do now.' },
  ];
  return <Shell><div className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16"><div className="max-w-3xl"><p className="font-mono-app text-xs uppercase tracking-[.18em] text-[hsl(var(--accent))]">No mystery, just three steps</p><h1 className="mt-4 font-display text-5xl leading-[.98] tracking-[-.05em] text-[hsl(var(--primary))] sm:text-6xl">From leaf to a little more confidence.</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[hsl(var(--muted-foreground))]">Designed for a quick check in the field, in the garden, or wherever your plant is growing.</p></div><div className="mt-16 grid gap-5 lg:grid-cols-3">{steps.map(({ icon: Icon, number, title, copy }) => <article key={number} className="relative rounded-[1.5rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 shadow-[var(--shadow-sm)]"><span className="font-mono-app text-xs text-[hsl(var(--accent))]">{number}</span><div className="mt-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]"><Icon className="h-5 w-5" /></div><h2 className="mt-7 font-display text-2xl text-[hsl(var(--primary))]">{title}</h2><p className="mt-3 text-sm leading-6 text-[hsl(var(--muted-foreground))]">{copy}</p></article>)}</div><div className="mt-8 grid gap-8 rounded-[2rem] bg-[hsl(var(--primary))] p-7 text-[hsl(var(--primary-foreground))] sm:p-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center"><div><p className="font-mono-app text-xs uppercase tracking-[.16em] opacity-60">The short version</p><h2 className="mt-4 font-display text-3xl">A second pair of eyes, not an authority.</h2></div><div className="grid gap-5 sm:grid-cols-2"><div className="border-l border-[hsl(var(--primary-foreground)/.25)] pl-5"><Layers3 className="h-5 w-5 opacity-70" /><p className="mt-3 text-sm leading-6 opacity-75">It works from visual patterns in a photo, so the angle and light can affect the result.</p></div><div className="border-l border-[hsl(var(--primary-foreground)/.25)] pl-5"><ShieldCheck className="h-5 w-5 opacity-70" /><p className="mt-3 text-sm leading-6 opacity-75">Use the result alongside your own observations and local growing knowledge.</p></div></div></div><div className="mt-20 grid items-center gap-10 lg:grid-cols-[1fr_.8fr]"><div><p className="font-mono-app text-xs uppercase tracking-[.16em] text-[hsl(var(--accent))]">For a better photo</p><h2 className="mt-4 font-display text-4xl tracking-[-.04em] text-[hsl(var(--primary))]">Three small things help a lot.</h2><ul className="mt-7 space-y-4">{['Use daylight, not a harsh flash.', 'Keep the whole leaf in the frame.', 'Avoid water drops and strong shadows.'].map((item) => <li key={item} className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))]"><Check className="h-4 w-4 text-[hsl(var(--accent))]" />{item}</li>)}</ul></div><LeafScanIllustration compact /></div></div></Shell>;
}

function About() {
  useEffect(() => { document.title = 'About the research — LeafCheck AI'; }, []);
  return <Shell><div className="mx-auto max-w-6xl px-5 pb-20 pt-12 sm:px-8 sm:pt-16"><div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]"><div><p className="font-mono-app text-xs uppercase tracking-[.18em] text-[hsl(var(--accent))]">Behind the first read</p><h1 className="mt-4 font-display text-5xl leading-[.98] tracking-[-.05em] text-[hsl(var(--primary))] sm:text-6xl">Useful research, honestly explained.</h1></div><div className="max-w-xl pt-2 text-base leading-8 text-[hsl(var(--muted-foreground))]"><p>LeafCheck AI began as a Vision AI research project: can a photograph help a grower spot common leaf disease patterns earlier?</p><p className="mt-5">This MVP turns that question into a simple field companion. It is deliberately focused, transparent, and still learning.</p></div></div><div className="mt-16 grid gap-5 md:grid-cols-2"><InfoCard icon={BookOpen} label="Research context" title="Learning from crop examples" copy="The research uses the PlantVillage-style Kaggle dataset context, where labeled images help a model learn the visual difference between healthy and affected leaves. Dataset images are a useful starting point, not a substitute for field conditions." /><InfoCard icon={BarChart3} label="Model approach" title="Transfer learning, made practical" copy="The exploration compares transfer-learning approaches using MobileNetV2 and ResNet50. Starting from models that already understand visual shapes helps an MVP learn crop-specific patterns with less data and time." /></div><section className="mt-5 rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/.5)] p-7 sm:p-10"><div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between"><div className="max-w-lg"><p className="font-mono-app text-xs uppercase tracking-[.16em] text-[hsl(var(--accent))]">A responsible boundary</p><h2 className="mt-4 font-display text-3xl text-[hsl(var(--primary))]">What this MVP cannot see yet</h2><p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">A leaf photo does not show soil health, weather history, pests hiding under leaves, or how quickly a problem is spreading. Lighting, camera quality, and varieties can also change what the model sees.</p></div><div className="grid gap-3 text-sm text-[hsl(var(--foreground))] sm:grid-cols-2 lg:max-w-md">{['Not a final diagnosis', 'Limited to three crops', 'Results can be affected by photo quality', 'Local expert advice still matters'].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl bg-[hsl(var(--card)/.7)] px-4 py-3"><CircleHelp className="h-4 w-4 shrink-0 text-[hsl(var(--accent))]" />{item}</div>)}</div></div></section><div className="mt-16 flex flex-col items-start justify-between gap-6 border-t border-[hsl(var(--border))] pt-8 sm:flex-row sm:items-center"><p className="max-w-xl text-sm leading-6 text-[hsl(var(--muted-foreground))]">Good tools do not replace a farmer's eye. They give it one more useful signal.</p><Link href="/scan" data-testid="link-about-scan" className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--primary))] px-5 py-3 font-semibold text-[hsl(var(--primary-foreground))]">Try a leaf check <ArrowRight className="h-4 w-4" /></Link></div></div></Shell>;
}

function InfoCard({ icon: Icon, label, title, copy }: { icon: typeof BookOpen; label: string; title: string; copy: string }) {
  return <article className="rounded-[2rem] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-7 shadow-[var(--shadow-sm)] sm:p-9"><Icon className="h-6 w-6 text-[hsl(var(--accent))]" /><p className="mt-8 font-mono-app text-[10px] uppercase tracking-[.16em] text-[hsl(var(--muted-foreground))]">{label}</p><h2 className="mt-3 font-display text-3xl text-[hsl(var(--primary))]">{title}</h2><p className="mt-4 text-sm leading-7 text-[hsl(var(--muted-foreground))]">{copy}</p></article>;
}

function Router() {
  return <ErrorBoundary resetKey={window.location.pathname}><Switch><Route path="/" component={Home} /><Route path="/scan" component={ScanPage} /><Route path="/result" component={ResultPage} /><Route path="/how-it-works" component={HowItWorks} /><Route path="/about" component={About} /><Route component={NotFound} /></Switch></ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;