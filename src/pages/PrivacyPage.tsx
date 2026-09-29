import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

export const PrivacyPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-3xl mx-auto space-y-10">
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Shield className="w-4 h-4" />
            <span>DATA GOVERNANCE</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-white">Privacy Policy</h1>
          <p className="text-xs text-neutral-400">Last updated: February 2025</p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-neutral-300 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-display font-semibold text-white">1. Scope &amp; Commitment</h2>
            <p>
              RISE Pakistan (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) respects the confidentiality of executive inquiries, guest contact information, and platform visitors. This Privacy Policy details our handling of information gathered through our digital media website, booking calendars, and concierge interfaces.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-display font-semibold text-white">2. Information We Collect</h2>
            <p>
              We collect information provided directly by users when submitting booking requests, corporate inquiries, or engaging with the RISE AI Concierge. This includes names, professional titles, organizational affiliations, business email addresses, telephone numbers, and inquiry descriptions.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-display font-semibold text-white">3. Use of Information</h2>
            <p>
              Information collected is used strictly to coordinate recording sessions, confirm calendar availability, deliver editorial show notes, and maintain corporate communications. We do not sell or monetize personal or institutional contact details with third-party data brokers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-display font-semibold text-white">4. Secure Storage</h2>
            <p>
              All submissions and booking records are stored in encrypted persistent data stores with server-side authentication barriers. Access is restricted strictly to authorized RISE Pakistan production personnel.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
