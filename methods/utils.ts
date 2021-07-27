export const moonbeamChains = ["moonbase", "moonbeam", "moonriver", "moonshadow"];
export const relayChains = ["kusama", "polkadot", "westend", "rococo"];
export const authorizedChains = moonbeamChains.concat(relayChains);
export const ALITH = "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac";
export const BALTATHAR = "0x3Cd0A705a2DC65e5b1E1205896BaA2be8A07c6e0"

export const testnetWs="wss://wss.testnet.moonbeam.network"

export function exit() {
  process.exit();
}
