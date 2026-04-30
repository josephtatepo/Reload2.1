import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@/lib/i18n";
import {
  MonitorPlay,
  Radio,
  Globe,
  Music2,
  Library,
  Search,
  ArrowUpRight,
  Sparkles,
  Loader2,
  Play,
  Pause,
  Music,
  Users,
  Crown,
  Lock,
  Film,
} from "lucide-react";
import { BuzzIcon, DropsIcon } from "@/components/brand-icons";
import {
  CinemaModal,
  FALLBACK_DOCS,
  fetchDocs,
  READING_BY_POSITION,
  type Documentary,
} from "@/lib/documentaries";
import { Wordmark } from "@/components/wordmark";

type FeaturedSong = {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string | null;
  audioUrl: string;
  genre: string | null;
  price: number;
};

export default function Home() {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("live");
  const [openDoc, setOpenDoc] = useState<Documentary | null>(null);

  const { data: docsData } = useQuery<Documentary[]>({
    queryKey: ["documentaries-csv"],
    queryFn: fetchDocs,
    retry: 1,
    staleTime: 1000 * 30,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const docs = ((docsData && docsData.length >= 3) ? docsData : FALLBACK_DOCS)
    .slice(0, 3)
    .map((d, i) => ({ ...d, reading: d.reading ?? READING_BY_POSITION[i] }));

  const [isScrolled, setIsScrolled] = useState(false);
  const [isGeneratingAura, setIsGeneratingAura] = useState(false);
  const [auraDescription, setAuraDescription] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const spotifyIframeRef = useRef<HTMLIFrameElement>(null);

  const stopSpotifyEmbed = () => {
    const iframe = spotifyIframeRef.current;
    if (!iframe) return;
    const src = iframe.src;
    iframe.src = src;
  };

  const { data: featuredData } = useQuery<{ song?: FeaturedSong }>({
    queryKey: ["/api/featured/homepage_hero"],
    retry: false,
  });
  const featuredSong = featuredData?.song;

  const { data: memberData } = useQuery<{ count: number }>({
    queryKey: ["/api/member-count"],
    retry: false,
    refetchInterval: 30000,
  });
  const memberCount = memberData?.count || 0;
  const totalSpots = 100;
  const spotsRemaining = Math.max(0, totalSpots - memberCount);
  const fillPercent = Math.min(100, (memberCount / totalSpots) * 100);
  const isFull = memberCount >= totalSpots;

  const togglePlay = () => {
    if (!audioRef.current || !featuredSong) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      stopSpotifyEmbed();
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mutual exclusion: when the user clicks into the Spotify iframe (window blurs
  // and focus moves to the iframe element), pause the featured-song audio so
  // both players don't play over each other.
  useEffect(() => {
    const handleBlur = () => {
      window.setTimeout(() => {
        if (
          document.activeElement === spotifyIframeRef.current &&
          audioRef.current &&
          !audioRef.current.paused
        ) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }, 60);
    };
    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, []);

  const generateRadioAura = async () => {
    setIsGeneratingAura(true);
    try {
      const response = await fetch("/api/oracle/aura", { method: "POST" });
      const data = await response.json();
      setAuraDescription(data.aura || "The oracle is recalibrating the diaspora frequency.");
    } catch (err) {
      setAuraDescription("The oracle is recalibrating the diaspora frequency.");
    } finally {
      setIsGeneratingAura(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-accent/30 overflow-x-hidden">
      
      {/* BACKGROUND ELEMENTS: Grid + animated lava-lamp glows + ripple rings */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        {/* Lava-lamp blobs — drift slowly while breathing like a heartbeat */}
        <div
          className="lava-blob lava-drift-a"
          style={{
            top: '-12%',
            left: '-8%',
            width: '46%',
            height: '46%',
            background: 'radial-gradient(circle at 30% 30%, rgba(34,211,238,0.55), rgba(34,211,238,0.18) 45%, transparent 70%)',
          }}
        />
        <div
          className="lava-blob lava-drift-b"
          style={{
            top: '18%',
            right: '-10%',
            width: '42%',
            height: '46%',
            background: 'radial-gradient(circle at 60% 40%, rgba(244,190,68,0.5), rgba(244,190,68,0.16) 45%, transparent 70%)',
          }}
        />
        <div
          className="lava-blob lava-drift-c"
          style={{
            bottom: '-15%',
            left: '20%',
            width: '50%',
            height: '50%',
            background: 'radial-gradient(circle at 50% 50%, rgba(217,70,239,0.42), rgba(217,70,239,0.14) 45%, transparent 70%)',
          }}
        />

        {/* Water-drop ripple rings — outgoing circles of impact */}
        <div className="absolute top-[28%] left-[18%]">
          <div className="ripple-ring" style={{ borderColor: 'rgba(34,211,238,0.35)' }} />
          <div className="ripple-ring delay-1" style={{ borderColor: 'rgba(34,211,238,0.25)' }} />
          <div className="ripple-ring delay-2" style={{ borderColor: 'rgba(34,211,238,0.18)' }} />
        </div>
        <div className="absolute top-[55%] right-[15%]">
          <div className="ripple-ring" style={{ borderColor: 'rgba(244,190,68,0.32)' }} />
          <div className="ripple-ring delay-1" style={{ borderColor: 'rgba(244,190,68,0.22)' }} />
          <div className="ripple-ring delay-2" style={{ borderColor: 'rgba(244,190,68,0.16)' }} />
        </div>
      </div>

      {/* HEADER */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "py-4 bg-black/80 backdrop-blur-2xl border-b border-white/5" : "py-8"}`}>
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 shrink-0" data-testid="link-brand">
            <Wordmark size="md" />
            <span className="text-xs font-medium text-zinc-500 tracking-wider lowercase" data-testid="text-brand-by">by</span>
            <img
              src="/logo-afrokaviar.png"
              alt="Afrokaviar"
              className="h-5 sm:h-6 w-auto"
              data-testid="img-brand-afrokaviar"
            />
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/auth" data-testid="link-join">
              <button className="px-3 sm:px-6 py-2 text-[10px] font-black uppercase tracking-widest bg-cyan-500 text-black rounded-lg hover:bg-cyan-400 transition-all flex items-center gap-1.5 sm:gap-2" data-testid="button-join">
                <span className="sm:hidden">Sign in</span>
                <span className="hidden sm:inline">Sign in to Reload</span>
                <ArrowUpRight size={12} strokeWidth={3} />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="relative pt-48 pb-20 px-6 md:px-10 z-10 max-w-[1440px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Left side - Hero text */}
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center space-x-3 bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5" data-testid="badge-hero">
              <Sparkles size={12} className="text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Watch • Listen • Attend</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.05] max-w-3xl" data-testid="text-hero-title">
              A premium Afro-<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-400 to-zinc-600">lounge</span><br />for radio, TV, and drops.
            </h1>

            <p className="text-zinc-500 text-lg md:text-xl font-medium max-w-xl leading-relaxed" data-testid="text-hero-subtitle">
              Reload is your culture operating system — a sleek, dark-mode-first streaming experience built for the diaspora.
            </p>
          </div>

          {/* Right side - Featured Album (top) + Featured Song (bottom) */}
          <div className="w-full lg:w-auto lg:min-w-[340px] lg:max-w-[380px] lg:mt-12 space-y-4">

            {/* Featured Album — compact Spotify embed */}
            <div className="group bg-gradient-to-br from-[#0d0d0f]/80 to-[#1f0d1a]/60 backdrop-blur-xl border border-fuchsia-500/20 rounded-[2rem] p-5 hover:border-fuchsia-500/40 transition-all relative overflow-hidden" data-testid="card-featured-album">
              <div aria-hidden="true" className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-fuchsia-500/15 to-transparent rounded-full blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black text-fuchsia-300 uppercase tracking-widest flex items-center gap-2">
                    <Music2 className="h-3 w-3" />
                    Featured Album
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-fuchsia-500/15 border border-fuchsia-500/30 text-fuchsia-200 text-[8px] font-black uppercase tracking-[0.2em]">
                    <span className="w-1 h-1 rounded-full bg-fuchsia-300 animate-pulse" />
                    New
                  </span>
                </div>

                <div className="rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-fuchsia-500/5" data-testid="embed-featured-album-spotify">
                  <iframe
                    ref={spotifyIframeRef}
                    title="Featured album on Spotify"
                    style={{ borderRadius: '12px', display: 'block' }}
                    src="https://open.spotify.com/embed/album/1xthXOrS0skSqQUvBTFRBO?utm_source=generator&theme=0"
                    width="100%"
                    height={152}
                    frameBorder={0}
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>

                <p className="mt-3 text-[10px] text-zinc-500 leading-relaxed">
                  Tap play to preview. Full album streaming on Spotify.
                </p>
              </div>
            </div>

            <div className="group bg-gradient-to-br from-[#0d0d0f]/80 to-[#1a1a1f]/60 backdrop-blur-xl border border-accent/20 rounded-[2rem] p-6 hover:border-accent/40 transition-all relative overflow-hidden" data-testid="card-featured-song">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-2xl" />
              <div className="relative z-10">
                <span className="text-[10px] font-black text-accent uppercase tracking-widest mb-3 block flex items-center gap-2">
                  <Music className="h-3 w-3" />
                  Featured Song
                </span>
                
                <div className="flex items-center gap-4 mb-4">
                  {featuredSong?.artworkUrl ? (
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 group-hover:scale-105 transition-transform relative shrink-0 cursor-pointer"
                      data-testid="button-featured-play"
                    >
                      <img src={featuredSong.artworkUrl} alt={featuredSong.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {isPlaying ? <Pause className="h-5 w-5 text-white fill-white" /> : <Play className="h-5 w-5 text-white fill-white" />}
                      </div>
                    </button>
                  ) : (
                    <button
                      onClick={togglePlay}
                      className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform shrink-0 cursor-pointer"
                      data-testid="button-featured-play"
                    >
                      {isPlaying ? <Pause className="h-6 w-6 text-white fill-white" /> : <Play className="h-6 w-6 text-white fill-white" />}
                    </button>
                  )}
                  <div>
                    <h4 className="text-lg font-bold text-white" data-testid="text-featured-song-title">
                      {featuredSong?.title || "Coming Soon"}
                    </h4>
                    <p className="text-sm text-zinc-400" data-testid="text-featured-song-artist">
                      {featuredSong?.artist || "Stay tuned"}
                    </p>
                    {featuredSong?.genre && (
                      <p className="text-xs text-zinc-500 mt-0.5">{featuredSong.genre}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {featuredSong ? (
                    <>
                      <button
                        onClick={togglePlay}
                        className="bg-accent text-black px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all"
                        data-testid="button-featured-listen"
                      >
                        {isPlaying ? "Pause" : "Listen Now"}
                      </button>
                      <span className="text-xs text-zinc-500">${(featuredSong.price / 100).toFixed(0)}</span>
                    </>
                  ) : (
                    <Link href="/auth" data-testid="link-featured-song">
                      <button className="bg-accent text-black px-4 py-2 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all">
                        Sign In
                      </button>
                    </Link>
                  )}
                </div>

                {featuredSong && (
                  <audio
                    ref={audioRef}
                    src={featuredSong.audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onError={() => setIsPlaying(false)}
                    preload="none"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
          
          {/* Card 1: Featured Drop */}
          <div className="group bg-[#0d0d0f]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:border-accent/30 transition-all relative overflow-hidden" data-testid="card-featured-drop">
            <div className="relative z-10">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 block" data-testid="text-featured-label">Featured Drop</span>
              <h3 className="text-2xl font-black mb-2" data-testid="text-featured-title">Paid Song Drop</h3>
              <p className="text-zinc-500 text-sm mb-8 leading-relaxed" data-testid="text-featured-desc">Preview 60s. Buy for $1 and keep it forever.</p>
              
              <div className="flex items-center space-x-2">
                <button className="bg-accent text-black px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all" data-testid="button-featured-play">
                  Play Preview
                </button>
                <button className="bg-white/5 text-white px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/10 transition-all" data-testid="button-featured-buy">
                  Buy $1
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Continue */}
          <div className="group bg-[#0d0d0f]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:border-zinc-700 transition-all" data-testid="card-continue">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 block" data-testid="text-continue-label">Continue</span>
            <h3 className="text-2xl font-black mb-2" data-testid="text-continue-title">Where you left off</h3>
            <p className="text-zinc-500 text-sm mb-8 leading-relaxed" data-testid="text-continue-desc">Your saved & recently played drops — all in one row.</p>
            
            <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-zinc-300 text-[10px] font-black uppercase tracking-widest transition-all" data-testid="button-continue">
              View for you
            </button>
          </div>

          {/* Card 3: Unified Discovery */}
          <div className="group bg-[#0d0d0f]/60 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:border-cyan-500/30 transition-all relative overflow-hidden" data-testid="card-discovery">
            <div className="relative z-10">
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 block" data-testid="text-discovery-label">Unified Discovery</span>
              <h3 className="text-2xl font-black mb-2" data-testid="text-discovery-title">One search. All verticals.</h3>
              <p className="text-zinc-500 text-sm mb-8 leading-relaxed" data-testid="text-discovery-desc">Search Radio, TV, Music, Social, and Library.</p>
              
              <Link href="/auth" data-testid="link-discovery">
                <button className="w-full py-3 bg-cyan-500 text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/10" data-testid="button-discovery">
                  Enter Reload
                </button>
              </Link>
            </div>
            <div className="absolute -bottom-10 -right-10 opacity-5 group-hover:opacity-10 transition-opacity">
              <Search size={160} />
            </div>
          </div>

        </div>

        {/* AI ORACLE SNIPPET */}
        <div className="mt-12 flex items-center justify-center">
          <div className="bg-[#0d0d0f]/40 border border-white/5 rounded-2xl px-6 py-4 flex items-center space-x-6 max-w-2xl w-full">
            <button 
              onClick={generateRadioAura}
              className="shrink-0 w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center text-accent hover:bg-white/10 transition-all group"
              data-testid="button-oracle"
            >
              {isGeneratingAura ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="group-hover:scale-110 transition-transform" />}
            </button>
            <div className="flex-1">
              <div className="text-[9px] font-black text-accent uppercase tracking-widest mb-1">✨ Oracle Aura Decoder</div>
              <p className="text-xs text-zinc-500 italic font-medium" data-testid="text-oracle-aura">
                {auraDescription || "Tap the oracle to decode the current cultural frequency."}
              </p>
            </div>
          </div>
        </div>

        {/* FOUNDATION MEMBERS */}
        <div className="mt-20" data-testid="section-foundation-members">
          <div className="bg-gradient-to-br from-[#0d0d0f]/80 to-[#111115]/60 backdrop-blur-xl border border-accent/20 rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full">
              <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-accent/5 blur-[100px] rounded-full" />
              <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-cyan-500/5 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center">
                  <Crown size={18} className="text-accent" />
                </div>
                <div>
                  <span className="text-[10px] font-black text-accent uppercase tracking-widest block">Foundation Members</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest">First 100 Pioneers</span>
                </div>
              </div>

              <h3 className="text-2xl md:text-3xl font-black mb-3" data-testid="text-foundation-title">
                {isFull ? "The founding circle is complete." : "Be among the first 100."}
              </h3>
              <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-xl mb-8" data-testid="text-foundation-desc">
                {isFull
                  ? "All 100 foundation spots have been claimed. New members join by invitation only from existing foundation members."
                  : "The first 100 members shape the culture. Join as a Foundation Member and help define the future of the diaspora's digital home."}
              </p>

              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                    <Users size={12} />
                    {memberCount} / {totalSpots} spots claimed
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: isFull ? '#ef4444' : '#22d3ee' }}>
                    {isFull ? "Full" : `${spotsRemaining} remaining`}
                  </span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden" data-testid="progress-foundation-bar">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out"
                    style={{
                      width: `${fillPercent}%`,
                      background: isFull
                        ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                        : 'linear-gradient(90deg, #22d3ee, #F4BE44)',
                    }}
                  />
                </div>
              </div>

              {/* Spot indicators - visual dots */}
              <div className="flex flex-wrap gap-1 mb-8 max-w-md" data-testid="foundation-spots-grid">
                {Array.from({ length: Math.min(totalSpots, 100) }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i < memberCount
                        ? "bg-accent shadow-[0_0_4px_rgba(244,190,68,0.4)]"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              {/* CTA */}
              {isFull ? (
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-5 py-3 w-fit" data-testid="badge-invitation-only">
                  <Lock size={14} className="text-zinc-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    Invitation only
                  </span>
                </div>
              ) : (
                <Link href="/auth" data-testid="link-foundation-join">
                  <button className="bg-accent text-black px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg shadow-accent/20 flex items-center gap-2" data-testid="button-foundation-join">
                    <span>Claim Your Spot</span>
                    <ArrowUpRight size={12} strokeWidth={3} />
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* DOCUMENTARIES — THE INTELLECTUAL ARCHIVE */}
        <section id="documentaries" className="mt-32" data-testid="section-documentaries">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="h-px w-8" style={{ backgroundColor: "#F4BE44" }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: "#F4BE44" }} data-testid="text-docs-eyebrow">
                {t("docs.eyebrow")}
              </span>
              <span className="h-px w-8" style={{ backgroundColor: "#F4BE44" }} />
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4" data-testid="text-docs-heading">
              {t("docs.heading")}
            </h2>
            <p className="text-zinc-500 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              {t("docs.subheading")}
            </p>
          </div>

          <div className="max-w-[900px] mx-auto border-l" style={{ borderColor: "rgba(244,190,68,0.3)" }}>
            {docs.map((doc, idx) => (
              <div
                key={doc.id}
                className="group relative px-8 md:px-14 py-12 border-b border-white/5 hover:bg-[rgba(244,190,68,0.04)] transition-colors duration-500"
                data-testid={`card-doc-${doc.id}`}
              >
                <span
                  className="absolute left-4 md:left-6 top-10 text-6xl md:text-7xl font-black tracking-tighter opacity-10 select-none pointer-events-none"
                  style={{ color: "#F4BE44" }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>

                <div className="relative z-10 ml-16 md:ml-20">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: "#F4BE44" }}>
                      {doc.category}
                    </span>
                    <span className="text-zinc-700">·</span>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">{doc.speaker}</span>
                  </div>

                  <h3 className="text-2xl md:text-4xl font-black mb-3 tracking-tight">
                    {doc.title}
                  </h3>
                  <p className="text-zinc-400 mb-6 max-w-xl leading-relaxed">
                    {doc.description}
                  </p>

                  <button
                    onClick={() => setOpenDoc(doc)}
                    className="inline-flex items-center gap-2 px-6 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] border transition-all duration-300 hover:bg-[#F4BE44] hover:text-black"
                    style={{ color: "#F4BE44", borderColor: "#F4BE44" }}
                    data-testid={`button-watch-${doc.id}`}
                  >
                    <Play size={12} strokeWidth={2.5} />
                    {t("docs.watch")}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link href="/archive" data-testid="link-view-archive">
              <button
                className="inline-flex items-center gap-2 px-8 py-3 text-[11px] font-bold uppercase tracking-[0.25em] border transition-all duration-300 hover:bg-[#F4BE44] hover:text-black"
                style={{ color: "#F4BE44", borderColor: "#F4BE44" }}
              >
                <Library size={12} strokeWidth={2.5} />
                View Full Archive
                <ArrowUpRight size={12} strokeWidth={2.5} />
              </button>
            </Link>
          </div>
        </section>
      </main>

      {openDoc && <CinemaModal doc={openDoc} onClose={() => setOpenDoc(null)} />}

      {/* FOOTER NAVIGATION PILL — mobile only, 4 entries (Drops, Buzz, Music, Library) */}
      <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[420px] px-4 md:hidden" data-testid="footer-mobile-nav">
        <div className="bg-[#0d0d0f]/85 backdrop-blur-2xl border border-white/10 rounded-3xl px-2 py-2 flex items-stretch justify-between gap-1">
          {[
            { id: "social", label: "Drops", icon: DropsIcon, href: "/auth" },
            { id: "buzz", label: "Buzz", icon: BuzzIcon, href: "/auth" },
            { id: "music", label: "Music", icon: Music2, href: "/auth" },
            { id: "library", label: "Library", icon: Library, href: "/auth" },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <Link key={item.id} href={item.href} data-testid={`nav-${item.id}`} className="flex-1">
                <button
                  onClick={() => setActiveTab(item.id)}
                  aria-label={item.label}
                  className={`w-full flex flex-col items-center justify-center gap-1 px-1 py-2 rounded-2xl transition-all duration-300 relative group
                    ${isActive ? "bg-accent/10" : "hover:bg-white/5"}
                  `}
                >
                  <item.icon
                    size={20}
                    className={isActive ? "text-accent" : "text-zinc-400 group-hover:text-zinc-200"}
                  />
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest leading-none ${
                      isActive ? "text-accent" : "text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    {item.label}
                  </span>
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-1 bg-accent rounded-full shadow-[0_0_10px_#F4BE44]" />
                  )}
                </button>
              </Link>
            );
          })}
        </div>
      </footer>

      {/* LEGAL & CREDITS */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 pb-32 pt-20 flex flex-col md:flex-row items-center justify-between text-[10px] font-black text-zinc-700 uppercase tracking-widest" data-testid="text-footer">
        <p>Dark mode by default. Neon Afro-tech highlights. Micro-interactions everywhere.</p>
        <div className="flex space-x-8 mt-4 md:mt-0">
          <Link href="/features" className="text-primary hover:text-primary/80 transition-colors" data-testid="link-footer-roadmap">
            ROADMAP
          </Link>
          <Link href="/blueprint" className="text-primary hover:text-primary/80 transition-colors" data-testid="link-footer-blueprint">
            BLUEPRINT
          </Link>
          <Link href="/privacy-policy" className="hover:text-zinc-400 transition-colors" data-testid="link-footer-privacy">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-zinc-400 transition-colors" data-testid="link-footer-terms">
            TERMS OF SERVICE
          </Link>
        </div>
      </div>

    </div>
  );
}
