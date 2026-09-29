import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Mic, User, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';
import { Episode, Guest, Blog, ServiceItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    episodes: Episode[];
    guests: Guest[];
    blogs: Blog[];
    services: ServiceItem[];
  }>({ episodes: [], guests: [], blogs: [], services: [] });
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isOpen && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        // open is handled by parent, but if already mounted, focus
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ episodes: [], guests: [], blogs: [], services: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ episodes: [], guests: [], blogs: [], services: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalCount = results.episodes.length + results.guests.length + results.blogs.length + results.services.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/80 backdrop-blur-md animate-modal-backdrop">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-modal-card">
        {/* Search Bar Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 bg-neutral-900/60">
          <Search className="w-5 h-5 text-neutral-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search episodes, guests, articles, or services..."
            className="w-full bg-transparent text-white text-base outline-none placeholder:text-neutral-500"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-white rounded cursor-pointer mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white px-2 py-1 bg-white/5 rounded border border-white/10"
          >
            ESC
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-5">
          {isLoading && (
            <div className="text-center py-8 text-neutral-400 text-sm">
              Searching RISE archive...
            </div>
          )}

          {!isLoading && query && totalCount === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-neutral-400">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-neutral-400 mt-1">Try searching for &quot;Education&quot;, &quot;Marketing&quot;, or &quot;Sanam Pathan&quot;</p>
            </div>
          )}

          {!query && (
            <div className="py-6 px-2">
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-3">
                Suggested Topics
              </span>
              <div className="flex flex-wrap gap-2">
                {['Transnational Education', 'Performance Marketing', 'Personal Branding', 'Workplace Culture', 'ITCN Asia', 'Corporate PR'].map((topic) => (
                  <button
                    key={topic}
                    onClick={() => setQuery(topic)}
                    className="text-xs px-3 py-1.5 rounded-md bg-white/5 hover:bg-emerald-950/40 hover:text-emerald-300 border border-white/5 transition-colors cursor-pointer text-neutral-300"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Episodes */}
          {results.episodes.length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-2 px-2">
                Episodes
              </span>
              <div className="space-y-1">
                {results.episodes.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => {
                      onNavigate(`/episodes/${ep.slug}`);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-emerald-950/50 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                          {ep.title}
                        </h4>
                        <p className="text-xs text-neutral-400">
                          with {ep.guestName} · {ep.duration}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Guests */}
          {results.guests.length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-2 px-2">
                Guests
              </span>
              <div className="space-y-1">
                {results.guests.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => {
                      onNavigate(`/guests/${g.slug}`);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-300 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                          {g.name}
                        </h4>
                        <p className="text-xs text-neutral-400">
                          {g.role}, {g.organization}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Blogs */}
          {results.blogs.length > 0 && (
            <div>
              <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block mb-2 px-2">
                Articles &amp; Insights
              </span>
              <div className="space-y-1">
                {results.blogs.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => {
                      onNavigate(`/blogs/${b.slug}`);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-lg hover:bg-white/5 cursor-pointer group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-neutral-800 border border-white/10 flex items-center justify-center text-neutral-300 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-white group-hover:text-emerald-300 transition-colors">
                          {b.title}
                        </h4>
                        <p className="text-xs text-neutral-400">
                          by {b.author} · {b.readingTime}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Tip */}
        <div className="px-4 py-2.5 bg-neutral-900 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400">
          <span>Navigate with mouse or click</span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" /> to select · ESC to exit
          </span>
        </div>
      </div>
    </div>
  );
};
