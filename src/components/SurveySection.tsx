import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Send, ChevronRight, ChevronLeft,
  Minus, Plus
} from 'lucide-react';
import { SurveyResponse, SurveyResponseCreate } from '../types';
import { parsePledgeAmount, parseRawAmountString, formatPHP } from '../utils/pledgeParser';

interface SurveySectionProps {
  submitterName: string;
  existingResponse: SurveyResponse | null;
  onSurveySubmitted: (response: SurveyResponseCreate) => void;
  onNavigateToRsvp: () => void;
}

// Reverses the "Other: <text>" encoding handleSubmit applies to multiselect
// answers, splitting a stored list back into its selectable values plus the
// free-text entry — needed to prefill the form from an existing response.
const splitOtherEntries = (values: string[]): { normalized: string[]; otherText: string } => {
  let otherText = '';
  const normalized = values.map((value) => {
    if (value.startsWith('Other: ')) {
      otherText = value.slice('Other: '.length);
      return 'Other';
    }
    return value;
  });
  return { normalized, otherText };
};

// Paper-card option / tile / pill styles shared across the survey's question
// types — mirrors the Memory Desk design's opt()/tile()/pill() helpers.
const optClass = (active: boolean) =>
  `flex items-center gap-2.5 text-left p-3 rounded-xl cursor-pointer transition-all text-body font-medium ${
    active
      ? 'bg-primary/10 border-[1.5px] border-primary/50 text-primary'
      : 'bg-black/[0.025] border-[1.5px] border-outline-variant/40 text-on-surface-variant hover:border-outline-variant'
  }`;

const tileClass = (active: boolean) =>
  `flex flex-col items-start gap-0.5 p-3 rounded-xl cursor-pointer min-w-[88px] transition-all ${
    active
      ? 'bg-primary border-[1.5px] border-primary text-white shadow-soft'
      : 'bg-black/[0.025] border-[1.5px] border-outline-variant/40 text-on-surface'
  }`;

// Size is a branch here rather than utilities appended at the call site, since
// px-*/py-*/rounded-*/text-* overrides would collide with the defaults and the
// winner would come down to Tailwind's emit order. Two variants, both carrying
// the same 12px `body` type — they differ only in shape: 'snug' trades the full
// pill radius for less padding and a tighter corner, because in a two-column
// grid (Q05 skills, Q07 sponsorships) a rounded-full pill stretches to the full
// column and reads as an inflated lozenge.
type PillSize = 'default' | 'snug';

const PILL_SIZE: Record<PillSize, string> = {
  default: 'px-3 py-1.5 rounded-full text-body',
  snug: 'px-3 py-1 rounded-lg text-body',
};

const pillClass = (active: boolean, size: PillSize = 'default') =>
  `${PILL_SIZE[size]} cursor-pointer font-medium transition-all ${
    active
      ? 'bg-primary/10 border border-primary/50 text-primary'
      : 'bg-black/[0.025] border border-outline-variant/40 text-on-surface-variant'
  }`;

const cardClass = 'bg-surface-container-low rounded p-4.5 sm:p-5 @min-[700px]/app:px-5 @min-[700px]/app:py-4.5 shadow-soft space-y-3';

// Every numbered question renders its heading through this, so the type stays
// identical across all three steps — serif for the question, mono for a badge,
// and the option labels below it are sans throughout (see optClass/tileClass).
const QuestionHeading: React.FC<{
  n: string;
  required?: boolean;
  badge?: string;
  children: React.ReactNode;
}> = ({ n, required, badge, children }) => (
  // Not flex-wrap: with the badge pushed right by `ml-auto`, a title long
  // enough to crowd it (Q06) dropped the pill onto its own line, stranded at
  // the far right. Instead the title takes the remaining space and wraps
  // inside its own column, so the pill stays pinned beside the first line.
  <div className="flex items-baseline gap-2.5">
    <span className="flex-none font-serif text-heading leading-none text-on-surface/40">{n}</span>
    <span className="flex-1 min-w-0 font-serif text-heading leading-[1.18] text-on-surface">
      {children}
      {required && <span className="text-error"> *</span>}
    </span>
    {badge && (
      <span className="flex-none px-2.5 py-1 rounded-full font-mono text-label font-semibold tracking-wide uppercase bg-black/[0.05] text-on-surface-variant/70">
        {badge}
      </span>
    )}
  </div>
);

export const SurveySection: React.FC<SurveySectionProps> = ({
  submitterName,
  existingResponse,
  onSurveySubmitted,
  onNavigateToRsvp,
}) => {
  // Step navigation (1, 2, 3)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Step 1: Dates & Attendance
  const [attendance, setAttendance] = useState<SurveyResponse['attendance']>('Yes, definitely!');
  const [attendanceReason, setAttendanceReason] = useState<string>('');
  const [preferredMonths, setPreferredMonths] = useState<string[]>(['April', 'December']);
  const [specificDateNotes, setSpecificDateNotes] = useState<string>('');
  const [venueSuggestion, setVenueSuggestion] = useState<string>('');
  const [preferredVenueType, setPreferredVenueType] = useState<string[]>(['Hotel / function room in Makati or BGC']);
  const [venueTypeOther, setVenueTypeOther] = useState<string>('');

  // Step 2: Organizing & Skills
  const [willingToOrganize, setWillingToOrganize] = useState<SurveyResponse['willingToOrganize']>('Maybe, depending on tasks');
  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsOtherText, setSkillsOtherText] = useState<string>('');
  const [skillsDetails, setSkillsDetails] = useState<string>('');
  const [nominatedOrganizer, setNominatedOrganizer] = useState<string>('');

  // Step 3: Pledges, Guests & Suggestions
  const [pledgeOption, setPledgeOption] = useState<string>('₱3,000');
  const [customPledgeAmount, setCustomPledgeAmount] = useState<string>('');
  const [otherSponsorships, setOtherSponsorships] = useState<string[]>([]);
  const [otherSponsorshipsOtherText, setOtherSponsorshipsOtherText] = useState<string>('');
  const [otherSponsorshipDetails, setOtherSponsorshipDetails] = useState<string>('');
  const [plusOnesCount, setPlusOnesCount] = useState<number>(0);
  const [kidsCount, setKidsCount] = useState<number>(0);
  const [otherSuggestions, setOtherSuggestions] = useState<string>('');

  // Form validation errors
  const [errors, setErrors] = useState<{ pledge?: string }>({});

  // Survey is always open and one response per user is stored (see
  // backend upsert in routers/survey_responses.py) — prefill the form with
  // the account's existing answers so re-visiting the tab edits them in
  // place instead of starting blank. Keyed on the response id, which stays
  // stable across edits, so this doesn't clobber in-progress typing when
  // the parent echoes back the just-submitted response.
  useEffect(() => {
    if (!existingResponse) return;

    setAttendance(existingResponse.attendance);
    setAttendanceReason(existingResponse.attendanceReason || '');
    setPreferredMonths(existingResponse.preferredMonths.length ? existingResponse.preferredMonths : ['April', 'December']);
    setSpecificDateNotes(existingResponse.specificDateNotes || '');
    setVenueSuggestion(existingResponse.venueSuggestion || '');

    const venueType = splitOtherEntries(
      existingResponse.preferredVenueType.length
        ? existingResponse.preferredVenueType
        : ['Hotel / function room in Makati or BGC']
    );
    setPreferredVenueType(venueType.normalized);
    setVenueTypeOther(venueType.otherText);

    setWillingToOrganize(existingResponse.willingToOrganize);

    const skills = splitOtherEntries(existingResponse.skillsOffered);
    setSkillsOffered(skills.normalized);
    setSkillsOtherText(skills.otherText);
    setSkillsDetails(existingResponse.skillsDetails || '');
    setNominatedOrganizer(existingResponse.nominatedOrganizer || '');

    setPledgeOption(existingResponse.pledgeOption);
    setCustomPledgeAmount(existingResponse.customPledgeAmount || '');

    const sponsorships = splitOtherEntries(existingResponse.otherSponsorships);
    setOtherSponsorships(sponsorships.normalized);
    setOtherSponsorshipsOtherText(sponsorships.otherText);
    setOtherSponsorshipDetails(existingResponse.otherSponsorshipDetails || '');

    setPlusOnesCount(existingResponse.plusOnesCount || 0);
    setKidsCount(existingResponse.kidsCount || 0);
    setOtherSuggestions(existingResponse.otherSuggestions || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingResponse?.id]);

  const monthsList = [
    'April',
    'December'
  ];

  const venueTypeOptions = [
    'Hotel / function room in Makati or BGC',
    'Private events place / Garden pavilion',
    'Makati Science High School campus',
    'Restaurant / Lounge with private area',
    'Resort / Out of town day-tour',
    'Other'
  ];

  const skillsList = [
    'Program, Host / Emcee',
    'Photo / Video & Slideshow',
    'Graphics, Merch & ID Design',
    'Treasury & Registration',
    'Food, Catering & Drinks',
    'Venue & Ingress Setup',
    'Music, DJ & Entertainment',
    'Reaching Out to Batchmates',
    'Other',
    'Prefer to just attend & relax'
  ];

  const sponsorshipOptions = [
    'Lechon / Main Dish',
    'Craft Beers / Alcoholic Drinks',
    'Dessert / Cake / Grazing table',
    'Raffle Prizes / Gift Bags',
    'Photobooth / Photography',
    'Batch Souvenirs / Shirts',
    'Other',
    'None for now'
  ];

  // Auto calculate numeric pledge (min ₱2,000 for standard tiers)
  const computedPledge = parsePledgeAmount(pledgeOption, customPledgeAmount);

  // Month toggle handler
  const handleMonthToggle = (month: string) => {
    if (preferredMonths.includes(month)) {
      const next = preferredMonths.filter(m => m !== month);
      setPreferredMonths(next);
    } else {
      setPreferredMonths([...preferredMonths, month]);
    }
  };

  // Venue type toggle handler
  const handleVenueTypeToggle = (type: string) => {
    if (preferredVenueType.includes(type)) {
      setPreferredVenueType(preferredVenueType.filter(t => t !== type));
    } else {
      setPreferredVenueType([...preferredVenueType, type]);
    }
  };

  // Skill toggle handler
  const handleSkillToggle = (skill: string) => {
    if (skill === 'Prefer to just attend & relax') {
      setSkillsOffered(['Prefer to just attend & relax']);
      return;
    }

    const filtered = skillsOffered.filter(s => s !== 'Prefer to just attend & relax');
    if (filtered.includes(skill)) {
      setSkillsOffered(filtered.filter(s => s !== skill));
    } else {
      setSkillsOffered([...filtered, skill]);
    }
  };

  // Sponsorship toggle handler
  const handleSponsorshipToggle = (item: string) => {
    if (item === 'None for now') {
      setOtherSponsorships(['None for now']);
      return;
    }

    const filtered = otherSponsorships.filter(s => s !== 'None for now');
    if (filtered.includes(item)) {
      setOtherSponsorships(filtered.filter(s => s !== item));
    } else {
      setOtherSponsorships([...filtered, item]);
    }
  };

  const handleGoToStep2 = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 80, behavior: 'smooth' });
  };

  const handleGoToStep3 = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 80, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (pledgeOption === 'Custom Amount' || pledgeOption === 'Other') {
      const customNum = parseRawAmountString(customPledgeAmount);
      if (!customPledgeAmount.trim() || customNum < 2000) {
        setErrors(prev => ({ ...prev, pledge: 'The minimum pledge amount is ₱2,000. Please enter ₱2,000 or higher.' }));
        return;
      }
    }

    const finalSkills = skillsOffered.map(s => s === 'Other' && skillsOtherText ? `Other: ${skillsOtherText}` : s);
    const finalSponsorships = otherSponsorships.map(s => s === 'Other' && otherSponsorshipsOtherText ? `Other: ${otherSponsorshipsOtherText}` : s);
    const finalVenueType = preferredVenueType.map(t => t === 'Other' && venueTypeOther ? `Other: ${venueTypeOther}` : t);

    const newResponse: SurveyResponseCreate = {
      attendance,
      attendanceReason: attendance === 'Not sure yet' ? attendanceReason : undefined,
      preferredMonths: preferredMonths.length ? preferredMonths : ['April', 'December'],
      specificDateNotes: specificDateNotes.trim() || undefined,
      preferredVenueType: finalVenueType,
      venueSuggestion: venueSuggestion.trim() || undefined,
      willingToOrganize,
      skillsOffered: finalSkills,
      skillsDetails: skillsDetails.trim() || undefined,
      nominatedOrganizer: nominatedOrganizer.trim() || undefined,
      pledgeOption,
      customPledgeAmount: customPledgeAmount.trim() || undefined,
      otherSponsorships: finalSponsorships,
      otherSponsorshipDetails: otherSponsorshipDetails.trim() || undefined,
      bringingPlusOne: plusOnesCount > 0 ? (plusOnesCount === 1 ? 'Yes, 1 +1' : `Yes, ${plusOnesCount} guests`) : 'No +1',
      bringingKids: kidsCount > 0 ? 'Yes' : 'No kids',
      plusOnesCount: plusOnesCount,
      kidsCount: kidsCount,
      otherSuggestions: otherSuggestions.trim() || undefined,
    };

    onSurveySubmitted(newResponse);
    setIsSubmitted(true);
    window.scrollTo({ top: 40, behavior: 'smooth' });
  };

  // Goes back into the form to keep editing — the survey is always open and
  // stores one response per user, so this reopens the just-submitted answers
  // rather than clearing them (see the prefill effect above).
  const handleEditResponse = () => {
    setIsSubmitted(false);
    setCurrentStep(1);
    setErrors({});
  };

  if (isSubmitted) {
    return (
      <div id="survey-success-container" className="max-w-lg mx-auto py-10 px-4">
        <div className="relative bg-surface-container-low rounded-xl shadow-soft p-7 text-center space-y-3.5">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 -rotate-3 w-20 h-6 bg-[#f6e6bf]/75 border border-white/50" />

          <h2 className="font-serif text-display leading-none text-on-surface">
            Salamat, <em className="text-primary not-italic italic">{submitterName.split(' ')[0]}!</em>
          </h2>

          <p className="text-body text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Your response and pledge are on record, and your card is now on the board. You can edit your response anytime.
          </p>

          {computedPledge > 0 && (
            <div className="flex items-baseline justify-center gap-2.5 pt-3 border-t border-dashed border-on-surface/20">
              <span className="font-mono text-label tracking-[0.16em] uppercase text-on-surface-variant/70">Pledged</span>
              <span className="font-serif text-title text-primary">{formatPHP(computedPledge)}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              id="btn-survey-submitted-rsvp"
              type="button"
              onClick={onNavigateToRsvp}
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-primary hover:opacity-90 text-on-primary font-bold text-body shadow-soft transition-all flex items-center justify-center gap-1.5"
            >
              <span>To the Batch Board</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-survey-submit-another"
              type="button"
              onClick={handleEditResponse}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full bg-white/60 hover:bg-white/80 text-on-surface font-semibold text-body transition-all"
            >
              Edit my response
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepDefs = [
    { n: 1, label: 'Attendance' },
    { n: 2, label: 'Help & Skills' },
    { n: 3, label: 'Pledges' },
  ];

  return (
    <div id="survey-form-container" className="max-w-2xl @min-[700px]/app:max-w-[1180px] mx-auto py-6 px-4 @min-[700px]/app:px-8">

      {/* Step navigation */}
      <div className="mb-5">
        {/* 3-Step Navigation */}
        <div id="survey-step-tabs" className="flex flex-nowrap gap-1.5">
          {stepDefs.map((s) => {
            const active = currentStep === s.n;
            return (
              <button
                key={s.n}
                type="button"
                onClick={() => setCurrentStep(s.n)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-full text-label font-semibold transition-all ${
                  active
                    ? 'bg-on-surface text-background'
                    : 'bg-black/[0.03] text-on-surface-variant border border-outline-variant/40'
                }`}
              >
                <span
                  className="w-[19px] h-[19px] rounded-full flex items-center justify-center font-mono text-label font-bold flex-shrink-0"
                  style={{
                    background: active ? 'rgba(246,230,191,.22)' : 'rgba(20,33,29,.08)',
                    color: active ? '#f6e6bf' : 'rgba(20,33,29,.6)',
                  }}
                >
                  {s.n}
                </span>
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* STEP 1: ATTENDANCE & DATES */}
        {currentStep === 1 && (
          <div className="space-y-4">

            {/* 1. Attendance */}
            <div id="q2-attendance-card" className={cardClass}>
              <QuestionHeading n="01" required>Can you attend?</QuestionHeading>

              <div className="grid gap-2 @min-[640px]/app:grid-cols-2 @min-[700px]/app:grid-cols-[repeat(auto-fit,minmax(212px,1fr))]">
                {[
                  { label: 'Yes, definitely!', icon: '🎉' },
                  { label: 'Most likely, but still confirming', icon: '👍' },
                  { label: 'Not sure yet', icon: '🤔' },
                  { label: 'Unfortunately, I won’t be able to attend', icon: '✈️' },
                ].map((opt) => (
                  <label key={opt.label} className={optClass(attendance === opt.label)}>
                    <input
                      type="radio"
                      name="attendance"
                      checked={attendance === opt.label}
                      onChange={() => setAttendance(opt.label as any)}
                      className="sr-only"
                    />
                    <span
                      className="w-4 h-4 flex-none rounded-full flex items-center justify-center text-label font-bold text-white"
                      style={{ background: attendance === opt.label ? '#0e5a4d' : 'transparent', border: `1.5px solid ${attendance === opt.label ? '#0e5a4d' : 'rgba(20,33,29,.3)'}` }}
                    >
                      {attendance === opt.label ? '·' : ''}
                    </span>
                    <span>{opt.icon} {opt.label}</span>
                  </label>
                ))}
              </div>

              {attendance === 'Not sure yet' && (
                <div className="pt-1 space-y-1">
                  <label className="block text-label font-semibold text-on-surface-variant">
                    What would help you decide?
                  </label>
                  <input
                    id="input-attendanceReason"
                    type="text"
                    placeholder="e.g. final date, exact budget, venue location"
                    value={attendanceReason}
                    onChange={(e) => setAttendanceReason(e.target.value)}
                    className="w-full py-1.5 border-b-[1.5px] border-on-surface/30 bg-transparent text-on-surface text-body focus:outline-none focus:border-primary"
                  />
                </div>
              )}
            </div>

            {/* 2. Dates */}
            <div id="q3-date-card" className={cardClass}>
              <QuestionHeading n="02">Preferred Month</QuestionHeading>

              <div className="flex flex-wrap gap-2.5">
                {monthsList.map((month) => {
                  const isSelected = preferredMonths.includes(month);
                  return (
                    <button
                      key={month}
                      type="button"
                      onClick={() => handleMonthToggle(month)}
                      className={tileClass(isSelected)}
                    >
                      <span className="text-body font-medium leading-none">{month}</span>
                      <span className="font-mono text-label uppercase tracking-wide opacity-70">2027</span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-label font-semibold text-on-surface-variant mb-1">
                  Other month / specific date suggestions:
                </label>
                <input
                  id="input-specificDateNotes"
                  type="text"
                  placeholder="e.g. Easter week in April, Christmas holidays in December, or another month..."
                  value={specificDateNotes}
                  onChange={(e) => setSpecificDateNotes(e.target.value)}
                  className="w-full py-1.5 border-b-[1.5px] border-on-surface/30 bg-transparent focus:outline-none focus:border-primary text-on-surface text-body"
                />
              </div>
            </div>

            {/* 3. Venue */}
            <div id="q4-venue-card" className={cardClass}>
              <QuestionHeading n="03">Venue &amp; vibe</QuestionHeading>

              <div className="grid gap-2 @min-[640px]/app:grid-cols-2 @min-[700px]/app:grid-cols-[repeat(auto-fit,minmax(212px,1fr))]">
                {venueTypeOptions.map((type) => {
                  const isSelected = preferredVenueType.includes(type);
                  return (
                    <label key={type} className={optClass(isSelected)}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleVenueTypeToggle(type)}
                        className="sr-only"
                      />
                      <span
                        className="w-4 h-4 flex-none rounded flex items-center justify-center text-label font-bold text-white"
                        style={{ background: isSelected ? '#0e5a4d' : 'transparent', border: `1.5px solid ${isSelected ? '#0e5a4d' : 'rgba(20,33,29,.3)'}` }}
                      >
                        {isSelected ? '✓' : ''}
                      </span>
                      <span>{type}</span>
                    </label>
                  );
                })}
              </div>

              {preferredVenueType.includes('Other') && (
                <input
                  id="input-venueTypeOther"
                  type="text"
                  placeholder="Specify venue type..."
                  value={venueTypeOther}
                  onChange={(e) => setVenueTypeOther(e.target.value)}
                  className="w-full py-1.5 border-b-[1.5px] border-primary/40 bg-transparent focus:outline-none focus:border-primary text-on-surface text-body"
                />
              )}

              <div>
                <label className="block text-label font-semibold text-on-surface-variant mb-1">
                  Venue suggestions:
                </label>
                <input
                  id="input-venueSuggestion"
                  type="text"
                  placeholder="e.g. Hotel in Makati / BGC, private events place"
                  value={venueSuggestion}
                  onChange={(e) => setVenueSuggestion(e.target.value)}
                  className="w-full py-1.5 border-b-[1.5px] border-on-surface/30 bg-transparent focus:outline-none focus:border-primary text-on-surface text-body"
                />
              </div>
            </div>

            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={handleGoToStep2}
                className="px-6 py-2.5 rounded-full bg-primary hover:opacity-90 text-on-primary font-bold text-body shadow-soft flex items-center gap-1.5 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: ORGANIZING & SKILLS */}
        {currentStep === 2 && (
          <div className="space-y-4">

            {/* 4. Willingness to help */}
            <div id="q-willingness-card" className={cardClass}>
              <QuestionHeading n="04">Volunteer &amp; organizing</QuestionHeading>

              <div className="grid gap-2 @min-[640px]/app:grid-cols-2 @min-[700px]/app:grid-cols-[repeat(auto-fit,minmax(212px,1fr))]">
                {([
                  'Yes, happy to help!',
                  'Maybe, depending on tasks',
                  'Can help occasionally',
                  'Prefer to just attend & relax'
                ] as const).map((opt) => (
                  <label key={opt} className={optClass(willingToOrganize === opt)}>
                    <input
                      type="radio"
                      name="willingToOrganize"
                      checked={willingToOrganize === opt}
                      onChange={() => setWillingToOrganize(opt)}
                      className="sr-only"
                    />
                    <span
                      className="w-4 h-4 flex-none rounded-full flex items-center justify-center text-label font-bold text-white"
                      style={{ background: willingToOrganize === opt ? '#0e5a4d' : 'transparent', border: `1.5px solid ${willingToOrganize === opt ? '#0e5a4d' : 'rgba(20,33,29,.3)'}` }}
                    >
                      {willingToOrganize === opt ? '·' : ''}
                    </span>
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Skills & Services */}
            <div id="q6-skills-card" className={cardClass}>
              <QuestionHeading n="05">Skills to share</QuestionHeading>

              {/* Two per row like the pledge tiles and sponsorships;
                  auto-rows-fr keeps them level when a longer label wraps. */}
              <div className="grid grid-cols-2 auto-rows-fr gap-1.5">
                {skillsList.map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => handleSkillToggle(skill)}
                    className={pillClass(skillsOffered.includes(skill), 'snug')}
                  >
                    {skill}
                  </button>
                ))}
              </div>

              {skillsOffered.includes('Other') && (
                <input
                  type="text"
                  placeholder="Specify other skill..."
                  value={skillsOtherText}
                  onChange={(e) => setSkillsOtherText(e.target.value)}
                  className="w-full py-1.5 border-b-[1.5px] border-primary/40 bg-transparent text-body text-on-surface focus:outline-none focus:border-primary"
                />
              )}

              <div>
                <label className="block text-label font-semibold text-on-surface-variant mb-1">
                  Notes on what you can help with:
                </label>
                <textarea
                  id="input-skillsDetails"
                  rows={2}
                  placeholder="e.g. photography, logo design, catering contacts..."
                  value={skillsDetails}
                  onChange={(e) => setSkillsDetails(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-white/50 text-on-surface text-body focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* 6. Event Organizer / Coordination Company Recommendation */}
            <div id="q7-organization-card" className={cardClass}>
              <QuestionHeading n="06" badge="Optional">Recommend an event organizer</QuestionHeading>
              <p className="text-label text-on-surface-variant -mt-1.5">
                Suggest a professional event organizer or coordination agency (outside the batch) we could hire for the program, styling, and supplier logistics.
              </p>

              <input
                id="input-nominatedOrganizer"
                type="text"
                placeholder="Name of a coordination company (non-batch)…"
                value={nominatedOrganizer}
                onChange={(e) => setNominatedOrganizer(e.target.value)}
                className="w-full py-1.5 border-b-[1.5px] border-on-surface/30 bg-transparent focus:outline-none focus:border-primary text-on-surface text-body"
              />
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 80, behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded-full bg-white/60 hover:bg-white/80 text-on-surface-variant font-semibold text-body flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleGoToStep3}
                className="px-6 py-2.5 rounded-full bg-primary hover:opacity-90 text-on-primary font-bold text-body shadow-soft flex items-center gap-1.5 transition-all"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 3: PLEDGES & GUESTS */}
        {currentStep === 3 && (
          <div className="space-y-4">

            {/* 7. Financial Pledge */}
            <div id="q5-contributions-card" className={cardClass}>
              <QuestionHeading n="07">Financial pledge</QuestionHeading>

              {/* Two per row, equal-width columns and `auto-rows-fr` so every
                  tile is the same size — otherwise the one tile that still
                  carries a subtitle (₱2,000) would be taller than the rest. */}
              <div className="grid grid-cols-2 auto-rows-fr gap-2.5">
                {[
                  { val: '₱2,000', label: '₱2,000', subtitle: 'Standard (min)' },
                  { val: '₱3,000', label: '₱3,000' },
                  { val: '₱5,000', label: '₱5,000' },
                  { val: '₱10,000+', label: '₱10,000+' },
                  { val: 'Custom Amount', label: 'Custom amount' },
                ].map((tier) => (
                  // justify-center (tileClass leaves justify-content unset, so
                  // this doesn't fight it): every tile is stretched to the
                  // tallest by auto-rows-fr, and without centring the ones
                  // with no subtitle left their amount stranded at the top.
                  <label key={tier.val} className={`${tileClass(pledgeOption === tier.val)} justify-center`}>
                    <input
                      type="radio"
                      name="pledgeTier"
                      checked={pledgeOption === tier.val}
                      onChange={() => {
                        setPledgeOption(tier.val as any);
                        setErrors(prev => ({ ...prev, pledge: undefined }));
                      }}
                      className="sr-only"
                    />
                    <span className="text-body font-medium leading-none">{tier.label}</span>
                    {tier.subtitle && (
                      <span className="font-mono text-label uppercase tracking-wide opacity-70">{tier.subtitle}</span>
                    )}
                  </label>
                ))}
              </div>

              {(pledgeOption === 'Custom Amount' || pledgeOption === 'Other' || pledgeOption === '₱10,000+') && (
                <div className="p-3 rounded-xl bg-primary/[0.06] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-label font-semibold text-on-surface">
                      Enter custom amount (₱):
                    </label>
                    <span className="text-label text-on-surface-variant font-medium">Min. ₱2,000</span>
                  </div>
                  <div className="relative max-w-xs">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 font-semibold text-on-surface-variant text-body">₱</span>
                    <input
                      id="input-customPledgeAmount"
                      type="text"
                      placeholder="2500"
                      value={customPledgeAmount}
                      onChange={(e) => {
                        setCustomPledgeAmount(e.target.value);
                        setErrors(prev => ({ ...prev, pledge: undefined }));
                      }}
                      className={`w-full pl-4 pr-3 py-1.5 border-b-[1.5px] bg-transparent text-on-surface font-semibold text-body focus:outline-none ${
                        errors.pledge || (customPledgeAmount.trim() && parseRawAmountString(customPledgeAmount) < 2000)
                          ? 'border-error'
                          : 'border-primary/50 focus:border-primary'
                      }`}
                    />
                  </div>

                  {customPledgeAmount.trim() && parseRawAmountString(customPledgeAmount) < 2000 && (
                    <p className="text-label text-error font-semibold">
                      ⚠️ The minimum pledge amount is ₱2,000. Please enter ₱2,000 or higher.
                    </p>
                  )}
                  {errors.pledge && (
                    <p className="text-label text-error font-semibold">{errors.pledge}</p>
                  )}
                  {customPledgeAmount.trim() && parseRawAmountString(customPledgeAmount) >= 2000 && (
                    <p className="text-label text-success font-medium">
                      ✓ Valid pledge: {formatPHP(parseRawAmountString(customPledgeAmount))}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2.5 p-3.5 rounded-2xl bg-[#14211d]">
                <span className="font-mono text-label tracking-[0.14em] uppercase text-white/55">Total pledge recorded</span>
                <span className="font-serif text-heading text-[#f6e6bf]">
                  {formatPHP(Math.max(2000, computedPledge))}
                </span>
              </div>

              {/* In-Kind Sponsorship */}
              <div className="pt-1 space-y-2">
                <label className="block text-label font-semibold text-on-surface-variant">
                  In-kind sponsorships:
                </label>

                {/* Two per row, matching the pledge tiles above. `auto-rows-fr`
                    keeps the pills level with each other when a longer label
                    ("Dessert / Cake / Grazing table") wraps to a second line. */}
                <div className="grid grid-cols-2 auto-rows-fr gap-1.5">
                  {sponsorshipOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleSponsorshipToggle(item)}
                      className={pillClass(otherSponsorships.includes(item), 'snug')}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                {otherSponsorships.includes('Other') && (
                  <input
                    type="text"
                    placeholder="Specify sponsorship..."
                    value={otherSponsorshipsOtherText}
                    onChange={(e) => setOtherSponsorshipsOtherText(e.target.value)}
                    className="w-full py-1.5 border-b-[1.5px] border-primary/40 bg-transparent text-body text-on-surface focus:outline-none focus:border-primary"
                  />
                )}

                <textarea
                  id="input-otherSponsorshipDetails"
                  rows={2}
                  placeholder="Details on food, drinks, prizes, or services..."
                  value={otherSponsorshipDetails}
                  onChange={(e) => setOtherSponsorshipDetails(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-white/50 text-on-surface text-body focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* 8. Guests & Kids: Steppers */}
            <div id="q8-guests-card" className={cardClass}>
              <QuestionHeading n="08">Companions</QuestionHeading>

              {/* One full-width row per companion type, each closed by a
                  hairline — the steppers never sit side by side. */}
              <div className="flex flex-col">
                {[
                  { label: 'Adult guests (+1s)', v: plusOnesCount, dec: () => setPlusOnesCount(Math.max(0, plusOnesCount - 1)), inc: () => setPlusOnesCount(plusOnesCount + 1) },
                  { label: 'Kids', v: kidsCount, dec: () => setKidsCount(Math.max(0, kidsCount - 1)), inc: () => setKidsCount(kidsCount + 1) },
                ].map((st) => (
                  <div key={st.label} className="flex items-center justify-between gap-3 py-3 border-b border-on-surface/15">
                    <span className="text-body font-medium text-on-surface-variant">{st.label}</span>
                    <span className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={st.dec}
                        aria-label={`Decrease ${st.label}`}
                        className="w-6.5 h-6.5 rounded-full border border-on-surface/25 bg-transparent flex items-center justify-center hover:bg-black/5"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="min-w-[22px] text-center text-body font-medium tabular-nums text-on-surface">{st.v}</span>
                      <button
                        type="button"
                        onClick={st.inc}
                        aria-label={`Increase ${st.label}`}
                        className="w-6.5 h-6.5 rounded-full bg-primary text-on-primary flex items-center justify-center"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 9. Other Suggestions */}
            <div id="q9-suggestions-card" className={cardClass}>
              <QuestionHeading n="09">Ideas or suggestions</QuestionHeading>

              <textarea
                id="input-otherSuggestions"
                rows={2}
                placeholder="Sana may Then & Now photo wall at open mic…"
                value={otherSuggestions}
                onChange={(e) => setOtherSuggestions(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-outline-variant/40 bg-white/50 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface text-body"
              />
            </div>

            {/* Sticky submission bar */}
            <div className="sticky bottom-3.5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/85 shadow-soft p-3.5 flex flex-wrap items-center gap-3">
              <div className="flex flex-col gap-0.5 mr-auto">
                <span className="font-mono text-label tracking-[0.14em] uppercase text-on-surface-variant/70">Running pledge</span>
                <span className="font-serif text-heading text-primary">{formatPHP(computedPledge)}</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(2);
                  window.scrollTo({ top: 80, behavior: 'smooth' });
                }}
                className="px-4 py-2.5 rounded-full bg-transparent text-on-surface-variant font-semibold text-body"
                style={{ border: '1px solid rgba(20,33,29,.22)' }}
              >
                Back
              </button>

              <button
                id="btn-submit-survey-main"
                type="submit"
                className="px-5 py-3 rounded-full bg-primary hover:opacity-90 text-on-primary font-bold text-body shadow-soft flex items-center justify-center gap-1.5 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit survey</span>
              </button>
            </div>

          </div>
        )}

      </form>
    </div>
  );
};
