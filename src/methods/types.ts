import { SignerPayloadJSON } from "@polkadot/types/types";

// Command Args
export interface SignArgs extends SignPromptArgs {
  message: string;
}
export interface SignAndVerifyArgs extends SignArgs {
  filePath:string
  wsUrl:string
}
export interface SignPromptArgs {
  type: string;
  privateKey: string;
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
  tx: string;
  params: string | TxParam[];
  address: string;
  sudo?: boolean;
  immortality?: boolean;
}
export interface NetworkArgs {
  ws: string;
  network: string;
}

export type NetworkType = "ethereum" | "sr25519";

//Registry 

export interface RegistryPersistantInfo{
  runtimeVersion:{specName:string,specVersion:number},
  chainName:string,
  chainProps:{ss58Format:string,tokenSymbol:string,tokenDecimals:string},
  metadataHex:`0x${string}`
}

export interface PayloadVerificationInfo{
  payload:SignerPayloadJSON,
  registryInfo:RegistryPersistantInfo
}