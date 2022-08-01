// Command Args
export interface SignArgs extends SignPromptArgs {
  message?: string;
}
export interface SignPromptArgs {
  type?: string;
  "private-key"?: string;
  derivePath: string;
}
export interface VerifyArgs {
  message?: string;
  signature?: string;
  "public-key"?: string;
  type?: string;
}
export interface SendTxArgs {
  ws?: string;
  "tx-data"?: string;
}

export interface CreateAndSendArgs {
  address?: string;
  tx?: string;
  params?: string;
  nonce?: number;
  immortality: boolean;
}
export interface VoteCouncilArgs {
  address?: string;
}

export type TxParam = boolean | string | number | { [key: string]: any };


// Methods args
export interface TxArgs {
  nonce?: number;
  tx: string;
  params: TxParam[];
  address: string;
  immortality?: boolean;
}

export interface TxWrapperArgs {
  sudo?: boolean;
  "proxied-account"?: string;
  "proxy-type"?: "Any" | string;
}

export interface NetworkArgs {
  ws?: string;
  network?: string;
}

export type NetworkType = "ethereum" | "sr25519";

export interface Vote {
  yes: boolean;
}
