import satori from 'satori';
import sharp from 'sharp';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  try {
    const { type, data } = req.query;
    const d = data ? JSON.parse(decodeURIComponent(data)) : {};
    
    // Inter font - daha güvenilir
    const fontRes = await fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff');
    const fontData = await fontRes.arrayBuffer();
    
    const fontBoldRes = await fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff');
    const fontBoldData = await fontBoldRes.arrayBuffer();
    
    const stats = d.stats || [];
    
    const card = {
      type: 'div',
      props: {
        style: {
          width: 600,
          height: 680,
          background: 'linear-gradient(180deg, #0a0f14 0%, #1a252e 100%)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter',
          color: 'white',
          padding: 0,
          position: 'relative'
        },
        children: [
          // Top accent bar
          {
            type: 'div',
            props: {
              style: { display: 'flex', width: '100%', height: 4, background: 'linear-gradient(90deg, #00ff88 0%, #00cc6a 50%, #ff4466 100%)' },
              children: ''
            }
          },
          // Header with logo
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 30px 10px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: 8 },
                    children: [
                      { type: 'div', props: { style: { width: 8, height: 8, backgroundColor: '#00ff88', borderRadius: '50%' }, children: '' } },
                      { type: 'span', props: { style: { fontSize: 12, fontWeight: 'bold', color: '#00ff88', letterSpacing: 2 }, children: 'TOUCHLINEBOARD' } }
                    ]
                  }
                },
                { type: 'span', props: { style: { fontSize: 11, color: '#666', textTransform: 'uppercase', letterSpacing: 1 }, children: 'Match Stats' } }
              ]
            }
          },
          // League
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', padding: '10px 0' },
              children: {
                type: 'span',
                props: {
                  style: { fontSize: 13, color: '#888', textTransform: 'uppercase', letterSpacing: 3 },
                  children: d.league || 'League'
                }
              }
            }
          },
          // Teams and Score
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '15px 30px', gap: 25 },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 160 },
                    children: [
                      { type: 'span', props: { style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', lineHeight: 1.2 }, children: d.homeTeam || 'Home' } }
                    ]
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: 12 },
                    children: [
                      { type: 'span', props: { style: { fontSize: 52, fontWeight: 'bold', color: '#00ff88' }, children: String(d.homeGoals ?? 0) } },
                      { type: 'span', props: { style: { fontSize: 28, color: '#444' }, children: '-' } },
                      { type: 'span', props: { style: { fontSize: 52, fontWeight: 'bold', color: '#ff4466' }, children: String(d.awayGoals ?? 0) } }
                    ]
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 160 },
                    children: [
                      { type: 'span', props: { style: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', lineHeight: 1.2 }, children: d.awayTeam || 'Away' } }
                    ]
                  }
                }
              ]
            }
          },
          // Venue
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', marginBottom: 20 },
              children: { type: 'span', props: { style: { fontSize: 11, color: '#555' }, children: d.venue || '' } }
            }
          },
          // Stats Container
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', margin: '0 25px', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: '20px 25px', flex: 1, border: '1px solid rgba(255,255,255,0.05)' },
              children: stats.slice(0, 6).map((stat, i) => ({
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', marginBottom: i < 5 ? 16 : 0 },
                  children: [
                    { type: 'span', props: { style: { width: 40, fontSize: 15, fontWeight: 'bold', color: '#00ff88' }, children: String(stat.home) } },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flex: 1, alignItems: 'center', gap: 8, margin: '0 10px' },
                        children: [
                          { type: 'div', props: { style: { display: 'flex', flex: 1, justifyContent: 'flex-end' }, children: { type: 'div', props: { style: { width: `${stat.homePercent}%`, height: 8, backgroundColor: '#00ff88', borderRadius: 4 }, children: '' } } } },
                          { type: 'span', props: { style: { width: 80, fontSize: 10, color: '#666', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }, children: stat.label } },
                          { type: 'div', props: { style: { display: 'flex', flex: 1 }, children: { type: 'div', props: { style: { width: `${stat.awayPercent}%`, height: 8, backgroundColor: '#ff4466', borderRadius: 4 }, children: '' } } } }
                        ]
                      }
                    },
                    { type: 'span', props: { style: { width: 40, fontSize: 15, fontWeight: 'bold', color: '#ff4466', textAlign: 'right' }, children: String(stat.away) } }
                  ]
                }
              }))
            }
          },
          // Footer
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px 0', gap: 6 },
              children: [
                { type: 'span', props: { style: { fontSize: 10, color: '#333' }, children: 'Powered by' } },
                { type: 'span', props: { style: { fontSize: 10, color: '#00ff88', fontWeight: 'bold' }, children: 'TouchlineBoard' } }
              ]
            }
          }
        ]
      }
    };
    
    const svg = await satori(card, {
      width: 600,
      height: 680,
      fonts: [
        { name: 'Inter', data: fontData, style: 'normal', weight: 400 },
        { name: 'Inter', data: fontBoldData, style: 'normal', weight: 700 }
      ]
    });
    
    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.send(png);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
