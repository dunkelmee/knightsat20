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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-container-lowest rounded-lg max-w-2xl w-full p-6 sm:p-8 shadow-soft border border-outline-variant/30 space-y-6 my-8 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-outline-variant/30">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-on-surface">{response.fullName}</h2>
              {response.section2007 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tertiary-container/25 text-on-tertiary-container">
                  {response.section2007}
                </span>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Submitted on {new Date(response.submittedAt).toLocaleString()}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content sections */}
        <div className="space-y-5 text-sm">

          {/* Contact info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-surface-container-low rounded border border-outline-variant/30">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <Phone className="w-4 h-4 text-outline" />
              <span className="font-semibold">{response.contactNumber}</span>
            </div>
            {response.email && (
              <div className="flex items-center gap-2 text-on-surface-variant">
                <Mail className="w-4 h-4 text-outline" />
                <span>{response.email}</span>
              </div>
            )}
          </div>

          {/* Q2: Attendance */}
          <div className="p-4 bg-tertiary-container/15 rounded border border-tertiary-container/40 space-y-1">
            <div className="text-xs font-bold text-on-tertiary-container uppercase tracking-wide">Q2. Attendance</div>
            <div className="font-bold text-on-surface">{response.attendance}</div>
            {response.attendanceReason && (
              <p className="text-xs text-on-surface-variant mt-1 italic">
                Decision factor: "{response.attendanceReason}"
              </p>
            )}
          </div>

          {/* Q3: Preferred Date */}
          <div className="p-4 bg-surface-container-low rounded border border-outline-variant/30 space-y-1">
            <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Q3. Preferred Date & Range</div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {response.preferredMonths.map(m => (
                <span key={m} className="px-2 py-0.5 bg-surface-container-lowest border border-outline-variant/40 rounded text-xs font-medium text-on-surface">
                  {m}
                </span>
              ))}
            </div>
            {response.specificDateNotes && (
              <p className="text-xs text-on-surface-variant mt-2">
                Specific dates: <strong className="text-on-surface">{response.specificDateNotes}</strong>
              </p>
            )}
          </div>

          {/* Q4: Venue */}
          <div className="p-4 bg-surface-container-low rounded border border-outline-variant/30 space-y-1">
            <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Q4. Venue Preference</div>
            <div className="text-on-surface font-semibold">
              {response.preferredVenueType
                .map((type) => (type === 'Other' && response.venueTypeOther ? `Other: ${response.venueTypeOther}` : type))
                .join(', ')}
            </div>
            {response.venueSuggestion && (
              <p className="text-xs text-on-surface-variant mt-1">
                Suggested place: <strong className="text-on-surface">{response.venueSuggestion}</strong>
              </p>
            )}
          </div>

          {/* Q5: Contributions & Sponsorship */}
          <div className="p-4 bg-primary-container/15 rounded border border-primary-container/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-on-primary-container uppercase tracking-wide">
                Q5. Pledge & Sponsorship
              </div>
              <div className="text-lg font-bold text-primary">
                {formatPHP(response.computedPledgeAmount)}
              </div>
            </div>

            <div className="text-xs text-on-surface-variant space-y-1">
              <div>Selection Tier: <strong>{response.pledgeOption}</strong></div>
              {response.customPledgeAmount && (
                <div>Manual Input: <code className="bg-primary-container/25 px-1 py-0.5 rounded text-on-primary-container">{response.customPledgeAmount}</code></div>
              )}
            </div>

            {response.otherSponsorships.length > 0 && (
              <div className="pt-2 border-t border-primary-container/30">
                <div className="text-xs font-semibold text-on-primary-container mb-1">In-Kind Sponsorships:</div>
                <div className="flex flex-wrap gap-1">
                  {response.otherSponsorships.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-surface-container-lowest border border-primary-container/50 rounded text-xs text-on-surface">
                      {s}
                    </span>
                  ))}
                </div>
                {response.otherSponsorshipDetails && (
                  <p className="text-xs text-on-surface-variant italic mt-1.5">
                    Details: "{response.otherSponsorshipDetails}"
                  </p>
                )}
              </div>
            )}

            {/* Payment status control */}
            {onUpdatePaymentStatus && response.computedPledgeAmount > 0 && (
              <div className="pt-2 border-t border-primary-container/30 flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface-variant">Payment Status:</span>
                <select
                  value={response.pledgePaidStatus || 'Unpaid / Pledged'}
                  onChange={(e) => onUpdatePaymentStatus(response.id, e.target.value as any)}
                  className="text-xs font-bold px-3 py-1.5 rounded border border-primary-container bg-surface-container-lowest text-on-surface focus:outline-none"
                >
                  <option value="Unpaid / Pledged">Unpaid / Pledged</option>
                  <option value="Partially Paid">Partially Paid</option>
                  <option value="Fully Paid">Fully Paid</option>
                </select>
              </div>
            )}
          </div>

          {/* Q6: Skills Offered */}
          <div className="p-4 bg-surface-container-low rounded border border-outline-variant/30 space-y-2">
            <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Q6. Skills & Services Offered</div>
            <div className="flex flex-wrap gap-1.5">
              {response.skillsOffered.map(s => (
                <span key={s} className="px-2.5 py-1 bg-surface-container-lowest border border-outline-variant/40 rounded text-xs font-medium text-on-surface">
                  {s}
                </span>
              ))}
            </div>
            {response.skillsDetails && (
              <p className="text-xs text-on-surface-variant mt-1 italic">
                Notes: "{response.skillsDetails}"
              </p>
            )}
          </div>

          {/* Q7: Organization & Q8: Guests */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-surface-container-low rounded border border-outline-variant/30 space-y-1">
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Q7. Organizing & Recommendations</div>
              <div className="text-xs text-on-surface">Willingness: <strong>{response.willingToOrganize}</strong></div>
              {response.nominatedOrganizer && (
                <div className="text-xs text-on-surface-variant mt-1">Suggested Organizer / Agency: <strong>{response.nominatedOrganizer}</strong></div>
              )}
            </div>

            <div className="p-4 bg-surface-container-low rounded border border-outline-variant/30 space-y-1">
              <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wide">Q8. Guests / Companions</div>
              <div className="text-xs text-on-surface">+1 Guest: <strong>{response.bringingPlusOne}</strong></div>
              <div className="text-xs text-on-surface">Kids: <strong>{response.bringingKids} {response.kidsCount ? `(${response.kidsCount})` : ''}</strong></div>
            </div>
          </div>

          {/* Q9: Suggestions */}
          {response.otherSuggestions && (
            <div className="p-4 bg-tertiary-container/15 rounded border border-tertiary-container/40 space-y-1">
              <div className="text-xs font-bold text-on-tertiary-container uppercase tracking-wide">Q9. Other Suggestions</div>
              <p className="text-xs text-on-surface-variant whitespace-pre-line">
                {response.otherSuggestions}
              </p>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-outline-variant/30">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded bg-secondary text-on-secondary text-xs font-bold hover:opacity-90 transition-all"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
