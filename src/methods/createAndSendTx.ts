import { u8aToHex } from "@polkadot/util";
import { SignerPayloadJSON } from "@polkadot/types/types";
import prompts from "prompts";
import { blake2AsHex } from "@polkadot/util-crypto";
import chalk from "chalk";

import { SignerResult, SubmittableExtrinsic } from "@polkadot/api/types";
import { Argv as NetworkOpt, getApiFor } from "moonbeam-tools";
import { TxOpt, TxWrapperOpt } from "./types";

export async function createAndSendTx(
  txOpt: TxOpt,
  txWrapperOpt: TxWrapperOpt,
  networkOpt: NetworkOpt,
  signatureFunction: (payload: string) => Promise<`0x${string}`>
) {
  const { tx, params, address, nonce } = txOpt;
  const { sudo, proxyChain } = txWrapperOpt;
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

  const signer = {
    signPayload: (payload: SignerPayloadJSON) => {
      console.log("(sign)", payload);

      // create the actual payload we will be using
      const xp = txExtrinsic.registry.createType("ExtrinsicPayload", payload);
      const payloadHex = u8aToHex(xp.toU8a(true));
      console.log("Transaction data to be signed : ", payloadHex);

      const hashed = payloadHex.length > (256 + 1) * 2 ? blake2AsHex(payloadHex) : payloadHex;
      return new Promise<SignerResult>(async (resolve) => {
        const signature = await signatureFunction(hashed);
        resolve({ id: 1, signature });
      });
    },
  };
  let options = txOpt.immortality ? { signer, era: 0, nonce } : { signer, nonce };

  await new Promise<void>(async (resolve, reject) => {
    try {
      await txExtrinsic.signAndSend(address, options, ({ events = [], status }) => {
        console.log("Transaction status:", status.type);

        if (status.isInBlock || status.isFinalized) {
          console.log("Included at block hash", status.toHex());
          console.log("Events: ");
          events.forEach(({ event: { data, method, section } }) => {
            const [error] = data as any[];
            if (error?.isModule) {
              const { docs, name, section } = api.registry.findMetaError(error.asModule);
              console.log("\t", `${chalk.red(`${section}.${name}`)}`, `${docs}`);
            } else if (section == "system" && method == "ExtrinsicSuccess") {
              console.log("\t", chalk.green(`${section}.${method}`), data.toString());
            } else {
              console.log("\t", `${section}.${method}`, data.toString());
            }
          });
          resolve();
        } else if (status.isDropped || status.isInvalid || status.isRetracted) {
          console.log(
            "There was a problem with the extrinsic, status : ",
            status.isDropped ? "Dropped" : status.isInvalid ? "isInvalid" : "isRetracted"
          );
          resolve();
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function createAndSendTxPrompt(
  txOpt: TxOpt,
  txWrapperOpt: TxWrapperOpt,
  networkOpt: NetworkOpt
) {
  return createAndSendTx(txOpt, txWrapperOpt, networkOpt, async (payload: string) => {
    const response = await prompts({
      type: "text",
      name: "signature",
      message: "Please enter signature for + " + payload + " +",
      validate: (value) => true, // TODO: add validation
    });
    return response["signature"].trim();
  });
}
