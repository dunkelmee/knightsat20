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
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-semibold text-stone-900">
              Event Schedule & Venue Settings
            </h3>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
              status === 'Finalized'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-amber-50 text-amber-900 border border-amber-200'
            }`}>
              {status === 'Finalized' ? '✓ Finalized' : '⏳ Pending / Planning'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Update date, venue, time, and address. Changes reflect immediately on the public banner and event pages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSetPending}
            className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs border border-stone-300 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Pending</span>
          </button>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/80 space-y-2">
        <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider">
          Live Public Banner Preview
        </span>
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-800">
          <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span>Date: <strong className="text-stone-900 font-semibold">{date}</strong></span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-stone-500" />
            <span>Venue: <strong className="text-stone-900 font-semibold">{venue}</strong></span>
          </div>
          {status === 'Finalized' && time && (
            <div className="inline-flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>Time: <strong className="text-stone-900 font-semibold">{time}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-4 shadow-xs">
        
        {/* Status Switcher */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1.5">
            Event Status
          </label>
          <div className="grid grid-cols-2 gap-2 max-w-md">
            <label className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
              status === 'Pending'
                ? 'border-amber-700 bg-amber-50 text-stone-900 font-semibold ring-1 ring-amber-700'
                : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
            }`}>
              <input
                type="radio"
                name="eventStatus"
                checked={status === 'Pending'}
                onChange={() => setStatus('Pending')}
                className="w-3.5 h-3.5 text-amber-700"
              />
              <div>
                <div className="text-xs font-semibold">Pending / Survey Phase</div>
                <div className="text-[10px] text-stone-500">Date & venue still being decided</div>
              </div>
            </label>

            <label className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
              status === 'Finalized'
                ? 'border-emerald-700 bg-emerald-50 text-stone-900 font-semibold ring-1 ring-emerald-700'
                : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
            }`}>
              <input
                type="radio"
                name="eventStatus"
                checked={status === 'Finalized'}
                onChange={() => setStatus('Finalized')}
                className="w-3.5 h-3.5 text-emerald-700"
              />
              <div>
                <div className="text-xs font-semibold text-emerald-900">Finalized & Confirmed</div>
                <div className="text-[10px] text-emerald-700">Contract signed / fixed date & venue</div>
              </div>
            </label>
          </div>
        </div>

        {/* Date & Time Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-100">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Event Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Saturday, December 5, 2026 or Pending / For finalization"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>
            <p className="text-[10px] text-stone-500 mt-1">
              Can be exact (e.g. "Saturday, Dec 12, 2026") or "Pending / For finalization".
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Event Time & Duration
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 5:30 PM - 10:30 PM"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Venue & Address Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-100">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Venue Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="e.g. Grand Ballroom, Dusit Thani Manila or Pending / For finalization"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Venue Address / Area
            </label>
            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="e.g. Ayala Center, Makati City"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
          </div>
        </div>

        {/* Dress Code & Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-100">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Dress Code / Attire
            </label>
            <div className="relative">
              <Shirt className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder="e.g. Smart Casual / Semi-Formal"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Reunion Theme / Catchphrase
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. MakSci Batch 2007: 20 Years After"
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
          </div>
        </div>

        {/* Committee Notes */}
        <div className="pt-1 border-t border-stone-100">
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Committee Notes / Special Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Valet parking available, please arrive 15 minutes before opening remarks..."
            className="w-full p-2.5 rounded-lg border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
          />
        </div>

        {/* Quick Venue Shortlist Presets */}
        <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2">
          <div className="text-[11px] font-semibold text-stone-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
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
              className="text-[11px] bg-white hover:bg-amber-50 text-stone-800 hover:text-amber-900 px-2.5 py-1 rounded-md border border-stone-200 transition-colors"
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
              className="text-[11px] bg-white hover:bg-amber-50 text-stone-800 hover:text-amber-900 px-2.5 py-1 rounded-md border border-stone-200 transition-colors"
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
              className="text-[11px] bg-white hover:bg-amber-50 text-stone-800 hover:text-amber-900 px-2.5 py-1 rounded-md border border-stone-200 transition-colors"
            >
              MakSci Campus (Apr 17, 2027)
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            {isSaved && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved successfully! Updated across the site.</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Event Details</span>
          </button>
        </div>

      </form>
    </div>
  );
};
