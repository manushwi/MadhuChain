import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/endpoints';
import type { DiseaseAnalysis, LedgerTransaction, MintRequest, ReadingRange } from '@/lib/types';

export const queryKeys = {
  hives: ['hives'] as const,
  hiveLive: (id: string) => ['hives', id, 'live'] as const,
  analysis: (id: string) => ['hives', id, 'analysis'] as const,
  readings: (id: string, range: ReadingRange) => ['hives', id, 'readings', range] as const,
  batches: ['batches'] as const,
  barcode: (id: string) => ['batches', id, 'barcode'] as const,
  detail: (id: string) => ['batches', id, 'detail'] as const,
  mintTransaction: (id: string) => ['batches', id, 'mint-transaction'] as const,
  alerts: ['alerts'] as const,
  profile: ['profile'] as const,
};

export function useHives() {
  return useQuery({ queryKey: queryKeys.hives, queryFn: api.hives, refetchInterval: 15_000 });
}

export function useHiveLive(id: string) {
  return useQuery({
    queryKey: queryKeys.hiveLive(id),
    queryFn: () => api.hiveLive(id),
    enabled: !!id,
    refetchInterval: 10_000,
  });
}

export function useHiveAnalysis(id: string) {
  return useQuery({
    queryKey: queryKeys.analysis(id),
    queryFn: () => api.analysis(id),
    enabled: !!id,
    refetchInterval: 120_000,
  });
}

export function useHivesAnalysis(ids: string[]) {
  const enabledIds = [...new Set(ids.filter(Boolean))];
  return useQuery({
    queryKey: ['hives', 'analysis', enabledIds],
    queryFn: async () => {
      const entries = await Promise.all(
        enabledIds.map(async (id) => [id, await api.analysis(id)] as const),
      );
      return Object.fromEntries(entries) as Record<string, DiseaseAnalysis>;
    },
    enabled: enabledIds.length > 0,
    staleTime: 60_000,
    refetchInterval: 120_000,
  });
}

export function useReadings(id: string, range: ReadingRange) {
  return useQuery({
    queryKey: queryKeys.readings(id, range),
    queryFn: () => api.readings(id, range),
    enabled: !!id,
    refetchInterval: 60_000,
  });
}

export function useCreateHive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.createHive,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.hives }),
  });
}

export function useMintBatch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (b: MintRequest) => api.mint(b),
    onSuccess: (result) => {
      qc.setQueryData(queryKeys.mintTransaction(result.batch_id), result.tx);
      return qc.invalidateQueries({ queryKey: queryKeys.batches });
    },
  });
}

export function useBatches() {
  return useQuery({ queryKey: queryKeys.batches, queryFn: api.batches, refetchInterval: 30_000 });
}

export function useBatchBarcode(id: string) {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: async () => {
      const [batch, barcode] = await Promise.all([api.batch(id), api.barcode(id)]);
      return {
        ...batch,
        barcode: {
          payload: barcode.payload,
          barcode_pdf_url: barcode.barcode_pdf_url,
          barcode_pdf_base64: barcode.barcode_pdf_base64,
        },
      };
    },
    enabled: !!id,
  });
}

export function useMintTransaction(id: string) {
  return useQuery<LedgerTransaction | undefined>({
    queryKey: queryKeys.mintTransaction(id),
    queryFn: () => Promise.resolve(undefined),
    enabled: false,
  });
}

export function useAlerts() {
  return useQuery({ queryKey: queryKeys.alerts, queryFn: api.alerts, refetchInterval: 20_000 });
}

export function useAckAlert() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.ackAlert(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.alerts }),
  });
}

export function useProfile() {
  return useQuery({ queryKey: queryKeys.profile, queryFn: api.profile });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.profile }),
  });
}
