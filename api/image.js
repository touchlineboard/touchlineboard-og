import satori from 'satori';
import sharp from 'sharp';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  try {
    const { type, data } = req.query;
    const d = data ? JSON.parse(decodeURIComponent(data)) : {};

    const fontRes = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff');
    const fontData = await fontRes.arrayBuffer();

    let card;

    if (type === 'match') {
      card = {
        type: 'div',
        props: {
          style: { width: 600, height: 500, backgroundColor: '#0f1923', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter', color: 'white', padding: 30 },
          children: [
            { type: 'div', props: { style: { fontSize: 14, color: '#888', marginBottom: 20 }, children: d.league || '' } },
            { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 30, marginBottom: 20 } , children: [
              { type: 'div', props: { style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' }, children: d.homeTeam || '' } },
              { type: 'div', props: { style: { fontSize: 48, fontWeight: 'bold', color: '#00ff88' }, children: `${d.homeGoals ?? 0} - ${d.awayGoals ?? 0}` } },
              { type: 'div', props: { style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' }, children: d.awayTeam || '' } },
            ]}},
            { type: 'div', props: { style: { fontSize: 12, color: '#666' }, children: d.venue || '' } },
            { type: 'div', props: { style: { fontSize: 10, color: '#444', marginTop: 20 }, children: '@TouchlineBoard' } },
          ]
        }
      };
    } else {
      card = {
        type: 'div',
        props: {
          style: { width: 600, height: 500, backgroundColor: '#0f1923', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter', color: 'white' },
          children: String(d.text || 'TouchlineBoard')
        }
      };
    }

    const svg = await satori(card, {
      width: 600,
      height: 500,
      fonts: [{ name: 'Inter', data: fontData, style: 'normal', weight: 400 }]
    });

    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
