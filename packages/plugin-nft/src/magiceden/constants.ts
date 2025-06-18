import redaxios from "redaxios";

export const MAGIC_EDEN_API_URL = "https://api-mainnet.magiceden.dev/v2";
export const magicedenClient = redaxios.create({
  baseURL: MAGIC_EDEN_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
