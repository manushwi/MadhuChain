import fs from 'node:fs';
import path from 'node:path';
import * as crypto from 'node:crypto';
import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Gateway, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import { config } from '../../config.js';

/**
 * FabricService is the ONLY place the backend talks to Hyperledger Fabric.
 *
 * It wraps the Fabric Gateway SDK to submit (write) and evaluate (read)
 * transactions against the 'honeychain-cc' contract on 'honeychain-channel'.
 *
 * The backend signs custodially: it holds enrolled identities (from
 * chain/network/enrollIdentities.sh) on disk and signs on behalf of the app
 * user. For v1 a single configured identity is used; per-role/per-user signing
 * can delegate via the identity directory passed at construction time.
 */
export class FabricService {
  private gateway: Gateway | null = null;
  private client: grpc.Client | null = null;
  private contract: Contract | null = null;
  private readonly channel: string;
  private readonly contractName: string;

  constructor(identityDir = config.FABRIC_IDENTITY_DIR) {
    this.channel = config.FABRIC_CHANNEL;
    this.contractName = config.FABRIC_CONTRACT;
  }

  /** Establish the gateway connection from the connection profile + identity. */
  async connect(): Promise<void> {
    if (!config.FABRIC_ENABLED) {
      throw new Error('Fabric is disabled (FABRIC_ENABLED=false). Check chain/network setup.');
    }
    if (this.gateway) return;

    const rawCcp = this.readConnectionProfile();
    const ccp = this.normalizeProfile(rawCcp);

    const identityDir = path.resolve(config.FABRIC_IDENTITY_DIR);
    const mspPath = path.join(identityDir, 'msp');
    const certPath = path.join(mspPath, 'signcerts');
    if (!fs.existsSync(certPath)) {
      throw new Error(`No signcerts at ${certPath}. Run chain/network/enrollIdentities.sh first.`);
    }
    const certFile = fs.readdirSync(certPath).find((f) => f.endsWith('.pem'));
    if (!certFile) throw new Error(`No .pem signcert found in ${certPath}`);
    const certPem = fs.readFileSync(path.join(certPath, certFile), 'utf8');

    const keyPath = path.join(mspPath, 'keystore');
    if (!fs.existsSync(keyPath)) throw new Error(`No keystore at ${keyPath}. Enroll an identity first.`);
    const keyFile = fs.readdirSync(keyPath).find((f) => f.endsWith('_sk') || f.endsWith('.pem'));
    if (!keyFile) throw new Error(`No private key found in ${keyPath}`);
    const keyPem = fs.readFileSync(path.join(keyPath, keyFile), 'utf8');

    // Peer target + TLS.
    const peerName = Object.keys(ccp.peers)[0];
    const peer = ccp.peers[peerName];
    const tlsRootCert = Buffer.from(peer.tlsCACerts.pem);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    const peerEndpoint = endpointFromUrl(peer.url, config.FABRIC_PEER_HOST_ALIAS);
    const client = new grpc.Client(peerEndpoint, tlsCredentials);

    const identity: Identity = {
      mspId: config.FABRIC_MSP_ID,
      credentials: new TextEncoder().encode(certPem),
    };
    const privateKey = crypto.createPrivateKey(keyPem);
    const signer: Signer = signers.newPrivateKeySigner(privateKey);

    this.client = client;
    this.gateway = connect({
      client,
      identity,
      signer,
      evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
      endorseOptions: () => ({ deadline: Date.now() + 15000 }),
      submitOptions: () => ({ deadline: Date.now() + 5000 }),
      commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
    });

    this.contract = this.gateway.getNetwork(this.channel).getContract(this.contractName);
  }

  private readConnectionProfile(): any {
    const profilePath = path.resolve(config.FABRIC_CONNECTION_PROFILE);
    if (!fs.existsSync(profilePath)) {
      throw new Error(`Connection profile not found: ${profilePath}. Run chain/network scripts first.`);
    }
    return JSON.parse(fs.readFileSync(profilePath, 'utf8'));
  }

  /** Resolve the default peer/orderer whether or not the profile has them. */
  private normalizeProfile(ccp: any): any {
    const msp = config.FABRIC_MSP_ID;

    const peers = ccp.peers ?? {};
    const peerName =
      (ccp.peers != null && Object.keys(peers).length)
        ? Object.keys(peers)[0]
        : 'peer0.org1.example.com';
    const peer = peers[peerName] ?? {
      url: `grpcs://${config.FABRIC_PEER_ENDPOINT}`,
      tlsCACerts: { pem: '' },
    };

    return { peers: { [peerName]: peer } };
  }

  async close(): Promise<void> {
    if (this.gateway) {
      this.gateway.close();
      this.gateway = null;
    }
    if (this.client) {
      this.client.close();
      this.client = null;
    }
    this.contract = null;
  }

  /** Submit a write transaction to the chaincode. */
  async submit(fn: string, ...args: string[]): Promise<string> {
    await this.connect();
    const result = await this.contract!.submitTransaction(fn, ...args);
    return Buffer.from(result).toString('utf8');
  }

  /** Evaluate a read-only query against the chaincode. */
  async evaluate(fn: string, ...args: string[]): Promise<string> {
    await this.connect();
    const result = await this.contract!.evaluateTransaction(fn, ...args);
    return Buffer.from(result).toString('utf8');
  }
}

function endpointFromUrl(url: string, hostAlias?: string): string {
  const clean = url.replace(/^grpcs?:\/\//, '');
  const [host, port] = clean.split(':');
  const endpointHost = hostAlias ?? host;
  return `${endpointHost}:${port ?? '7051'}`;
}

export const fabricService = new FabricService();
