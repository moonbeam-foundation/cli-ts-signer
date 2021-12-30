# cli-ts-signer

Typescript based cli signer for both Substrate and Ethereum Transactions

The goal is to be able to sign transactions offline for both Moonbeam based parachains and relay chains.

## Examples

_run these commands in the shell_tests folder_

To run the examples, open two terminal and run in parallel the createAndSend and the signature test scripts:

`./test_signature_{moonbase/westend}`
`./test_createAndSend_{moonbase/westend}`

createAndSend will create a transaction payload and prompt the user to enter signature and send it.
signature (sign) will sign a payload and return a signature.
See script for input details.

### Sudo

To try sudo, open 3 terminals.
In the first one run `npm run launch --parachain local --relay local` in order
to launch a local parachain on port 34102.

Then, in the two other windows run :
`./test_signature_moonbase`
`./test_createAndSend_sudo_moonbase`

You will see the updated parachainBond in the apps (chain state) if connecting to ws://localhost:34102

### Specific Actions

Some specific actions are provided as a preconfigured feature:

`npm run cli voteCouncil -- --network <network> --ws <ws> <address>` : creates a vote council payload, prompts for signature and sends it

`npm run cli voteTechCommittee -- --network <network> --ws <ws> --address <address>` : creates a tech committee vote payload, prompts for signature and sends it

## Binary

Build a binary for the cli-signer

To build, run `npm build-binary`

Then, to use it on a mac, for example:
`npm run cli-binary-macos --help`


## Exemples

Using sudo.sudoAs to add proxy to another account
```
npm run cli -- createAndSendTx --ws "wss://wss.testnet.moonbeam.network" --address "0x5a7869f6aEfC93F45b30514023324B8D38e2a11c" --tx sudo.sudoAs --params '["0x62D9F113cBd2263FADd5C6248B0f538dD133f6A4", {"callIndex": [22, 1], "args":["0xb1C35866AEba18de80b8A60226EA47990F7D2208", "Any", 50400]}]'
```
[22, 1] is proxy.addProxy in current Moonbase runtime 1101


Using sudo to set the balance of multiple accounts
```
npm run cli -- createAndSendTx --network moonbase --ws "wss://wss.testnet.moonbeam.network" --address "0x5a7869f6aEfC93F45b30514023324B8D38e2a11c" \
  --tx sudo.sudo \
  --params '[{"callIndex": [1, 2], "args":[[
    {"callIndex": [3, 1], "args":["0x68cb136c94485de9db2896bbf64990610e581bbe", "0x5f68e8131ecf80000", "0x00"]},
    {"callIndex": [3, 1], "args":["0x520e15f5f958aa4dcc33ccabaaf2e0e4fc2fad9c", "0x5f68e8131ecf80000", "0x00"]},
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
  ]]}]'
```
[1, 2] is utility.BatchAll in current Moonbase runtime 1101  
[3, 1] is balance.setBalance in current Moonbase runtime 1101