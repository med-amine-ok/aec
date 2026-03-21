export const ADMIN_LOGIN_EMAIL = 'aec@vic.com';
export const ADMIN_LOGIN_PASSWORD = 't7ya/aec-2026';
export const ADMIN_SESSION_KEY = 'aec_admin_session';
export const ADMIN_STATUS_KEY = 'aec_admin_team_statuses';
export const ADMIN_DASHBOARD_PATH = '/dufgwetyfgvwiteyc';
export const ADMIN_LOGIN_PATH = '/admin-login';

export type TeamStatus = 'pending' | 'accepted' | 'rejected';

export const isValidAdminCredentials = (email: string, password: string) =>
  email.trim().toLowerCase() === ADMIN_LOGIN_EMAIL && password === ADMIN_LOGIN_PASSWORD;

export const getAdminSession = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(ADMIN_SESSION_KEY) === 'true';
};

export const setAdminSession = (isAuthenticated: boolean) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ADMIN_SESSION_KEY, isAuthenticated ? 'true' : 'false');
};

export const clearAdminSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const loadTeamStatusMap = (): Record<string, TeamStatus> => {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_STATUS_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, TeamStatus>;
    return typeof parsed === 'object' && parsed ? parsed : {};
  } catch {
    return {};
  }
};

export const saveTeamStatusMap = (statusMap: Record<string, TeamStatus>) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ADMIN_STATUS_KEY, JSON.stringify(statusMap));
};
