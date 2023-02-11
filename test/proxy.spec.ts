import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import { setTimeout } from "timers/promises";
import { ChildProcess } from "child_process";
import {
  ALITH_ADDRESS,
  BALTATHAR_ADDRESS,
  BALTATHAR_PRIVATE_KEY,
  ETHAN_ADDRESS,
  ETHAN_PRIVATE_KEY,
  FAITH_ADDRESS,
  ProxyChain,
} from "moonbeam-tools";
import { createAndSendTx } from "../src/methods/createAndSendTx";
import { createTx } from "../src/methods/createTx";
import { createAndFinalizeBlock, startMoonbeamDevNode } from "./dev-node";
import { testSignCLIPrivateKey } from "./sign.spec";
import { expect } from "chai";
var assert = require("assert");

const testAmount = "1000000000000";

async function getBalance(address: string, api: ApiPromise) {
  const account: any = await api.query.system.account(address);
  return account.data.free.toString();
}

describe("Proxy", function () {
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
    });
    await api.isConnected;
    moonbeamProcess = init.runningNode;
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

  it("should craft the package with proxies", async function () {
    this.timeout(10000);
    const res = await createTx(
      {
        tx: "balances.transfer",
        params: [FAITH_ADDRESS, testAmount],
        address: ALITH_ADDRESS,
      },
      {
        proxyChain: new ProxyChain([
          {
            address: BALTATHAR_ADDRESS,
            type: "Any",
          },
          {
            address: ETHAN_ADDRESS,
            type: "Any",
          },
        ]),
      },
      { url: wsUrl },
      {}
    );
    expect(res.payload?.address).to.eq(ALITH_ADDRESS);
    expect(res.payload?.method).to.contain(BALTATHAR_ADDRESS.slice(2).toLocaleLowerCase());
    expect(res.payload?.method).to.contain(ETHAN_ADDRESS.slice(2).toLocaleLowerCase());
  });

  it("should be used correctly", async function () {
    this.timeout(10000);
    const keyring = new Keyring({ type: "ethereum" });
    const baltathar = keyring.addFromUri(BALTATHAR_PRIVATE_KEY);
    const ethan = keyring.addFromUri(ETHAN_PRIVATE_KEY);

    // First setup the proxy
    await Promise.all([
      new Promise<void>((resolve) => {
        api.tx.proxy.addProxy(ALITH_ADDRESS, "Any", 0).signAndSend(baltathar, (status) => {
          resolve();
        });
      }),
      new Promise<void>((resolve) => {
        api.tx.proxy.addProxy(BALTATHAR_ADDRESS, "Any", 0).signAndSend(ethan, (status) => {
          resolve();
        });
      }),
    ]);
    await createAndFinalizeBlock(api);

    const baltatharInitialBalance = BigInt(await getBalance(BALTATHAR_ADDRESS, api));
    const ethanInitialBalance = BigInt(await getBalance(ETHAN_ADDRESS, api));
    const alithInitialBalance = BigInt(await getBalance(ALITH_ADDRESS, api));
    const faithInitialBalance = BigInt(await getBalance(FAITH_ADDRESS, api));

    // proxied Alith -> Baltathar -> Ethan ==transfer==> Faith
    const res = createAndSendTx(
      {
        tx: "balances.transfer",
        params: [FAITH_ADDRESS, testAmount],
        address: ALITH_ADDRESS,
      },
      {
        proxyChain: new ProxyChain([
          {
            address: BALTATHAR_ADDRESS,
            type: "Any",
          },
          {
            address: ETHAN_ADDRESS,
            type: "Any",
          },
        ]),
      },
      { url: wsUrl },
      async (payload: string) => {
        return testSignCLIPrivateKey(payload);
      }
    );
    await setTimeout(2000);
    await createAndFinalizeBlock(api, undefined, true);
    await res;

    // Then check incremented balance of Baltathar
    const baltatharFinalBalance = BigInt(await getBalance(BALTATHAR_ADDRESS, api));
    const ethanFinalBalance = BigInt(await getBalance(ETHAN_ADDRESS, api));
    const alithFinalBalance = BigInt(await getBalance(ALITH_ADDRESS, api));
    const faithFinalBalance = BigInt(await getBalance(FAITH_ADDRESS, api));
    assert.equal(baltatharInitialBalance, baltatharFinalBalance);
    assert.ok(
      // Check the fees are being paid by alith
      alithInitialBalance - 1_000_000_000_000_000n < alithFinalBalance &&
        alithInitialBalance > alithFinalBalance
    );
    assert.equal(ethanInitialBalance - BigInt(testAmount), ethanFinalBalance);
    assert.equal(faithInitialBalance + BigInt(testAmount), faithFinalBalance);
  });
});
