import { needParam } from "../utils";
import { verifyFromPolkadotJs } from "./verifyFromPolkadotJs";

export async function verify(argv:{[key:string]:string}){
    needParam("message", "verify", argv);
    needParam("signature", "verify", argv);
    needParam("pubKey", "verify", argv);
    let pubKey = verifyFromPolkadotJs(argv.message, argv.signature);
    console.log("PUBKEY : " + pubKey);
    console.log("VALIDITY : " + (argv.pubKey == pubKey).toString());
}