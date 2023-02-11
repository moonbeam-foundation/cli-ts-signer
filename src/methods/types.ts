// Command Args
import type { MoonbeamRuntimeProxyType } from "@polkadot/types/lookup";
import { ProxyChain } from "moonbeam-tools";

export interface SignOpt extends SignPromptOpt {
  message?: string;
}
export interface SignPromptOpt {
  type?: string;
  "private-key"?: string;
  derivePath: string;
}
export interface VerifyOpt {
  message?: string;
  signature?: string;
  "public-key"?: string;
  type?: string;
}

export interface CreateOpt {
  file?: string;
}

export interface SendOpt {
  file: string;
  yes: boolean;
}

export interface CreateAndSendOpt {
  address?: string;
  tx?: string;
  params?: string;
  nonce?: number;
  immortality: boolean;
}
export interface VoteCouncilOpt {
  address?: string;
}

export type TxParam = boolean | string | number | { [key: string]: any };

export interface ProxyOpt {
  account: string;
  type?: MoonbeamRuntimeProxyType["type"];
}
// Methods args
export interface TxOpt {
  nonce?: number;
  tx: string;
  params: TxParam[];
  address: string;
  immortality?: boolean;
}

export interface TxWrapperOpt {
  sudo?: boolean;
  proxyChain: ProxyChain;
}

export type NetworkType = "ethereum" | "sr25519";

export interface Vote {
  yes: boolean;
}
