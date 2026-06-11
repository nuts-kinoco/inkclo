export type GearCategory = "head" | "body" | "shoes";

export interface ColorProfile {
  color: string;
  ratio: number;
}

export interface Gear {
  id: string;
  name: string;
  category: GearCategory;
  brand: {
    brandId: string;
    brandName: string;
  };
  imagePath: string;
  dominantColor: string;
  palette: ColorProfile[];
  autoTags?: string[];
  manualTags?: string[];
  tags?: string[];
}

export interface Coordinate {
  headId?: string;
  bodyId?: string;
  shoesId?: string;
}

export interface CoordinatePreset {
  id: string;
  title?: string;
  headId?: string;
  bodyId?: string;
  shoesId?: string;
  createdAt: string;
}

export interface CoordinatePayload {
  h?: string;
  b?: string;
  s?: string;
  t?: string; // title (optional)
}

export interface RecommendationGroup {
  id: string;
  title: string;
  description: string;
  icon?: string;
  priority?: number;
  type: string;
  items: Gear[];
}

export interface RecommendationContext {
  baseColor: string;
  targetCategory: GearCategory;
  allGears: Gear[];
  coordinate: Record<string, string | null>;
}

export interface RecommendationStrategy {
  generate: (context: RecommendationContext) => RecommendationGroup | null;
}

// ─── Scoring ───
export type Rank = 'X' | 'S+' | 'S' | 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-';

export interface ScoreReason {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  impact: number;
}

export interface ScoreAxis {
  value: number;
  rank: Rank;
  label: string;
  icon: string;
  reasons: ScoreReason[];
}

export interface CoordinateScore {
  totalScore: number;
  totalRank: Rank;
  axes: {
    color: ScoreAxis;
    style: ScoreAxis;
    season: ScoreAxis;
    balance: ScoreAxis;
  };
  weights: ScoreWeights;
  season: Season;
}

export interface ScoreWeights {
  color: number;
  style: number;
  season: number;
  balance: number;
}

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface ComparisonCandidate {
  gear: Gear;
  score: CoordinateScore;
  isBest?: boolean;
}
