import React, { useState } from 'react';
import {
  Linkedin,
  Instagram,
  Globe,
  Mail,
  ArrowUpRight,
  X,
  Radio,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Tv,
} from 'lucide-react';
import { TeamMember } from '../types';
import { AnimatedHeading, AnimatedText } from '../components/AnimatedText';

interface TeamPageProps {
  onNavigate: (path: string) => void;
  team: TeamMember[];
}

export const TeamPage: React.FC<TeamPageProps> = ({ onNavigate, team }) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const departments = ['All', 'Leadership', 'Host', 'Production', 'Operations'];

  const filteredTeam = selectedDept === 'All'
    ? team
    : team.filter((m) => m.department.toLowerCase() === selectedDept.toLowerCase());

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-24 px-6 md:px-12 selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Editorial Page Header */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>COLLECTIVE LEADERSHIP</span>
          </div>

          <AnimatedHeading
            as="h1"
            className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight text-white leading-[1.05]"
          >
            THE PEOPLE
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-200 to-white">
              BEHIND RISE.
            </span>
          </AnimatedHeading>

          <AnimatedText className="text-base sm:text-lg text-neutral-300 leading-relaxed font-normal">
            The operators, broadcast hosts, and production technologists building Pakistan&apos;s digital media platform, remote recording infrastructure, and high-impact executive dialogues.
          </AnimatedText>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-2">
            {departments.map((dept) => {
              const isSelected = selectedDept === dept;
              return (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-semibold shadow-[0_0_15px_rgba(0,166,81,0.4)]'
                      : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-white/5'
                  }`}
                >
                  {dept} {dept === 'All' ? `(${team.length})` : ''}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-mono text-neutral-400">
            SHOWING {filteredTeam.length} TEAM {filteredTeam.length === 1 ? 'MEMBER' : 'MEMBERS'}
          </div>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredTeam.map((member) => (
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

                {/* Quick Bio Hover Snippet */}
                <div className="absolute bottom-4 left-4 right-4 space-y-1">
                  <h3 className="text-lg font-display font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-xs text-neutral-300 font-medium line-clamp-1">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="p-5 pt-3 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {member.shortBio || member.bio}
                </p>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
                  <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider flex items-center gap-1 group-hover:text-emerald-300">
                    <span>View Profile</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>

                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    {member.linkedIn && (
                      <a
                        href={member.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-500 hover:text-emerald-400 transition-colors"
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
                        className="text-neutral-500 hover:text-emerald-400 transition-colors"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="text-neutral-500 hover:text-emerald-400 transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Architectural Pillars Behind Production */}
        <div className="pt-16 border-t border-white/10 space-y-10">
          <div className="max-w-2xl space-y-3">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              OPERATIONAL INTEGRITY
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-bold text-white">
              Pristine Production Standards
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed">
              Every RISE Pakistan dialogue adheres to our proprietary 48kHz audio calibration, 4K multi-angle capture, and identity-preserving AI enhancement protocol.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-white/10 bg-neutral-950/60 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white">Editorial Truth</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Zero pre-rehearsed corporate spin. We delve into genuine inflection points, unit economics, market pivots, and hard-won executive lessons.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-neutral-950/60 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white">Hybrid Studio Infrastructure</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Seamlessly connecting physical studios in Karachi with remote leaders nationwide through our lossless browser-based recording system.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-white/10 bg-neutral-950/60 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/60 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-display font-semibold text-white">Full-Funnel Content Engine</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Each 45-minute executive broadcast is transformed into multi-platform social master assets, reels, and executive quote cards within hours.
              </p>
            </div>
          </div>
        </div>

        {/* Contextual CTA */}
        <div className="p-10 md:p-14 rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-neutral-950 via-emerald-950/20 to-neutral-950 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center md:text-left">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              CONNECT WITH OUR DESK
            </span>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
              Collaborate With the Production Team
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              Pitch an executive profile, arrange on-site mobile podcast coverage for your convention, or book a private RISE studio recording session.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('/studio')}
              className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors cursor-pointer shadow-[0_0_20px_rgba(0,166,81,0.35)]"
            >
              Enter RISE Studio
            </button>
            <button
              onClick={() => onNavigate('/contact')}
              className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white font-medium text-xs tracking-wider uppercase rounded-lg border border-white/10 transition-colors cursor-pointer"
            >
              Book a Session
            </button>
          </div>
        </div>
      </div>

      {/* Team Member Detailed Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-neutral-950 border border-white/15 rounded-3xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl space-y-6 my-8">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-neutral-900 border border-white/10 text-neutral-400 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border border-emerald-500/40 shrink-0 bg-neutral-900">
                <img
                  src={selectedMember.photo || '/assets/host.jpg'}
                  alt={selectedMember.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-xs font-mono uppercase text-emerald-400 tracking-wider">
                  {selectedMember.department}
                </span>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
                  {selectedMember.name}
                </h2>
                <p className="text-sm text-neutral-300 font-medium">
                  {selectedMember.role}
                </p>

                {/* Social Icons */}
                <div className="flex items-center justify-center sm:justify-start gap-3 pt-2">
                  {selectedMember.linkedIn && (
                    <a
                      href={selectedMember.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 hover:text-emerald-400 transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                  {selectedMember.instagram && (
                    <a
                      href={selectedMember.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 hover:text-emerald-400 transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {selectedMember.website && (
                    <a
                      href={selectedMember.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 hover:text-emerald-400 transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                    </a>
                  )}
                  {selectedMember.email && (
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="p-2 rounded-lg bg-neutral-900 border border-white/10 text-neutral-300 hover:text-emerald-400 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-3 pt-4 border-t border-white/10 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              <p>{selectedMember.fullBio || selectedMember.bio}</p>
            </div>

            <div className="pt-4 border-t border-white/10 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
