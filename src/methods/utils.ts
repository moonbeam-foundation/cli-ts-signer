import fetch from 'node-fetch';
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

/**
 * Send a JSONRPC request to the node at http://localhost:9933.
 *
 * @param method - The JSONRPC request method.
 * @param params - The JSONRPC request params.
 */
 export function rpcToLocalNode(
  httpUrl:string,
	method: string,
	params: any[] = []
): Promise<any> {
	return fetch('http://localhost:9933', {
		body: JSON.stringify({
			id: 1,
			jsonrpc: '2.0',
			method,
			params,
		}),
		headers: {
			'Content-Type': 'application/json',
		},
		method: 'POST',
	})
		.then((response) => response.json())
		.then(({ error, result }) => {
			if (error) {
				throw new Error(
					`${error.code} ${error.message}: ${JSON.stringify(error.data)}`
				);
			}

			return result;
		});
}