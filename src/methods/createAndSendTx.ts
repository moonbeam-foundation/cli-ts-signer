import { u8aToHex } from "@polkadot/util";
import { SignerPayloadJSON } from "@polkadot/types/types";
import prompts from "prompts";
import { blake2AsHex } from "@polkadot/util-crypto";
import chalk from "chalk";
import { SignerResult } from "@polkadot/api/types";
import { ExtrinsicEra } from "@polkadot/types/interfaces";
import { Argv as NetworkOpt, getApiFor } from "moonbeam-tools";
import { TxOpt, TxWrapperOpt } from "./types";

function logEvents(api: any, events: any[]) {
  if (!events.length) {
    console.log("Events: (none)");
    return;
  }

  console.log("Events: ");
  events.forEach(({ event: { data, method, section } }) => {
    const [error] = data as any[];
    if (error?.isModule) {
      const { docs, name, section: errorSection } = api.registry.findMetaError(error.asModule);
      console.log("\t", `${chalk.red(`${errorSection}.${name}`)}`, `${docs}`);
    } else if (section == "system" && method == "ExtrinsicSuccess") {
      console.log("\t", chalk.green(`${section}.${method}`), data.toString());
    } else {
      console.log("\t", `${section}.${method}`, data.toString());
    }
  });
}

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
  const finalizedHash = await api.rpc.chain.getFinalizedHead();
  const finalizedHead = await api.rpc.chain.getHeader(finalizedHash);
  // Validate and determine era period
  let eraPeriod = 2 ** 11; // Default: 2048 blocks (safe for all chains)

  if (txOpt.eraPeriod !== undefined) {
    // Validate it's a safe integer >= 4
    if (!Number.isSafeInteger(txOpt.eraPeriod) || txOpt.eraPeriod < 4) {
      console.log(chalk.red(`❌ Era period must be an integer >= 4`));
      throw new Error("Invalid era period: must be an integer >= 4");
    }

    // Check if it's a power of 2 using logarithm
    if (!Number.isInteger(Math.log2(txOpt.eraPeriod))) {
      console.log(
        chalk.red(`❌ Era period must be a power of 2 (e.g., 512, 1024, 2048, 4096, 8192, 16384).`)
      );
      throw new Error("Invalid era period: must be a power of 2");
    }

    eraPeriod = txOpt.eraPeriod;

    // Warn about long periods
    if (eraPeriod > 4096) {
      console.log(
        chalk.yellow(
          `⚠️  Using era period of ${eraPeriod} blocks (${((eraPeriod * 12) / 3600).toFixed(
            1
          )} hours on Moonbeam).\n` +
            `   Long-lived transactions carry risks:\n` +
            `   - May exceed chain's BlockHashCount limit\n` +
            `   - Runtime upgrades can invalidate pre-signed txs\n` +
            `   - Nonce conflicts block subsequent transactions\n` +
            `   Consider using --immortality for offline batch signing instead.`
        )
      );
    }
  }

  let options = txOpt.immortality
    ? { signer, era: 0, nonce }
    : {
        signer,
        blockHash: finalizedHash.toString(),
        era: api.registry.createTypeUnsafe<ExtrinsicEra>("ExtrinsicEra", [
          {
            current: finalizedHead.number,
            period: eraPeriod,
          },
        ]),
        nonce,
      };

  await new Promise<void>((resolve, reject) => {
    let unsubscribe: (() => void) | undefined;
    let lastEvents: any[] = [];
    let eventsLogged = false;

    const cleanup = (cb: () => void) => {
      try {
        if (unsubscribe) {
          unsubscribe();
        }
      } catch {
        // swallow unsubscribe errors
      } finally {
        cb();
      }
    };

    txExtrinsic
      .signAndSend(address, options, ({ events = [], status }) => {
        lastEvents = events.length ? events : lastEvents;
        console.log("Transaction status:", status.type);

        if (status.isInBlock) {
          console.log("Included at block hash", status.asInBlock.toHex());
          if (events.length) {
            logEvents(api, events);
            eventsLogged = true;
          }
          console.log("Waiting for finalization...");
        } else if (status.isFinalized) {
          console.log("Finalized at block hash", status.asFinalized.toHex());
          if (!eventsLogged) {
            logEvents(api, events.length ? events : lastEvents);
          }
          cleanup(resolve);
        } else if (status.isDropped || status.isInvalid || status.isRetracted) {
          console.log(
            "There was a problem with the extrinsic, status : ",
            status.isDropped ? "Dropped" : status.isInvalid ? "isInvalid" : "isRetracted"
          );
          cleanup(resolve);
        }
      })
      .then((unsub) => {
        unsubscribe = unsub;
      })
      .catch((err) => {
        cleanup(() => reject(err));
      });
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
