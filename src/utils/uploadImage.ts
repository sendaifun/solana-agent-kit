import fs from "fs/promises";
import path from "path";
import { createGenericFile, Umi } from "@metaplex-foundation/umi";

export async function uploadImage(umi: Umi, filePath: string): Promise<string> {
  // Resolve the absolute path to the file relative to the current working directory
  const absoluteFilePath = path.resolve(process.cwd(), filePath);
  // Read the file asynchronously
  const buffer = await fs.readFile(absoluteFilePath);

  const file = createGenericFile(buffer, path.basename(absoluteFilePath), {
    contentType: "image/jpeg",
  });
  const [imageUri] = await umi.uploader.upload([file]);

  return imageUri;
}
