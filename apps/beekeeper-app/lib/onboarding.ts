import * as SecureStore from 'expo-secure-store';
import { ONBOARDING_STORAGE_KEY } from '@/constants/api';

export async function getOnboardingComplete(): Promise<boolean> {
  try {
    const v = await SecureStore.getItemAsync(ONBOARDING_STORAGE_KEY);
    return v === '1';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(value: boolean) {
  try {
    if (value) await SecureStore.setItemAsync(ONBOARDING_STORAGE_KEY, '1');
    else await SecureStore.deleteItemAsync(ONBOARDING_STORAGE_KEY);
  } catch {
    // ignore
  }
}
