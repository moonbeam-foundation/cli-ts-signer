# cli-ts-signer

Typescript based cli signer for Substrate Transactions.

The goal is to be able to sign transactions offline for both Moonbeam based parachains and relay chains.

## Disclaimer

Moonbeam Signer Copyright (C) 2023 Purestake Ltd  
This program comes with ABSOLUTELY NO WARRANTY. For details, see [LICENSE](./LICENSE).  
This is free software, and you are welcome to redistribute it under certain conditions.

## Commands

- `license`: Displays the license
- `create`: Creates a transaction payload and stores it in a file
- `vote`: Interactively create a batch of votes for collectives in a file
- `sign`: Signs a transaction message or payload from a file
- `send`: Sends on-chain a signed transaction stored in a file
- `verify`: Verifies a signature
- `createAndSendTx`: Perform create and send sequentially

## Create/Sign/Send through file

### Generating the transaction

The signer supports to wrote transaction data and signature into a file to faciliate doing offline signing.

```
./moonbeam-signer-linux create --network <network> --address <address> --file <path_of_file> --tx <section.method> --params '[...]'
```

Creates the file `<path_of_file>` and stores the transaction payload details into it. This will get used in by the sign command.

(To easily find the possible section.method and their parameters, it is suggested to connect to [polkadotjs app](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwss.api.moonbeam.network#/extrinsics))

### Signing the transaction

```
./moonbeam-signer-linux sign --type ethereum --file <path_of_file> --private-key <private_key>
```

Reads payload from the file `<path_of_file>`, signs it with the private-key and **writes the signature into the same file**.

Bonus: Also verifies the private-key matches the transaction address, preventing the bad-signature issue.

### Sending the signed transaction

```
./moonbeam-signer-linux send --network <network> --file send-remark.json [--yes]
```

Sends the signed transaction. Will prompt the user for confirmation except if `--yes` is provided

### Sudo

It is possible to wrap the call inside a sudo:

```
./moonbeam-signer-linux create --network <network> --address <address> --tx parachainStaking.setParachainBondAccount --params "0x111...11" --sudo
```

will execute `sudo.sudo` (`<address>` must be the sudo user) to execute `parachainStaking.setParachainBondAccount("0x111...111")`

### Proxy

It is possible to proxy transaction by using:

```
./moonbeam-signer-linux vote --network <network> --address <address> --proxied-account <proxied-address>[:<proxy-type>][,proxied-address>[:<proxy-type>]]...
```

- proxied-account: A list (comma-separated) of proxied addresses

Proxy addresses are ordered from the deepest proxy to the real account.
A Proxied address can be followed by `:<proxy-type` (like Governance, Any,...) to specify the type of proxy to use.

**Exemple:**

`--proxied-account "0x222...22:Any,0x333...33:Staking --address "0x111..11"`
will make `0x111...11` **sign** a _proxy.proxy_ to `0x222...22` which will _proxy.proxy_ to `0x333...33` which will _execute the call_)

**Combined with sudo**

If you combine `--sudo` with `--proxied-account`, the `sudo.sudo` will get wrapped inside the `proxy.proxy`(s).

## Binary

Build a binary for the cli-signer

To build, run `npm run build-binary`

Then, to use it on a mac, for example:
`npm run cli-binary-macos --help`

## Exemples

Using sudo.sudoAs to **add proxy** to another account

```
npm run cli -- createAndSendTx --ws "wss://wss.testnet.moonbeam.network" --address "0x5a7869f6aEfC93F45b30514023324B8D38e2a11c" --tx sudo.sudoAs --params '["0x62D9F113cBd2263FADd5C6248B0f538dD133f6A4", {"callIndex": [22, 1], "args":["0xb1C35866AEba18de80b8A60226EA47990F7D2208", "Any", 50400]}]'
```

[22, 1] is proxy.addProxy in current Moonbase runtime 1101

Using sudo to **set the balance of multiple accounts**

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

## Tips: Using encrypted private keys

In order to avoid typing your private key in the cli, and having it visible (on screen and also in the bash history), it is suggested to store the private key in an encrypted file.

If your private key is in file `alith.txt`, you can run:

`gpg -c alith.txt` (and provide a password)

This will generate the file `alith.txt.gpg`. You can re-use it when signing doing:

`npm run cli -- sign --type ethereum --file <path_of_file> --private-key $(gpg -d alith.txt.gpg)`

(This will ask for the password the first time, and keep it in memory for 5min in most gpg distributions)
