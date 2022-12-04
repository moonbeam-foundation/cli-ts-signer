import { ApiPromise, WsProvider } from "@polkadot/api";
import { u8aToHex } from "@polkadot/util";
import { typesBundlePre900 } from "moonbeam-types-bundle";
import { ISubmittableResult, SignerPayloadJSON } from "@polkadot/types/types";
import fs from "fs";
import { blake2AsHex } from "@polkadot/util-crypto";
import chalk from "chalk";

import { moonbeamChains } from "./utils";
import { SubmittableExtrinsic } from "@polkadot/api/types";
import { CreateOpt, NetworkOpt, TxOpt, TxWrapperOpt } from "./types";

export async function createTx(
  txOpt: TxOpt,
  txWrapperOpt: TxWrapperOpt,
  networkOpt: NetworkOpt,
  createOpt: CreateOpt
) {
  const { tx, params, address, nonce } = txOpt;
  const { sudo, proxy } = txWrapperOpt;
  const { ws, network } = networkOpt;
  const { file } = createOpt;
  const [sectionName, methodName] = tx.split(".");

  let api: ApiPromise;
  if (network && moonbeamChains.includes(network)) {
    api = await ApiPromise.create({
      provider: new WsProvider(ws),
      typesBundle: typesBundlePre900 as any,
    });
  } else {
    api = await ApiPromise.create({
      provider: new WsProvider(ws),
    });
  }
  let txExtrinsic: SubmittableExtrinsic<"promise", ISubmittableResult> = api.tx[sectionName][
    methodName
  ](...params);
  if (sudo) {
    txExtrinsic = api.tx.sudo.sudo(txExtrinsic);
  }
  if (proxy && proxy.account) {
    txExtrinsic = api.tx.proxy.proxy(proxy.account, proxy.type || null, txExtrinsic);
  }
  txExtrinsic = await txExtrinsic;

  // explicit display of name, args
  const {
    method: { args, method, section },
  } = txExtrinsic;
  console.log(
    `Transaction created:\n${chalk.red(`${section}.${method}`)}(${chalk.green(
      `${args.map((a) => a.toString().slice(0, 200)).join(chalk.white(", "))}`
    )})\n`
  );

  // Capture the full payload into a file
  const signer = {
    signPayload: async (payload: SignerPayloadJSON) => {
      // create the actual payload we will be using
      const xp = txExtrinsic.registry.createType("ExtrinsicPayload", payload);
      const payloadHex = u8aToHex(xp.toU8a(true));

      const message = payloadHex.length > (256 + 1) * 2 ? blake2AsHex(payloadHex) : payloadHex;
      console.log("Transaction data to be signed: ", payload);
      console.log("Message: ", message);

      fs.writeFileSync(
        file,
        JSON.stringify(
          {
            message,
            payload,
          },
          null,
          2
        )
      );
      console.log(`Transaction data written into: ${file}`);
      return { id: 1, signature: "0x00" as `0x${string}` };
    },
  };
  let options = txOpt.immortality ? { signer, era: 0, nonce } : { signer, nonce };

  await txExtrinsic.signAsync(address, options).catch((err) => {
    // expected to fail as we are not signing it but simply storing the data
  });
}
