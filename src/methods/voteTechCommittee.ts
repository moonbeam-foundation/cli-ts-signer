import { ApiPromise, WsProvider } from "@polkadot/api";
import { parseImage } from "@polkadot/api-derive/democracy/util";
import { typesBundle } from "moonbeam-types-bundle";
import prompts from "prompts";
import { moonbeamChains } from "./utils";
import { NetworkArgs } from "./types";
import { createAndSendTx } from "./createAndSendTx";

export async function retrieveMotions(networkArgs: NetworkArgs): Promise<{
  index: number;
  hash: string;
  text: string;
}[]> {
  const { ws, network } = networkArgs;
  let api: ApiPromise;
  if (moonbeamChains.includes(network)) {
    api = await ApiPromise.create({
      provider: new WsProvider(ws),
      typesBundle: typesBundle as any,
    });
  } else {
    api = await ApiPromise.create({
      provider: new WsProvider(ws),
    });
  }

  const hashes = await api.query["techComitteeCollective" as "council"].proposals();
  const motionList = (await api.query["techComitteeCollective" as "council"].proposalOf.multi(
    hashes
  )) as any;
  const votes = (await api.query["techComitteeCollective" as "council"].voting.multi(hashes)) as any;

  return await Promise.all(
    motionList.map(async (motionData: any, index: any) => {
      const motion = motionData.unwrap();
      const vote = votes[index].unwrap();
      const hash = hashes.toArray()[index].toHex();

      console.log(`[${vote.index}] ${motion.section}.${motion.method}`);
      const data = {
        index:Number(vote.index),
        hash,
        text: "",
      };
      if (
        motion.method == "externalProposeMajority" ||
        motion.method == "externalProposeDefault" ||
        motion.method == "externalPropose"
      ) {
        const preimageData = await api.query.democracy.preimages(motion.args[0]);
        const preimage = parseImage(api as any, preimageData as any);

        const proposal = preimage && preimage.proposal;
        if (proposal) {
          data.text = `[${vote.index}] ${motion.method} - ${proposal.section}.${
            proposal.method
          }: ${proposal.args
            .map((argv) => {
              const text = argv.toHuman()?.toString() || "";
              return `${
                text.length > 100
                  ? `${text.substring(0, 7)}..${text.substring(text.length - 4)}`
                  : text
              }`;
            })
            .join(`, `)}`;
        }
      } else {
        data.text = `[${vote.index}] ${motion.section}.${motion.method}`;
      }
      return data;
    })
  );
}

export async function voteTechCommitteePrompt(address: string, networkArgs: NetworkArgs) {
  const motions = await retrieveMotions(networkArgs);

  const motionIndex = await prompts({
    type: "select",
    name: "index",
    message: "Pick motion",
    choices: motions.map((motion,i) => {
      return { title: motion.text, value: i };
    }),
  });
  const selectedMotion = motions[motionIndex.index];

  if (!selectedMotion) {
    console.log(`Selected motion doesn't exist`);
    return
  }
  
  const vote = await prompts({
    type: "select",
    name: "yes",
    message: `Pick a vote for ${selectedMotion.text}`,
    choices: [{ title: "Yes", value: true },{ title: "No", value: false }],
  });
  console.log(`You are voting ${vote.yes} for [${selectedMotion.index} - ${selectedMotion.hash}]`)
  console.log(`  ${selectedMotion.text}`);

  return createAndSendTx(
    {
      address,
      tx: `techComitteeCollective.vote`,
      params: [selectedMotion.hash, selectedMotion.index, 
        vote.yes
    ]
    },
    networkArgs,
    async (payload: string) => {
      const response = await prompts({
        type: "text",
        name: "signature",
        message: "Please enter signature for + " + payload + " +",
        validate: (value) => true, // TODO: add validation
      });
      return response["signature"].trim();
    }
  );
}
