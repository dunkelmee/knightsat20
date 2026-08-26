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

  return (
    <section id="pending-status-banner" className="bg-[#f5f1e8] text-stone-900 border-b border-stone-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          
          {/* Main Info */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-semibold text-stone-900 tracking-tight">
                Makati Science High School <span className="text-amber-800 font-medium">Batch 2007 Reunion</span>
              </h2>
              {isFinalized && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                  <span>Finalized</span>
                </span>
              )}
            </div>

            {/* Date & Venue Display */}
            <div className="flex flex-wrap gap-2 text-xs text-stone-700">
              <div className="inline-flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs">
                <Calendar className="w-3.5 h-3.5 text-stone-500" />
                <span>Date: <strong className="text-stone-900 font-semibold">{displayDate}</strong></span>
              </div>

              <div className="inline-flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-stone-500" />
                <span>Venue: <strong className="text-stone-900 font-semibold">{displayVenue}</strong></span>
              </div>

              {isFinalized && displayTime && (
                <div className="inline-flex items-center gap-1.5 bg-white/90 px-3 py-1.5 rounded-lg border border-stone-200 shadow-xs">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>Time: <strong className="text-stone-900 font-semibold">{displayTime}</strong></span>
                </div>
              )}
            </div>

            <p className="text-xs text-stone-600 max-w-xl">
              {isFinalized
                ? 'The official date and venue have been confirmed by the committee. Please submit your RSVP and pledge.'
                : 'Please share your preferred schedule, venue style, and batch fund pledge so we can finalize arrangements.'}
            </p>
          </div>

          {/* Action & Quick Stats */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2.5 flex-shrink-0">
            <button
              id="btn-banner-survey-cta"
              type="button"
              onClick={onTakeSurveyClick}
              className="px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span>{isFinalized ? 'Submit RSVP / Pledge' : 'Answer Survey'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="text-[11px] text-stone-500 flex items-center gap-2">
              <span><strong>{totalSurveys}</strong> responses</span>
              <span>•</span>
              <span><strong>{formatPHP(totalPledges)}</strong> pledged</span>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
