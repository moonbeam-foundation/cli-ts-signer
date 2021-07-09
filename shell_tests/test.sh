# test
echo "TEST 1, SIGNATURE"
yarn run cli sign "ethereum" "0x070dc3117300011918e26b02176945cc15c3d548cf49fd8418d97f93af699e46" --message "just some test message"
echo "Signature should be 0xca1e5d71bbbb1e0bc913e2c3c7107894b997cd24a5c7758051603936f4606b99b6ba7d64738dd093198dffa49f0e06a7037e0eea0eba315ce7869f26159b62e400"
echo "PubKey should be 0x0381351b1b46d2602b0992bb5d5531f9c1696b0812feb2534b6884adc47e2e1d8b"
yarn run cli verify "ethereum" "0xca1e5d71bbbb1e0bc913e2c3c7107894b997cd24a5c7758051603936f4606b99b6ba7d64738dd093198dffa49f0e06a7037e0eea0eba315ce7869f26159b62e400" "0x0381351b1b46d2602b0992bb5d5531f9c1696b0812feb2534b6884adc47e2e1d8b" "just some test message"

echo "TEST 1, TRANSFER"
yarn run cli getTransactionData --ws wss://wss.stagenet.moonbeam.gcp.purestake.run  --tx balances.transfer --params "0x75531fC94c98F12FEf587f45b92a1F2DC1B72051,123" --address "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac"