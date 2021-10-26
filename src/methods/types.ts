// Command Args
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
export interface SendTxArgs {
  ws: string;
  txData: string;
}
export interface CreateAndSendArgs {
  network: string;
  ws: string;
  address: string;
  tx: string;
  params: string;
  sudo?: boolean;
}
export interface VoteCouncilArgs {
  network: string;
  ws: string;
  address: string;
}

// Methods args
export interface TxArgs {
  tx: string,
  params: string,
  address: string,
  sudo?: boolean
}
export interface NetworkArgs {
  ws: string,
  network: string,
}

export type NetworkType = "ethereum" | "sr25519";

