import { SampleCase, TaxonomyDetail } from "./types";

export const SAMPLE_CASES: SampleCase[] = [
  {
    id: "test-1",
    title: "Political Campaign Allegation",
    category: "Political",
    description: "Features high-intensity loaded language, false dilemmas, and character attacks.",
    text: "The city's dynamic progressive coalition, which has graciously protected families for years, is currently facing a coordinated witch hunt by extremist judges intent on pushing their radical agenda down our throats. Are we going to let these tyrants win?"
  },
  {
    id: "test-2",
    title: "Corporate Eco-Commitment",
    category: "Greenwashing",
    description: "Demonstrates common corporate greenwashing language and vague, unsubstantiated claims.",
    text: "At GlobalLogistics, we care deeply about our beautiful mother earth. That is why our new home-delivery services use a revolutionary, ultra-green packaging tape made from 100% natural, eco-conscious plant fibers. Our corporate family is completely committed to a pure carbon-neutral future."
  },
  {
    id: "test-3",
    title: "Municipal Vote (Neutral Control)",
    category: "Neutral",
    description: "A neutral, factual, and balanced journalistic report. Should return no bias.",
    text: "The municipal council voted 5-3 on Tuesday to approve the new bicycle lane project on Main Street. The construction is scheduled to begin in September, with a total project budget of 2.5 million dollars."
  },
  {
    id: "test-4",
    title: "Budget Proposal Attack",
    category: "Political",
    description: "Shows severe slippery slope arguments and appeals to anonymous authority.",
    text: "The city council's recent budget proposal is a radical attack on our freedom. If we don't stop this disastrous plan immediately, our streets will collapse into total anarchy within weeks. Experts say this is the worst policy in the history of the county."
  },
  {
    id: "test-5",
    title: "Health Breakthrough Hype",
    category: "Neutral",
    description: "Contains sensationalism, card stacking, and rage-bait-like engagement hooks.",
    text: "A secret compound in common lawn weeds has been proven to melt body fat overnight. While Big Pharma desperately tries to suppress this miracle cure to protect their multi-billion dollar profits, thousands of smart patients are already using it. Don't be left in the dark before they ban it forever!"
  }
];

export const TAXONOMY_DETAILS: Record<string, TaxonomyDetail> = {
  LOADED_LANGUAGE: {
    id: "LOADED_LANGUAGE",
    name: "Loaded Language",
    color: "rose",
    bgLight: "bg-rose-50 text-rose-700 border-rose-200",
    bgDark: "bg-rose-950 text-rose-300 border-rose-800",
    border: "border-rose-500",
    definition: "High-intensity, emotionally charged adjectives, verbs, or labels engineered to influence readers' feelings rather than provide objective information.",
    example: "Using words like 'disastrous', 'radical', or 'scheme' instead of 'unfavorable', 'unorthodox', or 'proposal'."
  },
  SENSATIONALISM: {
    id: "SENSATIONALISM",
    name: "Sensationalism",
    color: "amber",
    bgLight: "bg-amber-50 text-amber-700 border-amber-200",
    bgDark: "bg-amber-950 text-amber-300 border-amber-800",
    border: "border-amber-500",
    definition: "Exaggerated, dramatic, or sensational claims intended to provoke shock, excitement, or fear, often overstating the true scope of a situation.",
    example: "Declaring a minor procedural vote as a 'cataclysmic breakdown of local democracy' or 'miracle cure overnight'."
  },
  AD_HOMINEM: {
    id: "AD_HOMINEM",
    name: "Ad Hominem Attack",
    color: "red",
    bgLight: "bg-red-50 text-red-700 border-red-200",
    bgDark: "bg-red-950 text-red-300 border-red-800",
    border: "border-red-500",
    definition: "Attacking an opponent's character, motives, or personal traits rather than refuting the validity of their actual argument.",
    example: "Labeling opponents as 'tyrants', 'extremists', or 'corrupt sellouts' to dismiss their policy views."
  },
  FALSE_DILEMMA: {
    id: "FALSE_DILEMMA",
    name: "False Dilemma",
    color: "purple",
    bgLight: "bg-purple-50 text-purple-700 border-purple-200",
    bgDark: "bg-purple-950 text-purple-300 border-purple-800",
    border: "border-purple-500",
    definition: "Presenting only two alternative options or outcomes as if they are the only possibilities, when in fact intermediate or other options exist.",
    example: "Framing a scenario as 'Either we pass this law immediately, or we let the criminals completely take over our neighborhoods.'"
  },
  SLIPPERY_SLOPE: {
    id: "SLIPPERY_SLOPE",
    name: "Slippery Slope",
    color: "orange",
    bgLight: "bg-orange-50 text-orange-700 border-orange-200",
    bgDark: "bg-orange-950 text-orange-300 border-orange-800",
    border: "border-orange-500",
    definition: "An argument that asserts, without proof, that a relatively small initial step will inevitably trigger a disastrous chain reaction of catastrophe.",
    example: "Claiming that implementing a small bike lane will cause local streets to collapse into total, lawless anarchy in weeks."
  },
  APPEAL_TO_ANONYMITY: {
    id: "APPEAL_TO_ANONYMITY",
    name: "Appeal to Anonymity",
    color: "blue",
    bgLight: "bg-blue-50 text-blue-700 border-blue-200",
    bgDark: "bg-blue-950 text-blue-300 border-blue-800",
    border: "border-blue-500",
    definition: "Citing unnamed 'experts', 'sources', 'critics', or vague groups to validate a controversial claim without providing verifiable credentials or references.",
    example: "Starting a claim with 'Experts say...' or 'Insiders confirm...' without identifying who they are."
  },
  GREENWASHING: {
    id: "GREENWASHING",
    name: "Greenwashing",
    color: "emerald",
    bgLight: "bg-emerald-50 text-emerald-700 border-emerald-200",
    bgDark: "bg-emerald-950 text-emerald-300 border-emerald-800",
    border: "border-emerald-500",
    definition: "Using eco-friendly slogans, natural imagery, or high-intensity green jargon to construct an eco-conscious image without verifiable, factual proof.",
    example: "Marketing standard plastic tape as 'ultra-green revolutionary mother earth fibers' without scientific specifications."
  },
  RAGE_BAIT: {
    id: "RAGE_BAIT",
    name: "Rage Bait / Engagement Hook",
    color: "pink",
    bgLight: "bg-pink-50 text-pink-700 border-pink-200",
    bgDark: "bg-pink-950 text-pink-300 border-pink-800",
    border: "border-pink-500",
    definition: "Language engineered specifically to trigger negative emotions (such as outrage, indignation, or anger) in order to drive clicks, sharing, and viral engagement.",
    example: "Using provocative leading questions like 'Are you going to let these tyrants win?' or demanding action under threat of humiliation."
  },
  CARD_STACKING: {
    id: "CARD_STACKING",
    name: "Card Stacking",
    color: "indigo",
    bgLight: "bg-indigo-50 text-indigo-700 border-indigo-200",
    bgDark: "bg-indigo-950 text-indigo-300 border-indigo-800",
    border: "border-indigo-500",
    definition: "Deliberately omitting critical counter-evidence, balanced viewpoints, or surrounding context in order to present a biased, one-sided narrative.",
    example: "Highlighting only a compound's fat-melting qualities while suppressing its toxic side effects or citing only highly supportive anecdotes."
  }
};
