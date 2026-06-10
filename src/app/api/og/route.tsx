import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import gearsData from '@/lib/data/gears';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const h = searchParams.get('h');
    const b = searchParams.get('b');
    const s = searchParams.get('s');

    const origin = new URL(request.url).origin;

    const headGear = gearsData.gears.find(g => g.id === h);
    const bodyGear = gearsData.gears.find(g => g.id === b);
    const shoesGear = gearsData.gears.find(g => g.id === s);

    const getImageUrl = (gear: any) => {
      if (!gear) return null;
      return `${origin}${gear.imagePath}`;
    };

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0f172a',
            backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)',
            fontFamily: 'sans-serif',
            color: '#f8fafc',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              borderRadius: 48,
              padding: '60px 80px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <h1 style={{ fontSize: 56, fontWeight: 900, marginBottom: 50, letterSpacing: '-0.05em' }}>
              INKCLO Coordinate
            </h1>
            
            <div style={{ display: 'flex', gap: 50 }}>
              {/* Head */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 220, height: 220, backgroundColor: 'white', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, marginBottom: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                  {headGear ? <img src={getImageUrl(headGear)!} width={172} height={172} style={{ objectFit: 'contain' }} /> : <div style={{ color: '#ccc', fontSize: 24 }}>No Gear</div>}
                </div>
                <span style={{ fontSize: 28, fontWeight: 'bold' }}>{headGear?.name || '---'}</span>
                <span style={{ fontSize: 20, color: '#94a3b8', marginTop: 8 }}>{headGear?.brand.brandName || ''}</span>
              </div>
              
              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 220, height: 220, backgroundColor: 'white', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, marginBottom: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                  {bodyGear ? <img src={getImageUrl(bodyGear)!} width={172} height={172} style={{ objectFit: 'contain' }} /> : <div style={{ color: '#ccc', fontSize: 24 }}>No Gear</div>}
                </div>
                <span style={{ fontSize: 28, fontWeight: 'bold' }}>{bodyGear?.name || '---'}</span>
                <span style={{ fontSize: 20, color: '#94a3b8', marginTop: 8 }}>{bodyGear?.brand.brandName || ''}</span>
              </div>

              {/* Shoes */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 220, height: 220, backgroundColor: 'white', borderRadius: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, marginBottom: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
                  {shoesGear ? <img src={getImageUrl(shoesGear)!} width={172} height={172} style={{ objectFit: 'contain' }} /> : <div style={{ color: '#ccc', fontSize: 24 }}>No Gear</div>}
                </div>
                <span style={{ fontSize: 28, fontWeight: 'bold' }}>{shoesGear?.name || '---'}</span>
                <span style={{ fontSize: 20, color: '#94a3b8', marginTop: 8 }}>{shoesGear?.brand.brandName || ''}</span>
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
