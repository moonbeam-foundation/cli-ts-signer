import { ApiPromise, WsProvider } from "@polkadot/api";
import { typesBundle } from "moonbeam-types-bundle";

export async function submitPreSignedTx(ws: string, tx: string): Promise<void> {
  const api = await ApiPromise.create({
    provider: new WsProvider(ws),
    typesBundle: typesBundle as any,
  });
  const extrinsic = api.createType("Extrinsic", tx);

  // //  eslint-disable-next-line @typescript-eslint/no-floating-promises
  api.rpc.author.submitAndWatchExtrinsic(extrinsic, (result) => {
    console.log("ok result",JSON.stringify(result.toHuman(), null, 2));

    if (result.isInBlock || result.isFinalized) {
      process.exit(0);
    }
  });
}
