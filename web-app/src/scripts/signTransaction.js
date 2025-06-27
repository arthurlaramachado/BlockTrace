import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';

export function getPublicKeyFromPrivateKey(privateKeyBase64) {
  const secretKey = decodeBase64(privateKeyBase64);
  const keypair = nacl.sign.keyPair.fromSecretKey(secretKey);
  return encodeBase64(keypair.publicKey);
}

export async function signTransaction(message, ownerKeyBase64) {
  const secretKey = decodeBase64(ownerKeyBase64);
  const keypair = nacl.sign.keyPair.fromSecretKey(secretKey);

  const msgBytes = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBytes);
  const hashBytes = new Uint8Array(hashBuffer);

  const signature = nacl.sign.detached(hashBytes, keypair.secretKey);

  return {
    original_message: message,
    signed_base64: encodeBase64(signature),
    public_key_base64: encodeBase64(keypair.publicKey),
  };
}

export async function signedFetch({ url, method = 'POST', body, message, secretKey }) {
  const { original_message, signed_base64, public_key_base64 } = await signTransaction(message, secretKey)

  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...body,
      original_message,
      signed_base64,
      public_key_base64,
    }),
  });
}