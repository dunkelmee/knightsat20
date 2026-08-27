import {
  Album,
  AlbumDetail,
  Announcement,
  DashboardStats,
  DirectoryListResponse,
  DirectoryUpdatePayload,
  EventDetails,
  Photo,
  PlannedExpense,
  PublicRSVP,
  RSVPRecord,
  SurveyResponse,
  SurveyResponseCreate,
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

export const createSurveyResponse = (payload: SurveyResponseCreate) =>
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
  post<{ user: UserProfile; hasSubmittedSurvey: boolean }>('/auth/verify', { email, code });
export const fetchAuthSession = () =>
  apiFetch<{ user: UserProfile | null; hasSubmittedSurvey: boolean }>('/auth/session');
export const authLogout = () => post<{ user: UserProfile | null }>('/auth/logout');
export const updateProfile = (payload: {
  fullName: string;
  mobileNumber: string;
  thenPhotoUrl?: string | null;
  nowPhotoUrl?: string | null;
}) => put<{ user: UserProfile; hasSubmittedSurvey: boolean }>('/auth/profile', payload);

// --- Directory ---------------------------------------------------------------

export const fetchDirectory = (params: {
  q?: string;
  filter?: 'all' | 'attending' | 'missing' | 'faculty';
  cursor?: string;
  limit?: number;
}) => {
  const search = new URLSearchParams();
  if (params.q) search.set('q', params.q);
  if (params.filter) search.set('filter', params.filter);
  if (params.cursor) search.set('cursor', params.cursor);
  if (params.limit) search.set('limit', String(params.limit));
  const qs = search.toString();
  return apiFetch<DirectoryListResponse>(`/directory${qs ? `?${qs}` : ''}`);
};

export const updateDirectoryProfile = (payload: DirectoryUpdatePayload) =>
  patch('/profile/directory', payload);

// --- Photo Wall ----------------------------------------------------------------

export const fetchAlbums = () => apiFetch<Album[]>('/albums');
export const createAlbum = (payload: { title: string; description?: string }) =>
  post<Album>('/albums', payload);
export const fetchAlbum = (id: string, cursor?: string) =>
  apiFetch<AlbumDetail>(`/albums/${id}${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`);
export const updateAlbum = (
  id: string,
  payload: { title?: string; description?: string; isLiveDay?: boolean }
) => patch<Album>(`/albums/${id}`, payload);
export const deleteAlbum = (id: string) => del(`/albums/${id}`);
export const deletePhoto = (albumId: string, photoId: string) =>
  del(`/albums/${albumId}/photos/${photoId}`);

// Bypasses the JSON-only apiFetch wrapper — multipart uploads can't set a
// Content-Type header manually (the browser needs to add the boundary).
export const uploadAlbumPhotos = async (
  albumId: string,
  pairs: { full: Blob; thumb: Blob }[]
): Promise<Photo[]> => {
  const formData = new FormData();
  pairs.forEach(({ full, thumb }, i) => {
    formData.append('full', full, `full-${i}.jpg`);
    formData.append('thumb', thumb, `thumb-${i}.jpg`);
  });

  const res = await fetch(`/api/albums/${albumId}/photos`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
  });

  if (!res.ok) {
    let message = `Upload failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.detail) message = typeof body.detail === 'string' ? body.detail : message;
    } catch {}
    throw new ApiError(message);
  }

  return res.json() as Promise<Photo[]>;
};
