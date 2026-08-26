import React, { useState } from 'react';
import {
  Calendar, MapPin, Clock, Shirt, Sparkles,
  CheckCircle2, Save, RotateCcw, AlertCircle
} from 'lucide-react';
import { EventDetails } from '../../types';

interface EventDetailsManagerTabProps {
  eventDetails: EventDetails;
  onSaveEventDetails: (details: EventDetails) => void;
}

export const EventDetailsManagerTab: React.FC<EventDetailsManagerTabProps> = ({
  eventDetails,
  onSaveEventDetails,
}) => {
  const [status, setStatus] = useState<'Pending' | 'Finalized'>(eventDetails.status || 'Pending');
  const [date, setDate] = useState(eventDetails.date || 'Pending / For finalization');
  const [time, setTime] = useState(eventDetails.time || '6:00 PM – 10:30 PM');
  const [venue, setVenue] = useState(eventDetails.venue || 'Pending / For finalization');
  const [venueAddress, setVenueAddress] = useState(eventDetails.venueAddress || '');
  const [dressCode, setDressCode] = useState(eventDetails.dressCode || 'Smart Casual');
  const [theme, setTheme] = useState(eventDetails.theme || 'MakSci Batch 2007 Reunion');
  const [notes, setNotes] = useState(eventDetails.notes || '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: EventDetails = {
      status,
      date: date.trim() || 'Pending / For finalization',
      time: time.trim() || undefined,
      venue: venue.trim() || 'Pending / For finalization',
      venueAddress: venueAddress.trim() || undefined,
      dressCode: dressCode.trim() || undefined,
      theme: theme.trim() || undefined,
      notes: notes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };
    onSaveEventDetails(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleSetPending = () => {
    setStatus('Pending');
    setDate('Pending / For finalization');
    setVenue('Pending / For finalization');
    setVenueAddress('Makati / BGC Area (Based on Survey Results)');
    setTime('TBA (Target: 6:00 PM – 10:30 PM)');
  };

  const handleQuickFinalizeSample = (sampleDate: string, sampleVenue: string, sampleAddress: string) => {
    setStatus('Finalized');
    setDate(sampleDate);
    setVenue(sampleVenue);
    setVenueAddress(sampleAddress);
    setTime('6:00 PM – 11:00 PM');
  };

  return (
    <div id="event-details-manager-tab" className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-on-surface">
              Event Schedule & Venue Settings
            </h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
              status === 'Finalized'
                ? 'bg-success-container text-on-success-container border border-success-container'
                : 'bg-primary-container/20 text-on-primary-container border border-primary-container/50'
            }`}>
              {status === 'Finalized' ? '✓ Finalized' : '⏳ Pending / Planning'}
            </span>
          </div>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Update date, venue, time, and address. Changes reflect immediately on the public banner and event pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSetPending}
            className="px-3 py-1.5 rounded bg-background hover:bg-surface-container text-on-surface-variant font-semibold text-xs border border-secondary/30 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Pending</span>
          </button>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="bg-primary-container/10 rounded p-4 border border-primary-container/40 space-y-2">
        <span className="text-[11px] font-semibold text-on-primary-container uppercase tracking-wider">
          Live Public Banner Preview
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface">
          <div className="inline-flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded border border-outline-variant/30 shadow-soft">
            <Calendar className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>Date: <strong className="text-on-surface font-semibold">{date}</strong></span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded border border-outline-variant/30 shadow-soft">
            <MapPin className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>Venue: <strong className="text-on-surface font-semibold">{venue}</strong></span>
          </div>
          {status === 'Finalized' && time && (
            <div className="inline-flex items-center gap-1.5 bg-surface-container-lowest px-3 py-1.5 rounded border border-outline-variant/30 shadow-soft">
              <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
              <span>Time: <strong className="text-on-surface font-semibold">{time}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-4 shadow-soft">

        {/* Status Switcher */}
        <div>
          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
            Event Status
          </label>
          <div className="grid grid-cols-2 gap-2 max-w-md">
            <label className={`p-3 rounded border cursor-pointer transition-all flex items-center gap-2 ${
              status === 'Pending'
                ? 'border-primary bg-primary-container/15 text-on-surface font-semibold ring-1 ring-primary'
                : 'border-outline-variant/30 hover:border-outline-variant text-on-surface-variant bg-surface-container-lowest'
            }`}>
              <input
                type="radio"
                name="eventStatus"
                checked={status === 'Pending'}
                onChange={() => setStatus('Pending')}
                className="w-3.5 h-3.5 text-primary"
              />
              <div>
                <div className="text-xs font-semibold">Pending / Survey Phase</div>
                <div className="text-[10px] text-on-surface-variant">Date & venue still being decided</div>
              </div>
            </label>

            <label className={`p-3 rounded border cursor-pointer transition-all flex items-center gap-2 ${
              status === 'Finalized'
                ? 'border-success bg-success-container text-on-surface font-semibold ring-1 ring-success'
                : 'border-outline-variant/30 hover:border-outline-variant text-on-surface-variant bg-surface-container-lowest'
            }`}>
              <input
                type="radio"
                name="eventStatus"
                checked={status === 'Finalized'}
                onChange={() => setStatus('Finalized')}
                className="w-3.5 h-3.5 text-success"
              />
              <div>
                <div className="text-xs font-semibold text-on-success-container">Finalized & Confirmed</div>
                <div className="text-[10px] text-on-success-container">Contract signed / fixed date & venue</div>
              </div>
            </label>
          </div>
        </div>

        {/* Date & Time Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-outline-variant/20">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Event Date <span className="text-error">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Saturday, December 5, 2026 or Pending / For finalization"
                className="w-full pl-9 pr-3 py-2 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <p className="text-[10px] text-on-surface-variant mt-1">
              Can be exact (e.g. "Saturday, Dec 12, 2026") or "Pending / For finalization".
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Event Time & Duration
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 5:30 PM - 10:30 PM"
                className="w-full pl-9 pr-3 py-2 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Venue & Address Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-outline-variant/20">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Venue Name <span className="text-error">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Grand Ballroom, Dusit Thani Manila or Pending / For finalization"
                className="w-full pl-9 pr-3 py-2 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Venue Address / Area
            </label>
            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="e.g. Ayala Center, Makati City"
              className="w-full px-3 py-2 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Dress Code & Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-outline-variant/20">
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Dress Code / Attire
            </label>
            <div className="relative">
              <Shirt className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder="e.g. Smart Casual / Semi-Formal"
                className="w-full pl-9 pr-3 py-2 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-1">
              Reunion Theme / Catchphrase
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. MakSci Batch 2007: 20 Years After"
              className="w-full px-3 py-2 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Committee Notes */}
        <div className="pt-1 border-t border-outline-variant/20">
          <label className="block text-xs font-semibold text-on-surface-variant mb-1">
            Committee Notes / Special Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Valet parking available, please arrive 15 minutes before opening remarks..."
            className="w-full p-2.5 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Quick Venue Shortlist Presets */}
        <div className="p-3 bg-surface-container-low rounded border border-outline-variant/30 space-y-2">
          <div className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Quick Finalize Options (Scouted Venues)</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickFinalizeSample(
                'Saturday, April 24, 2027',
                'Dusit Thani Manila (Grand Ballroom)',
                'Ayala Center, San Lorenzo, Makati City'
              )}
              className="text-[11px] bg-surface-container-lowest hover:bg-primary-container/15 text-on-surface-variant hover:text-on-primary-container px-2.5 py-1 rounded border border-outline-variant/30 transition-colors"
            >
              Dusit Thani Makati (Apr 24, 2027)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFinalizeSample(
                'Saturday, December 18, 2027',
                'The Blue Leaf Events Pavilion, BGC',
                '100 Park Avenue, McKinley Hill, Taguig / BGC'
              )}
              className="text-[11px] bg-surface-container-lowest hover:bg-primary-container/15 text-on-surface-variant hover:text-on-primary-container px-2.5 py-1 rounded border border-outline-variant/30 transition-colors"
            >
              The Blue Leaf BGC (Dec 18, 2027)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFinalizeSample(
                'Saturday, April 17, 2027',
                'Makati Science High School Campus & Function Hall',
                'Kalayaan Ave, Makati City'
              )}
              className="text-[11px] bg-surface-container-lowest hover:bg-primary-container/15 text-on-surface-variant hover:text-on-primary-container px-2.5 py-1 rounded border border-outline-variant/30 transition-colors"
            >
              MakSci Campus (Apr 17, 2027)
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            {isSaved && (
              <span className="text-xs font-semibold text-success flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved successfully! Updated across the site.</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded bg-primary hover:opacity-90 text-on-primary font-semibold text-xs shadow-soft flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Event Details</span>
          </button>
        </div>

      </form>
    </div>
  );
};
