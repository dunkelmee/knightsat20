import React from 'react';
import { Calendar, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatPHP } from '../utils/pledgeParser';
import { EventDetails } from '../types';

interface PendingBannerProps {
  totalSurveys: number;
  totalPledges: number;
  eventDetails?: EventDetails;
  onTakeSurveyClick: () => void;
}

const StatusPill: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
  <div className="flex-1 min-w-0 flex items-center gap-2 bg-surface-container-lowest/90 px-3 py-2 rounded border border-outline-variant/40 shadow-soft">
    <span className="text-on-surface-variant flex-shrink-0">{icon}</span>
    <div className="min-w-0">
      <div className="text-[9px] font-bold uppercase tracking-wide text-on-surface-variant">{label}</div>
      <div className="text-xs font-semibold text-on-surface truncate">{value}</div>
    </div>
  </div>
);

export const PendingBanner: React.FC<PendingBannerProps> = ({
  totalSurveys,
  totalPledges,
  eventDetails,
  onTakeSurveyClick,
}) => {
  const isFinalized = eventDetails?.status === 'Finalized';
  const displayDate = eventDetails?.date || 'Pending / For finalization';
  const displayVenue = eventDetails?.venue || 'Pending / For finalization';
  const displayTime = eventDetails?.time;

  const description = isFinalized
    ? 'The official date and venue have been confirmed by the committee. Please submit your RSVP and pledge.'
    : 'Please share your preferred schedule, venue style, and batch fund pledge so we can finalize arrangements.';

  return (
    <section id="pending-status-banner" className="bg-surface-container-low text-on-surface border-b border-outline-variant/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 md:py-6">
        <div className="flex flex-col items-center text-center md:items-stretch md:text-left md:flex-row md:justify-between gap-4 md:gap-5">

          {/* Main Info */}
          <div className="space-y-2.5 flex flex-col items-center md:items-start w-full md:w-auto">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-serif font-semibold text-on-surface tracking-tight">
                Makati Science High School <span className="text-primary font-medium">Batch 2007 Reunion</span>
              </h2>
              {isFinalized && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-success-container text-on-success-container border border-success-container">
                  <CheckCircle2 className="w-3 h-3 text-on-success-container" />
                  <span>Finalized</span>
                </span>
              )}
            </div>

            {/* Date & Venue — condensed side-by-side pills */}
            <div className="w-full flex gap-2 text-xs text-on-surface-variant max-w-sm md:max-w-none">
              <StatusPill icon={<Calendar className="w-3.5 h-3.5" />} label="Date" value={displayDate} />
              <StatusPill icon={<MapPin className="w-3.5 h-3.5" />} label="Venue" value={displayVenue} />
              {isFinalized && displayTime && (
                <StatusPill icon={<Clock className="w-3.5 h-3.5" />} label="Time" value={displayTime} />
              )}
            </div>

            {/* Desktop: paragraph stays with the title/pills column */}
            <p className="hidden md:block text-xs text-on-surface-variant max-w-xl">{description}</p>
          </div>

          {/* Action & Quick Stats */}
          <div className="flex flex-col items-center md:items-end gap-2.5 flex-shrink-0">
            <button
              id="btn-banner-survey-cta"
              type="button"
              onClick={onTakeSurveyClick}
              className="px-5 py-2.5 rounded bg-primary hover:opacity-90 text-on-primary font-semibold text-xs shadow-soft flex items-center gap-1.5 transition-all"
            >
              <span>{isFinalized ? 'Submit RSVP / Pledge' : 'Answer Survey'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-[11px] text-on-surface-variant flex items-center gap-2">
              <span><strong>{totalSurveys}</strong> responses</span>
              <span>•</span>
              <span><strong>{formatPHP(totalPledges)}</strong> pledged</span>
            </div>
          </div>

          {/* Mobile: paragraph moves below the CTA, truncated to two lines */}
          <p className="md:hidden text-xs text-on-surface-variant line-clamp-2 max-w-sm">{description}</p>
        </div>
      </div>
    </section>
  );
};
