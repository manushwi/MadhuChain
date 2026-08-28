import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/endpoints';
import type { MintRequest, ReadingRange } from '@/lib/types';

export const queryKeys = {
  hives: ['hives'] as const,
  hiveLive: (id: string) => ['hives', id, 'live'] as const,
  readings: (id: string, range: ReadingRange) => ['hives', id, 'readings', range] as const,
  batches: ['batches'] as const,
  barcode: (id: string) => ['batches', id, 'barcode'] as const,
  alerts: ['alerts'] as const,
  profile: ['profile'] as const,
};

export function useHives() {
  return useQuery({ queryKey: queryKeys.hives, queryFn: api.hives });
}

export function useHiveLive(id: string) {
  return useQuery({
    queryKey: queryKeys.hiveLive(id),
    queryFn: () => api.hiveLive(id),
    enabled: !!id,
  });
}

export function useReadings(id: string, range: ReadingRange) {
  return useQuery({
    queryKey: queryKeys.readings(id, range),
    queryFn: () => api.readings(id, range),
    enabled: !!id,
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
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.batches }),
  });
}

export function useBatches() {
  return useQuery({ queryKey: queryKeys.batches, queryFn: api.batches });
}

export function useBatchBarcode(id: string) {
  return useQuery({
    queryKey: queryKeys.barcode(id),
    queryFn: () => api.barcode(id),
    enabled: !!id,
  });
}

export function useAlerts() {
  return useQuery({ queryKey: queryKeys.alerts, queryFn: api.alerts });
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
