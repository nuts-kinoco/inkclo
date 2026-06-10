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
  name: string;
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
