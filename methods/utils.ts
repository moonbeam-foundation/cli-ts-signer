export const moonbeamChains = ["moonbase", "moonbeam", "moonriver", "moonshadow"];
export const relayChains = ["kusama", "polkadot", "westend", "rococo"];
export const authorizedChains = moonbeamChains.concat(relayChains);

export function exit() {
  process.exit();
}
