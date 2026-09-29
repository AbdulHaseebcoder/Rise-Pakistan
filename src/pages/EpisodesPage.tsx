import React, { useState, useMemo } from 'react';
import { Search, Play, Clock, Calendar, ChevronRight, Filter } from 'lucide-react';
import { Episode } from '../types';
import { AnimatedHeading, AnimatedText } from '../components/AnimatedText';

interface EpisodesPageProps {
  onNavigate: (path: string) => void;
  onPlayEpisode: (episode: Episode) => void;
  episodes: Episode[];
}

export const EpisodesPage: React.FC<EpisodesPageProps> = ({
  onNavigate,
  onPlayEpisode,
  episodes,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    episodes.forEach((e) => set.add(e.category));
    return ['All', ...Array.from(set)];
  }, [episodes]);

  const filteredEpisodes = useMemo(() => {
    return episodes.filter((ep) => {
      const matchCat = selectedCategory === 'All' || ep.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ep.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [episodes, selectedCategory, searchQuery]);

  const featured = episodes.find((e) => e.featured) || episodes[0];

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>THE BROADCAST ARCHIVE</span>
          </div>
          <AnimatedHeading as="h1" className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight">
            Episodes &amp; Dialogues
          </AnimatedHeading>
          <AnimatedText className="text-base text-neutral-400 leading-relaxed">
            Unfiltered long-form discussions exploring leadership decisions, operational breakthroughs, and technology scaling in Pakistan.
          </AnimatedText>
        </div>

        {/* Featured Episode Hero */}
        {featured && (
          <div
            onClick={() => onPlayEpisode(featured)}
            className="group relative rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 cursor-pointer hover:border-emerald-500/40 transition-all duration-300"
          >
            <div className="lg:col-span-7 relative aspect-video lg:aspect-auto min-h-[300px] overflow-hidden bg-black">
              <img
                src={featured.thumbnail || '/assets/studio.jpg'}
                alt={featured.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-black flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                  <Play className="w-6 h-6 fill-black translate-x-0.5" />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="text-emerald-400 font-semibold">{featured.category}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{featured.publishDate || 'Date not yet published'}</span>
                </div>
                <h2 className="text-2xl font-display font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                  {featured.shortDescription || featured.description}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs">
                <div>
                  <span className="text-white font-medium block">{featured.guestName}</span>
                  <span className="text-neutral-400">{featured.guestOrg}</span>
                </div>
                <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-500/20">
                  {featured.duration}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by title, guest, or topic..."
                className="w-full bg-neutral-900/60 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>

            {/* Total Results Count */}
            <div className="text-xs text-neutral-400">
              Showing <span className="font-semibold text-white">{filteredEpisodes.length}</span> of {episodes.length} episodes
            </div>
          </div>

          {/* Interactive Category Segmented Tabs (Functional Buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
            <span className="text-xs text-neutral-400 flex items-center gap-1 mr-2 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3.5 py-1.5 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-medium shadow-sm'
                    : 'bg-white/5 hover:bg-white/10 text-neutral-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Episodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEpisodes.map((ep) => (
            <div
              key={ep.id}
              className="group rounded-xl border border-white/10 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              onClick={() => onPlayEpisode(ep)}
            >
              <div>
                <div className="relative aspect-video overflow-hidden bg-black">
                  <img
                    src={ep.thumbnail || '/assets/studio.jpg'}
                    alt={ep.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-black flex items-center justify-center">
                      <Play className="w-5 h-5 fill-black translate-x-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 text-[10px] font-mono text-white/90 bg-black/70 px-2 py-0.5 rounded">
                    {ep.duration}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="text-xs text-emerald-400 font-semibold">{ep.category}</div>
                  <h3 className="text-lg font-display font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {ep.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {ep.shortDescription || ep.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                <span className="font-medium text-white truncate max-w-[180px]">
                  {ep.guestName}
                </span>
                <span className="flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                  <span>Watch</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredEpisodes.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <p className="text-neutral-400 text-sm">No episodes match your criteria.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
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
