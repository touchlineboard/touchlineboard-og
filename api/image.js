import satori from 'satori';
import sharp from 'sharp';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  try {
    const html = req.query.html || 'Test';
    
    const fontRes = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.8/files/inter-latin-400-normal.woff2');
    const fontData = await fontRes.arrayBuffer();

    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: 600,
            height: 500,
            backgroundColor: '#0f1923',
            color: 'white',
            fontFamily: 'Inter',
            padding: 20,
            display: 'flex',
          },
          children: String(html)
        }
      },
      {
        width: 600,
        height: 500,
        fonts: [{
          name: 'Inter',
          data: fontData,
          style: 'normal',
          weight: 400
        }]
      }
    );

    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
