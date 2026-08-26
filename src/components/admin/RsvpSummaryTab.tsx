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
  const maybeRsvps = rsvps.filter(r => r.status === 'Maybe');
  const declineRsvps = rsvps.filter(r => r.status === 'Decline');

  const plusOnes = attendingRsvps.filter(r => r.bringingPlusOne).length;
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
        
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-800 uppercase tracking-wide">
            <span>Confirmed Alumni</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-950 mt-1">
            {attendingRsvps.length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Direct RSVPs</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-blue-800 uppercase tracking-wide">
            <span>Companions (+1 & Kids)</span>
            <UserPlus className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-blue-950 mt-1">
            +{plusOnes + kidsTotal}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{plusOnes} plus-ones • {kidsTotal} kids</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-800 uppercase tracking-wide">
            <span>Est. Total Headcount</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-950 mt-1">
            {totalHeadcount}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Total banquet attendees</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-amber-800 uppercase tracking-wide">
            <span>Survey Definite/Likely</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-amber-950 mt-1">
            {surveyDefinite + surveyLikely}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">{surveyDefinite} Definite • {surveyLikely} Likely</p>
        </div>

      </div>

      {/* Attendance Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Survey Attendance Intent */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Planning Survey Attendance Intent ({responses.length} Total)
          </h3>

          <div className="space-y-3">
            {[
              { label: 'Yes, definitely!', count: surveyDefinite, color: 'bg-emerald-500', text: 'text-emerald-700' },
              { label: 'Most likely, but still confirming', count: surveyLikely, color: 'bg-blue-500', text: 'text-blue-700' },
              { label: 'Not sure yet', count: surveyUnsure, color: 'bg-amber-500', text: 'text-amber-700' },
              { label: 'Unfortunately, I won’t be able to attend', count: surveyDeclined, color: 'bg-slate-400', text: 'text-slate-600' },
            ].map(item => {
              const pct = responses.length > 0 ? Math.round((item.count / responses.length) * 100) : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span>{item.label}</span>
                    <span className={item.text}>{item.count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
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
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Dietary Requirements for Caterer ({dietaryList.length})</span>
            </h3>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1 text-xs">
            {dietaryList.length === 0 ? (
              <p className="text-slate-400 text-xs py-4 text-center">No special dietary restrictions specified yet.</p>
            ) : (
              dietaryList.map(r => (
                <div key={r.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-semibold text-slate-800">{r.fullName}</span>
                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                    {r.dietaryRestrictions}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Volunteer Committee Formation Hub */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-blue-600" />
              <span>Volunteers & Organizing Committees by Skill (Survey Q6)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Batchmates grouped by the services and tasks they offered to help organize
            </p>
          </div>

          {/* Committee Filter */}
          <select
            value={selectedCommittee}
            onChange={(e) => setSelectedCommittee(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white text-slate-800"
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
              <div key={c} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-xs text-slate-900">{c}</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    {skillMatrix[c].length} Volunteer{skillMatrix[c].length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {skillMatrix[c].map((v, i) => (
                    <div key={i} className="p-2 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="font-semibold text-slate-900">{v.name}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{v.contact}</span>
                      </div>
                      {v.notes && (
                        <div className="text-[10px] text-slate-600 italic bg-slate-50 p-1.5 rounded">
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
