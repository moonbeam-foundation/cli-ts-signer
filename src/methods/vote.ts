import { ApiPromise } from "@polkadot/api";
import type { Option, Vec } from "@polkadot/types";
import type { Call, H256, Proposal } from "@polkadot/types/interfaces";
import type { PalletCollectiveVotes } from "@polkadot/types/lookup";
import prompts from "prompts";
import { Argv as NetworkArgv, getApiFor } from "moonbeam-tools";
import { CreateOpt, TxWrapperOpt, Vote } from "./types";
import { createTx } from "./createTx";

interface VoteConfig {
  palletName: string;
  index: number;
  hash: string;
  text: string;
}

export function getObjectMethods(obj: any) {
  let properties = new Set();
  let currentObj = obj;
  do {
    Object.getOwnPropertyNames(currentObj).map((item) => properties.add(item));
  } while ((currentObj = Object.getPrototypeOf(currentObj)));
  return [...properties.keys()].filter((item: any) => {
    try {
      return typeof obj[item] === "function";
    } catch (e) {
      return false;
    }
  });
}

function getProposalText(index: number, method: string, proposal: Proposal) {
  return `${method} - ${proposal.toHuman().section}.${proposal.toHuman().method}: ${Object.keys(
    (proposal.toHuman() as any).args
  )
    .map((argKey: any) => {
      const text = `${argKey}:${(proposal.toHuman() as any).args[argKey]}`;
      return `${
        text.length > 30 ? `${text.substring(0, 7)}..${text.substring(text.length - 4)}` : text
      }`;
    })
    .join(`, `)
    .slice(0, 80)}`;
}

export async function retrieveCollectivesProposals(api: ApiPromise): Promise<VoteConfig[]> {
  return (
    await Promise.all(
      Object.keys(api.query)
        .filter((palletName) => {
          const pallet = api.query[palletName];
          return !!pallet.proposals && !!pallet.voting;
        })
        .map(async (palletName) => {
          // Fetch list of proposal hashes, descriptions and votes
          const hashes = (await api.query[palletName].proposals()) as Vec<H256>;
          const motionList = (await api.query[palletName].proposalOf.multi(
            hashes
          )) as Option<Call>[];
          const votes = (await api.query[palletName].voting.multi(
            hashes
          )) as Option<PalletCollectiveVotes>[];

          return Promise.all(
            motionList.map(async (motionData, index) => {
              const motion = motionData.unwrap();
              const vote = votes[index].unwrap();
              const hash = hashes.toArray()[index].toHex();

              const config: VoteConfig = {
                palletName,
                index: Number(vote.index),
                hash,
                text: "",
              };
              if (
                motion.method == "externalProposeMajority" ||
                motion.method == "externalProposeDefault" ||
                motion.method == "externalPropose"
              ) {
                const proposalArg = motion.args[0] as any;
                const preimageData: any = proposalArg.isLookup
                  ? await api.query.preimage.preimageFor([
                      proposalArg.asLookup.toJSON(/*needed for polkadotjs bug*/).hash,
                      proposalArg.asLookup.len.toNumber(),
                    ])
                  : proposalArg.isInline
                  ? proposalArg.asInline
                  : await api.query.democracy.preimages(
                      proposalArg.isLegacy ? proposalArg.asLegacy : proposalArg // Support runtime before preimage pallet
                    );
                const proposal =
                  preimageData.isSome && preimageData.unwrap()
                    ? api.registry.createType("Proposal", preimageData.unwrap().toU8a(true))
                    : null;

                if (proposal) {
                  config.text = getProposalText(vote.index.toNumber(), motion.method, proposal);
                }
              } else if (motion.method == "whitelistCall") {
                const preimageStatus: any = await api.query.preimage.statusFor(motion.args[0]);
                if (preimageStatus.isSome) {
                  const status = preimageStatus.unwrap();
                  const preimageData: any = await api.query.preimage.preimageFor([
                    motion.args[0],
                    status.isUnrequested
                      ? status.asUnrequested.len
                      : status.asRequested.len.unwrapOr(0),
                  ]);
                  const proposal: any =
                    preimageData.isSome && preimageData.unwrap()
                      ? api.registry.createType("Proposal", preimageData.unwrap().toU8a(true))
                      : null;
                  if (proposal) {
                    config.text = getProposalText(vote.index.toNumber(), motion.method, proposal);
                  }
                } else {
                  config.text = `${motion.section}.${motion.method} (${motion.args[0]})`;
                }
              } else {
                config.text = `${motion.section}.${motion.method}`;
              }
              return config;
            })
          );
        })
    )
  )
    .filter((arr) => arr.length > 0)
    .flat();
}

function toCapitalizedWords(name: string) {
  var words = name.match(/[A-Za-z][a-z]*/g) || [];

  return words.map(capitalize).join(" ");
}

function capitalize(word: string) {
  return word.charAt(0).toUpperCase() + word.substring(1);
}

export async function votePrompt(
  address: string,
  txWrapperOpt: TxWrapperOpt,
  networkOpt: NetworkArgv,
  createOpt: CreateOpt
) {
  const api = await getApiFor(networkOpt);

  // Retrieve list of motions
  const motions = await retrieveCollectivesProposals(api);

  // Multiselect allows the user to chose multiple motions to vote for
  const motionSelection = await prompts({
    type: "multiselect",
    name: "index",
    message: "Pick motion",
    choices: motions.map((motion, i) => {
      return {
        title: `[${toCapitalizedWords(motion.palletName).slice(0, 30).padStart(30)} - Motion #${
          motion.index
        }] ${motion.text || `Not available - hash ${motion.hash}`}`,
        value: i,
      };
    }),
  });
  if (!motionSelection.index || motionSelection.index.length === 0) {
    throw new Error("There are no motions to vote for");
  }

  // For each selected motion, let the user chose a vote
  let votes: Vote[] = [];
  for (let j = 0; j < motionSelection.index.length; j++) {
    let i = motionSelection.index[j];
    const selectedMotion = motions[i];

    if (!selectedMotion) {
      console.log(`Selected motion doesn't exist`);
      return;
    }

    let vote: Vote = await prompts({
      type: "select",
      name: "yes",
      message: `Pick a vote for [Motion #${selectedMotion.index}] ${
        selectedMotion.text || `Not available - hash ${selectedMotion.hash}`
      }`,
      choices: [
        { title: "Yes", value: true },
        { title: "No", value: false },
      ],
    });
    votes.push(vote);
  }

  // If more than one motion, use batch utility
  const txOpt =
    votes.length === 1
      ? {
          address,
          tx: `councilCollective.vote`,
          params: [
            motions[motionSelection.index[0]].hash,
            motions[motionSelection.index[0]].index,
            votes[0].yes,
          ],
        }
      : {
          address,
          tx: `utility.batch`,
          params: [
            votes.map((vote: Vote, i: number) => {
              let selectedMotion = motions[motionSelection.index[i]];
              return api.tx[selectedMotion.palletName].vote(
                selectedMotion.hash,
                selectedMotion.index,
                vote.yes
              );
            }),
          ],
        };
  return createTx(txOpt, txWrapperOpt, networkOpt, createOpt);
}
