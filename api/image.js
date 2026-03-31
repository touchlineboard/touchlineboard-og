import satori from 'satori';
import sharp from 'sharp';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  try {
    const { type, data } = req.query;
    const d = data ? JSON.parse(decodeURIComponent(data)) : {};
    
    // Türkçe karakter destekli font
    const fontRes = await fetch('https://cdn.jsdelivr.net/fontsource/fonts/noto-sans@latest/latin-ext-400-normal.woff');
    const fontData = await fontRes.arrayBuffer();
    
    let card;
    
    if (type === 'stats' || type === 'match') {
      const stats = d.stats || [];
      
      card = {
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
            // Header - Lig
            {
              type: 'div',
              props: {
                style: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 15 },
                children: d.league || 'League'
              }
            },
            // Takımlar ve Skor
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 15 },
                children: [
                  // Ev Takımı
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 150 },
                      children: [
                        d.homeLogo ? {
                          type: 'img',
                          props: { src: d.homeLogo, width: 60, height: 60, style: { marginBottom: 8 } }
                        } : null,
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
                            children: d.homeTeam || ''
                          }
                        }
                      ].filter(Boolean)
                    }
                  },
                  // Skor
                  {
                    type: 'div',
                    props: {
                      style: { fontSize: 42, fontWeight: 'bold', color: '#00ff88' },
                      children: `${d.homeGoals ?? 0} - ${d.awayGoals ?? 0}`
                    }
                  },
                  // Deplasman Takımı
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 150 },
                      children: [
                        d.awayLogo ? {
                          type: 'img',
                          props: { src: d.awayLogo, width: 60, height: 60, style: { marginBottom: 8 } }
                        } : null,
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
                            children: d.awayTeam || ''
                          }
                        }
                      ].filter(Boolean)
                    }
                  }
                ]
              }
            },
            // Stad
            {
              type: 'div',
              props: {
                style: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 20 },
                children: d.venue ? `📍 ${d.venue}` : ''
              }
            },
            // İstatistikler
            ...(stats.length > 0 ? [
              {
                type: 'div',
                props: {
                  style: {
                    backgroundColor: '#1a2530',
                    borderRadius: 10,
                    padding: 15,
                    flex: 1
                  },
                  children: stats.slice(0, 6).map(stat => ({
                    type: 'div',
                    props: {
                      style: { display: 'flex', alignItems: 'center', marginBottom: 10 },
                      children: [
                        { type: 'div', props: { style: { width: 50, fontSize: 14, fontWeight: 'bold', color: '#00ff88' }, children: String(stat.home) } },
                        {
                          type: 'div',
                          props: {
                            style: { flex: 1, display: 'flex', alignItems: 'center', gap: 4 },
                            children: [
                              { type: 'div', props: { style: { flex: stat.homePercent || 50, height: 6, backgroundColor: '#00ff88', borderRadius: 3 }, children: '' } },
                              { type: 'div', props: { style: { fontSize: 11, color: '#888', width: 100, textAlign: 'center' }, children: stat.label } },
                              { type: 'div', props: { style: { flex: stat.awayPercent || 50, height: 6, backgroundColor: '#ff4466', borderRadius: 3 }, children: '' } }
                            ]
                          }
                        },
                        { type: 'div', props: { style: { width: 50, fontSize: 14, fontWeight: 'bold', color: '#ff4466', textAlign: 'right' }, children: String(stat.away) } }
                      ]
                    }
                  }))
                }
              }
            ] : []),
            // Footer
            {
              type: 'div',
              props: {
                style: { fontSize: 10, color: '#444', textAlign: 'center', marginTop: 'auto', paddingTop: 10 },
                children: '@TouchlineBoard'
              }
            }
          ]
        }
      };
    } else {
      card = {
        type: 'div',
        props: {
          style: { width: 600, height: 630, backgroundColor: '#0f1923', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Noto Sans', color: 'white' },
          children: String(d.text || 'TouchlineBoard')
        }
      };
    }
    
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
