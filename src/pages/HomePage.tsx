import React, { useState, useEffect, useRef } from 'react';
import { Microphone3D } from '../components/Microphone3D';
import { StudioGrillePattern, RecordingIndicator, WaveformMotif, StudioRimAccent } from '../components/BrandMotifs';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { TeamSection } from '../components/TeamSection';
import { Play, ArrowUpRight, ArrowRight, Sparkles, ChevronRight, Video, MessageSquare, CheckCircle2, Volume2, Radio, Layers, Film, Sliders, Monitor, ShieldCheck, Share2 } from 'lucide-react';
import { Episode, Guest, Blog, ServiceItem, PartnershipItem, Testimonial, SiteSettings } from '../types';
import { AnimatedHeading, AnimatedText, AnimatedBadge, AnimatedCounter } from '../components/AnimatedText';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onPlayEpisode: (episode: Episode) => void;
  onOpenAi: () => void;
  episodes: Episode[];
  guests: Guest[];
  blogs: Blog[];
  services: ServiceItem[];
  partnerships: PartnershipItem[];
  testimonials: Testimonial[];
  settings?: SiteSettings;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onPlayEpisode,
  onOpenAi,
  episodes,
  guests,
  blogs,
  services,
  partnerships,
  testimonials,
  settings,
}) => {
  // Scroll Storytelling state (Stages 1 through 9)
  const [scrollProgress, setScrollProgress] = useState(0);
  const [ctaScrollProgress, setCtaScrollProgress] = useState(0);

  // Cinematic Hero Intro (Requirement 3: Black -> Emerald highlight -> RISE PAKISTAN -> REAL STORIES...)
  const [introStep, setIntroStep] = useState<0 | 1 | 2 | 3>(0);
  const [activeGuestIndex, setActiveGuestIndex] = useState(0);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);

  const heroContainerRef = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);

  // Intro sequence timer
  useEffect(() => {
    const t1 = setTimeout(() => setIntroStep(1), 350); // Reveal RISE PAKISTAN
    const t2 = setTimeout(() => setIntroStep(2), 1200); // Reveal REAL STORIES / EXPERIENCES / RISE
    const t3 = setTimeout(() => setIntroStep(3), 2000); // Reveal actions & stats
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Smooth scroll progression listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          // Hero track scroll progression (~1100px)
          const heroRange = 1100;
          const heroP = Math.min(1, Math.max(0, scrollY / heroRange));
          setScrollProgress(heroP);

          // Final CTA section scroll progression
          if (ctaSectionRef.current) {
            const rect = ctaSectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top <= windowHeight && rect.bottom >= 0) {
              const ctaP = Math.min(1, Math.max(0, (windowHeight - rect.top) / (windowHeight + rect.height)));
              setCtaScrollProgress(ctaP);
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const featuredEpisode = episodes.find((e) => e.featured) || episodes[0];
  const recentEpisodes = episodes.slice(0, 4);
  const featuredGuests = guests.slice(0, 4);
  const recentBlogs = blogs.slice(0, 3);
  const activeGuest = featuredGuests[activeGuestIndex] || featuredGuests[0];

  // Verified statistics only (CMS-driven September 2026 Snapshot)
  const fullEpisodesStat = settings?.stats?.fullEpisodesCount || '66+';
  const shortsStat = settings?.stats?.shortsCount || '150+';
  const playlistStat = settings?.stats?.playlistCount || '224';

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Background Studio Rim Glow */}
      <StudioRimAccent position="top-right" />
      <StudioGrillePattern className="fixed inset-0 z-0 opacity-10" />

      {/* =========================================================================
          SECTION 1: HERO — THE SIGNATURE 3D EXPERIENCE (REQUIREMENTS 2, 3 & 4)
          ========================================================================= */}
      <section
        ref={heroContainerRef}
        className="relative min-h-[96vh] flex flex-col justify-between pt-24 pb-12 px-6 md:px-12 border-b border-white/10 overflow-hidden"
      >
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 z-10">
          {/* Left Column: Cinematic Editorial Typography */}
          <div className="lg:col-span-7 space-y-7 text-left pt-6 lg:pt-0">
            {/* Stage 1 Intro: Brand Name Unveil */}
            <div
              className={`transition-all duration-1000 transform ${
                introStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
              }`}
            >
              <div className="flex items-center gap-3">
                <RecordingIndicator label="EXECUTIVE DIGITAL DIALOGUES" />
                <span className="text-neutral-600" aria-hidden="true">
                  ·
                </span>
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest">
                  KARACHI / ISLAMABAD
                </span>
              </div>
            </div>

            {/* Stage 2 Intro: Oversized Apple-Grade Manifesto */}
            <div
              className={`transition-all duration-1000 delay-100 transform ${
                introStep >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[5.25rem] font-display font-extrabold tracking-tight text-white leading-[1.02] text-balance">
                REAL STORIES.
                <br />
                <span className="text-neutral-400">REAL INSIGHTS.</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-white animate-title-shimmer">
                  RISE WITH US.
                </span>
              </h1>
            </div>

            {/* Stage 3 Intro: Narrative & Action Controls */}
            <div
              className={`space-y-6 transition-all duration-1000 delay-200 transform ${
                introStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="text-base sm:text-lg text-neutral-300 font-normal leading-relaxed max-w-xl text-balance">
                Connecting Pakistan&apos;s corporate leaders, technology founders, and operators through unfiltered,
                in-depth conversations on strategic growth, leadership grit, and institutional building.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                {featuredEpisode && (
                  <button
                    onClick={() => onPlayEpisode(featuredEpisode)}
                    className="px-6 py-3.5 bg-white text-black font-semibold text-xs tracking-wider uppercase rounded-lg hover:bg-neutral-200 transition-all flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-emerald-500/10 active:scale-[0.98]"
                  >
                    <span>Watch Featured Dialogue</span>
                    <Play className="w-3.5 h-3.5 fill-black translate-x-0.5" />
                  </button>
                )}

                <button
                  onClick={() => onNavigate('/episodes')}
                  className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs tracking-wider uppercase border border-white/10 rounded-lg transition-colors flex items-center gap-2 cursor-pointer active:scale-[0.98]"
                >
                  <span>Explore Archive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onOpenAi}
                  className="px-4 py-3.5 text-emerald-300 hover:text-emerald-200 bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 font-medium text-xs rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  title="Open RISE AI Concierge"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">RISE AI</span>
                </button>
              </div>

              {/* Verified Public Metric Line (September 2026 Researched Snapshot) */}
              <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-neutral-400 font-mono">
                <div className="flex items-center gap-2 text-white">
                  <Video className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold tabular-nums">
                    <AnimatedCounter target={66} suffix="+" />
                  </span>
                  <span className="text-neutral-400">Full Dialogues</span>
                </div>
                <span aria-hidden="true" className="text-neutral-700">
                  ·
                </span>
                <div className="flex items-center gap-2 text-white">
                  <span className="font-bold tabular-nums text-emerald-400">
                    <AnimatedCounter target={150} suffix="+" />
                  </span>
                  <span className="text-neutral-400">Shorts &amp; Clips</span>
                </div>
                <span aria-hidden="true" className="text-neutral-700">
                  ·
                </span>
                <div className="text-neutral-300">
                  Official Summit Partner: <span className="text-emerald-400 font-semibold">28th ITCN Asia</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Genuine 3D Studio Microphone with Scroll Story Choreography */}
          <div className="lg:col-span-5 h-[480px] sm:h-[560px] lg:h-[660px] relative flex items-center justify-center">
            <Microphone3D
              className="w-full h-full"
              scrollProgress={scrollProgress}
              interactive={true}
              mode="hero"
            />

            {/* Subtle Interactive Instruction */}
            <div className="absolute bottom-4 right-4 text-[11px] text-neutral-400 font-mono tracking-wider flex items-center gap-2 pointer-events-none bg-black/75 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>3D STUDIO MIC · INTERACTIVE PARALLAX</span>
            </div>
          </div>
        </div>

        {/* 9-Stage Scroll Narrative Progression Tracker */}
        <div className="pt-8 max-w-7xl mx-auto w-full flex items-center justify-between text-[11px] font-mono uppercase tracking-widest text-neutral-400 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>SCROLL TO UNPACK NARRATIVE</span>
            </span>
            <span className="text-neutral-600 hidden md:inline">·</span>
            <span className="text-neutral-500 hidden md:inline">
              STAGE {scrollProgress < 0.25 ? '01 / FOCUS' : scrollProgress < 0.5 ? '02 / CHOREOGRAPHY' : scrollProgress < 0.75 ? '03 / WAVE' : '04 / DIALOGUE'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <WaveformMotif barCount={10} className="hidden sm:flex" />
            <span className="text-neutral-400">FOUNDED BY AHMED KAMAL</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: EDITORIAL STATEMENT 1 — PAKISTAN'S BUILDERS HAVE A STORY
          Leading into the Cinematic Featured Anchor Conversation (Requirement 6 & 7)
          ========================================================================= */}
      <section className="relative py-24 px-6 md:px-12 border-b border-white/10 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Large Editorial Headline */}
          <div className="space-y-4 border-b border-white/10 pb-8">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
              <span>01</span>
              <span aria-hidden="true">/</span>
              <span>THE PEOPLE BEHIND THE STORIES</span>
            </div>
            <AnimatedHeading as="h2" className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.08] text-balance">
              THE PEOPLE
              <br />
              <span className="text-neutral-400">BEHIND THE STORIES.</span>
            </AnimatedHeading>
          </div>

          {/* Cinematic Featured Episode Canvas (Requirement 7) */}
          {featuredEpisode && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Media Player Box (Span 7) */}
              <div
                onClick={() => onPlayEpisode(featuredEpisode)}
                className="lg:col-span-7 relative aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 group cursor-pointer shadow-2xl"
              >
                <img
                  src={featuredEpisode.thumbnail || '/assets/studio.jpg'}
                  alt={featuredEpisode.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />

                {/* Powerful Play Button with Emerald Accent */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white group-hover:bg-emerald-400 text-black flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-[0_0_40px_rgba(0,166,81,0.45)]">
                    <Play className="w-8 h-8 fill-black translate-x-0.5" />
                  </div>
                </div>

                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="text-[11px] font-mono text-emerald-300 bg-black/80 px-3 py-1 rounded backdrop-blur-md border border-white/10">
                    HOST: JAVERIA HAMMAD KHAN
                  </span>
                </div>

                <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between text-xs font-mono text-white/90">
                  <span className="bg-black/75 px-3 py-1 rounded backdrop-blur-sm border border-white/10">
                    DURATION: {featuredEpisode.duration}
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>STUDIO AUDIO MASTER</span>
                  </span>
                </div>
              </div>

              {/* Editorial Content Deck (Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-wider">
                  <span>{featuredEpisode.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-neutral-400">{featuredEpisode.publishDate}</span>
                </div>

                <h3 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-white leading-tight">
                  {featuredEpisode.title}
                </h3>

                <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                  {featuredEpisode.shortDescription || featuredEpisode.description}
                </p>

                {/* Guest Identity Card */}
                <div className="pt-4 border-t border-white/10 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-emerald-500/40 bg-neutral-900 shrink-0">
                    <img
                      src={featuredEpisode.thumbnail || '/assets/host.jpg'}
                      alt={featuredEpisode.guestName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{featuredEpisode.guestName}</h4>
                    <p className="text-xs text-neutral-400">
                      {featuredEpisode.guestRole} · {featuredEpisode.guestOrg}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => onPlayEpisode(featuredEpisode)}
                    className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
                  >
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Watch Full Broadcast</span>
                  </button>
                  <button
                    onClick={() => onNavigate(`/episodes/${featuredEpisode.slug}`)}
                    className="px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono tracking-wider uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Read Show Notes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: EDITORIAL STATEMENT 2 — FROM IDEAS TO IMPACT
          Editorial Episode Rail (Requirement 8)
          ========================================================================= */}
      <section className="py-24 px-6 md:px-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block">
                02 / ARCHIVE
              </span>
              <AnimatedHeading as="h2" className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
                FROM IDEAS TO IMPACT.
              </AnimatedHeading>
            </div>
            <button
              onClick={() => onNavigate('/episodes')}
              className="text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>Explore All Dialogues</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Clean Magazine Editorial Rail with Zero-Pill Metadata */}
          <div className="divide-y divide-white/10">
            {recentEpisodes.map((ep) => (
              <div
                key={ep.id}
                onClick={() => onPlayEpisode(ep)}
                className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center group cursor-pointer hover:bg-white/[0.02] px-4 -mx-4 rounded-xl transition-colors"
              >
                {/* Thumbnail Preview (Span 4) */}
                <div className="lg:col-span-4 relative aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                  <img
                    src={ep.thumbnail || '/assets/studio.jpg'}
                    alt={ep.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                      <Play className="w-5 h-5 fill-black translate-x-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 text-[10px] font-mono text-white/90 bg-black/75 px-2 py-0.5 rounded">
                    {ep.duration}
                  </span>
                </div>

                {/* Content Text (Span 6) */}
                <div className="lg:col-span-6 space-y-2">
                  <div className="text-xs font-mono text-emerald-400">{ep.category}</div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {ep.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-400 line-clamp-2 leading-relaxed">
                    {ep.shortDescription || ep.description}
                  </p>
                  <div className="text-xs text-neutral-300 pt-1">
                    Featured Leader: <span className="font-semibold text-white">{ep.guestName}</span> ({ep.guestOrg})
                  </div>
                </div>

                {/* Launch Action (Span 2) */}
                <div className="lg:col-span-2 flex lg:justify-end items-center">
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 group-hover:text-emerald-400 transition-colors">
                    <span>Watch Now</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: EDITORIAL STATEMENT 3 — THE PEOPLE BEHIND THE GROWTH
          People-Focused Large Portrait Compositions (Requirement 9)
          ========================================================================= */}
      <section className="py-24 px-6 md:px-12 border-b border-white/10 bg-neutral-950/20">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block">
                03 / THE PEOPLE
              </span>
              <AnimatedHeading as="h2" className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.05]">
                THE PEOPLE
                <br />
                <span className="text-neutral-400">SHAPING PAKISTAN.</span>
              </AnimatedHeading>
            </div>
            <button
              onClick={() => onNavigate('/guests')}
              className="text-xs font-mono uppercase tracking-wider text-neutral-300 hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer group"
            >
              <span>View Full Directory</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Large Portrait-Driven Curated Layout (Requirement 9) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Dominant Focal Portrait (Span 6) */}
            <div
              onClick={() => onNavigate(`/guests/${activeGuest.slug}`)}
              className="lg:col-span-6 relative aspect-[3/4] max-h-[580px] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 group cursor-pointer shadow-2xl"
            >
              <img
                src={activeGuest.photo || '/assets/host.jpg'}
                alt={activeGuest.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top opacity-90 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 space-y-2">
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                  {activeGuest.industry}
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {activeGuest.name}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300">
                  {activeGuest.role} · {activeGuest.organization}
                </p>
                <p className="text-xs text-neutral-400 line-clamp-3 pt-2 border-t border-white/10 leading-relaxed">
                  {activeGuest.bio}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-mono uppercase text-emerald-400">
                  <span>Open Executive Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>

            {/* Right Roster Selector: Click/Hover to Switch Main Portrait (Span 6) */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-xs font-mono uppercase tracking-widest text-neutral-400 block mb-2">
                SELECT LEADER TO PREVIEW
              </span>
              <div className="space-y-3">
                {featuredGuests.map((g, index) => {
                  const isSelected = activeGuestIndex === index;
                  return (
                    <div
                      key={g.id}
                      onMouseEnter={() => setActiveGuestIndex(index)}
                      onClick={() => onNavigate(`/guests/${g.slug}`)}
                      className={`p-5 rounded-xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-neutral-900 border-emerald-500/50 shadow-lg shadow-emerald-950/20'
                          : 'bg-neutral-950/40 border-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10 bg-neutral-900 shrink-0">
                          <img
                            src={g.photo || '/assets/host.jpg'}
                            alt={g.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover object-top"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                            {g.industry}
                          </span>
                          <h4 className="text-lg font-display font-bold text-white">{g.name}</h4>
                          <p className="text-xs text-neutral-400">
                            {g.role} · {g.organization}
                          </p>
                        </div>
                      </div>

                      <ArrowUpRight
                        className={`w-4 h-4 transition-transform ${
                          isSelected ? 'text-emerald-400 translate-x-0.5 -translate-y-0.5' : 'text-neutral-500'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4.5: REMOTE. RECORD. RISE. — THE DIGITAL PODCAST STUDIO
          ========================================================================= */}
      <section className="py-24 px-6 md:px-12 border-b border-white/10 bg-gradient-to-b from-neutral-950/90 via-black to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Main Statement & Headline */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-white/10">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>VIRTUAL BROADCAST &amp; REMOTE RECORDING INFRASTRUCTURE</span>
              </div>
              <AnimatedHeading as="h2" className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.02]">
                REMOTE.
                <br />
                RECORD.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-white animate-title-shimmer">
                  RISE.
                </span>
              </AnimatedHeading>
            </div>
            <div className="max-w-md space-y-4">
              <AnimatedText className="text-sm text-neutral-300 leading-relaxed font-normal">
                <strong className="text-white font-semibold">REMOTE:</strong> Professional recording without requiring every guest to travel to Karachi.
                <br />
                <strong className="text-white font-semibold">RECORD:</strong> A purpose-built digital studio designed around conversation, host authority, and 48kHz audio.
                <br />
                <strong className="text-white font-semibold">RISE:</strong> One conversation becomes a professional master and a complete content system.
              </AnimatedText>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('/studio')}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(0,166,81,0.35)] active:scale-[0.98]"
                >
                  <Radio className="w-4 h-4" />
                  <span>ENTER RISE STUDIO</span>
                </button>
                <button
                  onClick={() => onNavigate('/contact')}
                  className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs tracking-wider uppercase rounded-lg transition-colors cursor-pointer"
                >
                  <span>BOOK A SESSION</span>
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Before/After Visual Enhancement Showcase */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <BeforeAfterSlider
                originalLabel="RAW WEBCAM SOURCE"
                enhancedLabel="RISE AI ENHANCED MASTER"
                aspectRatio="aspect-[16/10]"
                className="shadow-2xl shadow-emerald-950/20"
              />
            </div>
            <div className="lg:col-span-5 space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
                  RISE AI VISUAL ENHANCER
                </span>
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                  Identity-Preserving Cinema Grade
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Our proprietary enhancement pipeline transforms variable consumer webcams into broadcast-grade video while preserving authentic facial structure, natural skin textures, and subtle expressions.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/60 space-y-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">STAGE 01</span>
                  <h4 className="text-sm font-semibold text-white">AI Light Match</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">Harmonizes host and guest lighting temperatures and shadow falloff.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/60 space-y-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">STAGE 02</span>
                  <h4 className="text-sm font-semibold text-white">RISE Color Match</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">Applies our signature black and emerald cinematic gamma grade.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/60 space-y-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">STAGE 03</span>
                  <h4 className="text-sm font-semibold text-white">Temporal Denoise</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">Removes low-light sensor noise across consecutive video frames.</p>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-neutral-900/60 space-y-1.5">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">STAGE 04</span>
                  <h4 className="text-sm font-semibold text-white">Super-Resolution</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">Reconstructs micro-details for crystal-clear 4K delivery masters.</p>
                </div>
              </div>
            </div>
          </div>

          {/* 9-Scene Cinematic Narrative Workflow Sequence (Requirement 32) */}
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                  NARRATIVE WORKFLOW
                </span>
                <h3 className="text-xl sm:text-2xl font-display font-bold text-white">
                  The 9-Scene Production Engine
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-400 hidden sm:inline">
                SCENE 01 TO 09
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  number: '01',
                  scene: 'REMOTE',
                  title: 'Browser Connection',
                  desc: 'Guests connect instantly via a secure, unguessable private link with zero software installations.',
                },
                {
                  number: '02',
                  scene: 'SOURCE ANALYSIS',
                  title: 'Acoustic & AV Scan',
                  desc: 'AI evaluates room reverberation, noise floor, webcam exposure, and network jitter in milliseconds.',
                },
                {
                  number: '03',
                  scene: 'RESTORE',
                  title: 'Artifact Cleanup',
                  desc: 'Intelligent temporal denoising eliminates grain and compression blocking from consumer feeds.',
                },
                {
                  number: '04',
                  scene: 'ENHANCE',
                  title: 'Super-Resolution',
                  desc: 'Detail reconstruction reconstructs crisp optical clarity while strictly preserving real human facial identity.',
                },
                {
                  number: '05',
                  scene: 'LIGHT MATCH',
                  title: 'Lighting Harmonization',
                  desc: 'Balances host and guest color temperatures and highlight rolloff so participants feel physically present together.',
                },
                {
                  number: '06',
                  scene: 'RECORD',
                  title: 'Lossless ISO Capture',
                  desc: 'Captures independent multi-tracks locally in full 48kHz audio and pristine video, immune to internet blips.',
                },
                {
                  number: '07',
                  scene: 'DIRECT',
                  title: 'AI Broadcast Director',
                  desc: 'Intelligently switches between Two-Shot, Guest Focus, and Host Focus based on conversational cadence.',
                },
                {
                  number: '08',
                  scene: 'RISE',
                  title: 'Multi-Format Render',
                  desc: 'The master dialogue automatically converts into 16:9 master, 9:16 reels, and executive quotes.',
                },
                {
                  number: '09',
                  scene: 'DISTRIBUTE',
                  title: 'One Conversation, Many Stories',
                  desc: 'Syndicates across YouTube, LinkedIn, Instagram, TikTok, and Facebook with custom titles and show notes.',
                },
              ].map((s) => (
                <div
                  key={s.number}
                  className="p-5 rounded-xl border border-white/10 bg-neutral-950/60 hover:bg-neutral-900 hover:border-emerald-500/40 transition-all duration-300 space-y-2 group"
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-emerald-400 font-bold">{s.number}</span>
                    <span className="text-neutral-500 uppercase tracking-widest">{s.scene}</span>
                  </div>
                  <h4 className="text-base font-display font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4.6: MEET RISE AI — AI-POWERED PRODUCTION PLATFORM
          ========================================================================= */}
      <section className="py-24 px-6 md:px-12 border-b border-white/10 bg-neutral-950/40">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
                <span>INTELLIGENCE &amp; AUTOMATION</span>
              </div>
              <AnimatedHeading as="h2" className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.05]">
                MEET RISE AI.
              </AnimatedHeading>
            </div>
            <AnimatedText className="text-sm text-neutral-300 max-w-md leading-relaxed">
              Six specialized artificial intelligence modes purpose-built for the end-to-end digital broadcast lifecycle—from intake to post-production distribution.
            </AnimatedText>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { mode: 'CONCIERGE', title: 'Concierge', desc: 'Discovery & editorial guide' },
              { mode: 'CALL AGENT', title: 'Call Agent', desc: 'Voice booking & intake screening' },
              { mode: 'STUDIO AGENT', title: 'Studio Agent', desc: 'Room calibration & acoustic check' },
              { mode: 'AI HOST', title: 'AI Host', desc: 'Simulated counter-arguments' },
              { mode: 'CO-PRODUCER', title: 'Co-Producer', desc: 'Rundowns & viral hook drafting' },
              { mode: 'PRODUCTION ASSISTANT', title: 'Prod Assistant', desc: 'Multi-platform social copy' },
            ].map((m) => (
              <div
                key={m.mode}
                onClick={onOpenAi}
                className="p-5 rounded-xl border border-white/10 bg-neutral-900/40 hover:bg-emerald-950/20 hover:border-emerald-500/40 transition-all cursor-pointer space-y-2 group"
              >
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                  MODE
                </span>
                <h4 className="text-sm font-display font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {m.title}
                </h4>
                <p className="text-[11px] text-neutral-400 leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: EDITORIAL SERVICES SEQUENCE (REQUIREMENT 10)
          01 Strategic PR
          02 Corporate Podcast Production
          03 Mobile Podcast Setup
          04 Personal Branding & Media Amplification
          ========================================================================= */}
      <section className="py-24 px-6 md:px-12 border-b border-white/10">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Sticky Header (Span 5) */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
                <span>04</span>
                <span aria-hidden="true">/</span>
                <span>SOLUTIONS &amp; PR</span>
              </div>
              <AnimatedHeading as="h2" className="text-3xl sm:text-5xl font-display font-extrabold text-white tracking-tight leading-tight text-balance">
                THE PEOPLE BEHIND THE GROWTH.
              </AnimatedHeading>
              <AnimatedText className="text-sm text-neutral-300 leading-relaxed font-normal">
                RISE Pakistan provides professional storytelling, personal branding, and media amplification for the
                Pakistani business landscape. We engineer narrative authority for leaders and corporate institutions.
              </AnimatedText>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('/contact')}
                  className="px-6 py-3.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  Initiate Production Inquiry
                </button>
              </div>
            </div>

            {/* Right Vertical Numbered Sequence (Span 7) (Requirement 10) */}
            <div className="lg:col-span-7 divide-y divide-white/10">
              {[
                {
                  number: '01',
                  title: 'Strategic PR & Corporate Visibility',
                  description:
                    'Strategic PR communications, digital brand positioning, and executive reputation building for Pakistan’s corporate and technology leaders.',
                  bullets: [
                    'Strategic PR communications',
                    'Digital brand positioning',
                    'Corporate visibility',
                    'Executive reputation building',
                  ],
                },
                {
                  number: '02',
                  title: 'Corporate Podcast Production',
                  description:
                    'End-to-end podcast production for enterprises, founders, and operators seeking high-impact, studio-grade dialogues that resonate across industry stakeholders.',
                  bullets: [
                    'Candid executive dialogues',
                    'Leadership & narrative development',
                    'Multi-camera 4K studio recording',
                    'Multi-platform digital distribution',
                  ],
                },
                {
                  number: '03',
                  title: 'Mobile Podcast Setup & On-Site Recording',
                  description:
                    'On-ground broadcast installations deployed directly inside premier national tech conventions and business summits, capturing live executive insights.',
                  bullets: [
                    'Mobile expo podcast booths',
                    'On-site summit recording',
                    'Live convention coverage',
                    'Official media partnerships',
                  ],
                },
                {
                  number: '04',
                  title: 'Personal Branding & Media Amplification',
                  description:
                    'Structured narrative profiling for high-performing founders, investors, and subject matter specialists seeking lasting digital legacy.',
                  bullets: [
                    'Personal branding architecture',
                    'Media amplification',
                    'Long-form digital archive',
                    'Thought leadership positioning',
                  ],
                },
              ].map((srv, idx) => {
                const isSelected = activeServiceIndex === idx;
                return (
                  <div
                    key={srv.number}
                    onMouseEnter={() => setActiveServiceIndex(idx)}
                    className={`py-8 first:pt-0 transition-all duration-300 cursor-pointer space-y-4 ${
                      isSelected ? 'opacity-100 pl-2' : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-baseline gap-4">
                      <span className="font-mono text-2xl font-bold text-emerald-400 tabular-nums">
                        {srv.number}
                      </span>
                      <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                        {srv.title}
                      </h3>
                    </div>

                    <p className="text-sm text-neutral-300 leading-relaxed max-w-2xl pl-10">
                      {srv.description}
                    </p>

                    <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-xs text-neutral-400 pl-10">
                      {srv.bullets.map((b, i) => (
                        <li key={i} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: OFFICIAL SUMMIT PARTNERSHIPS
          ITCN Asia, World CIO Summit, Business Leaders Summit, SES Women's Summit
          ========================================================================= */}
      <section className="py-24 px-6 md:px-12 border-b border-white/10 bg-neutral-950/20">
        <div className="max-w-7xl mx-auto space-y-14">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block">
              SUMMIT FOOTPRINT &amp; CREDIBILITY
            </span>
            <AnimatedHeading as="h2" className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
              Official Media Partnerships
            </AnimatedHeading>
            <AnimatedText className="text-xs sm:text-sm text-neutral-400">
              On-ground broadcast and podcast partner for Pakistan&apos;s leading technology summits and executive forums.
            </AnimatedText>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {partnerships.map((p) => (
              <div
                key={p.id}
                className="p-6 rounded-xl border border-white/10 bg-neutral-950/50 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-colors"
              >
                <div className="space-y-2">
                  <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                    {p.role}
                  </span>
                  <h4 className="text-lg font-display font-bold text-white">{p.eventName}</h4>
                  <p className="text-xs text-neutral-400 font-medium">{p.edition}</p>
                  <p className="text-xs text-neutral-300 mt-2 leading-relaxed">{p.description}</p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span>{p.location}</span>
                  <span>{p.year}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: AUTHENTIC TESTIMONIALS (REQUIREMENT 12: NO FABRICATED QUOTES)
          ========================================================================= */}
      <section className="py-24 px-6 md:px-12 border-b border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              ENDORSEMENTS
            </span>
            <AnimatedHeading as="h2" className="text-3xl sm:text-4xl font-display font-bold text-white">
              Executive Perspectives
            </AnimatedHeading>
          </div>

          {testimonials.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-8 rounded-2xl border border-white/10 bg-neutral-950/40 space-y-4"
                >
                  <p className="text-sm text-neutral-200 italic leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                  <div className="pt-4 border-t border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                      <p className="text-xs text-neutral-400">
                        {t.role}, {t.company}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Explicit Requirement 12: Refined Placeholder until authentic testimonials entered in CMS */
            <div className="p-10 md:p-14 rounded-2xl border border-white/10 bg-neutral-950/40 max-w-xl mx-auto space-y-4">
              <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-emerald-400 mx-auto">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-display font-semibold text-white">
                REAL VOICES. REAL EXPERIENCES.
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Verified guest and partner testimonials will appear here once confirmed by the production desk.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =========================================================================
          SECTION 8: EDITORIAL DISPATCHES (JOURNAL)
          ========================================================================= */}
      {recentBlogs.length > 0 && (
        <section className="py-24 px-6 md:px-12 border-b border-white/10 bg-neutral-950/30">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-2">
                  COMMENTARY &amp; STRATEGY
                </span>
                <AnimatedHeading as="h2" className="text-3xl sm:text-5xl font-display font-bold text-white tracking-tight">
                  Editorial Dispatch
                </AnimatedHeading>
              </div>
              <button
                onClick={() => onNavigate('/blogs')}
                className="text-xs font-mono uppercase tracking-wider text-white hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer group"
              >
                <span>Read All Dispatches</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentBlogs.map((blog) => (
                <article
                  key={blog.id}
                  onClick={() => onNavigate(`/blogs/${blog.slug}`)}
                  className="group cursor-pointer space-y-4"
                >
                  <div className="aspect-[16/10] rounded-xl overflow-hidden bg-neutral-900 border border-white/10 relative">
                    <img
                      src={blog.coverImage || '/assets/studio.jpg'}
                      alt={blog.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 text-[10px] font-mono uppercase text-white bg-black/70 px-2.5 py-1 rounded backdrop-blur-sm border border-white/10">
                      {blog.category}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs font-mono text-neutral-400">
                      {blog.publishDate} · {blog.readingTime}
                    </div>
                    <h3 className="text-lg font-display font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================================================
          SECTION 8.5: THE PEOPLE BEHIND RISE (REQUIREMENT 70 & 52)
          ========================================================================= */}
      <TeamSection onNavigate={onNavigate} />

      {/* =========================================================================
          SECTION 9: FINAL CTA — CINEMATIC CONCLUSION (REQUIREMENT 14)
          "EVERY STORY STARTS WITH A CONVERSATION."
          "BOOK A SESSION"
          Microphone subtly behind/beside typography, fading into darkness
          ========================================================================= */}
      <section
        ref={ctaSectionRef}
        className="relative min-h-[70vh] flex items-center justify-center py-28 px-6 md:px-12 bg-black border-t border-white/10 overflow-hidden"
      >
        {/* Physical 3D Microphone subtly positioned behind / beside typography (Requirement 14) */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 md:opacity-55">
          <Microphone3D
            className="w-full h-full"
            scrollProgress={ctaScrollProgress}
            interactive={false}
            mode="cta"
          />
        </div>

        {/* Foreground Content */}
        <div className="max-w-4xl mx-auto space-y-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>EXECUTIVE ACCESS</span>
          </div>

          <AnimatedHeading as="h2" className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold text-white tracking-tight leading-[1.05] text-balance">
            EVERY STORY
            <br />
            STARTS WITH A
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-white animate-title-shimmer">
              CONVERSATION.
            </span>
          </AnimatedHeading>

          <AnimatedText className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto leading-relaxed text-balance">
            Whether scheduling a featured executive dialogue, arranging mobile broadcast coverage at your national summit, or developing
            strategic corporate PR, connect directly with our digital production desk.
          </AnimatedText>

          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('/studio')}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors cursor-pointer shadow-[0_0_25px_rgba(0,166,81,0.35)] active:scale-[0.98] flex items-center gap-2"
            >
              <Radio className="w-4 h-4" />
              <span>ENTER RISE STUDIO</span>
            </button>
            <button
              onClick={() => onNavigate('/contact')}
              className="px-8 py-4 bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-white font-medium text-xs tracking-wider uppercase rounded-lg transition-colors cursor-pointer flex items-center gap-2"
            >
              <span>BOOK A RISE STUDIO SESSION</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
