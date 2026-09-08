import React, { useState } from 'react';
import { Search, Download, Eye, Trash2, Filter, FileSpreadsheet } from 'lucide-react';
import { SurveyResponse, PlannedExpense } from '../../types';
import { formatPHP } from '../../utils/pledgeParser';
import { exportSurveyResponsesToCSV, exportPledgesAndExpensesToCSV } from '../../utils/exportUtils';
import { ResponseDetailModal } from './ResponseDetailModal';
import { STATUS_EDGE, statusFromAttendance } from '../../utils/statusColors';

interface SurveyResponsesTabProps {
  responses: SurveyResponse[];
  expenses: PlannedExpense[];
  onDeleteResponse: (id: string) => void;
  onUpdatePaymentStatus: (id: string, status: SurveyResponse['pledgePaidStatus']) => void;
}

export const SurveyResponsesTab: React.FC<SurveyResponsesTabProps> = ({
  responses,
  expenses,
  onDeleteResponse,
  onUpdatePaymentStatus,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('All');
  const [pledgeFilter, setPledgeFilter] = useState('All');
  const [selectedResponse, setSelectedResponse] = useState<SurveyResponse | null>(null);

  // Filtered responses
  const filteredResponses = responses.filter(r => {
    const matchesSearch =
      r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.contactNumber.includes(searchTerm) ||
      (r.section2007 && r.section2007.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.venueSuggestion && r.venueSuggestion.toLowerCase().includes(searchTerm.toLowerCase())) ||
      r.skillsOffered.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesAttendance =
      attendanceFilter === 'All' || r.attendance === attendanceFilter;

    const matchesPledge =
      pledgeFilter === 'All' ||
      (pledgeFilter === 'Pledged' && r.computedPledgeAmount > 0) ||
      (pledgeFilter === 'Zero' && r.computedPledgeAmount === 0) ||
      (pledgeFilter === 'Fully Paid' && r.pledgePaidStatus === 'Fully Paid') ||
      (pledgeFilter === 'Unpaid' && (r.pledgePaidStatus === 'Unpaid / Pledged' || !r.pledgePaidStatus));

    return matchesSearch && matchesAttendance && matchesPledge;
  });

  return (
    <div id="survey-responses-tab" className="space-y-6">

      {/* Action Toolbar & Exports */}
      <div className="bg-surface-container-lowest rounded p-5 border border-outline-variant/30 shadow-soft space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, contact, section, skill, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded border border-secondary/30 text-body text-on-surface focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

{/* Export Buttons — no flex-wrap, so the pair always shares one row.
              The full labels cannot: "Export Pledges & Ledger CSV" alone is
              171px against the ~92px each button gets on a 360px phone, so
              below `sm` they run short.

              Below `sm` they also fill the row rather than sitting
              left-aligned against dead space. `flex-auto`, NOT `flex-1`:
              flex-1 zeroes the basis and splits the row into equal halves,
              which is narrower than "Pledges & Ledger" needs and truncates
              it. flex-auto starts each button at its label width and shares
              only the leftover space, so the row fills and neither clips.
              The parent is flex-col until `lg`, so this container is already
              full width there — only the buttons needed changing. */}
          <div className="flex items-center gap-2">
            <button
              id="btn-export-survey-csv"
              type="button"
              onClick={() => exportSurveyResponsesToCSV(responses)}
              className="btn btn-secondary min-w-0 flex-auto sm:flex-none"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">Full CSV</span>
                <span className="hidden sm:inline">Export Full CSV</span>
              </span>
            </button>

            <button
              id="btn-export-financials-csv"
              type="button"
              onClick={() => exportPledgesAndExpensesToCSV(responses, expenses)}
              className="btn btn-secondary min-w-0 flex-auto sm:flex-none"
            >
              <Download className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">
                <span className="sm:hidden">Pledges &amp; Ledger</span>
                <span className="hidden sm:inline">Export Pledges &amp; Ledger CSV</span>
              </span>
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-outline-variant/20 text-body">
          <div className="flex items-center gap-2 text-on-surface-variant font-semibold">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant">Attendance:</span>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="px-2.5 py-1 rounded border border-secondary/30 bg-surface-container-lowest text-on-surface-variant text-body"
            >
              <option value="All">All Statuses</option>
              <option value="Yes, definitely!">Attending</option>
              <option value="Most likely, but still confirming">Most likely</option>
              <option value="Not sure yet">Maybe</option>
              <option value="Unfortunately, I won’t be able to attend">Can&apos;t join</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant">Pledges:</span>
            <select
              value={pledgeFilter}
              onChange={(e) => setPledgeFilter(e.target.value)}
              className="px-2.5 py-1 rounded border border-secondary/30 bg-surface-container-lowest text-on-surface-variant text-body"
            >
              <option value="All">All Amounts</option>
              <option value="Pledged">With Pledges (&gt; ₱0)</option>
              <option value="Fully Paid">Fully Paid</option>
              <option value="Unpaid">Unpaid / Pledged</option>
              <option value="Zero">Zero / In-Kind only</option>
            </select>
          </div>

          <span className="text-on-surface-variant ml-auto">
            Showing <strong>{filteredResponses.length}</strong> of {responses.length} responses
          </span>
        </div>
      </div>

      {/* Responses Table — desktop/large screens only, see the card list below for mobile */}
      <div className="hidden lg:block bg-surface-container-lowest rounded border border-outline-variant/30 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-body text-on-surface-variant">
            <thead className="bg-inverse-surface text-inverse-on-surface eyebrow">
              <tr>
                <th className="py-3 px-4">Batchmate</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Pledge (Parsed PHP)</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Skills / In-Kind</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-on-surface-variant">
                    No survey responses match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredResponses.map((r, idx) => (
                  <tr key={r.id} className={`hover:bg-surface-container-low transition-colors ${idx % 2 === 0 ? 'bg-surface-container-low/50' : ''}`}>

                    {/* Batchmate & Section */}
                    <td className="py-3.5 px-4 font-semibold text-on-surface">
                      <div className="font-serif text-heading">{r.fullName}</div>
                      {r.section2007 && (
                        <span className="text-label text-tertiary font-normal">
                          {r.section2007}
                        </span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div>{r.contactNumber}</div>
                      {r.email && <div className="text-label text-outline">{r.email}</div>}
                    </td>

                    {/* Attendance */}
                    <td className="py-3.5 px-4">
                      <span
                        className="eyebrow whitespace-nowrap"
                        style={{ color: STATUS_EDGE[statusFromAttendance(r.attendance)].onDark }}
                      >
                        {STATUS_EDGE[statusFromAttendance(r.attendance)].label}
                      </span>
                    </td>

                    {/* Pledge */}
                    <td className="py-3.5 px-4">
                      {r.computedPledgeAmount > 0 ? (
                        <div className="font-serif text-heading text-primary">
                          {formatPHP(r.computedPledgeAmount)}
                          <div className="text-label text-on-surface-variant font-normal">
                            {r.pledgeOption} {r.customPledgeAmount ? `(${r.customPledgeAmount})` : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-outline">₱0</span>
                      )}
                    </td>

                    {/* Payment Status Dropdown */}
                    <td className="py-3.5 px-4">
                      {r.computedPledgeAmount > 0 ? (
                        <select
                          value={r.pledgePaidStatus || 'Unpaid / Pledged'}
                          onChange={(e) => onUpdatePaymentStatus(r.id, e.target.value as any)}
                          className={`text-label font-semibold px-2 py-1 rounded border focus:outline-none ${
                            r.pledgePaidStatus === 'Fully Paid' ? 'bg-success-container text-on-success-container border-success' :
                            r.pledgePaidStatus === 'Partially Paid' ? 'bg-tertiary-container/25 text-on-tertiary-container border-tertiary' :
                            'bg-primary-container/20 text-on-primary-container border-primary-container'
                          }`}
                        >
                          <option value="Unpaid / Pledged">Unpaid / Pledged</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Fully Paid">Fully Paid</option>
                        </select>
                      ) : (
                        <span className="text-outline text-label">N/A</span>
                      )}
                    </td>

                    {/* Skills & Sponsorship */}
                    <td className="py-3.5 px-4 max-w-[200px] truncate">
                      <div className="text-on-surface truncate" title={r.skillsOffered.join(', ')}>
                        {r.skillsOffered.length > 0 ? r.skillsOffered.join(', ') : 'None'}
                      </div>
                      {r.otherSponsorships.length > 0 && !r.otherSponsorships.includes('None for now') && (
                        <div className="text-label text-primary truncate" title={r.otherSponsorships.join(', ')}>
                          🎁 {r.otherSponsorships.join(', ')}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedResponse(r)}
                          title="Inspect Full Response"
                          className="btn-icon"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Delete survey response from ${r.fullName}?`)) {
                              onDeleteResponse(r.id);
                            }
                          }}
                          title="Delete response"
                          className="btn-icon btn-icon-danger"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responses Cards — mobile/tablet only, mirrors the table above */}
      <div className="lg:hidden space-y-3">
        {filteredResponses.length === 0 ? (
          <div className="py-8 text-center text-body text-on-surface-variant bg-surface-container-lowest rounded border border-outline-variant/30">
            No survey responses match your filter criteria.
          </div>
        ) : (
          filteredResponses.map((r) => (
            <div
              key={r.id}
              className="bg-surface-container-lowest rounded p-4 border border-outline-variant/30 shadow-soft space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-serif text-heading text-on-surface">{r.fullName}</div>
                  {r.section2007 && (
                    <span className="text-label text-tertiary font-normal">{r.section2007}</span>
                  )}
                </div>
                <span
                  className="flex-shrink-0 eyebrow whitespace-nowrap"
                  style={{ color: STATUS_EDGE[statusFromAttendance(r.attendance)].onDark }}
                >
                  {STATUS_EDGE[statusFromAttendance(r.attendance)].label}
                </span>
              </div>

              <div className="text-body text-on-surface-variant">
                <div>{r.contactNumber}</div>
                {r.email && <div className="text-label text-outline">{r.email}</div>}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-outline-variant/20">
                <div>
                  {r.computedPledgeAmount > 0 ? (
                    <div className="font-serif text-heading text-primary">
                      {formatPHP(r.computedPledgeAmount)}
                      <div className="text-label text-on-surface-variant font-normal">
                        {r.pledgeOption} {r.customPledgeAmount ? `(${r.customPledgeAmount})` : ''}
                      </div>
                    </div>
                  ) : (
                    <span className="font-serif text-heading text-outline">₱0</span>
                  )}
                </div>

                {r.computedPledgeAmount > 0 ? (
                  <select
                    value={r.pledgePaidStatus || 'Unpaid / Pledged'}
                    onChange={(e) => onUpdatePaymentStatus(r.id, e.target.value as any)}
                    className={`text-label font-semibold px-2 py-1 rounded border focus:outline-none ${
                      r.pledgePaidStatus === 'Fully Paid' ? 'bg-success-container text-on-success-container border-success' :
                      r.pledgePaidStatus === 'Partially Paid' ? 'bg-tertiary-container/25 text-on-tertiary-container border-tertiary' :
                      'bg-primary-container/20 text-on-primary-container border-primary-container'
                    }`}
                  >
                    <option value="Unpaid / Pledged">Unpaid / Pledged</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Fully Paid">Fully Paid</option>
                  </select>
                ) : (
                  <span className="text-outline text-label">N/A</span>
                )}
              </div>

              {(r.skillsOffered.length > 0 || r.otherSponsorships.length > 0) && (
                <div className="text-label text-on-surface-variant truncate">
                  {r.skillsOffered.length > 0 ? r.skillsOffered.join(', ') : 'None'}
                  {r.otherSponsorships.length > 0 && !r.otherSponsorships.includes('None for now') && (
                    <span className="text-primary"> · 🎁 {r.otherSponsorships.join(', ')}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedResponse(r)}
                  title="Inspect Full Response"
                  className="btn-icon"
                >
                  <Eye className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Delete survey response from ${r.fullName}?`)) {
                      onDeleteResponse(r.id);
                    }
                  }}
                  title="Delete response"
                  className="btn-icon btn-icon-danger"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Response Detail Modal */}
      {selectedResponse && (
        <ResponseDetailModal
          response={selectedResponse}
          onClose={() => setSelectedResponse(null)}
          onUpdatePaymentStatus={onUpdatePaymentStatus}
        />
      )}

    </div>
  );
};
