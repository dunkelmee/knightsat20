import React, { useState } from 'react';
import {
  Baby, Heart, Utensils, Wrench, Phone, Mail, MessageSquare
} from 'lucide-react';
import { RSVPRecord, SurveyResponse } from '../../types';
import { HeadcountCard } from '../HeadcountCard';

interface RsvpSummaryTabProps {
  rsvps: RSVPRecord[];
  responses: SurveyResponse[];
}

export const RsvpSummaryTab: React.FC<RsvpSummaryTabProps> = ({
  rsvps,
  responses,
}) => {
  const [selectedCommittee, setSelectedCommittee] = useState<string>('All');

  // Volunteer committee matrix
  const skillMatrix: Record<string, { name: string; contact: string; email?: string; notes?: string }[]> = {};
  responses.forEach(r => {
    r.skillsOffered.forEach(skill => {
      if (skill !== 'I’d prefer to just attend 😊') {
        if (!skillMatrix[skill]) skillMatrix[skill] = [];
        skillMatrix[skill].push({
          name: r.fullName,
          contact: r.contactNumber,
          email: r.email,
          notes: r.skillsDetails,
        });
      }
    });
  });

  const committees = Object.keys(skillMatrix);

  // Dietary list
  const dietaryList = rsvps.filter(r => r.dietaryRestrictions && r.dietaryRestrictions.trim().length > 0);

  return (
    <div id="rsvp-summary-tab" className="space-y-6">

      {/* Headcount + dietary. One column on mobile, so the card fills the
          row; side by side from `md` up. */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* The same card the attendee Batch Board hero shows, from the same
            component — so the two views cannot drift apart on what a headcount
            means, which they previously had. No CTA and no batch fund here:
            an organiser does not submit their own RSVP from the roster. */}
        <HeadcountCard rsvps={rsvps} variant="surface" />

        {/* Dietary & Catering Notes */}
        <div className="bg-surface-container-lowest rounded p-6 border border-outline-variant/30 shadow-soft space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <h3 className="text-heading text-on-surface flex items-center gap-2">
              <Utensils className="w-4 h-4 text-primary" />
              <span>Dietary Requirements for Caterer ({dietaryList.length})</span>
            </h3>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-body">
            {dietaryList.length === 0 ? (
              <p className="text-outline text-body py-4 text-center">No special dietary restrictions specified yet.</p>
            ) : (
              dietaryList.map(r => (
                <div key={r.id} className="p-2.5 bg-surface-container-low rounded border border-outline-variant/30 flex items-center justify-between">
                  <span className="font-serif text-heading text-on-surface">{r.fullName}</span>
                  <span className="eyebrow text-on-primary-container bg-primary-container/20 px-2 py-0.5 rounded border border-primary-container/50">
                    {r.dietaryRestrictions}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Volunteer Committee Formation Hub */}
      <div className="bg-surface-container-lowest rounded p-6 border border-outline-variant/30 shadow-soft space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
          <div>
            <h3 className="text-heading text-on-surface flex items-center gap-2">
              <Wrench className="w-5 h-5 text-secondary" />
              <span>Volunteers & Organizing Committees by Skill (Survey Q6)</span>
            </h3>
            <p className="text-body text-on-surface-variant">
              Batchmates grouped by the services and tasks they offered to help organize
            </p>
          </div>

          {/* Committee Filter */}
          <select
            value={selectedCommittee}
            onChange={(e) => setSelectedCommittee(e.target.value)}
            className="px-3 py-1.5 rounded border border-secondary/30 text-body font-semibold bg-surface-container-lowest text-on-surface"
          >
            <option value="All">All Committees ({committees.length})</option>
            {committees.map(c => (
              <option key={c} value={c}>{c} ({skillMatrix[c].length})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {committees
            .filter(c => selectedCommittee === 'All' || selectedCommittee === c)
            .map(c => (
              <div key={c} className="p-4 rounded bg-surface-container-low border border-outline-variant/30 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                  <span className="text-body font-semibold text-on-surface">{c}</span>
                  <span className="eyebrow bg-tertiary-container/25 text-on-tertiary-container px-2 py-0.5 rounded-full">
                    {skillMatrix[c].length} Volunteer{skillMatrix[c].length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {skillMatrix[c].map((v, i) => (
                    <div key={i} className="p-2 bg-surface-container-lowest rounded border border-outline-variant/30 text-body space-y-1">
                      <div className="font-semibold text-on-surface">{v.name}</div>
                      <div className="text-label text-on-surface-variant flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-outline" />
                        <span>{v.contact}</span>
                      </div>
                      {v.notes && (
                        <div className="text-label text-on-surface-variant italic bg-surface-container-low p-1.5 rounded">
                          "{v.notes}"
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>

    </div>
  );
};
