import nacl from 'tweetnacl';
import naclUtil from 'tweetnacl-util';
const { encodeBase64 } = naclUtil;

const keypair = nacl.sign.keyPair();

console.log("✅ Public Key (base64):", encodeBase64(keypair.publicKey));
console.log("🔐 Private Key (base64):", encodeBase64(keypair.secretKey));
