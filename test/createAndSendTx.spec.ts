import { ApiPromise, WsProvider } from "@polkadot/api";
import { expect } from "chai";
import { ChildProcess } from "child_process";
import { typesBundle } from "moonbeam-types-bundle";
import { clearInterval } from "timers";
import { createAndSendTx } from "../src/methods/createAndSendTx";
import { ALITH, BALTATHAR, testnetWs } from "../src/methods/utils";
import { createAndFinalizeBlock, startMoonbeamDevNode } from "./dev-node";
import { testSignCLIPrivateKey } from "./sign.spec";
var assert = require("assert");

const testAmount = "1000000000000";

async function getBalance(address: string, api: ApiPromise) {
  const account = await api.query.system.account(address);
  return account.data.free.toString();
}

describe("Create and Send Tx Integration Test", function () {
  let moonbeamProcess: ChildProcess | null;
  let api: ApiPromise;
  let wsUrl: string;
  beforeEach("Starting Moonbeam Test Node", async function () {
    this.timeout(40000);

    // setup network
    const init = await startMoonbeamDevNode(false);
    wsUrl = `ws://localhost:${init.wsPort}`;
    api = await ApiPromise.create({
      provider: new WsProvider(wsUrl),
      typesBundle: typesBundle as any,
    });
    moonbeamProcess = init.runningNode;
  });
  it("should increment Baltathar's account balance", async function () {
    this.timeout(40000);

    // First get initial balance of Baltathar
    const initialBalance = await getBalance(BALTATHAR, api);

    // Start producing blocks in parallel
    let produceBlocks = true;
    setInterval(async () => {
      if (produceBlocks) {
        await createAndFinalizeBlock(api, undefined, true);
      }
    }, 500);

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
        return await testSignCLIPrivateKey(payload);
      }
    );

    // Stop producing blocks
    produceBlocks = false;

    // Then check incremented balance of Baltathar
    const finalBalance = await getBalance(BALTATHAR, api);
    assert.equal(
      Number(finalBalance).toString().substring(0, 15),
      (Number(initialBalance) + Number(testAmount)).toString().substring(0, 15)
    );
  });
  // tx expire after 256 blocks in moonbeam
  it("should increment Baltathar's account balance - immortal tx", async function () {
    this.timeout(40000);

    // First get initial balance of Baltathar
    const initialBalance = await getBalance(BALTATHAR, api);

    // Start producing blocks in parallel
    let produceBlocks = true;
    setInterval(async () => {
      if (produceBlocks) {
        await createAndFinalizeBlock(api, undefined, true);
      }
    }, 500);

    // create and send transfer tx from ALITH
    await createAndSendTx(
      {
        tx: "balances.transfer",
        params: BALTATHAR + "," + testAmount,
        address: ALITH,
        sudo: false,
        immortality: true,
      },
      { ws: wsUrl, network: "moonbase" },
      async (payload: string) => {
        // wait 300 blocks before submitting signature
        for (let i = 0; i < 300; i++) {
          await createAndFinalizeBlock(api, undefined, true);
        }
        return await testSignCLIPrivateKey(payload);
      }
    );
    // Stop producing blocks
    produceBlocks = false;

    // Then check incremented balance of Baltathar
    const finalBalance = await getBalance(BALTATHAR, api);
    assert.equal(
      Number(finalBalance).toString().substring(0, 15),
      (Number(initialBalance) + Number(testAmount)).toString().substring(0, 15)
    );
  });
  it("make sure tx fail after 300 blocks without immortality", async function () {
    this.timeout(40000);
    return new Promise(async (res) => {
      // First get initial balance of Baltathar
      const initialBalance = await getBalance(BALTATHAR, api);

      // Start producing blocks in parallel
      let produceBlocks = true;
      setInterval(async () => {
        if (produceBlocks) {
          await createAndFinalizeBlock(api, undefined, true);
        }
      }, 500);

      // listen for node error messages
      moonbeamProcess?.stderr?.on("data", async function (chunk) {
        let message = chunk.toString();
        if (
          message.includes(
            "Transaction pool error: Invalid transaction validity: InvalidTransaction::BadProof"
          )
        ) {
          // Stop producing blocks
          produceBlocks = false;
          const finalBalance = await getBalance(BALTATHAR, api);
          assert.equal(
            Number(finalBalance).toString().substring(0, 15),
            Number(initialBalance).toString().substring(0, 15)
          );
          res();
        }
      });

      // create and send transfer tx from ALITH
      try {
        await createAndSendTx(
          {
            tx: "balances.transfer",
            params: BALTATHAR + "," + testAmount,
            address: ALITH,
            sudo: false,
          },
          { ws: wsUrl, network: "moonbase" },
          async (payload: string) => {
            for (let i = 0; i < 300; i++) {
              // wait 300 blocks before submitting signature
              await createAndFinalizeBlock(api, undefined, true);
            }
            return await testSignCLIPrivateKey(payload);
          }
        );
        // Stop producing blocks
        produceBlocks = false;
      } catch (e: any) {
        // Stop producing blocks
        produceBlocks = false;
        expect(e.toString()).to.eq(
          "Error: 1010: Invalid Transaction: Transaction has a bad signature"
        );
      }
    });
  });
  afterEach(async function () {
    api.disconnect();

    if (moonbeamProcess) {
      await new Promise((resolve) => {
        moonbeamProcess?.once("exit", resolve);
        moonbeamProcess?.kill();
        moonbeamProcess = null;
      });
    }
  });
});
