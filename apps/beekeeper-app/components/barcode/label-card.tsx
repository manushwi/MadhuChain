import React, { useState } from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { BarcodeLabel } from '@/components/barcode/code128';
import { Neumorph } from '@/components/ui/neumorph';
import { getPalette } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Batch } from '@/lib/types';

export function BarcodeLabelCard({ batch }: { batch: Batch }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  const [sharing, setSharing] = useState(false);

  const payload = batch.barcode?.payload;
  const serverLabel = batch.barcode?.barcode_pdf_url;

  const onShare = async () => {
    setSharing(true);
    try {
      if (serverLabel) {
        await Linking.openURL(serverLabel);
        return;
      }
      const html = `
      <div style="padding:24px;font-family:sans-serif">
        <h2 style="color:#9B4E32">HoneyChain — Raw Honey Label</h2>
        <p>Lot ID: <strong>${payload?.lot_id}</strong></p>
        <p>Weight: <strong>${payload?.weight_kg} kg</strong></p>
        <p>Harvest date: <strong>${payload?.harvest_date}</strong></p>
        <p style="font-size:11px;color:#888">Paste this label on the raw honey boxes before shipping to the factory.</p>
      </div>`;
      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <Neumorph style={styles.card}>
      <Text variant="titleMedium" style={{ color: c.darkAccent, fontWeight: '700', marginBottom: 12 }}>
        Raw Honey Label
      </Text>

      <View style={styles.fields}>
        <Field label="Lot ID" value={payload?.lot_id ?? batch.lot_id} />
        <Field label="Weight" value={`${batch.weight_kg} kg`} />
        <Field label="Harvest date" value={payload?.harvest_date ?? batch.harvest_end} />
      </View>

      {payload && <BarcodeLabel payload={payload} />}

      <Text variant="bodySmall" style={{ color: c.muted, textAlign: 'center', marginTop: 12 }}>
        Paste this label on the raw honey boxes before shipping to the factory.
      </Text>

      <Button
        mode="contained"
        buttonColor={c.accent}
        textColor={c.highlight}
        icon="share-variant"
        style={styles.button}
        onPress={onShare}
        disabled={sharing}>
        {sharing ? <ActivityIndicator color={c.highlight} /> : serverLabel ? 'Open Server PDF Label' : 'Share / Save Label'}
      </Button>
    </Neumorph>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  const scheme = useColorScheme() ?? 'light';
  const c = getPalette(scheme);
  return (
    <View style={styles.fieldRow}>
      <Text variant="labelMedium" style={{ color: c.muted }}>{label}</Text>
      <Text variant="titleSmall" style={{ color: c.primaryDark }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 22 },
  fields: { marginBottom: 16 },
  fieldRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  button: { marginTop: 16, borderRadius: 14 },
});
