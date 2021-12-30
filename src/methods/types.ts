// Command Args
export interface SignArgs extends SignPromptArgs {
  message?: string;
}
export interface SignPromptArgs {
  type: string;
  privateKey?: string;
  derivePath: string;
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
  nonce?: number;
  immortality?: boolean;
}
export interface VoteCouncilArgs {
  network: string;
  ws: string;
  address: string;
}

export type TxParam = boolean | string | number | { [key: string]: any };

// Methods args
export interface TxArgs {
  nonce?: number;
  tx: string;
  params: any[];
  address: string;
  sudo?: boolean;
  immortality?: boolean;
}
export interface NetworkArgs {
  ws: string;
  network: string;
}

export type NetworkType = "ethereum" | "sr25519";
