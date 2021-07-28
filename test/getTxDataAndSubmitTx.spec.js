"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSubmitTxCLI = exports.testGetTxDataCLI = void 0;
const api_1 = require("@polkadot/api");
const child_process_1 = require("child_process");
const moonbeam_types_bundle_1 = require("moonbeam-types-bundle");
const utils_1 = require("../src/methods/utils");
const sign_spec_1 = require("./sign.spec");
var assert = require("assert");
const testAmount = "1000000000000";
async function getBalance(address, api) {
    const account = await api.query.system.account(address);
    return account.data.free.toString();
}
async function testGetTxDataCLI() {
    return new Promise((resolve) => {
        let call = child_process_1.exec("yarn run cli getTransactionData moonbase " +
            utils_1.testnetWs +
            " " +
            utils_1.ALITH +
            " balances.transfer " +
            utils_1.BALTATHAR +
            "," +
            testAmount);
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
exports.testGetTxDataCLI = testGetTxDataCLI;
async function testSubmitTxCLI(data) {
    return new Promise((resolve) => {
        let call = child_process_1.exec("yarn run cli submitTx " + utils_1.testnetWs + " " + data);
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
exports.testSubmitTxCLI = testSubmitTxCLI;
describe("Get Tx Data, sign it, and send it", function () {
    // TODO: the send offline function doesn't work, but is not very important since we cn use createAndSendTx
    // when we add the feature to decrypt tx data we can test that testGetTxDataCLI works
    it.skip("should increment Baltathar's account balance", async function () {
        this.timeout(40000);
        let api = await api_1.ApiPromise.create({
            provider: new api_1.WsProvider(utils_1.testnetWs),
            typesBundle: moonbeam_types_bundle_1.typesBundle,
        });
        // First get initial balance of Baltathar
        const initialBalance = await getBalance(utils_1.BALTATHAR, api);
        // get tx data
        const txData = await testGetTxDataCLI();
        const signature = await sign_spec_1.testSignCLI(txData);
        console.log("sig", signature);
        // this doesnt work, function is probably deprecated
        const hash = await testSubmitTxCLI(signature);
        // Wait for block
        await new Promise((res) => setTimeout(res, 30000));
        // Then check incremented balance of Baltathar
        const finalBalance = await getBalance(utils_1.BALTATHAR, api);
        assert.equal(finalBalance, (Number(initialBalance) + Number(testAmount)).toString());
    });
});
