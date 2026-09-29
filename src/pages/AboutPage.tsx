import React from 'react';
import { ArrowUpRight, Award, Radio, Users, CheckCircle2, ShieldCheck } from 'lucide-react';
import { TeamMember, PartnershipItem } from '../types';
import { AnimatedHeading, AnimatedText } from '../components/AnimatedText';

interface AboutPageProps {
  onNavigate: (path: string) => void;
  team: TeamMember[];
  partnerships: PartnershipItem[];
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate, team, partnerships }) => {
  const leadership = team.filter((m) => m.department === 'Leadership' || m.department === 'Host');
  const operations = team.filter((m) => m.department === 'Operations' || m.department === 'Production');

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-24">
        {/* Editorial Hero Header */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>ORIGIN &amp; MISSION</span>
          </div>

          <AnimatedHeading as="h1" className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-white leading-tight">
            Giving Pakistan&apos;s Builders Their Rightful Voice.
          </AnimatedHeading>

          <AnimatedText className="text-lg text-neutral-300 leading-relaxed font-normal">
            RISE Pakistan was founded on a simple conviction: Pakistan is home to world-class operators, technical pioneers, and resilient business leaders whose stories deserve global presentation, uncompromising production fidelity, and radical candor.
          </AnimatedText>
        </div>

        {/* Narrative Split: Mission & Philosophy */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-white/10">
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold block">
              Our Core Mission
            </span>
            <AnimatedHeading as="h2" className="text-2xl font-display font-bold text-white">
              To provide professional storytelling, personal branding, and media amplification for the Pakistani business landscape.
            </AnimatedHeading>
            <AnimatedText className="text-sm text-neutral-300 leading-relaxed">
              We serve as an enduring bridge between the corporate sector, technology startups, institutional investors, and ambitious professionals. Rather than superficial press coverage, we produce long-form, intellectually rigorous dialogues that document operational grit, business strategy, and technological evolution.
            </AnimatedText>
          </div>

          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold block">
              Editorial Philosophy
            </span>
            <AnimatedHeading as="h2" className="text-2xl font-display font-bold text-white">
              Radical Candor Over Fluff.
            </AnimatedHeading>
            <AnimatedText className="text-sm text-neutral-300 leading-relaxed">
              Every RISE Pakistan broadcast is anchored in truth. We explore early startup failures, unit economics, macroeconomic crises, management pivots, and the real emotional cost of scaling enterprises. Our microphones capture the lessons behind the headlines.
            </AnimatedText>
          </div>
        </div>

        {/* The Core Focus Pillars */}
        <div className="space-y-8 pt-8 border-t border-white/10">
          <div className="max-w-xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold block">
              Content Architecture
            </span>
            <h2 className="text-3xl font-display font-bold text-white">
              Themes We Unpack Every Week
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              'Workplace Culture',
              'Tech Innovation',
              'Performance Marketing',
              'Enterprise CRM',
              'Corporate Governance',
              'Human Capital',
              'Founder Grit & Pivots',
              'Business Strategy',
              'Transnational Education',
              'IT Export Growth',
              'Capital Structuring',
              'Personal Branding',
            ].map((theme, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-neutral-900/40 border border-white/5 flex items-center gap-3 text-xs font-medium text-neutral-200"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{theme}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership & Host Profiles */}
        <div className="space-y-12 pt-8 border-t border-white/10">
          <div className="max-w-xl space-y-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold block">
              The Leadership
            </span>
            <h2 className="text-3xl font-display font-bold text-white">
              The Minds Behind The Platform
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {leadership.map((member) => (
              <div
                key={member.id}
                className="p-8 rounded-2xl bg-neutral-900/30 border border-white/10 space-y-6 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-emerald-500/40 bg-neutral-800">
                    <img
                      src={member.photo || '/assets/studio.jpg'}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h3 className="text-2xl font-display font-bold text-white">{member.name}</h3>
                    <p className="text-xs font-mono text-emerald-400 mt-1 uppercase tracking-wider">
                      {member.role}
                    </p>
                  </div>

                  <p className="text-sm text-neutral-300 leading-relaxed">{member.bio}</p>
                </div>

                <div className="pt-4 border-t border-white/5 text-xs text-neutral-400">
                  Department: <span className="text-white font-medium">{member.department}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Operations & Production Team */}
          {operations.length > 0 && (
            <div className="pt-8">
              <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold block mb-6">
                Operations &amp; Technical Broadcast Team
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {operations.map((op) => (
                  <div
                    key={op.id}
                    className="p-6 rounded-xl bg-neutral-900/20 border border-white/5 space-y-2"
                  >
                    <h4 className="text-lg font-display font-bold text-white">{op.name}</h4>
                    <p className="text-xs text-emerald-400 font-medium">{op.role}</p>
                    <p className="text-xs text-neutral-400 leading-relaxed pt-1">{op.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Broadcast Setup & Technical Capability */}
        <div className="p-8 md:p-12 rounded-2xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-black border border-white/10 space-y-6">
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <Radio className="w-4 h-4" />
            <span>ON-GROUND MOBILE STUDIO NETWORK</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white max-w-2xl">
            Bringing The Studio Directly to Pakistan&apos;s Flagship Summits.
          </h2>

          <p className="text-sm text-neutral-300 max-w-3xl leading-relaxed">
            From the 28th ITCN Asia in Karachi to the World CIO Summit &amp; Awards, RISE Pakistan deploys mobile podcast setups and on-site recording booths directly onto the convention floor, conducting high-impact dialogues with international delegates, tech founders, and summit leaders.
          </p>

          <div className="pt-4 flex flex-wrap gap-4">
            <button
              onClick={() => onNavigate('/contact')}
              className="px-6 py-3 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Book Expo Studio for Your Summit</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
