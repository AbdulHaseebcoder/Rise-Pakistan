import React, { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Clock, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Sparkles, Building2, User, Check } from 'lucide-react';
import { SiteSettings } from '../types';
import { AnimatedHeading, AnimatedText } from '../components/AnimatedText';

interface ContactPageProps {
  settings?: SiteSettings;
  onOpenAi: () => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings, onOpenAi }) => {
  const [activeTab, setActiveTab] = useState<'booking' | 'message'>('booking');

  // 5-Step Guided Booking Flow (Requirement 17)
  // Step 1: Choose inquiry type
  // Step 2: Choose preferred date & time
  // Step 3: Provide contact information
  // Step 4: Review
  // Step 5: Confirm
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const [bookingForm, setBookingForm] = useState({
    bookingType: 'Podcast Appearance',
    preferredDate: '',
    preferredTime: '14:00',
    timezone: 'Asia/Karachi (PKT)',
    name: '',
    email: '',
    phone: '',
    company: '',
    role: '',
    message: '',
  });

  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBookingId, setConfirmedBookingId] = useState('');

  // General Message State
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    inquiryType: 'General Inquiry',
    message: '',
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  const inquiryTypes = [
    {
      id: 'Podcast Appearance',
      title: 'Podcast Appearance',
      subtitle: 'Executive dialogue with Javeria Hammad Khan',
      details: 'Studio recording in Karachi or Islamabad covering your founder journey or corporate milestones.',
    },
    {
      id: 'Corporate Podcast Production',
      title: 'Corporate Podcast Production',
      subtitle: 'Branded audio & video series for enterprises',
      details: 'End-to-end production, script development, and distribution for company leadership teams.',
    },
    {
      id: 'Mobile Studio Booth',
      title: 'Mobile Studio Setup',
      subtitle: 'On-site summit & expo installation',
      details: 'Turnkey mobile podcast setup deployed at national conventions (e.g. ITCN Asia, World CIO Summit).',
    },
    {
      id: 'Strategic Corporate PR',
      title: 'Strategic Corporate PR',
      subtitle: 'Executive visibility & digital brand positioning',
      details: 'High-impact thought leadership, media placement, and brand narrative alignment.',
    },
  ];

  const handleBookingSubmit = async () => {
    setBookingLoading(true);
    setBookingError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit booking');
      }

      const result = await res.json();
      setConfirmedBookingId(result.booking?.id || `bk-${Date.now()}`);
      setBookingStep(5); // Move to Step 5: Confirm
    } catch (err: any) {
      setBookingError(err.message || 'Network error');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setContactSuccess(true);
      setContactForm({
        name: '',
        email: '',
        phone: '',
        company: '',
        inquiryType: 'General Inquiry',
        message: '',
      });
    } catch (err: any) {
      setContactError(err.message || 'Network error');
    } finally {
      setContactLoading(false);
    }
  };

  const resetBookingFlow = () => {
    setBookingStep(1);
    setConfirmedBookingId('');
    setBookingForm({
      bookingType: 'Podcast Appearance',
      preferredDate: '',
      preferredTime: '14:00',
      timezone: 'Asia/Karachi (PKT)',
      name: '',
      email: '',
      phone: '',
      company: '',
      role: '',
      message: '',
    });
  };

  return (
    <div className="min-h-screen bg-black text-white pt-28 pb-20 px-6 md:px-12 selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="max-w-5xl mx-auto space-y-14">
        {/* Header */}
        <div className="space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-emerald-400 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>EXECUTIVE DESK &amp; SCHEDULING</span>
          </div>
          <AnimatedHeading as="h1" className="text-4xl sm:text-6xl font-display font-extrabold text-white tracking-tight leading-tight">
            Connect With RISE
          </AnimatedHeading>
          <AnimatedText className="text-base text-neutral-300 leading-relaxed font-normal">
            Schedule an executive recording dialogue at our Karachi or Islamabad studios, reserve an on-site mobile
            broadcast booth for your industry convention, or connect with our editorial directors.
          </AnimatedText>
        </div>

        {/* Tab Switcher: Guided Booking Flow vs General Message */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('booking')}
            className={`text-xs px-5 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'booking'
                ? 'bg-white text-black shadow-lg'
                : 'bg-white/5 hover:bg-white/10 text-neutral-300'
            }`}
          >
            Guided Session Booking
          </button>
          <button
            onClick={() => setActiveTab('message')}
            className={`text-xs px-5 py-2.5 rounded-lg font-semibold transition-all cursor-pointer ${
              activeTab === 'message'
                ? 'bg-white text-black shadow-lg'
                : 'bg-white/5 hover:bg-white/10 text-neutral-300'
            }`}
          >
            General Inquiries
          </button>
        </div>

        {/* =========================================================================
            GUIDED 5-STEP BOOKING FLOW (REQUIREMENT 17)
            ========================================================================= */}
        {activeTab === 'booking' && (
          <div className="space-y-8">
            {/* Step Progress Tracker */}
            <div className="border border-white/10 bg-neutral-950/60 rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span className="text-white font-semibold uppercase tracking-wider">
                  STEP 0{bookingStep} OF 05
                </span>
                <span className="text-emerald-400 uppercase tracking-widest">
                  {bookingStep === 1
                    ? 'CHOOSE INQUIRY TYPE'
                    : bookingStep === 2
                    ? 'PREFERRED DATE & TIME'
                    : bookingStep === 3
                    ? 'CONTACT INFORMATION'
                    : bookingStep === 4
                    ? 'REVIEW SUMMARY'
                    : 'CONFIRMED'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-4 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${(bookingStep / 5) * 100}%` }}
                />
              </div>

              {/* Step Markers */}
              <div className="hidden sm:grid grid-cols-5 gap-2 mt-4 text-[11px] font-mono text-center">
                {['Inquiry', 'Schedule', 'Details', 'Review', 'Confirmed'].map((s, idx) => (
                  <span
                    key={s}
                    className={`${
                      bookingStep === idx + 1
                        ? 'text-emerald-400 font-bold'
                        : bookingStep > idx + 1
                        ? 'text-white'
                        : 'text-neutral-500'
                    }`}
                  >
                    0{idx + 1}. {s}
                  </span>
                ))}
              </div>
            </div>

            {bookingError && (
              <div className="p-4 bg-red-950/60 border border-red-500/40 text-red-200 text-xs rounded-xl">
                {bookingError}
              </div>
            )}

            {/* STEP 1: Choose Inquiry Type */}
            {bookingStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Select Your Engagement Type</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Choose the broadcast or production service tailored to your objectives.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {inquiryTypes.map((type) => {
                    const isSelected = bookingForm.bookingType === type.id;
                    return (
                      <div
                        key={type.id}
                        onClick={() => setBookingForm({ ...bookingForm, bookingType: type.id })}
                        className={`p-6 rounded-xl border transition-all duration-200 cursor-pointer space-y-2 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-neutral-900 border-emerald-500/80 shadow-lg shadow-emerald-950/20'
                            : 'bg-neutral-950/40 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-display font-bold text-white text-base">{type.title}</h4>
                            {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                          </div>
                          <p className="text-xs text-emerald-400 font-mono">{type.subtitle}</p>
                          <p className="text-xs text-neutral-400 pt-2 leading-relaxed">{type.details}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
                  >
                    <span>Continue to Schedule</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Choose Preferred Date & Time */}
            {bookingStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Select Preferred Date &amp; Time</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Production recordings take place on Tuesdays, Thursdays, and Saturdays.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-xl border border-white/10 bg-neutral-950/40">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                      Target Recording Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={bookingForm.preferredDate}
                        onChange={(e) => setBookingForm({ ...bookingForm, preferredDate: e.target.value })}
                        className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:border-emerald-500/50 outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-neutral-500 block">
                      Recommended: at least 5 business days in advance.
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                      Preferred Studio Window
                    </label>
                    <select
                      value={bookingForm.preferredTime}
                      onChange={(e) => setBookingForm({ ...bookingForm, preferredTime: e.target.value })}
                      className="w-full px-4 py-3 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white focus:border-emerald-500/50 outline-none"
                    >
                      <option value="11:00">Morning Session — 11:00 AM PKT</option>
                      <option value="14:00">Afternoon Session — 02:00 PM PKT</option>
                      <option value="16:30">Evening Session — 04:30 PM PKT</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setBookingStep(1)}
                    className="px-5 py-3 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    onClick={() => setBookingStep(3)}
                    className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg active:scale-[0.98]"
                  >
                    <span>Continue to Contact</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Provide Contact Information */}
            {bookingStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Your Executive Information</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Details of the speaker or executive representative making this booking.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 rounded-xl border border-white/10 bg-neutral-950/40">
                  <div className="space-y-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                      placeholder="e.g. Sanam Pathan"
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                      placeholder="name@company.com"
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      placeholder="+92 300 0000000"
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={bookingForm.company}
                      onChange={(e) => setBookingForm({ ...bookingForm, company: e.target.value })}
                      placeholder="e.g. Beaconhouse International College"
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                      Executive Role / Designation
                    </label>
                    <input
                      type="text"
                      value={bookingForm.role}
                      onChange={(e) => setBookingForm({ ...bookingForm, role: e.target.value })}
                      placeholder="e.g. Head of Institution / Chief Executive"
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 font-medium">
                      Discussion Topic or Goals
                    </label>
                    <textarea
                      rows={3}
                      value={bookingForm.message}
                      onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                      placeholder="Briefly outline your core topic, strategic milestones, or partnership goals..."
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500/50 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setBookingStep(2)}
                    className="px-5 py-3 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>

                  <button
                    disabled={!bookingForm.name || !bookingForm.email}
                    onClick={() => setBookingStep(4)}
                    className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-40 active:scale-[0.98]"
                  >
                    <span>Proceed to Review</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Review Booking Summary */}
            {bookingStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Review Booking Summary</h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    Verify all parameters before dispatching your request to the producer desk.
                  </p>
                </div>

                <div className="p-6 md:p-8 rounded-xl border border-white/10 bg-neutral-950/60 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block">
                        ENGAGEMENT TYPE
                      </span>
                      <p className="text-lg font-display font-bold text-white mt-1">
                        {bookingForm.bookingType}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block">
                        SCHEDULED WINDOW
                      </span>
                      <p className="text-lg font-display font-bold text-emerald-400 mt-1">
                        {bookingForm.preferredDate || 'Earliest Available'} · {bookingForm.preferredTime} PKT
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block">
                        SPEAKER / CONTACT
                      </span>
                      <p className="text-sm font-semibold text-white mt-1">{bookingForm.name}</p>
                      <p className="text-xs text-neutral-400">{bookingForm.email}</p>
                      {bookingForm.phone && <p className="text-xs text-neutral-400">{bookingForm.phone}</p>}
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block">
                        ORGANIZATION &amp; ROLE
                      </span>
                      <p className="text-sm font-semibold text-white mt-1">
                        {bookingForm.company || 'Not Specified'}
                      </p>
                      <p className="text-xs text-neutral-400">{bookingForm.role || 'Executive'}</p>
                    </div>
                  </div>

                  {bookingForm.message && (
                    <div className="pt-4 border-t border-white/10">
                      <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-widest block">
                        PROJECT NOTES
                      </span>
                      <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{bookingForm.message}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4">
                  <button
                    onClick={() => setBookingStep(3)}
                    className="px-5 py-3 bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-mono uppercase tracking-wider rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Edit</span>
                  </button>

                  <button
                    disabled={bookingLoading}
                    onClick={handleBookingSubmit}
                    className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wider uppercase rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 active:scale-[0.98]"
                  >
                    {bookingLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Transmitting to Producer Desk...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirm &amp; Transmit Booking</span>
                        <Check className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 5: Confirm Screen */}
            {bookingStep === 5 && (
              <div className="p-10 md:p-14 rounded-2xl border border-emerald-500/40 bg-neutral-950/60 text-center space-y-6 max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,166,81,0.3)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
                    RECORDING REQUEST LOGGED
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display font-bold text-white">
                    Session In Review
                  </h3>
                  <p className="text-xs font-mono text-neutral-400">
                    REFERENCE ID: <span className="text-white">{confirmedBookingId}</span>
                  </p>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md mx-auto">
                  Your session request for <span className="font-semibold text-white">{bookingForm.bookingType}</span> on{' '}
                  <span className="font-semibold text-white">{bookingForm.preferredDate || 'your requested timeframe'}</span> has
                  been securely routed to our operations lead Syed Waleed ur Rehman and host Javeria Hammad Khan.
                </p>

                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={resetBookingFlow}
                    className="px-6 py-3 bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors cursor-pointer"
                  >
                    Book Another Session
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            GENERAL INQUIRIES TAB
            ========================================================================= */}
        {activeTab === 'message' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h3 className="text-2xl font-display font-bold text-white">Send a Direct Message</h3>
                <p className="text-xs text-neutral-400 mt-1">
                  For press inquiries, corporate sponsorship, or media partnerships.
                </p>
              </div>

              {contactSuccess && (
                <div className="p-4 bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Your message has been received. Our producer desk will respond within 24 hours.</span>
                </div>
              )}

              {contactError && (
                <div className="p-4 bg-red-950/80 border border-red-500 text-red-200 text-xs rounded-xl">
                  {contactError}
                </div>
              )}

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. Tariq Khan"
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="tariq@org.pk"
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1">
                      Organization
                    </label>
                    <input
                      type="text"
                      value={contactForm.company}
                      onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                      placeholder="e.g. Pakistan Digital Association"
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1">
                      Inquiry Nature
                    </label>
                    <select
                      value={contactForm.inquiryType}
                      onChange={(e) => setContactForm({ ...contactForm, inquiryType: e.target.value })}
                      className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-emerald-500"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Summit Partnership">Summit Partnership</option>
                      <option value="Sponsorship">Sponsorship &amp; PR</option>
                      <option value="Press Inquiries">Press &amp; Media Desk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-300 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Provide details regarding your communication..."
                    className="w-full px-4 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-xs text-white placeholder:text-neutral-500 outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="px-8 py-3.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs tracking-wider uppercase rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  {contactLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <span>Transmit Message</span>
                  )}
                </button>
              </form>
            </div>

            {/* Direct Channels */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h3 className="text-xl font-display font-bold text-white">Direct Production Desk</h3>
                <p className="text-xs text-neutral-400 mt-1">Official channels for executive liaison.</p>
              </div>

              <div className="space-y-4">
                <div className="p-5 rounded-xl border border-white/10 bg-neutral-950/40 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
                    <Mail className="w-4 h-4" />
                    <span>EDITORIAL &amp; PRODUCER INBOX</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{settings?.contactEmail || 'contact@risepakistan.com'}</p>
                </div>

                <div className="p-5 rounded-xl border border-white/10 bg-neutral-950/40 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
                    <MapPin className="w-4 h-4" />
                    <span>STUDIO FOOTPRINT</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{settings?.address || 'Karachi & Islamabad, Pakistan'}</p>
                  <p className="text-xs text-neutral-400">Fixed recording studios &amp; nationwide mobile deployment.</p>
                </div>

                <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>RISE AI CONCIERGE</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Need instant answers regarding guest rosters, schedule availability, or founder biographies?
                  </p>
                  <button
                    onClick={onOpenAi}
                    className="text-xs font-mono uppercase text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
                  >
                    Launch Executive AI Concierge &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
