import fs from 'node:fs';
import path from 'node:path';
import * as crypto from 'node:crypto';
import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Gateway, Identity, Network, Signer, signers } from '@hyperledger/fabric-gateway';
import { config } from '../../config.js';

/**
 * FabricService is the ONLY place the backend talks to Hyperledger Fabric.
 *
 * It wraps the Fabric Gateway SDK to submit (write) and evaluate (read)
   * transactions against the 'honeychain' contract on 'honeychannel'.
 *
 * The backend signs custodially: it holds enrolled identities (from
 * chain/network/enrollIdentities.sh) on disk and signs on behalf of the app
 * user. For v1 a single configured identity is used; per-role/per-user signing
 * can delegate via the identity directory passed at construction time.
 */
export class FabricService {
  private readonly connections = new Map<string, {
    gateway: Gateway;
    client: grpc.Client;
    contract: Contract;
    network: Network;
  }>();
  private readonly channel: string;
  private readonly contractName: string;
  private readonly defaultIdentityDir: string;

  constructor(identityDir = config.FABRIC_IDENTITY_DIR) {
    this.channel = config.FABRIC_CHANNEL;
    this.contractName = config.FABRIC_CONTRACT;
    this.defaultIdentityDir = identityDir;
  }

  /** Establish the gateway connection from the connection profile + identity. */
  private async connection(identityDir = this.defaultIdentityDir, mspId = config.FABRIC_MSP_ID) {
    if (!config.FABRIC_ENABLED) {
      throw new Error('Fabric is disabled (FABRIC_ENABLED=false). Check chain/network setup.');
    }
    const resolvedIdentityDir = path.resolve(identityDir);
    const existing = this.connections.get(resolvedIdentityDir);
    if (existing) return existing;

    const rawCcp = this.readConnectionProfile();
    const ccp = this.normalizeProfile(rawCcp);

    const mspPath = path.join(resolvedIdentityDir, 'msp');
    const certPath = path.join(mspPath, 'signcerts');
    if (!fs.existsSync(certPath)) {
      throw new Error(`No signcerts at ${certPath}. Run chain/network/enrollIdentities.sh first.`);
    }
    const certFile = fs.readdirSync(certPath).find((f) => f.endsWith('.pem'));
    if (!certFile) throw new Error(`No .pem signcert found in ${certPath}`);
    const certPem = fs.readFileSync(path.join(certPath, certFile), 'utf8');

    const keyPath = path.join(mspPath, 'keystore');
    if (!fs.existsSync(keyPath)) throw new Error(`No keystore at ${keyPath}. Enroll an identity first.`);
    const keyFiles = fs.readdirSync(keyPath).filter((f) => f.endsWith('_sk') || f.endsWith('.pem'));
    if (keyFiles.length === 0) throw new Error(`No private key found in ${keyPath}`);
    const keyFile = this.pickMatchingKey(keyFiles, keyPath, certPem);
    const keyPem = fs.readFileSync(path.join(keyPath, keyFile), 'utf8');

    // Peer target + TLS.
    const peerName = Object.keys(ccp.peers)[0];
    const peer = ccp.peers[peerName];
    const tlsRootCert = Buffer.from(peer.tlsCACerts.pem);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    // Dial the URL host (e.g. localhost:7051) but present the peer's
    // hostname as the TLS server name so the peer's cert verifies.
    const peerEndpoint = endpointFromUrl(peer.url);
    const channelOptions: grpc.ChannelOptions = config.FABRIC_PEER_HOST_ALIAS
      ? {
          'grpc.ssl_target_name_override': config.FABRIC_PEER_HOST_ALIAS,
          'grpc.default_authority': config.FABRIC_PEER_HOST_ALIAS,
        }
      : {};
    const client = new grpc.Client(peerEndpoint, tlsCredentials, channelOptions);

    const identity: Identity = {
      mspId,
      credentials: new TextEncoder().encode(certPem),
    };
    const privateKey = crypto.createPrivateKey(keyPem);
    const signer: Signer = signers.newPrivateKeySigner(privateKey);

    const gateway = connect({
      client,
      identity,
      signer,
      evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
      endorseOptions: () => ({ deadline: Date.now() + 15000 }),
      submitOptions: () => ({ deadline: Date.now() + 5000 }),
      commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
    });

    const network = gateway.getNetwork(this.channel);
    const connection = {
      client,
      gateway,
      network,
      contract: network.getContract(this.contractName),
    };
    this.connections.set(resolvedIdentityDir, connection);
    return connection;
  }

  /**
   * Pick the private key file whose public key matches the enrollment cert.
   * Re-enrolling an identity leaves multiple _sk files in the keystore; using
   * an outdated one produces an invalid signature that the peer rejects
   * ("signature is invalid", "access denied: channel creator org [...]").
   * Fall back to the most recently modified key if no key matches the cert.
   */
  private pickMatchingKey(keyFiles: string[], keyPath: string, certPem: string): string {
    const certPublicKey = this.exportPublicKey(certPem);
    for (const file of keyFiles) {
      const keyPem = fs.readFileSync(path.join(keyPath, file), 'utf8');
      if (this.exportPublicKey(keyPem) === certPublicKey) {
        return file;
      }
    }
    return keyFiles
      .slice()
      .sort(
        (a, b) =>
          fs.statSync(path.join(keyPath, b)).mtimeMs - fs.statSync(path.join(keyPath, a)).mtimeMs,
      )[0];
  }

  private exportPublicKey(pem: string): string {
    const key = crypto.createPublicKey(pem);
    return key.export({ type: 'spki', format: 'der' }).toString('hex');
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
    for (const { gateway, client } of this.connections.values()) {
      gateway.close();
      client.close();
    }
    this.connections.clear();
  }

  /** Submit with the enrolled role identity and return the real commit metadata. */
  async submitAs(role: string, fn: string, ...args: string[]): Promise<FabricSubmitResult> {
    const identity = this.identityForRole(role);
    const { contract } = await this.connection(identity.directory, identity.mspId);
    const proposal = contract.newProposal(fn, { arguments: args });
    const transactionId = proposal.getTransactionId();
    const endorsed = await proposal.endorse();
    const result = Buffer.from(endorsed.getResult()).toString('utf8');
    const submitted = await endorsed.submit();
    const status = await submitted.getStatus();
    if (!status.successful) {
      throw new Error(`Fabric transaction ${transactionId} failed validation with code ${status.code}`);
    }
    return { transactionId, validationCode: Number(status.code), successful: true, result };
  }

  /** Evaluate a read-only query against the chaincode. */
  async evaluate(fn: string, ...args: string[]): Promise<string> {
    const { contract } = await this.connection();
    const result = await contract.evaluateTransaction(fn, ...args);
    return Buffer.from(result).toString('utf8');
  }

  async chaincodeEvents(startBlock?: bigint) {
    const { network } = await this.connection();
    return network.getChaincodeEvents(this.contractName, startBlock == null ? undefined : { startBlock });
  }

  /** The MSP the given application role signs as. */
  mspForRole(role: string): string {
    return this.identityForRole(role).mspId;
  }

  private identityForRole(role: string): { directory: string; mspId: string } {
    const identity = ROLE_IDENTITIES[role];
    if (!identity) throw new Error(`No Fabric identity configured for application role ${role}`);
    return {
      directory: path.join(path.dirname(path.resolve(this.defaultIdentityDir)), identity.directory),
      mspId: identity.mspId,
    };
  }
}

export interface FabricSubmitResult {
  transactionId: string;
  validationCode: number;
  successful: boolean;
  result: string;
}

const ROLE_IDENTITIES: Record<string, { directory: string; mspId: string }> = {
  BEEKEEPER: { directory: 'Beekeeper', mspId: 'Org1MSP' },
  TRANSPORTER: { directory: 'Transporter', mspId: 'Org2MSP' },
  LABTECH: { directory: 'LabTech', mspId: 'Org3MSP' },
  FACTORYWORKER: { directory: 'FactoryWorker', mspId: 'Org2MSP' },
  QCMANAGER: { directory: 'QCManager', mspId: 'Org1MSP' },
  DISTRIBUTOR: { directory: 'Distributor', mspId: 'Org2MSP' },
  ADMIN: { directory: 'Admin', mspId: 'Org1MSP' },
};

function endpointFromUrl(url: string): string {
  const clean = url.replace(/^grpcs?:\/\//, '');
  const [host, port] = clean.split(':');
  return `${host}:${port ?? '7051'}`;
}

export const fabricService = new FabricService();
