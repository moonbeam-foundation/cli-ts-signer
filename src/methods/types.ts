export interface SignArgs extends SignPromptArgs {
  message: string;
}
export interface SignPromptArgs {
  type: string;
  privateKey: string;
}
export interface VerifyArgs {
  message: string;
  signature: string;
  pubKey: string;
  type: string;
}
export interface CreateAndSendArgs {
  network: string;
  ws: string;
  address: string;
  tx: string;
  params: string;
  sudo?: boolean;
}
export interface SendTxArgs {
  ws: string;
  txData: string;
}

export type NetworkType = "ethereum" | "sr25519";
