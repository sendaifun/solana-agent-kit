// convert-key.js
const fs = require('fs');
const bs58 = require('bs58');

const keypairPath = './agent-keypair.json';
const keypairArray = JSON.parse(fs.readFileSync(keypairPath, 'utf8'));
const keypairBuffer = Buffer.from(keypairArray);
const base58Key = bs58.encode(keypairBuffer);

console.log('Base58 Encoded Private Key:');
console.log(base58Key);
