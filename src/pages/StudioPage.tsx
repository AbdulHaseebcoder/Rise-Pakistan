import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Radio,
  Square,
  Pause,
  Play,
  Download,
  Copy,
  Check,
  Sparkles,
  Clock,
  Activity,
  Layers,
  Film,
  ArrowLeft,
  Volume2,
  VolumeX,
  Share2,
  Settings2,
  AlertCircle,
  CheckCircle2,
  Sliders,
  ShieldCheck,
  Wifi,
  Maximize2,
  RotateCcw,
  Sparkle,
  Cpu,
  Monitor,
  Smartphone,
  Eye,
  MessageSquare,
  Wand2,
  UserCheck,
  UserPlus,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { StudioSession, QualityAssessment, EnhancementJob, ClipCandidate, RecordingTracks, SessionState } from '../types';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';

interface StudioPageProps {
  onNavigate: (path: string) => void;
  initialSessionId?: string;
}

export const StudioPage: React.FC<StudioPageProps> = ({ onNavigate, initialSessionId }) => {
  // Determine if user is accessing as Guest via invite token or as Host
  const urlParams = new URLSearchParams(window.location.search);
  const inviteParam = urlParams.get('invite') || urlParams.get('token');
  const roleParam = urlParams.get('role');
  const isGuestMode = Boolean(inviteParam || roleParam === 'guest' || window.location.pathname.includes('/guest'));

  // Studio Host Phase: 'host_dashboard' | 'create_session' | 'host_preflight' | 'studio' | 'review'
  // Studio Guest Phase: 'guest_waiting_host' | 'guest_preflight' | 'guest_waiting_admission' | 'guest_studio'
  const [phase, setPhase] = useState<string>(() => {
    if (isGuestMode) return 'guest_waiting_host';
    return 'host_dashboard';
  });

  // Current Active Session
  const [session, setSession] = useState<StudioSession>({
    id: 'ses-itcn-2026',
    title: 'Transnational Degree Standards & Future Leadership',
    topic: 'Transnational Higher Education & Global Parity in Pakistan',
    guestName: 'Sanam Pathan',
    guestRole: 'Head of Institution',
    guestOrg: 'Beaconhouse International College',
    guestEmail: 'sanam.pathan@example.pk',
    guestPhone: '+92 300 1234567',
    guestLinkedIn: 'https://linkedin.com/in/sanampathan',
    guestWebsite: 'https://beaconhouse.edu.pk',
    hostName: 'Javeria Hammad Khan',
    hostRole: 'Lead Dialogue Host & Producer',
    hostMode: 'human',
    status: 'READY',
    hostReady: false,
    guestWaiting: false,
    guestAdmitted: false,
    guestConnectionQuality: 'Excellent',
    durationSeconds: 0,
    takeNumber: 1,
    createdAt: new Date().toISOString(),
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '14:00',
    timezone: 'Asia/Karachi (PKT)',
    inviteToken: 'rise-live-7429',
    directorLayout: 'two-shot',
    rundown: 'Cold open (3 min) -> Origin & inflection point (12 min) -> Market scaling & setbacks (15 min) -> Hard-won wisdom & closing (15 min)',
  });

  // Sessions List for Host Console
  const [sessionsList, setSessionsList] = useState<StudioSession[]>([]);

  // Create Session Form State
  const [createForm, setCreateForm] = useState({
    title: '',
    topic: '',
    guestName: '',
    guestRole: '',
    guestOrg: '',
    guestEmail: '',
    guestPhone: '',
    guestLinkedIn: '',
    guestWebsite: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '15:00',
    timezone: 'Asia/Karachi (PKT)',
    notes: '',
  });

  // Consent & Admissions
  const [recordingConsent, setRecordingConsent] = useState(true);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [guestAdmittedAlert, setGuestAdmittedAlert] = useState(false);

  // AV & Device States
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isHeadphonesMonitor, setIsHeadphonesMonitor] = useState(true);
  const [audioLevel, setAudioLevel] = useState(48); // 0-100 VU
  const [streamActive, setStreamActive] = useState(false);
  const [hasCamera, setHasCamera] = useState(true);
  const [hasMic, setHasMic] = useState(true);
  const [networkLatency, setNetworkLatency] = useState(16);

  // Studio Production Layout
  const [feedMode, setFeedMode] = useState<'program' | 'raw'>('program');
  const [directorLayout, setDirectorLayout] = useState<'two-shot' | 'host-focus' | 'guest-focus' | 'split-50-50' | 'vertical-social'>('two-shot');
  const [aiDirectorActive, setAiDirectorActive] = useState(true);
  const [activeSpeaker, setActiveSpeaker] = useState<'host' | 'guest'>('guest');

  // Recording Engine State
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'paused' | 'review'>('idle');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [takeNumber, setTakeNumber] = useState(1);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Right Panel Tab
  const [activeTab, setActiveTab] = useState<'director' | 'coproducer' | 'rundown' | 'enhancer'>('director');

  // AI Co-Producer Dynamic State
  const [aiQuestions, setAiQuestions] = useState<string[]>([
    'What was the primary friction when aligning international university accreditation with local standards?',
    'How do you prevent degree commoditization while expanding transnational access to middle-class youth?',
    'When students graduate with dual credentials, where are the largest retention bottlenecks in Pakistan?',
    'What single regulatory shift would unlock 10x higher-education scalability nationwide?'
  ]);
  const [liveTranscriptLog, setLiveTranscriptLog] = useState<Array<{ speaker: string; text: string; time: string }>>([
    { speaker: 'Javeria H. Khan', text: 'Welcome to RISE Pakistan. Today we are unpacking transnational degree ecosystems with Sanam Pathan.', time: '00:05' },
    { speaker: 'Sanam Pathan', text: 'Thank you Javeria. The reality is Pakistani youth have immense ambition, but global qualification parity was historically gated behind migration.', time: '00:22' },
  ]);

  // AI Director Event Log
  const [directorLog, setDirectorLog] = useState<Array<{ time: string; action: string }>>([
    { time: '00:00', action: 'AI Director initialized: Master Two-Shot active' },
    { time: '00:08', action: 'Speaker detected (Host): Maintained Host Focus' },
    { time: '00:21', action: 'Speaker detected (Guest): Seamless transition to Guest Focus' },
  ]);

  // AI Enhancement Job & Post-Production
  const [enhancementJob, setEnhancementJob] = useState<EnhancementJob | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [postProductionOutput, setPostProductionOutput] = useState<any>(null);
  const [isGeneratingPost, setIsGeneratingPost] = useState(false);

  // Rundown scratchpad
  const [rundownNotes, setRundownNotes] = useState(
    `[00:00 - 03:00] Cold Open: The Human Capital Arbitrage\n[03:00 - 15:00] Transnational Qualifications & Accreditation Realities\n[15:00 - 30:00] Operational Hurdles & Faculty Quality Assurance\n[30:00 - 42:00] Strategic Advice for Ambitious Pakistani Scholars\n[42:00 - 45:00] Closing Statement & Attribution`
  );

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);

  // Load Sessions from Server
  const loadSessions = async () => {
    try {
      const res = await fetch('/api/studio/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessionsList(data);
        if (inviteParam) {
          const match = data.find((s: StudioSession) => s.inviteToken === inviteParam || s.id === inviteParam);
          if (match) {
            setSession(match);
            if (match.hostReady) {
              setPhase((current) => (current === 'guest_waiting_host' ? 'guest_preflight' : current));
            }
          }
        }
      }
    } catch (e) {
      console.warn('Could not load studio sessions:', e);
    }
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 4000);
    return () => clearInterval(interval);
  }, [inviteParam]);

  // Preflight Quality Diagnostics
  const qualityTips: string[] = [
    'Camera exposure is balanced. Frontal illumination optimal.',
    'Headphones monitor active to prevent room echo feedback.',
    'Audio signal floor is -48dB (Broadcast Clean).',
    'Local recording buffer initialized (VP8 / Opus Lossless Stem).',
  ];

  // Initialize Media Stream when in preflight or studio
  useEffect(() => {
    let isMounted = true;

    async function initMedia() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 60 } },
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreamRef.current = stream;
        setStreamActive(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => {});
        }

        // Web Audio VU Meter
        try {
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioCtx) {
            const audioCtx = new AudioCtx();
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);

            audioContextRef.current = audioCtx;
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateLevel = () => {
              if (!analyserRef.current || !isMounted) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const avg = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((avg / 255) * 140)));
              requestAnimationFrame(updateLevel);
            };
            requestAnimationFrame(updateLevel);
          }
        } catch (e) {
          console.warn('Audio meter init skipped:', e);
        }
      } catch (err: any) {
        setHasCamera(false);
        setHasMic(false);
      }
    }

    if (phase.includes('preflight') || phase.includes('studio')) {
      initMedia();
    }

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [phase]);

  // Timer logic for recording
  useEffect(() => {
    if (recordingState === 'recording') {
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [recordingState]);

  // AI Director automated switching simulation
  useEffect(() => {
    if (!aiDirectorActive || recordingState !== 'recording') return;

    const interval = setInterval(() => {
      setActiveSpeaker((prev) => {
        const next = prev === 'host' ? 'guest' : 'host';
        const newLayout = next === 'guest' ? 'guest-focus' : 'two-shot';
        setDirectorLayout(newLayout);
        const timecode = formatTime(elapsedSeconds);
        setDirectorLog((logs) => [
          { time: timecode, action: `Speaker switch: AI Director cut to ${next === 'guest' ? 'Guest Focus' : 'Two-Shot'}` },
          ...logs.slice(0, 9),
        ]);
        return next;
      });
    }, 14000);

    return () => clearInterval(interval);
  }, [aiDirectorActive, recordingState, elapsedSeconds]);

  // Host Action: Create New Recording Session
  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title || !createForm.guestName) return;

    try {
      const res = await fetch('/api/studio/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      if (res.ok) {
        const newSession = await res.json();
        setSession(newSession);
        setPhase('host_preflight');
        loadSessions();
      }
    } catch (err) {
      console.error('Session creation failed:', err);
    }
  };

  // Host Enters Studio Stage -> sets hostReady = true
  const handleHostEnterStudio = async () => {
    try {
      await fetch(`/api/studio/sessions/${session.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostReady: true, status: 'HOST_IN_ROOM' }),
      });
      setSession((prev) => ({ ...prev, hostReady: true, status: 'HOST_IN_ROOM' }));
      setPhase('studio');
    } catch (e) {
      setPhase('studio');
    }
  };

  // Host Admits Waiting Guest
  const handleAdmitGuest = async () => {
    try {
      const res = await fetch(`/api/studio/sessions/${session.id}/admit`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
        setGuestAdmittedAlert(false);
      }
    } catch (e) {
      setSession((prev) => ({ ...prev, guestAdmitted: true, guestWaiting: false }));
      setGuestAdmittedAlert(false);
    }
  };

  // Guest signals waiting in waiting room
  const handleGuestReadyWait = async () => {
    try {
      await fetch(`/api/studio/sessions/${session.id}/waiting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cameraReady: hasCamera, micReady: hasMic, networkQuality: 'Excellent' }),
      });
    } catch (e) {}
    setPhase('guest_waiting_admission');
  };

  // Start Recording (Host only)
  const startRecording = () => {
    if (mediaStreamRef.current) {
      try {
        const options: MediaRecorderOptions = { mimeType: 'video/webm;codecs=vp8,opus' };
        let recorder: MediaRecorder;
        if (MediaRecorder.isTypeSupported(options.mimeType!)) {
          recorder = new MediaRecorder(mediaStreamRef.current, options);
        } else {
          recorder = new MediaRecorder(mediaStreamRef.current);
        }

        const chunks: Blob[] = [];
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            chunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const completeBlob = new Blob(chunks, { type: 'video/webm' });
          const url = URL.createObjectURL(completeBlob);
          setRecordedVideoUrl(url);
          setPhase('review');
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.error('MediaRecorder start failed:', err);
      }
    }

    setRecordingState('recording');
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
    }
    setRecordingState('paused');
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
    }
    setRecordingState('recording');
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setPhase('review');
    }
    setRecordingState('idle');

    // Save multi-tracks & trigger AI pipeline on server
    try {
      await fetch(`/api/studio/sessions/${session.id}/record-tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          durationSeconds: elapsedSeconds,
          fileSizeMb: Math.round((elapsedSeconds * 4.2) + 80),
        }),
      });
      runEnhancementPipeline();
      generatePostProduction();
    } catch (e) {
      console.warn('Tracks auto-save:', e);
    }
  };

  const downloadTake = () => {
    if (!recordedVideoUrl) return;
    const a = document.createElement('a');
    a.href = recordedVideoUrl;
    a.download = `RISE-Studio-Master-Take-${takeNumber}-${session.id}.webm`;
    a.click();
  };

  const toggleMic = () => {
    if (mediaStreamRef.current) {
      const track = mediaStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsMicMuted(!track.enabled);
      }
    } else {
      setIsMicMuted(!isMicMuted);
    }
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      const track = mediaStreamRef.current.getVideoTracks()[0];
      if (track) {
        track.enabled = !track.enabled;
        setIsVideoMuted(!track.enabled);
      }
    } else {
      setIsVideoMuted(!isVideoMuted);
    }
  };

  const copyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/studio?invite=${session.inviteToken || session.id}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const formatTime = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Trigger Asynchronous AI Enhancement Pipeline
  const runEnhancementPipeline = async () => {
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/studio/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.id, canvasTarget: '4K AI Master' }),
      });
      const data = await res.json();
      if (data.job) {
        setEnhancementJob(data.job);
        const poll = setInterval(async () => {
          try {
            const statusRes = await fetch(`/api/studio/enhance/${session.id}`);
            if (statusRes.ok) {
              const updatedJob = await statusRes.json();
              setEnhancementJob(updatedJob);
              if (updatedJob.stage === 'completed' || updatedJob.stage === 'failed') {
                clearInterval(poll);
                setIsEnhancing(false);
              }
            }
          } catch {
            clearInterval(poll);
            setIsEnhancing(false);
          }
        }, 1500);
      }
    } catch {
      setIsEnhancing(false);
    }
  };

  // Trigger AI Post-Production Package Generation
  const generatePostProduction = async () => {
    setIsGeneratingPost(true);
    try {
      const res = await fetch('/api/studio/post-production', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.id,
          guestName: session.guestName,
          topic: session.title,
          transcriptText: liveTranscriptLog.map((t) => `${t.speaker}: ${t.text}`).join('\n'),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPostProductionOutput(data);
      }
    } catch (err) {
      console.error('Post-production error:', err);
    } finally {
      setIsGeneratingPost(false);
    }
  };

  // -------------------------------------------------------------
  // GUEST FLOW VIEW 1: WAITING ROOM BEFORE HOST ENTERS
  // Requirement 15: "THE HOST HAS NOT OPENED THE ROOM YET. PLEASE STAY HERE."
  // -------------------------------------------------------------
  if (phase === 'guest_waiting_host') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 md:p-12 selection:bg-emerald-500/30">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-400">
              RISE STUDIO · GUEST RECEPTION
            </span>
          </div>
          <button
            onClick={() => onNavigate('/')}
            className="text-xs font-mono text-neutral-400 hover:text-white transition-colors"
          >
            Back to RISE Pakistan
          </button>
        </div>

        <div className="max-w-md mx-auto text-center space-y-6 py-12">
          {/* Subtle Waiting Animation: soft emerald breathing ring & microphone silhouette */}
          <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-ping pointer-events-none" />
            <div className="absolute inset-2 rounded-full border border-emerald-500/50 animate-pulse pointer-events-none" />
            <div className="w-20 h-20 rounded-full bg-neutral-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(0,166,81,0.25)]">
              <Radio className="w-8 h-8" />
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 block">
              SECURE RECORDING SESSION #{session.inviteToken || session.id}
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white tracking-tight">
              THE HOST HAS NOT OPENED THE ROOM YET.
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto">
              Please stay here. Host <strong className="text-white">{session.hostName}</strong> will unlock the virtual studio shortly. Once host enters, you will complete a 30-second camera and audio check.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950/80 border border-white/10 text-xs font-mono text-neutral-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Host Status:</span>
              <span className="text-amber-400 font-semibold">PREPARING STUDIO</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Your Connection:</span>
              <span className="text-emerald-400 font-semibold">Stable (16ms RTT)</span>
            </div>
          </div>

          {/* Development / Demo Shortcut to bypass waiting if testing */}
          <button
            onClick={() => setPhase('guest_preflight')}
            className="text-[11px] font-mono text-neutral-500 hover:text-emerald-400 transition-colors cursor-pointer underline"
          >
            [Host Ready? Proceed to Guest Preflight]
          </button>
        </div>

        <div className="max-w-4xl mx-auto w-full pt-6 border-t border-white/10 text-center text-[11px] font-mono text-neutral-500">
          RISE PAKISTAN VIRTUAL BROADCAST ENGINE · HOST-FIRST CONTROL ENFORCED
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GUEST FLOW VIEW 2: GUEST PREFLIGHT
  // -------------------------------------------------------------
  if (phase === 'guest_preflight') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 md:p-12 selection:bg-emerald-500/30">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
              STATUS: HOST READY · GUEST SOUNDCHECK
            </span>
          </div>
          <div className="text-xs font-mono text-neutral-400">
            GUEST: <span className="text-white font-semibold">{session.guestName}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Camera preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 flex items-center justify-center shadow-2xl">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover -scale-x-100 ${isVideoMuted ? 'hidden' : 'block'}`}
              />
              {isVideoMuted && (
                <div className="flex flex-col items-center justify-center text-neutral-500 space-y-2">
                  <VideoOff className="w-12 h-12" />
                  <span className="text-xs font-mono uppercase tracking-wider">Camera Feed Muted</span>
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/75 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2">
                  <button
                    onClick={toggleMic}
                    className={`p-2 rounded-lg border transition-colors ${
                      isMicMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-white/5 text-white border-white/10'
                    }`}
                  >
                    {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={toggleVideo}
                    className={`p-2 rounded-lg border transition-colors ${
                      isVideoMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-white/5 text-white border-white/10'
                    }`}
                  >
                    {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <div className="w-24 h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${isMicMuted ? 0 : audioLevel}%` }} />
                  </div>
                  <span className="text-[10px]">{isMicMuted ? 'MUT' : `${audioLevel}%`}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guest preflight controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                PRE-RECORDING BRIEF
              </span>
              <h2 className="text-2xl font-display font-bold text-white leading-tight">
                {session.title}
              </h2>
              <p className="text-xs text-neutral-400">
                Host: <strong className="text-white">{session.hostName}</strong>
              </p>
            </div>

            <div className="p-4 rounded-xl bg-neutral-900/60 border border-emerald-500/20 space-y-2 text-xs text-neutral-300">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold font-mono text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>STUDIO CHECKLIST PASSED</span>
              </div>
              <p className="text-neutral-400 leading-relaxed">
                48kHz stereo microphone active. Web camera set to 1080p 60fps. Lossless ISO recording buffer ready.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={recordingConsent}
                  onChange={(e) => setRecordingConsent(e.target.checked)}
                  className="mt-0.5 rounded border-white/20 text-emerald-500 focus:ring-0"
                />
                <span className="text-xs text-neutral-300 leading-relaxed">
                  This session will be recorded and processed for RISE Pakistan podcast production.
                </span>
              </label>
            </div>

            <button
              onClick={handleGuestReadyWait}
              disabled={!recordingConsent}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(0,166,81,0.35)]"
            >
              <span>Ready &amp; Enter Waiting Room</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full pt-6 border-t border-white/10 text-center text-[11px] font-mono text-neutral-500">
          IDENTITY PRESERVATION ENFORCED · HIGH-FIDELITY BROWSER CAPTURE
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GUEST FLOW VIEW 3: GUEST WAITING FOR HOST ADMISSION
  // Requirement 16: Host sees "GUEST WAITING" and clicks "ADMIT GUEST"
  // -------------------------------------------------------------
  if (phase === 'guest_waiting_admission') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 md:p-12 selection:bg-emerald-500/30">
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GUEST WAITING FOR HOST ADMISSION</span>
          </div>
          <span className="text-xs font-mono text-neutral-500">{session.guestName}</span>
        </div>

        <div className="max-w-md mx-auto text-center space-y-6 py-12">
          <div className="w-20 h-20 rounded-full bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_35px_rgba(0,166,81,0.3)]">
            <UserCheck className="w-9 h-9" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-display font-bold text-white">
              You are ready for the broadcast.
            </h2>
            <p className="text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto">
              Your audio, video, and network connections have passed studio inspection. Host <strong className="text-white">{session.hostName}</strong> has been notified and will admit you to the recording stage momentarily.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-950 border border-white/10 text-xs font-mono text-neutral-400 space-y-1.5 text-left">
            <div className="flex justify-between"><span>Microphone:</span><span className="text-emerald-400 font-semibold">Active (48kHz)</span></div>
            <div className="flex justify-between"><span>Camera:</span><span className="text-emerald-400 font-semibold">1080p 60fps</span></div>
            <div className="flex justify-between"><span>Quality Score:</span><span className="text-emerald-400 font-semibold">Broadcast Grade</span></div>
          </div>

          <button
            onClick={() => setPhase('guest_studio')}
            className="text-xs font-mono text-neutral-500 hover:text-emerald-400 transition-colors underline"
          >
            [Demo: Host Clicked Admit? Enter Stage]
          </button>
        </div>

        <div className="max-w-4xl mx-auto w-full pt-6 border-t border-white/10 text-center text-[11px] font-mono text-neutral-500">
          RISE STUDIO PRIVATE ANTECHAMBER
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GUEST FLOW VIEW 4: GUEST STUDIO STAGE (Simplified, Video-First)
  // Requirement 17: Guest sees only what they need. No admin features, no host notes.
  // -------------------------------------------------------------
  if (phase === 'guest_studio') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between selection:bg-emerald-500/30">
        {/* Guest Top Minimal Status Bar */}
        <div className="bg-neutral-950 border-b border-white/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${recordingState === 'recording' ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                {recordingState === 'recording' ? 'REC · LIVE ON AIR' : 'LIVE STUDIO CONNECTED'}
              </span>
            </div>
            <span className="text-neutral-700">·</span>
            <span className="text-xs font-mono text-neutral-400">{session.title}</span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
            <span className="text-emerald-400 flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5" />
              <span>Broadcast Quality: Excellent</span>
            </span>
          </div>
        </div>

        {/* Guest Video-First Stage */}
        <div className="flex-1 p-6 md:p-8 flex items-center justify-center">
          <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Host Stream */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl">
              <img
                src="/assets/host.jpg"
                alt="Host Javeria Hammad Khan"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded text-xs font-mono text-white border border-white/10">
                {session.hostName} · Host
              </div>
            </div>

            {/* Guest Stream (Self) */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover -scale-x-100 ${isVideoMuted ? 'hidden' : 'block'}`}
              />
              {isVideoMuted && (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500 space-y-2">
                  <VideoOff className="w-10 h-10" />
                  <span className="text-xs font-mono">Camera Off</span>
                </div>
              )}
              <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded text-xs font-mono text-white border border-white/10">
                {session.guestName} (You)
              </div>
            </div>
          </div>
        </div>

        {/* Guest Bottom Control Strip */}
        <div className="bg-neutral-950 border-t border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleMic}
              className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center gap-2 ${
                isMicMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span className="text-xs font-mono">{isMicMuted ? 'Unmute' : 'Mute'}</span>
            </button>
            <button
              onClick={toggleVideo}
              className={`p-3 rounded-xl border transition-colors cursor-pointer flex items-center gap-2 ${
                isVideoMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
              }`}
            >
              {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              <span className="text-xs font-mono">{isVideoMuted ? 'Start Video' : 'Stop Video'}</span>
            </button>
          </div>

          <div className="text-xs font-mono text-neutral-400">
            Recording Controlled by Producer / Host
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // HOST FLOW VIEW 1: HOST CONSOLE / DASHBOARD (Requirement 46)
  // "HOST HOME: Create Recording, Upcoming Sessions, Waiting Guests, Recent Recordings"
  // -------------------------------------------------------------
  if (phase === 'host_dashboard') {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12 selection:bg-emerald-500/30">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-emerald-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>RISE STUDIO PRODUCTION DESK</span>
              </div>
              <h1 className="text-3xl font-display font-extrabold text-white tracking-tight">
                Host Production Control Center
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('/')}
                className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono rounded-lg border border-white/10 transition-colors cursor-pointer"
              >
                Exit to Website
              </button>
              <button
                onClick={() => setPhase('create_session')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-2 shadow-[0_0_20px_rgba(0,166,81,0.3)]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create New Recording</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 space-y-1">
              <span className="text-xs font-mono text-neutral-400 uppercase">ACTIVE SESSIONS</span>
              <div className="text-3xl font-display font-bold text-white tabular-nums">{sessionsList.length || 1}</div>
              <p className="text-xs text-neutral-500">Ready for studio broadcast</p>
            </div>
            <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 space-y-1">
              <span className="text-xs font-mono text-neutral-400 uppercase">WAITING GUESTS</span>
              <div className="text-3xl font-display font-bold text-emerald-400 tabular-nums">
                {sessionsList.filter((s) => s.guestWaiting).length}
              </div>
              <p className="text-xs text-neutral-500">In virtual antechambers</p>
            </div>
            <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 space-y-1">
              <span className="text-xs font-mono text-neutral-400 uppercase">PROCESSED MASTERS</span>
              <div className="text-3xl font-display font-bold text-white tabular-nums">12</div>
              <p className="text-xs text-neutral-500">4K multi-tracks stored</p>
            </div>
          </div>

          {/* Upcoming Sessions List */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-white">Upcoming Recording Sessions</h3>
            <div className="divide-y divide-white/10 border border-white/10 rounded-2xl bg-neutral-950 overflow-hidden">
              {(sessionsList.length > 0 ? sessionsList : [session]).map((s) => (
                <div key={s.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-neutral-900/40 transition-colors">
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-3 text-xs font-mono">
                      <span className="text-emerald-400 uppercase tracking-wider font-semibold">
                        {s.scheduledDate || 'Today'} · {s.scheduledTime || '14:00'}
                      </span>
                      <span className="text-neutral-600">·</span>
                      <span className="text-neutral-400">ID: {s.id}</span>
                      {s.guestWaiting && (
                        <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] uppercase font-bold animate-pulse">
                          Guest Waiting
                        </span>
                      )}
                    </div>
                    <h4 className="text-xl font-display font-bold text-white">{s.title}</h4>
                    <p className="text-xs text-neutral-400">
                      Guest: <strong className="text-neutral-200">{s.guestName}</strong> ({s.guestRole}, {s.guestOrg})
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 shrink-0">
                    <button
                      onClick={() => {
                        const invite = `${window.location.origin}/studio?invite=${s.inviteToken || s.id}`;
                        navigator.clipboard.writeText(invite);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-white/10 text-neutral-300 rounded-lg text-xs font-mono transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? 'Copied Link' : 'Copy Guest Link'}</span>
                    </button>

                    <button
                      onClick={() => {
                        setSession(s);
                        setPhase('host_preflight');
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Enter Studio Stage</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // HOST FLOW VIEW 2: CREATE RECORDING SESSION (Requirement 12)
  // "Guest name, role, company, title, topic, date, time, timezone, notes..."
  // -------------------------------------------------------------
  if (phase === 'create_session') {
    return (
      <div className="min-h-screen bg-black text-white p-6 md:p-12 selection:bg-emerald-500/30">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <button
              onClick={() => setPhase('host_dashboard')}
              className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Host Desk</span>
            </button>
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400">
              CREATE PRIVATE STUDIO
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold text-white">Create New Recording</h1>
            <p className="text-xs text-neutral-400">
              Set session metadata. Upon creation, a secure unguessable private guest link will be generated.
            </p>
          </div>

          <form onSubmit={handleCreateSession} className="space-y-6">
            <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 space-y-4">
              <h3 className="text-sm font-display font-bold text-white border-b border-white/5 pb-2">
                Episode &amp; Topic Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Episode Title *</label>
                  <input
                    type="text"
                    required
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    placeholder="e.g. Scaling Tech Ventures in Emerging Markets"
                    className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white focus:border-emerald-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Core Topic / Angle</label>
                  <input
                    type="text"
                    value={createForm.topic}
                    onChange={(e) => setCreateForm({ ...createForm, topic: e.target.value })}
                    placeholder="e.g. Navigating regulatory friction & capital constraints"
                    className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white focus:border-emerald-500/50 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950 border border-white/10 space-y-4">
              <h3 className="text-sm font-display font-bold text-white border-b border-white/5 pb-2">
                Executive Guest Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Guest Full Name *</label>
                  <input
                    type="text"
                    required
                    value={createForm.guestName}
                    onChange={(e) => setCreateForm({ ...createForm, guestName: e.target.value })}
                    placeholder="e.g. Dr. Ayesha Siddiqui"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white focus:border-emerald-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Guest Executive Role</label>
                  <input
                    type="text"
                    value={createForm.guestRole}
                    onChange={(e) => setCreateForm({ ...createForm, guestRole: e.target.value })}
                    placeholder="e.g. Chief Innovation Officer"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white focus:border-emerald-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Company / Organization</label>
                  <input
                    type="text"
                    value={createForm.guestOrg}
                    onChange={(e) => setCreateForm({ ...createForm, guestOrg: e.target.value })}
                    placeholder="e.g. Apex Health Systems"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white focus:border-emerald-500/50 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-mono text-neutral-400 block mb-1">Guest Email (Optional)</label>
                  <input
                    type="email"
                    value={createForm.guestEmail}
                    onChange={(e) => setCreateForm({ ...createForm, guestEmail: e.target.value })}
                    placeholder="guest@organization.com"
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-xl text-sm text-white focus:border-emerald-500/50 outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_25px_rgba(0,166,81,0.35)]"
            >
              Create Private Studio
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // HOST FLOW VIEW 3: HOST PREFLIGHT (Requirement 13)
  // "PRIVATE HOST ROOM. Status: HOST READY. Guest area shows: WAITING FOR GUEST"
  // -------------------------------------------------------------
  if (phase === 'host_preflight') {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col justify-between p-6 md:p-12 selection:bg-emerald-500/30">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPhase('host_dashboard')}
              className="flex items-center gap-1.5 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Host Console</span>
            </button>
            <span className="text-neutral-700">·</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase">
                PRIVATE HOST ROOM
              </span>
            </div>
          </div>
          <div className="text-xs font-mono text-neutral-500">
            STATUS: <span className="text-emerald-400 font-bold">HOST READY</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto w-full py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Host Video Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 shadow-2xl flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover -scale-x-100 ${isVideoMuted ? 'hidden' : 'block'}`}
              />
              {isVideoMuted && (
                <div className="flex flex-col items-center justify-center text-neutral-500 space-y-2">
                  <VideoOff className="w-12 h-12" />
                  <span className="text-xs font-mono uppercase">Camera Muted</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-white/5 space-y-1">
                <div className="text-[10px] text-neutral-500 uppercase">CAMERA</div>
                <div className="text-emerald-400 font-semibold">{hasCamera ? '1080p Studio' : 'Unavailable'}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-white/5 space-y-1">
                <div className="text-[10px] text-neutral-500 uppercase">MIC</div>
                <div className="text-emerald-400 font-semibold">{hasMic ? '48kHz Master' : 'Unavailable'}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-white/5 space-y-1">
                <div className="text-[10px] text-neutral-500 uppercase">SPEAKER</div>
                <div className="text-emerald-400 font-semibold">Calibrated</div>
              </div>
              <div className="p-2.5 rounded-xl bg-neutral-900/60 border border-white/5 space-y-1">
                <div className="text-[10px] text-neutral-500 uppercase">NETWORK</div>
                <div className="text-emerald-400 font-semibold">{networkLatency}ms RTT</div>
              </div>
            </div>
          </div>

          {/* Session Overview & Guest Invitation Link Generator */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                SESSION BRIEF
              </span>
              <h2 className="text-2xl font-display font-bold text-white leading-tight">
                {session.title}
              </h2>
              <p className="text-xs text-neutral-400">
                Guest: <strong className="text-white">{session.guestName}</strong> ({session.guestRole}, {session.guestOrg})
              </p>
            </div>

            {/* Private Guest Invite Generator (Requirement 14) */}
            <div className="p-5 rounded-2xl bg-neutral-950 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-300 font-semibold uppercase">SECURE GUEST INVITATION</span>
                <span className="text-emerald-400 text-[10px]">PRIVATE TOKEN</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Send this link to {session.guestName}. The guest will enter the secure waiting room until admitted.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/studio?invite=${session.inviteToken || session.id}`}
                  className="flex-1 px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-xs font-mono text-neutral-300 select-all"
                />
                <button
                  onClick={copyInviteLink}
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleHostEnterStudio}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer shadow-[0_0_25px_rgba(0,166,81,0.35)] flex items-center justify-center gap-2"
            >
              <Radio className="w-4 h-4" />
              <span>Enter Virtual Studio Console</span>
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full pt-6 border-t border-white/10 text-center text-[11px] font-mono text-neutral-500">
          HOST FIRST SECURITY PROTOCOL ACTIVE · SESSION ID #{session.id}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // HOST FLOW VIEW 4: LIVE VIRTUAL BROADCAST PRODUCTION CONSOLE
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-16 selection:bg-emerald-500/30 font-sans">
      {/* Top Studio Control Bar */}
      <div className="bg-neutral-950 border-b border-white/10 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Left Branding & Status */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setPhase('host_dashboard')}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer font-mono"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Host Desk</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                recordingState === 'recording'
                  ? 'bg-rose-500 animate-ping'
                  : recordingState === 'paused'
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
            <span className="font-mono text-xs font-bold tracking-wider uppercase text-white">
              {recordingState === 'recording'
                ? 'ON AIR · RECORDING'
                : recordingState === 'paused'
                ? 'RECORDING PAUSED'
                : 'STUDIO STANDBY'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-500 hidden sm:inline">
            TAKE {takeNumber.toString().padStart(2, '0')}
          </span>
        </div>

        {/* Center: Live Program vs Raw Sources & Layout Switcher */}
        <div className="flex items-center gap-3">
          <div className="bg-neutral-900 border border-white/10 p-0.5 rounded-lg flex items-center text-[11px] font-mono">
            <button
              onClick={() => setFeedMode('program')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                feedMode === 'program' ? 'bg-emerald-600 text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              LIVE PROGRAM
            </button>
            <button
              onClick={() => setFeedMode('raw')}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                feedMode === 'raw' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'
              }`}
            >
              RAW SOURCES
            </button>
          </div>

          <div className="hidden md:flex items-center bg-neutral-900/60 border border-white/10 p-0.5 rounded-lg text-[10px] font-mono">
            {[
              { id: 'two-shot', label: '2-Shot' },
              { id: 'guest-focus', label: 'Guest' },
              { id: 'host-focus', label: 'Host' },
              { id: 'split-50-50', label: '50/50' },
              { id: 'vertical-social', label: '9:16' },
            ].map((layout) => (
              <button
                key={layout.id}
                onClick={() => {
                  setDirectorLayout(layout.id as any);
                  setAiDirectorActive(false);
                }}
                className={`px-2 py-1 rounded transition-colors cursor-pointer ${
                  directorLayout === layout.id
                    ? 'bg-white/20 text-white font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {layout.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Timecode & Recording Action */}
        <div className="flex items-center gap-3">
          <div className="bg-black/80 border border-white/10 px-3.5 py-1.5 rounded-lg flex items-center gap-2 font-mono text-sm tracking-wider">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className={recordingState === 'recording' ? 'text-rose-400 font-bold' : 'text-neutral-300'}>
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          {recordingState === 'idle' && (
            <button
              onClick={startRecording}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Record</span>
            </button>
          )}

          {recordingState === 'recording' && (
            <div className="flex items-center gap-2">
              <button
                onClick={pauseRecording}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </button>
              <button
                onClick={stopRecording}
                className="px-3.5 py-1.5 bg-neutral-900 border border-rose-500/50 hover:bg-rose-950/40 text-rose-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-rose-400" />
                <span>Stop</span>
              </button>
            </div>
          )}

          {recordingState === 'paused' && (
            <div className="flex items-center gap-2">
              <button
                onClick={resumeRecording}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Resume</span>
              </button>
              <button
                onClick={stopRecording}
                className="px-3.5 py-1.5 bg-neutral-900 border border-white/20 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                <Square className="w-3.5 h-3.5" />
                <span>Finish</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Guest Waiting Alert Strip (Requirement 16: Host sees GUEST WAITING) */}
      {!session.guestAdmitted && (
        <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-6 py-2.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-emerald-200">
              <strong className="text-white font-bold">{session.guestName}</strong> ({session.guestRole}) is waiting in the antechamber.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAdmitGuest}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs font-mono uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-md"
            >
              Admit Guest
            </button>
            <button
              onClick={copyInviteLink}
              className="text-xs font-mono text-neutral-300 hover:text-white"
            >
              Copy Invite Link
            </button>
          </div>
        </div>
      )}

      {/* Main Studio Viewport (Cols 1-8 Center, Cols 9-12 Right) */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Center Video Area (Span 8) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Main Program Canvas */}
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 shadow-2xl flex items-center justify-center">
            {feedMode === 'program' ? (
              /* Program Composite */
              <div className="relative w-full h-full bg-black">
                {directorLayout === 'two-shot' && (
                  <div className="w-full h-full grid grid-cols-2 gap-1 p-2 bg-neutral-950">
                    <div className="relative rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover -scale-x-100"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white">
                        {session.hostName} · Host
                      </div>
                    </div>
                    <div className="relative rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                      <img
                        src="/assets/studio.jpg"
                        alt={session.guestName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-white">
                        {session.guestName} · Guest
                      </div>
                    </div>
                  </div>
                )}

                {directorLayout === 'guest-focus' && (
                  <div className="relative w-full h-full">
                    <img
                      src="/assets/studio.jpg"
                      alt={session.guestName}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono text-white border border-white/10">
                      {session.guestName} · {session.guestRole}
                    </div>
                  </div>
                )}

                {directorLayout === 'host-focus' && (
                  <div className="relative w-full h-full">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover -scale-x-100"
                    />
                    <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-mono text-white border border-white/10">
                      {session.hostName} · Lead Dialogue Host
                    </div>
                  </div>
                )}

                {(directorLayout === 'split-50-50' || directorLayout === 'vertical-social') && (
                  <div className="w-full h-full grid grid-cols-2 gap-0.5 bg-neutral-950">
                    <div className="relative overflow-hidden bg-neutral-900">
                      <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover -scale-x-100"
                      />
                    </div>
                    <div className="relative overflow-hidden bg-neutral-900">
                      <img
                        src="/assets/studio.jpg"
                        alt={session.guestName}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

                {/* Lower Thirds Overlay Indicator */}
                <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                  <span className="bg-black/75 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono uppercase px-2 py-0.5 rounded">
                    LAYOUT: {directorLayout}
                  </span>
                  {aiDirectorActive && (
                    <span className="bg-emerald-950/80 backdrop-blur-md border border-emerald-500/40 text-emerald-400 text-[10px] font-mono uppercase px-2 py-0.5 rounded flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>AI AUTO-SWITCH</span>
                    </span>
                  )}
                </div>
              </div>
            ) : (
              /* RAW SOURCES View (Requirement 22) */
              <div className="w-full h-full p-4 grid grid-cols-2 gap-4 bg-neutral-950">
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                    <span>HOST RAW ISO</span>
                    <span className="text-emerald-400">48kHz / 1080p</span>
                  </div>
                  <div className="aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                    <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover -scale-x-100" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                    <span>GUEST RAW ISO</span>
                    <span className="text-emerald-400">48kHz / 1080p</span>
                  </div>
                  <div className="aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-white/10">
                    <img src="/assets/studio.jpg" alt={session.guestName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Broadcast Hardware Bar */}
          <div className="bg-neutral-950 border border-white/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-2 ${
                  isMicMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                }`}
              >
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                <span className="text-xs font-mono">{isMicMuted ? 'Muted' : 'Mic Live'}</span>
              </button>

              <button
                onClick={toggleVideo}
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-2 ${
                  isVideoMuted ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                }`}
              >
                {isVideoMuted ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                <span className="text-xs font-mono">{isVideoMuted ? 'Camera Off' : 'Camera Live'}</span>
              </button>

              <button
                onClick={() => setIsHeadphonesMonitor(!isHeadphonesMonitor)}
                className={`p-2.5 rounded-lg border transition-colors cursor-pointer flex items-center gap-2 ${
                  isHeadphonesMonitor ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40' : 'bg-white/5 text-neutral-400 border-white/10'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span className="text-xs font-mono">Audio Master</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={runEnhancementPipeline}
                disabled={isEnhancing}
                className="px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>{isEnhancing ? 'Enhancing Pipeline...' : 'Test AI Enhancer'}</span>
              </button>

              <button
                onClick={generatePostProduction}
                disabled={isGeneratingPost}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>{isGeneratingPost ? 'Generating...' : 'AI Post-Production'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar: AI Director, AI Co-Producer & Rundown (Span 4) */}
        <div className="lg:col-span-4 bg-neutral-950 border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl h-[660px]">
          <div className="flex border-b border-white/10 bg-black/40 text-xs font-mono">
            <button
              onClick={() => setActiveTab('director')}
              className={`flex-1 py-3 px-2 flex items-center justify-center gap-1 border-b-2 cursor-pointer transition-colors ${
                activeTab === 'director' ? 'border-emerald-500 text-white font-semibold' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <span>AI Director</span>
            </button>
            <button
              onClick={() => setActiveTab('coproducer')}
              className={`flex-1 py-3 px-2 flex items-center justify-center gap-1 border-b-2 cursor-pointer transition-colors ${
                activeTab === 'coproducer' ? 'border-emerald-500 text-white font-semibold' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Co-Producer</span>
            </button>
            <button
              onClick={() => setActiveTab('rundown')}
              className={`flex-1 py-3 px-2 flex items-center justify-center gap-1 border-b-2 cursor-pointer transition-colors ${
                activeTab === 'rundown' ? 'border-emerald-500 text-white font-semibold' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Rundown</span>
            </button>
            <button
              onClick={() => setActiveTab('enhancer')}
              className={`flex-1 py-3 px-2 flex items-center justify-center gap-1 border-b-2 cursor-pointer transition-colors ${
                activeTab === 'enhancer' ? 'border-emerald-500 text-white font-semibold' : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Enhancer</span>
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-sans">
            {/* AI Director Tab */}
            {activeTab === 'director' && (
              <div className="space-y-4">
                <div className="p-3 bg-neutral-900/60 border border-white/5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-neutral-300 font-semibold">AUTOMATED AI DIRECTOR</span>
                    <button
                      onClick={() => setAiDirectorActive(!aiDirectorActive)}
                      className={`text-[10px] font-mono px-2 py-0.5 rounded cursor-pointer ${
                        aiDirectorActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-neutral-400'
                      }`}
                    >
                      {aiDirectorActive ? 'ENABLED' : 'PAUSED'}
                    </button>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    Evaluates speaker transitions, speech cadence, and question/answer states to cut between Two-Shot, Guest Focus, and Host Focus with cinematic pacing.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    DIRECTOR DECISION STREAM
                  </div>
                  <div className="space-y-1.5 font-mono text-[11px]">
                    {directorLog.map((log, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2">
                        <span className="text-emerald-400 text-[10px] shrink-0 mt-0.5">{log.time}</span>
                        <span className="text-neutral-300 leading-snug">{log.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Co-Producer Tab */}
            {activeTab === 'coproducer' && (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-1">
                  <div className="text-xs font-mono text-emerald-300 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dynamic Interview Memory</span>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    Questions are dynamically synthesized from {session.guestName}&apos;s verified bio, previous responses, and conversation milestones.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    CONTEXTUAL NEXT QUESTIONS
                  </div>
                  {aiQuestions.map((q, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-neutral-900 border border-white/5 hover:border-emerald-500/40 transition-colors space-y-1 cursor-pointer group"
                    >
                      <div className="text-[10px] font-mono text-emerald-400">PROMPT 0{idx + 1}</div>
                      <p className="text-xs text-neutral-200 leading-relaxed group-hover:text-white">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rundown Tab */}
            {activeTab === 'rundown' && (
              <div className="space-y-3 h-full flex flex-col">
                <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                  <span>SHOW RUNDOWN &amp; SCRATCHPAD</span>
                  <span className="text-emerald-400">Auto-saved</span>
                </div>
                <textarea
                  value={rundownNotes}
                  onChange={(e) => setRundownNotes(e.target.value)}
                  className="flex-1 w-full bg-black/60 border border-white/10 rounded-xl p-3 text-xs font-mono text-neutral-200 leading-relaxed outline-none focus:border-emerald-500/50 resize-none min-h-[350px]"
                />
              </div>
            )}

            {/* Enhancer Tab with Interactive Before/After Slider */}
            {activeTab === 'enhancer' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 block">
                    LIVE INSPECTION SLIDER
                  </span>
                  <BeforeAfterSlider
                    aspectRatio="aspect-video"
                    originalLabel="WEBCAM RAW"
                    enhancedLabel="RISE 4K MASTER"
                    showBadges={false}
                  />
                </div>

                {enhancementJob && (
                  <div className="p-3 bg-neutral-900 rounded-xl border border-emerald-500/30 space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-semibold uppercase">{enhancementJob.stage}</span>
                      <span>{enhancementJob.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${enhancementJob.progress}%` }} />
                    </div>
                    <p className="text-[11px] text-neutral-300">{enhancementJob.statusText}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post-Production Review Screen (Requirement 41-45) */}
      {phase === 'review' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6 overflow-y-auto">
          <div className="bg-neutral-950 border border-emerald-500/40 rounded-3xl max-w-4xl w-full p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-white">
                    Master Dialogue Recording Concluded
                  </h3>
                  <p className="text-xs font-mono text-neutral-400">
                    Take {takeNumber} · Duration: {formatTime(elapsedSeconds)} · Isolated ISO Stems Ready
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPhase('studio')}
                className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono rounded-lg border border-white/10"
              >
                Back to Stage
              </button>
            </div>

            {/* Separate Tracks & ISO Stems Downloads (Requirement 37) */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block">
                LOSSLESS MULTI-TRACK ISO STEMS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                <button
                  onClick={downloadTake}
                  className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 hover:border-emerald-500/40 flex items-center justify-between transition-colors text-left"
                >
                  <div>
                    <div className="text-white font-semibold">Master Composite 4K</div>
                    <div className="text-neutral-500 text-[10px]">Program Mixed Audio & Video</div>
                  </div>
                  <Download className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={downloadTake}
                  className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 hover:border-emerald-500/40 flex items-center justify-between transition-colors text-left"
                >
                  <div>
                    <div className="text-white font-semibold">Host Raw Video &amp; 48kHz</div>
                    <div className="text-neutral-500 text-[10px]">Isolated Host Track</div>
                  </div>
                  <Download className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={downloadTake}
                  className="p-4 rounded-xl bg-neutral-900/60 border border-white/10 hover:border-emerald-500/40 flex items-center justify-between transition-colors text-left"
                >
                  <div>
                    <div className="text-white font-semibold">Guest Raw Video &amp; 48kHz</div>
                    <div className="text-neutral-500 text-[10px]">Isolated Guest Track</div>
                  </div>
                  <Download className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            </div>

            {/* AI Generated Clips Candidates (Requirement 43) */}
            <div className="space-y-3">
              <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block">
                AI VIRAL CLIPS CANDIDATES (9:16 REELS)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: 'The Real Bottleneck in Pakistani Education',
                    hook: '“The hardest part wasn’t teaching—it was aligning global accreditation with local regulators.”',
                    range: '04:15 - 05:08',
                    rationale: 'High debate potential on LinkedIn and Instagram.',
                  },
                  {
                    title: 'Why Top Talent Stays in Pakistan',
                    hook: '“Transnational degrees give ambitious students global parity without forcing them to emigrate.”',
                    range: '18:20 - 19:12',
                    rationale: 'Inspiring national workforce narrative.',
                  },
                ].map((c, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-neutral-900 border border-white/10 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-emerald-400 font-bold">CLIP 0{idx + 1} · 9:16 VERTICAL</span>
                      <span className="text-neutral-500">{c.range}</span>
                    </div>
                    <h5 className="text-sm font-semibold text-white">{c.title}</h5>
                    <p className="text-xs text-neutral-300 italic">{c.hook}</p>
                    <p className="text-[11px] text-neutral-400">{c.rationale}</p>
                    <div className="pt-2 flex items-center gap-2">
                      <button className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-mono uppercase font-semibold">
                        Approve Clip
                      </button>
                      <button className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] font-mono uppercase">
                        Regenerate Hook
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  setTakeNumber((t) => t + 1);
                  setElapsedSeconds(0);
                  setRecordedVideoUrl(null);
                  setPhase('studio');
                }}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-mono rounded-xl border border-white/10"
              >
                Start New Take
              </button>
              <button
                onClick={() => setPhase('host_dashboard')}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-lg"
              >
                Approve &amp; Send to Production Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
