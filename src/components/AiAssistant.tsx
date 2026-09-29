import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  Bot,
  User,
  Radio,
  PhoneCall,
  Video,
  Clapperboard,
  FileSpreadsheet,
  Headphones,
  TrendingUp,
  Phone,
} from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';
import { CallAgentModal } from './CallAgentModal';
import { AiAssistantMode } from '../types';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  mode?: AiAssistantMode;
}

const MODES: { id: AiAssistantMode; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'CONCIERGE', label: 'Concierge', desc: 'Editorial guide & discovery', icon: Sparkles },
  { id: 'CALL AGENT', label: 'Call Agent', desc: 'Executive booking & intake', icon: PhoneCall },
  { id: 'STUDIO AGENT', label: 'Studio Agent', desc: 'Acoustics & room calibration', icon: Headphones },
  { id: 'AI HOST', label: 'AI Host', desc: 'Simulated dialogue partner', icon: Radio },
  { id: 'CO-PRODUCER', label: 'Co-Producer', desc: 'Rundowns, hooks & chaptering', icon: Clapperboard },
  { id: 'PRODUCTION ASSISTANT', label: 'Prod Assistant', desc: 'Notes & social distribution', icon: FileSpreadsheet },
  { id: 'CONTENT STRATEGIST', label: 'Strategist', desc: 'Audience growth & distribution', icon: TrendingUp },
];

const MODE_WELCOME: Record<AiAssistantMode, string> = {
  CONCIERGE:
    'Welcome to RISE Pakistan. I am your executive concierge. Ask me about our dialogues with leaders, founder Ahmed Kamal, host Javeria Hammad Khan, verified episode archives, or booking details.',
  'CALL AGENT':
    'RISE Call Agent active. I assist executive guests and corporate partners with recording availability, interview scoping, and on-location studio scheduling.',
  'STUDIO AGENT':
    'RISE Studio Agent standby. Ready to run microphone soundchecks, room latency diagnostics, and remote studio session prep.',
  'AI HOST':
    'RISE AI Host online. Ready for interactive mock interviews, strategic counter-perspectives, or exploratory conversations on business and innovation.',
  'CO-PRODUCER':
    'RISE Co-Producer ready. Share an episode topic or guest profile to generate run-of-show outlines, opening hooks, and high-impact dialogue arcs.',
  'PRODUCTION ASSISTANT':
    'RISE Production Assistant active. I can format broadcast transcripts, draft multi-platform social announcements, and outline key takeaway quotes.',
  'CONTENT STRATEGIST':
    'RISE Content Strategist online. I analyze platform metrics, audience retention curves, and omni-channel distribution strategy across YouTube, LinkedIn, and podcasts.',
};

const MODE_QUICK_ACTIONS: Record<AiAssistantMode, string[]> = {
  CONCIERGE: ['Who founded RISE?', 'Episodes on Education', 'How to book a session', 'PR Services overview'],
  'CALL AGENT': ['Schedule executive interview', 'Host availability for Karachi', 'What is the recording protocol?'],
  'STUDIO AGENT': ['Check microphone levels', 'Best setup for remote recording', 'Launch RISE Studio'],
  'AI HOST': ['Simulate an interview with me', 'Ask me a challenging startup question', 'Discuss Pakistani fintech'],
  'CO-PRODUCER': ['Draft 45-min episode rundown', 'Create 3 viral video hooks', 'Suggest chapters for tech dialogue'],
  'PRODUCTION ASSISTANT': ['Draft LinkedIn release post', 'Extract key executive quotes', 'Write YouTube video description'],
  'CONTENT STRATEGIST': ['Recommend YouTube title variations', 'Repurposing strategy for 60-min show', 'How to reach enterprise audiences'],
};

export const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose, onNavigate }) => {
  const [currentMode, setCurrentMode] = useState<AiAssistantMode>('CONCIERGE');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: MODE_WELCOME['CONCIERGE'],
      timestamp: 'Just now',
      mode: 'CONCIERGE',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  // Mode change handler
  const handleModeChange = (newMode: AiAssistantMode) => {
    if (newMode === currentMode) return;
    setCurrentMode(newMode);
    stopAudio();
    setMessages((prev) => [
      ...prev,
      {
        id: `mode-switch-${Date.now()}`,
        role: 'assistant',
        content: MODE_WELCOME[newMode],
        timestamp: 'Just now',
        mode: newMode,
      },
    ]);
  };

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const [micUnsupportedNotice, setMicUnsupportedNotice] = useState(false);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setMicUnsupportedNotice(true);
      setTimeout(() => setMicUnsupportedNotice(false), 4000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopAudio();
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Speech recognition start error:', err);
      }
    }
  };

  const stopAudio = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const playVoiceResponse = async (text: string) => {
    if (audioMuted) return;
    stopAudio();

    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
          currentAudioRef.current = audio;
          setIsSpeaking(true);
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => fallbackSpeech(text);
          audio.play().catch(() => fallbackSpeech(text));
          return;
        }
      }
    } catch {
      // Fallback
    }

    fallbackSpeech(text);
  };

  const fallbackSpeech = (text: string) => {
    if (audioMuted || !window.speechSynthesis) return;
    stopAudio();
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText.slice(0, 300));
    utterance.rate = 1.0;
    utterance.pitch = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isProcessing) return;

    // Check for direct action shortcuts
    if (text.toLowerCase().includes('launch rise studio') || text.toLowerCase().includes('open studio')) {
      onClose();
      onNavigate('/studio');
      return;
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: 'Just now',
      mode: currentMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsProcessing(true);
    stopAudio();

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          userMessage: text.trim(),
          mode: currentMode,
        }),
      });

      const data = await response.json();
      const replyContent =
        data.reply ||
        'I am connected to the RISE Pakistan production network. How else may I assist your broadcast?';

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: 'Just now',
        mode: currentMode,
      };

      setMessages((prev) => [...prev, aiMsg]);
      playVoiceResponse(replyContent);
    } catch (err: any) {
      console.error('AI chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content:
            'I experienced a brief sync delay. Please feel free to re-ask or explore our episodes directly.',
          timestamp: 'Just now',
          mode: currentMode,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[94vw] sm:w-[440px] bg-neutral-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(0,166,81,0.2)] flex flex-col h-[620px] max-h-[85vh] overflow-hidden animate-modal-card font-sans">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-white/10 bg-black/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
              RISE AI
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO
              </span>
            </h3>
            <p className="text-[11px] text-neutral-400">AI-powered assistant for RISE Pakistan</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Audio Mute Toggle */}
          <button
            onClick={() => {
              if (isSpeaking) stopAudio();
              setAudioMuted(!audioMuted);
            }}
            className={`p-1.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer ${
              audioMuted ? 'text-neutral-500' : 'text-emerald-400'
            }`}
            title={audioMuted ? 'Unmute Voice' : 'Mute Voice'}
            aria-label="Toggle Voice Mute"
          >
            {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Launch Real-Time Voice Call */}
          <button
            onClick={() => {
              stopAudio();
              setShowCallModal(true);
            }}
            className="p-1.5 rounded-md hover:bg-emerald-500/20 text-emerald-400 transition-colors cursor-pointer"
            title="Launch Real-Time Call Agent"
            aria-label="Launch Real-Time Call Agent"
          >
            <Phone className="w-4 h-4" />
          </button>

          {/* Close */}
          <button
            onClick={() => {
              stopAudio();
              onClose();
            }}
            className="p-1.5 text-neutral-400 hover:text-white rounded-md hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Assistant"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Clean Mode Selector */}
      <div className="px-3 py-2 bg-neutral-900/60 border-b border-white/10">
        <div className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase mb-1.5 px-1 flex items-center justify-between">
          <span>OPERATIONAL MODE:</span>
          <span className="text-emerald-400 font-semibold">{currentMode}</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = currentMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-left text-[11px] transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/20 text-white border border-emerald-500/40 font-medium'
                    : 'bg-white/[0.03] text-neutral-400 hover:text-neutral-200 hover:bg-white/[0.08] border border-transparent'
                }`}
                title={mode.desc}
              >
                <Icon className={`w-3 h-3 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-neutral-400'}`} />
                <span className="truncate">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Audio Waveform Banner & Call State */}
      {(isSpeaking || isListening || isProcessing || currentMode === 'CALL AGENT') && (
        <div className="px-4 py-2.5 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isProcessing ? 'bg-amber-400 animate-spin' : isSpeaking ? 'bg-emerald-400 animate-pulse' : isListening ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs text-emerald-300 font-mono uppercase tracking-wider font-semibold">
              {isListening
                ? 'STATE: LISTENING (MIC ACTIVE)'
                : isProcessing
                ? 'STATE: THINKING (ANALYZING QUERY)'
                : isSpeaking
                ? 'STATE: SPEAKING (SYNTHESIS)'
                : 'CALL AGENT: STANDBY READY'}
            </span>
          </div>
          <AudioWaveform isPlaying={isSpeaking || isListening || isProcessing} barCount={14} className="h-4" />
          {isSpeaking && (
            <button
              onClick={stopAudio}
              className="text-[10px] uppercase font-mono text-neutral-400 hover:text-white underline cursor-pointer ml-2"
            >
              Stop
            </button>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {currentMode === 'CALL AGENT' && (
          <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl space-y-2.5 text-left mb-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-300 font-mono font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400" />
                <span>LIVE VOICE CALL AGENT</span>
              </span>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30">
                BARGE-IN READY
              </span>
            </div>
            <p className="text-[11px] text-neutral-300 leading-relaxed">
              Speak naturally with RISE AI to schedule podcast appearances, check studio availability, or create private recording rooms.
            </p>
            <button
              onClick={() => {
                stopAudio();
                setShowCallModal(true);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-semibold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(0,166,81,0.3)] transition-all active:scale-[0.98]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>START REAL-TIME VOICE CALL</span>
            </button>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5" />
              </div>
            )}
            <div
              className={`max-w-[84%] px-3.5 py-2.5 rounded-xl leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none shadow-md'
                  : 'bg-neutral-900 border border-white/5 text-neutral-200 rounded-bl-none shadow-sm'
              }`}
            >
              {msg.mode && msg.mode !== 'CONCIERGE' && msg.role === 'assistant' && (
                <div className="text-[9px] font-mono tracking-wider text-emerald-400 uppercase mb-1">
                  [{msg.mode}]
                </div>
              )}
              <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
            </div>
            {msg.role === 'user' && (
              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-300 shrink-0 mt-0.5">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-white/5 text-neutral-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span className="font-mono text-[11px]">Processing {currentMode} query...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries per Mode */}
      <div className="px-4 py-2 border-t border-white/5 bg-black/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {MODE_QUICK_ACTIONS[currentMode].map((q) => (
          <button
            key={q}
            onClick={() => handleSendMessage(q)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-md bg-white/5 hover:bg-emerald-950/40 text-neutral-400 hover:text-emerald-300 border border-white/5 transition-colors cursor-pointer shrink-0"
          >
            {q}
          </button>
        ))}
      </div>

      {micUnsupportedNotice && (
        <div className="px-3 py-1.5 bg-amber-500/10 border-t border-amber-500/20 text-[11px] text-amber-300 font-mono flex items-center justify-between">
          <span>Speech recognition not supported in this environment. Please type below.</span>
          <button type="button" onClick={() => setMicUnsupportedNotice(false)} className="text-amber-400 hover:text-white ml-2 text-xs">✕</button>
        </div>
      )}

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-white/10 bg-neutral-950 flex items-center gap-2"
      >
        <button
          type="button"
          onClick={toggleListening}
          className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
            isListening
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
              : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border-white/10'
          }`}
          title={isListening ? 'Stop Listening' : 'Speak with voice'}
          aria-label="Voice input"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isListening ? 'Listening...' : `Message RISE AI (${currentMode.toLowerCase()})...`}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500/50 transition-colors"
        />

        <button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      <CallAgentModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        onNavigate={onNavigate}
      />
    </div>
  );
};
