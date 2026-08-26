import {
  Announcement,
  DashboardStats,
  EventDetails,
  PlannedExpense,
  PublicRSVP,
  RSVPRecord,
  SurveyResponse,
  UserProfile,
} from '../types';

export class ApiError extends Error {}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) message = typeof body.detail === 'string' ? body.detail : message;
    } catch {}
    throw new ApiError(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const post = <T>(path: string, payload?: unknown) =>
  apiFetch<T>(path, { method: 'POST', body: payload !== undefined ? JSON.stringify(payload) : undefined });
const put = <T>(path: string, payload: unknown) =>
  apiFetch<T>(path, { method: 'PUT', body: JSON.stringify(payload) });
const patch = <T>(path: string, payload?: unknown) =>
  apiFetch<T>(path, { method: 'PATCH', body: payload !== undefined ? JSON.stringify(payload) : undefined });
const del = (path: string) => apiFetch<void>(path, { method: 'DELETE' });

// --- Survey responses -------------------------------------------------------

export const createSurveyResponse = (payload: SurveyResponse) =>
  post<SurveyResponse>('/survey-responses', payload);
export const fetchSurveyResponses = () => apiFetch<SurveyResponse[]>('/survey-responses');
export const deleteSurveyResponse = (id: string) => del(`/survey-responses/${id}`);
export const updatePaymentStatus = (id: string, status: SurveyResponse['pledgePaidStatus']) =>
  patch<SurveyResponse>(`/survey-responses/${id}/payment-status`, { status });

// --- RSVPs --------------------------------------------------------------------

export const createOrUpdateRsvp = (payload: RSVPRecord) => post<RSVPRecord>('/rsvps', payload);
export const fetchPublicRsvps = () => apiFetch<PublicRSVP[]>('/rsvps');
export const fetchAdminRsvps = () => apiFetch<RSVPRecord[]>('/rsvps/admin');

// --- Announcements --------------------------------------------------------------

export const fetchAnnouncements = () => apiFetch<Announcement[]>('/announcements');
export const likeAnnouncement = (id: string) => post<Announcement>(`/announcements/${id}/like`);
export const createAnnouncement = (payload: Announcement) =>
  post<Announcement>('/announcements', payload);
export const updateAnnouncement = (id: string, payload: Announcement) =>
  put<Announcement>(`/announcements/${id}`, payload);
export const deleteAnnouncement = (id: string) => del(`/announcements/${id}`);
export const togglePinAnnouncement = (id: string) => patch<Announcement>(`/announcements/${id}/pin`);

// --- Expenses --------------------------------------------------------------------

export const fetchExpenses = () => apiFetch<PlannedExpense[]>('/expenses');
export const createExpense = (payload: PlannedExpense) => post<PlannedExpense>('/expenses', payload);
export const updateExpense = (id: string, payload: PlannedExpense) =>
  put<PlannedExpense>(`/expenses/${id}`, payload);
export const deleteExpense = (id: string) => del(`/expenses/${id}`);

// --- Event details --------------------------------------------------------------

export const fetchEventDetails = () => apiFetch<EventDetails>('/event-details');
export const updateEventDetails = (payload: EventDetails) =>
  put<EventDetails>('/event-details', payload);

// --- Dashboard -------------------------------------------------------------------

export const fetchDashboardStats = () => apiFetch<DashboardStats>('/dashboard/stats');

// --- Admin auth ------------------------------------------------------------------

export const adminLogin = (passcode: string) =>
  post<{ isAdmin: boolean }>('/admin/login', { passcode });
export const adminLogout = () => post<{ isAdmin: boolean }>('/admin/logout');
export const adminSession = () => apiFetch<{ isAdmin: boolean }>('/admin/session');
export const resetDemoData = () => post<void>('/admin/reset-demo-data');

// --- User auth (email OTP) --------------------------------------------------------

export const registerAccount = (payload: { email: string; fullName: string; mobileNumber: string }) =>
  post<{ message: string }>('/auth/register', payload);
export const requestLogin = (email: string) =>
  post<{ message: string }>('/auth/login', { email });
export const verifyOtp = (email: string, code: string) =>
  post<{ user: UserProfile }>('/auth/verify', { email, code });
export const fetchAuthSession = () => apiFetch<{ user: UserProfile | null }>('/auth/session');
export const authLogout = () => post<{ user: UserProfile | null }>('/auth/logout');
