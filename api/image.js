import satori from 'satori';
import sharp from 'sharp';

export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  try {
    const { type, data } = req.query;
    const d = data ? JSON.parse(decodeURIComponent(data)) : {};
    
    const fontRes = await fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff');
    const fontData = await fontRes.arrayBuffer();
    
    const fontBoldRes = await fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff');
    const fontBoldData = await fontBoldRes.arrayBuffer();
    
    const stats = d.stats || [];
    const homeWin = (d.homeGoals ?? 0) > (d.awayGoals ?? 0);
    const awayWin = (d.awayGoals ?? 0) > (d.homeGoals ?? 0);
    const isDraw = (d.homeGoals ?? 0) === (d.awayGoals ?? 0);
    
    const card = {
      type: 'div',
      props: {
        style: {
          width: 600,
          height: 680,
          background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Inter',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        },
        children: [
          // Background decorative elements
          {
            type: 'div',
            props: {
              style: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)', display: 'flex' },
              children: ''
            }
          },
          {
            type: 'div',
            props: {
              style: { position: 'absolute', bottom: -80, left: -80, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,68,102,0.06) 0%, transparent 70%)', display: 'flex' },
              children: ''
            }
          },
          // Top bar with gradient
          {
            type: 'div',
            props: {
              style: { display: 'flex', width: '100%', height: 3, background: 'linear-gradient(90deg, #00ff88, #00d4ff, #ff4466)' },
              children: ''
            }
          },
          // Header
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: 10 },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)', alignItems: 'center', justifyContent: 'center' },
                          children: { type: 'span', props: { style: { fontSize: 14, fontWeight: 'bold', color: '#000' }, children: 'T' } }
                        }
                      },
                      { type: 'span', props: { style: { fontSize: 11, fontWeight: 'bold', color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase' }, children: 'TouchlineBoard' } }
                    ]
                  }
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', padding: '6px 14px', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' },
                    children: { type: 'span', props: { style: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }, children: 'Full Time' } }
                  }
                }
              ]
            }
          },
          // League badge
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', marginTop: 5 },
              children: {
                type: 'div',
                props: {
                  style: { display: 'flex', padding: '8px 20px', borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' },
                  children: { type: 'span', props: { style: { fontSize: 12, color: '#aaa', letterSpacing: 2, textTransform: 'uppercase' }, children: d.league || 'League' } }
                }
              }
            }
          },
          // Score section
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '30px 20px', gap: 20 },
              children: [
                // Home team
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 170, height: 60 },
                    children: [
                      { type: 'span', props: { style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: homeWin ? '#fff' : '#888' }, children: d.homeTeam || 'Home' } }
                    ]
                  }
                },
                // Score box
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: 8, padding: '15px 25px', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' },
                    children: [
                      { type: 'span', props: { style: { fontSize: 48, fontWeight: 'bold', color: homeWin ? '#fff' : (isDraw ? '#fff' : '#666') }, children: String(d.homeGoals ?? 0) } },
                      { type: 'span', props: { style: { fontSize: 24, color: '#333', margin: '0 5px' }, children: ':' } },
                      { type: 'span', props: { style: { fontSize: 48, fontWeight: 'bold', color: awayWin ? '#fff' : (isDraw ? '#fff' : '#666') }, children: String(d.awayGoals ?? 0) } }
                    ]
                  }
                },
                // Away team
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 170, height: 60 },
                    children: [
                      { type: 'span', props: { style: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: awayWin ? '#fff' : '#888' }, children: d.awayTeam || 'Away' } }
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
              children: { type: 'span', props: { style: { fontSize: 11, color: '#555' }, children: d.venue ? `📍 ${d.venue}` : '' } }
            }
          },
          // Stats section
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', margin: '0 24px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: '22px 24px', flex: 1, border: '1px solid rgba(255,255,255,0.05)' },
              children: [
                // Stats header
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', justifyContent: 'center', marginBottom: 18 },
                    children: { type: 'span', props: { style: { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 2 }, children: 'Match Statistics' } }
                  }
                },
                // Stats rows
                ...stats.slice(0, 6).map((stat, i) => {
                  const homeNum = parseFloat(stat.home) || 0;
                  const awayNum = parseFloat(stat.away) || 0;
                  const homeColor = homeNum > awayNum ? '#00ff88' : (homeNum < awayNum ? '#ff4466' : '#888');
                  const awayColor = awayNum > homeNum ? '#00ff88' : (awayNum < homeNum ? '#ff4466' : '#888');
                  
                  return {
                    type: 'div',
                    props: {
                      style: { display: 'flex', alignItems: 'center', marginBottom: i < 5 ? 14 : 0, height: 28 },
                      children: [
                        { type: 'span', props: { style: { width: 36, fontSize: 14, fontWeight: 'bold', color: homeColor, textAlign: 'left' }, children: String(stat.home) } },
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', flex: 1, alignItems: 'center', margin: '0 12px', gap: 10 },
                            children: [
                              {
                                type: 'div',
                                props: {
                                  style: { display: 'flex', flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, justifyContent: 'flex-end', overflow: 'hidden' },
                                  children: { type: 'div', props: { style: { width: `${stat.homePercent}%`, height: '100%', backgroundColor: homeColor, borderRadius: 3 }, children: '' } }
                                }
                              },
                              { type: 'span', props: { style: { width: 80, fontSize: 9, color: '#666', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.2 }, children: stat.label } },
                              {
                                type: 'div',
                                props: {
                                  style: { display: 'flex', flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
                                  children: { type: 'div', props: { style: { width: `${stat.awayPercent}%`, height: '100%', backgroundColor: awayColor, borderRadius: 3 }, children: '' } }
                                }
                              }
                            ]
                          }
                        },
                        { type: 'span', props: { style: { width: 36, fontSize: 14, fontWeight: 'bold', color: awayColor, textAlign: 'right' }, children: String(stat.away) } }
                      ]
                    }
                  };
                })
              ]
            }
          },
          // Footer
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px 0', gap: 6 },
              children: [
                { type: 'span', props: { style: { fontSize: 9, color: '#444' }, children: 'Generated by' } },
                { type: 'span', props: { style: { fontSize: 9, color: '#00ff88', fontWeight: 'bold' }, children: 'TouchlineBoard' } },
                { type: 'span', props: { style: { fontSize: 9, color: '#444' }, children: '• AI-Powered Stats' } }
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
