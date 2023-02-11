import { SignerPayloadJSON } from "@polkadot/types/types";
import prompts from "prompts";
import fs from "fs";
import chalk from "chalk";

import { Argv as NetworkOpt, getApiFor } from "moonbeam-tools";
import { SendOpt } from "./types";
import { u8aToHex } from "@polkadot/util";
import { blake2AsHex } from "@polkadot/util-crypto";

export async function sendTx(
  networkOpt: NetworkOpt,
  sendOpt: SendOpt,
  prompter: () => Promise<boolean>
) {
  const { file } = sendOpt;

  const api = await getApiFor(networkOpt);
  const { payload, message, signature } = JSON.parse(fs.readFileSync(file).toString());
  const txExtrinsic = api.tx(payload);

  if (!signature) {
    throw "Missing signature from the file";
  }

  // explicit display of name, args
  const {
    method: { args, method, section },
  } = txExtrinsic;
  console.log(
    `Transaction being sent from ${chalk.yellow(payload.address)}:\n${chalk.red(
      `${section}.${method}`
    )}(${chalk.green(
      `${args.map((a) => a.toString().slice(0, 10000)).join(chalk.white(", "))}`
    )})\n`
  );

  const signer = {
    signPayload: async (_: SignerPayloadJSON) => {
      const xp = txExtrinsic.registry.createType("ExtrinsicPayload", payload);
      const payloadHex = u8aToHex(xp.toU8a(true));

      const generatedMessage =
        payloadHex.length > (256 + 1) * 2 ? blake2AsHex(payloadHex) : payloadHex;
      if (message != generatedMessage) {
        console.log("     file message: ", message);
        console.log("generated message: ", generatedMessage);
        throw "Generated message not matching file message";
      }

      if (!(await prompter())) {
        throw "Cancelled by user";
      }

      return { id: 1, signature };
    },
  };

  await new Promise<void>((resolve, reject) => {
    txExtrinsic.signAndSend(
      payload.address,
      { signer, nonce: payload.nonce, era: payload.era, blockHash: payload.blockHash },
      ({ events = [], status }) => {
        console.log("Transaction status:", status.type);

        if (status.isInBlock) {
          console.log("Included at block hash", status.asInBlock.toHex());
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
      }
    );
  });
}

export async function sendTxPrompt(networkOpt: NetworkOpt, sendOpt: SendOpt) {
  return sendTx(networkOpt, sendOpt, async () => {
    if (sendOpt.yes) {
      return true;
    }
    const response = await prompts({
      type: "text",
      name: "confirmation",
      message: "Please type yes to send",
      validate: (_) => true,
    });
    return response["confirmation"].trim().toLowerCase() == "yes";
  });
}
