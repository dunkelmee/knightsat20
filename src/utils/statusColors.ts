import { DirectoryStatus, PublicRSVP } from '../types';

// Card treatment per RSVP status — mirrors the four survey attendance answers
// (see _RSVP_STATUS_BY_ATTENDANCE in backend/app/routers/survey_responses.py):
// green = definite, purple = most likely, yellow = undecided, red = declined.
export const STATUS_EDGE: Record<PublicRSVP['status'], { edge: string; avBg: string; label: string }> = {
  Attending: { edge: '#1f7a4d', avBg: '#0e5a4d', label: 'Attending' },
  'Most likely': { edge: '#7a68b0', avBg: '#6b5a9e', label: 'Most likely' },
  Maybe: { edge: '#d6982d', avBg: '#8f6112', label: 'Maybe' },
  Decline: { edge: '#c2564f', avBg: '#98443e', label: "Can't join" },
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
