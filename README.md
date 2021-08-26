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
In the first one run `yarn run launch --parachain local --relay local` in order
to launch a local parachain on port 34102.

Then, in the two other windows run :
`./test_signature_moonbase`
`./test_createAndSend_sudo_moonbase`

You will see the updated parachainBond in the apps (chain state) if connecting to ws://localhost:34102

## Binary

Build a binary for the cli-signer

To build, run `yarn build-binary`

Then, to use it on a mac, for example:
`yarn run cli-binary-macos --help`
