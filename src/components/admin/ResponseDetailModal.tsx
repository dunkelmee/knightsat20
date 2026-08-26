import React from 'react';
import { X, User, Phone, Mail, Calendar, MapPin, HeartHandshake, Wrench, Users, MessageSquare, CheckCircle2 } from 'lucide-react';
import { SurveyResponse } from '../../types';
import { formatPHP } from '../../utils/pledgeParser';

interface ResponseDetailModalProps {
  response: SurveyResponse | null;
  onClose: () => void;
  onUpdatePaymentStatus?: (id: string, status: SurveyResponse['pledgePaidStatus']) => void;
}

export const ResponseDetailModal: React.FC<ResponseDetailModalProps> = ({
  response,
  onClose,
  onUpdatePaymentStatus,
}) => {
  if (!response) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900">{response.fullName}</h2>
              {response.section2007 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                  {response.section2007}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Submitted on {new Date(response.submittedAt).toLocaleString()}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-5 text-sm">
          
          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="font-semibold">{response.contactNumber}</span>
            </div>
            {response.email && (
              <div className="flex items-center gap-2 text-slate-700">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{response.email}</span>
              </div>
            )}
          </div>

          {/* Q2: Attendance */}
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-1">
            <div className="text-xs font-bold text-blue-800 uppercase tracking-wide">Q2. Attendance</div>
            <div className="font-bold text-slate-900">{response.attendance}</div>
            {response.attendanceReason && (
              <p className="text-xs text-slate-600 mt-1 italic">
                Decision factor: "{response.attendanceReason}"
              </p>
            )}
          </div>

          {/* Q3: Preferred Date */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Q3. Preferred Date & Range</div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {response.preferredMonths.map(m => (
                <span key={m} className="px-2 py-0.5 bg-white border border-slate-300 rounded-md text-xs font-medium text-slate-800">
                  {m}
                </span>
              ))}
            </div>
            {response.specificDateNotes && (
              <p className="text-xs text-slate-600 mt-2">
                Specific dates: <strong className="text-slate-800">{response.specificDateNotes}</strong>
              </p>
            )}
          </div>

          {/* Q4: Venue */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Q4. Venue Preference</div>
            <div className="text-slate-800 font-semibold">
              {response.preferredVenueType === 'Other' && response.venueTypeOther
                ? `Other: ${response.venueTypeOther}`
                : response.preferredVenueType}
            </div>
            {response.venueSuggestion && (
              <p className="text-xs text-slate-600 mt-1">
                Suggested place: <strong className="text-slate-800">{response.venueSuggestion}</strong>
              </p>
            )}
          </div>

          {/* Q5: Contributions & Sponsorship */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                Q5. Pledge & Sponsorship
              </div>
              <div className="text-lg font-extrabold text-amber-600">
                {formatPHP(response.computedPledgeAmount)}
              </div>
            </div>

            <div className="text-xs text-slate-700 space-y-1">
              <div>Selection Tier: <strong>{response.pledgeOption}</strong></div>
              {response.customPledgeAmount && (
                <div>Manual Input: <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900">{response.customPledgeAmount}</code></div>
              )}
            </div>

            {response.otherSponsorships.length > 0 && (
              <div className="pt-2 border-t border-amber-200">
                <div className="text-xs font-semibold text-amber-900 mb-1">In-Kind Sponsorships:</div>
                <div className="flex flex-wrap gap-1">
                  {response.otherSponsorships.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-white border border-amber-300 rounded text-xs text-slate-800">
                      {s}
                    </span>
                  ))}
                </div>
                {response.otherSponsorshipDetails && (
                  <p className="text-xs text-slate-600 italic mt-1.5">
                    Details: "{response.otherSponsorshipDetails}"
                  </p>
                )}
              </div>
            )}

            {/* Payment status control */}
            {onUpdatePaymentStatus && response.computedPledgeAmount > 0 && (
              <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">Payment Status:</span>
                <select
                  value={response.pledgePaidStatus || 'Unpaid / Pledged'}
                  onChange={(e) => onUpdatePaymentStatus(response.id, e.target.value as any)}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-amber-400 bg-white text-slate-800 focus:outline-none"
                >
                  <option value="Unpaid / Pledged">Unpaid / Pledged</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Fully Paid">Fully Paid</option>
                </select>
              </div>
            )}
          </div>

          {/* Q6: Skills Offered */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Q6. Skills & Services Offered</div>
            <div className="flex flex-wrap gap-1.5">
              {response.skillsOffered.map(s => (
                <span key={s} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800">
                  {s}
                </span>
              ))}
            </div>
            {response.skillsDetails && (
              <p className="text-xs text-slate-600 mt-1 italic">
                Notes: "{response.skillsDetails}"
              </p>
            )}
          </div>

          {/* Q7: Organization & Q8: Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Q7. Organizing & Recommendations</div>
              <div className="text-xs text-slate-800">Willingness: <strong>{response.willingToOrganize}</strong></div>
              {response.nominatedOrganizer && (
                <div className="text-xs text-slate-600 mt-1">Suggested Organizer / Agency: <strong>{response.nominatedOrganizer}</strong></div>
              )}
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Q8. Guests / Companions</div>
              <div className="text-xs text-slate-800">+1 Guest: <strong>{response.bringingPlusOne}</strong></div>
              <div className="text-xs text-slate-800">Kids: <strong>{response.bringingKids} {response.kidsCount ? `(${response.kidsCount})` : ''}</strong></div>
            </div>
          </div>

          {/* Q9: Suggestions */}
          {response.otherSuggestions && (
            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-1">
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-wide">Q9. Other Suggestions</div>
              <p className="text-xs text-slate-700 whitespace-pre-line">
                {response.otherSuggestions}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
