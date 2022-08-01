import { createAndSendTx } from "./createAndSendTx";
import { NetworkOpt, TxOpt, TxWrapperOpt } from "./types";

export async function getTransactionData(
  txOpt: TxOpt,
  txWrapperOpt: TxWrapperOpt,
  networkOpt: NetworkOpt
) {
  return createAndSendTx(
    txOpt,
    txWrapperOpt,
    networkOpt,
    // Here we don't want to send the signature,
    // just see the payload so we return empty signature
    async (_: string) => {
      return "0x";
    }
  );
}
