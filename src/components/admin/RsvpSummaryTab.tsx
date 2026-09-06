import React, { useState } from 'react';
import {
  Users, CheckCircle2, UserPlus, Baby, Heart,
  Utensils, Wrench, Phone, Mail, Award, MessageSquare
} from 'lucide-react';
import { RSVPRecord, SurveyResponse } from '../../types';

interface RsvpSummaryTabProps {
  rsvps: RSVPRecord[];
  responses: SurveyResponse[];
}

export const RsvpSummaryTab: React.FC<RsvpSummaryTabProps> = ({
  rsvps,
  responses,
}) => {
  const [selectedCommittee, setSelectedCommittee] = useState<string>('All');

  // Headcount computations
  const attendingRsvps = rsvps.filter(r => r.status === 'Attending');
  const maybeRsvps = rsvps.filter(r => r.status === 'Most likely' || r.status === 'Maybe');
  const declineRsvps = rsvps.filter(r => r.status === 'Decline');

  const plusOnes = attendingRsvps.reduce((acc, r) => acc + (r.plusOnesCount ?? (r.bringingPlusOne ? 1 : 0)), 0);
  const kidsTotal = attendingRsvps.reduce((acc, r) => acc + (r.kidsCount || 0), 0);
  const totalHeadcount = attendingRsvps.length + plusOnes + kidsTotal;

  // Survey attendance tallies
  const surveyDefinite = responses.filter(r => r.attendance === 'Yes, definitely!').length;
  const surveyLikely = responses.filter(r => r.attendance === 'Most likely, but still confirming').length;
  const surveyUnsure = responses.filter(r => r.attendance === 'Not sure yet').length;
  const surveyDeclined = responses.filter(r => r.attendance === 'Unfortunately, I won’t be able to attend').length;

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

      {/* 4 Core Summary Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

        <div className="bg-surface-container-lowest rounded p-5 border border-success-container shadow-soft">
          <div className="flex items-center justify-between text-label font-bold text-on-success-container uppercase tracking-wide">
            <span>Confirmed Alumni</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <div className="text-title font-bold text-on-success-container mt-1">
            {attendingRsvps.length}
          </div>
          <p className="text-label text-on-surface-variant mt-1">Direct RSVPs</p>
        </div>

        <div className="bg-surface-container-lowest rounded p-5 border border-tertiary-container/50 shadow-soft">
          <div className="flex items-center justify-between text-label font-bold text-on-tertiary-container uppercase tracking-wide">
            <span>Companions (+1 & Kids)</span>
            <UserPlus className="w-4 h-4 text-tertiary" />
          </div>
          <div className="text-title font-bold text-on-tertiary-container mt-1">
            +{plusOnes + kidsTotal}
          </div>
          <p className="text-label text-on-surface-variant mt-1">{plusOnes} plus-ones • {kidsTotal} kids</p>
        </div>

        <div className="bg-surface-container-lowest rounded p-5 border border-secondary-container shadow-soft">
          <div className="flex items-center justify-between text-label font-bold text-on-secondary-container uppercase tracking-wide">
            <span>Est. Total Headcount</span>
            <Users className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-title font-bold text-on-secondary-container mt-1">
            {totalHeadcount}
          </div>
          <p className="text-label text-on-surface-variant mt-1">Total banquet attendees</p>
        </div>

        <div className="bg-surface-container-lowest rounded p-5 border border-primary-container/50 shadow-soft">
          <div className="flex items-center justify-between text-label font-bold text-on-primary-container uppercase tracking-wide">
            <span>Survey Definite/Likely</span>
            <Award className="w-4 h-4 text-primary" />
          </div>
          <div className="text-title font-bold text-on-primary-container mt-1">
            {surveyDefinite + surveyLikely}
          </div>
          <p className="text-label text-on-surface-variant mt-1">{surveyDefinite} Definite • {surveyLikely} Likely</p>
        </div>

      </div>

      {/* Attendance Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Survey Attendance Intent */}
        <div className="bg-surface-container-lowest rounded p-6 border border-outline-variant/30 shadow-soft space-y-4">
          <h3 className="text-heading font-bold text-on-surface uppercase tracking-wide">
            Planning Survey Attendance Intent ({responses.length} Total)
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Yes, definitely!', count: surveyDefinite, color: 'bg-success', text: 'text-success' },
              { label: 'Most likely, but still confirming', count: surveyLikely, color: 'bg-tertiary', text: 'text-tertiary' },
              { label: 'Not sure yet', count: surveyUnsure, color: 'bg-primary', text: 'text-primary' },
              { label: 'Unfortunately, I won’t be able to attend', count: surveyDeclined, color: 'bg-outline', text: 'text-on-surface-variant' },
            ].map(item => {
              const pct = responses.length > 0 ? Math.round((item.count / responses.length) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-body font-semibold text-on-surface">
                    <span>{item.label}</span>
                    <span className={item.text}>{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dietary & Catering Notes */}
        <div className="bg-surface-container-lowest rounded p-6 border border-outline-variant/30 shadow-soft space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
            <h3 className="text-heading font-bold text-on-surface uppercase tracking-wide flex items-center gap-2">
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
                  <span className="font-semibold text-on-surface">{r.fullName}</span>
                  <span className="text-on-primary-container bg-primary-container/20 px-2 py-0.5 rounded border border-primary-container/50 font-medium">
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
            <h3 className="text-heading font-bold text-on-surface flex items-center gap-2">
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
                  <span className="font-bold text-body text-on-surface">{c}</span>
                  <span className="text-label font-bold bg-tertiary-container/25 text-on-tertiary-container px-2 py-0.5 rounded-full">
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
