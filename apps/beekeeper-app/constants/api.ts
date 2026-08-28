// Backend API configuration.
// Flip USE_MOCK to true to run the app against the in-memory mock data layer,
// or set API_BASE_URL to the live backend (e.g. http://192.168.1.42:4000).
export const API_BASE_URL = 'http://localhost:4000';
export const USE_MOCK = true;
export const TOKEN_STORAGE_KEY = 'honeychain.session.token';
export const ONBOARDING_STORAGE_KEY = 'honeychain.onboarding.complete';
