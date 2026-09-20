import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import * as Linking from 'expo-linking';
import { useRemote } from '@/src/hooks/use-remote';
import {
  cacheIntake,
  clearFlag,
  getBarcode,
  getBatch,
  latestIntake,
} from '@/src/api/batches';
import type {
  ActionResponse,
  BatchDetail,
  PackagingResponse,
  ProcessingResponse,
  QualityResponse,
  ReceivedResponse,
  TransactionMetadata,
} from '@/src/api/types';
import {
  NeuButton,
  NeuCard,
  Screen,
  StatePill,
  t,
} from '@/src/theme/primitives';
import { palette } from '@/src/theme/palette';
import { FlagBanner } from '@/src/components/FlagBanner';
import { ReceivedForm } from '@/src/components/ReceivedForm';
import { QcForm } from '@/src/components/QcForm';
import { ProcessingForm } from '@/src/components/ProcessingForm';
import { PackagingForm } from '@/src/components/PackagingForm';
import { ActionCard, ErrorNote, ErrorState, LoadingState, SuccessNote } from '@/src/components/cards';
import { fmtDate, fmtNum, fmtTime, fmtWeight } from '@/src/utils/format';
import { useAuth } from '@/src/context/AuthContext';
import { can, canActOn, RESPONSIBLE_ROLE } from '@/src/auth/capabilities';
import { Lifecycle } from '@/src/components/Lifecycle';
import { TransferForm } from '@/src/components/TransferForm';

function messageFor(res: ActionResponse & { state?: string; stage?: string; action?: string; jar_ids?: string[]; resolution?: string }): string {
  if (res.resolution) return `Flag ${res.resolution}`;
  if (res.jar_ids) return `Packaged ${res.jar_ids.length} jars`;
  if (res.action) return `Processing action logged (${res.action})`;
  if (res.stage) return `QC ${res.stage} recorded → ${res.state ?? ''}`;
  return `Recorded → ${res.state ?? ''}`;
}

function jarCount(p: PackagingResponse): number {
  return p.jars && p.jars.length > 0 ? p.jars.length : p.jar_ids?.length ?? 0;
}

export default function BatchDetailScreen() {
  const { id, scanAssetType, scanJarId, scanWarnings, scanAllowedOperations } = useLocalSearchParams<{
    id: string;
    scanAssetType?: string;
    scanJarId?: string;
    scanWarnings?: string;
    scanAllowedOperations?: string;
  }>();
  const { user } = useAuth();
  const { data: batch, error, loading, refetch } = useRemote(() => getBatch(id), `hc.factory.${user?.id}.batch.${id}`);
  const [notice, setNotice] = useState<{ message: string; tx?: TransactionMetadata } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const [labelBusy, setLabelBusy] = useState(false);
  const [packagingResult, setPackagingResult] = useState<PackagingResponse | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const scanWarningList = parseStringList(scanWarnings);
  const scanOperationList = parseStringList(scanAllowedOperations);

  const intakeHint = useMemo(() => (batch ? latestIntake(batch.batchId) : undefined), [batch]);

  useEffect(() => {
    if (batch) cacheIntake(batch.batchId, batch.qualityTests);
  }, [batch]);

  if (error && !batch) return <ErrorState message={error} onRetry={refetch} />;
  if (!batch || loading && !batch) return <LoadingState label="Loading batch…" />;
  if (!batch) return <ErrorState message="Batch not found" onRetry={refetch} />;

  const finish = (res: ActionResponse & { state?: string }) => {
    setNotice({ message: messageFor(res), tx: res.tx });
    refetch();
  };

  const finishPackaging = (res: PackagingResponse) => {
    setPackagingResult(res);
    finish(res);
  };

  const openVerificationUrl = async (url: string) => {
    setVerificationError(null);
    try {
      await Linking.openURL(url);
    } catch (e) {
      setVerificationError(e instanceof Error ? e.message : 'The verification URL could not be opened.');
    }
  };

  const shareVerificationUrl = async (jarId: string, url: string) => {
    setVerificationError(null);
    try {
      await Share.share({ title: `MadhuChain jar ${jarId}`, message: `${jarId}\n${url}`, url });
    } catch (e) {
      setVerificationError(e instanceof Error ? e.message : 'The verification URL could not be shared.');
    }
  };

  const qc = (stage: 'INTAKE' | 'OUTPUT') => (
    <QcForm
      stage={stage}
      batchId={batch.batchId}
      intakeHint={stage === 'OUTPUT' ? intakeHint : undefined}
      onDone={(r: QualityResponse) => finish(r)}
    />
  );

  const openLabel = async () => {
    setLabelBusy(true);
    setActionError(null);
    try {
      const b = await getBarcode(batch.batchId);
      if (b.barcode_pdf_url) {
        await Linking.openURL(b.barcode_pdf_url);
      } else {
        setActionError('The backend did not return a barcode PDF URL.');
      }
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setLabelBusy(false);
    }
  };

  const resolveFlag = async (resolution: 'CLEARED' | 'REJECTED') => {
    setReviewBusy(true);
    setActionError(null);
    try {
      const r = await clearFlag(batch.batchId, resolution);
      finish(r);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setReviewBusy(false);
    }
  };

  const outputWeight = [...batch.processingLog].sort((a, b) => b.ts.localeCompare(a.ts)).find((entry) => entry.weightAfter != null)?.weightAfter ?? null;
  const hasPrimaryAction =
    canActOn(user?.role, 'receive', batch.state) ||
    canActOn(user?.role, 'quality:intake', batch.state) ||
    (canActOn(user?.role, 'quality:output', batch.state) && outputWeight != null && outputWeight > 0) ||
    canActOn(user?.role, 'process', batch.state) ||
    canActOn(user?.role, 'package', batch.state) ||
    canActOn(user?.role, 'review', batch.state);

  return (
    <Screen>
      <Stack.Screen options={{ title: batch.batchId }} />
      <ScrollView contentContainerStyle={styles.content} nestedScrollEnabled>
        {notice ? <SuccessNote message={notice.message} tx={notice.tx} /> : null}

        <Text style={t.h2}>Overview</Text>
        <NeuCard style={{ gap: 10 }}>
          <View style={styles.row}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={t.mono}>{batch.batchId}</Text>
              <Text style={t.small}>{batch.lotId ?? 'no lot yet'}</Text>
            </View>
            <StatePill state={batch.state} />
          </View>
          <View style={styles.row}>
            <Text style={[t.body, { color: palette.dark }]}>{fmtWeight(batch.weightKg)}</Text>
            <Text style={t.small}>harvest {fmtDate(batch.harvestStart)}–{fmtDate(batch.harvestEnd)}</Text>
          </View>
          <Text style={t.small}>
            minted {fmtDate(batch.createdAt)} ·{' '}
            {batch.hives?.length ? `${batch.hives.length} hive(s)` : 'blend lot'} · dataHash{' '}
            {batch.sensorDataHash ? batch.sensorDataHash.slice(0, 10) : '—'}
          </Text>
          {batch.current_custodian_msp ? (
            <Text style={t.small}>current custodian MSP · {batch.current_custodian_msp}</Text>
          ) : null}
        </NeuCard>

        {scanAssetType ? (
          <NeuCard sunken style={{ gap: 6 }}>
            <Text style={t.h3}>Scanned {scanAssetType}</Text>
            {scanJarId ? <Text style={t.mono}>{scanJarId}</Text> : null}
            {scanOperationList.length ? (
              <Text style={t.small}>Allowed operations reported by scan service: {scanOperationList.join(', ')}</Text>
            ) : null}
            {scanWarningList.map((warning, index) => (
              <ErrorNote key={`${warning}-${index}`} message={warning} />
            ))}
          </NeuCard>
        ) : null}

        <Lifecycle state={batch.state} />

        <FlagBanner batch={batch} />

        <Text style={t.h2}>Next operation</Text>
        {canActOn(user?.role, 'receive', batch.state) && (
          <ActionCard title="Receive lot" hint="Confirm intake at the factory gate.">
            <ReceivedForm batchId={batch.batchId} onDone={(r: ReceivedResponse) => finish(r)} />
          </ActionCard>
        )}

        {canActOn(user?.role, 'quality:intake', batch.state) && (
          <ActionCard title="Intake QC" hint="Composition panel on arrival.">
            {qc('INTAKE')}
          </ActionCard>
        )}

        {canActOn(user?.role, 'process', batch.state) && (
            <ActionCard title="Process" hint="Log a unit operation (heating / filtering).">
              <ProcessingForm batchId={batch.batchId} onDone={(r: ProcessingResponse) => finish(r)} />
            </ActionCard>
        )}
        {canActOn(user?.role, 'quality:output', batch.state) && outputWeight != null && outputWeight > 0 && (
            <ActionCard title="Output QC" hint="Anti-fraud drift check vs the intake panel runs on submit.">
              {qc('OUTPUT')}
            </ActionCard>
        )}

        {canActOn(user?.role, 'quality:output', batch.state) && (outputWeight == null || outputWeight <= 0) && (
          <ActionCard title="Awaiting processing output" hint="An output quality panel requires a recorded processing output weight.">
            <Text style={t.body}>A Factory Worker must log at least one valid processing action before Output QC can be submitted.</Text>
          </ActionCard>
        )}

        {canActOn(user?.role, 'package', batch.state) && (
          <ActionCard title="Package" hint="Jar count and average net weight; mass-balance hint shown live.">
            <PackagingForm
              batchId={batch.batchId}
              outputWeightKg={outputWeight}
              onDone={finishPackaging}
            />
          </ActionCard>
        )}

        {packagingResult ? (
          <ActionCard title={`Jar verification · ${jarCount(packagingResult)}`} hint="Open or share the verification URL supplied for each packaged jar.">
            {packagingResult.jars.length ? packagingResult.jars.map((jar, index) => (
              <View key={`${jar.jar_id}-${index}`} style={styles.jarResult}>
                <Text style={t.mono}>{jar.jar_id}</Text>
                <Text style={t.small} selectable>{jar.verification_url}</Text>
                <Text style={t.small} selectable>barcode · {jar.barcode_value}</Text>
                <View style={styles.jarActions}>
                  <View style={{ flex: 1 }}>
                    <NeuButton title="Open" variant="ghost" onPress={() => void openVerificationUrl(jar.verification_url)} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <NeuButton title="Share" variant="ghost" onPress={() => void shareVerificationUrl(jar.jar_id, jar.verification_url)} />
                  </View>
                </View>
                {jar.qr_data_url ? (
                  <NeuButton title="Open QR image" variant="ghost" onPress={() => void openVerificationUrl(jar.qr_data_url!)} />
                ) : null}
              </View>
            )) : (
              <ErrorNote message="Packaging succeeded, but the backend did not return jar verification records." />
            )}
            <ErrorNote message={verificationError ?? undefined} />
          </ActionCard>
        ) : null}

        {canActOn(user?.role, 'review', batch.state) && (
          <ActionCard
            title="Resolve flag"
            hint={
              'CLEARED returns the lot to processing; REJECTED permanently closes it.'
            }
          >
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <NeuButton title="CLEAR (reprocess)" onPress={() => resolveFlag('CLEARED')} loading={reviewBusy} />
                </View>
                <View style={{ flex: 1 }}>
                  <NeuButton title="REJECT" variant="danger" onPress={() => resolveFlag('REJECTED')} loading={reviewBusy} />
                </View>
              </View>
            <ErrorNote message={actionError ?? undefined} />
          </ActionCard>
        )}

        {!hasPrimaryAction && (batch.state !== 'RELEASED' || (!can(user?.role, 'barcode') && !canActOn(user?.role, 'transfer', batch.state))) && (
          <ActionCard title={['REVOKED', 'COLLECTION_REJECTED', 'LAB_REJECTED'].includes(batch.state) ? 'Batch closed' : 'Awaiting responsible role'} hint={['REVOKED', 'COLLECTION_REJECTED', 'LAB_REJECTED'].includes(batch.state) ? 'Rejected or revoked batches are immutable and cannot be transferred.' : `${RESPONSIBLE_ROLE[batch.state] ?? 'Another operational role'} owns the next step.`}>
            <Text style={t.body}>Your {user?.role} account has read-only access at this lifecycle state.</Text>
          </ActionCard>
        )}

        {batch.state === 'RELEASED' && can(user?.role, 'barcode') && (
          <ActionCard title="Released" hint="Lot is verified and ready to ship.">
            <NeuButton title="Open barcode label (PDF)" variant="accent" onPress={openLabel} loading={labelBusy} />
            <ErrorNote message={actionError ?? undefined} />
          </ActionCard>
        )}

        {canActOn(user?.role, 'transfer', batch.state) ? (
          <ActionCard title="Custody transfer" hint={batch.state === 'RELEASED' ? 'Released inventory remains transferable to its next custodian.' : 'Record the next custodian on-chain.'}>
            <TransferForm batchId={batch.batchId} onDone={finish} />
          </ActionCard>
        ) : null}

        <View style={{ gap: 8 }}>
          <Text style={t.h2}>History</Text>
          {batch.qualityTests.length === 0 && batch.processingLog.length === 0 && batch.jarSerials.length === 0 && batch.blends.length === 0 && batch.ownershipTransfer.length === 0 ? (
            <Text style={[t.body, { color: palette.muted }]}>No events recorded yet.</Text>
          ) : null}
        </View>

        {batch.qualityTests.length > 0 && (
          <NeuCard sunken style={{ gap: 12 }}>
            <Text style={t.h3}>Quality</Text>
            {batch.qualityTests.map((q) => (
              <QcRow key={q.id} q={q} />
            ))}
          </NeuCard>
        )}

        {batch.processingLog.length > 0 && (
          <NeuCard sunken style={{ gap: 12 }}>
            <Text style={t.h3}>Processing log</Text>
            {batch.processingLog.map((p) => (
              <View key={p.id} style={{ gap: 2 }}>
                <View style={styles.row}>
                  <Text style={[t.mono, { color: palette.accentDeep }]}>{p.actionType}</Text>
                  <Text style={t.small}>{fmtTime(p.ts)}</Text>
                </View>
                <Text style={t.small}>
                  {p.weightBefore != null ? `${p.weightBefore} → ${p.weightAfter ?? '—'} kg` : 'no weights logged'}
                  {p.equipmentId ? ` · ${p.equipmentId}` : ''}
                </Text>
              </View>
            ))}
          </NeuCard>
        )}

        {batch.jarSerials.length > 0 && (
          <NeuCard sunken style={{ gap: 12 }}>
            <Text style={t.h3}>Packaging and jars · {batch.jarSerials.length}</Text>
            <Text style={t.small} numberOfLines={8}>
              {batch.jarSerials.slice(0, 40).map((j) => j.jarId).join('\n')}
              {batch.jarSerials.length > 40 ? `\n… ${batch.jarSerials.length - 40} more` : ''}
            </Text>
          </NeuCard>
        )}

        {batch.blends.length > 0 && (
          <NeuCard sunken style={{ gap: 12 }}>
            <Text style={t.h3}>Blend composition</Text>
            {batch.blends.map((b) => (
              <View key={b.id} style={styles.row}>
                <Text style={t.mono}>{b.sourceLotId}</Text>
                <Text style={t.small}>{b.weightKg} kg · {b.percentage.toFixed(1)}%</Text>
              </View>
            ))}
          </NeuCard>
        )}

        {batch.ownershipTransfer.length > 0 && (
          <NeuCard sunken style={{ gap: 12 }}>
            <Text style={t.h3}>Custody history</Text>
            {batch.ownershipTransfer.map((o, i) => (
              <Text key={o.id} style={t.small}>
                #{i + 1} {o.fromId ?? '?'} → {o.toId ?? '?'} · {fmtTime(o.ts)}
              </Text>
            ))}
          </NeuCard>
        )}

        <NeuButton title="Back to dashboard" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </Screen>
  );
}

function QcRow({ q }: { q: BatchDetail['qualityTests'][number] }) {
  const sp = q.sugarProfile as { fructose?: number; glucose?: number; sucrose?: number } | null;
  return (
    <View style={{ gap: 2 }}>
      <View style={styles.row}>
        <StatePill state={q.stage} />
        <Text style={t.small}>{fmtTime(q.ts)}</Text>
      </View>
      <Text style={t.small}>
        moisture {fmtNum(q.moisture)}% · hmf {fmtNum(q.hmf, 1)} · diastase {fmtNum(q.diastase, 1)} · isotope {fmtNum(q.isotopeRatio, 2)}‰
      </Text>
      {sp ? (
        <Text style={t.small}>
          sugars F{fmtNum(sp.fructose)} / G{fmtNum(sp.glucose)} / S{fmtNum(sp.sucrose)}%
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  jarResult: { gap: 7, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: palette.edgeDark },
  jarActions: { flexDirection: 'row', gap: 8 },
});

function parseStringList(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    return [];
  }
}
