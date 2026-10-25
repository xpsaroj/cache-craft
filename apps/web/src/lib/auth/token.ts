const ACCESS_TOKEN_KEY = "cachecraft.accessToken";
export const UNAUTHORIZED_EVENT = "cachecraft:unauthorized";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function readAccessToken(): string | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function writeAccessToken(token: string): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch {
    return;
  }
}

export function clearAccessToken(): void {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch {
    return;
  }
}

export function emitUnauthorized(): void {
  if (!canUseStorage()) {
    return;
  }

  window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
}
