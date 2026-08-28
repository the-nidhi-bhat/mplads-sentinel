export const AUTH_STORAGE_KEY = "mplads-auth";
export const PROFILE_STORAGE_KEY = "mplads-profile";

export type StoredProfile = { name: string; email: string };

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
      return { name: parsed.name, email: parsed.email };
    }
  } catch {
    return null;
  }
  return null;
}

export function storeAuth(profile: StoredProfile): void {
  localStorage.setItem(AUTH_STORAGE_KEY, "true");
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function updateStoredProfile(patch: Partial<StoredProfile>): void {
  const current = getStoredProfile() ?? { name: "Demo User", email: "" };
  localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({ ...current, ...patch })
  );
}