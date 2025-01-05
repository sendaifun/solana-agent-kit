import nacl from "tweetnacl";

type VerifyWithNaclArgs = {
  appPublicKey: string;
  rawBody: string;
  signature: string;
  timestamp: string;
};

const verifyWithNacl = ({
  appPublicKey,
  signature,
  rawBody,
  timestamp,
}: VerifyWithNaclArgs) => {
  return nacl.sign.detached.verify(
    Buffer.from(timestamp + rawBody),
    Buffer.from(signature, "hex"),
    Buffer.from(appPublicKey, "hex")
  );
};

export async function verifyInteractionRequest(
  request: Request,
  appPublicKey: string
) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");

  if (typeof signature !== "string" || typeof timestamp !== "string") {
    console.log("Invalid signature or timestamp type");
    return { isValid: false };
  }

  const rawBody = await request.text();

  const isValidRequest =
    signature &&
    timestamp &&
    verifyWithNacl({ appPublicKey, rawBody, signature, timestamp });

  if (!isValidRequest) {
    console.log("Request validation failed");
    return { isValid: false };
  }

  const interaction = JSON.parse(rawBody);

  return {
    interaction,
    isValid: true,
  };
}
