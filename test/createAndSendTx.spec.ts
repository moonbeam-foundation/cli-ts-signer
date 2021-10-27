import { ApiPromise, WsProvider } from "@polkadot/api";
import { typesBundle } from "moonbeam-types-bundle";
import { createAndSendTx } from "../src/methods/createAndSendTx";
import { ALITH, BALTATHAR, testnetWs } from "../src/methods/utils";
import { createAndFinalizeBlock, startMoonbeamDevNode } from "./dev-node";
import { testSignCLI } from "./sign.spec";
var assert = require("assert");

const testAmount = "1000000000000";

async function getBalance(address: string, api: ApiPromise) {
  const account = await api.query.system.account(address);
  return account.data.free.toString();
}

describe("Create and Send Tx Integration Test", function () {
  // before("Starting Moonbeam Test Node", async function () {
  //   const init = await startMoonbeamDevNode(false)
  // })
  it("should increment Baltathar's account balance", async function () {
    this.timeout(40000);

    // setup network
    const init = await startMoonbeamDevNode(false);
    const wsUrl = `ws://localhost:${init.wsPort}`;
    let api = await ApiPromise.create({
      provider: new WsProvider(wsUrl),
      typesBundle: typesBundle as any,
    });

    // First get initial balance of Baltathar
    const initialBalance = await getBalance(BALTATHAR, api);

    // create and send transfer tx from ALITH
    await createAndSendTx(
      {
        tx: "balances.transfer",
        params: BALTATHAR + "," + testAmount,
        address: ALITH,
        sudo: false,
      },
      { ws: wsUrl, network: "moonbase" },
      async (payload: string) => {
        return await testSignCLI(payload);
      }
    );

    // Wait for block
    await createAndFinalizeBlock(api, undefined, true);

    // Then check incremented balance of Baltathar
    const finalBalance = await getBalance(BALTATHAR, api);
    assert.equal(
      Number(finalBalance).toString().substring(0, 15),
      (Number(initialBalance) + Number(testAmount)).toString().substring(0, 15)
    );
  });
});
