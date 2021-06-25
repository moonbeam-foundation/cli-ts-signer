# cli-ts-signer
Typescript based cli signer for both Substrate and Ethereum Transactions

The goal is to be able to sign transactions offline for both Moonbeam based parachains and relay chains.

## Examples

To run the examples, open two terminal and run in parallel the createAndSend and the signature test scripts:

`./test_signature_{moonbase/westend}`
`./test_createAndSend_{moonbase/westend}`

createAndSend will create a transaction payload and prompt the user to enter signature and send it.
signature (sign) will sign a payload and return a signature.
See script for input details.