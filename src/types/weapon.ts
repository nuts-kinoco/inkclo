export type WeaponClass =
  | 'shooter'     // シューター
  | 'blaster'     // ブラスター
  | 'charger'     // チャージャー
  | 'slosher'     // スロッシャー
  | 'splatling'   // スピナー
  | 'dualies'     // マニューバー
  | 'brella'      // シェルター
  | 'brush'       // フデ
  | 'roller'      // ローラー
  | 'stringer'    // ストリンガー
  | 'splatana';   // ワイパー

export interface WeaponPalette {
  color: string;
  ratio: number; // 0-1 (合計が必ず1.0になるように調整)
}

export interface Weapon {
  id: string;                    // e.g. "weapon-001"
  name: string;                  // e.g. "わかばシューター"
  weaponClass: WeaponClass;      // e.g. "shooter"
  subWeapon: string;             // e.g. "スプラッシュボム"
  specialWeapon: string;         // e.g. "グレートバリア"
  imagePath: string;             // e.g. "/weapons/weapon-001.png"
  
  dominantColor: string;         // hex e.g. "#7CFC00"
  palette: WeaponPalette[];      // 上位5色のパレット
  styleTags: string[];           // 将来的にWAIで使用
}
