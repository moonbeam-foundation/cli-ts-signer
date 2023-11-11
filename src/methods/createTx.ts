import { u8aToHex } from "@polkadot/util";
import { SignerPayloadJSON } from "@polkadot/types/types";
import fs from "fs";
import { ExtrinsicEra } from "@polkadot/types/interfaces";
import { blake2AsHex } from "@polkadot/util-crypto";
import chalk from "chalk";

import { Argv as NetworkOpt, getApiFor } from "moonbeam-tools";
import { CreateOpt, TxOpt, TxWrapperOpt } from "./types";

export async function createTx(
  txOpt: TxOpt,
  txWrapperOpt: TxWrapperOpt,
  networkOpt: NetworkOpt,
  createOpt: CreateOpt
) {
  const { tx, params, address, nonce } = txOpt;
  const { sudo, proxyChain } = txWrapperOpt;
  const { file } = createOpt;
  const [sectionName, methodName] = tx.split(".");

  const api = await getApiFor(networkOpt);
  let txExtrinsic = api.tx[sectionName][methodName](...params);

  if (sudo) {
    const {
      method: { args, method, section },
    } = txExtrinsic;
    console.log(
      `Sudo transaction:\n${chalk.red(`${section}.${method}`)}(${chalk.green(
        `${args.map((a) => a.toString().slice(0, 10000)).join(chalk.white(", "))}`
      )})\n`
    );
    txExtrinsic = api.tx.sudo.sudo(txExtrinsic);
  }
  if (proxyChain && proxyChain.proxies.length > 0) {
    const {
      method: { args, method, section },
    } = txExtrinsic;
    console.log(
      `Proxied transaction:\n${chalk.red(`${section}.${method}`)}(${chalk.green(
        `${args.map((a) => a.toString().slice(0, 10000)).join(chalk.white(", "))}`
      )})\n`
    );
    txExtrinsic = proxyChain.applyChain(api, txExtrinsic);
  }
  txExtrinsic = await txExtrinsic;

  // explicit display of name, args
  const {
    method: { args, method, section },
  } = txExtrinsic;
  console.log(
    `Transaction created:\n${chalk.red(`${section}.${method}`)}(${chalk.green(
      `${args.map((a) => a.toString().slice(0, 10000)).join(chalk.white(", "))}`
    )})\n`
  );

  // Capture the full payload into a file
  let result: {
    message?: string;
    payload?: any;
  } = {};
  const signer = {
    signPayload: async (payload: SignerPayloadJSON) => {
      // Forces the address to be the same as the one provided.
      // Otherwise it would be using SS58Prefix 0
      payload.address = address;

      // create the actual payload we will be using
      const xp = txExtrinsic.registry.createType("ExtrinsicPayload", payload);
      const payloadHex = u8aToHex(xp.toU8a(true));

      const message = payloadHex.length > (256 + 1) * 2 ? blake2AsHex(payloadHex) : payloadHex;
      console.log("Transaction data to be signed: ", payload);
      console.log("Message: ", message);

      result = {
        message,
        payload,
      };

      if (file) {
        fs.writeFileSync(file, JSON.stringify(result, null, 2));
      }
      console.log(`Transaction data written into: ${file}`);
      return { id: 1, signature: "0x00" as `0x${string}` };
    },
  };
  const currentHead = await api.rpc.chain.getHeader();
  let options = txOpt.immortality
    ? { signer, era: 0, nonce }
    : {
        signer,
        blockHash: currentHead.hash.toString(),
        era: api.registry.createTypeUnsafe<ExtrinsicEra>("ExtrinsicEra", [
          {
            current: currentHead.number,
            period: 2 ** 10, // Set 1024 blocks of delay
          },
        ]),
        nonce,
      };

  await txExtrinsic.signAsync(address, options).catch((err) => {
    // expected to fail as we are not signing it but simply storing the data
  });
  return result;
}
