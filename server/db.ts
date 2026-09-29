import fs from 'fs';
import path from 'path';
import {
  Episode,
  Guest,
  Blog,
  Testimonial,
  TeamMember,
  ServiceItem,
  PartnershipItem,
  Booking,
  ContactSubmission,
  SocialLink,
  SiteSettings,
  ActivityLog,
  StudioSession,
} from '../src/types';

export interface DatabaseSchema {
  episodes: Episode[];
  guests: Guest[];
  blogs: Blog[];
  testimonials: Testimonial[];
  team: TeamMember[];
  services: ServiceItem[];
  partnerships: PartnershipItem[];
  bookings: Booking[];
  contacts: ContactSubmission[];
  socialLinks: SocialLink[];
  settings: SiteSettings;
  activityLogs: ActivityLog[];
  studioSessions: StudioSession[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

const INITIAL_DB: DatabaseSchema = {
  settings: {
    brandName: 'RISE Pakistan',
    tagline: 'REAL INSPIRING STORIES & EXPERIENCES',
    contactEmail: 'contact@risepakistan.com',
    contactPhone: '+92 300 0000000',
    address: 'Karachi & Islamabad, Pakistan',
    footerAbout:
      'RISE Pakistan connects the corporate sector, technology startups, founders, and professionals through high-impact digital dialogues, personal branding, and strategic PR.',
    stats: {
      videoCount: '420+',
      videoLabel: 'Videos & short-form content',
    },
  },
  socialLinks: [
    {
      id: 'fb-1',
      platform: 'Facebook',
      url: 'https://www.facebook.com/risePakistan2025/',
      icon: 'Facebook',
      active: true,
      order: 1,
    },
    {
      id: 'yt-1',
      platform: 'YouTube',
      url: 'https://www.youtube.com/@RisePakistan-podcast',
      icon: 'Youtube',
      active: true,
      order: 2,
    },
    {
      id: 'ig-1',
      platform: 'Instagram',
      url: 'https://www.instagram.com/rise.pakistanofficial/',
      icon: 'Instagram',
      active: true,
      order: 3,
    },
    {
      id: 'li-1',
      platform: 'LinkedIn',
      url: 'https://pk.linkedin.com/company/rise-pakistan-official',
      icon: 'Linkedin',
      active: true,
      order: 4,
    },
  ],
  team: [
    {
      id: 'team-1',
      name: 'Ahmed Kamal',
      role: 'Founder & Strategic Director',
      department: 'Leadership',
      bio: 'Entrepreneur, operator and investor who is also the CEO of The Tatralink. Ahmed founded RISE Pakistan to give Pakistani innovators and executives global visibility and narrative ownership.',
      photo: '/assets/founder.jpg',
      order: 1,
    },
    {
      id: 'team-2',
      name: 'Javeria Hammad Khan',
      role: 'Host & Lead Interviewer',
      department: 'Host',
      bio: 'Core interviewer and host of RISE Pakistan long-form digital dialogues, uncovering the human grit, strategic pivots, and leadership decisions behind leading organizations.',
      photo: '/assets/host.jpg',
      order: 2,
    },
    {
      id: 'team-3',
      name: 'Syed Waleed ur Rehman',
      role: 'Project Manager',
      department: 'Operations',
      bio: 'Oversees partner coordination, schedule logistics, and strategic broadcast pipelines across nationwide enterprise engagements.',
      order: 3,
    },
    {
      id: 'team-4',
      name: 'M. Ali Zeeshan',
      role: 'Production & Technical Operations Lead',
      department: 'Production',
      bio: 'Directs on-location mobile studio installations, multi-cam capture, sound engineering, and post-production quality assurance.',
      order: 4,
    },
  ],
  services: [
    {
      id: 'srv-1',
      title: 'Strategic PR & Corporate Visibility',
      category: 'PR',
      description: 'Strategic PR, digital brand positioning, and corporate visibility for Pakistan’s business and tech ecosystem.',
      bullets: [
        'Strategic PR communications',
        'Digital brand positioning',
        'Corporate visibility',
        'Professional reputation building'
      ],
      icon: 'Megaphone',
      order: 1,
    },
    {
      id: 'srv-2',
      title: 'Corporate Podcast Production',
      category: 'Production',
      description: 'End-to-end corporate podcast production for enterprises, leaders, and startups sharing their authentic journey.',
      bullets: [
        'Corporate podcast production',
        'Candid executive dialogues',
        'Storytelling and leadership discussions',
        'Multi-platform digital distribution'
      ],
      icon: 'Mic',
      order: 2,
    },
    {
      id: 'srv-3',
      title: 'Mobile Podcast Setup & On-Site Recording',
      category: 'Events',
      description: 'Mobile podcast setup and on-site recording deployed at major industry conventions and business summits.',
      bullets: [
        'Mobile podcast setup',
        'On-site recording',
        'Business summit coverage',
        'Media partnerships'
      ],
      icon: 'Radio',
      order: 3,
    },
    {
      id: 'srv-4',
      title: 'Personal Branding & Media Amplification',
      category: 'Branding',
      description: 'Personal branding and media amplification for entrepreneurs, operators, and industry specialists.',
      bullets: [
        'Personal branding development',
        'Media amplification',
        'Professional reputation building',
        'Long-form digital archive'
      ],
      icon: 'Award',
      order: 4,
    },
  ],
  partnerships: [
    {
      id: 'part-1',
      eventName: 'ITCN Asia',
      edition: '28th ITCN Asia Karachi',
      role: 'Official Podcast & Media Partner',
      description: 'Official on-ground podcast partner conducting executive interviews with tech leaders, ministers, and venture capitalists shaping Pakistan’s digital infrastructure.',
      year: '2024 - 2025',
      location: 'Karachi Expo Centre',
    },
    {
      id: 'part-2',
      eventName: 'World CIO Summit & Awards',
      edition: 'Pakistan Edition',
      role: 'Supporting Media Partner',
      description: 'Established a dedicated physical podcast studio capturing deep-dive dialogues with chief information officers, security chiefs, and enterprise digital architects.',
      year: '2024 - 2025',
      location: 'Karachi & Islamabad',
    },
    {
      id: 'part-3',
      eventName: 'Business Leaders Summit',
      edition: 'National Business Dialogue',
      role: 'Media Partner & Dialogue Host',
      description: 'Facilitating strategic conversations on corporate resilience, macroeconomic hurdles, export development, and managerial excellence.',
      year: '2024',
      location: 'Lahore & Karachi',
    },
    {
      id: 'part-4',
      eventName: "SES Women's Summit",
      edition: 'Empowerment & Enterprise Edition',
      role: 'Media Partner & Storytelling Sponsor',
      description: 'Dedicated media amplification focusing on youth leadership, female founders, and workplace diversity across technology and creative sectors.',
      year: '2024 - 2025',
      location: 'Islamabad',
    },
  ],
  guests: [
    {
      id: 'gst-1',
      name: 'Sanam Pathan',
      slug: 'sanam-pathan',
      photo: '/assets/studio.jpg',
      role: 'Head of Institution',
      organization: 'Beaconhouse International College',
      industry: 'Higher Education & Transnational Qualifications',
      bio: 'Sanam Pathan leads Beaconhouse International College, driving transnational education partnerships and equipping Pakistani scholars with world-class academic frameworks.',
      featured: true,
      episodeCount: 1,
      socialLinks: {
        linkedin: 'https://pk.linkedin.com/company/rise-pakistan-official',
      },
    },
    {
      id: 'gst-2',
      name: 'Ashifa Paracha',
      slug: 'ashifa-paracha',
      photo: '/assets/studio.jpg',
      role: 'Leadership & Industry Specialist',
      organization: 'PDA',
      industry: 'Professional Development & Governance',
      bio: 'Ashifa Paracha brings decades of strategic insight into institutional governance, workplace equity, and professional development architectures across Pakistan.',
      featured: true,
      episodeCount: 1,
      socialLinks: {
        linkedin: 'https://pk.linkedin.com/company/rise-pakistan-official',
      },
    },
    {
      id: 'gst-3',
      name: 'Aisha Yousuf',
      slug: 'aisha-yousuf',
      photo: '/assets/studio.jpg',
      role: 'Founder & Media Strategist',
      organization: 'CatchupwithAisha',
      industry: 'Digital Media & Community Storytelling',
      bio: 'Aisha Yousuf is the founder of CatchupwithAisha, recognized for insightful digital storytelling and fostering dialogue around modern business leadership.',
      featured: true,
      episodeCount: 1,
      socialLinks: {
        linkedin: 'https://pk.linkedin.com/company/rise-pakistan-official',
      },
    },
    {
      id: 'gst-4',
      name: 'Nasir Sheikh',
      slug: 'nasir-sheikh',
      photo: '/assets/studio.jpg',
      role: 'Performance Marketing Expert & Growth Strategist',
      organization: 'Growth Labs',
      industry: 'Digital Marketing & MarTech',
      bio: 'Nasir Sheikh is a seasoned growth operator specializing in high-ROAS performance marketing, customer acquisition funnels, and enterprise CRM scaling.',
      featured: true,
      episodeCount: 1,
      socialLinks: {
        linkedin: 'https://pk.linkedin.com/company/rise-pakistan-official',
      },
    },
    {
      id: 'gst-5',
      name: 'Shoaib Bhatti',
      slug: 'shoaib-bhatti',
      photo: '/assets/studio.jpg',
      role: 'Technology Operator & Enterprise Consultant',
      organization: 'Enterprise Solutions',
      industry: 'Enterprise Technology & Operations',
      bio: 'Shoaib Bhatti consults for high-scale organizations on enterprise systems adoption, digital modernization, and scalable operational models.',
      featured: false,
      episodeCount: 1,
      socialLinks: {
        linkedin: 'https://pk.linkedin.com/company/rise-pakistan-official',
      },
    },
    {
      id: 'gst-6',
      name: 'Kashif Mueed Rabbani',
      slug: 'kashif-mueed-rabbani',
      photo: '/assets/studio.jpg',
      role: 'Corporate Strategist & Commercial Leader',
      organization: 'Strategic Advisory Group',
      industry: 'Corporate Advisory & Investment Strategy',
      bio: 'Kashif Mueed Rabbani guides corporate boards and executive leadership teams through capital structuring, operational turnarounds, and cross-border expansion.',
      featured: false,
      episodeCount: 1,
      socialLinks: {
        linkedin: 'https://pk.linkedin.com/company/rise-pakistan-official',
      },
    },
  ],
  episodes: [
    {
      id: 'ep-1',
      title: 'Transnational Education & Institutional Rigor in Pakistan',
      slug: 'transnational-education-sanam-pathan',
      description: 'In this comprehensive conversation, Sanam Pathan, Head of Institution at Beaconhouse International College, joins Javeria Hammad Khan to unpack how transnational degree programs are democratizing international academic credentials for Pakistani youth, the challenges of university accreditation, and the imperative for industry-aligned curricula.',
      shortDescription: 'Unpacking transnational degree programs, academic accreditation, and industry-aligned curricula with Sanam Pathan.',
      thumbnail: '/assets/studio.jpg',
      guestId: 'gst-1',
      guestName: 'Sanam Pathan',
      guestRole: 'Head of Institution',
      guestOrg: 'Beaconhouse International College',
      category: 'Education & Leadership',
      topics: ['Education', 'Leadership', 'Youth Empowerment', 'Global Standards'],
      youtubeUrl: 'https://www.youtube.com/@RisePakistan-podcast',
      duration: '46:18',
      publishDate: '2025-02-14',
      featured: true,
      tags: ['Beaconhouse', 'Higher Education', 'Leadership', 'Transnational Degrees'],
      status: 'published',
      views: 8420,
    },
    {
      id: 'ep-2',
      title: 'Building Authentic Executive Presence & Professional Standards',
      slug: 'executive-presence-ashifa-paracha',
      description: 'Ashifa Paracha of PDA shares an incisive blueprint on personal accountability, institutional ethics, and how modern executives can cultivate genuine gravitas in high-stakes boardroom environments.',
      shortDescription: 'Ashifa Paracha shares actionable principles on boardroom gravitas, ethical governance, and executive accountability.',
      thumbnail: '/assets/studio.jpg',
      guestId: 'gst-2',
      guestName: 'Ashifa Paracha',
      guestRole: 'Leadership Specialist',
      guestOrg: 'PDA',
      category: 'Workplace Culture',
      topics: ['Governance', 'Workplace Culture', 'Executive Presence', 'Professionalism'],
      youtubeUrl: 'https://www.youtube.com/@RisePakistan-podcast',
      duration: '42:50',
      publishDate: '2025-02-02',
      featured: true,
      tags: ['Workplace', 'PDA', 'Ethics', 'Leadership'],
      status: 'published',
      views: 6310,
    },
    {
      id: 'ep-3',
      title: 'Digital Storytelling, Community Engagement & Media Authenticity',
      slug: 'digital-storytelling-aisha-yousuf',
      description: 'Aisha Yousuf, creator of CatchupwithAisha, breaks down the transformation of Pakistan’s digital creator economy, moving beyond surface vanity metrics to build loyal communities and trusted brand equity.',
      shortDescription: 'Aisha Yousuf details how creators and brands can craft sincere storytelling that builds long-term community value.',
      thumbnail: '/assets/studio.jpg',
      guestId: 'gst-3',
      guestName: 'Aisha Yousuf',
      guestRole: 'Founder',
      guestOrg: 'CatchupwithAisha',
      category: 'Media & Branding',
      topics: ['Digital Media', 'Creator Economy', 'Personal Branding', 'Content Strategy'],
      youtubeUrl: 'https://www.youtube.com/@RisePakistan-podcast',
      duration: '38:15',
      publishDate: '2025-01-20',
      featured: true,
      tags: ['CatchupwithAisha', 'Digital Media', 'Branding', 'Community'],
      status: 'published',
      views: 9540,
    },
    {
      id: 'ep-4',
      title: 'Cracking Performance Marketing, ROAS & Customer Lifecycle Economics',
      slug: 'performance-marketing-nasir-sheikh',
      description: 'Performance Marketing strategist Nasir Sheikh delivers a technical masterclass on paid media arbitrage, attribution models, and retention CRM strategies for Pakistani and regional e-commerce scale-ups.',
      shortDescription: 'Technical deep dive into attribution modelling, paid acquisition, and unit economics with Nasir Sheikh.',
      thumbnail: '/assets/studio.jpg',
      guestId: 'gst-4',
      guestName: 'Nasir Sheikh',
      guestRole: 'Growth Strategist',
      guestOrg: 'Growth Labs',
      category: 'Marketing & CRM',
      topics: ['Marketing', 'E-commerce', 'CRM', 'Unit Economics'],
      youtubeUrl: 'https://www.youtube.com/@RisePakistan-podcast',
      duration: '51:04',
      publishDate: '2025-01-08',
      featured: false,
      tags: ['Performance Marketing', 'Growth', 'Meta Ads', 'CRM'],
      status: 'published',
      views: 7120,
    },
    {
      id: 'ep-5',
      title: 'Architecting Scalable Operations in Emerging Markets',
      slug: 'scalable-operations-shoaib-bhatti',
      description: 'Shoaib Bhatti explores the operational bottlenecks Pakistani enterprises face when transitioning from founder-driven execution to process-driven organizational maturity.',
      shortDescription: 'Shoaib Bhatti examines process maturity, organizational design, and enterprise software execution.',
      thumbnail: '/assets/studio.jpg',
      guestId: 'gst-5',
      guestName: 'Shoaib Bhatti',
      guestRole: 'Enterprise Consultant',
      guestOrg: 'Enterprise Solutions',
      category: 'Business Strategy',
      topics: ['Operations', 'Enterprise Architecture', 'Scaling', 'Management'],
      youtubeUrl: 'https://www.youtube.com/@RisePakistan-podcast',
      duration: '47:30',
      publishDate: '2024-12-22',
      featured: false,
      tags: ['Operations', 'Enterprise', 'Strategy', 'Processes'],
      status: 'published',
      views: 5290,
    },
    {
      id: 'ep-6',
      title: 'Capital Structuring & Macroeconomic Resilience for Local Enterprises',
      slug: 'capital-structuring-kashif-mueed-rabbani',
      description: 'Corporate advisory leader Kashif Mueed Rabbani unpacks fiscal discipline, debt restructuring, and strategic positioning amidst high interest rates and currency fluctuations.',
      shortDescription: 'Kashif Mueed Rabbani explores financial restructuring and risk management during economic volatility.',
      thumbnail: '/assets/studio.jpg',
      guestId: 'gst-6',
      guestName: 'Kashif Mueed Rabbani',
      guestRole: 'Corporate Strategist',
      guestOrg: 'Strategic Advisory Group',
      category: 'Business Strategy',
      topics: ['Finance', 'Capital Markets', 'Macroeconomics', 'Risk Management'],
      youtubeUrl: 'https://www.youtube.com/@RisePakistan-podcast',
      duration: '49:12',
      publishDate: '2024-12-10',
      featured: false,
      tags: ['Finance', 'Macroeconomics', 'Investment', 'Strategy'],
      status: 'published',
      views: 4890,
    },
  ],
  blogs: [
    {
      id: 'blg-1',
      title: 'Why Pakistani Founders Need Strategic Narrative Architecture, Not Just PR',
      slug: 'strategic-narrative-architecture-pakistani-founders',
      excerpt: 'In an increasingly competitive global market, product superiority is rarely enough. Pakistani technology and corporate leaders must claim their strategic narrative before competitors do.',
      content: `### Beyond Generic Press Releases

For too long, corporate communications in Pakistan has defaulted to sterile newspaper press releases: appointments, MoUs signed in hotel ballrooms, and ribbon-cuttings. These announcements register zero emotional resonance and generate near-zero inbound commercial interest.

Today's tier-one investors, global enterprise buyers, and senior technical talent do not read press releases; they listen to founders unpack complex operational decisions on long-form digital podcasts.

### The Power of Radical Candor

When an operator discusses their operational pivots, their early software architecture failures, and the exact unit economics of their market validation, they build unmatched credibility. Credibility is the single highest-leverage currency in emerging market tech ecosystems.

### Media Amplification as Strategic Moat

At RISE Pakistan, we view every conversation as a permanent digital artifact. When an enterprise executive or founder articulates their worldview in our studio, that dialogue becomes:
- An enduring asset for investor due diligence
- A benchmark for prospective employee recruitment
- A syndication source for short-form video insights across LinkedIn and Instagram

The winners of the next decade in Pakistan will be those who master the microphone.`,
      coverImage: '/assets/studio.jpg',
      author: 'Ahmed Kamal',
      category: 'Personal Branding & PR',
      tags: ['PR', 'Founders', 'Storytelling', 'Leadership'],
      publishDate: '2025-02-18',
      readingTime: '5 min read',
      featured: true,
      status: 'published',
    },
    {
      id: 'blg-2',
      title: 'The Evolution of Pakistan’s B2B Tech Ecosystem: Lessons from ITCN Asia',
      slug: 'evolution-pakistan-b2b-tech-itcn-asia',
      excerpt: 'Reflections from the RISE Pakistan studio booth at the 28th ITCN Asia in Karachi: key trends, export potential, and the shift from services to intellectual property.',
      content: `### On Ground at Pakistan’s Largest Tech Convergence

Setting up our on-site broadcast studio at the 28th ITCN Asia in Karachi allowed us to interview over 30 leading founders, IT export council representatives, and overseas delegations across three intensive days.

Three definitive shifts emerged with undeniable clarity:

1. **The Maturation of IT Services into AI-Enhanced Delivery**:
Pakistani software houses are aggressively transitioning from low-cost hourly outsourcing to high-margin specialized AI integration and cloud infrastructure delivery.

2. **Cross-Border Enterprise Trust**:
Overseas enterprise buyers require deep proof of compliance, SOC-2 readiness, and structured executive communication. A polished digital footprint is now non-negotiable.

3. **The Importance of Unified Media Infrastructure**:
Our physical studio booth served as an anchor point where delegates could step directly into high-fidelity microphones and deliver crisp message statements broadcast within hours.`,
      coverImage: '/assets/studio.jpg',
      author: 'Javeria Hammad Khan',
      category: 'Tech & Innovation',
      tags: ['ITCN Asia', 'Technology', 'B2B', 'Exports'],
      publishDate: '2025-01-25',
      readingTime: '6 min read',
      featured: true,
      status: 'published',
    },
    {
      id: 'blg-3',
      title: 'Human Capital & Workplace Culture: Navigating Retention in Volatile Markets',
      slug: 'human-capital-retention-volatile-markets',
      excerpt: 'Examining how forward-thinking Pakistani enterprises are redesigning compensation, psychological safety, and leadership accountability to safeguard vital talent.',
      content: `### The Talent Reality

Inflationary pressures and currency revaluations have created unprecedented talent volatility across Pakistan's knowledge economy. Traditional retention mechanisms are insufficient.

In our dialogues with human resource leaders and enterprise managers, recurring themes surface:

- **Autonomy with Transparent Metrics**: Top talent thrives when outcomes are measured rather than desk hours.
- **Continuous Learning Partnerships**: Partnering with international credential providers gives ambitious team members upward mobility without exiting the firm.
- **Executive Accessibility**: High-performing organizations cultivate candid internal dialogues where executive leaders address operational hurdles without corporate filters.`,
      coverImage: '/assets/studio.jpg',
      author: 'Syed Waleed ur Rehman',
      category: 'Workplace Culture',
      tags: ['HR', 'Culture', 'Leadership', 'Retention'],
      publishDate: '2024-12-28',
      readingTime: '4 min read',
      featured: false,
      status: 'published',
    },
  ],
  testimonials: [],
  bookings: [
    {
      id: 'bk-101',
      name: 'Usman Tariq',
      email: 'usman.tariq@example.pk',
      phone: '+92 321 9876543',
      company: 'FinStack Technologies',
      role: 'Co-Founder & CTO',
      bookingType: 'Podcast Appearance',
      preferredDate: '2026-10-15',
      preferredTime: '14:00',
      timezone: 'Asia/Karachi',
      message: 'We recently closed our institutional seed round for our B2B embedded treasury infrastructure and would love to discuss the technical and regulatory architecture on RISE Pakistan.',
      status: 'pending',
      notes: 'Series Seed CTO; relevant to Fintech & Enterprise Infrastructure theme.',
      createdAt: '2026-09-24T10:30:00Z',
    },
  ],
  contacts: [
    {
      id: 'msg-201',
      name: 'Mariam Farooq',
      email: 'mariam@synergycorp.com',
      phone: '+92 301 5554321',
      company: 'Synergy Holdings',
      inquiryType: 'Corporate Podcast Production',
      message: 'We are exploring launching an internal/external executive interview series for our nationwide group leadership. Please share production packages and studio availability.',
      isRead: false,
      isArchived: false,
      createdAt: '2026-09-24T18:15:00Z',
    },
  ],
  activityLogs: [
    {
      id: 'log-1',
      action: 'SYSTEM_INITIALIZED',
      target: 'RISE Pakistan Platform',
      details: 'Initial database schema and verified seed records established.',
      timestamp: new Date().toISOString(),
      adminEmail: 'system@risepakistan.com',
    },
  ],
  studioSessions: [
    {
      id: 'ses-itcn-2026',
      title: 'Strategic Narrative & Digital Scale in Emerging Markets',
      guestName: 'Sanam Pathan',
      guestRole: 'Head of Institution',
      guestOrg: 'Beaconhouse International College',
      guestEmail: 'sanam.pathan@example.pk',
      hostName: 'Javeria Hammad Khan',
      hostMode: 'human',
      status: 'completed',
      durationSeconds: 2778,
      takeNumber: 1,
      createdAt: '2026-09-23T14:00:00Z',
      inviteToken: 'rise-itcn-7041',
      directorLayout: 'two-shot',
      qualityAssessment: {
        cameraDetected: true,
        micDetected: true,
        speakerDetected: true,
        resolution: '1080p 60fps',
        frameRate: 60,
        exposure: 'optimal',
        noiseLevel: 'clean',
        audioLevel: 82,
        echoDetected: false,
        networkRttMs: 14,
        recommendations: ['Studio lighting balanced', 'Microphone level optimal']
      },
      enhancementJob: {
        id: 'enh-101',
        sessionId: 'ses-itcn-2026',
        stage: 'completed',
        progress: 100,
        statusText: 'AI Video & Audio Enhancement Complete (Identity-Preserving)',
        identityPreserved: true,
        canvasTarget: '4K AI Master',
        startedAt: '2026-09-23T14:48:00Z',
        completedAt: '2026-09-23T14:52:10Z'
      },
      postProduction: {
        suggestedTitles: [
          'Transnational Degree Programs & The Future of Higher Education in Pakistan',
          'Navigating University Accreditation & Industry-Aligned Curricula',
          'Democratizing International Education for Pakistani Scholars'
        ],
        clips: [
          {
            id: 'clip-1',
            sessionId: 'ses-itcn-2026',
            title: 'Why International Degrees Matter in Pakistan',
            hook: 'Pakistan’s top talent no longer needs to leave the country to earn a global credential.',
            duration: '00:54',
            aspectRatio: '9:16',
            timestampRange: '04:12 - 05:06',
            viralRationale: 'High emotional resonance for young professionals and parents seeking global qualifications.',
            status: 'approved'
          },
          {
            id: 'clip-2',
            sessionId: 'ses-itcn-2026',
            title: 'The Accreditation Bottleneck',
            hook: 'The hardest challenge wasn’t teaching—it was aligning transnational frameworks with local regulators.',
            duration: '00:48',
            aspectRatio: '9:16',
            timestampRange: '18:30 - 19:18',
            viralRationale: 'Candid institutional struggle that builders and educators debate heavily.',
            status: 'suggested'
          }
        ],
        socialCopy: {
          linkedin: 'Transnational education is transforming Pakistan’s human capital equation. On the latest episode of RISE Pakistan, Sanam Pathan (Head of Institution, Beaconhouse International College) sits down with Javeria Hammad Khan to share the real story behind institutional accreditation, global degree partnerships, and preparing Pakistani youth for world-class standards.\n\nWatch the full episode on YouTube: @RisePakistan-podcast\n\n#RISEPakistan #HigherEducation #Leadership #Beaconhouse',
          youtube: 'In this comprehensive conversation, Sanam Pathan, Head of Institution at Beaconhouse International College, joins Javeria Hammad Khan to unpack how transnational degree programs are democratizing international academic credentials for Pakistani youth.\n\nTimestamps:\n00:00 - Introduction\n04:12 - Transnational Credentials\n18:30 - Accreditation & Governance\n32:15 - Aligning Curricula with Industry\n44:00 - Closing Thoughts\n\nSubscribe to @RisePakistan-podcast for more executive dialogues.',
          instagram: '“Pakistan’s youth deserve access to world-class academic frameworks without needing to emigrate.” Sanam Pathan on RISE Pakistan. Tap the link in bio to watch the full dialogue. 🎙️🇵🇰',
          tiktok: 'Can Pakistani students get an international degree without leaving the country? Head of Institution Sanam Pathan breaks it down on RISE Pakistan. #RISEPakistan #Podcast #PakistanTech #Education',
          facebook: 'Watch Sanam Pathan unpack transnational education and global standards on RISE Pakistan with host Javeria Hammad Khan.'
        }
      }
    }
  ],
};

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDir();
    this.data = this.load();
  }

  private ensureDir() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const content = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(content) as DatabaseSchema;
        // Cleanse unverified stats & fabricated testimonials from old cached db.json
        if (parsed.settings?.stats && (typeof parsed.settings.stats.videoCount === 'number' || (parsed.settings.stats as any).platformViews)) {
          parsed.settings.stats = INITIAL_DB.settings.stats;
        }
        if (parsed.testimonials && parsed.testimonials.some(t => t.id === 'tst-1' || t.id === 'tst-2')) {
          parsed.testimonials = [];
        }
        if (parsed.services && parsed.services.some(s => s.description.includes('4K') || s.description.includes('proprietary') || s.description.includes('Architecting executive'))) {
          parsed.services = INITIAL_DB.services;
        }
        if (!parsed.studioSessions || parsed.studioSessions.length === 0) {
          parsed.studioSessions = INITIAL_DB.studioSessions;
        }
        this.save(parsed);
        return parsed;
      }
    } catch (err) {
      console.error('Error reading db.json, falling back to initial data:', err);
    }
    this.save(INITIAL_DB);
    return INITIAL_DB;
  }

  public save(newData?: DatabaseSchema): void {
    if (newData) {
      this.data = newData;
    }
    try {
      this.ensureDir();
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write db.json:', err);
    }
  }

  public get(): DatabaseSchema {
    return this.data;
  }

  public logActivity(action: string, target: string, details: string, adminEmail: string = 'admin@risepakistan.com') {
    const log: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action,
      target,
      details,
      timestamp: new Date().toISOString(),
      adminEmail,
    };
    this.data.activityLogs.unshift(log);
    if (this.data.activityLogs.length > 100) {
      this.data.activityLogs.pop();
    }
    this.save();
  }
}

export const db = new DatabaseManager();
