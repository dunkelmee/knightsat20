import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Send, Users, CheckCircle2, MessageSquare, 
  UserPlus, Check, Clock, Plus, Minus, Search,
  ClipboardList, ChevronDown, ChevronUp, Sparkles, Filter
} from 'lucide-react';
import { RSVPRecord } from '../types';

interface RsvpSectionProps {
  rsvps: RSVPRecord[];
  onRsvpSubmitted: (rsvp: RSVPRecord) => void;
  onNavigateToSurvey: () => void;
}

export const RsvpSection: React.FC<RsvpSectionProps> = ({
  rsvps,
  onRsvpSubmitted,
  onNavigateToSurvey,
}) => {
  const [showExpressForm, setShowExpressForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Attending' | 'Maybe'>('All');

  // Form State
  const [fullName, setFullName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<RSVPRecord['status']>('Attending');
  const [plusOnesCount, setPlusOnesCount] = useState<number>(0);
  const [kidsCount, setKidsCount] = useState<number>(0);
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [messageToBatch, setMessageToBatch] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Computations
  const attendingList = rsvps.filter(r => r.status === 'Attending');
  const maybeList = rsvps.filter(r => r.status === 'Maybe');

  const plusOnesTotal = attendingList.reduce((acc, r) => acc + (r.bringingPlusOne ? 1 : 0), 0);
  const kidsTotal = attendingList.reduce((acc, r) => acc + (r.kidsCount || 0), 0);
  const totalHeadcount = attendingList.length + plusOnesTotal + kidsTotal;

  // Filtered roster
  const filteredRsvps = rsvps.filter(r => {
    const matchesSearch = r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.messageToBatch && r.messageToBatch.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your name.');
      return;
    }
    setError('');

    const newRsvp: RSVPRecord = {
      id: `rsvp-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      fullName: fullName.trim(),
      contactNumber: contactNumber.trim() || undefined,
      email: email.trim() || undefined,
      status,
      bringingPlusOne: status === 'Attending' ? plusOnesCount > 0 : false,
      kidsCount: status === 'Attending' ? kidsCount : 0,
      dietaryRestrictions: dietaryRestrictions.trim() || undefined,
      messageToBatch: messageToBatch.trim() || undefined,
    };

    if (status === 'Attending') {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch {}
    }

    onRsvpSubmitted(newRsvp);
    setIsSubmitted(true);
  };

  return (
    <div id="rsvp-section-container" className="max-w-5xl mx-auto py-5 px-4 space-y-5">
      
      {/* Informative Survey vs Roster Clarification Banner */}
      <div className="bg-[#f5efe6] rounded-xl p-4 sm:p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
              Unified Headcount
            </span>
            <h2 className="text-sm sm:text-base font-semibold text-stone-900">
              Batch 2007 Attendee Roster & Guest List
            </h2>
          </div>
          <p className="text-xs text-stone-600 max-w-xl">
            <strong className="text-stone-900 font-semibold">Completing the Reunion Survey automatically adds you to this roster</strong> and records your venue/date votes. If you already filled out the survey, you are already counted below!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onNavigateToSurvey}
            className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Answer Full Survey</span>
          </button>
        </div>
      </div>

      {/* Sleek Minimalist Headcount Strip */}
      <div id="rsvp-headcount-cards" className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium mb-0.5">
            <span>Attending Alumni</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-2xl font-semibold text-stone-900">
            {attendingList.length}
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium mb-0.5">
            <span>Plus-Ones & Kids</span>
            <UserPlus className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <div className="text-2xl font-semibold text-stone-900">
            +{plusOnesTotal + kidsTotal}
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium mb-0.5">
            <span>Total Headcount</span>
            <Users className="w-3.5 h-3.5 text-stone-500" />
          </div>
          <div className="text-2xl font-semibold text-stone-900">
            {totalHeadcount}
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium mb-0.5">
            <span>Tentative (Maybe)</span>
            <Clock className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <div className="text-2xl font-semibold text-stone-900">
            {maybeList.length}
          </div>
        </div>
      </div>

      {/* Express Status Update / Message Accordion */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <button
          type="button"
          onClick={() => setShowExpressForm(!showExpressForm)}
          className="w-full p-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center border border-amber-200">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-stone-900">
                Post a Quick Shoutout / Message (Quick Form)
              </div>
              <div className="text-[11px] text-stone-500">
                Want to leave a quick message or shoutout for the batch without the 10-question survey? Click here.
              </div>
            </div>
          </div>
          <div className="text-stone-400">
            {showExpressForm ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showExpressForm && (
          <div className="p-4 sm:p-5 border-t border-stone-100 bg-[#fdfcf9]">
            {isSubmitted ? (
              <div className="text-center py-5 space-y-2.5">
                <div className="w-9 h-9 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                  <Check className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-semibold text-stone-900">
                  Thanks, {fullName}!
                </h3>
                <p className="text-xs text-stone-600">
                  Your shoutout and status have been posted to the board below.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setFullName('');
                    setContactNumber('');
                    setEmail('');
                    setMessageToBatch('');
                    setPlusOnesCount(0);
                    setKidsCount(0);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold border border-stone-200"
                >
                  Submit Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-3">
                {error && (
                  <div className="p-2 rounded-lg bg-red-50 text-red-800 text-xs font-medium border border-red-200">
                    {error}
                  </div>
                )}

                {/* Status Radio */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Attendance Status <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { val: 'Attending', label: 'Attending 🎉' },
                      { val: 'Maybe', label: 'Maybe 🤔' },
                      { val: 'Decline', label: 'Can’t join 😢' },
                    ].map((s) => (
                      <label
                        key={s.val}
                        className={`p-2 rounded-lg border text-center text-xs cursor-pointer transition-all ${
                          status === s.val 
                            ? 'border-amber-700 bg-amber-50 text-stone-900 font-semibold ring-1 ring-amber-700' 
                            : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="rsvpStatus"
                          checked={status === s.val}
                          onChange={() => setStatus(s.val as any)}
                          className="sr-only"
                        />
                        <span>{s.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="input-rsvp-name"
                    type="text"
                    required
                    placeholder="e.g. Juan dela Cruz (IV-Curie)"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white"
                  />
                </div>

                {/* Companions */}
                {status === 'Attending' && (
                  <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2.5">
                    <div className="text-xs font-semibold text-stone-700">Companions (0 if attending alone)</div>
                    
                    <div className="grid grid-cols-2 gap-2.5">
                      {/* Plus Ones */}
                      <div className="bg-white p-2 rounded-lg border border-stone-200 flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-700">Adult (+1s)</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPlusOnesCount(Math.max(0, plusOnesCount - 1))}
                            className="w-6 h-6 rounded-md bg-stone-100 font-semibold text-xs hover:bg-stone-200 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-semibold">{plusOnesCount}</span>
                          <button
                            type="button"
                            onClick={() => setPlusOnesCount(plusOnesCount + 1)}
                            className="w-6 h-6 rounded-md bg-stone-100 font-semibold text-xs hover:bg-stone-200 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* Kids */}
                      <div className="bg-white p-2 rounded-lg border border-stone-200 flex items-center justify-between">
                        <span className="text-xs font-medium text-stone-700">Kids</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setKidsCount(Math.max(0, kidsCount - 1))}
                            className="w-6 h-6 rounded-md bg-stone-100 font-semibold text-xs hover:bg-stone-200 flex items-center justify-center"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-5 text-center text-xs font-semibold">{kidsCount}</span>
                          <button
                            type="button"
                            onClick={() => setKidsCount(kidsCount + 1)}
                            className="w-6 h-6 rounded-md bg-stone-100 font-semibold text-xs hover:bg-stone-200 flex items-center justify-center"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Message / Shoutout for Batch 2007:
                  </label>
                  <textarea
                    id="input-rsvp-message"
                    rows={2}
                    placeholder="Leave a short greeting or message for batchmates..."
                    value={messageToBatch}
                    onChange={(e) => setMessageToBatch(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-600 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowExpressForm(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-600 hover:bg-stone-100"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-submit-rsvp"
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Save to Roster</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Main Attendee Roster & Shoutouts Card */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-4 shadow-xs">
        
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-800" />
            <h3 className="text-sm sm:text-base font-semibold text-stone-900">
              Live Roster ({filteredRsvps.length})
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search batchmate..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-amber-600 bg-stone-50"
              />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1">
              {(['All', 'Attending', 'Maybe'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setStatusFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === filter
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Roster Grid */}
        {filteredRsvps.length === 0 ? (
          <div className="text-center py-8 text-xs text-stone-500">
            No batchmates found matching "{searchQuery}".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
            {filteredRsvps.map((r) => (
              <div 
                key={r.id}
                className="p-3.5 rounded-xl bg-stone-50/70 hover:bg-stone-50 border border-stone-200/90 transition-all flex flex-col justify-between gap-2.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-xs text-stone-900">
                        {r.fullName}
                      </div>
                      {(r.bringingPlusOne || (r.kidsCount && r.kidsCount > 0)) && (
                        <div className="text-[11px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                          <UserPlus className="w-3 h-3 text-stone-400" />
                          <span>
                            {r.bringingPlusOne ? '+1 Adult Guest' : ''}
                            {r.bringingPlusOne && r.kidsCount ? ' • ' : ''}
                            {r.kidsCount ? `${r.kidsCount} Kid${r.kidsCount > 1 ? 's' : ''}` : ''}
                          </span>
                        </div>
                      )}
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${
                      r.status === 'Attending' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                      r.status === 'Maybe' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {r.status === 'Attending' ? '✓ Attending' : r.status === 'Maybe' ? '⏳ Maybe' : 'Can’t Join'}
                    </span>
                  </div>

                  {r.messageToBatch && (
                    <div className="text-xs text-stone-700 bg-white p-2.5 rounded-lg border border-stone-200/80 shadow-2xs flex items-start gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-700 mt-0.5 flex-shrink-0" />
                      <p className="italic text-[11px] leading-relaxed">
                        &quot;{r.messageToBatch}&quot;
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-200/50">
                  <span>MakSci Batch 2007</span>
                  <span>{new Date(r.submittedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
