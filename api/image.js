import satori from 'satori';
import sharp from 'sharp';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  try {
    const html = req.query.html || 'Test';
    
    const fontResponse = await fetch('https://github.com/google/fonts/raw/main/ofl/inter/Inter%5Bslnt%2Cwght%5D.ttf');
    const fontData = await fontResponse.arrayBuffer();

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
          style: 'normal'
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
