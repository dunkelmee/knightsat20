import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Send, ChevronRight, ChevronLeft,
  Sparkles, HeartHandshake, ClipboardList,
  Minus, Plus
} from 'lucide-react';
import { SurveyResponse, SurveyResponseCreate } from '../types';
import { parsePledgeAmount, parseRawAmountString, formatPHP } from '../utils/pledgeParser';

interface SurveySectionProps {
  submitterName: string;
  onSurveySubmitted: (response: SurveyResponseCreate) => void;
  onNavigateToRsvp: () => void;
}

export const SurveySection: React.FC<SurveySectionProps> = ({
  submitterName,
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
      kidsCount: kidsCount,
      otherSuggestions: otherSuggestions.trim() || undefined,
    };

    onSurveySubmitted(newResponse);
    setIsSubmitted(true);
    window.scrollTo({ top: 40, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setAttendance('Yes, definitely!');
    setAttendanceReason('');
    setPreferredMonths(['April', 'December']);
    setSpecificDateNotes('');
    setVenueSuggestion('');
    setPreferredVenueType(['Hotel / function room in Makati or BGC']);
    setVenueTypeOther('');
    setWillingToOrganize('Maybe, depending on tasks');
    setSkillsOffered([]);
    setSkillsOtherText('');
    setSkillsDetails('');
    setNominatedOrganizer('');
    setPledgeOption('₱3,000');
    setCustomPledgeAmount('');
    setOtherSponsorships([]);
    setOtherSponsorshipsOtherText('');
    setOtherSponsorshipDetails('');
    setPlusOnesCount(0);
    setKidsCount(0);
    setOtherSuggestions('');
    setCurrentStep(1);
    setErrors({});
  };

  if (isSubmitted) {
    return (
      <div id="survey-success-container" className="max-w-xl mx-auto py-12 px-4 text-center">
        <div className="bg-surface-container-lowest rounded p-8 border border-outline-variant/30 shadow-soft space-y-4">
          <div className="w-12 h-12 rounded-full bg-success-container text-on-success-container flex items-center justify-center mx-auto border border-success-container">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-serif font-semibold text-on-surface">
            Thank you, {submitterName}!
          </h2>

          <p className="text-xs text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Your survey responses and pledge have been recorded. You have also been automatically registered on the public <strong>Attendee Roster</strong>!
          </p>

          {computedPledge > 0 && (
            <div className="p-3 bg-primary-container/20 rounded border border-primary-container/50 inline-block text-xs text-on-surface">
              <span>Pledged Batch Fund: </span>
              <strong className="text-primary font-semibold">{formatPHP(computedPledge)}</strong>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              id="btn-survey-submitted-rsvp"
              type="button"
              onClick={onNavigateToRsvp}
              className="w-full sm:w-auto px-5 py-2.5 rounded bg-primary hover:opacity-90 text-on-primary font-semibold text-xs shadow-soft transition-all flex items-center justify-center gap-1.5"
            >
              <span>View Attendee Roster</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-survey-submit-another"
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-4 py-2.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-semibold text-xs transition-all border border-outline-variant/30"
            >
              Fill Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="survey-form-container" className="max-w-2xl mx-auto py-6 px-4">

      {/* Section Title — matches the icon + serif headline pattern used by
          the Batch Board / Funds tabs, rather than a standalone card */}
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <h2 className="text-base sm:text-lg font-serif font-semibold text-on-surface">
            Reunion Planning Survey
          </h2>
        </div>
        <p className="text-xs text-on-surface-variant mt-1">
          Help us choose the best date, venue style, and batch fund target.
        </p>
      </div>
      <div className="border-t border-outline-variant/30 mb-5" />

      {/* 3-Step Sleek Navigation Bar */}
      <div id="survey-step-tabs" className="mb-5 bg-surface-container-low p-1 rounded border border-outline-variant/30 grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`py-2 px-2.5 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            currentStep === 1
              ? 'bg-surface-container-lowest text-primary shadow-soft border border-outline-variant/30'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
            currentStep === 1 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
          }`}>1</span>
          <span>Attendance & Dates</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          className={`py-2 px-2.5 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            currentStep === 2
              ? 'bg-surface-container-lowest text-primary shadow-soft border border-outline-variant/30'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
            currentStep === 2 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
          }`}>2</span>
          <span>Help & Skills</span>
        </button>

        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          className={`py-2 px-2.5 rounded text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            currentStep === 3
              ? 'bg-surface-container-lowest text-primary shadow-soft border border-outline-variant/30'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
            currentStep === 3 ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'
          }`}>3</span>
          <span>Pledges & Guests</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* STEP 1: ATTENDANCE & DATES */}
        {currentStep === 1 && (
          <div className="space-y-4">

            {/* 1. Attendance */}
            <div id="q2-attendance-card" className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-semibold text-on-surface">
                  1. Can you attend? <span className="text-error">*</span>
                </h3>
                <span className="text-[10px] text-on-primary-container bg-primary-container/20 px-2 py-0.5 rounded border border-primary-container/50 font-semibold">
                  Auto-adds to Roster
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { label: 'Yes, definitely!', icon: '🎉' },
                  { label: 'Most likely, but still confirming', icon: '👍' },
                  { label: 'Not sure yet', icon: '🤔' },
                  { label: 'Unfortunately, I won’t be able to attend', icon: '✈️' },
                ].map((opt) => (
                  <label
                    key={opt.label}
                    className={`flex items-center justify-between p-3 rounded border cursor-pointer transition-all ${
                      attendance === opt.label
                        ? 'border-primary bg-primary-container/15 ring-1 ring-primary text-on-surface font-semibold'
                        : 'border-outline-variant/30 hover:border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="attendance"
                        checked={attendance === opt.label}
                        onChange={() => setAttendance(opt.label as any)}
                        className="w-3.5 h-3.5 text-primary focus:ring-primary"
                      />
                      <span className="text-sm">{opt.icon}</span>
                      <span className="text-xs font-medium">{opt.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              {attendance === 'Not sure yet' && (
                <div className="pt-2 space-y-1">
                  <label className="block text-xs font-semibold text-on-surface-variant">
                    What would help you decide?
                  </label>
                  <input
                    id="input-attendanceReason"
                    type="text"
                    placeholder="e.g. final date, exact budget, venue location"
                    value={attendanceReason}
                    onChange={(e) => setAttendanceReason(e.target.value)}
                    className="w-full p-2 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              )}
            </div>

            {/* 3. Dates */}
            <div id="q3-date-card" className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-semibold text-on-surface">
                    2. Preferred Month (2027)
                  </h3>
                  <span className="text-[10px] text-on-primary-container bg-primary-container/20 px-2 py-0.5 rounded border border-primary-container/50 font-semibold">
                    2027 Planning
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Select your preferred month(s), or suggest specific dates or other options in the custom field.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {monthsList.map((month) => {
                  const isSelected = preferredMonths.includes(month);
                  return (
                    <button
                      key={month}
                      type="button"
                      onClick={() => handleMonthToggle(month)}
                      className={`p-3 rounded border text-sm font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary bg-primary-container/15 text-on-primary-container ring-1 ring-primary shadow-soft'
                          : 'border-outline-variant/30 hover:border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                      }`}
                    >
                      <span>{month}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Other month / specific date suggestions:
                </label>
                <input
                  id="input-specificDateNotes"
                  type="text"
                  placeholder="e.g. Easter week in April, Christmas holidays in December, or another month..."
                  value={specificDateNotes}
                  onChange={(e) => setSpecificDateNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-secondary/30 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface text-xs"
                />
              </div>
            </div>

            {/* 4. Venue */}
            <div id="q4-venue-card" className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-on-surface">
                3. Venue & Vibe
              </h3>

              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {venueTypeOptions.map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-2 p-2.5 rounded border cursor-pointer transition-all ${
                        preferredVenueType.includes(type)
                          ? 'border-primary bg-primary-container/15 text-on-surface font-semibold ring-1 ring-primary'
                          : 'border-outline-variant/30 hover:border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={preferredVenueType.includes(type)}
                        onChange={() => handleVenueTypeToggle(type)}
                        className="w-3.5 h-3.5 text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-medium">{type}</span>
                    </label>
                  ))}
                </div>

                {preferredVenueType.includes('Other') && (
                  <div className="mt-2">
                    <input
                      id="input-venueTypeOther"
                      type="text"
                      placeholder="Specify venue type..."
                      value={venueTypeOther}
                      onChange={(e) => setVenueTypeOther(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-primary-container focus:outline-none focus:ring-1 focus:ring-primary text-on-surface text-xs"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Venue suggestions:
                </label>
                <input
                  id="input-venueSuggestion"
                  type="text"
                  placeholder="e.g. Hotel in Makati / BGC, private events place"
                  value={venueSuggestion}
                  onChange={(e) => setVenueSuggestion(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-secondary/30 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface text-xs"
                />
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleGoToStep2}
                className="px-6 py-2.5 rounded bg-primary hover:opacity-90 text-on-primary font-semibold text-xs shadow-soft flex items-center gap-1.5 transition-all"
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

            {/* Willingness to help */}
            <div id="q-willingness-card" className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-on-surface">
                4. Volunteer & Organizing
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Yes, happy to help!',
                  'Maybe, depending on tasks',
                  'Can help occasionally',
                  'Prefer to just attend & relax'
                ].map((opt) => (
                  <label
                    key={opt}
                    className={`p-2.5 rounded border cursor-pointer transition-all flex items-center gap-2 ${
                      willingToOrganize === opt
                        ? 'border-primary bg-primary-container/15 text-on-surface font-semibold ring-1 ring-primary'
                        : 'border-outline-variant/30 hover:border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                    }`}
                  >
                    <input
                      type="radio"
                      name="willingToOrganize"
                      checked={willingToOrganize === opt}
                      onChange={() => setWillingToOrganize(opt as any)}
                      className="w-3.5 h-3.5 text-primary focus:ring-primary"
                    />
                    <span className="text-xs font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Skills & Services */}
            <div id="q6-skills-card" className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-on-surface">
                5. Skills to Share
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {skillsList.map((skill) => {
                  const isSelected = skillsOffered.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`p-2 rounded border text-xs text-left flex items-center justify-between transition-all font-medium ${
                        isSelected
                          ? 'border-primary bg-primary-container/15 text-on-primary-container font-semibold ring-1 ring-primary'
                          : 'border-outline-variant/30 hover:border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                      } ${skill.includes('Prefer to just attend') ? 'col-span-2 sm:col-span-3 text-center justify-center bg-surface-container-low' : ''}`}
                    >
                      <span>{skill}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {skillsOffered.includes('Other') && (
                <div>
                  <input
                    type="text"
                    placeholder="Specify other skill..."
                    value={skillsOtherText}
                    onChange={(e) => setSkillsOtherText(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-primary-container text-xs text-on-surface"
                  />
                </div>
              )}

              <div className="pt-1">
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                  Notes on what you can help with:
                </label>
                <textarea
                  id="input-skillsDetails"
                  rows={2}
                  placeholder="e.g. photography, logo design, catering contacts..."
                  value={skillsDetails}
                  onChange={(e) => setSkillsDetails(e.target.value)}
                  className="w-full p-2 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Event Organizer / Coordination Company Recommendation */}
            <div id="q7-organization-card" className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-semibold text-on-surface">
                    6. Recommend an Event Organizer / Coordination Company
                  </h3>
                  <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant/30 font-medium">
                    Optional
                  </span>
                </div>
                <p className="text-[11px] text-on-surface-variant">
                  Suggest a professional event organizer or coordination agency (outside the batch) that we can hire to manage the program, styling, and supplier logistics.
                </p>
              </div>

              <div>
                <input
                  id="input-nominatedOrganizer"
                  type="text"
                  placeholder="e.g. Events by [Company Name], Wedding & Events Planner contact, etc."
                  value={nominatedOrganizer}
                  onChange={(e) => setNominatedOrganizer(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-secondary/30 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface text-xs"
                />
              </div>
            </div>

            {/* Back & Next */}
            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 80, behavior: 'smooth' });
                }}
                className="px-4 py-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-semibold text-xs border border-outline-variant/30 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleGoToStep3}
                className="px-6 py-2.5 rounded bg-primary hover:opacity-90 text-on-primary font-semibold text-xs shadow-soft flex items-center gap-1.5 transition-all"
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

            {/* Financial Pledge */}
            <div id="q5-contributions-card" className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-3">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-2">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-on-surface">
                    7. Financial Pledge
                  </h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">
                    Minimum contribution is <strong>₱2,000</strong>.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-on-primary-container bg-primary-container/20 px-2 py-0.5 rounded border border-primary-container/50">
                  Operating Fund
                </span>
              </div>

              <div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                  {[
                    { val: '₱2,000', label: '₱2,000', subtitle: 'Standard (Min)' },
                    { val: '₱3,000', label: '₱3,000', subtitle: 'Recommended' },
                    { val: '₱5,000', label: '₱5,000', subtitle: 'Silver' },
                    { val: '₱10,000+', label: '₱10,000+', subtitle: 'Gold / Patron' },
                    { val: 'Custom Amount', label: 'Custom Amount', subtitle: 'Min. ₱2,000' },
                  ].map((tier) => (
                    <label
                      key={tier.val}
                      className={`p-2.5 rounded border cursor-pointer transition-all flex flex-col justify-between ${
                        pledgeOption === tier.val
                          ? 'border-primary bg-primary-container/15 ring-1 ring-primary text-on-surface font-semibold'
                          : 'border-outline-variant/30 hover:border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <input
                          type="radio"
                          name="pledgeTier"
                          checked={pledgeOption === tier.val}
                          onChange={() => {
                            setPledgeOption(tier.val as any);
                            setErrors(prev => ({ ...prev, pledge: undefined }));
                          }}
                          className="w-3 h-3 text-primary focus:ring-primary"
                        />
                        <span className="text-xs font-semibold">{tier.label}</span>
                      </div>
                      <span className="text-[10px] text-on-surface-variant pl-4 mt-0.5">{tier.subtitle}</span>
                    </label>
                  ))}
                </div>

                {(pledgeOption === 'Custom Amount' || pledgeOption === 'Other' || pledgeOption === '₱10,000+') && (
                  <div className="mt-2 p-3 bg-primary-container/15 rounded border border-primary-container/50 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-on-surface">
                        Enter Custom Amount (₱):
                      </label>
                      <span className="text-[10px] text-on-surface-variant font-medium">Min. ₱2,000</span>
                    </div>
                    <div className="relative max-w-xs">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-semibold text-on-surface-variant text-xs">₱</span>
                      <input
                        id="input-customPledgeAmount"
                        type="text"
                        placeholder="2500"
                        value={customPledgeAmount}
                        onChange={(e) => {
                          setCustomPledgeAmount(e.target.value);
                          setErrors(prev => ({ ...prev, pledge: undefined }));
                        }}
                        className={`w-full pl-6 pr-3 py-1.5 rounded border bg-surface-container-lowest text-on-surface font-semibold text-xs focus:outline-none focus:ring-1 ${
                          errors.pledge || (customPledgeAmount.trim() && parseRawAmountString(customPledgeAmount) < 2000)
                            ? 'border-error focus:ring-error'
                            : 'border-primary-container focus:ring-primary'
                        }`}
                      />
                    </div>

                    {/* Validation warnings */}
                    {customPledgeAmount.trim() && parseRawAmountString(customPledgeAmount) < 2000 && (
                      <p className="text-[11px] text-error font-semibold">
                        ⚠️ The minimum pledge amount is ₱2,000. Please enter ₱2,000 or higher.
                      </p>
                    )}
                    {errors.pledge && (
                      <p className="text-[11px] text-error font-semibold">
                        {errors.pledge}
                      </p>
                    )}
                    {customPledgeAmount.trim() && parseRawAmountString(customPledgeAmount) >= 2000 && (
                      <p className="text-[11px] text-success font-medium">
                        ✓ Valid pledge: {formatPHP(parseRawAmountString(customPledgeAmount))}
                      </p>
                    )}
                  </div>
                )}

                {/* Computed Display */}
                <div className="mt-2 flex items-center justify-between p-2.5 rounded bg-inverse-surface text-inverse-on-surface text-xs">
                  <span className="text-inverse-on-surface/70">Total pledge recorded:</span>
                  <span className="font-semibold text-primary-container text-sm">
                    {formatPHP(Math.max(2000, computedPledge))}
                  </span>
                </div>
              </div>

              {/* In-Kind Sponsorship */}
              <div className="pt-3 border-t border-outline-variant/20">
                <label className="block text-xs font-semibold text-on-surface-variant mb-1.5">
                  In-Kind Sponsorships:
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mb-2">
                  {sponsorshipOptions.map((item) => {
                    const isSelected = otherSponsorships.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleSponsorshipToggle(item)}
                        className={`p-1.5 rounded border text-xs text-left flex items-center justify-between transition-all font-medium ${
                          isSelected
                            ? 'border-primary bg-primary-container/15 text-on-primary-container font-semibold ring-1 ring-primary'
                            : 'border-outline-variant/30 hover:border-outline-variant bg-surface-container-lowest text-on-surface-variant'
                        } ${item === 'None for now' ? 'col-span-2 sm:col-span-3 text-center justify-center bg-surface-container-low' : ''}`}
                      >
                        <span>{item}</span>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {otherSponsorships.includes('Other') && (
                  <div className="mb-2">
                    <input
                      type="text"
                      placeholder="Specify sponsorship..."
                      value={otherSponsorshipsOtherText}
                      onChange={(e) => setOtherSponsorshipsOtherText(e.target.value)}
                      className="w-full px-3 py-1.5 rounded border border-primary-container text-xs text-on-surface"
                    />
                  </div>
                )}

                <div>
                  <textarea
                    id="input-otherSponsorshipDetails"
                    rows={2}
                    placeholder="Details on food, drinks, prizes, or services..."
                    value={otherSponsorshipDetails}
                    onChange={(e) => setOtherSponsorshipDetails(e.target.value)}
                    className="w-full p-2 rounded border border-secondary/30 text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Guests & Kids: Steppers (0 if none) */}
            <div id="q8-guests-card" className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-on-surface">
                8. Companions (0 if none)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Plus-Ones Number Stepper */}
                <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30 space-y-2">
                  <div className="text-xs font-semibold text-on-surface">Adult Guests (+1s)</div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlusOnesCount(Math.max(0, plusOnesCount - 1))}
                      className="w-7 h-7 rounded bg-surface-container-lowest border border-secondary/30 font-semibold text-on-surface-variant flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all shadow-soft"
                      aria-label="Decrease adult guests"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={plusOnesCount}
                      onChange={(e) => setPlusOnesCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-14 py-1 text-center font-semibold text-sm rounded border border-secondary/30 bg-surface-container-lowest text-on-surface"
                    />

                    <button
                      type="button"
                      onClick={() => setPlusOnesCount(plusOnesCount + 1)}
                      className="w-7 h-7 rounded bg-surface-container-lowest border border-secondary/30 font-semibold text-on-surface-variant flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all shadow-soft"
                      aria-label="Increase adult guests"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Kids Number Stepper */}
                <div className="p-3 rounded bg-surface-container-low border border-outline-variant/30 space-y-2">
                  <div className="text-xs font-semibold text-on-surface">Kids</div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setKidsCount(Math.max(0, kidsCount - 1))}
                      className="w-7 h-7 rounded bg-surface-container-lowest border border-secondary/30 font-semibold text-on-surface-variant flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all shadow-soft"
                      aria-label="Decrease kids count"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>

                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={kidsCount}
                      onChange={(e) => setKidsCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
                      className="w-14 py-1 text-center font-semibold text-sm rounded border border-secondary/30 bg-surface-container-lowest text-on-surface"
                    />

                    <button
                      type="button"
                      onClick={() => setKidsCount(kidsCount + 1)}
                      className="w-7 h-7 rounded bg-surface-container-lowest border border-secondary/30 font-semibold text-on-surface-variant flex items-center justify-center hover:bg-surface-container active:scale-95 transition-all shadow-soft"
                      aria-label="Increase kids count"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Suggestions */}
            <div id="q9-suggestions-card" className="bg-surface-container-lowest rounded p-4 sm:p-5 border border-outline-variant/30 space-y-2">
              <h3 className="text-sm sm:text-base font-semibold text-on-surface">
                9. Ideas or Suggestions
              </h3>

              <div>
                <textarea
                  id="input-otherSuggestions"
                  rows={2}
                  placeholder="e.g. invite teachers, 2000s playlist, livestream..."
                  value={otherSuggestions}
                  onChange={(e) => setOtherSuggestions(e.target.value)}
                  className="w-full p-2.5 rounded border border-secondary/30 focus:outline-none focus:ring-1 focus:ring-primary text-on-surface text-xs"
                />
              </div>
            </div>

            {/* Submission Bar */}
            <div className="bg-surface-container-low text-on-surface rounded p-3.5 flex items-center justify-between gap-3 border border-outline-variant/30">
              <div className="text-xs text-on-surface-variant">
                <span>Pledge: </span>
                <strong className="text-primary font-semibold">{formatPHP(computedPledge)}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 80, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant font-semibold text-xs border border-secondary/30"
                >
                  Back
                </button>

                <button
                  id="btn-submit-survey-main"
                  type="submit"
                  className="px-5 py-2 rounded bg-primary hover:opacity-90 text-on-primary font-semibold text-xs shadow-soft flex items-center justify-center gap-1.5 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Survey</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </form>
    </div>
  );
};
