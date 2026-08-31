import React, { useRef, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { CameraView, useCameraPermissions, type BarcodeType } from 'expo-camera';
import { NeuButton, NeuInput, Screen, t } from '@/src/theme/primitives';
import { palette } from '@/src/theme/palette';
import { ErrorNote, LoadingState } from '@/src/components/cards';
import { scanFactoryAsset } from '@/src/api/batches';
import { ApiError } from '@/src/api/client';
import type { FactoryScanResponse } from '@/src/api/types';
import { useAuth } from '@/src/context/AuthContext';
import { can } from '@/src/auth/capabilities';

const SCAN_TYPES: BarcodeType[] = ['qr', 'ean13', 'ean8', 'code128', 'code39', 'code93', 'pdf417', 'aztec'];

export default function ScanScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState('');
  const [manualActive, setManualActive] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const lastScan = useRef<{ value: string; at: number }>({ value: '', at: 0 });

  const go = async (raw: string) => {
    const payload = raw.trim();
    if (!payload || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const result = await resolveAsset(payload);
      router.replace({
        pathname: '/batch/[id]',
        params: {
          id: result.batch_id,
          scanAssetType: result.asset_type,
          ...(result.jar_id ? { scanJarId: result.jar_id } : {}),
          ...(result.warnings?.length ? { scanWarnings: JSON.stringify(result.warnings) } : {}),
          ...(result.allowed_operations?.length
            ? { scanAllowedOperations: JSON.stringify(result.allowed_operations) }
            : {}),
        },
      });
    } catch (e) {
      setErr(friendlyScanError(e));
      setBusy(false);
    }
  };

  const handleScan = ({ data: value }: { data: string }) => {
    const now = Date.now();
    if (lastScan.current.value === value && now - lastScan.current.at < 2500) return;
    lastScan.current = { value, at: now };
    void go(value);
  };

  const resolveAsset = async (payload: string): Promise<FactoryScanResponse> => {
    try {
      const result = await scanFactoryAsset(payload);
      if (!result.batch_id || !result.asset_type) {
        throw new Error('The scan service returned an incomplete asset response.');
      }
      return result;
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        throw new Error('That code was not recognised as a batch or jar in this ledger.');
      }
      throw e;
    }
  };

  const friendlyScanError = (e: unknown): string => {
    if (e instanceof ApiError) {
      if (e.status === 401 || e.status === 403) {
        return 'You are not authorized to scan. Sign out and back in with an operational account.';
      }
      if (e.status === 404) {
        return 'That code was not recognised as a batch or jar in this ledger.';
      }
      if (e.status === 0) {
        return 'The scan request could not reach the backend. Check your connection and try again.';
      }
    }
    return e instanceof Error && e.message ? e.message : 'The scanned asset could not be resolved. Please try again.';
  };

  if (!can(user?.role, 'scan')) return <ErrorNote message="Your account cannot access the operations scanner." />;
  if (!permission) return <LoadingState label="Loading camera permissions..." />;

  return (
    <Screen style={{ padding: 16 }}>
      {permission.granted && !manualActive ? (
        <View style={{ flex: 1, gap: 12 }}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: SCAN_TYPES }}
            onBarcodeScanned={busy ? undefined : handleScan}
            onMountError={({ message }) => setCameraError(message || 'The camera could not start.')}
          />
          <Text style={t.small}>{busy ? 'Resolving asset with HoneyChain...' : 'Scan a HoneyChain batch or jar code.'}</Text>
          <ErrorNote message={cameraError ?? undefined} />
          <ErrorNote message={err ?? undefined} />
          <NeuButton title="Enter a code instead" variant="ghost" onPress={() => setManualActive(true)} disabled={busy} />
        </View>
      ) : (
        <View style={{ gap: 16, paddingTop: 8 }}>
          <Text style={t.body}>Enter the complete value printed or encoded on the batch or jar label.</Text>
          {!permission.granted && permission.canAskAgain ? <NeuButton title="Enable camera access" onPress={requestPermission} /> : null}
          {!permission.granted && !permission.canAskAgain ? (
            <>
              <ErrorNote message="Camera access is disabled in system settings. Manual entry remains available." />
              <NeuButton title="Open settings" variant="ghost" onPress={() => Linking.openSettings()} />
            </>
          ) : null}
          <NeuInput label="label value" value={manual} onChangeText={setManual} autoCapitalize="none" autoCorrect={false} onSubmitEditing={() => void go(manual)} returnKeyType="go" />
          <ErrorNote message={err ?? undefined} />
          <NeuButton title="Resolve asset" onPress={() => void go(manual)} loading={busy} disabled={!manual.trim()} />
          {permission.granted ? <NeuButton title="Use camera" variant="ghost" onPress={() => setManualActive(false)} disabled={busy} /> : null}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  camera: { flex: 1, borderRadius: 22, overflow: 'hidden', backgroundColor: palette.dark },
});
