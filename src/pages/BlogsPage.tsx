import React, { useState, useMemo } from 'react';
import { Search, Calendar, Clock, ArrowRight, Filter } from 'lucide-react';
import { Blog } from '../types';
import { AnimatedHeading, AnimatedText } from '../components/AnimatedText';

interface BlogsPageProps {
  onNavigate: (path: string) => void;
  blogs: Blog[];
}

export const BlogsPage: React.FC<BlogsPageProps> = ({ onNavigate, blogs }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = useMemo(() => {
    const set = new Set<string>();
    blogs.forEach((b) => set.add(b.category));
    return ['All', ...Array.from(set)];
  }, [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((b) => {
      const matchCat = selectedCategory === 'All' || b.category === selectedCategory;
      const matchQuery =
        !searchQuery.trim() ||
        b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [blogs, selectedCategory, searchQuery]);

  const featured = blogs.find((b) => b.featured) || blogs[0];

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>EXECUTIVE PERSPECTIVES &amp; MEDIA DISPATCHES</span>
          </div>
          <AnimatedHeading as="h1" className="text-4xl sm:text-6xl font-display font-bold text-white tracking-tight">
            The RISE Journal
          </AnimatedHeading>
          <AnimatedText className="text-base text-neutral-400 leading-relaxed">
            Incisive essays on strategic PR, founder storytelling, macroeconomic volatility, and the architectural evolution of Pakistan&apos;s digital economy.
          </AnimatedText>
        </div>

        {/* Featured Editorial Article */}
        {featured && (
          <div
            onClick={() => onNavigate(`/blogs/${featured.slug}`)}
            className="group relative rounded-2xl border border-white/10 bg-neutral-950 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 cursor-pointer hover:border-emerald-500/40 transition-all duration-300"
          >
            <div className="lg:col-span-7 relative aspect-video lg:aspect-auto min-h-[300px] overflow-hidden bg-neutral-900">
              <img
                src={featured.coverImage || '/assets/studio.jpg'}
                alt={featured.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
              />
            </div>

            <div className="lg:col-span-5 p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-neutral-400">
                  <span className="text-emerald-400 font-semibold">{featured.category}</span>
                  <span aria-hidden="true">&middot;</span>
                  <span>{featured.readingTime}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-sm text-neutral-300 line-clamp-3 leading-relaxed">
                  {featured.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-white/5 pt-4 text-xs text-neutral-400">
                <span className="text-white font-medium">By {featured.author}</span>
                <span>{featured.publishDate}</span>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search articles by title or keyword..."
                className="w-full bg-neutral-900/60 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500/50 transition-colors"
              />
            </div>
            <div className="text-xs text-neutral-400">
              Showing <span className="font-semibold text-white">{filteredBlogs.length}</span> articles
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-2">
            <span className="text-xs text-neutral-400 flex items-center gap-1 mr-2 shrink-0">
              <Filter className="w-3.5 h-3.5" /> Topic:
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

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((b) => (
            <div
              key={b.id}
              onClick={() => onNavigate(`/blogs/${b.slug}`)}
              className="group rounded-xl border border-white/10 bg-neutral-900/40 hover:bg-neutral-900/80 hover:border-emerald-500/30 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
            >
              <div>
                <div className="aspect-video relative overflow-hidden bg-neutral-900">
                  <img
                    src={b.coverImage || '/assets/studio.jpg'}
                    alt={b.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <div className="text-xs text-emerald-400 font-semibold">{b.category}</div>
                  <h3 className="text-lg font-display font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
                    {b.title}
                  </h3>
                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {b.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                <span>By {b.author}</span>
                <span>{b.readingTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
