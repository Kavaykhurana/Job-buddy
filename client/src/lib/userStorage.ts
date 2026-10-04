import { currentUserId } from "./authApi";

/** Browser cache only: always partition data by the authenticated account. */
export function userStorageKey(key: string): string {
  const userId = currentUserId();
  if (!userId) throw new Error("No authenticated user is available for browser storage.");
  return `job-buddy:${userId}:${key}`;
}

export function readUserStorage(key: string): string | null { return localStorage.getItem(userStorageKey(key)); }
export function writeUserStorage(key: string, value: string): void { localStorage.setItem(userStorageKey(key), value); }

export const userLocalStorage = {
  getItem(key: string): string | null { return readUserStorage(key); },
  setItem(key: string, value: string): void { writeUserStorage(key, value); },
  removeItem(key: string): void { localStorage.removeItem(userStorageKey(key)); },
};
