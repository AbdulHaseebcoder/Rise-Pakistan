import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Mic,
  Users,
  FileText,
  Star,
  Calendar,
  Mail,
  Sliders,
  Share2,
  Clock,
  LogOut,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  ExternalLink,
  Lock,
  ChevronRight,
  Shield,
  Loader2,
  Save,
  X,
  Radio,
  Film,
  Download,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';
import {
  Episode,
  Guest,
  Blog,
  Testimonial,
  Booking,
  ContactSubmission,
  ServiceItem,
  PartnershipItem,
  SocialLink,
  SiteSettings,
  ActivityLog,
  StudioSession,
  TeamMember,
} from '../types';

interface AdminDashboardProps {
  onNavigateHome: () => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateHome, onRefreshData }) => {
  // Auth State
  const [token, setToken] = useState<string | null>(localStorage.getItem('rise_admin_token'));
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    'overview' | 'studio' | 'episodes' | 'blogs' | 'guests' | 'team' | 'services' | 'testimonials' | 'bookings' | 'messages' | 'settings' | 'activity'
  >('overview');

  // Data States
  const [metrics, setMetrics] = useState<any>(null);
  const [studioSessions, setStudioSessions] = useState<StudioSession[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [messages, setMessages] = useState<ContactSubmission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal & Form States
  const [isEditingEpisode, setIsEditingEpisode] = useState<Episode | null>(null);
  const [isEditingBlog, setIsEditingBlog] = useState<Blog | null>(null);
  const [isEditingGuest, setIsEditingGuest] = useState<Guest | null>(null);
  const [isEditingTeamMember, setIsEditingTeamMember] = useState<TeamMember | null>(null);
  const [isEditingService, setIsEditingService] = useState<ServiceItem | null>(null);
  const [isEditingTestimonial, setIsEditingTestimonial] = useState<Testimonial | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: string;
    id: string;
    title: string;
    action: () => Promise<void>;
  } | null>(null);

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');

      localStorage.setItem('rise_admin_token', data.token);
      setToken(data.token);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {}
    }
    localStorage.removeItem('rise_admin_token');
    setToken(null);
  };

  // Fetch all admin data
  const fetchData = async () => {
    if (!token) return;
    setLoading(true);
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [mRes, epRes, blRes, gRes, tmRes, srvRes, tRes, bkRes, cRes, logRes, setRes, socRes, stuRes] = await Promise.all([
        fetch('/api/admin/metrics', { headers }),
        fetch('/api/admin/episodes', { headers }),
        fetch('/api/admin/blogs', { headers }),
        fetch('/api/admin/guests', { headers }),
        fetch('/api/admin/team', { headers }),
        fetch('/api/admin/services', { headers }),
        fetch('/api/admin/testimonials', { headers }),
        fetch('/api/admin/bookings', { headers }),
        fetch('/api/admin/contacts', { headers }),
        fetch('/api/admin/activity', { headers }),
        fetch('/api/settings'),
        fetch('/api/social-links'),
        fetch('/api/studio/sessions'),
      ]);

      if (mRes.status === 401) {
        handleLogout();
        return;
      }

      setMetrics(await mRes.json());
      setEpisodes(await epRes.json());
      setBlogs(await blRes.json());
      setGuests(await gRes.json());
      if (tmRes.ok) setTeamMembers(await tmRes.json());
      if (srvRes.ok) setServices(await srvRes.json());
      setTestimonials(await tRes.json());
      setBookings(await bkRes.json());
      setMessages(await cRes.json());
      setActivityLogs(await logRes.json());
      setSettings(await setRes.json());
      setSocialLinks(await socRes.json());
      if (stuRes.ok) setStudioSessions(await stuRes.json());
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setStatusMessage({ text, type });
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // ---------------- Episodes Actions ---------------- //
  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingEpisode || !token) return;

    try {
      const isNew = !isEditingEpisode.id || isEditingEpisode.id.startsWith('new-');
      const url = isNew ? '/api/admin/episodes' : `/api/admin/episodes/${isEditingEpisode.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(isEditingEpisode),
      });

      if (!res.ok) throw new Error('Failed to save episode');

      showNotification(`Episode ${isNew ? 'created' : 'updated'} successfully`);
      setIsEditingEpisode(null);
      fetchData();
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteEpisode = (id: string) => {
    setDeleteConfirm({
      type: 'Episode',
      id,
      title: 'Are you sure you want to permanently delete this broadcast episode?',
      action: async () => {
        try {
          const res = await fetch(`/api/admin/episodes/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to delete episode');
          showNotification('Episode removed');
          fetchData();
          onRefreshData();
        } catch (err: any) {
          showNotification(err.message, 'error');
        }
      },
    });
  };

  // ---------------- Blogs Actions ---------------- //
  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingBlog || !token) return;

    try {
      const isNew = !isEditingBlog.id || isEditingBlog.id.startsWith('new-');
      const url = isNew ? '/api/admin/blogs' : `/api/admin/blogs/${isEditingBlog.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(isEditingBlog),
      });

      if (!res.ok) throw new Error('Failed to save blog post');

      showNotification(`Article ${isNew ? 'published' : 'updated'} successfully`);
      setIsEditingBlog(null);
      fetchData();
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteBlog = (id: string) => {
    setDeleteConfirm({
      type: 'Article',
      id,
      title: 'Are you sure you want to delete this editorial essay?',
      action: async () => {
        try {
          const res = await fetch(`/api/admin/blogs/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to delete article');
          showNotification('Article removed');
          fetchData();
          onRefreshData();
        } catch (err: any) {
          showNotification(err.message, 'error');
        }
      },
    });
  };

  // ---------------- Guests Actions ---------------- //
  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingGuest || !token) return;

    try {
      const isNew = !isEditingGuest.id || isEditingGuest.id.startsWith('new-');
      const url = isNew ? '/api/admin/guests' : `/api/admin/guests/${isEditingGuest.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(isEditingGuest),
      });

      if (!res.ok) throw new Error('Failed to save guest');

      showNotification(`Guest ${isNew ? 'added' : 'updated'}`);
      setIsEditingGuest(null);
      fetchData();
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteGuest = (id: string) => {
    setDeleteConfirm({
      type: 'Guest',
      id,
      title: 'Are you sure you want to delete this guest profile?',
      action: async () => {
        try {
          const res = await fetch(`/api/admin/guests/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to delete guest');
          showNotification('Guest removed');
          fetchData();
          onRefreshData();
        } catch (err: any) {
          showNotification(err.message, 'error');
        }
      },
    });
  };

  // ---------------- Team Member Actions (Section 51) ---------------- //
  const handleSaveTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingTeamMember || !token) return;

    try {
      const isNew = !isEditingTeamMember.id || isEditingTeamMember.id.startsWith('new-');
      const url = isNew ? '/api/admin/team' : `/api/admin/team/${isEditingTeamMember.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(isEditingTeamMember),
      });

      if (!res.ok) throw new Error('Failed to save team member');

      showNotification(`Team member ${isNew ? 'added' : 'updated'}`);
      setIsEditingTeamMember(null);
      fetchData();
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteTeamMember = (id: string) => {
    setDeleteConfirm({
      type: 'Team Member',
      id,
      title: 'Are you sure you want to delete this team member profile?',
      action: async () => {
        try {
          const res = await fetch(`/api/admin/team/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to delete team member');
          showNotification('Team member removed');
          fetchData();
          onRefreshData();
        } catch (err: any) {
          showNotification(err.message, 'error');
        }
      },
    });
  };

  const handleToggleTeamActive = async (member: TeamMember) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: member.active === false ? true : false }),
      });
      if (!res.ok) throw new Error('Failed to toggle active status');
      showNotification(`Team member ${member.active === false ? 'published' : 'unpublished'}`);
      fetchData();
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // ---------------- Services Actions (Priority 5 & 8) ---------------- //
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingService || !token) return;

    try {
      const isNew = !isEditingService.id || isEditingService.id.startsWith('new-');
      const url = isNew ? '/api/admin/services' : `/api/admin/services/${isEditingService.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(isEditingService),
      });

      if (!res.ok) throw new Error('Failed to save service');

      showNotification(`Service ${isNew ? 'added' : 'updated'}`);
      setIsEditingService(null);
      fetchData();
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteService = (id: string) => {
    setDeleteConfirm({
      type: 'Service',
      id,
      title: 'Are you sure you want to delete this business service offering?',
      action: async () => {
        try {
          const res = await fetch(`/api/admin/services/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to delete service');
          showNotification('Service removed');
          fetchData();
          onRefreshData();
        } catch (err: any) {
          showNotification(err.message, 'error');
        }
      },
    });
  };

  // ---------------- Testimonials Actions (Priority 4 & 8) ---------------- //
  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditingTestimonial || !token) return;

    try {
      const isNew = !isEditingTestimonial.id || isEditingTestimonial.id.startsWith('new-');
      const url = isNew ? '/api/admin/testimonials' : `/api/admin/testimonials/${isEditingTestimonial.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(isEditingTestimonial),
      });

      if (!res.ok) throw new Error('Failed to save testimonial');

      showNotification(`Testimonial ${isNew ? 'published' : 'updated'}`);
      setIsEditingTestimonial(null);
      fetchData();
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  const handleDeleteTestimonial = (id: string) => {
    setDeleteConfirm({
      type: 'Testimonial',
      id,
      title: 'Are you sure you want to delete this testimonial?',
      action: async () => {
        try {
          const res = await fetch(`/api/admin/testimonials/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) throw new Error('Failed to delete testimonial');
          showNotification('Testimonial removed');
          fetchData();
          onRefreshData();
        } catch (err: any) {
          showNotification(err.message, 'error');
        }
      },
    });
  };

  // ---------------- Bookings Actions ---------------- //
  const handleUpdateBookingStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      showNotification(`Booking status set to ${status}`);
      fetchData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // ---------------- Contacts Actions ---------------- //
  const handleToggleMessageRead = async (id: string, isRead: boolean) => {
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ isRead: !isRead }),
      });
      if (!res.ok) throw new Error('Failed to update message');
      fetchData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // ---------------- Settings Save ---------------- //
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !token) return;

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to update settings');
      showNotification('Site settings updated');
      fetchData();
      onRefreshData();
    } catch (err: any) {
      showNotification(err.message, 'error');
    }
  };

  // If not authenticated, render Login Screen
  if (!token) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-neutral-950 border border-white/10 space-y-6 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-display font-bold text-white">RISE Portal Login</h2>
            <p className="text-xs text-neutral-400">Restricted administrative access for production operations</p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-950/60 border border-red-500/40 text-red-300 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                Admin Email
              </label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@risepakistan.com"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-wider text-neutral-400 font-semibold mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loginLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In to Dashboard</span>}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 text-center">
            <button
              onClick={onNavigateHome}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              &larr; Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-xs font-medium border flex items-center gap-2 shadow-xl ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200'
              : 'bg-red-950/90 border-red-500 text-red-200'
          }`}
        >
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-neutral-950 border-r border-white/10 flex flex-col justify-between p-6 shrink-0">
        <div className="space-y-6">
          {/* Brand Mark */}
          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div>
              <span className="font-display font-black text-lg text-white">RISE</span>
              <span className="font-display text-emerald-400 text-lg ml-1 font-light">PANEL</span>
              <span className="text-[10px] text-neutral-400 block font-mono">v2.5 CMS</span>
            </div>
            <button
              onClick={onNavigateHome}
              className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-white/5"
              title="View Public Website"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1 text-xs font-medium">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'studio', label: 'RISE Studio', icon: Radio, badge: studioSessions.length },
              { id: 'episodes', label: 'Episodes', icon: Mic, badge: episodes.length },
              { id: 'blogs', label: 'Journal Articles', icon: FileText, badge: blogs.length },
              { id: 'guests', label: 'Guest Roster', icon: Users, badge: guests.length },
              { id: 'team', label: 'Team CMS', icon: Users, badge: teamMembers.length },
              { id: 'services', label: 'Services', icon: Sliders, badge: services.length },
              { id: 'testimonials', label: 'Endorsements', icon: Star, badge: testimonials.length },
              { id: 'bookings', label: 'Session Bookings', icon: Calendar, badge: bookings.filter((b) => b.status === 'pending').length },
              { id: 'messages', label: 'Contact Inquiries', icon: Mail, badge: messages.filter((m) => !m.isRead).length },
              { id: 'settings', label: 'Site Settings', icon: Sliders },
              { id: 'activity', label: 'Activity Logs', icon: Clock },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-black/30 text-white' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer User & Logout */}
        <div className="pt-6 border-t border-white/10 space-y-3">
          <div className="text-[11px] text-neutral-400">
            <span className="block text-white font-medium">RISE Admin</span>
            <span className="font-mono text-[10px] text-emerald-400">Production Console</span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded bg-white/5 hover:bg-red-950/40 text-neutral-300 hover:text-red-400 border border-white/10 text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Top Breadcrumb Header */}
        <div className="flex items-center justify-between pb-8 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-display font-bold text-white capitalize">
              {activeTab} Management
            </h1>
            <p className="text-xs text-neutral-400">
              Manage live production data for the RISE Pakistan web application
            </p>
          </div>
          <button
            onClick={onNavigateHome}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white flex items-center gap-1.5 transition-colors"
          >
            <span>Live Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="pt-8">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && metrics && (
            <div className="space-y-8">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 rounded-xl bg-neutral-900/40 border border-white/10 space-y-2">
                  <span className="text-[11px] text-neutral-400 font-mono uppercase">Broadcasts</span>
                  <div className="text-3xl font-display font-bold text-white">{metrics.totalEpisodes}</div>
                  <div className="text-xs text-emerald-400">{metrics.publishedEpisodes} published</div>
                </div>

                <div className="p-6 rounded-xl bg-neutral-900/40 border border-white/10 space-y-2">
                  <span className="text-[11px] text-neutral-400 font-mono uppercase">Guest Leaders</span>
                  <div className="text-3xl font-display font-bold text-white">{metrics.totalGuests}</div>
                  <div className="text-xs text-neutral-400">In directory</div>
                </div>

                <div className="p-6 rounded-xl bg-neutral-900/40 border border-white/10 space-y-2">
                  <span className="text-[11px] text-neutral-400 font-mono uppercase">Pending Bookings</span>
                  <div className="text-3xl font-display font-bold text-emerald-400">{metrics.pendingBookings}</div>
                  <div className="text-xs text-neutral-400">Require producer review</div>
                </div>

                <div className="p-6 rounded-xl bg-neutral-900/40 border border-white/10 space-y-2">
                  <span className="text-[11px] text-neutral-400 font-mono uppercase">Unread Messages</span>
                  <div className="text-3xl font-display font-bold text-white">{metrics.unreadMessages}</div>
                  <div className="text-xs text-neutral-400">General &amp; PR inquiries</div>
                </div>
              </div>

              {/* Recent Activity Stream */}
              <div className="p-6 rounded-xl bg-neutral-900/20 border border-white/10 space-y-4">
                <h3 className="text-base font-display font-bold text-white">Recent System Activity</h3>
                <div className="space-y-2 text-xs">
                  {activityLogs.slice(0, 6).map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-lg bg-neutral-950 border border-white/5 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="font-mono text-emerald-400 text-[10px] uppercase font-bold mr-2">
                          {log.action}
                        </span>
                        <span className="text-white font-medium">{log.target}</span>
                        <p className="text-neutral-400 text-[11px]">{log.details}</p>
                      </div>
                      <span className="text-[10px] text-neutral-400 font-mono whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 1.5: RISE STUDIO (Requirement 47) */}
          {activeTab === 'studio' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block mb-1">
                    PRODUCTION MANAGEMENT
                  </span>
                  <h2 className="text-xl font-display font-bold text-white">
                    RISE Studio Sessions &amp; Master Stems
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-mono text-neutral-400">
                    {studioSessions.length} sessions tracked
                  </div>
                  <a
                    href="/studio"
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-[0_0_15px_rgba(0,166,81,0.25)]"
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>Launch Host Console</span>
                  </a>
                </div>
              </div>

              {/* Sessions Table */}
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-900/30">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-white/10 font-mono">
                    <tr>
                      <th className="py-3 px-4">Session Title</th>
                      <th className="py-3 px-4">Guest</th>
                      <th className="py-3 px-4">Schedule</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Guest Invite Link</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-sans">
                    {studioSessions.map((s) => (
                      <tr key={s.id} className="hover:bg-white/5">
                        <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                          {s.title}
                          {s.topic && <span className="block text-[11px] text-neutral-400 font-normal truncate">{s.topic}</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-white font-medium">{s.guestName}</span>
                          <span className="block text-[11px] text-neutral-400">{s.guestRole} · {s.guestOrg}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-neutral-300">
                          {s.scheduledDate || 'Today'} · {s.scheduledTime || '14:00'}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                            s.status === 'PUBLISHED'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/50'
                              : s.status === 'completed' || s.status === 'READY_FOR_REVIEW' || s.status === 'APPROVED'
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                              : s.status === 'RECORDING'
                              ? 'bg-rose-950 text-rose-400 border border-rose-500/40 animate-pulse'
                              : 'bg-neutral-800 text-neutral-300 border border-white/10'
                          }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <button
                            onClick={() => {
                              const invite = `${window.location.origin}/studio?invite=${s.inviteToken || s.id}`;
                              navigator.clipboard.writeText(invite);
                              showNotification('Guest invite link copied');
                            }}
                            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 rounded border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer text-[11px]"
                          >
                            <Copy className="w-3 h-3 text-emerald-400" />
                            <span>Copy Link</span>
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          {s.status !== 'PUBLISHED' && (
                            <button
                              onClick={async () => {
                                try {
                                  const res = await fetch(`/api/studio/sessions/${s.id}/publish`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({}),
                                  });
                                  if (res.ok) {
                                    showNotification('Session published to public Episodes catalog!');
                                    fetchData();
                                    onRefreshData();
                                  }
                                } catch (e) {
                                  showNotification('Publishing failed', 'error');
                                }
                              }}
                              className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 rounded text-[11px] font-mono transition-colors cursor-pointer"
                            >
                              Publish
                            </button>
                          )}
                          <a
                            href={`/studio?session=${s.id}`}
                            className="text-emerald-400 hover:text-emerald-300 font-mono text-xs font-semibold inline-block"
                          >
                            Console &rarr;
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Multi-Track Recordings & AI Clips Showcase for Completed Sessions */}
              {studioSessions.filter((s) => s.postProduction?.clips).length > 0 && (
                <div className="space-y-4 pt-4 border-t border-white/10">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 block">
                    AI CLIPS APPROVAL PIPELINE
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studioSessions
                      .flatMap((s) => (s.postProduction?.clips || []).map((c) => ({ ...c, sessionTitle: s.title, hostSessionId: s.id })))
                      .map((clip: any) => (
                        <div key={clip.id} className="p-5 rounded-xl bg-neutral-900/60 border border-white/10 space-y-2">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-emerald-400 font-bold uppercase">{clip.aspectRatio} SHORT · {clip.duration}</span>
                            <span className={`px-2 py-0.5 rounded uppercase font-semibold ${
                              clip.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                            }`}>
                              {clip.status}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white">{clip.title}</h4>
                          <p className="text-xs text-neutral-300 italic">&ldquo;{clip.hook}&rdquo;</p>
                          <p className="text-[11px] text-neutral-400">{clip.viralRationale}</p>
                          <div className="pt-2 flex items-center gap-2">
                            <button
                              onClick={async () => {
                                await fetch(`/api/studio/sessions/${clip.hostSessionId}/clips/${clip.id}/status`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'approved' }),
                                });
                                showNotification('Clip candidate approved for syndication');
                                fetchData();
                              }}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-mono uppercase font-semibold cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={async () => {
                                await fetch(`/api/studio/sessions/${clip.hostSessionId}/clips/${clip.id}/status`, {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ status: 'rejected' }),
                                });
                                showNotification('Clip rejected');
                                fetchData();
                              }}
                              className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] font-mono uppercase cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EPISODES */}
          {activeTab === 'episodes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  {episodes.length} recorded dialogues
                </span>
                <button
                  onClick={() =>
                    setIsEditingEpisode({
                      id: `new-${Date.now()}`,
                      title: '',
                      slug: '',
                      description: '',
                      shortDescription: '',
                      thumbnail: '/assets/studio.jpg',
                      guestName: '',
                      guestRole: '',
                      guestOrg: '',
                      category: 'Leadership & Strategy',
                      topics: ['Leadership'],
                      youtubeUrl: 'https://www.youtube.com/@RisePakistan-podcast',
                      duration: '45:00',
                      publishDate: new Date().toISOString().split('T')[0],
                      featured: false,
                      tags: [],
                      status: 'published',
                    })
                  }
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Episode</span>
                </button>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-900/20">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Guest</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Duration</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {episodes.map((ep) => (
                      <tr key={ep.id} className="hover:bg-white/5">
                        <td className="py-3 px-4 font-medium text-white max-w-xs truncate">
                          {ep.title}
                          {ep.featured && (
                            <span className="ml-2 text-[10px] text-emerald-400 border border-emerald-500/40 px-1.5 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-300">{ep.guestName}</td>
                        <td className="py-3 px-4 text-neutral-400">{ep.category}</td>
                        <td className="py-3 px-4 font-mono text-neutral-400">{ep.duration}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                              ep.status === 'published'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {ep.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setIsEditingEpisode(ep)}
                            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-white/10"
                            title="Edit Episode"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteEpisode(ep.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-white/10"
                            title="Delete Episode"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: BLOGS */}
          {activeTab === 'blogs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">{blogs.length} published essays</span>
                <button
                  onClick={() =>
                    setIsEditingBlog({
                      id: `new-${Date.now()}`,
                      title: '',
                      slug: '',
                      excerpt: '',
                      content: '',
                      coverImage: '/assets/studio.jpg',
                      author: 'Ahmed Kamal',
                      category: 'Personal Branding & PR',
                      tags: ['PR', 'Leadership'],
                      publishDate: new Date().toISOString().split('T')[0],
                      readingTime: '5 min read',
                      featured: false,
                      status: 'published',
                    })
                  }
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Write Article</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-neutral-900/20">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Title</th>
                      <th className="py-3 px-4">Author</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {blogs.map((b) => (
                      <tr key={b.id} className="hover:bg-white/5">
                        <td className="py-3 px-4 font-medium text-white max-w-xs truncate">{b.title}</td>
                        <td className="py-3 px-4 text-neutral-300">{b.author}</td>
                        <td className="py-3 px-4 text-neutral-400">{b.category}</td>
                        <td className="py-3 px-4 text-neutral-400">{b.publishDate}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <button
                            onClick={() => setIsEditingBlog(b)}
                            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-white/10"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(b.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-white/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: GUESTS */}
          {activeTab === 'guests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">{guests.length} guest leaders</span>
                <button
                  onClick={() =>
                    setIsEditingGuest({
                      id: `new-${Date.now()}`,
                      name: '',
                      slug: '',
                      photo: '/assets/studio.jpg',
                      role: '',
                      organization: '',
                      industry: 'Technology',
                      bio: '',
                      featured: false,
                    })
                  }
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Guest</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guests.map((g) => (
                  <div
                    key={g.id}
                    className="p-5 rounded-xl border border-white/10 bg-neutral-900/30 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-display font-bold text-white">{g.name}</h4>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setIsEditingGuest(g)}
                            className="p-1 text-neutral-400 hover:text-white"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(g.id)}
                            className="p-1 text-neutral-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-emerald-400">{g.role}</p>
                      <p className="text-xs text-neutral-400">{g.organization}</p>
                      <p className="text-xs text-neutral-300 line-clamp-2">{g.bio}</p>
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">{g.industry}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4.5: TEAM CMS (SECTION 51) */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-display font-bold text-white">Leadership &amp; Production Team</h3>
                  <p className="text-xs text-neutral-400">
                    Manage team dossiers, public profile bios, executive roles, and broadcast associations.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setIsEditingTeamMember({
                      id: `new-${Date.now()}`,
                      name: '',
                      role: '',
                      department: 'Leadership',
                      shortBio: '',
                      bio: '',
                      fullBio: '',
                      photo: '/assets/host.jpg',
                      email: '',
                      linkedIn: '',
                      instagram: '',
                      website: '',
                      order: teamMembers.length + 1,
                      featured: true,
                      active: true,
                    })
                  }
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Team Member</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map((tm) => (
                  <div
                    key={tm.id}
                    className="p-5 rounded-xl border border-white/10 bg-neutral-900/40 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={tm.photo || '/assets/host.jpg'}
                            alt={tm.name}
                            className="w-12 h-12 rounded-xl object-cover border border-white/10 bg-neutral-950 shrink-0"
                          />
                          <div>
                            <h4 className="text-sm font-display font-bold text-white">{tm.name}</h4>
                            <p className="text-xs text-emerald-400">{tm.role}</p>
                            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                              {tm.department} · Order: #{tm.order}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => setIsEditingTeamMember(tm)}
                            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-white/10 transition-colors"
                            title="Edit Dossier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTeamMember(tm.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-white/10 transition-colors"
                            title="Remove Member"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed">
                        {tm.shortBio || tm.bio}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                            tm.active !== false
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/40'
                              : 'bg-neutral-800 text-neutral-400'
                          }`}
                        >
                          {tm.active !== false ? 'Published' : 'Hidden'}
                        </span>
                        {tm.featured && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-300 border border-amber-500/30">
                            Featured
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleTeamActive(tm)}
                        className="text-xs text-neutral-400 hover:text-white underline cursor-pointer"
                      >
                        {tm.active !== false ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: SERVICES (Priority 5 & 8: Editable from CMS) */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  {services.length} business service offerings
                </span>
                <button
                  onClick={() =>
                    setIsEditingService({
                      id: `new-${Date.now()}`,
                      title: '',
                      category: 'PR',
                      description: '',
                      bullets: [''],
                      icon: 'Megaphone',
                      order: services.length + 1,
                    })
                  }
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Service</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((srv) => (
                  <div
                    key={srv.id}
                    className="p-6 rounded-xl border border-white/10 bg-neutral-900/30 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                          {srv.category}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setIsEditingService(srv)}
                            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-white/10"
                            title="Edit Service"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-1.5 text-neutral-400 hover:text-red-400 rounded hover:bg-white/10"
                            title="Delete Service"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-lg font-display font-bold text-white">{srv.title}</h4>
                      <p className="text-xs text-neutral-300 leading-relaxed">{srv.description}</p>

                      <ul className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-neutral-400">
                        {srv.bullets.map((b, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: TESTIMONIALS (Priority 4 & 8: Authentic Endorsements) */}
          {activeTab === 'testimonials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  {testimonials.length} verified endorsements
                </span>
                <button
                  onClick={() =>
                    setIsEditingTestimonial({
                      id: `new-${Date.now()}`,
                      name: '',
                      role: '',
                      company: '',
                      type: 'guest',
                      quote: '',
                      rating: 5,
                      featured: true,
                    })
                  }
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Testimonial</span>
                </button>
              </div>

              {testimonials.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {testimonials.map((t) => (
                    <div
                      key={t.id}
                      className="p-6 rounded-xl border border-white/10 bg-neutral-900/30 flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                            {t.type}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setIsEditingTestimonial(t)}
                              className="p-1.5 text-neutral-400 hover:text-white"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTestimonial(t.id)}
                              className="p-1.5 text-neutral-400 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-300 italic leading-relaxed">
                          &ldquo;{t.quote}&rdquo;
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5">
                        <h4 className="text-sm font-semibold text-white">{t.name}</h4>
                        <p className="text-xs text-neutral-400">
                          {t.role}, {t.company}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 rounded-xl border border-white/10 bg-neutral-900/20 text-center space-y-3">
                  <Star className="w-8 h-8 text-neutral-500 mx-auto" />
                  <h4 className="text-sm font-semibold text-white">
                    Authentic guest and partner testimonials will appear here.
                  </h4>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto">
                    No mock or fabricated testimonials are currently published. Click &quot;Add Testimonial&quot; above to enter genuine reflections from guests and summit partners.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-6">
              <span className="text-xs text-neutral-400">
                {bookings.length} total scheduled requests
              </span>

              <div className="space-y-4">
                {bookings.map((bk) => (
                  <div
                    key={bk.id}
                    className="p-6 rounded-xl border border-white/10 bg-neutral-900/30 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-display font-bold text-white">{bk.name}</h4>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                              bk.status === 'confirmed'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : bk.status === 'pending'
                                ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                : 'bg-neutral-800 text-neutral-400'
                            }`}
                          >
                            {bk.status}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-400">
                          {bk.role} at {bk.company} · {bk.email} · {bk.phone}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={bk.status}
                          onChange={(e) => handleUpdateBookingStatus(bk.id, e.target.value)}
                          className="bg-neutral-950 border border-white/10 rounded px-2.5 py-1 text-xs text-white outline-none"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="rescheduled">Rescheduled</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-neutral-950 border border-white/5 text-xs text-neutral-300">
                      <div className="font-semibold text-emerald-400 mb-1">
                        {bk.bookingType} · Preferred: {bk.preferredDate} at {bk.preferredTime}
                      </div>
                      <p>{bk.message || 'No additional notes provided.'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: CONTACT INQUIRIES */}
          {activeTab === 'messages' && (
            <div className="space-y-4">
              <span className="text-xs text-neutral-400">{messages.length} messages received</span>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-6 rounded-xl border space-y-3 transition-colors ${
                    msg.isRead
                      ? 'bg-neutral-900/20 border-white/5 opacity-80'
                      : 'bg-neutral-900/60 border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        {msg.name} ({msg.inquiryType})
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {msg.email} · {msg.phone} · {msg.company}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleMessageRead(msg.id, msg.isRead)}
                      className="text-xs text-emerald-400 underline cursor-pointer"
                    >
                      {msg.isRead ? 'Mark as Unread' : 'Mark as Read'}
                    </button>
                  </div>
                  <p className="text-xs text-neutral-300 whitespace-pre-line leading-relaxed">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 7: SETTINGS */}
          {activeTab === 'settings' && settings && (
            <form onSubmit={handleSaveSettings} className="max-w-2xl space-y-6">
              <div className="space-y-4 p-6 rounded-xl border border-white/10 bg-neutral-900/30">
                <h3 className="text-base font-display font-bold text-white">Site Identity &amp; Contact</h3>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={settings.brandName}
                    onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Footer About Text
                  </label>
                  <textarea
                    rows={3}
                    value={settings.footerAbout}
                    onChange={(e) => setSettings({ ...settings, footerAbout: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded text-xs text-white resize-none"
                  />
                </div>
              </div>

              {/* RISE AI SETTINGS (SECTION 60) */}
              <div className="space-y-4 p-6 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <span>RISE AI Voice &amp; Persona Configuration</span>
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Configure the single persistent voice persona, speaking rate, and conversational style.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                    Persistent Identity
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                      Persistent Voice ID *
                    </label>
                    <select
                      value={settings.riseAiSettings?.voiceId || 'Aoede'}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          riseAiSettings: {
                            ...(settings.riseAiSettings || {
                              language: 'en-US',
                              speakingStyle: 'Refined, calm, confident, editorial digital concierge',
                              responseLength: 'concise',
                              personalityInstructions: '',
                              welcomeMessage: '',
                            }),
                            voiceId: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded text-xs text-white outline-none"
                    >
                      <option value="Aoede">Aoede (Refined, Confident, Sophisticated Female Voice)</option>
                      <option value="Kore">Kore (Warm, Professional, Expressive)</option>
                      <option value="Puck">Puck (Energetic, Articulate, Dynamic)</option>
                      <option value="Charon">Charon (Deep, Authoritative Anchorman Voice)</option>
                      <option value="Fenrir">Fenrir (Calm, Measured Executive Tone)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                      Spoken Response Length
                    </label>
                    <select
                      value={settings.riseAiSettings?.responseLength || 'concise'}
                      onChange={(e) =>
                        setSettings({
                          ...settings,
                          riseAiSettings: {
                            ...(settings.riseAiSettings || {
                              voiceId: 'Aoede',
                              language: 'en-US',
                              speakingStyle: 'Refined, calm, confident, editorial digital concierge',
                              personalityInstructions: '',
                              welcomeMessage: '',
                            }),
                            responseLength: e.target.value as any,
                          },
                        })
                      }
                      className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded text-xs text-white outline-none"
                    >
                      <option value="concise">Concise (1–3 Natural Sentences, Low Latency)</option>
                      <option value="balanced">Balanced (2–4 Sentences with Context)</option>
                      <option value="detailed">Detailed (Comprehensive Spoken Overview)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Speaking Style / Tone
                  </label>
                  <input
                    type="text"
                    value={settings.riseAiSettings?.speakingStyle || 'Refined, calm, confident, editorial digital concierge'}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        riseAiSettings: {
                          ...(settings.riseAiSettings || {
                            voiceId: 'Aoede',
                            language: 'en-US',
                            responseLength: 'concise',
                            personalityInstructions: '',
                            welcomeMessage: '',
                          }),
                          speakingStyle: e.target.value,
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-400 mb-1">
                    Personality Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={settings.riseAiSettings?.personalityInstructions || ''}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        riseAiSettings: {
                          ...(settings.riseAiSettings || {
                            voiceId: 'Aoede',
                            language: 'en-US',
                            speakingStyle: 'Refined, calm, confident, editorial digital concierge',
                            responseLength: 'concise',
                            welcomeMessage: '',
                          }),
                          personalityInstructions: e.target.value,
                        },
                      })
                    }
                    placeholder="Personality guidelines for RISE AI..."
                    className="w-full px-3 py-2 bg-neutral-950 border border-white/10 rounded text-xs text-white resize-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Save Settings
              </button>
            </form>
          )}

          {/* TAB 8: ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <span className="text-xs text-neutral-400">Audit trail of administrative actions</span>
              <div className="space-y-2">
                {activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-white/5 bg-neutral-900/30 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-mono text-emerald-400 text-[10px] uppercase font-bold mr-2">
                        {log.action}
                      </span>
                      <span className="text-white font-medium">{log.target}</span>
                      <p className="text-neutral-400 text-xs mt-0.5">{log.details}</p>
                    </div>
                    <div className="text-right text-[11px] text-neutral-400 font-mono">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span className="block text-neutral-400">{log.adminEmail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ----------------- EPISODE EDIT MODAL ----------------- */}
      {isEditingEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-display font-bold text-white">
                {isEditingEpisode.id.startsWith('new-') ? 'Create New Episode' : 'Edit Episode'}
              </h3>
              <button onClick={() => setIsEditingEpisode(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEpisode} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={isEditingEpisode.title}
                  onChange={(e) => setIsEditingEpisode({ ...isEditingEpisode, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Guest Name *</label>
                  <input
                    type="text"
                    required
                    value={isEditingEpisode.guestName}
                    onChange={(e) => setIsEditingEpisode({ ...isEditingEpisode, guestName: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Guest Organization *</label>
                  <input
                    type="text"
                    required
                    value={isEditingEpisode.guestOrg}
                    onChange={(e) => setIsEditingEpisode({ ...isEditingEpisode, guestOrg: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={isEditingEpisode.category}
                    onChange={(e) => setIsEditingEpisode({ ...isEditingEpisode, category: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Duration</label>
                  <input
                    type="text"
                    value={isEditingEpisode.duration}
                    onChange={(e) => setIsEditingEpisode({ ...isEditingEpisode, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Status</label>
                  <select
                    value={isEditingEpisode.status}
                    onChange={(e) => setIsEditingEpisode({ ...isEditingEpisode, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">YouTube URL</label>
                <input
                  type="text"
                  value={isEditingEpisode.youtubeUrl}
                  onChange={(e) => setIsEditingEpisode({ ...isEditingEpisode, youtubeUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Full Description</label>
                <textarea
                  rows={4}
                  value={isEditingEpisode.description}
                  onChange={(e) => setIsEditingEpisode({ ...isEditingEpisode, description: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={isEditingEpisode.featured}
                  onChange={(e) => setIsEditingEpisode({ ...isEditingEpisode, featured: e.target.checked })}
                />
                <label htmlFor="featuredCheck" className="text-neutral-300">
                  Feature this episode on homepage
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditingEpisode(null)}
                  className="px-4 py-2 bg-white/5 rounded text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded"
                >
                  Save Episode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- GUEST EDIT MODAL ----------------- */}
      {isEditingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-neutral-950 border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-display font-bold text-white">
                {isEditingGuest.id.startsWith('new-') ? 'Add Guest Profile' : 'Edit Guest'}
              </h3>
              <button onClick={() => setIsEditingGuest(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGuest} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={isEditingGuest.name}
                  onChange={(e) => setIsEditingGuest({ ...isEditingGuest, name: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Role / Designation *</label>
                  <input
                    type="text"
                    required
                    value={isEditingGuest.role}
                    onChange={(e) => setIsEditingGuest({ ...isEditingGuest, role: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Organization *</label>
                  <input
                    type="text"
                    required
                    value={isEditingGuest.organization}
                    onChange={(e) => setIsEditingGuest({ ...isEditingGuest, organization: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Industry</label>
                <input
                  type="text"
                  value={isEditingGuest.industry}
                  onChange={(e) => setIsEditingGuest({ ...isEditingGuest, industry: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Executive Bio</label>
                <textarea
                  rows={4}
                  value={isEditingGuest.bio}
                  onChange={(e) => setIsEditingGuest({ ...isEditingGuest, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditingGuest(null)}
                  className="px-4 py-2 bg-white/5 rounded text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded"
                >
                  Save Guest
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ----------------- BLOG EDIT MODAL ----------------- */}
      {isEditingBlog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-2xl bg-neutral-950 border border-white/10 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-lg font-display font-bold text-white">
                {isEditingBlog.id.startsWith('new-') ? 'Write New Article' : 'Edit Article'}
              </h3>
              <button onClick={() => setIsEditingBlog(null)} className="text-neutral-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={isEditingBlog.title}
                  onChange={(e) => setIsEditingBlog({ ...isEditingBlog, title: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Author</label>
                  <input
                    type="text"
                    value={isEditingBlog.author}
                    onChange={(e) => setIsEditingBlog({ ...isEditingBlog, author: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Category</label>
                  <input
                    type="text"
                    value={isEditingBlog.category}
                    onChange={(e) => setIsEditingBlog({ ...isEditingBlog, category: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Excerpt / Summary</label>
                <textarea
                  rows={2}
                  value={isEditingBlog.excerpt}
                  onChange={(e) => setIsEditingBlog({ ...isEditingBlog, excerpt: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Essay Content (Markdown)</label>
                <textarea
                  rows={8}
                  value={isEditingBlog.content}
                  onChange={(e) => setIsEditingBlog({ ...isEditingBlog, content: e.target.value })}
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white resize-none font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditingBlog(null)}
                  className="px-4 py-2 bg-white/5 rounded text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded"
                >
                  Save &amp; Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TEAM MEMBER MODAL (SECTION 51) */}
      {isEditingTeamMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl bg-neutral-950 border border-white/10 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="text-base font-display font-bold text-white">
                {isEditingTeamMember.id.startsWith('new-') ? 'Add Team Member Dossier' : 'Edit Team Member Dossier'}
              </h3>
              <button
                onClick={() => setIsEditingTeamMember(null)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamMember} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={isEditingTeamMember.name}
                    onChange={(e) => setIsEditingTeamMember({ ...isEditingTeamMember, name: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Executive Role *</label>
                  <input
                    type="text"
                    required
                    value={isEditingTeamMember.role}
                    onChange={(e) => setIsEditingTeamMember({ ...isEditingTeamMember, role: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Department *</label>
                  <select
                    value={isEditingTeamMember.department}
                    onChange={(e) => setIsEditingTeamMember({ ...isEditingTeamMember, department: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  >
                    <option value="Leadership">Leadership</option>
                    <option value="Host">Host &amp; Interviewer</option>
                    <option value="Operations">Operations &amp; Logistics</option>
                    <option value="Production">Production &amp; Engineering</option>
                    <option value="Editorial">Editorial &amp; Content</option>
                    <option value="AI/Technology">AI &amp; Media Technology</option>
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={isEditingTeamMember.order}
                    onChange={(e) => setIsEditingTeamMember({ ...isEditingTeamMember, order: parseInt(e.target.value, 10) || 1 })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Profile Photo URL</label>
                <input
                  type="text"
                  value={isEditingTeamMember.photo || ''}
                  onChange={(e) => setIsEditingTeamMember({ ...isEditingTeamMember, photo: e.target.value })}
                  placeholder="/assets/founder.jpg or https://..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Email</label>
                  <input
                    type="email"
                    value={isEditingTeamMember.email || ''}
                    onChange={(e) => setIsEditingTeamMember({ ...isEditingTeamMember, email: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">LinkedIn URL</label>
                  <input
                    type="text"
                    value={isEditingTeamMember.linkedIn || ''}
                    onChange={(e) => setIsEditingTeamMember({ ...isEditingTeamMember, linkedIn: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-400 mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={isEditingTeamMember.instagram || ''}
                    onChange={(e) => setIsEditingTeamMember({ ...isEditingTeamMember, instagram: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 mb-1">Website URL</label>
                  <input
                    type="text"
                    value={isEditingTeamMember.website || ''}
                    onChange={(e) => setIsEditingTeamMember({ ...isEditingTeamMember, website: e.target.value })}
                    className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Short Summary (1-2 sentences)</label>
                <textarea
                  rows={2}
                  value={isEditingTeamMember.shortBio || isEditingTeamMember.bio}
                  onChange={(e) =>
                    setIsEditingTeamMember({
                      ...isEditingTeamMember,
                      shortBio: e.target.value,
                      bio: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white resize-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1">Full Executive Bio</label>
                <textarea
                  rows={4}
                  value={isEditingTeamMember.fullBio || ''}
                  onChange={(e) => setIsEditingTeamMember({ ...isEditingTeamMember, fullBio: e.target.value })}
                  placeholder="Detailed background and career trajectory..."
                  className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded text-white resize-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isEditingTeamMember.active !== false}
                    onChange={(e) => setIsEditingTeamMember({ ...isEditingTeamMember, active: e.target.checked })}
                  />
                  <span>Active (Visible on public site)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={Boolean(isEditingTeamMember.featured)}
                    onChange={(e) => setIsEditingTeamMember({ ...isEditingTeamMember, featured: e.target.checked })}
                  />
                  <span>Featured Member</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsEditingTeamMember(null)}
                  className="px-4 py-2 bg-white/5 rounded text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded"
                >
                  Save Dossier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-modal-backdrop">
          <div className="w-full max-w-md bg-neutral-950 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 animate-modal-card">
            <h3 className="text-lg font-display font-bold text-white">Confirm Removal</h3>
            <p className="text-sm text-neutral-300 leading-relaxed">{deleteConfirm.title}</p>
            <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-semibold text-neutral-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  const act = deleteConfirm.action;
                  setDeleteConfirm(null);
                  await act();
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-lg text-xs font-semibold text-white transition-colors cursor-pointer shadow-lg shadow-rose-950/30"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
