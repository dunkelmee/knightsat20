export interface SurveyResponse {
  id: string;
  submittedAt: string; // ISO timestamp
  
  // Q1: Basic Information
  fullName: string;
  contactNumber: string;
  email?: string;
  section2007?: string; // Optional class section (e.g. Newton, Einstein, Curie)

  // Q2: Attendance
  attendance: 'Yes, definitely!' | 'Most likely, but still confirming' | 'Not sure yet' | 'Unfortunately, I won’t be able to attend';
  attendanceReason?: string; // If "Not sure yet", what would help you decide?

  // Q3: Preferred Date
  preferredMonths: string[]; // April, December
  specificDateNotes?: string; // Custom dates, specific holidays, or other month notes

  // Q4: Venue
  venueSuggestion?: string; // Venue name and location
  preferredVenueType: string[]; // Multiselect: Restaurant / private dining, Hotel / function room, Resort / outdoor venue, School / campus, Private house / events place, Other
  venueTypeOther?: string;

  // Q5: Contributions & Sponsorship
  pledgeOption: '₱2,000' | '₱3,000' | '₱5,000' | '₱10,000+' | 'Custom Amount' | 'Other' | string;
  customPledgeAmount?: string; // For "Custom Amount" (min ₱2,000)
  computedPledgeAmount: number; // Parsed numeric amount in PHP (min ₱2,000)
  otherSponsorships: string[]; // Food, Venue, Drinks, Prizes, etc.
  otherSponsorshipDetails?: string;

  // Q6: Skills & Services
  skillsOffered: string[]; // Event planning, Hosting, Program, Music/DJ, etc.
  skillsDetails?: string;

  // Q7: Event Organizer Suggestion
  nominatedOrganizer?: string; // Recommended professional event organizer or coordination company
  willingToOrganize: 'Yes, I’d be happy to help!' | 'Maybe, depending on what’s needed' | 'I can help occasionally' | 'I’d prefer not to be involved in organizing';

  // Q8: Guests
  plusOnesCount?: number;
  kidsCount?: number;
  bringingPlusOne?: 'No' | 'Yes, 1 +1' | 'Not sure yet' | string;
  bringingKids?: 'No' | 'Yes' | 'Not sure yet' | string;

  // Q9: Other Suggestions
  otherSuggestions?: string;
  
  // Admin tracking
  pledgePaidStatus?: 'Unpaid / Pledged' | 'Partially Paid' | 'Fully Paid';
  adminNotes?: string;
}

// The survey form's submission payload — identity (name/contact/email) comes
// from the logged-in account server-side, not re-entered in the form, and
// computedPledgeAmount/pledgePaidStatus/adminNotes are server-assigned.
export type SurveyResponseCreate = Omit<
  SurveyResponse,
  'id' | 'submittedAt' | 'fullName' | 'contactNumber' | 'email' | 'computedPledgeAmount' | 'pledgePaidStatus' | 'adminNotes'
>;

export interface RSVPRecord {
  id: string;
  submittedAt: string;
  fullName: string;
  contactNumber?: string;
  email?: string;
  status: 'Attending' | 'Maybe' | 'Decline';
  bringingPlusOne: boolean;
  kidsCount: number;
  dietaryRestrictions?: string;
  messageToBatch?: string;
}

export interface Announcement {
  id: string;
  title: string;
  caption: string;
  imageUrl?: string;
  tag: 'Important' | 'Survey' | 'Venue' | 'Finance' | 'General' | 'Volunteer';
  author: string;
  date: string;
  isPinned?: boolean;
  likesCount: number;
}

export interface PlannedExpense {
  id: string;
  name: string;
  category: 'Venue & Banquet' | 'Audio Visual & Lights' | 'Souvenirs & T-Shirts' | 'Photo & Video' | 'Prizes & Tokens' | 'Decorations & Program' | 'Administrative & Misc';
  amount: number;
  targetDate?: string;
  status: 'Estimated' | 'Quoted' | 'Approved' | 'Paid';
  notes?: string;
  updatedAt: string;
}

// Committee-internal venue shortlist (Event Planning tab) — never surfaced
// to attendees, distinct from the public EventDetails singleton below.
export interface ScoutedVenue {
  id: string;
  name: string;
  tentativeDate?: string;
  address?: string;
  quotedCost?: number;
  miscDetails?: string;
  updatedAt: string;
}

export interface EventDetails {
  status: 'Pending' | 'Finalized';
  date: string;
  time?: string;
  venue: string;
  venueAddress?: string;
  mapLink?: string;
  dressCode?: string;
  theme?: string;
  notes?: string;
  updatedAt?: string;
}

export interface BatchStats {
  totalSurveys: number;
  totalPledges: number;
  totalExpenses: number;
  runningBalance: number;
  attendingCount: number;
  likelyCount: number;
  undecidedCount: number;
  declinedCount: number;
  estimatedHeadcount: number;
}

// Server-computed aggregates for the public dashboard (GET /api/dashboard/stats).
// A superset of BatchStats — adds the month/venue-type vote tallies the
// public dashboard renders, computed server-side so raw survey PII never
// needs to leave the backend for an unauthenticated visitor.
export interface DashboardStats extends BatchStats {
  pledgingCount: number;
  monthTally: Record<string, number>;
  venueTally: Record<string, number>;
}

// PII-free subset of RSVPRecord served to unauthenticated visitors on the
// public roster (GET /api/rsvps) — contactNumber/email are admin-only.
export type PublicRSVP = Pick<
  RSVPRecord,
  'id' | 'submittedAt' | 'fullName' | 'status' | 'bringingPlusOne' | 'kidsCount' | 'messageToBatch'
>;

// A logged-in alumnus's account. Organizer access is a permanent, per-account
// flag granted only by the superadmin (see SuperadminPortal) — there's no
// shared passcode anymore.
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  mobileNumber: string;
  thenPhotoUrl?: string | null;
  nowPhotoUrl?: string | null;
  onboardingCompleted: boolean;
  currentCity?: string | null;
  currentRole?: string | null;
  sectionYear1?: string | null;
  sectionYear2?: string | null;
  sectionYear3?: string | null;
  sectionHs?: string | null; // holds the 4th Year section — see utils/sections.ts
  showInDirectory: boolean;
  isOrganizer: boolean;
}

// --- Superadmin ---------------------------------------------------------------

export interface AdminUserSummary {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  isOrganizer: boolean;
  onboardingCompleted: boolean;
}

export interface AuditLogEntry {
  id: string;
  actorName: string;
  description: string;
  createdAt: string;
}

// --- Directory --------------------------------------------------------------

export type DirectoryStatus = 'attending' | 'missing' | 'faculty';

export interface DirectoryPerson {
  id: string;
  displayName: string;
  currentCity?: string | null;
  currentRole?: string | null;
  sectionYear1?: string | null;
  sectionYear2?: string | null;
  sectionYear3?: string | null;
  sectionHs?: string | null;
  thenPhotoUrl?: string | null;
  nowPhotoUrl?: string | null;
  status: DirectoryStatus;
  lastSeenCity?: string | null;
}

export interface DirectoryCounts {
  all: number;
  attending: number;
  missing: number;
  faculty: number;
}

export interface DirectoryListResponse {
  total: number;
  counts: DirectoryCounts;
  nextCursor: string | null;
  people: DirectoryPerson[];
}

export interface DirectoryUpdatePayload {
  currentCity?: string | null;
  currentRole?: string | null;
  sectionYear1?: string | null;
  sectionYear2?: string | null;
  sectionYear3?: string | null;
  sectionHs?: string | null;
  showInDirectory: boolean;
}

// --- Photo Wall ---------------------------------------------------------------

export interface Contributor {
  initials: string;
}

export interface Album {
  id: string;
  title: string;
  description?: string | null;
  isLiveDay: boolean;
  photoCount: number;
  contributorCount: number;
  coverThumbUrl?: string | null;
  recentThumbUrls: string[];
  contributors: Contributor[];
}

export interface Photo {
  id: string;
  thumbUrl: string;
  fullUrl: string;
  caption?: string | null;
  uploaderInitials: string;
  uploadedBy: string;
  createdAt: string;
}

export interface AlbumDetail {
  id: string;
  title: string;
  description?: string | null;
  isLiveDay: boolean;
  createdBy: string;
  photoCount: number;
  nextCursor: string | null;
  photos: Photo[];
}
