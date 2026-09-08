import { DirectoryStatus, PublicRSVP } from '../types';

// Card treatment per RSVP status — mirrors the four survey attendance answers
// (see _RSVP_STATUS_BY_ATTENDANCE in backend/app/routers/survey_responses.py):
// green = definite, purple = most likely, yellow = undecided, red = declined.
// `onDark` is the same hue lifted for a dark ground. The attendance wall sits
// on paper and uses avBg; the organizer view sits on the green body, where
// avBg (#0e5a4d green on green) would be unreadable. Both read the same row,
// so a status keeps one name and one hue across the whole app.
export const STATUS_EDGE: Record<PublicRSVP['status'], { edge: string; avBg: string; onDark: string; label: string }> = {
  Attending: { edge: '#1f7a4d', avBg: '#0e5a4d', onDark: '#7fd8c4', label: 'Attending' },
  'Most likely': { edge: '#7a68b0', avBg: '#6b5a9e', onDark: '#b3a3e0', label: 'Most likely' },
  Maybe: { edge: '#d6982d', avBg: '#8f6112', onDark: '#f0c674', label: 'Maybe' },
  Decline: { edge: '#c2564f', avBg: '#98443e', onDark: '#e9a49d', label: "Can't join" },
};

// The survey stores the raw answer text; the roster stores a status. This is
// the same lookup the server does when it syncs one into the other — see
// _RSVP_STATUS_BY_ATTENDANCE in backend/app/routers/survey_responses.py — so
// a response shown in the organizer view carries the label its card on the
// attendance wall will carry.
const RSVP_STATUS_BY_ATTENDANCE: Record<string, PublicRSVP['status']> = {
  'Yes, definitely!': 'Attending',
  'Most likely, but still confirming': 'Most likely',
  'Not sure yet': 'Maybe',
  'Unfortunately, I won’t be able to attend': 'Decline',
};

export const statusFromAttendance = (attendance: string): PublicRSVP['status'] => {
  const exact = RSVP_STATUS_BY_ATTENDANCE[attendance];
  if (exact) return exact;
  // Substring fallback, kept from the call sites this replaced: the decline
  // answer has been written with both a straight and a curly apostrophe over
  // the life of the survey, so an exact match alone would silently mislabel
  // older rows.
  if (attendance.includes('Yes')) return 'Attending';
  if (attendance.includes('Most likely')) return 'Most likely';
  if (attendance.includes('Not sure')) return 'Maybe';
  return 'Decline';
};

// The directory card's status dot reads the same palette, so a colour means the
// same thing on both tabs: someone amber on the attendance wall is amber here.
// The two statuses with no wall equivalent get hues of their own — faculty a
// slate that stays clear of the "most likely" purple, and no-response a muted
// grey that reads as absent data rather than as an answer.
export const DIRECTORY_DOT: Record<DirectoryStatus, { dot: string; label: string }> = {
  attending: { dot: STATUS_EDGE.Attending.edge, label: 'Attending' },
  most_likely: { dot: STATUS_EDGE['Most likely'].edge, label: 'Most likely' },
  maybe: { dot: STATUS_EDGE.Maybe.edge, label: 'Not sure yet' },
  declined: { dot: STATUS_EDGE.Decline.edge, label: "Can't join" },
  faculty: { dot: '#2f4858', label: 'Faculty' },
  no_response: { dot: '#9ba49f', label: 'No response yet' },
};
