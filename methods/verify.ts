import { verifyFromPolkadotJs } from "./verifyFromPolkadotJs";

export async function verify(message:string,signature:string,pubKey:string){
    // needParam("message", "verify", argv);
    // needParam("signature", "verify", argv);
    // needParam("pubKey", "verify", argv);
    let publicKey = verifyFromPolkadotJs(message, signature);
    console.log("PUBKEY : " + pubKey);
    console.log("VALIDITY : " + (pubKey == publicKey).toString());
}