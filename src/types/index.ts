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
