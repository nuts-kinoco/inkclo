# INKCLO Project Handover

## プロジェクト概要
INKCLOは『スプラトゥーン3』のギア（アタマ・フク・クツ）を組み合わせて、お洒落なカラーコーディネートを作成・保存・共有できるWebアプリケーションです。

## 技術スタック
- **Framework**: Next.js 15 (App Router, Turbopack)
- **Styling**: Tailwind CSS v4 (CSS VariablesベースのDark Mode対応)
- **State Management**: Zustand (`src/store/builderStore.ts`)
- **Icons**: Lucide React
- **Data**: `src/lib/data/gears.json` (ローカルJSONデータベース)

## これまでのスプリント (Sprint 1 ~ 7) の成果

1. **Sprint 1-4 (基礎機能)**
   - ギアのカタログUI（アタマ・フク・クツ別）
   - コーディネートプレビュー（キャンバス）
   - JSONデータに基づくギアの一覧表示、カテゴリ切り替え機能
   - ギアの色情報（`dominantColor`, `palette`）を用いたDeltaE色差検索機能
   - 画像のエクスポート機能（`html-to-image`）

2. **Sprint 5 (Color Coordinate Assistant v1)**
   - 現在のコーディネートから加重平均色（Base Color）を計算。
   - `Monotone`, `Analogous`, `Complementary` の3つの色彩理論に基づく「おすすめギア」を提案する推薦エンジン (`src/lib/recommendation/engine.ts`)。
   - MMR（Maximal Marginal Relevance）を用いた推薦候補の多様性確保。

3. **Sprint 6 (ブランドフィルター & Pagination)**
   - スプラトゥーン3のブランドロゴ画像をスクレイピングし、PNG保存 (`scripts/scrapeBrands.ts`)。
   - 複数選択可能なブランドロゴフィルターUIとページネーション（表示件数切り替え機能）。

4. **Sprint 7 (Tag Foundation & Admin Tagger & Triadic)**
   - スタイル推薦（スポーティ、ストリート等）への進化に向けたタグ基盤の構築。
   - `autoTags` (スクリプト事前生成) と `manualTags` の分離、および統合アクセス。
   - `/admin/tags` における超高速キーボード操作対応の手動タグ付けUI。
   - Next.js API Route (`/api/gears/update`) を用いた `gears.json` の直接上書き保存と自動バックアップ機能。
   - 推薦エンジンに「トライアド (Triadic)」を追加し、カルーセルUIで切り替え可能に。

## 新しいAIへの引き継ぎプロンプト（例）
新しいチャットを開始した際、AIに以下のように指示してください：

```text
INKCLOプロジェクトの続きをお願いします。
プロジェクトルートにある `HANDOVER.md` を読んで、現在のアーキテクチャや技術スタック、これまでのSprint 1〜7で実装された内容を把握してください。
現在はスタイルベースの推薦システムへ向けてタグ基盤（autoTags/manualTags）が完成したところです。
次のSprint要件を渡すので、それに従って実装を進めてください。
```

## 現在の課題・注意事項
- Next.js Turbopackを使用しているため、`gears.json` への直接書き込み時にHMRエラーが出ることがありましたが、`route.ts` にて atomic write（一時ファイル書き込み後のリネーム）で対策済みです。
- Tailwind v4 を使用しているため、ダークモードは `tailwind.config.ts` ではなく `src/app/globals.css` の `@custom-variant dark (&:where(.dark, .dark *));` で定義されています。
- 画像は `html-to-image` でキャプチャするため、親要素のレイアウトや余白（Padding）の影響を受けやすい点に注意してください。
