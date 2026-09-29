import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  Radio,
  Copy,
  Check,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CornerDownLeft,
} from 'lucide-react';
import { AudioWaveform } from './AudioWaveform';

interface CallAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

type CallStatus =
  | 'CONNECTING'
  | 'IDLE'
  | 'LISTENING'
  | 'THINKING'
  | 'SPEAKING'
  | 'INTERRUPTED'
  | 'TOOL CALL';

interface TranscriptItem {
  id: string;
  speaker: 'user' | 'assistant';
  text: string;
  time: string;
  actionCard?: {
    type: 'booking' | 'studio' | 'contact';
    title: string;
    details: string;
    link?: string;
  };
}

export const CallAgentModal: React.FC<CallAgentModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [callStatus, setCallStatus] = useState<CallStatus>('CONNECTING');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [currentInterimUserText, setCurrentInterimUserText] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const callTimerRef = useRef<any>(null);
  const isSpeakingRef = useRef<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts, currentInterimUserText]);

  // Audio interruption function: IMMEDIATELY stop audio, clear queue
  const interruptAi = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    isSpeakingRef.current = false;
    setCallStatus('INTERRUPTED');
    setTimeout(() => {
      setCallStatus((prev) => (prev === 'INTERRUPTED' ? 'LISTENING' : prev));
    }, 400);
  };

  // Play voice response using persistent configured voice
  const playVoiceResponse = async (text: string) => {
    if (isSpeakerMuted) return;

    interruptAi();
    setCallStatus('SPEAKING');
    isSpeakingRef.current = true;

    try {
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audio && isSpeakingRef.current) {
          const audio = new Audio(`data:audio/mp3;base64,${data.audio}`);
          audioRef.current = audio;

          audio.onended = () => {
            isSpeakingRef.current = false;
            setCallStatus('LISTENING');
          };

          audio.onerror = () => {
            isSpeakingRef.current = false;
            setCallStatus('LISTENING');
          };

          await audio.play();
          return;
        }
      }
    } catch (e) {
      console.warn('Call agent TTS audio play error:', e);
    }

    // Fallback speech synthesis if needed
    if ('speechSynthesis' in window && isSpeakingRef.current && !isSpeakerMuted) {
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.rate = 1.05;
      utterance.pitch = 0.95;
      utterance.onend = () => {
        isSpeakingRef.current = false;
        setCallStatus('LISTENING');
      };
      utterance.onerror = () => {
        isSpeakingRef.current = false;
        setCallStatus('LISTENING');
      };
      window.speechSynthesis.speak(utterance);
    } else {
      isSpeakingRef.current = false;
      setCallStatus('LISTENING');
    }
  };

  // Process user message turn to RISE AI
  const handleUserMessage = async (userText: string) => {
    if (!userText.trim()) return;

    // Barge-in: if AI was speaking, stop immediately
    interruptAi();

    const timestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userEntry: TranscriptItem = {
      id: `usr-${Date.now()}`,
      speaker: 'user',
      text: userText.trim(),
      time: timestamp,
    };

    setTranscripts((prev) => [...prev, userEntry]);
    setCurrentInterimUserText('');
    setCallStatus('THINKING');

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'CALL AGENT',
          userMessage: userText.trim(),
          messages: transcripts.slice(-6).map((t) => ({
            role: t.speaker === 'user' ? 'user' : 'assistant',
            content: t.text,
          })),
        }),
      });

      const data = await res.json();
      let replyText =
        data.reply ||
        'Understood. How else can I assist your broadcast schedule or inquiry?';

      // Check if action cards should be created from reply or session creation
      let actionCard: TranscriptItem['actionCard'] = undefined;
      if (replyText.includes('/studio?invite=') || replyText.includes('/studio?session=')) {
        const match = replyText.match(/\/studio\?[^\s"']+/);
        actionCard = {
          type: 'studio',
          title: 'RISE Studio Private Room Created',
          details: 'Host-first private recording session initialized with lossless stem capture.',
          link: match ? match[0] : '/studio',
        };
      } else if (replyText.toLowerCase().includes('booking') && replyText.toLowerCase().includes('confirmed')) {
        actionCard = {
          type: 'booking',
          title: 'Executive Appearance Request Logged',
          details: 'Scheduled with production desk calendar pending producer review.',
        };
      }

      const aiEntry: TranscriptItem = {
        id: `ai-${Date.now()}`,
        speaker: 'assistant',
        text: replyText,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        actionCard,
      };

      setTranscripts((prev) => [...prev, aiEntry]);
      playVoiceResponse(replyText);
    } catch (err) {
      setCallStatus('LISTENING');
      const errEntry: TranscriptItem = {
        id: `ai-err-${Date.now()}`,
        speaker: 'assistant',
        text: 'I experienced a brief sync delay. Please tell me again what you would like to explore or schedule.',
        time: timestamp,
      };
      setTranscripts((prev) => [...prev, errEntry]);
    }
  };

  // Continuous Speech Recognition with barge-in support
  useEffect(() => {
    if (!isOpen) return;

    // Reset call
    setCallDuration(0);
    setTranscripts([]);
    setCallStatus('CONNECTING');

    const SpeechRec =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    let rec: any = null;

    if (SpeechRec) {
      rec = new SpeechRec();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            final += transcriptChunk;
          } else {
            interim += transcriptChunk;
          }
        }

        // Real-time Barge-in: if user starts speaking while AI is speaking, interrupt immediately!
        if ((interim.trim().length > 1 || final.trim().length > 0) && isSpeakingRef.current) {
          interruptAi();
        }

        if (interim) {
          setCurrentInterimUserText(interim);
          setCallStatus('LISTENING');
        }

        if (final.trim()) {
          handleUserMessage(final.trim());
        }
      };

      rec.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('Speech rec event:', e.error);
        }
      };

      rec.onend = () => {
        // Automatically keep listening if call is still active
        if (isOpen && !isMuted) {
          try {
            rec.start();
          } catch {}
        }
      };

      recognitionRef.current = rec;

      try {
        rec.start();
      } catch (err) {
        console.warn('Could not auto-start speech recognition:', err);
      }
    }

    // Connect sequence
    const connectTimer = setTimeout(() => {
      setCallStatus('SPEAKING');
      const welcome =
        'Hello. I am RISE AI, your executive digital concierge. How can I assist your broadcast schedule or guest inquiry today?';
      setTranscripts([
        {
          id: 'welcome',
          speaker: 'assistant',
          text: welcome,
          time: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ]);
      playVoiceResponse(welcome);
    }, 1200);

    // Call duration timer
    callTimerRef.current = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      clearTimeout(connectTimer);
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (rec) {
        rec.abort();
      }
      interruptAi();
    };
  }, [isOpen]);

  const handleMuteToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      try {
        recognitionRef.current?.start();
      } catch {}
    } else {
      setIsMuted(true);
      recognitionRef.current?.stop();
    }
  };

  const handleSpeakerToggle = () => {
    if (!isSpeakerMuted) {
      interruptAi();
    }
    setIsSpeakerMuted(!isSpeakerMuted);
  };

  const endCall = () => {
    interruptAi();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    onClose();
  };

  const formatCallTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-modal-backdrop">
      <div className="w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-2xl sm:rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.9),0_0_40px_rgba(0,166,81,0.25)] flex flex-col h-[85vh] max-h-[750px] overflow-hidden animate-modal-card">
        {/* Top Header: Session & Status */}
        <div className="px-6 py-4 bg-black/80 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm text-white">RISE AI CALL AGENT</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  LIVE VOICE
                </span>
              </div>
              <div className="text-[11px] font-mono text-neutral-400 flex items-center gap-2">
                <span>{formatCallTime(callDuration)}</span>
                <span>·</span>
                <span className="text-emerald-400">Single Voice Persona (Aoede)</span>
              </div>
            </div>
          </div>

          {/* Status Indicator Pill */}
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                callStatus === 'SPEAKING'
                  ? 'bg-emerald-400 animate-pulse'
                  : callStatus === 'LISTENING'
                  ? 'bg-rose-500 animate-ping'
                  : callStatus === 'THINKING'
                  ? 'bg-amber-400 animate-spin'
                  : callStatus === 'INTERRUPTED'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
            />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
              {callStatus}
            </span>
          </div>
        </div>

        {/* Center Live Waveform Animation */}
        <div className="py-6 px-6 bg-gradient-to-b from-neutral-900/60 to-black/90 border-b border-white/10 flex flex-col items-center justify-center space-y-3">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 block">
              REAL-TIME BROADCAST AGENT
            </span>
            <p className="text-xs text-neutral-400">
              Continuous voice activity detection active. Speak naturally or interrupt at any moment.
            </p>
          </div>

          <div className="w-full max-w-sm flex items-center justify-center py-2">
            <AudioWaveform
              isPlaying={callStatus === 'SPEAKING' || callStatus === 'LISTENING' || callStatus === 'THINKING'}
              barCount={28}
              className="h-8 text-emerald-400"
            />
          </div>

          {callStatus === 'SPEAKING' && (
            <button
              onClick={interruptAi}
              className="text-[11px] font-mono uppercase text-amber-400/90 hover:text-amber-300 underline cursor-pointer transition-colors"
            >
              [Click or Speak to Interrupt]
            </button>
          )}
        </div>

        {/* Live Dual Transcript Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs font-sans">
          {transcripts.map((t) => (
            <div
              key={t.id}
              className={`flex flex-col ${t.speaker === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 px-1 text-[10px] font-mono text-neutral-500">
                <span className="uppercase font-semibold text-neutral-400">
                  {t.speaker === 'user' ? 'YOU' : 'RISE AI'}
                </span>
                <span>{t.time}</span>
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed ${
                  t.speaker === 'user'
                    ? 'bg-emerald-600/90 text-white rounded-tr-none'
                    : 'bg-neutral-900 border border-white/10 text-neutral-200 rounded-tl-none'
                }`}
              >
                <p>{t.text}</p>

                {/* Optional Action Card */}
                {t.actionCard && (
                  <div className="mt-3 p-3 rounded-xl bg-black/60 border border-emerald-500/30 space-y-2 text-left">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono text-[11px]">
                      <Radio className="w-3.5 h-3.5" />
                      <span>{t.actionCard.title}</span>
                    </div>
                    <p className="text-[11px] text-neutral-300">{t.actionCard.details}</p>
                    {t.actionCard.link && (
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          onClick={() => {
                            endCall();
                            onNavigate(t.actionCard!.link!);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-mono uppercase font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                        >
                          <span>Open Studio Session</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(window.location.origin + t.actionCard!.link!);
                            setCopiedLink(true);
                            setTimeout(() => setCopiedLink(false), 2000);
                          }}
                          className="px-2.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-[10px] font-mono flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Current Interim User Voice Transcript */}
          {currentInterimUserText && (
            <div className="flex flex-col items-end animate-in fade-in">
              <span className="text-[10px] font-mono text-neutral-500 mb-1 px-1">YOU (SPEAKING...)</span>
              <div className="max-w-[85%] rounded-2xl rounded-tr-none px-4 py-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 italic">
                {currentInterimUserText}...
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>

        {/* Bottom Call Controls Bar */}
        <div className="px-6 py-4 bg-black/90 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Microphone Mute */}
            <button
              onClick={handleMuteToggle}
              className={`p-3 rounded-full border transition-all cursor-pointer ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-neutral-900 text-white border-white/10 hover:bg-white/10'
              }`}
              title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            >
              {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Speaker Mute */}
            <button
              onClick={handleSpeakerToggle}
              className={`p-3 rounded-full border transition-all cursor-pointer ${
                isSpeakerMuted
                  ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  : 'bg-neutral-900 text-white border-white/10 hover:bg-white/10'
              }`}
              title={isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}
            >
              {isSpeakerMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* End Call Button */}
            <button
              onClick={endCall}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-mono text-xs font-semibold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(225,29,72,0.4)] transition-all active:scale-95"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
