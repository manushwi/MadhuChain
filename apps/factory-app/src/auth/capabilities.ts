import type { BatchChainState } from '@/src/theme/primitives';
import type { Role } from '@/src/api/types';

export type Capability =
  | 'receive'
  | 'quality:intake'
  | 'quality:output'
  | 'process'
  | 'blend'
  | 'package'
  | 'review'
  | 'transfer'
  | 'barcode'
  | 'scan';

export const OPERATION_ROLES: Role[] = [
  'TRANSPORTER',
  'LABTECH',
  'FACTORYWORKER',
  'QCMANAGER',
  'DISTRIBUTOR',
  'ADMIN',
];

const ROLE_CAPABILITIES: Record<Role, readonly Capability[]> = {
  BEEKEEPER: [],
  CONSUMER: [],
  TRANSPORTER: ['receive', 'transfer', 'barcode', 'scan'],
  LABTECH: ['quality:intake', 'quality:output', 'scan'],
  FACTORYWORKER: ['process', 'blend', 'package', 'transfer', 'barcode', 'scan'],
  QCMANAGER: ['review', 'scan'],
  DISTRIBUTOR: ['scan'],
  ADMIN: ['barcode', 'scan'],
};

export const ROLE_LABELS: Record<Role, string> = {
  BEEKEEPER: 'Beekeeper',
  CONSUMER: 'Consumer',
  TRANSPORTER: 'Transport & custody',
  LABTECH: 'Laboratory work queue',
  FACTORYWORKER: 'Factory floor',
  QCMANAGER: 'Quality review',
  DISTRIBUTOR: 'Released inventory',
  ADMIN: 'Batch oversight',
};

export const RESPONSIBLE_ROLE: Partial<Record<BatchChainState, string>> = {
  HARVESTED: 'Transporter',
  COLLECTED: 'Lab Technician',
  LAB_APPROVED: 'Factory Worker',
  PROCESSED: 'Lab Technician',
  OUTPUT_APPROVED: 'Factory Worker',
  FLAGGED: 'QC Manager',
  RELEASED: 'Authorized custodian',
};

export function isOperationsRole(role: Role | undefined): boolean {
  return role !== undefined && OPERATION_ROLES.includes(role);
}

export function can(role: Role | undefined, capability: Capability): boolean {
  return role !== undefined && ROLE_CAPABILITIES[role].includes(capability);
}

export function canActOn(role: Role | undefined, capability: Capability, state: BatchChainState): boolean {
  if (!can(role, capability) || state === 'REVOKED' || state === 'COLLECTION_REJECTED' || state === 'LAB_REJECTED') return false;
  if (capability === 'transfer' && state === 'FLAGGED') return false;
  switch (capability) {
    case 'receive': return state === 'HARVESTED';
    case 'quality:intake': return state === 'COLLECTED';
    case 'quality:output': return state === 'PROCESSED';
    case 'process': return state === 'LAB_APPROVED';
    case 'package': return state === 'OUTPUT_APPROVED';
    case 'review': return state === 'FLAGGED';
    case 'transfer': return true;
    default: return can(role, capability);
  }
}

export function isRoleWork(role: Role, state: BatchChainState, flagged: boolean): boolean {
  switch (role) {
    case 'TRANSPORTER': return state === 'HARVESTED' || state === 'RELEASED';
    case 'LABTECH': return state === 'COLLECTED' || state === 'PROCESSED';
    case 'FACTORYWORKER': return state === 'LAB_APPROVED' || state === 'OUTPUT_APPROVED';
    case 'QCMANAGER': return flagged || state === 'FLAGGED';
    case 'DISTRIBUTOR': return state === 'RELEASED';
    default: return false;
  }
}
