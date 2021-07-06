import { verifyFromPolkadotJs } from "./verifyFromPolkadotJs";

export async function verify(message:string,signature:string,pubKey:string){
    let publicKey = verifyFromPolkadotJs(message, signature);
    console.log("PUBKEY : " + pubKey);
    console.log("VALIDITY : " + (pubKey == publicKey).toString());
}