import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';

export const TermsPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
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
            <FileText className="w-4 h-4" />
            <span>LEGAL CONTRACT</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-white">Terms of Service</h1>
          <p className="text-xs text-neutral-400">Last updated: February 2025</p>
        </div>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-neutral-300 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-display font-semibold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing RISE Pakistan or booking broadcast dialogues, you agree to comply with these Terms of Service. If you disagree with any portion of these conditions, you may refrain from platform usage.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-display font-semibold text-white">2. Intellectual Property &amp; Broadcast Rights</h2>
            <p>
              All video recordings, audio tracks, brand marks, and editorial essays published under the RISE Pakistan umbrella remain the exclusive intellectual property of RISE Pakistan unless mutually modified through formal corporate syndication contracts.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-display font-semibold text-white">3. Recording Protocols</h2>
            <p>
              Guest participation is subject to pre-interview editorial alignment. RISE Pakistan reserves the right to postpone or cancel recording sessions in the event of logistical or technical contingencies.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
