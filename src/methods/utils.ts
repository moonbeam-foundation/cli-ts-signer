import "@moonbeam-network/api-augment";

import { NetworkType } from "./types";

export const moonbeamChains = ["moonbase", "moonbeam", "moonriver", "moonshadow"];
export const relayChains = ["kusama", "polkadot", "westend", "rococo"];
export const authorizedChains = moonbeamChains.concat(relayChains);
export const ALITH = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
export const BALTATHAR = "0x3Cd0A705a2DC65e5b1E1205896BaA2be8A07c6e0";

export const testnetWs = "wss://wss.testnet.moonbeam.network";

export function isNetworkType(type: string): NetworkType {
  if (["sr25519", "ethereum"].includes(type)) {
    return type as NetworkType;
  } else {
    return "ethereum";
  }
}

export function exit() {
  process.exit();
}

export function checkArgv(argv: { [key: string]: any }, fieldName: string) {
  if (!argv[fieldName]) {
    throw new Error(`Missing arg : ${fieldName}`);
    // return;
  }
}
export function checkArgvList<T>(argv: Partial<T>, fieldNameList: string[]): T {
  fieldNameList.forEach((name) => {
    checkArgv(argv, name);
  });
  return argv as T;
}
