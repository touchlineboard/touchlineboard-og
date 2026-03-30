export default async function handler(req, res) {
  try {
    const { default: satori } = await import('satori');
    const sharp = require('sharp');
    
    const html = req.query.html || 'Test';
    
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: 600,
            height: 500,
            backgroundColor: '#0f1923',
            color: 'white',
            padding: 20,
            display: 'flex',
          },
          children: String(html)
        }
      },
      {
        width: 600,
        height: 500,
        fonts: []
      }
    );

    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    
    res.setHeader('Content-Type', 'image/png');
    res.send(png);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
