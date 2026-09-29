import React from 'react';
import { ArrowLeft, Mic } from 'lucide-react';

export const NotFoundPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
          <Mic className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
            ERROR 404
          </span>
          <h1 className="text-3xl font-display font-bold text-white">Signal Lost</h1>
          <p className="text-xs text-neutral-400 leading-relaxed">
            The broadcast frequency or page you are attempting to tune into does not exist in our production archives.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/')}
          className="px-6 py-3 bg-white text-black font-semibold text-xs rounded-lg hover:bg-neutral-200 transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Studio Broadcast</span>
        </button>
      </div>
    </div>
  );
};
