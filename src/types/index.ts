export interface Episode {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  guestId?: string;
  guestName: string;
  guestRole: string;
  guestOrg: string;
  category: string;
  topics: string[];
  youtubeUrl: string;
  videoUrl?: string;
  audioUrl?: string;
  duration: string;
  publishDate: string;
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  tags: string[];
  status: 'published' | 'draft';
  views?: number;
}

export interface Guest {
  id: string;
  name: string;
  slug: string;
  photo: string;
  role: string;
  organization: string;
  industry: string;
  bio: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
  };
  featured: boolean;
  episodeCount?: number;
  episodes?: string[];
}

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: string;
  category: string;
  tags: string[];
  publishDate: string;
  readingTime: string;
  featured: boolean;
  status: 'published' | 'draft';
  seoTitle?: string;
  seoDescription?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  type: 'guest' | 'client' | 'collaboration' | 'media';
  quote: string;
  rating: number;
  avatar?: string;
  featured: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  shortBio?: string;
  bio: string;
  fullBio?: string;
  photo?: string;
  email?: string;
  linkedIn?: string;
  instagram?: string;
  website?: string;
  order: number;
  featured?: boolean;
  active?: boolean;
  associatedEpisodes?: string[];
  associatedSessions?: string[];
}

export interface ServiceItem {
  id: string;
  title: string;
  category: 'PR' | 'Production' | 'Events' | 'Branding';
  description: string;
  bullets: string[];
  icon: string;
  order: number;
}

export interface PartnershipItem {
  id: string;
  eventName: string;
  edition: string;
  role: string;
  description: string;
  year: string;
  location?: string;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  bookingType: string;
  preferredDate: string;
  preferredTime: string;
  timezone: string;
  message: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  inquiryType: string;
  message: string;
  isRead: boolean;
  isArchived: boolean;
  createdAt: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  active: boolean;
  order: number;
}

export interface SiteSettings {
  brandName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  footerAbout: string;
  stats: {
    videoCount: string;
    videoLabel: string;
    fullEpisodesCount?: string;
    shortsCount?: string;
    playlistCount?: string;
  };
  riseAiSettings?: {
    voiceId: string;
    language: string;
    speakingStyle: string;
    responseLength: 'concise' | 'balanced' | 'detailed';
    personalityInstructions: string;
    welcomeMessage: string;
  };
}

export type AiAssistantMode =
  | 'CONCIERGE'
  | 'CALL AGENT'
  | 'STUDIO AGENT'
  | 'AI HOST'
  | 'CO-PRODUCER'
  | 'PRODUCTION ASSISTANT'
  | 'CONTENT STRATEGIST';

export type SessionState =
  | 'DRAFT'
  | 'READY'
  | 'HOST_IN_ROOM'
  | 'WAITING_FOR_GUEST'
  | 'GUEST_WAITING'
  | 'GUEST_ADMITTED'
  | 'RECORDING'
  | 'PROCESSING'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'ARCHIVED'
  | 'FAILED'
  | 'standby'
  | 'soundcheck'
  | 'completed';

export interface DirectorEvent {
  id: string;
  time: string;
  action: string;
  speaker: 'host' | 'guest' | 'both';
  layout: 'two-shot' | 'host-focus' | 'guest-focus' | 'split-50-50' | 'vertical-social';
  confidence?: number;
}

export interface RecordingTracks {
  hostVideoUrl?: string;
  hostAudioUrl?: string;
  guestVideoUrl?: string;
  guestAudioUrl?: string;
  masterProgramUrl?: string;
  durationSeconds: number;
  recordedAt: string;
  fileSizeMb?: number;
}

export interface QualityAssessment {
  cameraDetected: boolean;
  micDetected: boolean;
  speakerDetected: boolean;
  resolution: string;
  frameRate: number;
  exposure: 'optimal' | 'low_light' | 'backlit';
  noiseLevel: 'clean' | 'moderate' | 'high';
  audioLevel: number;
  echoDetected: boolean;
  networkRttMs: number;
  recommendations: string[];
}

export interface ClipCandidate {
  id: string;
  sessionId: string;
  title: string;
  hook: string;
  duration: string;
  aspectRatio: '9:16' | '1:1' | '16:9';
  timestampRange: string;
  viralRationale: string;
  status: 'suggested' | 'approved' | 'rejected' | 'published';
}

export interface EnhancementJob {
  id: string;
  sessionId: string;
  stage: 'queued' | 'analyzing' | 'denoising' | 'light_matching' | 'color_matching' | 'super_resolution' | 'completed' | 'failed';
  progress: number;
  statusText: string;
  identityPreserved: boolean;
  canvasTarget: '4K AI Master' | '8K AI Master' | '1080p Studio Master';
  startedAt: string;
  completedAt?: string;
}

export interface StudioSession {
  id: string;
  title: string;
  topic?: string;
  guestName: string;
  guestRole?: string;
  guestOrg?: string;
  guestEmail?: string;
  guestPhone?: string;
  guestLinkedIn?: string;
  guestWebsite?: string;
  hostName: string;
  hostRole?: string;
  hostMode: 'human' | 'ai';
  status: SessionState;
  hostReady?: boolean;
  guestWaiting?: boolean;
  guestAdmitted?: boolean;
  guestPreflightComplete?: boolean;
  guestConnectionQuality?: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  guestCameraReady?: boolean;
  guestMicReady?: boolean;
  durationSeconds: number;
  takeNumber: number;
  createdAt: string;
  publishedAt?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  timezone?: string;
  inviteToken?: string;
  notes?: string;
  rundown?: string;
  directorLayout?: 'two-shot' | 'host-focus' | 'guest-focus' | 'split-50-50' | 'vertical-social';
  tracks?: RecordingTracks;
  qualityAssessment?: QualityAssessment;
  enhancementJob?: EnhancementJob;
  postProduction?: {
    transcript?: string;
    chapters?: Array<{ time: string; title: string }>;
    suggestedTitles?: string[];
    showNotes?: string;
    clips?: ClipCandidate[];
    socialCopy?: {
      linkedin?: string;
      youtube?: string;
      instagram?: string;
      tiktok?: string;
      facebook?: string;
    };
  };
}

export interface ActivityLog {
  id: string;
  action: string;
  target: string;
  details: string;
  timestamp: string;
  adminEmail: string;
}
