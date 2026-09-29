import React, { useState, useEffect } from 'react';
import { RiseLogo } from './RiseLogo';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onOpenSearch?: () => void;
  onOpenAi?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Public desktop navbar should contain strictly:
  // Home, About, Episodes, Guests, Blogs, Testimonials, Contact
  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About', path: '/about' },
    { label: 'Episodes', path: '/episodes' },
    { label: 'Guests', path: '/guests' },
    { label: 'Blogs', path: '/blogs' },
    { label: 'Testimonials', path: '/testimonials' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleLinkClick = (path: string) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-black/80 backdrop-blur-xl border-b border-white/[0.08] py-3.5 shadow-[0_4px_30px_rgba(0,0,0,0.8)]'
            : 'bg-transparent py-6 border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center justify-between">
          {/* Logo as Primary Anchor */}
          <button
            onClick={() => handleLinkClick('/')}
            className="flex items-center text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded cursor-pointer transition-opacity hover:opacity-90"
            aria-label="RISE Pakistan Home"
          >
            <RiseLogo size="md" />
          </button>

          {/* Desktop Navigation Links — Pure, Calm, Editorial */}
          <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-widest font-mono font-medium">
            {navLinks.map((link) => {
              const isActive =
                currentPath === link.path ||
                (link.path !== '/' && currentPath.startsWith(link.path));
              return (
                <button
                  key={link.path}
                  onClick={() => handleLinkClick(link.path)}
                  className={`relative py-1 transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'text-white font-semibold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-[1.5px] bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile Menu Trigger Only */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-neutral-300 hover:text-white focus-visible:outline-none cursor-pointer transition-colors"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Premium Fullscreen Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl lg:hidden flex flex-col justify-between p-8 pt-24 animate-in fade-in duration-300">
          <div className="space-y-6">
            <div className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
              NAVIGATION
            </div>
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => {
                const isActive =
                  currentPath === link.path ||
                  (link.path !== '/' && currentPath.startsWith(link.path));
                return (
                  <button
                    key={link.path}
                    onClick={() => handleLinkClick(link.path)}
                    className={`text-2xl font-display font-medium text-left transition-colors cursor-pointer py-1 ${
                      isActive ? 'text-white pl-3 border-l-2 border-emerald-500' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="pt-8 border-t border-white/10 space-y-3">
            <div className="text-[11px] font-mono text-neutral-500 tracking-wider uppercase">
              RISE PAKISTAN · DIGITAL MEDIA
            </div>
            <p className="text-xs text-neutral-400">
              Real inspiring stories &amp; leadership dialogues shaping Pakistan.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
