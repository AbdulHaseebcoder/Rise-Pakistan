import React, { useState } from 'react';
import { RiseLogo } from './RiseLogo';
import { Youtube, Linkedin, Instagram, Facebook, ArrowUpRight, CheckCircle } from 'lucide-react';
import { SiteSettings, SocialLink } from '../types';

interface FooterProps {
  onNavigate: (path: string) => void;
  settings?: SiteSettings;
  socialLinks?: SocialLink[];
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, settings, socialLinks }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10 pt-16 pb-12 text-neutral-400">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          {/* Brand Column (Span 2) */}
          <div className="lg:col-span-2 space-y-4">
            <button onClick={() => onNavigate('/')} className="text-left cursor-pointer">
              <RiseLogo size="lg" showTagline={true} />
            </button>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-sm pt-2">
              {settings?.footerAbout ||
                'RISE Pakistan connects the corporate sector, technology startups, founders, and professionals through high-impact digital dialogues, personal branding, and strategic PR.'}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-3">
              <a
                href="https://www.youtube.com/@RisePakistan-podcast"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-emerald-950/50 hover:text-emerald-400 border border-white/10 flex items-center justify-center transition-colors"
                title="YouTube"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="https://pk.linkedin.com/company/rise-pakistan-official"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-emerald-950/50 hover:text-emerald-400 border border-white/10 flex items-center justify-center transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="https://www.instagram.com/rise.pakistanofficial/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-emerald-950/50 hover:text-emerald-400 border border-white/10 flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://www.facebook.com/risePakistan2025/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-emerald-950/50 hover:text-emerald-400 border border-white/10 flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Platform Navigation */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider text-white font-semibold block">
              Platform
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/episodes')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  All Episodes
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/guests')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Guest Directory
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/blogs')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Executive Briefs
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/testimonials')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Partner Testimonials
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/team')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Leadership &amp; Team
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  About RISE Pakistan
                </button>
              </li>
            </ul>
          </div>

          {/* Solutions & Production */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider text-white font-semibold block">
              Capabilities
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => onNavigate('/studio')} className="hover:text-emerald-400 transition-colors cursor-pointer text-emerald-400 font-medium">
                  RISE Virtual Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Strategic Corporate PR
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Corporate Podcast Production
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Mobile Expo Broadcast Booth
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Founder Journey Profiling
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-emerald-400 transition-colors cursor-pointer">
                  Summit Media Partnerships
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-3">
            <span className="text-xs uppercase tracking-wider text-white font-semibold block">
              Editorial Brief
            </span>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Curated strategic dialogues and macroeconomic breakdowns delivered to corporate leadership.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 p-2.5 rounded-lg">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Subscribed to RISE Editorial Brief.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="executive@company.pk"
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500 transition-colors"
                />
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white hover:bg-neutral-200 text-black text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <span>Subscribe</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            &copy; {currentYear} RISE Pakistan. All rights reserved. Real Inspiring Stories &amp; Experiences.
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => onNavigate('/privacy')} className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => onNavigate('/terms')} className="hover:text-neutral-300 transition-colors">
              Terms of Service
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
