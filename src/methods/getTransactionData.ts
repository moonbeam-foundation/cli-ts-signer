import { createAndSendTx } from "./createAndSendTx";
import { NetworkArgs, TxArgs } from "./types";

export async function getTransactionData(txArgs: TxArgs, networkArgs: NetworkArgs):Promise<{payload:`0x${string}`, filePath:string}> {
  return new Promise((res)=>{
    createAndSendTx(
      txArgs,
      networkArgs,
      // Here we don't want to send the signature,
      // just see the payload so we return empty signature
      async (payload: `0x${string}`, filePath:string) => {
        res({payload, filePath})
        return "0x";
      }
    );
  }) 
}
