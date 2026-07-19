export type BiasType =
  | "LOADED_LANGUAGE"
  | "SENSATIONALISM"
  | "AD_HOMINEM"
  | "FALSE_DILEMMA"
  | "SLIPPERY_SLOPE"
  | "APPEAL_TO_ANONYMITY"
  | "GREENWASHING"
  | "RAGE_BAIT"
  | "CARD_STACKING";

export interface Finding {
  exact_quote: string;
  bias_type: BiasType;
  severity: "LOW" | "MED" | "HIGH";
  tooltip_explanation: string;
}

export interface AnalysisResult {
  findings: Finding[];
  summary: string;
  objectivityScore: number;
}

export interface SampleCase {
  id: string;
  title: string;
  category: "Political" | "Greenwashing" | "Neutral" | "Custom";
  text: string;
  description: string;
}

export interface TaxonomyDetail {
  id: BiasType;
  name: string;
  color: string;
  bgLight: string;
  bgDark: string;
  border: string;
  definition: string;
  example: string;
}
