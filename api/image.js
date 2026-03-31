import satori from 'satori';
import sharp from 'sharp';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  try {
    const { type, data } = req.query;
    const d = data ? JSON.parse(decodeURIComponent(data)) : {};
    
    const fontRes = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-ext-400-normal.woff');
    const fontData = await fontRes.arrayBuffer();
    
    const stats = d.stats || [];
    
    const card = {
      type: 'div',
      props: {
        style: {
          width: 600,
          height: 630,
          backgroundColor: '#0f1923',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Noto Sans',
          color: 'white',
          padding: 30
        },
        children: [
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', marginBottom: 15 },
              children: { type: 'span', props: { style: { fontSize: 14, color: '#888' }, children: d.league || 'League' } }
            }
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 15 },
              children: [
                { type: 'span', props: { style: { fontSize: 20, fontWeight: 'bold', width: 150, textAlign: 'center' }, children: d.homeTeam || '' } },
                { type: 'span', props: { style: { fontSize: 42, fontWeight: 'bold', color: '#00ff88' }, children: `${d.homeGoals ?? 0} - ${d.awayGoals ?? 0}` } },
                { type: 'span', props: { style: { fontSize: 20, fontWeight: 'bold', width: 150, textAlign: 'center' }, children: d.awayTeam || '' } }
              ]
            }
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
              children: { type: 'span', props: { style: { fontSize: 12, color: '#666' }, children: d.venue || '' } }
            }
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', backgroundColor: '#1a2530', borderRadius: 10, padding: 15, flex: 1 },
              children: stats.slice(0, 6).map(stat => ({
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', marginBottom: 12 },
                  children: [
                    { type: 'span', props: { style: { width: 45, fontSize: 14, fontWeight: 'bold', color: '#00ff88' }, children: String(stat.home) } },
                    { type: 'div', props: { style: { display: 'flex', flex: 1, height: 6, backgroundColor: '#2a3540', borderRadius: 3, overflow: 'hidden' }, children: [
                      { type: 'div', props: { style: { width: `${stat.homePercent}%`, height: 6, backgroundColor: '#00ff88' }, children: '' } }
                    ] } },
                    { type: 'span', props: { style: { width: 80, fontSize: 11, color: '#888', textAlign: 'center' }, children: stat.label } },
                    { type: 'div', props: { style: { display: 'flex', flex: 1, height: 6, backgroundColor: '#2a3540', borderRadius: 3, overflow: 'hidden', justifyContent: 'flex-end' }, children: [
                      { type: 'div', props: { style: { width: `${stat.awayPercent}%`, height: 6, backgroundColor: '#ff4466' }, children: '' } }
                    ] } },
                    { type: 'span', props: { style: { width: 45, fontSize: 14, fontWeight: 'bold', color: '#ff4466', textAlign: 'right' }, children: String(stat.away) } }
                  ]
                }
              }))
            }
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingTop: 10 },
              children: { type: 'span', props: { style: { fontSize: 10, color: '#444' }, children: '@TouchlineBoard' } }
            }
          }
        ]
      }
    };
    
    const svg = await satori(card, {
      width: 600,
      height: 630,
      fonts: [{ name: 'Noto Sans', data: fontData, style: 'normal', weight: 400 }]
    });
    
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.send(png);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
