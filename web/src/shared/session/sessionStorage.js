export const SESSION_KEY = 'vetease-session'

export function loadStoredSession() {
  try {
    return JSON.parse(globalThis.localStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}

export function saveStoredSession(session) {
  globalThis.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearStoredSession() {
  globalThis.localStorage.removeItem(SESSION_KEY)
}
