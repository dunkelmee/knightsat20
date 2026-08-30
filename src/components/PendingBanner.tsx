import React from 'react';
import { Calendar, MapPin, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatPHP } from '../utils/pledgeParser';
import { EventDetails } from '../types';
import heroImage from '../assets/hero-image.jpg';

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 md:py-9">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-12">

          {/* Text column */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Headline + CTA copy, with a small taped snapshot alongside on mobile only */}
            <div className="flex items-start gap-3 md:block">
              <div className="flex-1 min-w-0">
                <h2 className="font-serif font-semibold tracking-tight leading-[1.08] text-[1.9rem] sm:text-4xl md:text-[2.65rem]">
                  <span className="block text-on-surface">Dalawang dekada na,</span>
                  <span className="block text-primary italic">musta na u?</span>
                </h2>

                {isFinalized && (
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-success-container text-on-success-container border border-success-container">
                    <CheckCircle2 className="w-3 h-3 text-on-success-container" />
                    <span>Finalized</span>
                  </span>
                )}

                <p className="mt-3 text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-md">
                  {description}
                </p>
              </div>

              {/* Mobile-only inline taped snapshot */}
              <div className="shrink-0 w-[92px] md:hidden">
                <div className="relative rotate-[4deg]">
                  <span className="absolute left-1/2 -top-2 z-10 h-[18px] w-[46px] -translate-x-1/2 -rotate-[3deg] border border-white/40 bg-gradient-to-br from-[#faf5e6]/90 to-[#e0cda8]/70 shadow-sm" />
                  <div className="rounded-[10px] border-4 border-surface-container-lowest shadow-soft overflow-hidden">
                    <img
                      src={heroImage}
                      alt="Makati Science High School courtyard"
                      className="w-full aspect-[1/1.05] object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date / Venue / Time cards */}
            <div className="flex gap-2.5">
              <StatusPill icon={<Calendar className="w-3.5 h-3.5" />} label="Date" value={displayDate} />
              <StatusPill icon={<MapPin className="w-3.5 h-3.5" />} label="Venue" value={displayVenue} />
              {isFinalized && displayTime && (
                <StatusPill icon={<Clock className="w-3.5 h-3.5" />} label="Time" value={displayTime} />
              )}
            </div>

            {/* CTA + quick stats */}
            <div className="flex flex-col items-start gap-2.5">
              <button
                id="btn-banner-survey-cta"
                type="button"
                onClick={onTakeSurveyClick}
                className="w-full sm:w-auto px-5 py-2.5 rounded bg-primary hover:opacity-90 text-on-primary font-semibold text-xs shadow-soft flex items-center justify-center gap-1.5 transition-all"
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
          </div>

          {/* Desktop-only large taped photo */}
          <div className="hidden md:flex flex-shrink-0 w-full md:w-[380px] justify-center">
            <div className="relative rotate-[1.5deg] w-full max-w-[420px]">
              <span className="absolute left-1/2 -top-3.5 z-10 h-[30px] w-[86px] -translate-x-1/2 -rotate-[3deg] border border-white/40 bg-gradient-to-br from-[#faf5e6]/90 to-[#e0cda8]/70 shadow-md" />
              <div className="rounded-2xl border-[6px] border-surface-container-lowest shadow-[0_8px_28px_rgba(27,28,25,0.16),0_2px_8px_rgba(27,28,25,0.08)] overflow-hidden">
                <img
                  src={heroImage}
                  alt="Makati Science High School courtyard"
                  className="w-full aspect-[467/360] object-cover"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
