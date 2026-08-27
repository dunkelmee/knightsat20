import { SurveyResponse, PlannedExpense, RSVPRecord } from '../types';

export function exportSurveyResponsesToCSV(responses: SurveyResponse[]) {
  const headers = [
    'Submission ID',
    'Date Submitted',
    'Full Name',
    'Contact Number',
    'Email',
    '2007 Section',
    'Attendance Status',
    'Attendance Notes / Decision Helper',
    'Preferred Months',
    'Specific Date Notes',
    'Venue Suggestion',
    'Preferred Venue Type',
    'Pledge Option',
    'Custom Pledge Input',
    'Computed Pledge Amount (PHP)',
    'Pledge Payment Status',
    'Other Sponsorships',
    'Other Sponsorship Details',
    'Skills Offered',
    'Skills Details',
    'Nominated Organizer',
    'Willing to Help Organize',
    'Bringing +1',
    'Bringing Kids',
    'Kids Count',
    'Other Suggestions'
  ];

  const escapeCSV = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = responses.map(r => [
    escapeCSV(r.id),
    escapeCSV(new Date(r.submittedAt).toLocaleString()),
    escapeCSV(r.fullName),
    escapeCSV(r.contactNumber),
    escapeCSV(r.email || ''),
    escapeCSV(r.section2007 || ''),
    escapeCSV(r.attendance),
    escapeCSV(r.attendanceReason || ''),
    escapeCSV(r.preferredMonths.join(', ')),
    escapeCSV(r.specificDateNotes || ''),
    escapeCSV(r.venueSuggestion || ''),
    escapeCSV(r.preferredVenueType === 'Other' && r.venueTypeOther ? `Other: ${r.venueTypeOther}` : r.preferredVenueType),
    escapeCSV(r.pledgeOption),
    escapeCSV(r.customPledgeAmount || ''),
    escapeCSV(r.computedPledgeAmount),
    escapeCSV(r.pledgePaidStatus || 'Unpaid / Pledged'),
    escapeCSV(r.otherSponsorships.join(', ')),
    escapeCSV(r.otherSponsorshipDetails || ''),
    escapeCSV(r.skillsOffered.join(', ')),
    escapeCSV(r.skillsDetails || ''),
    escapeCSV(r.nominatedOrganizer || ''),
    escapeCSV(r.willingToOrganize),
    escapeCSV(r.bringingPlusOne),
    escapeCSV(r.bringingKids),
    escapeCSV(r.kidsCount ?? 0),
    escapeCSV(r.otherSuggestions || '')
  ]);

  const csvContent = [headers.map(h => `"${h}"`).join(','), ...rows.map(row => row.join(','))].join('\r\n');
  downloadFile(csvContent, `MSHS_Batch_2007_Survey_Responses_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

export function exportPledgesAndExpensesToCSV(responses: SurveyResponse[], expenses: PlannedExpense[]) {
  const lines: string[] = [];

  lines.push('"MSHS BATCH 2007 REUNION - FINANCIAL REPORT"');
  lines.push(`"Generated On:","${new Date().toLocaleString()}"`);
  lines.push('');

  // Pledges summary
  const totalPledges = responses.reduce((acc, r) => acc + (r.computedPledgeAmount || 0), 0);
  lines.push('"=== PLEDGES & CONTRIBUTIONS LEDGER ==="');
  lines.push('"Batchmate Name","Contact","Pledge Tier / Option","Raw Input","Parsed Amount (PHP)","Status","Other In-Kind Sponsorships"');

  responses.forEach(r => {
    const name = `"${(r.fullName || '').replace(/"/g, '""')}"`;
    const contact = `"${(r.contactNumber || '').replace(/"/g, '""')}"`;
    const tier = `"${(r.pledgeOption || '').replace(/"/g, '""')}"`;
    const raw = `"${(r.customPledgeAmount || '').replace(/"/g, '""')}"`;
    const amt = r.computedPledgeAmount;
    const status = `"${(r.pledgePaidStatus || 'Unpaid / Pledged').replace(/"/g, '""')}"`;
    const inKind = `"${(r.otherSponsorships || []).join(', ').replace(/"/g, '""')}"`;
    lines.push(`${name},${contact},${tier},${raw},${amt},${status},${inKind}`);
  });

  lines.push(`"TOTAL PLEDGES","","","","${totalPledges}","",""`);
  lines.push('');

  // Expenses summary
  const totalExpenses = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  lines.push('"=== PLANNED EXPENSES LEDGER ==="');
  lines.push('"Expense Item","Category","Target Date","Status","Estimated Amount (PHP)","Notes"');

  expenses.forEach(e => {
    const name = `"${(e.name || '').replace(/"/g, '""')}"`;
    const cat = `"${(e.category || '').replace(/"/g, '""')}"`;
    const dt = `"${(e.targetDate || '').replace(/"/g, '""')}"`;
    const st = `"${(e.status || '').replace(/"/g, '""')}"`;
    const amt = e.amount;
    const notes = `"${(e.notes || '').replace(/"/g, '""')}"`;
    lines.push(`${name},${cat},${dt},${st},${amt},${notes}`);
  });

  lines.push(`"TOTAL PLANNED EXPENSES","","","","${totalExpenses}",""`);
  lines.push('');

  const netBalance = totalPledges - totalExpenses;
  lines.push(`"NET RUNNING BALANCE (PLEDGES - EXPENSES)","","","","${netBalance}",""`);

  const csvContent = lines.join('\r\n');
  downloadFile(csvContent, `MSHS_Batch_2007_Operating_Funds_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8;');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
