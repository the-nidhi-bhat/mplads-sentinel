export const AUTH_STORAGE_KEY = "mplads-auth";
export const PROFILE_STORAGE_KEY = "mplads-profile";
export const TOKEN_STORAGE_KEY = "mplads-token";

export type StoredProfile = {
  name: string;
  email: string;
  username?: string;
  role?: string;
};

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
}

export function getStoredProfile(): StoredProfile | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StoredProfile>;
    if (typeof parsed.name === "string" && typeof parsed.email === "string") {
      return {
        name: parsed.name,
        email: parsed.email,
        username: parsed.username,
        role: parsed.role,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export function storeAuth(profile: StoredProfile, token?: string): void {
  localStorage.setItem(AUTH_STORAGE_KEY, "true");
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function storeToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function clearAuth(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

export function updateStoredProfile(patch: Partial<StoredProfile>): void {
  const current = getStoredProfile() ?? { name: "Demo User", email: "" };
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({ ...current, ...patch })
  );
}