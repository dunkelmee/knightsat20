import React, { useState } from 'react';
import {
  Search, Download, Eye, Trash2, Filter,
  Check, FileSpreadsheet, HeartHandshake, Users
} from 'lucide-react';
import { SurveyResponse, PlannedExpense } from '../../types';
import { formatPHP } from '../../utils/pledgeParser';
import { exportSurveyResponsesToCSV, exportPledgesAndExpensesToCSV } from '../../utils/exportUtils';
import { ResponseDetailModal } from './ResponseDetailModal';

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

  // Compute metrics
  const totalPledges = responses.reduce((acc, r) => acc + (r.computedPledgeAmount || 0), 0);
  const pledgingCount = responses.filter(r => r.computedPledgeAmount > 0).length;

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

      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface-container-lowest rounded p-5 border border-outline-variant/30 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-label font-bold text-on-surface-variant uppercase tracking-wider">Total Submissions</span>
            <div className="text-title font-bold text-on-surface mt-1">{responses.length}</div>
            <p className="text-label text-on-surface-variant">Batchmates responded</p>
          </div>
          <div className="w-10 h-10 rounded bg-tertiary-container/25 text-on-tertiary-container flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded p-5 border border-primary-container/50 shadow-soft flex items-center justify-between">
          <div>
            <span className="text-label font-bold text-on-primary-container uppercase tracking-wider">Total Pledges Extracted</span>
            <div className="text-title font-bold text-primary mt-1">{formatPHP(totalPledges)}</div>
            <p className="text-label text-on-surface-variant">{pledgingCount} batchmates pledging</p>
          </div>
          <div className="w-10 h-10 rounded bg-primary-container/20 text-primary flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded p-5 border border-success-container shadow-soft flex items-center justify-between">
          <div>
            <span className="text-label font-bold text-on-success-container uppercase tracking-wider">Pledges Collected</span>
            <div className="text-title font-bold text-success mt-1">
              {formatPHP(responses.filter(r => r.pledgePaidStatus === 'Fully Paid').reduce((a, b) => a + b.computedPledgeAmount, 0))}
            </div>
            <p className="text-label text-on-surface-variant">Marked as Fully Paid</p>
          </div>
          <div className="w-10 h-10 rounded bg-success-container text-success flex items-center justify-center font-bold">
            <Check className="w-5 h-5" />
          </div>
        </div>
      </div>

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

          {/* Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-export-survey-csv"
              type="button"
              onClick={() => exportSurveyResponsesToCSV(responses)}
              className="px-3.5 py-2 rounded bg-success hover:opacity-90 text-on-success text-body font-bold shadow-soft transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Full CSV</span>
            </button>

            <button
              id="btn-export-financials-csv"
              type="button"
              onClick={() => exportPledgesAndExpensesToCSV(responses, expenses)}
              className="px-3.5 py-2 rounded bg-secondary hover:opacity-90 text-on-secondary text-body font-bold shadow-soft transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Pledges & Ledger CSV</span>
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-outline-variant/20 text-body">
          <div className="flex items-center gap-2 text-on-surface-variant font-medium">
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
              <option value="Yes, definitely!">Yes, definitely!</option>
              <option value="Most likely, but still confirming">Most likely</option>
              <option value="Not sure yet">Not sure yet</option>
              <option value="Unfortunately, I won’t be able to attend">Declined</option>
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
            <thead className="bg-inverse-surface text-inverse-on-surface uppercase text-label tracking-wider">
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
                      <span className={`px-2 py-0.5 rounded-full text-label font-bold ${
                        r.attendance.includes('Yes') ? 'bg-success-container text-on-success-container' :
                        r.attendance.includes('Most likely') ? 'bg-tertiary-container/25 text-on-tertiary-container' :
                        r.attendance.includes('Not sure') ? 'bg-primary-container/20 text-on-primary-container' :
                        'bg-error-container text-on-error-container'
                      }`}>
                        {r.attendance.replace('Unfortunately, I won’t be able to attend', 'Cannot attend')}
                      </span>
                    </td>

                    {/* Pledge */}
                    <td className="py-3.5 px-4 font-bold">
                      {r.computedPledgeAmount > 0 ? (
                        <div className="text-primary font-bold">
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
                          className="p-1.5 rounded bg-tertiary-container/20 hover:bg-tertiary-container/35 text-on-tertiary-container transition-colors"
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
                          className="p-1.5 rounded bg-error-container hover:opacity-80 text-on-error-container transition-colors"
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
                  <div className="font-serif font-semibold text-heading text-on-surface">{r.fullName}</div>
                  {r.section2007 && (
                    <span className="text-label text-tertiary font-normal">{r.section2007}</span>
                  )}
                </div>
                <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-label font-bold ${
                  r.attendance.includes('Yes') ? 'bg-success-container text-on-success-container' :
                  r.attendance.includes('Most likely') ? 'bg-tertiary-container/25 text-on-tertiary-container' :
                  r.attendance.includes('Not sure') ? 'bg-primary-container/20 text-on-primary-container' :
                  'bg-error-container text-on-error-container'
                }`}>
                  {r.attendance.replace('Unfortunately, I won’t be able to attend', 'Cannot attend')}
                </span>
              </div>

              <div className="text-body text-on-surface-variant">
                <div>{r.contactNumber}</div>
                {r.email && <div className="text-label text-outline">{r.email}</div>}
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-outline-variant/20">
                <div>
                  {r.computedPledgeAmount > 0 ? (
                    <div className="text-primary font-bold text-heading">
                      {formatPHP(r.computedPledgeAmount)}
                      <div className="text-label text-on-surface-variant font-normal">
                        {r.pledgeOption} {r.customPledgeAmount ? `(${r.customPledgeAmount})` : ''}
                      </div>
                    </div>
                  ) : (
                    <span className="text-outline text-heading">₱0</span>
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
                  className="p-1.5 rounded bg-tertiary-container/20 hover:bg-tertiary-container/35 text-on-tertiary-container transition-colors"
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
                  className="p-1.5 rounded bg-error-container hover:opacity-80 text-on-error-container transition-colors"
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
