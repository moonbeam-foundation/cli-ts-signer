import { ApiPromise, WsProvider } from "@polkadot/api";
import { expect } from "chai";
import { ChildProcess } from "child_process";
import { typesBundlePre900 } from "moonbeam-types-bundle";
import { clearInterval } from "timers";
import { createAndSendTx } from "../src/methods/createAndSendTx";
import { ALITH, BALTATHAR, testnetWs } from "../src/methods/utils";
import { createAndFinalizeBlock, startMoonbeamDevNode } from "./dev-node";
import {
  testSignCLIPrivateKey,
  testSignCLIPrivateKeyWithFilePath,
  testSignCLIWithFilePathWithError,
} from "./sign.spec";
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
    console.log("wsUrl", wsUrl);
    api = await ApiPromise.create({
      provider: new WsProvider(wsUrl),
      typesBundle: typesBundlePre900 as any,
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
  it("should increment Baltathar's account balance - use file to verify", async function () {
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
      async (payload: string, filePath: string) => {
        return await testSignCLIPrivateKeyWithFilePath(payload, filePath, wsUrl);
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
  it("shouldn't increment Baltathar's account balance - use file to verify and fail", async function () {
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
    const error: string = await new Promise((res) => {
      createAndSendTx(
        {
          tx: "balances.transfer",
          params: BALTATHAR + "," + testAmount,
          address: ALITH,
          sudo: false,
        },
        { ws: wsUrl, network: "moonbase" },
        async (payload: string, filePath: string) => {
          // look for error
          console.log("payload", payload);
          console.log("payload", payload.substring(0, payload.length - 3) + "zzz");
          res(
            await testSignCLIWithFilePathWithError(
              payload.substring(0, payload.length - 3) + "zzz",
              filePath
            )
          );
          return "0x0";
        }
      );
    });
    // expect error from the sign cli
    expect(error.substring(0, 50)).to.eq("Error: Payload is not matching payload in filepath");

    // Stop producing blocks
    produceBlocks = false;

    // Then check incremented balance of Baltathar
    const finalBalance = await getBalance(BALTATHAR, api);
    assert.equal(
      Number(finalBalance).toString(), //.substring(0, 15),
      Number(initialBalance).toString() //.substring(0, 15)
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
