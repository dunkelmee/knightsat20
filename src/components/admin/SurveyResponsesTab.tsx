import React, { useState } from 'react';
import { 
  Search, Download, Copy, Eye, Trash2, Filter, 
  Check, FileSpreadsheet, HeartHandshake, Users, ArrowUpDown 
} from 'lucide-react';
import { SurveyResponse, PlannedExpense } from '../../types';
import { formatPHP } from '../../utils/pledgeParser';
import { exportSurveyResponsesToCSV, exportPledgesAndExpensesToCSV, copyPledgesSummaryToClipboard } from '../../utils/exportUtils';
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
  const [copiedToast, setCopiedToast] = useState(false);

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

  const handleCopyClipboard = () => {
    copyPledgesSummaryToClipboard(responses);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2500);
  };

  return (
    <div id="survey-responses-tab" className="space-y-6">
      
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Submissions</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{responses.length}</div>
            <p className="text-[11px] text-slate-400">Batchmates responded</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Total Pledges Extracted</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{formatPHP(totalPledges)}</div>
            <p className="text-[11px] text-slate-400">{pledgingCount} batchmates pledging</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <HeartHandshake className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Pledges Collected</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {formatPHP(responses.filter(r => r.pledgePaidStatus === 'Fully Paid').reduce((a, b) => a + b.computedPledgeAmount, 0))}
            </div>
            <p className="text-[11px] text-slate-400">Marked as Fully Paid</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Check className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Toolbar & Exports */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, contact, section, skill, venue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Export Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-export-survey-csv"
              type="button"
              onClick={() => exportSurveyResponsesToCSV(responses)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Export Full CSV</span>
            </button>

            <button
              id="btn-export-financials-csv"
              type="button"
              onClick={() => exportPledgesAndExpensesToCSV(responses, expenses)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Pledges & Ledger CSV</span>
            </button>

            <button
              id="btn-copy-pledges-summary"
              type="button"
              onClick={handleCopyClipboard}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              {copiedToast ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy Summary'}</span>
            </button>
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Attendance:</span>
            <select
              value={attendanceFilter}
              onChange={(e) => setAttendanceFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Yes, definitely!">Yes, definitely!</option>
              <option value="Most likely, but still confirming">Most likely</option>
              <option value="Not sure yet">Not sure yet</option>
              <option value="Unfortunately, I won’t be able to attend">Declined</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Pledges:</span>
            <select
              value={pledgeFilter}
              onChange={(e) => setPledgeFilter(e.target.value)}
              className="px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs"
            >
              <option value="All">All Amounts</option>
              <option value="Pledged">With Pledges (&gt; ₱0)</option>
              <option value="Fully Paid">Fully Paid</option>
              <option value="Unpaid">Unpaid / Pledged</option>
              <option value="Zero">Zero / In-Kind only</option>
            </select>
          </div>

          <span className="text-slate-400 ml-auto">
            Showing <strong>{filteredResponses.length}</strong> of {responses.length} responses
          </span>
        </div>
      </div>

      {/* Responses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-900 text-white uppercase text-[10px] tracking-wider">
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
            <tbody className="divide-y divide-slate-100">
              {filteredResponses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No survey responses match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredResponses.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Batchmate & Section */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div>{r.fullName}</div>
                      {r.section2007 && (
                        <span className="text-[10px] text-blue-600 font-normal">
                          {r.section2007}
                        </span>
                      )}
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div>{r.contactNumber}</div>
                      {r.email && <div className="text-[10px] text-slate-400">{r.email}</div>}
                    </td>

                    {/* Attendance */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        r.attendance.includes('Yes') ? 'bg-emerald-100 text-emerald-800' :
                        r.attendance.includes('Most likely') ? 'bg-blue-100 text-blue-800' :
                        r.attendance.includes('Not sure') ? 'bg-amber-100 text-amber-800' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {r.attendance.replace('Unfortunately, I won’t be able to attend', 'Cannot attend')}
                      </span>
                    </td>

                    {/* Pledge */}
                    <td className="py-3.5 px-4 font-bold">
                      {r.computedPledgeAmount > 0 ? (
                        <div className="text-amber-600 font-extrabold">
                          {formatPHP(r.computedPledgeAmount)}
                          <div className="text-[10px] text-slate-400 font-normal">
                            {r.pledgeOption} {r.customPledgeAmount ? `(${r.customPledgeAmount})` : ''}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">₱0</span>
                      )}
                    </td>

                    {/* Payment Status Dropdown */}
                    <td className="py-3.5 px-4">
                      {r.computedPledgeAmount > 0 ? (
                        <select
                          value={r.pledgePaidStatus || 'Unpaid / Pledged'}
                          onChange={(e) => onUpdatePaymentStatus(r.id, e.target.value as any)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-md border focus:outline-none ${
                            r.pledgePaidStatus === 'Fully Paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                            r.pledgePaidStatus === 'Partially Paid' ? 'bg-blue-50 text-blue-800 border-blue-300' :
                            'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="Unpaid / Pledged">Unpaid / Pledged</option>
                          <option value="Partially Paid">Partially Paid</option>
                          <option value="Fully Paid">Fully Paid</option>
                        </select>
                      ) : (
                        <span className="text-slate-400 text-[11px]">N/A</span>
                      )}
                    </td>

                    {/* Skills & Sponsorship */}
                    <td className="py-3.5 px-4 max-w-[200px] truncate">
                      <div className="text-slate-800 truncate" title={r.skillsOffered.join(', ')}>
                        {r.skillsOffered.length > 0 ? r.skillsOffered.join(', ') : 'None'}
                      </div>
                      {r.otherSponsorships.length > 0 && !r.otherSponsorships.includes('None for now') && (
                        <div className="text-[10px] text-amber-700 truncate" title={r.otherSponsorships.join(', ')}>
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
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
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
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
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
