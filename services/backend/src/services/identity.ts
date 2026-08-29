import crypto from 'node:crypto';
import { config } from '../config.js';

/**
 * Custodial identity management (Coinbase-style).
 *
 * The beekeeper/app user never holds keys. This module:
 *   1. Derives a stable Fabric enrollment user id for a role.
 *   2. Encrypts key material at rest (AES-256-GCM) with a server master key.
 *   3. Maps the app user to the on-chain role used for signing.
 *
 * NOTE (v1): X.509 certificates for each role are currently enrolled by the
 * shell script chain/network/enrollIdentities.sh against the Fabric CA. The
 * full "enroll a new cert on signup" flow can hook into Fabric CA here — the
 * DB-side custodial record and key-encryption primitives are provided now.
 */

const MASTER_KEY: Buffer =
  process.env.KEY_ENCRYPTION_KEY
    ? Buffer.from(process.env.KEY_ENCRYPTION_KEY, 'utf8')
    : crypto.createHash('sha256').update(config.JWT_SECRET).digest();

/** Derive the Fabric enrollment user id for a given role. */
export function fabricUserForRole(role: string): string {
  return role.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/** Encrypt a private key (PEM) at rest using AES-256-GCM. */
export function encryptKeyMaterial(pem: string, key: Buffer = MASTER_KEY): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(pem, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64'), tag.toString('base64'), enc.toString('base64')].join('.');
}

/** Decrypt key material previously encrypted with encryptKeyMaterial. */
export function decryptKeyMaterial(payload: string, key: Buffer = MASTER_KEY): string {
  const [ivB64, tagB64, dataB64] = payload.split('.');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
  decipher.setAuthTag(Buffer.from(tagB64, 'base64'));
  return Buffer.concat([
    decipher.update(Buffer.from(dataB64, 'base64')),
    decipher.final(),
  ]).toString('utf8');
}
