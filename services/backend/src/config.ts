import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default('0.0.0.0'),
  ALLOWED_ORIGIN: z.string().default('http://localhost:3000'),
  JWT_SECRET: z.string().min(1),
  JWT_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_ROUNDS: z.coerce.number().default(10),
  DATABASE_URL: z.string().min(1),
  DEVICE_API_KEY: z.string().min(1),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_ENABLED: z.coerce.boolean().default(true),
  VERIFY_CACHE_TTL_SECONDS: z.coerce.number().default(300),
  FABRIC_ENABLED: z.coerce.boolean().default(true),
  FABRIC_CHANNEL: z.string().default('honeychain-channel'),
  FABRIC_CONTRACT: z.string().default('honeychain-cc'),
  FABRIC_CONNECTION_PROFILE: z.string().default(''),
  FABRIC_MSP_ID: z.string().default('Org1MSP'),
  FABRIC_IDENTITY_DIR: z.string().default(''),
  FABRIC_IDENTITY_LABEL: z.string().default('admin'),
  FABRIC_DISCOVERY_ENABLED: z.coerce.boolean().default(true),
  FABRIC_PEER_ENDPOINT: z.string().default('localhost:7051'),
  FABRIC_PEER_HOST_ALIAS: z.string().default('peer0.org1.example.com'),
  FABRIC_ORDERER_ENDPOINT: z.string().default('localhost:7050'),
  BARCODE_PUBLIC_BASE_URL: z.string().default('http://localhost:4000/barcodes'),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment configuration:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = parsed.data;
export type Config = typeof config;
