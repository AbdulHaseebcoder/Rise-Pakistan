import React, { useState, useEffect } from 'react';
import {
  Linkedin,
  Instagram,
  Globe,
  Mail,
  ArrowUpRight,
  X,
  Radio,
  Sparkles,
  Shield,
  Layers,
} from 'lucide-react';
import { TeamMember, Episode } from '../types';
import { AnimatedHeading, AnimatedText } from './AnimatedText';

interface TeamSectionProps {
  onNavigate: (path: string) => void;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ onNavigate }) => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  useEffect(() => {
    async function loadTeamData() {
      try {
        const [teamRes, epRes] = await Promise.all([
          fetch('/api/team'),
          fetch('/api/episodes'),
        ]);

        if (teamRes.ok) {
          const teamData = await teamRes.json();
          setTeam(teamData);
        }
        if (epRes.ok) {
          const epData = await epRes.json();
          setEpisodes(epData);
        }
      } catch (err) {
        console.warn('Error loading team data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadTeamData();
  }, []);

  if (!loading && team.length === 0) return null;

  return (
    <section className="py-28 px-6 md:px-12 border-b border-white/10 bg-gradient-to-b from-neutral-950/30 via-black to-black relative overflow-hidden">
      {/* Subtle background ambient glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-950/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 relative z-10">
        {/* Section Header (Requirement 70) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>LEADERSHIP &amp; PRODUCTION COLLECTIVE</span>
            </div>
            <AnimatedHeading as="h2" className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-white tracking-tight leading-[1.05]">
              THE PEOPLE
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-white">
                BEHIND RISE.
              </span>
            </AnimatedHeading>
          </div>
          <AnimatedText className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">
            The operators, broadcast hosts, and production technologists building Pakistan&apos;s digital media platform and remote recording infrastructure.
          </AnimatedText>
        </div>

        {/* Portrait-Driven Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <div
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="group relative rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 hover:border-emerald-500/50 transition-all duration-500 cursor-pointer flex flex-col justify-between shadow-lg hover:shadow-2xl hover:shadow-emerald-950/30"
            >
              {/* Portrait Aspect Ratio with Hover Movement & Sheen */}
              <div className="aspect-[4/5] relative overflow-hidden bg-neutral-900">
                <img
                  src={member.photo || '/assets/host.jpg'}
                  alt={member.name}
                  className="w-full h-full object-cover object-top opacity-85 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                {/* Subtle gradient vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent opacity-90 group-hover:opacity-75 transition-opacity" />

                {/* Department Tag */}
                <div className="absolute top-3 left-3 text-[10px] font-mono uppercase text-emerald-300 bg-black/75 px-2.5 py-1 rounded-full backdrop-blur-md border border-emerald-500/30 font-semibold tracking-wider">
                  {member.department}
                </div>

                {/* Arrow Icon */}
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-neutral-400 group-hover:text-emerald-400 group-hover:border-emerald-500/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              {/* Bottom Editorial Content */}
              <div className="p-6 space-y-3 -mt-6 relative z-10 bg-neutral-950/90 backdrop-blur-md border-t border-white/5 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-display font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-medium">
                    {member.role}
                  </p>
                </div>

                <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                  {member.shortBio || member.bio}
                </p>

                {/* Social Quick Links */}
                <div
                  className="pt-3 border-t border-white/10 flex items-center gap-3 text-neutral-400"
                  onClick={(e) => e.stopPropagation()}
                >
                  {member.linkedIn && (
                    <a
                      href={member.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors"
                      title="LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.instagram && (
                    <a
                      href={member.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors"
                      title="Instagram"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.website && (
                    <a
                      href={member.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors"
                      title="Website"
                    >
                      <Globe className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {member.email && (
                    <a
                      href={`mailto:${member.email}`}
                      className="hover:text-emerald-400 transition-colors"
                      title="Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <span className="text-[10px] font-mono text-neutral-500 ml-auto group-hover:text-emerald-400 transition-colors">
                    View Dossier &rarr;
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Member Profile Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-modal-backdrop">
          <div className="w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col animate-modal-card">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-black/60 border border-white/10 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="overflow-y-auto p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                  <img
                    src={selectedMember.photo || '/assets/host.jpg'}
                    alt={selectedMember.name}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full font-semibold">
                    {selectedMember.department}
                  </span>
                  <h3 className="text-2xl font-display font-bold text-white">
                    {selectedMember.name}
                  </h3>
                  <p className="text-sm text-neutral-300 font-medium">
                    {selectedMember.role}
                  </p>
                  {selectedMember.email && (
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1.5 pt-1"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{selectedMember.email}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Full Bio */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block">
                  LEADERSHIP PROFILE
                </span>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans whitespace-pre-line">
                  {selectedMember.fullBio || selectedMember.bio}
                </p>
              </div>

              {/* Associated Broadcasts / Studio Sessions */}
              {selectedMember.associatedEpisodes && selectedMember.associatedEpisodes.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block">
                    ASSOCIATED BROADCASTS
                  </span>
                  <div className="space-y-2">
                    {episodes
                      .filter((e) => selectedMember.associatedEpisodes?.includes(e.id))
                      .slice(0, 3)
                      .map((ep) => (
                        <div
                          key={ep.id}
                          onClick={() => {
                            setSelectedMember(null);
                            onNavigate(`/episodes/${ep.slug}`);
                          }}
                          className="p-3 rounded-xl bg-neutral-900/60 border border-white/10 hover:border-emerald-500/40 transition-colors flex items-center justify-between cursor-pointer group"
                        >
                          <div>
                            <h4 className="text-xs font-semibold text-white group-hover:text-emerald-300 transition-colors">
                              {ep.title}
                            </h4>
                            <p className="text-[11px] text-neutral-400">
                              Guest: {ep.guestName} ({ep.guestOrg}) · {ep.duration}
                            </p>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400 transition-transform" />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-neutral-400">
                  {selectedMember.linkedIn && (
                    <a
                      href={selectedMember.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-mono"
                    >
                      <Linkedin className="w-4 h-4" />
                      <span>LinkedIn</span>
                    </a>
                  )}
                  {selectedMember.website && (
                    <a
                      href={selectedMember.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-xs font-mono"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Website</span>
                    </a>
                  )}
                </div>

                <button
                  onClick={() => {
                    setSelectedMember(null);
                    onNavigate('/contact');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Contact Desk
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
