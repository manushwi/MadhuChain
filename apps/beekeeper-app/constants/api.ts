import Constants from 'expo-constants';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

function normalizeApiUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return value.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

function getDevelopmentApiUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  if (!hostUri) return 'http://localhost:4000';

  try {
    const url = new URL(hostUri.includes('://') ? hostUri : `http://${hostUri}`);
    return `http://${url.hostname}:4000`;
  } catch {
    return 'http://localhost:4000';
  }
}

const normalizedConfiguredUrl = configuredApiUrl ? normalizeApiUrl(configuredApiUrl) : null;

export const API_CONFIGURATION_ERROR = configuredApiUrl && !normalizedConfiguredUrl
  ? 'EXPO_PUBLIC_API_URL must be a valid http or https URL.'
  : !configuredApiUrl && !__DEV__
    ? 'EXPO_PUBLIC_API_URL is required for production builds.'
    : null;

export const API_BASE_URL = normalizedConfiguredUrl ?? (__DEV__ ? getDevelopmentApiUrl() : '');
export const API_FETCH_TIMEOUT_MS = 12_000;
export const TOKEN_STORAGE_KEY = 'madhuchain.session.token';
export const ONBOARDING_STORAGE_KEY = 'madhuchain.onboarding.complete';
