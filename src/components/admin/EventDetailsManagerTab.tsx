import React, { useState } from 'react';
import {
  Calendar, MapPin, Clock, Shirt, Sparkles,
  CheckCircle2, Save, RotateCcw, Plus, Edit2, Trash2, Landmark
} from 'lucide-react';
import { EventDetails, ScoutedVenue } from '../../types';
import { formatPHP } from '../../utils/pledgeParser';
import { AddVenueModal } from './AddVenueModal';

interface EventDetailsManagerTabProps {
  eventDetails: EventDetails;
  onSaveEventDetails: (details: EventDetails) => void;
  scoutedVenues: ScoutedVenue[];
  onSaveVenue: (venue: ScoutedVenue) => void;
  onDeleteVenue: (id: string) => void;
}

export const EventDetailsManagerTab: React.FC<EventDetailsManagerTabProps> = ({
  eventDetails,
  onSaveEventDetails,
  scoutedVenues,
  onSaveVenue,
  onDeleteVenue,
}) => {
  const [isVenueModalOpen, setIsVenueModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<ScoutedVenue | null>(null);

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

  return (
    <div id="event-details-manager-tab" className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-heading font-semibold text-on-surface">
              Event Schedule & Venue Settings
            </h3>
            <span className={`px-2 py-0.5 rounded text-label font-semibold ${
              status === 'Finalized'
                ? 'bg-success-container text-on-success-container border border-success-container'
                : 'bg-primary-container/20 text-on-primary-container border border-primary-container/50'
            }`}>
              {status === 'Finalized' ? '✓ Finalized' : '⏳ Pending / Planning'}
            </span>
          </div>
          <p className="text-body text-on-surface-variant mt-0.5">
            Update date, venue, time, and address. Changes reflect immediately on the attendees' tickets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSetPending}
            className="px-3 py-1.5 rounded bg-background hover:bg-surface-container text-on-surface-variant font-semibold text-body border border-secondary/30 flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Pending</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-4 shadow-soft">

        {/* Status Switcher */}
        <div>
          <label className="block text-label font-semibold text-on-surface-variant mb-1.5">
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
                <div className="text-label font-semibold">Pending / Survey Phase</div>
                <div className="text-label text-on-surface-variant">Date & venue still being decided</div>
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
                <div className="text-label font-semibold text-on-success-container">Finalized & Confirmed</div>
                <div className="text-label text-on-success-container">Contract signed / fixed date & venue</div>
              </div>
            </label>
          </div>
        </div>

        {/* Date & Time Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-outline-variant/20">
          <div>
            <label className="block text-label font-semibold text-on-surface-variant mb-1">
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
                className="w-full pl-9 pr-3 py-2 rounded border border-secondary/30 text-on-surface text-body focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <p className="text-label text-on-surface-variant mt-1">
              Can be exact (e.g. "Saturday, Dec 12, 2026") or "Pending / For finalization".
            </p>
          </div>

          <div>
            <label className="block text-label font-semibold text-on-surface-variant mb-1">
              Event Time & Duration
            </label>
            <div className="relative">
              <Clock className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g. 5:30 PM - 10:30 PM"
                className="w-full pl-9 pr-3 py-2 rounded border border-secondary/30 text-on-surface text-body focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Venue & Address Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-outline-variant/20">
          <div>
            <label className="block text-label font-semibold text-on-surface-variant mb-1">
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
                className="w-full pl-9 pr-3 py-2 rounded border border-secondary/30 text-on-surface text-body focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-label font-semibold text-on-surface-variant mb-1">
              Venue Address / Area
            </label>
            <input
              type="text"
              value={venueAddress}
              onChange={(e) => setVenueAddress(e.target.value)}
              placeholder="e.g. Ayala Center, Makati City"
              className="w-full px-3 py-2 rounded border border-secondary/30 text-on-surface text-body focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Dress Code & Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-outline-variant/20">
          <div>
            <label className="block text-label font-semibold text-on-surface-variant mb-1">
              Dress Code / Attire
            </label>
            <div className="relative">
              <Shirt className="w-3.5 h-3.5 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={dressCode}
                onChange={(e) => setDressCode(e.target.value)}
                placeholder="e.g. Smart Casual / Semi-Formal"
                className="w-full pl-9 pr-3 py-2 rounded border border-secondary/30 text-on-surface text-body focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-label font-semibold text-on-surface-variant mb-1">
              Reunion Theme / Catchphrase
            </label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. MakSci Batch 2007: 20 Years After"
              className="w-full px-3 py-2 rounded border border-secondary/30 text-on-surface text-body focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Committee Notes */}
        <div className="pt-1 border-t border-outline-variant/20">
          <label className="block text-label font-semibold text-on-surface-variant mb-1">
            Committee Notes / Special Instructions
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Valet parking available, please arrive 15 minutes before opening remarks..."
            className="w-full p-2.5 rounded border border-secondary/30 text-on-surface text-body focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-between">
          <div>
            {isSaved && (
              <span className="text-body font-semibold text-success flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved successfully! Updated across the site.</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2 rounded bg-primary hover:opacity-90 text-on-primary font-semibold text-body shadow-soft flex items-center gap-1.5 transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save event details</span>
          </button>
        </div>

      </form>

      {/* Scouted Venues Shortlist */}
      <div className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 shadow-soft space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-heading font-semibold text-on-surface flex items-center gap-2">
            <Landmark className="w-4 h-4 text-primary" />
            <span>Scouted Venues ({scoutedVenues.length})</span>
          </h3>
          <button
            type="button"
            onClick={() => {
              setEditingVenue(null);
              setIsVenueModalOpen(true);
            }}
            className="px-3 py-1.5 rounded bg-primary hover:opacity-90 text-on-primary text-body font-bold shadow-soft flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Venue</span>
          </button>
        </div>

        {scoutedVenues.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Sparkles className="w-5 h-5 text-outline mx-auto" />
            <p className="text-body text-on-surface-variant">No scouted venues yet. Add one to start building the shortlist.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {scoutedVenues.map((v) => (
              <div key={v.id} className="p-3.5 rounded border border-outline-variant/30 bg-surface-container-low/60 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-serif font-semibold text-heading text-on-surface">{v.name}</h4>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingVenue(v);
                        setIsVenueModalOpen(true);
                      }}
                      className="p-1.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                      title="Edit venue"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Remove "${v.name}" from the shortlist?`)) onDeleteVenue(v.id);
                      }}
                      className="p-1.5 rounded bg-error-container hover:opacity-80 text-on-error-container"
                      title="Delete venue"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {v.tentativeDate && (
                  <div className="text-body text-on-surface-variant flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{v.tentativeDate}</span>
                  </div>
                )}
                {v.address && (
                  <div className="text-body text-on-surface-variant flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span>{v.address}</span>
                  </div>
                )}
                {v.quotedCost != null && (
                  <div className="text-heading font-bold text-primary">{formatPHP(v.quotedCost)}</div>
                )}
                {v.miscDetails && (
                  <p className="text-label text-on-surface-variant pt-1 border-t border-outline-variant/20">
                    {v.miscDetails}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {isVenueModalOpen && (
        <AddVenueModal
          onClose={() => setIsVenueModalOpen(false)}
          onSaveVenue={onSaveVenue}
          existingVenue={editingVenue}
        />
      )}
    </div>
  );
};
