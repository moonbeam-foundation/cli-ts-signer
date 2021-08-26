import { createAndSendTx } from "./createAndSendTx";
import { NetworkArgs, TxArgs } from "./types";

export async function getTransactionData(
  txArgs:TxArgs,
  networkArgs:NetworkArgs
) {
  return createAndSendTx(
    txArgs,
    networkArgs,
    // Here we don't want to send the signature, 
    // just see the payload so we return empty signature
    async (_: string) => {
      return "";
    }
  );
}
