import Constants from 'expo-constants';

function normalizeBaseUrl(value: string | undefined): string | null {
  const url = value?.trim().replace(/\/+$/, '');
  if (!url) return null;
  return /^https?:\/\/[^\s]+$/i.test(url) ? url : null;
}

function metroApiUrl(): string | null {
  if (!__DEV__ || !Constants.expoConfig?.hostUri) return null;
  try {
    const metroUrl = new URL(
      Constants.expoConfig.hostUri.includes('://')
        ? Constants.expoConfig.hostUri
        : `http://${Constants.expoConfig.hostUri}`,
    );
    const host = metroUrl.hostname.includes(':') ? `[${metroUrl.hostname}]` : metroUrl.hostname;
    return `http://${host}:4000`;
  } catch {
    return null;
  }
}

const configuredUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const normalizedConfiguredUrl = normalizeBaseUrl(configuredUrl);

export const API_BASE_URL = normalizedConfiguredUrl ?? (!configuredUrl ? metroApiUrl() : null);
export const API_CONFIGURATION_ERROR = configuredUrl && !normalizedConfiguredUrl
  ? 'EXPO_PUBLIC_API_BASE_URL must be a complete http:// or https:// URL.'
  : !API_BASE_URL
    ? 'No backend API is configured. Set EXPO_PUBLIC_API_BASE_URL before starting or building the app.'
    : null;

export const TOKEN_STORAGE_KEY = 'madhuchain.factory.token';
