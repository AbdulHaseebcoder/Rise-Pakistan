import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { AiAssistant } from './components/AiAssistant';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { RiseLogo } from './components/RiseLogo';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { EpisodesPage } from './pages/EpisodesPage';
import { EpisodeDetailPage } from './pages/EpisodeDetailPage';
import { GuestsPage } from './pages/GuestsPage';
import { GuestDetailPage } from './pages/GuestDetailPage';
import { BlogsPage } from './pages/BlogsPage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { TeamPage } from './pages/TeamPage';
import { ContactPage } from './pages/ContactPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';
import { StudioPage } from './pages/StudioPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Sparkles } from 'lucide-react';
import { Episode, Guest, Blog, ServiceItem, PartnershipItem, Testimonial, TeamMember, SiteSettings, SocialLink } from './types';

export function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');
  const [searchOpen, setSearchOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [activeVideoEpisode, setActiveVideoEpisode] = useState<Episode | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Live Database State
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [partnerships, setPartnerships] = useState<PartnershipItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [settings, setSettings] = useState<SiteSettings | undefined>(undefined);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  // Emerald Scroll Depth Progress Bar with cinematic spring easing
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Fetch public data
  const loadPublicData = async () => {
    try {
      const [epRes, gRes, blRes, srvRes, partRes, testRes, teamRes, setRes, socRes] = await Promise.all([
        fetch('/api/episodes'),
        fetch('/api/guests'),
        fetch('/api/blogs'),
        fetch('/api/services'),
        fetch('/api/partnerships'),
        fetch('/api/testimonials'),
        fetch('/api/team'),
        fetch('/api/settings'),
        fetch('/api/social-links'),
      ]);

      if (epRes.ok) setEpisodes(await epRes.json());
      if (gRes.ok) setGuests(await gRes.json());
      if (blRes.ok) setBlogs(await blRes.json());
      if (srvRes.ok) setServices(await srvRes.json());
      if (partRes.ok) setPartnerships(await partRes.json());
      if (testRes.ok) setTestimonials(await testRes.json());
      if (teamRes.ok) setTeam(await teamRes.json());
      if (setRes.ok) setSettings(await setRes.json());
      if (socRes.ok) setSocialLinks(await socRes.json());
    } catch (err) {
      console.error('Error fetching public app data:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadPublicData();

    // Browser navigation (back/forward)
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', handlePopState);

    // Global keyboard shortcut '/' for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !searchOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [searchOpen]);

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Route matching
  const renderCurrentPage = () => {
    // Admin route
    if (currentPath.startsWith('/admin')) {
      return (
        <AdminDashboard
          onNavigateHome={() => handleNavigate('/')}
          onRefreshData={loadPublicData}
        />
      );
    }

    if (currentPath === '/') {
      return (
        <HomePage
          onNavigate={handleNavigate}
          onPlayEpisode={(ep) => setActiveVideoEpisode(ep)}
          onOpenAi={() => setAiOpen(true)}
          episodes={episodes}
          guests={guests}
          blogs={blogs}
          services={services}
          partnerships={partnerships}
          testimonials={testimonials}
          settings={settings}
        />
      );
    }

    if (currentPath === '/about') {
      return <AboutPage onNavigate={handleNavigate} team={team} partnerships={partnerships} />;
    }

    if (currentPath === '/episodes') {
      return (
        <EpisodesPage
          onNavigate={handleNavigate}
          onPlayEpisode={(ep) => setActiveVideoEpisode(ep)}
          episodes={episodes}
        />
      );
    }

    if (currentPath.startsWith('/episodes/')) {
      const slug = currentPath.replace('/episodes/', '');
      return (
        <EpisodeDetailPage
          slug={slug}
          episodes={episodes}
          onNavigate={handleNavigate}
          onPlayEpisode={(ep) => setActiveVideoEpisode(ep)}
        />
      );
    }

    if (currentPath === '/guests') {
      return <GuestsPage onNavigate={handleNavigate} guests={guests} />;
    }

    if (currentPath.startsWith('/guests/')) {
      const slug = currentPath.replace('/guests/', '');
      return (
        <GuestDetailPage
          slug={slug}
          guests={guests}
          episodes={episodes}
          onNavigate={handleNavigate}
          onPlayEpisode={(ep) => setActiveVideoEpisode(ep)}
        />
      );
    }

    if (currentPath === '/blogs') {
      return <BlogsPage onNavigate={handleNavigate} blogs={blogs} />;
    }

    if (currentPath.startsWith('/blogs/')) {
      const slug = currentPath.replace('/blogs/', '');
      return <BlogDetailPage slug={slug} blogs={blogs} onNavigate={handleNavigate} />;
    }

    if (currentPath === '/testimonials') {
      return <TestimonialsPage testimonials={testimonials} onNavigate={handleNavigate} />;
    }

    if (currentPath === '/team') {
      return <TeamPage onNavigate={handleNavigate} team={team} />;
    }

    if (currentPath === '/contact') {
      return <ContactPage settings={settings} onOpenAi={() => setAiOpen(true)} />;
    }

    if (currentPath.startsWith('/studio')) {
      return <StudioPage onNavigate={handleNavigate} />;
    }

    if (currentPath === '/privacy') {
      return <PrivacyPage onNavigate={handleNavigate} />;
    }

    if (currentPath === '/terms') {
      return <TermsPage onNavigate={handleNavigate} />;
    }

    return <NotFoundPage onNavigate={handleNavigate} />;
  };

  const isAdmin = currentPath.startsWith('/admin');
  const isStudio = currentPath.startsWith('/studio');
  const isImmersive = isAdmin || isStudio;

  // Loading Screen
  if (initialLoading) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6 text-center select-none z-50">
        <div className="relative mb-6">
          <RiseLogo size="xl" showTagline={false} />
          <div className="absolute -inset-4 rounded-full border border-emerald-500/30 animate-ping pointer-events-none" />
        </div>
        <div className="space-y-1">
          <span className="font-display font-bold text-lg tracking-wider text-white">
            RISE PAKISTAN
          </span>
          <p className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase">
            Initializing Broadcast Network...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col selection:bg-emerald-500/30 selection:text-emerald-200 relative">
      {/* Thin emerald scroll depth progress bar at the very top of screen with cinematic easing */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-emerald-600 via-emerald-400 to-emerald-300 z-[100] origin-left shadow-[0_0_12px_rgba(16,185,129,0.85)] pointer-events-none"
        style={{ scaleX, transformOrigin: '0%' }}
      />

      {/* Top Navbar (hidden on admin & studio screens) */}
      {!isImmersive && (
        <Navbar
          currentPath={currentPath}
          onNavigate={handleNavigate}
          onOpenSearch={() => setSearchOpen(true)}
          onOpenAi={() => setAiOpen(true)}
        />
      )}

      {/* Main Page Content with Choreographed Framer Motion Page Transitions */}
      <main className="flex-1 flex flex-col relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentPath}
            initial={{ opacity: 0, y: 14, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(3px)' }}
            transition={{
              duration: 0.35,
              ease: [0.16, 1, 0.3, 1], // Cinematic cubic-bezier easing
            }}
            className="w-full flex-1 flex flex-col"
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer (hidden on admin & studio screens) */}
      {!isImmersive && (
        <Footer
          onNavigate={handleNavigate}
          settings={settings}
          socialLinks={socialLinks}
        />
      )}

      {/* Global Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onNavigate={handleNavigate}
      />

      {/* Video Player Modal */}
      <VideoPlayerModal
        episode={activeVideoEpisode}
        onClose={() => setActiveVideoEpisode(null)}
        onViewGuest={(gId) => handleNavigate(`/guests/${gId}`)}
      />

      {/* Floating RISE AI Assistant Concierge (hidden on admin & studio screens) */}
      {!isImmersive && (
        <>
          <button
            onClick={() => setAiOpen(!aiOpen)}
            className="fixed bottom-6 right-6 z-40 p-3.5 bg-neutral-950/90 hover:bg-neutral-900 border border-emerald-500/40 text-emerald-400 rounded-full shadow-[0_0_25px_rgba(0,166,81,0.3)] animate-breathing-ai transition-all duration-300 flex items-center gap-2 cursor-pointer group"
            title="RISE AI Assistant"
            aria-label="RISE AI Assistant"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-white tracking-wide pr-1">
              RISE AI
            </span>
          </button>

          <AiAssistant
            isOpen={aiOpen}
            onClose={() => setAiOpen(false)}
            onNavigate={handleNavigate}
          />
        </>
      )}
    </div>
  );
}

export default App;
