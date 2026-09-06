import React, { useState } from 'react';
import { X } from 'lucide-react';
import { EventDetails, SurveyResponse, UserProfile } from '../types';

interface TicketModalProps {
  eventDetails: EventDetails;
  mySurveyResponse: SurveyResponse | null;
  currentUser: UserProfile;
  onClose: () => void;
  onNavigateToSurvey: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({
  eventDetails,
  mySurveyResponse,
  currentUser,
  onClose,
  onNavigateToSurvey,
}) => {
  const [qrOpen, setQrOpen] = useState(false);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[58] grid place-items-center p-[22px] bg-[rgba(12,22,19,.55)] backdrop-blur-sm"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-[580px] flex flex-col gap-3.5 items-stretch">
        {/* Desktop header row */}
        <div className="hidden @min-[700px]/app:flex items-baseline gap-2.5">
          <span className="font-serif text-title leading-[1.1] text-[#f2ece1]">Your ticket</span>
          <span className="flex-1 h-px bg-[#f2ece1]/25" />
          <button type="button" onClick={onClose} className="text-heading text-[#f2ece1]/70">✕</button>
        </div>

        {/* Mobile floating close button */}
        <button
          type="button"
          onClick={onClose}
          className="@min-[700px]/app:hidden absolute top-[18px] right-[18px] z-10 w-[38px] h-[38px] rounded-full grid place-items-center bg-white/[0.14] backdrop-blur-md border border-white/25 text-[#f2ece1] text-heading"
        >
          ✕
        </button>

        {mySurveyResponse ? (
          <div className="w-full max-w-[340px] @min-[700px]/app:max-w-none mx-auto">
            {/* Desktop turns the stub sideways, matching the mock: details on
                the left, perforation, then the QR panel on the right. */}
            <div className="relative flex flex-col @min-[700px]/app:flex-row @min-[700px]/app:flex-nowrap bg-surface-container-lowest shadow-soft rounded-xl overflow-hidden">
              <span
                className="absolute top-0 left-0 right-0 h-1.5 rounded-t-xl"
                style={{ background: 'repeating-linear-gradient(90deg,#b0564f 0 9px,rgba(176,86,79,.26) 9px 18px)' }}
              />
              <span
                className="absolute top-2.5 left-1.5 right-1.5 bottom-1.5 rounded-lg pointer-events-none"
                style={{ border: '1px dashed rgba(20,33,29,.22)' }}
              />
              <div className="order-1 @min-[700px]/app:order-3 @min-[700px]/app:w-[150px] @min-[700px]/app:flex-none pt-7 pb-5 px-5 @min-[700px]/app:px-2.5 @min-[700px]/app:pt-5.5 @min-[700px]/app:pb-4.5 flex flex-col items-center justify-center gap-2 text-center">
                <img
                  src="/api/checkin/me/qr-code"
                  alt="Your check-in QR code"
                  className="w-[150px] h-[150px] rounded bg-white"
                />
                <div className="flex flex-col gap-0.5 items-center">
                  <span className="font-mono text-label tracking-[0.14em] text-on-surface-variant/70">SCAN AT DOOR</span>
                  <button
                    type="button"
                    onClick={() => setQrOpen(true)}
                    className="font-sans text-label font-semibold tracking-wide text-primary underline"
                  >
                    Open
                  </button>
                </div>
              </div>
              <div className="order-2 relative h-5 flex-none @min-[700px]/app:hidden">
                <span className="absolute left-3 right-3 top-1/2 -translate-y-1/2 border-t-2 border-dashed" style={{ borderColor: '#b0564f' }} />
                <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background" />
                <span className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-background" />
              </div>
              <div className="order-2 relative w-5 flex-none hidden @min-[700px]/app:block">
                <span className="absolute top-3 bottom-3 left-1/2 -translate-x-1/2 border-l-2 border-dashed" style={{ borderColor: '#b0564f' }} />
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-background" />
                <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-background" />
              </div>
              <div className="order-3 @min-[700px]/app:order-1 flex-1 @min-[700px]/app:basis-[200px] min-w-0 pt-5 @min-[700px]/app:pt-6 pb-6 @min-[700px]/app:pb-5 px-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-label tracking-[0.2em] uppercase whitespace-nowrap" style={{ color: '#b0564f' }}>
                    {currentUser.fullName} and guest(s) ·
                  </span>
                  <span className="flex-1 min-w-[24px] h-px" style={{ background: 'rgba(176,86,79,.3)' }} />
                </div>
                <div className="flex flex-wrap gap-3.5">
                  {[
                    { k: 'Date', v: eventDetails.date },
                    { k: 'Doors', v: eventDetails.time || 'TBA' },
                    { k: 'Venue', v: eventDetails.venue },
                  ].map((p) => (
                    <div key={p.k} className="flex flex-col gap-0.5">
                      <span className="font-mono text-label tracking-[0.16em] uppercase text-on-surface-variant/70">{p.k}</span>
                      <span className="font-serif text-heading leading-[1.1] text-on-surface">{p.v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-xl shadow-soft text-center py-9 px-6 space-y-2">
            <p className="font-serif text-heading text-on-surface">Wala ka pang ticket.</p>
            <p className="text-body text-on-surface-variant max-w-[38ch] mx-auto">
              Answer the RSVP survey to get your ticket and check-in QR code.
            </p>
            <button
              type="button"
              onClick={onNavigateToSurvey}
              className="mt-1.5 px-4.5 py-2.5 rounded-full bg-primary text-on-primary font-bold text-body shadow-soft"
            >
              Answer the survey
            </button>
          </div>
        )}
      </div>

      {qrOpen && (
        <div
          onClick={(e) => { e.stopPropagation(); setQrOpen(false); }}
          className="fixed inset-0 z-[60] grid place-items-center p-6 bg-[rgba(12,22,19,.55)] backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[320px] bg-surface-container-lowest rounded-lg px-6 pt-7 pb-6 flex flex-col items-center gap-3.5 text-center shadow-soft"
          >
            <button
              type="button"
              onClick={() => setQrOpen(false)}
              className="absolute top-3 right-3.5 text-on-surface-variant/70"
            >
              <X className="w-4 h-4" />
            </button>
            <span className="font-serif text-title text-on-surface">Scan at the door</span>
            <img src="/api/checkin/me/qr-code" alt="Your check-in QR code" className="w-[216px] h-[216px] rounded bg-white" />
            <div className="w-full flex flex-col gap-1 pt-3 border-t border-dashed border-on-surface/20">
              <span className="text-body font-semibold text-on-surface">{currentUser.fullName}</span>
              <span className="font-mono text-label tracking-[0.12em] uppercase text-on-surface-variant/70">
                {eventDetails.date} · Doors {eventDetails.time || 'TBA'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
