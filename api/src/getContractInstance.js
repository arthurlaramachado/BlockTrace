import * as grpc from '@grpc/grpc-js';
import { connect, hash, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set paths
const channelName = process.env.CHANNEL_NAME
const chaincodeName = process.env.CHAINCODE_NAME
const mspId = process.env.MSP_ID
const keyDirectoryPath = path.resolve(__dirname, process.env.KEY_DIRECTORY_PATH || '');
const certDirectoryPath = path.resolve(__dirname, process.env.CERT_DIRECTORY_PATH || '');
const tlsCertPath = path.resolve(__dirname, process.env.TLS_CERT_PATH || '');
const peerEndpoint = process.env.PEER_ENDPOINT
const peerHostAlias = process.env.PEER_HOST_ALIAS

async function getContractInstance() {
    const client = await newGrpcConnection();

    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        hash: hash.sha256,
        evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
        endorseOptions: () => ({ deadline: Date.now() + 15000 }),
        submitOptions: () => ({ deadline: Date.now() + 5000 }),
        commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
    });

    const network = gateway.getNetwork(channelName);
    return network.getContract(chaincodeName);
}


async function newGrpcConnection() {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity() {
    const certPath = await getFirstDirFileName(certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function getFirstDirFileName(dirPath) {
    const files = await fs.readdir(dirPath);
    const file = files[0];
    if (!file) {
        throw new Error(`No files in directory: ${dirPath}`);
    }
    return path.join(dirPath, file);
}

async function newSigner() {
    const keyPath = await getFirstDirFileName(keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

export { getContractInstance };