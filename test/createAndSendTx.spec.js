"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("@polkadot/api");
const moonbeam_types_bundle_1 = require("moonbeam-types-bundle");
const createAndSendTx_1 = require("../src/methods/createAndSendTx");
const utils_1 = require("../src/methods/utils");
const sign_spec_1 = require("./sign.spec");
var assert = require("assert");
const testAmount = "1000000000000";
async function getBalance(address, api) {
    const account = await api.query.system.account(address);
    return account.data.free.toString();
}
describe("Create and Send Tx Integration Test", function () {
    it("should increment Baltathar's account balance", async function () {
        this.timeout(40000);
        let api = await api_1.ApiPromise.create({
            provider: new api_1.WsProvider(utils_1.testnetWs),
            typesBundle: moonbeam_types_bundle_1.typesBundle,
        });
        // First get initial balance of Baltathar
        const initialBalance = await getBalance(utils_1.BALTATHAR, api);
        // create and send transfer tx from ALITH
        await createAndSendTx_1.createAndSendTx("balances.transfer", utils_1.BALTATHAR + "," + testAmount, utils_1.testnetWs, utils_1.ALITH, "moonbase", async (payload) => {
            return await sign_spec_1.testSignCLI(payload);
        }, false);
        // Wait for block
        await new Promise((res) => setTimeout(res, 30000));
        // Then check incremented balance of Baltathar
        const finalBalance = await getBalance(utils_1.BALTATHAR, api);
        assert.equal(finalBalance, (Number(initialBalance) + Number(testAmount)).toString());
    });
});
