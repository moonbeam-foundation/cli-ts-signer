import { hexToU8a, stringToU8a, u8aToHex } from "@polkadot/util";
import { Keyring } from "@polkadot/keyring";
import type { KeyringPair } from "@polkadot/keyring/types";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import fetch from "node-fetch";

import { createTypeUnsafe } from '@polkadot/types/create';
import { EXTRINSIC_VERSION } from '@polkadot/types/extrinsic/v4/Extrinsic';

import { Call, ExtrinsicPayload } from '@polkadot/types/interfaces';

import {
	construct,
	//decode,
	deriveAddress,
	// getRegistry,
	methods,
	PolkadotSS58Format,
} from '@substrate/txwrapper-polkadot';
import { getRegistry } from "@substrate/txwrapper-registry";

import {createMetadata, decode, toTxMethod} from '@substrate/txwrapper-core'
import prompts from "prompts";
import { NetworkType } from "./types";
import { moonbeamMetaDataRpc } from "./moonbeamMetadatRpc";

// TODO display payload content
export async function sign(
  type: NetworkType,
  privKey: string,
  prompt: boolean,
  message?: string
): Promise<string> {
  if (!["ethereum", "sr25519"].includes(type)) {
    throw new Error("Type is not supported");
  }
  await cryptoWaitReady();

  // Instantiate keyring
  let keyring: Keyring = new Keyring({ type: type === "ethereum" ? "ethereum" : "sr25519" });
  const signer: KeyringPair = keyring.addFromSeed(hexToU8a(privKey));

  if (!prompt && !message) {
    throw new Error("sign must either provide message or use prompt");
  }
  
  // Get message to be signed
  const msg = message ||
    (await prompts({
        type: "text",
        name: "message",
        message: "Please enter payload",
        validate: (value) => true, // TODO: add validation
      })).message;

      // Decode the information from a signing payload.
      // Create Polkadot's type registry.
      //const metadataRpc=moonbeamMetaDataRpc

  const metadataRpc = await rpcToLocalNode(9933, "state_getMetadata");
	// // const registry = getRegistry({
	// // 	chainName: 'Polkadot',
	// // 	specName,
	// // 	specVersion,
	// // 	metadataRpc,
	// // });
  const registry = getRegistry({
		chainName: 'Moonbase',
		specName:"moonbase",
		specVersion:600,
		metadataRpc,
	});
  console.log("msg",msg)
	const payloadInfo = decode(msg, {
		metadataRpc,
		registry,
	});
  console.log(payloadInfo)
	console.log(
		`\nDecoded Transaction\n  To: ${
			(payloadInfo.method.args.dest as { id: string })?.id
		}\n` + `  Amount: ${payloadInfo.method.args.value}`
	);

  // function parseCustomType() {
  //   try {
  //     let typesObject ={

  //     } //editor.get();
  
  //     let lastTypeKey;
  
  //     if (Array.isArray(typesObject)) {
  //       typesObject.map(type => {
  //         registry.register(type);
  //       });
  
  //       let lastTypeObject = typesObject[typesObject.length - 1];
  //       lastTypeKey = Object.keys(lastTypeObject)[0];
  //     } else {
  //       registry.register(typesObject);
  //       lastTypeKey = Object.keys(typesObject)[0];
  //     }
  
  //     return JSON.stringify(
  //       types.createType(registry, lastTypeKey, rawBytes.value.trim())
  //     );
  //   } catch (e) {
  //     return e;
  //   }
  // }
  
  // parseCustomType();

  registry.setMetadata(createMetadata(registry, metadataRpc));

	// We use `createTypeUnsafe` here because it allows us to specify `withoutLog: true`,
	// which silences an internal error message from polkadot-js. This is helpful in `decode`
	// which takes in just a string. We determine if the string is a signing payload or a
	// signed tx by first attempting to decode it as a signing payload with this function.
	// If that fails we catch, knowing through process of elimination it should be a
	// signed tx. `withoutLog: true` prevents an alarming error message from bubbling up
	// to the user when we catch.
	// const payload: ExtrinsicPayload = createTypeUnsafe(
	// 	registry,
	// 	'ExtrinsicPayload',
	// 	[
	// 		msg,
	// 		{
	// 			version: EXTRINSIC_VERSION,
	// 		},
	// 	]
	// );
	// const methodCall: Call = createTypeUnsafe(registry, 'Call', [payload.method]);
	// const method = toTxMethod(registry, methodCall);

	// console.log( {
	// 	blockHash: payload.blockHash.toHex(),
	// 	eraPeriod: payload.era.asMortalEra.period.toNumber(),
	// 	genesisHash: payload.genesisHash.toHex(),
	// 	metadataRpc,
	// 	method,
	// 	nonce: payload.nonce.toNumber(),
	// 	specVersion: payload.specVersion.toNumber(),
	// 	tip: payload.tip.toNumber(),
	// 	transactionVersion: payload.transactionVersion.toNumber(),
	// });
  // specVersion: '0x00000258',
  // transactionVersion: '0x00000002',
  // address: '0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac',
  // blockHash: '0x1e3b1cdd51f532d321cec0d15c30cfaf57d8c29d8ec93cc6f33444629e33e371',
  // blockNumber: '0x000bae98',
  // era: '0x8709',
  // genesisHash: '0x91bc6e169807aaa54802737e1c504b2577d4fafedd5a02c10293b1cd60e39527',
  // method: '0x03003cd0a705a2dc65e5b1e1205896baa2be8a07c6e01300008a5d78456301',
  // nonce: '0x00003918',
  // signedExtensions: [
  //   'CheckSpecVersion',
  //   'CheckTxVersion',
  //   'CheckGenesis',
  //   'CheckMortality',
  //   'CheckNonce',
  //   'CheckWeight',
  //   'ChargeTransactionPayment'
  // ],
  // tip: '0x00000000000000000000000000000000',
  // version: 4

  // Sign
  const signature: Uint8Array =
    type === "ethereum"
      ? signer.sign(hexToU8a(msg))
      : signer.sign(hexToU8a(msg), { withType: true });
  console.log("SIGNATURE : " + u8aToHex(signature));
  console.log("FOR PUBKEY : " + u8aToHex(signer.publicKey));
  return u8aToHex(signature);
}

/**
 * Send a JSONRPC request to the node at http://localhost:9933.
 *
 * @param method - The JSONRPC request method.
 * @param params - The JSONRPC request params.
 */
 export function rpcToLocalNode(rpcPort: number, method: string, params: any[] = []): Promise<any> {
  return fetch("http://localhost:" + rpcPort, {
    body: JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method,
      params,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })
    .then((response) => response.json())
    .then(({ error, result }) => {
      if (error) {
        throw new Error(`${error.code} ${error.message}: ${JSON.stringify(error.data)}`);
      }

      return result;
    });
}