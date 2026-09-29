import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './server/db';
import { Episode, Guest, Blog, Testimonial, Booking, ContactSubmission, TeamMember, ServiceItem, PartnershipItem, SocialLink, SiteSettings, StudioSession, EnhancementJob, QualityAssessment } from './src/types';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Prevent caching in dev/preview iframe
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Auth tokens store
const validSessions = new Set<string>();

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@risepakistan.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'RisePakistan2025!';

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  if (!validSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }
  next();
}

// ----------------- Public API Routes ----------------- //

// Settings
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.get().settings);
});

// Social Links
app.get('/api/social-links', (req: Request, res: Response) => {
  res.json(db.get().socialLinks.filter(s => s.active).sort((a, b) => a.order - b.order));
});

// Episodes
app.get('/api/episodes', (req: Request, res: Response) => {
  const { category, search, guest, featured } = req.query;
  let items = db.get().episodes.filter(e => e.status === 'published');

  if (featured === 'true') {
    items = items.filter(e => e.featured);
  }
  if (category && typeof category === 'string' && category !== 'All') {
    items = items.filter(e => e.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (guest && typeof guest === 'string') {
    items = items.filter(e => e.guestName.toLowerCase().includes(guest.toLowerCase()));
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(e => 
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.guestName.toLowerCase().includes(q) ||
      e.topics.some(t => t.toLowerCase().includes(q))
    );
  }
  res.json(items);
});

app.get('/api/episodes/:slug', (req: Request, res: Response) => {
  const ep = db.get().episodes.find(e => e.slug === req.params.slug || e.id === req.params.slug);
  if (!ep) {
    return res.status(404).json({ error: 'Episode not found' });
  }
  res.json(ep);
});

// Guests
app.get('/api/guests', (req: Request, res: Response) => {
  const { industry, search, featured } = req.query;
  let items = [...db.get().guests];

  if (featured === 'true') {
    items = items.filter(g => g.featured);
  }
  if (industry && typeof industry === 'string' && industry !== 'All') {
    items = items.filter(g => g.industry.toLowerCase().includes(industry.toLowerCase()));
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.organization.toLowerCase().includes(q) ||
      g.role.toLowerCase().includes(q) ||
      g.bio.toLowerCase().includes(q)
    );
  }
  res.json(items);
});

app.get('/api/guests/:slug', (req: Request, res: Response) => {
  const guest = db.get().guests.find(g => g.slug === req.params.slug || g.id === req.params.slug);
  if (!guest) {
    return res.status(404).json({ error: 'Guest not found' });
  }
  const episodes = db.get().episodes.filter(e => e.guestId === guest.id || e.guestName.toLowerCase() === guest.name.toLowerCase());
  res.json({ ...guest, episodesList: episodes });
});

// Blogs
app.get('/api/blogs', (req: Request, res: Response) => {
  const { category, search, featured } = req.query;
  let items = db.get().blogs.filter(b => b.status === 'published');

  if (featured === 'true') {
    items = items.filter(b => b.featured);
  }
  if (category && typeof category === 'string' && category !== 'All') {
    items = items.filter(b => b.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    items = items.filter(b =>
      b.title.toLowerCase().includes(q) ||
      b.excerpt.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.tags.some(t => t.toLowerCase().includes(q))
    );
  }
  res.json(items);
});

app.get('/api/blogs/:slug', (req: Request, res: Response) => {
  const blog = db.get().blogs.find(b => b.slug === req.params.slug || b.id === req.params.slug);
  if (!blog) {
    return res.status(404).json({ error: 'Blog not found' });
  }
  res.json(blog);
});

// Testimonials
app.get('/api/testimonials', (req: Request, res: Response) => {
  res.json(db.get().testimonials);
});

// Team
app.get('/api/team', (req: Request, res: Response) => {
  const team = db.get().team || [];
  res.json(team.filter(t => t.active !== false).sort((a, b) => a.order - b.order));
});

// Services
app.get('/api/services', (req: Request, res: Response) => {
  res.json(db.get().services.sort((a, b) => a.order - b.order));
});

// Partnerships
app.get('/api/partnerships', (req: Request, res: Response) => {
  res.json(db.get().partnerships);
});

// Global Search
app.get('/api/search', (req: Request, res: Response) => {
  const q = (req.query.q as string || '').toLowerCase().trim();
  if (!q) return res.json({ episodes: [], guests: [], blogs: [], services: [] });

  const data = db.get();
  const episodes = data.episodes
    .filter(e => e.status === 'published' && (e.title.toLowerCase().includes(q) || e.guestName.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)))
    .slice(0, 5);

  const guests = data.guests
    .filter(g => g.name.toLowerCase().includes(q) || g.organization.toLowerCase().includes(q) || g.role.toLowerCase().includes(q))
    .slice(0, 5);

  const blogs = data.blogs
    .filter(b => b.status === 'published' && (b.title.toLowerCase().includes(q) || b.excerpt.toLowerCase().includes(q)))
    .slice(0, 5);

  const services = data.services
    .filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
    .slice(0, 5);

  res.json({ episodes, guests, blogs, services });
});

// Booking Submission
app.post('/api/bookings', (req: Request, res: Response) => {
  const { name, email, phone, company, role, bookingType, preferredDate, preferredTime, timezone, message } = req.body;
  if (!name || !email || !bookingType) {
    return res.status(400).json({ error: 'Name, email, and booking type are required' });
  }

  const newBooking: Booking = {
    id: `bk-${Date.now()}`,
    name,
    email,
    phone: phone || '',
    company: company || '',
    role: role || '',
    bookingType,
    preferredDate: preferredDate || new Date().toISOString().split('T')[0],
    preferredTime: preferredTime || '14:00',
    timezone: timezone || 'Asia/Karachi',
    message: message || '',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const current = db.get();
  current.bookings.unshift(newBooking);
  db.save(current);
  db.logActivity('BOOKING_SUBMITTED', `${bookingType} - ${name}`, `New booking request from ${company || name}`, email);

  res.status(201).json({ success: true, booking: newBooking });
});

// Contact Submission
app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, phone, company, inquiryType, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required' });
  }

  const newContact: ContactSubmission = {
    id: `msg-${Date.now()}`,
    name,
    email,
    phone: phone || '',
    company: company || '',
    inquiryType: inquiryType || 'General inquiry',
    message,
    isRead: false,
    isArchived: false,
    createdAt: new Date().toISOString(),
  };

  const current = db.get();
  current.contacts.unshift(newContact);
  db.save(current);
  db.logActivity('CONTACT_RECEIVED', `${inquiryType} - ${name}`, `Message from ${email}`, email);

  res.status(201).json({ success: true, message: 'Message sent successfully' });
});

// ----------------- RISE Studio & AI Enhancement API ----------------- //

// Dynamic Availability Endpoint
app.get('/api/availability', (req: Request, res: Response) => {
  res.json({
    availableDays: ['Tuesdays', 'Thursdays', 'Saturdays'],
    hours: ['10:00', '11:30', '14:00', '15:30', '17:00'],
    timezone: 'Asia/Karachi',
    bufferMinutes: 30,
    minimumNoticeDays: 3,
    locations: ['Karachi Studio', 'Islamabad Studio', 'Remote RISE Studio (Browser 4K)'],
  });
});

// List studio sessions
app.get('/api/studio/sessions', (req: Request, res: Response) => {
  const sessions = db.get().studioSessions || [];
  res.json(sessions);
});

// Get session by ID or Invite Token
app.get('/api/studio/sessions/:idOrToken', (req: Request, res: Response) => {
  const param = req.params.idOrToken;
  const sessions = db.get().studioSessions || [];
  const session = sessions.find(s => s.id === param || s.inviteToken === param);
  if (!session) {
    return res.status(404).json({ error: 'Studio session not found or invite expired' });
  }
  res.json(session);
});

// Create studio session (Host First)
app.post('/api/studio/sessions', (req: Request, res: Response) => {
  const {
    title,
    topic,
    guestName,
    guestRole,
    guestOrg,
    guestEmail,
    guestPhone,
    guestLinkedIn,
    guestWebsite,
    scheduledDate,
    scheduledTime,
    timezone,
    hostName,
    hostRole,
    hostMode,
    rundown,
    notes,
  } = req.body;

  if (!title || !guestName) {
    return res.status(400).json({ error: 'Title and guest name are required' });
  }

  const token = `rise-live-${Math.random().toString(36).substring(2, 7)}${Math.floor(Math.random() * 900 + 100)}`;
  const newSession: StudioSession = {
    id: `ses-${Date.now()}`,
    title,
    topic: topic || title,
    guestName,
    guestRole: guestRole || 'Executive Guest',
    guestOrg: guestOrg || '',
    guestEmail: guestEmail || '',
    guestPhone: guestPhone || '',
    guestLinkedIn: guestLinkedIn || '',
    guestWebsite: guestWebsite || '',
    hostName: hostName || 'Javeria Hammad Khan',
    hostRole: hostRole || 'Lead Dialogue Host & Producer',
    hostMode: hostMode === 'ai' ? 'ai' : 'human',
    status: 'READY',
    hostReady: false,
    guestWaiting: false,
    guestAdmitted: false,
    guestConnectionQuality: 'Excellent',
    durationSeconds: 0,
    takeNumber: 1,
    createdAt: new Date().toISOString(),
    scheduledDate: scheduledDate || new Date().toISOString().split('T')[0],
    scheduledTime: scheduledTime || '14:00',
    timezone: timezone || 'Asia/Karachi (PKT)',
    inviteToken: token,
    directorLayout: 'two-shot',
    notes: notes || '',
    rundown: rundown || 'Cold open (3 min) -> Origin & inflection point (12 min) -> Market scaling & setbacks (15 min) -> Hard-won wisdom & closing (15 min)',
  };

  const data = db.get();
  data.studioSessions = data.studioSessions || [];
  data.studioSessions.unshift(newSession);
  db.save(data);
  db.logActivity('STUDIO_SESSION_CREATED', `${title} (${guestName})`, `Private studio generated with invite token: ${token}`);
  res.status(201).json(newSession);
});

// Update studio session (PUT / PATCH)
const updateStudioSession = (req: Request, res: Response) => {
  const id = req.params.id;
  const data = db.get();
  data.studioSessions = data.studioSessions || [];
  const idx = data.studioSessions.findIndex(s => s.id === id || s.inviteToken === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Session not found' });
  }
  data.studioSessions[idx] = { ...data.studioSessions[idx], ...req.body };
  db.save(data);
  res.json(data.studioSessions[idx]);
};

app.put('/api/studio/sessions/:id', updateStudioSession);
app.patch('/api/studio/sessions/:id', updateStudioSession);

// Host admits waiting guest
app.post('/api/studio/sessions/:id/admit', (req: Request, res: Response) => {
  const id = req.params.id;
  const data = db.get();
  data.studioSessions = data.studioSessions || [];
  const session = data.studioSessions.find(s => s.id === id || s.inviteToken === id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.guestAdmitted = true;
  session.guestWaiting = false;
  session.status = 'GUEST_ADMITTED';
  db.save(data);
  db.logActivity('GUEST_ADMITTED', session.title, `Guest ${session.guestName} admitted to recording stage by host`);
  res.json({ success: true, session });
});

// Guest signals waiting in waiting room
app.post('/api/studio/sessions/:id/waiting', (req: Request, res: Response) => {
  const id = req.params.id;
  const { cameraReady, micReady, networkQuality } = req.body;
  const data = db.get();
  data.studioSessions = data.studioSessions || [];
  const session = data.studioSessions.find(s => s.id === id || s.inviteToken === id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.guestWaiting = true;
  session.guestPreflightComplete = true;
  session.guestCameraReady = cameraReady ?? true;
  session.guestMicReady = micReady ?? true;
  session.guestConnectionQuality = networkQuality || 'Excellent';
  session.status = session.hostReady ? 'GUEST_WAITING' : 'WAITING_FOR_GUEST';
  db.save(data);
  res.json({ success: true, session });
});

// Save separate ISO stem tracks & trigger AI production pipeline
app.post('/api/studio/sessions/:id/record-tracks', async (req: Request, res: Response) => {
  const id = req.params.id;
  const { hostVideoUrl, hostAudioUrl, guestVideoUrl, guestAudioUrl, masterProgramUrl, durationSeconds, fileSizeMb } = req.body;
  const data = db.get();
  data.studioSessions = data.studioSessions || [];
  const session = data.studioSessions.find(s => s.id === id || s.inviteToken === id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.status = 'PROCESSING';
  session.durationSeconds = durationSeconds || session.durationSeconds || 1800;
  session.tracks = {
    hostVideoUrl: hostVideoUrl || '/assets/tracks/host_iso_48k.mp4',
    hostAudioUrl: hostAudioUrl || '/assets/tracks/host_iso_stem.wav',
    guestVideoUrl: guestVideoUrl || '/assets/tracks/guest_iso_48k.mp4',
    guestAudioUrl: guestAudioUrl || '/assets/tracks/guest_iso_stem.wav',
    masterProgramUrl: masterProgramUrl || '/assets/tracks/master_composite_4k.mp4',
    durationSeconds: session.durationSeconds,
    recordedAt: new Date().toISOString(),
    fileSizeMb: fileSizeMb || 480,
  };

  db.save(data);
  db.logActivity('RECORDING_TRACKS_SAVED', session.title, `ISO Multi-tracks stored for Take ${session.takeNumber}`);
  res.json({ success: true, session, tracks: session.tracks });
});

// Clip candidate approval / rejection
app.post('/api/studio/sessions/:id/clips/:clipId/status', (req: Request, res: Response) => {
  const { id, clipId } = req.params;
  const { status } = req.body;
  const data = db.get();
  data.studioSessions = data.studioSessions || [];
  const session = data.studioSessions.find(s => s.id === id || s.inviteToken === id);
  if (!session || !session.postProduction?.clips) {
    return res.status(404).json({ error: 'Session or clips not found' });
  }

  const clip = session.postProduction.clips.find(c => c.id === clipId);
  if (!clip) return res.status(404).json({ error: 'Clip not found' });

  clip.status = status;
  db.save(data);
  res.json({ success: true, clip });
});

// Production jobs list for Admin & Host
app.get('/api/studio/production-jobs', (req: Request, res: Response) => {
  const data = db.get();
  const sessions = data.studioSessions || [];
  const jobs = sessions
    .filter(s => s.tracks || s.enhancementJob || s.postProduction || s.status === 'completed' || s.status === 'READY_FOR_REVIEW')
    .map(s => ({
      sessionId: s.id,
      title: s.title,
      guestName: s.guestName,
      status: s.status,
      durationSeconds: s.durationSeconds,
      tracks: s.tracks,
      enhancementJob: s.enhancementJob,
      hasPostProduction: Boolean(s.postProduction),
      clipCount: s.postProduction?.clips?.length || 0,
      createdAt: s.createdAt,
    }));
  res.json(jobs);
});

// AI Quality check endpoint
app.post('/api/studio/quality-check', (req: Request, res: Response) => {
  const { hasCamera, hasMic, hasSpeaker, resolutionWidth, audioLevelDb, latencyMs } = req.body;
  const recommendations: string[] = [];
  let exposure: 'optimal' | 'low_light' | 'backlit' = 'optimal';
  let noiseLevel: 'clean' | 'moderate' | 'high' = 'clean';

  if (!hasCamera) recommendations.push('Camera not detected. Please verify browser permissions.');
  if (!hasMic) recommendations.push('Microphone not detected. Connect an external or headset mic.');
  if (resolutionWidth && resolutionWidth < 1280) {
    recommendations.push('Webcam stream is standard-definition. High-speed USB or 1080p source recommended.');
  }
  if (audioLevelDb && audioLevelDb < 30) {
    recommendations.push('Microphone input level is low. Move closer to the microphone.');
  }
  if (latencyMs && latencyMs > 120) {
    recommendations.push('Network latency jitter detected. Wired ethernet or close Wi-Fi recommended.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Studio audio & camera levels optimal for broadcast capture.');
  }

  res.json({
    cameraDetected: Boolean(hasCamera),
    micDetected: Boolean(hasMic),
    speakerDetected: Boolean(hasSpeaker),
    resolution: resolutionWidth ? `${resolutionWidth}p` : '1080p Studio',
    frameRate: 60,
    exposure,
    noiseLevel,
    audioLevel: audioLevelDb || 78,
    echoDetected: false,
    networkRttMs: latencyMs || 18,
    recommendations,
  });
});

// Start AI Enhancement Job
app.post('/api/studio/enhance', (req: Request, res: Response) => {
  const { sessionId, canvasTarget } = req.body;
  const data = db.get();
  data.studioSessions = data.studioSessions || [];
  const session = data.studioSessions.find(s => s.id === sessionId || s.inviteToken === sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  const job: EnhancementJob = {
    id: `enh-${Date.now()}`,
    sessionId: session.id,
    stage: 'analyzing',
    progress: 15,
    statusText: 'Analyzing spatial exposure, noise floor, and facial keypoints...',
    identityPreserved: true,
    canvasTarget: canvasTarget || '4K AI Master',
    startedAt: new Date().toISOString(),
  };

  session.enhancementJob = job;
  db.save(data);
  db.logActivity('ENHANCEMENT_STARTED', session.title, `Job ${job.id} dispatched`);
  res.json({ success: true, job });
});

// Check AI Enhancement Job Status (Simulate real progressive stages)
app.get('/api/studio/enhance/:sessionId', (req: Request, res: Response) => {
  const sessionId = req.params.sessionId;
  const data = db.get();
  const session = (data.studioSessions || []).find(s => s.id === sessionId || s.inviteToken === sessionId);
  if (!session || !session.enhancementJob) {
    return res.status(404).json({ error: 'No active enhancement job for this session' });
  }

  const job = session.enhancementJob;
  const elapsedMs = Date.now() - new Date(job.startedAt).getTime();

  if (job.stage === 'analyzing' && elapsedMs > 2500) {
    job.stage = 'denoising';
    job.progress = 35;
    job.statusText = 'Temporal video denoising and acoustic room echo cancellation...';
  } else if (job.stage === 'denoising' && elapsedMs > 5500) {
    job.stage = 'light_matching';
    job.progress = 60;
    job.statusText = 'Harmonizing studio lighting and key/rim balances...';
  } else if (job.stage === 'light_matching' && elapsedMs > 8500) {
    job.stage = 'color_matching';
    job.progress = 80;
    job.statusText = 'Applying RISE emerald cinematic grade (Identity Preserved)...';
  } else if (job.stage === 'color_matching' && elapsedMs > 11500) {
    job.stage = 'super_resolution';
    job.progress = 95;
    job.statusText = `Temporal super-resolution encoding (${job.canvasTarget})...`;
  } else if (job.stage === 'super_resolution' && elapsedMs > 14000) {
    job.stage = 'completed';
    job.progress = 100;
    job.statusText = `RISE Studio Master Enhancement Complete (${job.canvasTarget})`;
    job.completedAt = new Date().toISOString();
  }

  db.save(data);
  res.json(job);
});

// AI Post-Production Generation (Using Gemini 3.8 Flash)
app.post('/api/studio/post-production', async (req: Request, res: Response) => {
  const { sessionId, transcriptText, guestName, topic } = req.body;
  try {
    const prompt = `You are the RISE Pakistan AI Executive Post-Producer.
Topic: ${topic || 'Leadership and Innovation in Pakistan'}
Guest: ${guestName || 'Distinguished Leader'}
Transcript / Context: ${transcriptText || 'In-depth dialogue on scaling operations, overcoming capital constraints, and building institutional resilience in Pakistan.'}

Generate a comprehensive production distribution package in valid JSON with these keys:
{
  "suggestedTitles": ["title 1", "title 2", "title 3"],
  "showNotes": "2-paragraph executive show notes",
  "chapters": [
    {"time": "00:00", "title": "Opening & Guest Context"},
    {"time": "04:30", "title": "The Inflection Point"},
    {"time": "18:15", "title": "Macro Realities & Tactical Pivots"},
    {"time": "32:00", "title": "Future Outlook & Advice"}
  ],
  "clips": [
    {
      "title": "Clip 1 Title",
      "hook": "Compelling 1-sentence hook",
      "duration": "00:52",
      "aspectRatio": "9:16",
      "timestampRange": "04:30 - 05:22",
      "viralRationale": "Why this resonates on Instagram/TikTok/LinkedIn"
    },
    {
      "title": "Clip 2 Title",
      "hook": "Strong contrarian insight",
      "duration": "00:46",
      "aspectRatio": "9:16",
      "timestampRange": "19:10 - 19:56",
      "viralRationale": "High debate potential"
    }
  ],
  "socialCopy": {
    "linkedin": "Executive post with hook, takeaways, and call to action",
    "youtube": "Full video description with timestamp links and hashtags",
    "instagram": "Reel caption with quote and CTA",
    "tiktok": "Short punchy hook with trending tags",
    "facebook": "Engaging community post"
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const output = JSON.parse(response.text || '{}');

    if (sessionId) {
      const data = db.get();
      const session = (data.studioSessions || []).find(s => s.id === sessionId || s.inviteToken === sessionId);
      if (session) {
        session.postProduction = {
          suggestedTitles: output.suggestedTitles || [],
          showNotes: output.showNotes || '',
          chapters: output.chapters || [],
          clips: (output.clips || []).map((c: any, i: number) => ({
            id: `clip-${Date.now()}-${i}`,
            sessionId: session.id,
            title: c.title,
            hook: c.hook,
            duration: c.duration,
            aspectRatio: c.aspectRatio || '9:16',
            timestampRange: c.timestampRange,
            viralRationale: c.viralRationale,
            status: 'suggested',
          })),
          socialCopy: output.socialCopy || {},
        };
        db.save(data);
      }
    }

    res.json(output);
  } catch (err: any) {
    console.error('Post-production error:', err);
    res.status(500).json({ error: 'AI Post-production generation unavailable' });
  }
});

// Publish a studio session directly into the public Episodes library
app.post('/api/studio/sessions/:id/publish', (req: Request, res: Response) => {
  const id = req.params.id;
  const { episodeTitle, episodeSlug, category, season, episodeNumber } = req.body;
  const data = db.get();
  data.studioSessions = data.studioSessions || [];
  const session = data.studioSessions.find(s => s.id === id || s.inviteToken === id);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.status = 'PUBLISHED';
  session.publishedAt = new Date().toISOString();

  // Create or update corresponding episode
  const newEpisode: Episode = {
    id: `ep-${Date.now()}`,
    title: episodeTitle || session.title,
    slug: episodeSlug || (session.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')),
    description: session.postProduction?.showNotes || `Full broadcast recording of ${session.title} featuring ${session.guestName}.`,
    shortDescription: session.postProduction?.showNotes ? session.postProduction.showNotes.slice(0, 160) + '...' : `Strategic insights with ${session.guestName} on ${session.topic || session.title}.`,
    thumbnail: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1200&q=80',
    guestName: session.guestName,
    guestRole: session.guestRole || 'Distinguished Guest',
    guestOrg: session.guestOrg || 'RISE Guest Network',
    category: category || 'Digital Production & Innovation',
    topics: ['RISE Studio', session.topic || 'Leadership', 'Pakistan', session.guestOrg || 'Innovation'],
    youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    videoUrl: session.tracks?.masterProgramUrl,
    audioUrl: session.tracks?.hostAudioUrl,
    duration: session.durationSeconds ? `${Math.floor(session.durationSeconds / 60)} min` : '42 min',
    publishDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    featured: true,
    tags: ['RISE Studio', 'Executive Dialogue', 'Pakistan', session.guestOrg || 'Industry'],
    status: 'published',
    views: 1,
  };

  data.episodes = [newEpisode, ...(data.episodes || [])];
  db.save(data);
  db.logActivity('STUDIO_SESSION_PUBLISHED', session.title, `Published to public episode catalog (${newEpisode.slug})`);

  res.json({ success: true, session, episode: newEpisode });
});

// ----------------- Auth Routes ----------------- //

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    validSessions.add(token);
    db.logActivity('ADMIN_LOGIN', 'Admin Session', 'Successful admin authentication', email);
    return res.json({
      success: true,
      token,
      user: { email: ADMIN_EMAIL, role: 'Super Admin', name: 'RISE Administrator' },
    });
  }
  return res.status(401).json({ error: 'Invalid email or password' });
});

app.post('/api/auth/logout', requireAuth, (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) validSessions.delete(token);
  res.json({ success: true });
});

app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  res.json({ email: ADMIN_EMAIL, role: 'Super Admin', name: 'RISE Administrator' });
});

// ----------------- Admin CRUD Endpoints ----------------- //

app.get('/api/admin/metrics', requireAuth, (req: Request, res: Response) => {
  const data = db.get();
  res.json({
    totalEpisodes: data.episodes.length,
    publishedEpisodes: data.episodes.filter(e => e.status === 'published').length,
    draftEpisodes: data.episodes.filter(e => e.status === 'draft').length,
    totalGuests: data.guests.length,
    totalBlogs: data.blogs.length,
    totalTestimonials: data.testimonials.length,
    pendingBookings: data.bookings.filter(b => b.status === 'pending').length,
    unreadMessages: data.contacts.filter(c => !c.isRead).length,
    recentActivity: data.activityLogs.slice(0, 10),
  });
});

// Admin Episodes CRUD
app.get('/api/admin/episodes', requireAuth, (req: Request, res: Response) => {
  res.json(db.get().episodes);
});

app.post('/api/admin/episodes', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const newEp: Episode = {
    ...req.body,
    id: `ep-${Date.now()}`,
    slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    publishDate: req.body.publishDate || new Date().toISOString().split('T')[0],
  };
  current.episodes.unshift(newEp);
  db.save(current);
  db.logActivity('EPISODE_CREATED', newEp.title, `Added episode: ${newEp.title}`);
  res.status(201).json(newEp);
});

app.put('/api/admin/episodes/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const idx = current.episodes.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Episode not found' });
  current.episodes[idx] = { ...current.episodes[idx], ...req.body };
  db.save(current);
  db.logActivity('EPISODE_UPDATED', current.episodes[idx].title, `Updated episode details`);
  res.json(current.episodes[idx]);
});

app.delete('/api/admin/episodes/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const ep = current.episodes.find(e => e.id === req.params.id);
  current.episodes = current.episodes.filter(e => e.id !== req.params.id);
  db.save(current);
  db.logActivity('EPISODE_DELETED', ep?.title || req.params.id, `Removed episode`);
  res.json({ success: true });
});

// Admin Guests CRUD
app.get('/api/admin/guests', requireAuth, (req: Request, res: Response) => {
  res.json(db.get().guests);
});

app.post('/api/admin/guests', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const newGuest: Guest = {
    ...req.body,
    id: `gst-${Date.now()}`,
    slug: req.body.slug || req.body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  };
  current.guests.unshift(newGuest);
  db.save(current);
  db.logActivity('GUEST_CREATED', newGuest.name, `Added guest profile`);
  res.status(201).json(newGuest);
});

app.put('/api/admin/guests/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const idx = current.guests.findIndex(g => g.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Guest not found' });
  current.guests[idx] = { ...current.guests[idx], ...req.body };
  db.save(current);
  db.logActivity('GUEST_UPDATED', current.guests[idx].name, `Updated guest details`);
  res.json(current.guests[idx]);
});

app.delete('/api/admin/guests/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const guest = current.guests.find(g => g.id === req.params.id);
  current.guests = current.guests.filter(g => g.id !== req.params.id);
  db.save(current);
  db.logActivity('GUEST_DELETED', guest?.name || req.params.id, `Removed guest`);
  res.json({ success: true });
});

// Admin Blogs CRUD
app.get('/api/admin/blogs', requireAuth, (req: Request, res: Response) => {
  res.json(db.get().blogs);
});

app.post('/api/admin/blogs', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const newBlog: Blog = {
    ...req.body,
    id: `blg-${Date.now()}`,
    slug: req.body.slug || req.body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    publishDate: req.body.publishDate || new Date().toISOString().split('T')[0],
  };
  current.blogs.unshift(newBlog);
  db.save(current);
  db.logActivity('BLOG_CREATED', newBlog.title, `Published/drafted blog post`);
  res.status(201).json(newBlog);
});

app.put('/api/admin/blogs/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const idx = current.blogs.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Blog not found' });
  current.blogs[idx] = { ...current.blogs[idx], ...req.body };
  db.save(current);
  db.logActivity('BLOG_UPDATED', current.blogs[idx].title, `Updated blog post`);
  res.json(current.blogs[idx]);
});

app.delete('/api/admin/blogs/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const blog = current.blogs.find(b => b.id === req.params.id);
  current.blogs = current.blogs.filter(b => b.id !== req.params.id);
  db.save(current);
  db.logActivity('BLOG_DELETED', blog?.title || req.params.id, `Removed blog post`);
  res.json({ success: true });
});

// Admin Bookings & Contacts
app.get('/api/admin/bookings', requireAuth, (req: Request, res: Response) => {
  res.json(db.get().bookings);
});

app.put('/api/admin/bookings/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const idx = current.bookings.findIndex(b => b.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Booking not found' });
  current.bookings[idx] = { ...current.bookings[idx], ...req.body };
  db.save(current);
  db.logActivity('BOOKING_STATUS_CHANGED', `${current.bookings[idx].bookingType} (${current.bookings[idx].name})`, `Status changed to ${current.bookings[idx].status}`);
  res.json(current.bookings[idx]);
});

app.delete('/api/admin/bookings/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  current.bookings = current.bookings.filter(b => b.id !== req.params.id);
  db.save(current);
  res.json({ success: true });
});

app.get('/api/admin/contacts', requireAuth, (req: Request, res: Response) => {
  res.json(db.get().contacts);
});

app.put('/api/admin/contacts/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const idx = current.contacts.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Contact message not found' });
  current.contacts[idx] = { ...current.contacts[idx], ...req.body };
  db.save(current);
  res.json(current.contacts[idx]);
});

app.delete('/api/admin/contacts/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  current.contacts = current.contacts.filter(c => c.id !== req.params.id);
  db.save(current);
  res.json({ success: true });
});

// Admin Testimonials
app.get('/api/admin/testimonials', requireAuth, (req: Request, res: Response) => {
  res.json(db.get().testimonials);
});

app.post('/api/admin/testimonials', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const item: Testimonial = { ...req.body, id: `tst-${Date.now()}` };
  current.testimonials.unshift(item);
  db.save(current);
  db.logActivity('TESTIMONIAL_CREATED', item.name, `Added testimonial`);
  res.status(201).json(item);
});

app.put('/api/admin/testimonials/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const idx = current.testimonials.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Testimonial not found' });
  current.testimonials[idx] = { ...current.testimonials[idx], ...req.body };
  db.save(current);
  res.json(current.testimonials[idx]);
});

app.delete('/api/admin/testimonials/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  current.testimonials = current.testimonials.filter(t => t.id !== req.params.id);
  db.save(current);
  res.json({ success: true });
});

// Admin Services CRUD
app.get('/api/admin/services', requireAuth, (req: Request, res: Response) => {
  res.json(db.get().services);
});

app.post('/api/admin/services', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const item: ServiceItem = {
    ...req.body,
    id: `srv-${Date.now()}`,
    order: req.body.order || current.services.length + 1,
  };
  current.services.push(item);
  db.save(current);
  db.logActivity('SERVICE_CREATED', item.title, 'Created new service offering');
  res.status(201).json(item);
});

app.put('/api/admin/services/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const idx = current.services.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Service not found' });
  current.services[idx] = { ...current.services[idx], ...req.body };
  db.save(current);
  db.logActivity('SERVICE_UPDATED', current.services[idx].title, 'Updated service description');
  res.json(current.services[idx]);
});

app.delete('/api/admin/services/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  current.services = current.services.filter(s => s.id !== req.params.id);
  db.save(current);
  res.json({ success: true });
});

// Admin Partnerships CRUD
app.get('/api/admin/partnerships', requireAuth, (req: Request, res: Response) => {
  res.json(db.get().partnerships);
});

app.post('/api/admin/partnerships', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const item: PartnershipItem = {
    ...req.body,
    id: `part-${Date.now()}`,
  };
  current.partnerships.push(item);
  db.save(current);
  db.logActivity('PARTNERSHIP_CREATED', item.eventName, 'Created summit partnership');
  res.status(201).json(item);
});

app.put('/api/admin/partnerships/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  const idx = current.partnerships.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Partnership not found' });
  current.partnerships[idx] = { ...current.partnerships[idx], ...req.body };
  db.save(current);
  db.logActivity('PARTNERSHIP_UPDATED', current.partnerships[idx].eventName, 'Updated partnership');
  res.json(current.partnerships[idx]);
});

app.delete('/api/admin/partnerships/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  current.partnerships = current.partnerships.filter(p => p.id !== req.params.id);
  db.save(current);
  res.json({ success: true });
});

// Admin Team CRUD (Section 51)
app.get('/api/admin/team', requireAuth, (req: Request, res: Response) => {
  res.json(db.get().team || []);
});

app.post('/api/admin/team', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  current.team = current.team || [];
  const item: TeamMember = {
    ...req.body,
    id: `team-${Date.now()}`,
    order: req.body.order || current.team.length + 1,
    active: req.body.active ?? true,
    featured: req.body.featured ?? true,
  };
  current.team.push(item);
  db.save(current);
  db.logActivity('TEAM_MEMBER_CREATED', item.name, `Added ${item.role} (${item.department})`);
  res.status(201).json(item);
});

app.put('/api/admin/team/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  current.team = current.team || [];
  const idx = current.team.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Team member not found' });
  current.team[idx] = { ...current.team[idx], ...req.body };
  db.save(current);
  db.logActivity('TEAM_MEMBER_UPDATED', current.team[idx].name, `Updated profile/role`);
  res.json(current.team[idx]);
});

app.delete('/api/admin/team/:id', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  current.team = current.team || [];
  const member = current.team.find(t => t.id === req.params.id);
  current.team = current.team.filter(t => t.id !== req.params.id);
  db.save(current);
  db.logActivity('TEAM_MEMBER_DELETED', member?.name || req.params.id, `Removed team member`);
  res.json({ success: true });
});

// Admin Settings, Social, Activity
app.put('/api/admin/settings', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  current.settings = { ...current.settings, ...req.body };
  db.save(current);
  db.logActivity('SETTINGS_UPDATED', 'Platform Configuration', `Updated site settings`);
  res.json(current.settings);
});

app.put('/api/admin/social-links', requireAuth, (req: Request, res: Response) => {
  const current = db.get();
  current.socialLinks = req.body;
  db.save(current);
  db.logActivity('SOCIAL_LINKS_UPDATED', 'Social Media URLs', `Updated channels`);
  res.json(current.socialLinks);
});

app.get('/api/admin/activity', requireAuth, (req: Request, res: Response) => {
  res.json(db.get().activityLogs);
});

// ----------------- RISE AI Concierge (Gemini 3.8 Flash) ----------------- //

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Gemini function calling tool declarations
const searchEpisodesDeclaration = {
  name: 'searchEpisodes',
  description: 'Search for published RISE Pakistan podcast episodes by keyword, topic, or guest name.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'Search term or keyword (e.g. "education", "marketing", "Sanam Pathan")' },
    },
    required: ['query'],
  },
};

const searchGuestsDeclaration = {
  name: 'searchGuests',
  description: 'Search RISE Pakistan guest directory by guest name, organization, or industry.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'Search term (e.g. "Beaconhouse", "Ashifa", "Marketing")' },
    },
    required: ['query'],
  },
};

const getServicesDeclaration = {
  name: 'getServices',
  description: 'Retrieve the official PR and media production services offered by RISE Pakistan.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getCompanyInfoDeclaration = {
  name: 'getCompanyInfo',
  description: 'Get verified company information about RISE Pakistan, including founder Ahmed Kamal, host Javeria Hammad Khan, mission, and official channels.',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const getAvailabilityDeclaration = {
  name: 'getAvailability',
  description: 'Check available recording days and formats for podcast appearances or mobile expo studios.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      bookingType: { type: Type.STRING, description: 'Type of booking, e.g. "Podcast Appearance", "Corporate Podcast", "Mobile Studio"' },
    },
    required: ['bookingType'],
  },
};

const createBookingDeclaration = {
  name: 'createBooking',
  description: 'Book a podcast session, PR consultation, or corporate recording session after user confirmation.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Full name of the requestor' },
      email: { type: Type.STRING, description: 'Email address of requestor' },
      company: { type: Type.STRING, description: 'Organization or company name' },
      bookingType: { type: Type.STRING, description: 'Podcast Appearance, Corporate Podcast, Mobile Studio, or PR Consultation' },
      preferredDate: { type: Type.STRING, description: 'YYYY-MM-DD date' },
      message: { type: Type.STRING, description: 'Specific discussion topic or project goals' },
    },
    required: ['name', 'email', 'bookingType'],
  },
};

const getSocialLinksDeclaration = {
  name: 'getSocialLinks',
  description: 'Get the official RISE Pakistan social channels (YouTube, LinkedIn, Instagram, Facebook, TikTok).',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

const createStudioSessionDeclaration = {
  name: 'createStudioSession',
  description: 'Create a remote RISE Studio recording session and generate a secure invitation code.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: 'Title or topic of the recording session' },
      guestName: { type: Type.STRING, description: 'Full name of the guest' },
      guestEmail: { type: Type.STRING, description: 'Guest email address' },
      guestRole: { type: Type.STRING, description: 'Guest executive role' },
      guestOrg: { type: Type.STRING, description: 'Guest company or institution' },
      scheduledDate: { type: Type.STRING, description: 'Scheduled date (YYYY-MM-DD)' },
      scheduledTime: { type: Type.STRING, description: 'Scheduled time (HH:MM)' },
    },
    required: ['title', 'guestName'],
  },
};

const getStudioSessionDeclaration = {
  name: 'getStudioSession',
  description: 'Retrieve details and status of a RISE Studio session by ID or invite token.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      sessionId: { type: Type.STRING, description: 'Session ID or invite token' },
    },
    required: ['sessionId'],
  },
};

const submitContactFormDeclaration = {
  name: 'submitContactForm',
  description: 'Submit an executive contact inquiry or media advisory request to the RISE production desk.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: 'Full name' },
      email: { type: Type.STRING, description: 'Email address' },
      message: { type: Type.STRING, description: 'Message content' },
      company: { type: Type.STRING, description: 'Company name' },
      inquiryType: { type: Type.STRING, description: 'Inquiry type (e.g. "PR Visibility", "Corporate Podcast", "General")' },
    },
    required: ['name', 'email', 'message'],
  },
};

const createGuestInviteDeclaration = {
  name: 'createGuestInvite',
  description: 'Generate a secure, private invitation link for a guest to enter the RISE Studio waiting room.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      sessionId: { type: Type.STRING, description: 'Studio Session ID' },
      guestName: { type: Type.STRING, description: 'Guest full name' },
    },
    required: ['sessionId'],
  },
};

const getGuestInviteStatusDeclaration = {
  name: 'getGuestInviteStatus',
  description: 'Check whether the host has opened the studio room and whether the guest is permitted to enter preflight or the waiting room.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      inviteToken: { type: Type.STRING, description: 'Private invite token from guest URL' },
    },
    required: ['inviteToken'],
  },
};

const getTeamDeclaration = {
  name: 'getTeam',
  description: 'Retrieve verified information on the RISE Pakistan leadership and production team (Ahmed Kamal, Javeria Hammad Khan, Syed Waleed ur Rehman, M. Ali Zeeshan).',
  parameters: {
    type: Type.OBJECT,
    properties: {},
  },
};

// Tool executor function
function executeTool(name: string, args: any) {
  const data = db.get();
  switch (name) {
    case 'getTeam': {
      const activeTeam = (data.team || []).filter(t => t.active !== false);
      return {
        team: activeTeam.map(t => ({
          name: t.name,
          role: t.role,
          department: t.department,
          bio: t.shortBio || t.bio,
        })),
      };
    }
    case 'createGuestInvite': {
      const s = (data.studioSessions || []).find(item => item.id === args.sessionId || item.inviteToken === args.sessionId);
      if (!s) return { error: 'Session not found' };
      const token = s.inviteToken || `rise-live-${Math.random().toString(36).substring(2, 7)}${Math.floor(Math.random() * 900 + 100)}`;
      s.inviteToken = token;
      db.save(data);
      return {
        success: true,
        sessionId: s.id,
        inviteUrl: `/studio?invite=${token}`,
        message: `Private guest invitation link created for ${s.guestName}: /studio?invite=${token}. Note: Host-first security enforced; guest will stay in waiting room until host admits them.`,
      };
    }
    case 'getGuestInviteStatus': {
      const s = (data.studioSessions || []).find(item => item.inviteToken === args.inviteToken || item.id === args.inviteToken);
      if (!s) return { error: 'Invalid or expired invitation token' };
      return {
        sessionId: s.id,
        title: s.title,
        hostName: s.hostName,
        guestName: s.guestName,
        hostReady: Boolean(s.hostReady),
        status: s.status,
        canEnterWaitingRoom: true,
        admitted: Boolean(s.guestAdmitted),
      };
    }
    case 'searchEpisodes': {
      const q = (args.query || '').toLowerCase();
      const results = data.episodes
        .filter(e => e.status === 'published' && (e.title.toLowerCase().includes(q) || e.guestName.toLowerCase().includes(q) || e.topics.some(t => t.toLowerCase().includes(q))))
        .map(e => ({ title: e.title, guest: e.guestName, org: e.guestOrg, duration: e.duration, url: `/episodes/${e.slug}` }));
      return { count: results.length, episodes: results.slice(0, 5) };
    }
    case 'searchGuests': {
      const q = (args.query || '').toLowerCase();
      const results = data.guests
        .filter(g => g.name.toLowerCase().includes(q) || g.organization.toLowerCase().includes(q) || g.industry.toLowerCase().includes(q))
        .map(g => ({ name: g.name, role: g.role, organization: g.organization, industry: g.industry, bio: g.bio, url: `/guests/${g.slug}` }));
      return { count: results.length, guests: results.slice(0, 5) };
    }
    case 'getServices': {
      return { services: data.services.map(s => ({ title: s.title, category: s.category, description: s.description })) };
    }
    case 'getCompanyInfo': {
      return {
        brandName: 'RISE Pakistan Podcast',
        parent: 'RISE Pakistan — Media, PR & Business Spotlight Platform',
        hq: 'Karachi, Sindh, Pakistan',
        founded: '2023',
        podcastLaunch: 'Mid-2025',
        tagline: 'Real stories. Real insights. RISE with us.',
        mission: "To document and amplify the voices of Pakistan's thinkers, builders, professionals, and emerging leaders — empowering a new generation to rise with knowledge, confidence, and real-world inspiration.",
        founder: 'Ahmed Kamal (Founder & Strategic Director)',
        projectManager: 'Syed Waleed ur Rehman (Co-founder / Project Manager / Production Lead)',
        host: 'Javeria Hammad Khan (Lead Dialogue Host & Interviewer)',
        coverageTeam: 'Amber S., Mirza Asad Hussain (World CIO Summit coverage)',
        mediaFootprint: '69 full-length episodes, ~150 Shorts, 224 playlist items across YouTube, LinkedIn, Instagram, Facebook, and TikTok.',
        keyPartnerships: [
          '28th ITCN Asia Karachi (22–24 September 2026) Official Podcast Partner',
          'World CIO Summit & Awards 2026 Pakistan Edition (12 September 2026) Supporting Partner',
          'Pakistan Business Leaders Summit 2026 (Official Media Partner)',
          'Pakistan Business Excellence Summit 2026',
          'National Youth PODCON 2026'
        ],
      };
    }
    case 'getAvailability': {
      return {
        availableDays: ['Tuesdays', 'Thursdays', 'Saturdays'],
        timeSlots: ['10:00 AM PKT', '11:30 AM PKT', '02:00 PM PKT', '03:30 PM PKT', '05:00 PM PKT'],
        locations: ['Karachi Studio', 'Islamabad Studio', 'Remote RISE Studio (Browser 4K Lossless ISO)'],
        advanceNotice: 'Minimum 3 business days notice required for studio allocation.',
      };
    }
    case 'createBooking': {
      const newBooking: Booking = {
        id: `bk-${Date.now()}`,
        name: args.name,
        email: args.email,
        phone: '',
        company: args.company || '',
        role: '',
        bookingType: args.bookingType || 'Podcast Appearance',
        preferredDate: args.preferredDate || new Date().toISOString().split('T')[0],
        preferredTime: '14:00',
        timezone: 'Asia/Karachi',
        message: args.message || 'Booked via RISE AI Call Agent',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      data.bookings.unshift(newBooking);
      db.save(data);
      db.logActivity('BOOKING_VIA_AI', `${newBooking.bookingType} - ${newBooking.name}`, `Created by RISE AI Call Agent`);
      return { success: true, bookingId: newBooking.id, status: 'Confirmed pending producer review', message: 'Your booking request has been securely recorded into the RISE Pakistan calendar.' };
    }
    case 'createStudioSession': {
      const token = `rise-live-${Math.random().toString(36).substring(2, 7)}${Math.floor(Math.random() * 900 + 100)}`;
      const newSession: StudioSession = {
        id: `ses-${Date.now()}`,
        title: args.title,
        guestName: args.guestName,
        guestEmail: args.guestEmail || '',
        guestRole: args.guestRole || '',
        guestOrg: args.guestOrg || '',
        hostName: 'Javeria Hammad Khan',
        hostMode: 'human',
        status: 'standby',
        durationSeconds: 0,
        takeNumber: 1,
        createdAt: new Date().toISOString(),
        scheduledDate: args.scheduledDate || new Date().toISOString().split('T')[0],
        scheduledTime: args.scheduledTime || '14:00',
        inviteToken: token,
        directorLayout: 'two-shot',
        rundown: 'Cold open (3 min) -> Origin & inflection point (12 min) -> Market scaling & setbacks (15 min) -> Hard-won wisdom & closing (15 min)',
      };
      data.studioSessions = data.studioSessions || [];
      data.studioSessions.unshift(newSession);
      db.save(data);
      db.logActivity('STUDIO_VIA_AI', `${args.title} (${args.guestName})`, `Created by RISE Call Agent with token ${token}`);
      return {
        success: true,
        sessionId: newSession.id,
        inviteToken: token,
        studioUrl: `/studio?session=${token}`,
        message: `RISE Studio recording session established. Secure guest invitation link: /studio?session=${token}`
      };
    }
    case 'getStudioSession': {
      const sessions = data.studioSessions || [];
      const s = sessions.find(item => item.id === args.sessionId || item.inviteToken === args.sessionId);
      if (!s) return { error: 'Session not found or token expired' };
      return { id: s.id, title: s.title, guestName: s.guestName, status: s.status, hostName: s.hostName, scheduledDate: s.scheduledDate, inviteToken: s.inviteToken };
    }
    case 'submitContactForm': {
      const newMsg: ContactSubmission = {
        id: `msg-${Date.now()}`,
        name: args.name,
        email: args.email,
        phone: '',
        company: args.company || '',
        inquiryType: args.inquiryType || 'General inquiry',
        message: args.message,
        isRead: false,
        isArchived: false,
        createdAt: new Date().toISOString(),
      };
      data.contacts.unshift(newMsg);
      db.save(data);
      db.logActivity('CONTACT_VIA_AI', `${newMsg.inquiryType} - ${newMsg.name}`, `Message from ${newMsg.email}`);
      return { success: true, message: 'Your message has been received by the RISE production desk.' };
    }
    case 'getSocialLinks': {
      return { channels: data.socialLinks.filter(s => s.active).map(s => ({ platform: s.platform, url: s.url })) };
    }
    default:
      return { error: 'Unknown tool' };
  }
}

// AI Chat Route
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userMessage } = req.body;
    if (!userMessage && (!messages || messages.length === 0)) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    const systemInstruction = `You are "RISE AI", the exclusive luxury digital concierge for RISE Pakistan ("REAL INSPIRING STORIES & EXPERIENCES").
Your tone is intelligent, refined, confident, editorial, and deeply respectful of Pakistan's business and tech leadership.
You possess complete knowledge of RISE Pakistan:
- Founder: Ahmed Kamal (CEO of The Tatralink, entrepreneur, operator and investor)
- Host: Javeria Hammad Khan (Core interviewer and lead dialogue host)
- Operations: Syed Waleed ur Rehman (Project Manager), M. Ali Zeeshan (Production & Operations)
- Focus: Connecting Pakistan's corporate sector, technology startups, and digital ecosystem through high-impact storytelling, PR, and mobile studio broadcasting.
- Initial Guests: Sanam Pathan (Beaconhouse International College), Ashifa Paracha (PDA), Aisha Yousuf (CatchupwithAisha), Nasir Sheikh (Performance Marketing), Shoaib Bhatti, Kashif Mueed Rabbani.
- Partnerships: ITCN Asia (28th ITCN Asia in Karachi), World CIO Summit & Awards Pakistan Edition, Business Leaders Summit, SES Women's Summit.
- YouTube Footprint (Late September 2026 snapshot): Approximately 69 full-length podcast dialogues, ~150 short-form clips, and ~224 playlist items on YouTube @RisePakistan-podcast (1,120 subscribers).
- Socials: Instagram (8,778 followers), Facebook (16,211 followers), LinkedIn company (~2,653 followers), LinkedIn show (~2.3K), TikTok (@rise.pakistan.podcast).
- Studio Capabilities: RISE Studio offers remote professional podcast recording, isolated multi-track audio/video stems, live AI co-producing, AI video/audio enhancement, and mobile expo studio installations.
- Official Socials: YouTube (@RisePakistan-podcast), LinkedIn (rise-pakistan-official), Instagram (rise.pakistanofficial), Facebook (risePakistan2025), TikTok (@rise.pakistan.podcast).

Current Operational Mode: ${req.body.mode || 'CONCIERGE'}
If mode is 'CONCIERGE', provide refined editorial answers, navigation, and executive summaries.
If mode is 'CALL AGENT', act as the executive voice booking agent: guide guests, collect appearance topics, check availability via getAvailability, create bookings via createBooking, or create private RISE Studio recording rooms via createStudioSession.
If mode is 'STUDIO AGENT', assist with audio calibration, microphone acoustics, latency checks, and recording protocols.
If mode is 'AI HOST', act as a seasoned broadcast interviewer asking sharp, thought-provoking questions.
If mode is 'CO-PRODUCER', help organize run-of-show rundowns, hook formulation, and narrative chaptering.
If mode is 'PRODUCTION ASSISTANT', draft distribution notes, social media copy, and key quote takeaways.
If mode is 'CONTENT STRATEGIST', analyze audience engagement across LinkedIn, YouTube, and short-form platforms.

CRITICAL INSTRUCTIONS:
1. Always use your declared tools to look up real episodes, guests, services, availability, or to submit bookings or studio sessions.
2. Never hallucinate statistics, phone numbers, or private emails. Never expose admin credentials or internal secret tokens.
3. If information is not in the database, politely offer to connect the user with the production desk or assist them in submitting a booking inquiry.
4. Keep responses concise, elegant, and action-oriented.`;

    // Format chat history
    const conversationHistory: any[] = [];
    if (Array.isArray(messages)) {
      for (const m of messages) {
        conversationHistory.push({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        });
      }
    }
    if (userMessage) {
      conversationHistory.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });
    }

    // Call Gemini 3.8 Flash
    let response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: conversationHistory,
      config: {
        systemInstruction,
        temperature: 0.7,
        tools: [{
          functionDeclarations: [
            searchEpisodesDeclaration,
            searchGuestsDeclaration,
            getServicesDeclaration,
            getCompanyInfoDeclaration,
            getAvailabilityDeclaration,
            createBookingDeclaration,
            createStudioSessionDeclaration,
            getStudioSessionDeclaration,
            createGuestInviteDeclaration,
            getGuestInviteStatusDeclaration,
            submitContactFormDeclaration,
            getSocialLinksDeclaration,
            getTeamDeclaration,
          ],
        }],
      },
    });

    // Check if model called functions
    let replyText = response.text || '';
    const functionCalls = response.functionCalls;

    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call && call.name) {
        const toolResult = executeTool(call.name, call.args);

        // Follow-up with tool response using the model's exact candidate content
        const previousContent = response.candidates?.[0]?.content;
        const followUp = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            ...conversationHistory,
            previousContent,
            {
              role: 'user',
              parts: [{
                functionResponse: {
                  name: call.name,
                  response: toolResult,
                },
              }],
            },
          ],
          config: { systemInstruction },
        });

        replyText = followUp.text || 'I have retrieved the latest information from the RISE Pakistan production network.';
      }
    }

    res.json({ reply: replyText });
  } catch (error: any) {
    console.error('Error in RISE AI endpoint:', error);

    // High availability local knowledge fallback for transient 503 or network interruptions
    const query = (req.body.userMessage || '').toLowerCase();
    const data = db.get();

    let fallbackReply = `Welcome to RISE Pakistan. I am here to assist you with our executive dialogues, guest profiles, and production services.`;

    if (query.includes('founder') || query.includes('ahmed kamal') || query.includes('who founded')) {
      fallbackReply = `RISE Pakistan was founded by Ahmed Kamal, an entrepreneur, operator, and investor who is also the CEO of The Tatralink. He created the platform to provide Pakistani business leaders and innovators with global visibility and strategic narrative ownership.`;
    } else if (query.includes('host') || query.includes('javeria') || query.includes('interviewer')) {
      fallbackReply = `The core interviewer and lead host of RISE Pakistan is Javeria Hammad Khan. She leads our long-form digital dialogues, exploring the leadership decisions, operational milestones, and real-life grit behind leading Pakistani institutions.`;
    } else if (query.includes('what is rise') || query.includes('about rise') || query.includes('mission')) {
      fallbackReply = `RISE Pakistan is a premier digital media, public relations (PR), and podcast platform connecting Pakistan's corporate sector, technology startups, and digital ecosystem. Our mission is to provide professional storytelling, personal branding, and media amplification.`;
    } else if (query.includes('guest') || query.includes('sanam') || query.includes('ashifa') || query.includes('who are the guests')) {
      fallbackReply = `Our guest directory includes distinguished figures such as Sanam Pathan (Head of Institution, Beaconhouse International College), Ashifa Paracha (PDA), Aisha Yousuf (CatchupwithAisha), Nasir Sheikh (Growth & Performance Marketing Specialist), Shoaib Bhatti, and Kashif Mueed Rabbani.`;
    } else if (query.includes('service') || query.includes('pr') || query.includes('corporate podcast')) {
      fallbackReply = `RISE Pakistan provides four core solutions: Strategic PR & Corporate Visibility, Corporate Podcast Production, Mobile Expo Broadcast Studios (such as at ITCN Asia and World CIO Summit), and Personal Branding / Founder Journey Profiling.`;
    } else if (query.includes('book') || query.includes('appearance') || query.includes('schedule')) {
      fallbackReply = `You can request a recording session or PR consultation through our Contact & Booking desk. We host sessions on Tuesdays, Thursdays, and Saturdays at our Karachi and Islamabad studios, as well as on-site mobile summit installations.`;
    } else if (query.includes('youtube') || query.includes('channel') || query.includes('social')) {
      fallbackReply = `Our official YouTube channel features approximately 66+ full-length dialogues and ~150 short-form clips (224+ playlist items) at youtube.com/@RisePakistan-podcast. You can also find us on LinkedIn, Instagram, and Facebook.`;
    }

    res.json({ reply: fallbackReply });
  }
});

// AI Text-To-Speech Route (Gemini 3.8 Flash Lite TTS) - Persistent Voice Config
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required for TTS' });

    const currentData = db.get();
    const configuredVoice = currentData.settings?.riseAiSettings?.voiceId || process.env.RISE_AI_VOICE_ID || 'Aoede';
    const configuredStyle = currentData.settings?.riseAiSettings?.speakingStyle || 'Warm, refined, confident podcast executive';

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 400),
              speechMetadata: {
                style: configuredStyle,
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: configuredVoice },
          },
        },
      },
    });

    const audioBase64 = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioBase64) {
      return res.json({ audio: audioBase64, sampleRate: 24000, voiceId: configuredVoice });
    }
    return res.status(422).json({ error: 'Could not generate speech audio' });
  } catch (err: any) {
    console.error('TTS error:', err);
    res.status(500).json({ error: 'Speech synthesis unavailable', fallback: true });
  }
});

// ----------------- Server & Vite Setup ----------------- //

async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎙️ RISE Pakistan Server running on http://0.0.0.0:${PORT} (${isProd ? 'Production' : 'Development'})`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
