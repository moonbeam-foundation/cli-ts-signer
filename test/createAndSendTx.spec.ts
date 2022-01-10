import { ApiPromise, WsProvider } from "@polkadot/api";
import { expect } from "chai";
import { ChildProcess } from "child_process";
import { typesBundlePre900 } from "moonbeam-types-bundle";
import { clearInterval } from "timers";
import { createAndSendTx } from "../src/methods/createAndSendTx";
import { TxParam } from "../src/methods/types";
import { ALITH, BALTATHAR, testnetWs } from "../src/methods/utils";
import { createAndFinalizeBlock, startMoonbeamDevNode } from "./dev-node";
import { testSignCLIPrivateKey } from "./sign.spec";
var assert = require("assert");

const testAmount = "1000000000000";

async function getBalance(address: string, api: ApiPromise) {
  const account: any = await api.query.system.account(address);
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
        params: [BALTATHAR, testAmount],
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
  it.only("should increment Baltathar's account balance - sudo -large payload", async function () {
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
    console.log("initial balance", initialBalance);
    console.log("necessary funds", 110000000000000000000 * 8);

    const largeParams: TxParam[] = [
      {
        callIndex: [1, 2],
        args: [
          [
            {
              callIndex: [3, 1],
              args: ["0x68cb136c94485de9db2896bbf64990610e581bbe", "0x5f68e8131ecf80000", "0x00"],
            },
            {
              callIndex: [3, 1],
              args: ["0x520e15f5f958aa4dcc33ccabaaf2e0e4fc2fad9c", "0x5f68e8131ecf80000", "0x00"],
            },
            {"callIndex": [3, 1], "args":["0x3ab1e8bee2adcd2834a770bd00cbc80d243018b1", "0x5f68e8131ecf80000", "0x00"]},
            {"callIndex": [3, 1], "args":["0x54e2c7f02a10a481bd2b7c6a9b7897ccd3362e08", "0x5f68e8131ecf80000", "0x00"]},
            {"callIndex": [3, 1], "args":["0x8273d86f44401c235d5bad911bac014625882f0b", "0x5f68e8131ecf80000", "0x00"]},
            {"callIndex": [3, 1], "args":["0x510ef2253088b7f81b7f3351288460ff23e1a8b2", "0x5f68e8131ecf80000", "0x00"]},
            {"callIndex": [3, 1], "args":["0xf6fbd68e5d424c29196ae80bd7b2ad99996e68fe", "0x5f68e8131ecf80000", "0x00"]},
            {"callIndex": [3, 1], "args":["0x5ce895e4c5862bfd305c930edd78d99475c47e8d", "0x5f68e8131ecf80000", "0x00"]},
            {"callIndex": [3, 1], "args":["0xf3d5b58c3936f67400d76c103b5ac2064283a4e2", "0x5f68e8131ecf80000", "0x00"]},
            {"callIndex": [3, 1], "args":["0xf47f956f66433869e7091acdcf32e67aa1406310", "0x5f68e8131ecf80000", "0x00"]},
            {"callIndex": [3, 1], "args":["0xe339ff168a7c793255c7c43001bc6c837a0cda69", "0x5f68e8131ecf80000", "0x00"]},
            {"callIndex": [3, 1], "args":["0x8a482059a69270fe5338b1935aabfbe6cbbbde58", "0x5f68e8131ecf80000", "0x00"]},
            {"callIndex": [3, 1], "args":["0x5fd2be87a9b5fd50f4b30de41d59a82337a41de7", "0x5f68e8131ecf80000", "0x00"]},
            {"callIndex": [3, 1], "args":["0x0e5409fba28c823ef3ecbc9385f75a4b2ef9c712", "0x5f68e8131ecf80000", "0x00"]},
            {"callIndex": [3, 1], "args":["0xe77f5dddc987822e4ca03f67566478684def9f28", "0x5f68e8131ecf80000", "0x00"]}
          ],
        ],
      },
    ];

    // UI 342 408
    // 0x0400010218030168cb136c94485de9db2896bbf64990610e581bbe170000f8ec31818ef605000301520e15f5f958aa4dcc33ccabaaf2e0e4fc2fad9c170000f8ec31818ef6050003013ab1e8bee2adcd2834a770bd00cbc80d243018b1170000f8ec31818ef60500030154e2c7f02a10a481bd2b7c6a9b7897ccd3362e08170000f8ec31818ef6050003018273d86f44401c235d5bad911bac014625882f0b170000f8ec31818ef605000301510ef2253088b7f81b7f3351288460ff23e1a8b2170000f8ec31818ef60500
    // 474
    // 0x040001021c030168cb136c94485de9db2896bbf64990610e581bbe170000f8ec31818ef605000301520e15f5f958aa4dcc33ccabaaf2e0e4fc2fad9c170000f8ec31818ef6050003013ab1e8bee2adcd2834a770bd00cbc80d243018b1170000f8ec31818ef60500030154e2c7f02a10a481bd2b7c6a9b7897ccd3362e08170000f8ec31818ef6050003018273d86f44401c235d5bad911bac014625882f0b170000f8ec31818ef605000301510ef2253088b7f81b7f3351288460ff23e1a8b2170000f8ec31818ef605000301f6fbd68e5d424c29196ae80bd7b2ad99996e68fe170000f8ec31818ef60500
    // CLI 494
    // 0x0400010214030168cb136c94485de9db2896bbf64990610e581bbe170000f8ec31818ef605000301520e15f5f958aa4dcc33ccabaaf2e0e4fc2fad9c170000f8ec31818ef6050003013ab1e8bee2adcd2834a770bd00cbc80d243018b1170000f8ec31818ef60500030154e2c7f02a10a481bd2b7c6a9b7897ccd3362e08170000f8ec31818ef6050003018273d86f44401c235d5bad911bac014625882f0b170000f8ec31818ef60500070000004c04000002000000fc249186de19e5b9b19169bfbe63f7ed414604fb553dfc13f09c10a67248b0d1fc249186de19e5b9b19169bfbe63f7ed414604fb553dfc13f09c10a67248b0d1
    // 626
    // 0x040001021c030168cb136c94485de9db2896bbf64990610e581bbe170000f8ec31818ef605000301520e15f5f958aa4dcc33ccabaaf2e0e4fc2fad9c170000f8ec31818ef6050003013ab1e8bee2adcd2834a770bd00cbc80d243018b1170000f8ec31818ef60500030154e2c7f02a10a481bd2b7c6a9b7897ccd3362e08170000f8ec31818ef6050003018273d86f44401c235d5bad911bac014625882f0b170000f8ec31818ef605000301510ef2253088b7f81b7f3351288460ff23e1a8b2170000f8ec31818ef605000301f6fbd68e5d424c29196ae80bd7b2ad99996e68fe170000f8ec31818ef60500070000004c04000002000000fc249186de19e5b9b19169bfbe63f7ed414604fb553dfc13f09c10a67248b0d1fc249186de19e5b9b19169bfbe63f7ed414604fb553dfc13f09c10a67248b0d1

    // for 8
    //550 UI:0x0400010220030168cb136c94485de9db2896bbf64990610e581bbe170000f8ec31818ef605000301520e15f5f958aa4dcc33ccabaaf2e0e4fc2fad9c170000f8ec31818ef6050003013ab1e8bee2adcd2834a770bd00cbc80d243018b1170000f8ec31818ef60500030154e2c7f02a10a481bd2b7c6a9b7897ccd3362e08170000f8ec31818ef6050003018273d86f44401c235d5bad911bac014625882f0b170000f8ec31818ef605000301510ef2253088b7f81b7f3351288460ff23e1a8b2170000f8ec31818ef605000301f6fbd68e5d424c29196ae80bd7b2ad99996e68fe170000f8ec31818ef6050003015ce895e4c5862bfd305c930edd78d99475c47e8d170000f8ec31818ef60500
    //702 CL:0x0400010220030168cb136c94485de9db2896bbf64990610e581bbe170000f8ec31818ef605000301520e15f5f958aa4dcc33ccabaaf2e0e4fc2fad9c170000f8ec31818ef6050003013ab1e8bee2adcd2834a770bd00cbc80d243018b1170000f8ec31818ef60500030154e2c7f02a10a481bd2b7c6a9b7897ccd3362e08170000f8ec31818ef6050003018273d86f44401c235d5bad911bac014625882f0b170000f8ec31818ef605000301510ef2253088b7f81b7f3351288460ff23e1a8b2170000f8ec31818ef605000301f6fbd68e5d424c29196ae80bd7b2ad99996e68fe170000f8ec31818ef6050003015ce895e4c5862bfd305c930edd78d99475c47e8d170000f8ec31818ef60500070000004c04000002000000fc249186de19e5b9b19169bfbe63f7ed414604fb553dfc13f09c10a67248b0d1fc249186de19e5b9b19169bfbe63f7ed414604fb553dfc13f09c10a67248b0d1

    // for 2
    //144 UI:0x0400010208030168cb136c94485de9db2896bbf64990610e581bbe170000f8ec31818ef605000301520e15f5f958aa4dcc33ccabaaf2e0e4fc2fad9c170000f8ec31818ef60500
    //296 CL:0x0400010208030168cb136c94485de9db2896bbf64990610e581bbe170000f8ec31818ef605000301520e15f5f958aa4dcc33ccabaaf2e0e4fc2fad9c170000f8ec31818ef60500070000004c04000002000000fc249186de19e5b9b19169bfbe63f7ed414604fb553dfc13f09c10a67248b0d1fc249186de19e5b9b19169bfbe63f7ed414604fb553dfc13f09c10a67248b0d1

    //0xa10584f24ff3a9cf04c71dbc94d0b566f7a27b94566cace36d9ce9c2b0f98de4f05bc3b08d31ff91cec68de0329d7e00d8a656781449230d501a533918c390d53ef3ba6f5cd1c7d17e98fa81fc2fef04c374bde22232cc01550305ec000400010220030168cb136c94485de9db2896bbf64990610e581bbe170000f8ec31818ef605000301520e15f5f958aa4dcc33ccabaaf2e0e4fc2fad9c170000f8ec31818ef6050003013ab1e8bee2adcd2834a770bd00cbc80d243018b1170000f8ec31818ef60500030154e2c7f02a10a481bd2b7c6a9b7897ccd3362e08170000f8ec31818ef6050003018273d86f44401c235d5bad911bac014625882f0b170000f8ec31818ef605000301510ef2253088b7f81b7f3351288460ff23e1a8b2170000f8ec31818ef605000301f6fbd68e5d424c29196ae80bd7b2ad99996e68fe170000f8ec31818ef6050003015ce895e4c5862bfd305c930edd78d99475c47e8d170000f8ec31818ef60500

    // create and send transfer tx from ALITH
    await createAndSendTx(
      {
        tx: "sudo.sudo",
        params: largeParams,
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
        params: [BALTATHAR, testAmount],
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
            params: [BALTATHAR, testAmount],
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
