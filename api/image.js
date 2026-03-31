import satori from 'satori';
import sharp from 'sharp';

export const config = { runtime: 'nodejs' };

function safeParseData(raw) {
  if (!raw) return {};

  const candidates = [raw];

  try {
    const decoded = decodeURIComponent(raw);
    if (decoded !== raw) candidates.push(decoded);
  } catch (_) {}

  for (const c of candidates) {
    try {
      return JSON.parse(c);
    } catch (_) {}
  }

  return {};
}

function val(v, fallback = '0') {
  if (v === null || v === undefined || v === '') return fallback;
  return String(v);
}

function buildStatsMap(d) {
  const map = new Map();

  if (Array.isArray(d.statItems)) {
    for (const item of d.statItems) {
      if (!item || !item.label) continue;
      const key = String(item.label).trim().toLowerCase();
      if (!key) continue;
      map.set(key, val(item.value));
    }
  }

  return map;
}

export default async function handler(req, res) {
  try {
    const { type, data } = req.query;
    const d = safeParseData(data);

    const fontRes = await fetch(
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff'
    );
    const fontData = await fontRes.arrayBuffer();

    const fontBoldRes = await fetch(
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff'
    );
    const fontBoldData = await fontBoldRes.arrayBuffer();

    let card;
    let renderHeight = type === 'player' ? 620 : 680;

    if (type === 'player') {
      const rating = parseFloat(d.rating) || 0;
      const ratingColor = rating >= 8 ? '#00ff88' : rating >= 7 ? '#ffcc00' : rating > 0 ? '#ff4466' : '#888';
      const minutes = Number(d.minutes || 0);
      const minutesPercent = Math.min(Math.round((minutes / 90) * 100), 100);
      const statsMap = buildStatsMap(d);

      const statCards = [
        { label: 'Goals', value: statsMap.get('goals') ?? val(d.goals, '0') },
        { label: 'Assists', value: statsMap.get('assists') ?? val(d.assists, '0') },
        { label: 'Passes', value: statsMap.get('passes') ?? val(d.passes, '0') },
        { label: 'Pass Acc', value: statsMap.get('pass acc') ?? (d.accuracy !== undefined ? `${d.accuracy}%` : '0%') },
        { label: 'Shots', value: statsMap.get('shots') ?? val(d.shots, '0') },
        { label: 'Key Passes', value: statsMap.get('key passes') ?? val(d.keyPasses, '0') },
        { label: 'Tackles', value: statsMap.get('tackles') ?? val(d.tackles, '0') },
        { label: 'Duels', value: statsMap.get('duels') ?? `${val(d.duelsWon, '0')}/${val(d.duelsTotal, '0')}` },
      ];

      card = {
        type: 'div',
        props: {
          style: {
            width: 600,
            height: renderHeight,
            background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
            display: 'flex',
            flexDirection: 'column',
            fontFamily: 'Inter',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          },
          children: [
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 250,
                  height: 250,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${ratingColor}22 0%, transparent 70%)`,
                  display: 'flex',
                },
                children: '',
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', width: '100%', height: 3, background: 'linear-gradient(90deg, #00ff88, #00d4ff, #ff4466)' },
                children: '',
              },
            },
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
                            style: {
                              display: 'flex',
                              width: 28,
                              height: 28,
                              borderRadius: 6,
                              background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)',
                              alignItems: 'center',
                              justifyContent: 'center',
                            },
                            children: { type: 'span', props: { style: { fontSize: 14, fontWeight: 'bold', color: '#000' }, children: 'T' } },
                          },
                        },
                        {
                          type: 'span',
                          props: {
                            style: { fontSize: 11, fontWeight: 'bold', color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase' },
                            children: 'TouchlineBoard',
                          },
                        },
                      ],
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        padding: '6px 14px',
                        borderRadius: 20,
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      },
                      children: {
                        type: 'span',
                        props: { style: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }, children: 'Player Stats' },
                      },
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', justifyContent: 'center', marginBottom: 12 },
                children: {
                  type: 'span',
                  props: {
                    style: { fontSize: 12, color: '#666' },
                    children: `${d.homeTeam || ''} ${d.homeGoals || 0} - ${d.awayGoals || 0} ${d.awayTeam || ''}`,
                  },
                },
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  margin: '0 24px',
                  padding: '18px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.05)',
                  gap: 18,
                },
                children: [
                  d.playerPhoto
                    ? {
                        type: 'img',
                        props: { src: d.playerPhoto, width: 70, height: 70, style: { borderRadius: '50%', border: `3px solid ${ratingColor}` } },
                      }
                    : null,
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', flexDirection: 'column', flex: 1 },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', alignItems: 'center', gap: 8 },
                            children: [
                              { type: 'span', props: { style: { fontSize: 20, fontWeight: 'bold' }, children: d.playerName || 'Player' } },
                              d.captain
                                ? {
                                    type: 'span',
                                    props: {
                                      style: {
                                        fontSize: 10,
                                        fontWeight: 'bold',
                                        backgroundColor: '#ffcc00',
                                        color: '#000',
                                        padding: '2px 6px',
                                        borderRadius: 4,
                                      },
                                      children: 'C',
                                    },
                                  }
                                : null,
                            ].filter(Boolean),
                          },
                        },
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 },
                            children: [
                              d.teamLogo ? { type: 'img', props: { src: d.teamLogo, width: 20, height: 20 } } : null,
                              { type: 'span', props: { style: { fontSize: 13, color: '#888' }, children: d.teamName || '' } },
                              { type: 'span', props: { style: { fontSize: 12, color: '#666' }, children: `• ${d.position || ''}` } },
                            ].filter(Boolean),
                          },
                        },
                      ],
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: {
                              display: 'flex',
                              backgroundColor: ratingColor,
                              padding: '12px 18px',
                              borderRadius: 12,
                              alignItems: 'center',
                              justifyContent: 'center',
                            },
                            children: {
                              type: 'span',
                              props: { style: { fontSize: 28, fontWeight: 'bold', color: '#000' }, children: d.rating || 'N/A' },
                            },
                          },
                        },
                        {
                          type: 'span',
                          props: { style: { fontSize: 9, color: '#666', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }, children: 'Rating' },
                        },
                      ],
                    },
                  },
                ].filter(Boolean),
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', margin: '14px 24px 12px', padding: '12px 16px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 10, gap: 12 },
                children: [
                  { type: 'span', props: { style: { fontSize: 12, color: '#888' }, children: `⏱ ${minutes}'` } },
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' },
                      children: { type: 'div', props: { style: { width: `${minutesPercent}%`, height: '100%', backgroundColor: '#00ff88', borderRadius: 3 }, children: '' } },
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexWrap: 'wrap', margin: '0 24px', gap: 10 },
                children: statCards.map((stat) => ({
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      width: 130,
                      height: 78,
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'rgba(0,0,0,0.32)',
                      borderRadius: 10,
                      border: '1px solid rgba(255,255,255,0.06)',
                    },
                    children: [
                      { type: 'span', props: { style: { fontSize: 22, fontWeight: 'bold', color: '#ffcc00', lineHeight: 1.05 }, children: val(stat.value, '0') } },
                      { type: 'span', props: { style: { fontSize: 10, color: '#777', marginTop: 4 }, children: stat.label } },
                    ],
                  },
                })),
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 0 14px', marginTop: 10, gap: 6 },
                children: [
                  { type: 'span', props: { style: { fontSize: 9, color: '#444' }, children: 'Generated by' } },
                  { type: 'span', props: { style: { fontSize: 9, color: '#00ff88', fontWeight: 'bold' }, children: 'TouchlineBoard' } },
                  { type: 'span', props: { style: { fontSize: 9, color: '#444' }, children: '• AI-Powered Stats' } },
                ],
              },
            },
          ],
        },
      };
    } else {
      const stats = d.stats || [];
      const homeWin = (d.homeGoals ?? 0) > (d.awayGoals ?? 0);
      const awayWin = (d.awayGoals ?? 0) > (d.homeGoals ?? 0);
      const isDraw = (d.homeGoals ?? 0) === (d.awayGoals ?? 0);

      card = {
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
            overflow: 'hidden',
          },
          children: [
            { type: 'div', props: { style: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)', display: 'flex' }, children: '' } },
            { type: 'div', props: { style: { position: 'absolute', bottom: -80, left: -80, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,68,102,0.06) 0%, transparent 70%)', display: 'flex' }, children: '' } },
            { type: 'div', props: { style: { display: 'flex', width: '100%', height: 3, background: 'linear-gradient(90deg, #00ff88, #00d4ff, #ff4466)' }, children: '' } },
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px' },
                children: [
                  { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [
                    { type: 'div', props: { style: { display: 'flex', width: 28, height: 28, borderRadius: 6, background: 'linear-gradient(135deg, #00ff88 0%, #00cc6a 100%)', alignItems: 'center', justifyContent: 'center' }, children: { type: 'span', props: { style: { fontSize: 14, fontWeight: 'bold', color: '#000' }, children: 'T' } } } },
                    { type: 'span', props: { style: { fontSize: 11, fontWeight: 'bold', color: '#fff', letterSpacing: 1.5, textTransform: 'uppercase' }, children: 'TouchlineBoard' } }
                  ] } },
                  { type: 'div', props: { style: { display: 'flex', padding: '6px 14px', borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }, children: { type: 'span', props: { style: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }, children: 'Full Time' } } } }
                ]
              }
            },
            { type: 'div', props: { style: { display: 'flex', justifyContent: 'center', marginTop: 5 }, children: { type: 'div', props: { style: { display: 'flex', padding: '8px 20px', borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }, children: { type: 'span', props: { style: { fontSize: 12, color: '#aaa', letterSpacing: 2, textTransform: 'uppercase' }, children: d.league || 'League' } } } } } },
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '25px 20px', gap: 20 },
                children: [
                  { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 170 }, children: [
                    d.homeLogo ? { type: 'img', props: { src: d.homeLogo, width: 50, height: 50, style: { marginBottom: 8 } } } : null,
                    { type: 'span', props: { style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: homeWin ? '#fff' : '#888' }, children: d.homeTeam || 'Home' } }
                  ].filter(Boolean) } },
                  { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '15px 25px', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }, children: [
                    { type: 'span', props: { style: { fontSize: 48, fontWeight: 'bold', color: homeWin ? '#fff' : (isDraw ? '#fff' : '#666') }, children: String(d.homeGoals ?? 0) } },
                    { type: 'span', props: { style: { fontSize: 24, color: '#333', margin: '0 5px' }, children: ':' } },
                    { type: 'span', props: { style: { fontSize: 48, fontWeight: 'bold', color: awayWin ? '#fff' : (isDraw ? '#fff' : '#666') }, children: String(d.awayGoals ?? 0) } }
                  ] } },
                  { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 170 }, children: [
                    d.awayLogo ? { type: 'img', props: { src: d.awayLogo, width: 50, height: 50, style: { marginBottom: 8 } } } : null,
                    { type: 'span', props: { style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: awayWin ? '#fff' : '#888' }, children: d.awayTeam || 'Away' } }
                  ].filter(Boolean) } }
                ]
              }
            },
            { type: 'div', props: { style: { display: 'flex', justifyContent: 'center', marginBottom: 15 }, children: { type: 'span', props: { style: { fontSize: 11, color: '#555' }, children: d.venue ? `📍 ${d.venue}` : '' } } } },
            {
              type: 'div',
              props: {
                style: { display: 'flex', flexDirection: 'column', margin: '0 24px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: '20px 24px', flex: 1, border: '1px solid rgba(255,255,255,0.05)' },
                children: [
                  { type: 'div', props: { style: { display: 'flex', justifyContent: 'center', marginBottom: 16 }, children: { type: 'span', props: { style: { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 2 }, children: 'Match Statistics' } } } },
                  ...stats.slice(0, 6).map((stat, i) => {
                    const homeNum = parseFloat(stat.home) || 0;
                    const awayNum = parseFloat(stat.away) || 0;
                    const homeColor = homeNum > awayNum ? '#00ff88' : (homeNum < awayNum ? '#ff4466' : '#888');
                    const awayColor = awayNum > homeNum ? '#00ff88' : (awayNum < homeNum ? '#ff4466' : '#888');
                    return {
                      type: 'div',
                      props: {
                        style: { display: 'flex', alignItems: 'center', marginBottom: i < 5 ? 12 : 0, height: 26 },
                        children: [
                          { type: 'span', props: { style: { width: 36, fontSize: 14, fontWeight: 'bold', color: homeColor, textAlign: 'left' }, children: String(stat.home) } },
                          { type: 'div', props: { style: { display: 'flex', flex: 1, alignItems: 'center', margin: '0 12px', gap: 10 }, children: [
                            { type: 'div', props: { style: { display: 'flex', flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, justifyContent: 'flex-end', overflow: 'hidden' }, children: { type: 'div', props: { style: { width: `${stat.homePercent}%`, height: '100%', backgroundColor: homeColor, borderRadius: 3 }, children: '' } } } },
                            { type: 'span', props: { style: { width: 80, fontSize: 9, color: '#666', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.2 }, children: stat.label } },
                            { type: 'div', props: { style: { display: 'flex', flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }, children: { type: 'div', props: { style: { width: `${stat.awayPercent}%`, height: '100%', backgroundColor: awayColor, borderRadius: 3 }, children: '' } } } }
                          ] } },
                          { type: 'span', props: { style: { width: 36, fontSize: 14, fontWeight: 'bold', color: awayColor, textAlign: 'right' }, children: String(stat.away) } }
                        ]
                      }
                    };
                  })
                ]
              }
            },
            { type: 'div', props: { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '14px 0', gap: 6 }, children: [
              { type: 'span', props: { style: { fontSize: 9, color: '#444' }, children: 'Generated by' } },
              { type: 'span', props: { style: { fontSize: 9, color: '#00ff88', fontWeight: 'bold' }, children: 'TouchlineBoard' } },
              { type: 'span', props: { style: { fontSize: 9, color: '#444' }, children: '• AI-Powered Stats' } }
            ] } }
          ]
        }
      };
    }

    const svg = await satori(card, {
      width: 600,
      height: renderHeight,
      fonts: [
        { name: 'Inter', data: fontData, style: 'normal', weight: 400 },
        { name: 'Inter', data: fontBoldData, style: 'normal', weight: 700 },
      ],
    });

    const png = await sharp(Buffer.from(svg)).png().toBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60');
    res.send(png);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
