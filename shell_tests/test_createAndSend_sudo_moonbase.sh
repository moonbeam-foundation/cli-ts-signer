# test
# Alith
# test add priv key: 0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133
# test add pub key : 0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac
# test param add : 0x3Cd0A705a2DC65e5b1E1205896BaA2be8A07c6e0 Baltathar
npm run cli createAndSendTx -- --network moonbase --ws ws://localhost:34102 --address "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac" --tx parachainStaking.setParachainBondAccount --params "0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac" --sudo