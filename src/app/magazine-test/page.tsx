import './magazine-test.css';

export default function MagazineTestPage() {
    return (
        <div className="magazine-test-container">
            <div className="magazine-wrapper">
                <header className="magazine-header">
                    <p className="catch-copy">イカした自分を、もっと楽しもう。</p>
                    <h1 className="magazine-title">INKCLO</h1>
                    <h2 className="special-feature">初期装備とは言わせない。26SS「わかばイカT」本気の垢抜けスタイル</h2>
                </header>

                <section className="look-block">
                    <div className="visual-area">
                        {/* メインビジュアル: 適当なプレースホルダー画像を使用 */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="https://picsum.photos/800/600?random=1" alt="メインビジュアル" className="main-img" />

                        <div className="sub-img-wrapper pos-1">
                            {/* サブ画像1 */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://picsum.photos/400/400?random=2" alt="サブ1" className="sub-img" />
                        </div>

                        <div className="sub-img-wrapper pos-2">
                            {/* サブ画像2 */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="https://picsum.photos/400/400?random=3" alt="サブ2" className="sub-img" />
                            <span className="comic-effect">Slide!</span>
                        </div>
                    </div>

                    <div className="text-area">
                        <h3 className="look-title">原色を纏うミニマリズム。<br />重厚なスライドを支える、計算されたストリート</h3>
                        <p className="look-text">
                            「ケルビン525」の無骨なシルエットに、鮮烈な三原色を合わせたストリートスタイル。この配色と軽快さは、決して単なる遊び心ではない。<br /><br />
                            特筆すべきは足元の「シーホースHi レッド」。大地を深く蹴り込むケルビン特有の重厚なスライドにおいて、ハイカットのホールド感は前線での確実なステップを約束する。また、視界を確保する「ビバレッジキャップ」の後ろ被りと、「わかばイカT」の極限まで装飾を排したミニマリズムは、機動力の向上という機能美に直結している。<br /><br />
                            実用性を徹底して追求した原色の装いが、前線を荒らす激しい戦いを、どこまでも洗練されたパフォーマンスへと昇華させている。
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
