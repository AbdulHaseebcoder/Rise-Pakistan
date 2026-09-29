import React, { useState, useMemo } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Testimonial } from '../types';
import { AnimatedHeading, AnimatedText } from '../components/AnimatedText';

interface TestimonialsPageProps {
  testimonials: Testimonial[];
  onNavigate: (path: string) => void;
}

export const TestimonialsPage: React.FC<TestimonialsPageProps> = ({ testimonials, onNavigate }) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = useMemo(() => {
    if (filterType === 'all') return testimonials;
    return testimonials.filter((t) => t.type === filterType);
  }, [testimonials, filterType]);

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>EXECUTIVE ENDORSEMENTS</span>
          </div>
          <AnimatedHeading as="h1" className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight">
            Partner &amp; Guest Perspectives
          </AnimatedHeading>
          <AnimatedText className="text-base text-neutral-400 leading-relaxed">
            Unsolicited reflections from corporate leaders, university directors, and summit organizers who have collaborated with RISE Pakistan.
          </AnimatedText>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto no-scrollbar">
          {[
            { label: 'All Endorsements', value: 'all' },
            { label: 'Featured Guests', value: 'guest' },
            { label: 'Media Partners', value: 'media' },
            { label: 'Corporate Clients', value: 'client' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterType(tab.value)}
              className={`text-xs px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap ${
                filterType === tab.value
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Testimonials or Authentic Placeholder (Priority 4) */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="p-8 rounded-2xl border border-white/10 bg-neutral-900/30 flex flex-col justify-between space-y-6 hover:border-emerald-500/30 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-1 text-emerald-400">
                    {Array.from({ length: item.rating || 5 }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                    ))}
                  </div>

                  <p className="text-sm text-neutral-200 leading-relaxed italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                    <p className="text-xs text-neutral-400">
                      {item.role}, {item.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 px-6 rounded-2xl border border-white/10 bg-neutral-900/20 max-w-xl mx-auto text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-neutral-900 border border-white/10 flex items-center justify-center text-emerald-400 mx-auto">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-display font-semibold text-white">
              Authentic guest and partner testimonials will appear here.
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
              Verified reflections from industry leaders and summit partners are updated through post-broadcast editorial reviews. Authentic endorsements entered by the administrator will be published here.
            </p>
          </div>
        )}

        {/* CTA banner */}
        <div className="p-8 md:p-12 rounded-2xl bg-neutral-950 border border-white/10 text-center space-y-4">
          <h3 className="text-2xl font-display font-bold text-white">
            Looking to Host a Broadcast or Mobile Expo Booth?
          </h3>
          <p className="text-sm text-neutral-400 max-w-xl mx-auto">
            Discuss customized executive dialogues, enterprise narrative architecture, or on-site mobile studio deployment.
          </p>
          <button
            onClick={() => onNavigate('/contact')}
            className="px-6 py-3 bg-white text-black font-semibold text-xs tracking-wider uppercase rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            Initiate Corporate Dialogue
          </button>
        </div>
      </div>
    </div>
  );
};
