import { Keypair } from '@solana/web3.js';

const generateKey = async () => {
  const keyPair = Keypair.generate();

  console.log("Public Key:", keyPair.publicKey.toString());
  console.log("Secret Key:", keyPair.secretKey);
};

generateKey();
