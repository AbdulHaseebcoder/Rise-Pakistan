import React from 'react';
import { X, Youtube, Share2, Calendar, Clock, User } from 'lucide-react';
import { Episode } from '../types';

interface VideoPlayerModalProps {
  episode: Episode | null;
  onClose: () => void;
  onViewGuest?: (guestId: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ episode, onClose, onViewGuest }) => {
  if (!episode) return null;

  // Extract YouTube ID if valid
  const getYoutubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const id = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
      }
    } catch {
      // Fallback
    }
    return null;
  };

  const [copied, setCopied] = React.useState(false);

  const embedUrl = getYoutubeEmbedUrl(episode.youtubeUrl);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-xl animate-modal-backdrop">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-modal-card">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-neutral-900/60">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
              RISE Pakistan Broadcast
            </span>
          </div>

          <div className="flex items-center gap-2">
            {copied && (
              <span className="text-xs font-mono text-emerald-400 animate-fade-in bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                Link Copied!
              </span>
            )}
            <button
              onClick={handleShare}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              title="Share Episode"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={episode.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={episode.thumbnail || '/assets/studio.jpg'}
                alt={episode.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 p-6 text-center">
                <a
                  href={episode.youtubeUrl || 'https://www.youtube.com/@RisePakistan-podcast'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-transform hover:scale-105 shadow-xl"
                >
                  <Youtube className="w-5 h-5" />
                  <span>Watch on Official YouTube Channel</span>
                </a>
                <p className="text-xs text-neutral-400 mt-3">
                  Watch executive dialogues with Pakistan&apos;s innovators and business leaders
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Episode Info Details */}
        <div className="p-6 overflow-y-auto space-y-4">
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

          <h2 className="text-xl md:text-2xl font-display font-bold text-white">
            {episode.title}
          </h2>

          <div className="flex items-center gap-3 py-2 border-y border-white/5">
            <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">{episode.guestName}</h4>
              <p className="text-xs text-neutral-400">
                {episode.guestRole} · {episode.guestOrg}
              </p>
            </div>
          </div>

          <p className="text-sm text-neutral-300 leading-relaxed">
            {episode.description}
          </p>

          {/* Topics */}
          {episode.topics && episode.topics.length > 0 && (
            <div className="pt-2">
              <span className="text-xs uppercase tracking-wider text-neutral-500 font-semibold block mb-2">
                Discussion Topics
              </span>
              <div className="flex flex-wrap gap-1.5">
                {episode.topics.map((t, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-neutral-300 px-2.5 py-1 bg-white/5 border border-white/5 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
