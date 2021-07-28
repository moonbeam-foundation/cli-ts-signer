"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitPreSignedTx = void 0;
const api_1 = require("@polkadot/api");
const moonbeam_types_bundle_1 = require("moonbeam-types-bundle");
async function submitPreSignedTx(ws, tx) {
    const api = await api_1.ApiPromise.create({
        provider: new api_1.WsProvider(ws),
        typesBundle: moonbeam_types_bundle_1.typesBundle,
    });
    const extrinsic = api.createType("Extrinsic", tx);
    // //  eslint-disable-next-line @typescript-eslint/no-floating-promises
    api.rpc.author.submitAndWatchExtrinsic(extrinsic, (result) => {
        console.log("ok result", JSON.stringify(result.toHuman(), null, 2));
        if (result.isInBlock || result.isFinalized) {
            process.exit(0);
        }
    });
}
exports.submitPreSignedTx = submitPreSignedTx;
