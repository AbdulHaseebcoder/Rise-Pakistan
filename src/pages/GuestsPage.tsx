import React, { useState, useMemo } from 'react';
import { Search, User, ArrowUpRight, Linkedin, Filter } from 'lucide-react';
import { Guest } from '../types';
import { AnimatedHeading, AnimatedText } from '../components/AnimatedText';

interface GuestsPageProps {
  onNavigate: (path: string) => void;
  guests: Guest[];
}

export const GuestsPage: React.FC<GuestsPageProps> = ({ onNavigate, guests }) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const industries = useMemo(() => {
    const set = new Set<string>();
    guests.forEach((g) => set.add(g.industry));
    return ['All', ...Array.from(set)];
  }, [guests]);

  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      const matchInd = selectedIndustry === 'All' || g.industry === selectedIndustry;
      const matchQuery =
        !searchQuery.trim() ||
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.bio.toLowerCase().includes(searchQuery.toLowerCase());
      return matchInd && matchQuery;
    });
  }, [guests, selectedIndustry, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>GUEST DIRECTORY</span>
          </div>
          <AnimatedHeading as="h1" className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight">
            The Innovators &amp; Leaders
          </AnimatedHeading>
          <AnimatedText className="text-base text-neutral-400 leading-relaxed">
            Distinguished executives, institution leaders, founders, and subject matter specialists who have graced the RISE Pakistan studio.
          </AnimatedText>
        </div>

        {/* Filter & Search Bar */}
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search guests by name or company..."
                className="w-full bg-neutral-900/60 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div className="text-xs text-neutral-400">
              Showing <span className="font-semibold text-white">{filteredGuests.length}</span> leaders
            </div>
          </div>

          {/* Interactive Industry Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
            <span className="text-xs text-neutral-400 flex items-center gap-1 mr-2 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Industry:
            </span>
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`text-xs px-3.5 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedIndustry === ind
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                }`}
              >
                {ind}
              </button>
            ))}
          </div>
        </div>

        {/* Guests Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGuests.map((g) => (
            <div
              key={g.id}
              onClick={() => onNavigate(`/guests/${g.slug}`)}
              className="group p-8 rounded-2xl border border-white/10 bg-neutral-900/30 hover:border-emerald-500/40 hover:bg-neutral-900/60 transition-all duration-300 flex flex-col justify-between space-y-6 cursor-pointer"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-20 h-20 rounded-full bg-neutral-800 border-2 border-emerald-500/30 overflow-hidden flex items-center justify-center text-2xl font-display font-bold text-emerald-400">
                    {g.photo && g.photo !== '/assets/studio.jpg' ? (
                      <img src={g.photo} alt={g.name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{g.name.charAt(0)}</span>
                    )}
                  </div>
                  {g.socialLinks?.linkedin && (
                    <a
                      href={g.socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-full bg-white/5 hover:bg-emerald-950 hover:text-emerald-400 border border-white/10 text-neutral-400 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-display font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {g.name}
                  </h3>
                  <p className="text-xs font-medium text-emerald-400 mt-0.5">{g.role}</p>
                  <p className="text-xs text-neutral-400">{g.organization}</p>
                </div>

                <p className="text-xs text-neutral-300 leading-relaxed line-clamp-3">
                  {g.bio}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                <div className="flex items-center gap-2 truncate max-w-[220px]">
                  <span className="truncate">{g.industry}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                    {g.episodeCount || 1} Ep
                  </span>
                </div>
                <span className="flex items-center gap-1 text-white group-hover:text-emerald-400 font-medium">
                  <span>Profile</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredGuests.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-neutral-400 text-sm">No guests found matching your criteria.</p>
            <button
              onClick={() => {
                setSelectedIndustry('All');
                setSearchQuery('');
              }}
              className="text-xs text-emerald-400 underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
