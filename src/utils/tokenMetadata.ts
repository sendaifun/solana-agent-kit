import { Connection, PublicKey } from "@solana/web3.js";

export async function getTokenMetadata(
  connection: Connection,
  tokenMint: string,
) {
  const METADATA_PROGRAM_ID = new PublicKey(
    "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  );

  const [metadataPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from("metadata"),
      METADATA_PROGRAM_ID.toBuffer(),
      new PublicKey(tokenMint).toBuffer(),
    ],
    METADATA_PROGRAM_ID,
  );

  const metadata = await connection.getAccountInfo(metadataPDA);
  if (!metadata?.data) {
    throw new Error("Metadata not found");
  }

  let offset = 1 + 32 + 32; // key + update auth + mint
  const data = metadata.data;
  const decoder = new TextDecoder();

  // Read variable length strings
  const readString = () => {
    let nameLength = data[offset];

    while (nameLength === 0) {
      offset++;
      nameLength = data[offset];
      if (offset >= data.length) {
        return null;
      }
    }

    offset++;
    const name = decoder
      .decode(data.slice(offset, offset + nameLength))
      // @eslint-disable-next-line no-control-regex
      .replace(new RegExp(String.fromCharCode(0), "g"), "");
    offset += nameLength;
    return name;
  };

  const name = readString();
  const symbol = readString();
  const uri = readString();

  // Read remaining data
  const sellerFeeBasisPoints = data.readUInt16LE(offset);
  offset += 2;

  let creators:
    | { address: PublicKey; verified: boolean; share: number }[]
    | null = null;
  if (data[offset] === 1) {
    offset++;
    const numCreators = data[offset];
    offset++;
    creators = [...Array(numCreators)].map(() => {
      const creator = {
        address: new PublicKey(data.slice(offset, offset + 32)),
        verified: data[offset + 32] === 1,
        share: data[offset + 33],
      };
      offset += 34;
      return creator;
    });
  }

  return {
    name,
    symbol,
    uri,
    sellerFeeBasisPoints,
    creators,
  };
}
