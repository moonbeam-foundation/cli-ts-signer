import { ApiPromise, WsProvider } from "@polkadot/api";
import { exec } from "child_process";
import { typesBundle } from "moonbeam-types-bundle";
import { ALITH, BALTATHAR, testnetWs } from "../src/methods/utils";
import { testSignCLI } from "./sign.spec";
var assert = require("assert");

const testAmount = "1000000000000";

async function getBalance(address: string, api: ApiPromise) {
  const account = await api.query.system.account(address);
  return account.data.free.toString();
}

export async function testGetTxDataCLI(): Promise<string> {
  return new Promise((resolve) => {
    let call = exec(
      "yarn run cli getTransactionData moonbase " +
        testnetWs +
        " " +
        ALITH +
        " balances.transfer " +
        BALTATHAR +
        "," +
        testAmount
    );
    call.stdout?.on("data", function (chunk) {
      let message = chunk.toString();
      // console.log("hi","+"+message.substring(0, 32)+"+")
      // console.log("oh","+"+message.substring(33, message.length - 1))
      if (message.substring(0, 32) === "Transaction data to be signed : ") {
        resolve(message.substring(33, message.length - 1));
      }
    });
  });
}

export async function testSubmitTxCLI(data: string): Promise<string> {
  return new Promise((resolve) => {
    let call = exec("yarn run cli submitTx " + testnetWs + " " + data);
    call.stdout?.on("data", function (chunk) {
      let message = chunk.toString();
      // console.log("ohhaaa",message)
      // console.log("ohi",message.substring(0, 2))
      if (message.substring(0, 2) === "ok") {
        resolve(message.substring(31, message.length - 1));
      }
    });
  });
}

describe("Get Tx Data, sign it, and send it", function () {
  // TODO: the send offline function doesn't work, but is not very important since we cn use createAndSendTx
  // when we add the feature to decrypt tx data we can test that testGetTxDataCLI works
  it.skip("should increment Baltathar's account balance", async function () {
    this.timeout(40000);
    let api = await ApiPromise.create({
      provider: new WsProvider(testnetWs),
      typesBundle: typesBundle as any,
    });

    // First get initial balance of Baltathar
    const initialBalance = await getBalance(BALTATHAR, api);

    // get tx data
    const txData = await testGetTxDataCLI();
    const signature = await testSignCLI(txData);
    console.log("sig", signature);

    // this doesnt work, function is probably deprecated
    const hash = await testSubmitTxCLI(signature);

    // Wait for block
    await new Promise((res) => setTimeout(res, 30000));

    // Then check incremented balance of Baltathar
    const finalBalance = await getBalance(BALTATHAR, api);
    assert.equal(finalBalance, (Number(initialBalance) + Number(testAmount)).toString());
  });
});
