import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Send, ChevronRight, ChevronLeft, 
  User, Phone, Mail, Sparkles, HeartHandshake,
  Minus, Plus
} from 'lucide-react';
import { SurveyResponse } from '../types';
import { parsePledgeAmount, parseRawAmountString, formatPHP } from '../utils/pledgeParser';

interface SurveySectionProps {
  onSurveySubmitted: (response: SurveyResponse) => void;
  onNavigateToRsvp: () => void;
}

export const SurveySection: React.FC<SurveySectionProps> = ({
  onSurveySubmitted,
  onNavigateToRsvp,
}) => {
  // Step navigation (1, 2, 3)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [submittedName, setSubmittedName] = useState<string>('');

  // Step 1: Info & Dates & Attendance
  const [fullName, setFullName] = useState<string>('');
  const [contactNumber, setContactNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [attendance, setAttendance] = useState<SurveyResponse['attendance']>('Yes, definitely!');
  const [attendanceReason, setAttendanceReason] = useState<string>('');
  const [preferredMonths, setPreferredMonths] = useState<string[]>(['April', 'December']);
  const [specificDateNotes, setSpecificDateNotes] = useState<string>('');
  const [venueSuggestion, setVenueSuggestion] = useState<string>('');
  const [preferredVenueType, setPreferredVenueType] = useState<string>('Hotel / function room in Makati or BGC');
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
  const [errors, setErrors] = useState<{ fullName?: string; contactNumber?: string; pledge?: string }>({});

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

  const validateStep1 = () => {
    const errs: { fullName?: string; contactNumber?: string } = {};
    if (!fullName.trim()) errs.fullName = 'Please enter your name';
    if (!contactNumber.trim()) errs.contactNumber = 'Please enter your mobile or WhatsApp';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleGoToStep2 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 80, behavior: 'smooth' });
    }
  };

  const handleGoToStep3 = () => {
    setCurrentStep(3);
    window.scrollTo({ top: 80, behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }

    if (pledgeOption === 'Custom Amount' || pledgeOption === 'Other') {
      const customNum = parseRawAmountString(customPledgeAmount);
      if (!customPledgeAmount.trim() || customNum < 2000) {
        setErrors(prev => ({ ...prev, pledge: 'The minimum pledge amount is ₱2,000. Please enter ₱2,000 or higher.' }));
        return;
      }
    }

    const finalSkills = skillsOffered.map(s => s === 'Other' && skillsOtherText ? `Other: ${skillsOtherText}` : s);
    const finalSponsorships = otherSponsorships.map(s => s === 'Other' && otherSponsorshipsOtherText ? `Other: ${otherSponsorshipsOtherText}` : s);
    const finalVenueType = preferredVenueType === 'Other' && venueTypeOther ? `Other: ${venueTypeOther}` : preferredVenueType;

    const newResponse: SurveyResponse = {
      id: `survey-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      fullName: fullName.trim(),
      contactNumber: contactNumber.trim(),
      email: email.trim() || undefined,
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
      computedPledgeAmount: Math.max(2000, computedPledge),
      pledgePaidStatus: 'Unpaid / Pledged',
      otherSponsorships: finalSponsorships,
      otherSponsorshipDetails: otherSponsorshipDetails.trim() || undefined,
      bringingPlusOne: plusOnesCount > 0 ? (plusOnesCount === 1 ? 'Yes, 1 +1' : `Yes, ${plusOnesCount} guests`) : 'No +1',
      bringingKids: kidsCount > 0 ? 'Yes' : 'No kids',
      kidsCount: kidsCount,
      otherSuggestions: otherSuggestions.trim() || undefined,
    };

    onSurveySubmitted(newResponse);
    setSubmittedName(fullName);
    setIsSubmitted(true);
    window.scrollTo({ top: 40, behavior: 'smooth' });
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setFullName('');
    setContactNumber('');
    setEmail('');
    setAttendance('Yes, definitely!');
    setAttendanceReason('');
    setPreferredMonths(['April', 'December']);
    setSpecificDateNotes('');
    setVenueSuggestion('');
    setPreferredVenueType('Hotel / function room in Makati or BGC');
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
        <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h2 className="text-xl font-semibold text-stone-900">
            Thank you, {submittedName}!
          </h2>

          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            Your survey responses and pledge have been recorded. You have also been automatically registered on the public <strong>Attendee Roster</strong>!
          </p>

          {computedPledge > 0 && (
            <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 inline-block text-xs text-stone-800">
              <span>Pledged Batch Fund: </span>
              <strong className="text-amber-800 font-semibold">{formatPHP(computedPledge)}</strong>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              id="btn-survey-submitted-rsvp"
              type="button"
              onClick={onNavigateToRsvp}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>View Attendee Roster</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-survey-submit-another"
              type="button"
              onClick={handleResetForm}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-all border border-stone-200"
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
      
      {/* Sleek Minimal Intro */}
      <div className="mb-4 bg-white text-stone-900 rounded-xl p-4 sm:p-5 border border-stone-200">
        <h2 className="text-base sm:text-lg font-semibold text-stone-900">
          Reunion Planning Survey
        </h2>
        <p className="text-xs text-stone-600 mt-0.5">
          Help us choose the best date, venue style, and batch fund target.
        </p>
      </div>

      {/* 3-Step Sleek Navigation Bar */}
      <div id="survey-step-tabs" className="mb-5 bg-[#f4efe6] p-1 rounded-xl border border-stone-200 grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            currentStep === 1
              ? 'bg-white text-amber-900 shadow-xs border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
            currentStep === 1 ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'
          }`}>1</span>
          <span>Info & Dates</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (validateStep1()) setCurrentStep(2);
          }}
          className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            currentStep === 2
              ? 'bg-white text-amber-900 shadow-xs border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
            currentStep === 2 ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'
          }`}>2</span>
          <span>Help & Skills</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (validateStep1()) setCurrentStep(3);
          }}
          className={`py-2 px-2.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            currentStep === 3
              ? 'bg-white text-amber-900 shadow-xs border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
            currentStep === 3 ? 'bg-amber-700 text-white' : 'bg-stone-200 text-stone-700'
          }`}>3</span>
          <span>Pledges & Guests</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* STEP 1: INFO & DATES */}
        {currentStep === 1 && (
          <div className="space-y-4">
            
            {/* 1. Basic Info */}
            <div id="q1-basic-info-card" className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-stone-900">
                1. Contact Details
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div id="field-fullName" className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-fullName"
                      type="text"
                      required
                      placeholder="e.g. Juan dela Cruz"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (errors.fullName) setErrors({ ...errors, fullName: undefined });
                      }}
                      className={`w-full pl-9 pr-3 py-2 rounded-lg border ${
                        errors.fullName ? 'border-red-500 bg-red-50/40' : 'border-stone-300'
                      } focus:outline-none focus:ring-1 focus:ring-amber-600 text-stone-900 text-xs`}
                    />
                  </div>
                  {errors.fullName && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.fullName}</p>
                  )}
                </div>

                <div id="field-contactNumber" className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Mobile / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-contactNumber"
                      type="tel"
                      required
                      placeholder="0917 123 4567"
                      value={contactNumber}
                      onChange={(e) => {
                        setContactNumber(e.target.value);
                        if (errors.contactNumber) setErrors({ ...errors, contactNumber: undefined });
                      }}
                      className={`w-full pl-9 pr-3 py-2 rounded-lg border ${
                        errors.contactNumber ? 'border-red-500 bg-red-50/40' : 'border-stone-300'
                      } focus:outline-none focus:ring-1 focus:ring-amber-600 text-stone-900 text-xs`}
                    />
                  </div>
                  {errors.contactNumber && (
                    <p className="text-[11px] text-red-600 mt-1">{errors.contactNumber}</p>
                  )}
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="input-email"
                      type="email"
                      placeholder="juan@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 text-stone-900 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Attendance */}
            <div id="q2-attendance-card" className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-semibold text-stone-900">
                  2. Can you attend? <span className="text-red-500">*</span>
                </h3>
                <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
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
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                      attendance === opt.label
                        ? 'border-amber-700 bg-amber-50/60 ring-1 ring-amber-700 text-stone-900 font-semibold'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="attendance"
                        checked={attendance === opt.label}
                        onChange={() => setAttendance(opt.label as any)}
                        className="w-3.5 h-3.5 text-amber-700 focus:ring-amber-500"
                      />
                      <span className="text-sm">{opt.icon}</span>
                      <span className="text-xs font-medium">{opt.label}</span>
                    </div>
                  </label>
                ))}
              </div>

              {attendance === 'Not sure yet' && (
                <div className="pt-2 space-y-1">
                  <label className="block text-xs font-semibold text-stone-700">
                    What would help you decide?
                  </label>
                  <input
                    id="input-attendanceReason"
                    type="text"
                    placeholder="e.g. final date, exact budget, venue location"
                    value={attendanceReason}
                    onChange={(e) => setAttendanceReason(e.target.value)}
                    className="w-full p-2 rounded-lg border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              )}
            </div>

            {/* 3. Dates */}
            <div id="q3-date-card" className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-semibold text-stone-900">
                    3. Preferred Month (2027)
                  </h3>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-semibold">
                    2027 Planning
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
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
                      className={`p-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-amber-700 bg-amber-50 text-amber-950 ring-1 ring-amber-600 shadow-xs'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <span>{month}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-700 flex-shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Other month / specific date suggestions:
                </label>
                <input
                  id="input-specificDateNotes"
                  type="text"
                  placeholder="e.g. Easter week in April, Christmas holidays in December, or another month..."
                  value={specificDateNotes}
                  onChange={(e) => setSpecificDateNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 text-stone-900 text-xs"
                />
              </div>
            </div>

            {/* 4. Venue */}
            <div id="q4-venue-card" className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-stone-900">
                4. Venue & Vibe
              </h3>

              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {venueTypeOptions.map((type) => (
                    <label
                      key={type}
                      className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        preferredVenueType === type
                          ? 'border-amber-700 bg-amber-50 text-stone-900 font-semibold ring-1 ring-amber-700'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="venueType"
                        checked={preferredVenueType === type}
                        onChange={() => setPreferredVenueType(type)}
                        className="w-3.5 h-3.5 text-amber-700 focus:ring-amber-500"
                      />
                      <span className="text-xs font-medium">{type}</span>
                    </label>
                  ))}
                </div>

                {preferredVenueType === 'Other' && (
                  <div className="mt-2">
                    <input
                      id="input-venueTypeOther"
                      type="text"
                      placeholder="Specify venue type..."
                      value={venueTypeOther}
                      onChange={(e) => setVenueTypeOther(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-600 text-stone-900 text-xs"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Venue suggestions:
                </label>
                <input
                  id="input-venueSuggestion"
                  type="text"
                  placeholder="e.g. Hotel in Makati / BGC, private events place"
                  value={venueSuggestion}
                  onChange={(e) => setVenueSuggestion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 text-stone-900 text-xs"
                />
              </div>
            </div>

            {/* Next Button */}
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleGoToStep2}
                className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all"
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
            <div id="q-willingness-card" className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-stone-900">
                5. Volunteer & Organizing
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
                    className={`p-2.5 rounded-lg border cursor-pointer transition-all flex items-center gap-2 ${
                      willingToOrganize === opt
                        ? 'border-amber-700 bg-amber-50 text-stone-900 font-semibold ring-1 ring-amber-700'
                        : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="willingToOrganize"
                      checked={willingToOrganize === opt}
                      onChange={() => setWillingToOrganize(opt as any)}
                      className="w-3.5 h-3.5 text-amber-700 focus:ring-amber-500"
                    />
                    <span className="text-xs font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Skills & Services */}
            <div id="q6-skills-card" className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-stone-900">
                6. Skills to Share
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {skillsList.map((skill) => {
                  const isSelected = skillsOffered.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => handleSkillToggle(skill)}
                      className={`p-2 rounded-lg border text-xs text-left flex items-center justify-between transition-all font-medium ${
                        isSelected
                          ? 'border-amber-700 bg-amber-50 text-amber-950 font-semibold ring-1 ring-amber-700'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                      } ${skill.includes('Prefer to just attend') ? 'col-span-2 sm:col-span-3 text-center justify-center bg-stone-50' : ''}`}
                    >
                      <span>{skill}</span>
                      {isSelected && <CheckCircle2 className="w-3 h-3 text-amber-700 flex-shrink-0" />}
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
                    className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs text-stone-900"
                  />
                </div>
              )}

              <div className="pt-1">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Notes on what you can help with:
                </label>
                <textarea
                  id="input-skillsDetails"
                  rows={2}
                  placeholder="e.g. photography, logo design, catering contacts..."
                  value={skillsDetails}
                  onChange={(e) => setSkillsDetails(e.target.value)}
                  className="w-full p-2 rounded-lg border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                />
              </div>
            </div>

            {/* Event Organizer / Coordination Company Recommendation */}
            <div id="q7-organization-card" className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-3">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm sm:text-base font-semibold text-stone-900">
                    7. Recommend an Event Organizer / Coordination Company
                  </h3>
                  <span className="text-[10px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200 font-medium">
                    Optional
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
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
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 text-stone-900 text-xs"
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
                className="px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs border border-stone-200 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleGoToStep3}
                className="px-6 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-all"
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
            <div id="q5-contributions-card" className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-stone-900">
                    8. Financial Pledge
                  </h3>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Minimum contribution is <strong>₱2,000</strong>.
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
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
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                        pledgeOption === tier.val
                          ? 'border-amber-700 bg-amber-50/60 ring-1 ring-amber-700 text-stone-900 font-semibold'
                          : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
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
                          className="w-3 h-3 text-amber-700 focus:ring-amber-500"
                        />
                        <span className="text-xs font-semibold">{tier.label}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 pl-4 mt-0.5">{tier.subtitle}</span>
                    </label>
                  ))}
                </div>

                {(pledgeOption === 'Custom Amount' || pledgeOption === 'Other' || pledgeOption === '₱10,000+') && (
                  <div className="mt-2 p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-stone-800">
                        Enter Custom Amount (₱):
                      </label>
                      <span className="text-[10px] text-stone-500 font-medium">Min. ₱2,000</span>
                    </div>
                    <div className="relative max-w-xs">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-semibold text-stone-600 text-xs">₱</span>
                      <input
                        id="input-customPledgeAmount"
                        type="text"
                        placeholder="2500"
                        value={customPledgeAmount}
                        onChange={(e) => {
                          setCustomPledgeAmount(e.target.value);
                          setErrors(prev => ({ ...prev, pledge: undefined }));
                        }}
                        className={`w-full pl-6 pr-3 py-1.5 rounded-md border bg-white text-stone-900 font-semibold text-xs focus:outline-none focus:ring-1 ${
                          errors.pledge || (customPledgeAmount.trim() && parseRawAmountString(customPledgeAmount) < 2000)
                            ? 'border-rose-400 focus:ring-rose-500'
                            : 'border-amber-300 focus:ring-amber-600'
                        }`}
                      />
                    </div>

                    {/* Validation warnings */}
                    {customPledgeAmount.trim() && parseRawAmountString(customPledgeAmount) < 2000 && (
                      <p className="text-[11px] text-rose-600 font-semibold">
                        ⚠️ The minimum pledge amount is ₱2,000. Please enter ₱2,000 or higher.
                      </p>
                    )}
                    {errors.pledge && (
                      <p className="text-[11px] text-rose-600 font-semibold">
                        {errors.pledge}
                      </p>
                    )}
                    {customPledgeAmount.trim() && parseRawAmountString(customPledgeAmount) >= 2000 && (
                      <p className="text-[11px] text-emerald-700 font-medium">
                        ✓ Valid pledge: {formatPHP(parseRawAmountString(customPledgeAmount))}
                      </p>
                    )}
                  </div>
                )}

                {/* Computed Display */}
                <div className="mt-2 flex items-center justify-between p-2.5 rounded-lg bg-stone-900 text-white text-xs">
                  <span className="text-stone-300">Total pledge recorded:</span>
                  <span className="font-semibold text-amber-400 text-sm">
                    {formatPHP(Math.max(2000, computedPledge))}
                  </span>
                </div>
              </div>

              {/* In-Kind Sponsorship */}
              <div className="pt-3 border-t border-stone-100">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
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
                        className={`p-1.5 rounded-lg border text-xs text-left flex items-center justify-between transition-all font-medium ${
                          isSelected
                            ? 'border-amber-700 bg-amber-50 text-amber-950 font-semibold ring-1 ring-amber-700'
                            : 'border-stone-200 hover:border-stone-300 bg-white text-stone-700'
                        } ${item === 'None for now' ? 'col-span-2 sm:col-span-3 text-center justify-center bg-stone-50' : ''}`}
                      >
                        <span>{item}</span>
                        {isSelected && <CheckCircle2 className="w-3 h-3 text-amber-700 flex-shrink-0" />}
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
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-300 text-xs text-stone-900"
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
                    className="w-full p-2 rounded-lg border border-stone-300 text-stone-900 text-xs focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                </div>
              </div>
            </div>

            {/* Guests & Kids: Steppers (0 if none) */}
            <div id="q8-guests-card" className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-stone-900">
                9. Companions (0 if none)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Plus-Ones Number Stepper */}
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
                  <div className="text-xs font-semibold text-stone-900">Adult Guests (+1s)</div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPlusOnesCount(Math.max(0, plusOnesCount - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-semibold text-stone-700 flex items-center justify-center hover:bg-stone-100 active:scale-95 transition-all shadow-xs"
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
                      className="w-14 py-1 text-center font-semibold text-sm rounded-lg border border-stone-300 bg-white text-stone-900"
                    />

                    <button
                      type="button"
                      onClick={() => setPlusOnesCount(plusOnesCount + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-semibold text-stone-700 flex items-center justify-center hover:bg-stone-100 active:scale-95 transition-all shadow-xs"
                      aria-label="Increase adult guests"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Kids Number Stepper */}
                <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-2">
                  <div className="text-xs font-semibold text-stone-900">Kids</div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setKidsCount(Math.max(0, kidsCount - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-semibold text-stone-700 flex items-center justify-center hover:bg-stone-100 active:scale-95 transition-all shadow-xs"
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
                      className="w-14 py-1 text-center font-semibold text-sm rounded-lg border border-stone-300 bg-white text-stone-900"
                    />

                    <button
                      type="button"
                      onClick={() => setKidsCount(kidsCount + 1)}
                      className="w-7 h-7 rounded-lg bg-white border border-stone-300 font-semibold text-stone-700 flex items-center justify-center hover:bg-stone-100 active:scale-95 transition-all shadow-xs"
                      aria-label="Increase kids count"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Other Suggestions */}
            <div id="q9-suggestions-card" className="bg-white rounded-xl p-4 sm:p-5 border border-stone-200 space-y-2">
              <h3 className="text-sm sm:text-base font-semibold text-stone-900">
                10. Ideas or Suggestions
              </h3>

              <div>
                <textarea
                  id="input-otherSuggestions"
                  rows={2}
                  placeholder="e.g. invite teachers, 2000s playlist, livestream..."
                  value={otherSuggestions}
                  onChange={(e) => setOtherSuggestions(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:outline-none focus:ring-1 focus:ring-amber-600 text-stone-900 text-xs"
                />
              </div>
            </div>

            {/* Submission Bar */}
            <div className="bg-[#f5efe6] text-stone-900 rounded-xl p-3.5 flex items-center justify-between gap-3 border border-stone-200">
              <div className="text-xs text-stone-700">
                <span>Pledge: </span>
                <strong className="text-amber-800 font-semibold">{formatPHP(computedPledge)}</strong>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(2);
                    window.scrollTo({ top: 80, behavior: 'smooth' });
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-stone-100 text-stone-700 font-semibold text-xs border border-stone-300"
                >
                  Back
                </button>

                <button
                  id="btn-submit-survey-main"
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-all"
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
