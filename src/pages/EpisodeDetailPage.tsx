import React from 'react';
import { ArrowLeft, Play, Calendar, Clock, Share2, Youtube, User, Tag } from 'lucide-react';
import { Episode } from '../types';
import { AnimatedHeading, AnimatedText } from '../components/AnimatedText';

interface EpisodeDetailPageProps {
  slug: string;
  episodes: Episode[];
  onNavigate: (path: string) => void;
  onPlayEpisode: (episode: Episode) => void;
}

export const EpisodeDetailPage: React.FC<EpisodeDetailPageProps> = ({
  slug,
  episodes,
  onNavigate,
  onPlayEpisode,
}) => {
  const episode = episodes.find((e) => e.slug === slug || e.id === slug);

  if (!episode) {
    return (
      <div className="min-h-screen bg-black text-white pt-36 pb-20 px-6 text-center space-y-4">
        <h2 className="text-3xl font-display font-bold">Episode Not Found</h2>
        <p className="text-neutral-400 text-sm">The broadcast you requested is unavailable or has been archived.</p>
        <button
          onClick={() => onNavigate('/episodes')}
          className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Return to Episodes
        </button>
      </div>
    );
  }

  const related = episodes
    .filter((e) => e.id !== episode.id && (e.category === episode.category || e.guestOrg === episode.guestOrg))
    .slice(0, 3);

  const [copied, setCopied] = React.useState(false);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: episode.title,
        text: episode.shortDescription,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('/episodes')}
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Episodes</span>
        </button>

        {/* Header Metadata */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            <span className="text-emerald-400 font-semibold">{episode.category}</span>
            <span aria-hidden="true">&middot;</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {episode.publishDate || 'Date not yet published'}
            </span>
            <span aria-hidden="true">&middot;</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {episode.duration}
            </span>
          </div>

          <AnimatedHeading as="h1" className="text-3xl sm:text-5xl font-display font-bold text-white leading-tight">
            {episode.title}
          </AnimatedHeading>
        </div>

        {/* Video Player Preview / Trigger */}
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-neutral-950 border border-white/10 group">
          <img
            src={episode.thumbnail || '/assets/studio.jpg'}
            alt={episode.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center">
            <button
              onClick={() => onPlayEpisode(episode)}
              className="w-20 h-20 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-[0_0_30px_rgba(0,166,81,0.5)] cursor-pointer mb-4"
              title="Play Episode"
            >
              <Play className="w-8 h-8 fill-black translate-x-0.5" />
            </button>
            <span className="text-xs font-mono uppercase tracking-wider text-white bg-black/60 px-3 py-1 rounded backdrop-blur-sm">
              CLICK TO WATCH FULL BROADCAST
            </span>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex items-center justify-between py-4 border-y border-white/10">
          <button
            onClick={() => onPlayEpisode(episode)}
            className="px-5 py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            <span>Launch Player</span>
          </button>

          <div className="flex items-center gap-3">
            <a
              href={episode.youtubeUrl || 'https://www.youtube.com/@RisePakistan-podcast'}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>YouTube</span>
            </a>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 transition-colors cursor-pointer"
              title="Share Episode"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Guest Profile Card */}
        <div className="p-6 rounded-xl bg-neutral-900/40 border border-white/10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-xl font-display font-bold text-emerald-400 shrink-0">
              {episode.guestName.charAt(0)}
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold block">
                Featured Guest
              </span>
              <h3 className="text-lg font-display font-bold text-white">{episode.guestName}</h3>
              <p className="text-xs text-neutral-400">
                {episode.guestRole} · {episode.guestOrg}
              </p>
            </div>
          </div>
          {episode.guestId && (
            <button
              onClick={() => onNavigate(`/guests/${episode.guestId}`)}
              className="hidden sm:inline-flex px-3.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium rounded text-white transition-colors"
            >
              View Guest Profile
            </button>
          )}
        </div>

        {/* Comprehensive Description & Show Notes */}
        <div className="space-y-6 pt-4 text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
          <h3 className="text-xl font-display font-bold text-white">
            Editorial Notes &amp; Summary
          </h3>
          <p>{episode.description}</p>
        </div>

        {/* Discussion Topics */}
        {episode.topics && episode.topics.length > 0 && (
          <div className="space-y-3 pt-6 border-t border-white/10">
            <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block">
              Core Themes
            </span>
            <div className="flex flex-wrap gap-2">
              {episode.topics.map((topic, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 text-xs text-neutral-300 px-3 py-1.5 bg-neutral-900 border border-white/5 rounded-md"
                >
                  <Tag className="w-3 h-3 text-emerald-400" />
                  <span>{topic}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Related Broadcasts */}
        {related.length > 0 && (
          <div className="space-y-6 pt-12 border-t border-white/10">
            <h3 className="text-2xl font-display font-bold text-white">
              Related Dialogues
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((r) => (
                <div
                  key={r.id}
                  onClick={() => onNavigate(`/episodes/${r.slug}`)}
                  className="p-5 rounded-xl border border-white/10 bg-neutral-900/30 hover:border-emerald-500/30 transition-all cursor-pointer space-y-3"
                >
                  <div className="text-[11px] text-emerald-400 font-medium">{r.category}</div>
                  <h4 className="text-sm font-display font-bold text-white line-clamp-2">{r.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 border-t border-white/5">
                    <span>{r.guestName}</span>
                    <span>{r.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
