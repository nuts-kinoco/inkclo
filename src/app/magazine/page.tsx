import Link from 'next/link';
import { Inter, Noto_Sans_JP } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans",
  display: "swap",
});

export default function MagazinePage() {
  return (
    <div className={`${inter.variable} ${notoSansJP.variable} font-sans min-h-screen bg-stone-50 dark:bg-gray-950 pb-20 text-slate-800 dark:text-slate-200 pt-6 transition-colors duration-300`} style={{ fontFamily: 'var(--font-inter), var(--font-noto-sans), sans-serif' }}>
      {/* Header Space */}
      <div className="max-w-4xl mx-auto px-4">

        {/* Magazine Cover / Mockup Image */}
        <section className="mb-16">
          <div className="rounded-2xl overflow-hidden shadow-xl bg-white dark:bg-gray-900 flex items-center justify-center min-h-[300px] transition-colors duration-300">
            {/* User's 1st image goes here */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/magazine/mock.png"
              alt="INKCLO 2026 SS Fashion Report"
              className="w-full h-auto object-cover"
            />
          </div>
        </section>

        {/* Feature Section: Snap 1 */}
        <section className="mb-16 bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-10 shadow-sm border border-stone-100 dark:border-gray-800 transition-colors duration-300">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-full md:w-1/2 overflow-hidden rounded-2xl shadow-md relative aspect-video md:aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {/* User's 2nd image goes here */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/magazine/snap1.png"
                alt="Coordinate Snap 1"
                className="w-full h-full object-cover absolute inset-0"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <span className="text-pink-500 dark:text-pink-400 font-medium tracking-[0.2em] text-xs mb-2">SNAP 01</span>
              <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-4 text-slate-900 dark:text-white">スライドで刻む、最前線の切り込み隊長</h2>
              <div className="w-12 h-0.5 bg-pink-300 dark:bg-pink-400 mb-6"></div>
              <div className="space-y-4 text-stone-600 dark:text-stone-400 leading-relaxed text-sm md:text-base font-light">
                <p>
                  <strong>Weapon & Gear Synergy</strong><br />
                  <em className="text-pink-600 dark:text-pink-300">「クアッドホッパー × ストリートスポーティ」</em>
                </p>
                <p>
                  前線で4回スライドを駆使して暴れ回るクアッドホッパーには、カムバックや復活時間短縮といったアグレッシブなギアパワーが必須。
                  今回の「エンペーサーAg」を軸とした軽快な足元と、「アロメスローガンT」のラフなストリート感は、相手のインクを掻き乱すクアッドの動きに抜群の説得力を持たせる。
                </p>
                <p>
                  見た目の軽やかさとは裏腹に、泥臭く前線を維持するストイックなプレイヤーにこそふさわしい、26SSの最注目スタイルだ。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Section: Snap 2 */}
        <section className="mb-16 bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-10 shadow-sm border border-stone-100 dark:border-gray-800 transition-colors duration-300">
          <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
            <div className="w-full md:w-1/2 overflow-hidden rounded-2xl shadow-md relative aspect-video md:aspect-[4/3] bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              {/* User's 3rd image goes here */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/magazine/snap2.png"
                alt="Coordinate Snap 2"
                className="w-full h-full object-cover absolute inset-0"
              />
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center">
              <span className="text-blue-500 dark:text-blue-400 font-medium tracking-[0.2em] text-xs mb-2">SNAP 02</span>
              <h2 className="text-2xl md:text-3xl font-light tracking-tight mb-4 text-slate-900 dark:text-white">プールサイドに輝く笑顔</h2>
              <div className="w-12 h-0.5 bg-blue-300 dark:bg-blue-400 mb-6"></div>
              <div className="space-y-4 text-stone-600 dark:text-stone-400 leading-relaxed text-sm md:text-base font-light">
                <p>
                  <strong>Style & Environment Synergy</strong><br />
                  <em className="text-blue-600 dark:text-blue-300">「マヒマヒリゾート＆スパ × サマーリラックス」</em>
                </p>
                <p>
                  プールへ最速で飛び込めるクアッドならではのステージで1枚。
                  夏の陽射しが反射するプールサイドでも、モノトーンを基調としたこのコーデなら涼しげな印象をキープ。
                  「キングフリップメッシュ」から覗くビビッドなインクカラーが、全身のアクセントとして完璧に機能している。
                </p>
                <p>
                  激しいバトルの中でもリゾート感を楽しむ余裕――それこそが、トッププレイヤーの持つオーラへと繋がっていく。
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center mt-12 mb-8">
          <Link href="/" className="inline-block bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg">
            自分だけのコーデを作る
          </Link>
        </div>

      </div>
    </div>
  );
}
