const satori = require('satori');
const sharp = require('sharp');

module.exports = async (req, res) => {
  try {
    const html = req.query.html || 'Test';
    
    const svg = await satori(
      {
        type: 'div',
        props: {
          style: {
            width: '600px',
            height: '500px',
            backgroundColor: '#0f1923',
            color: 'white',
            fontFamily: 'Arial',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
          },
          children: html
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
};
