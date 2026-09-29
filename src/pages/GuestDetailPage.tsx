import React from 'react';
import { ArrowLeft, Play, Linkedin, ArrowUpRight } from 'lucide-react';
import { Guest, Episode } from '../types';
import { AnimatedHeading, AnimatedText } from '../components/AnimatedText';

interface GuestDetailPageProps {
  slug: string;
  guests: Guest[];
  episodes: Episode[];
  onNavigate: (path: string) => void;
  onPlayEpisode: (episode: Episode) => void;
}

export const GuestDetailPage: React.FC<GuestDetailPageProps> = ({
  slug,
  guests,
  episodes,
  onNavigate,
  onPlayEpisode,
}) => {
  const guest = guests.find((g) => g.slug === slug || g.id === slug);

  if (!guest) {
    return (
      <div className="min-h-screen bg-black text-white pt-36 pb-20 px-6 text-center space-y-4">
        <h2 className="text-3xl font-display font-bold">Guest Not Found</h2>
        <p className="text-neutral-400 text-sm">The leader profile you requested could not be located in our directory.</p>
        <button
          onClick={() => onNavigate('/guests')}
          className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Return to Guest Directory
        </button>
      </div>
    );
  }

  const guestEpisodes = episodes.filter(
    (e) => e.guestId === guest.id || e.guestName.toLowerCase() === guest.name.toLowerCase()
  );

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('/guests')}
          className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Guests</span>
        </button>

        {/* Profile Card */}
        <div className="p-8 md:p-12 rounded-2xl border border-white/10 bg-neutral-900/30 grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-4 flex flex-col items-center text-center space-y-4">
            <div className="w-36 h-36 rounded-full bg-neutral-800 border-2 border-emerald-500/40 overflow-hidden flex items-center justify-center text-4xl font-display font-bold text-emerald-400 shadow-2xl">
              {guest.photo && guest.photo !== '/assets/studio.jpg' ? (
                <img src={guest.photo} alt={guest.name} className="w-full h-full object-cover" />
              ) : (
                <span>{guest.name.charAt(0)}</span>
              )}
            </div>

            {guest.socialLinks?.linkedin && (
              <a
                href={guest.socialLinks.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>Verified LinkedIn</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="md:col-span-8 space-y-4">
            <div className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
              {guest.industry}
            </div>
            <AnimatedHeading as="h1" className="text-3xl sm:text-4xl font-display font-bold text-white">
              {guest.name}
            </AnimatedHeading>
            <p className="text-base text-neutral-300 font-medium">
              {guest.role} · <span className="text-emerald-400">{guest.organization}</span>
            </p>
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-semibold mb-2">
                Executive Profile
              </h4>
              <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                {guest.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Featured Episodes with this Guest */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-2xl font-display font-bold text-white">
              Broadcasts Featuring {guest.name}
            </h3>
            <span className="text-xs text-neutral-400">
              {guestEpisodes.length} {guestEpisodes.length === 1 ? 'Episode' : 'Episodes'}
            </span>
          </div>

          {guestEpisodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guestEpisodes.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => onPlayEpisode(ep)}
                  className="group rounded-xl border border-white/10 bg-neutral-900/30 hover:border-emerald-500/30 p-6 flex flex-col justify-between space-y-4 cursor-pointer transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-neutral-400">
                      <span className="text-emerald-400 font-semibold">{ep.category}</span>
                      <span>{ep.duration}</span>
                    </div>
                    <h4 className="text-lg font-display font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {ep.title}
                    </h4>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {ep.shortDescription || ep.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">{ep.publishDate || 'Date not yet published'}</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <Play className="w-3.5 h-3.5 fill-emerald-400" />
                      <span>Play Dialogue</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-neutral-900/20 border border-white/5 text-center text-xs text-neutral-400">
              Additional dialogue recordings with {guest.name} are currently in post-production.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
