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

function txt(v, fallback = '') {
  if (v === null || v === undefined || v === '') return fallback;
  return String(v);
}

function playerShortName(full) {
  const clean = txt(full).trim();
  if (!clean) return '-';
  const parts = clean.split(/\s+/);
  return parts[parts.length - 1];
}

function kickoffTR(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      timeZone: 'Europe/Istanbul',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch (_) {
    return '';
  }
}

async function fetchFirstFont(urls) {
  for (const url of urls) {
    try {
      const r = await fetch(url);
      if (!r.ok) continue;
      return await r.arrayBuffer();
    } catch (_) {}
  }
  throw new Error('Font download failed');
}

function brandHeader(rightLabel = 'TouchlineBoard') {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 24px',
      },
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
                  children: {
                    type: 'span',
                    props: { style: { fontSize: 14, fontWeight: 'bold', color: '#000' }, children: 'T' },
                  },
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
              border: '1px solid rgba(255,255,255,0.12)',
            },
            children: {
              type: 'span',
              props: {
                style: { fontSize: 10, color: '#9aa4b3', textTransform: 'uppercase', letterSpacing: 1 },
                children: rightLabel,
              },
            },
          },
        },
      ],
    },
  };
}

function renderPlayerCard(d) {
  const rating = parseFloat(d.rating) || 0;
  const ratingColor = rating >= 8 ? '#00ff88' : rating >= 7 ? '#ffcc00' : rating > 0 ? '#ff4466' : '#888';
  const minutes = Number(d.minutes || 0);
  const minutesPercent = Math.min(Math.round((minutes / 90) * 100), 100);

  const statCards = [
    { label: 'Goals', value: txt(d.goals, '0') },
    { label: 'Assists', value: txt(d.assists, '0') },
    { label: 'Passes', value: txt(d.passes, '0') },
    { label: 'Pass Acc', value: d.accuracy !== undefined && d.accuracy !== '' ? `${d.accuracy}%` : '0%' },
    { label: 'Shots', value: txt(d.shots, '0') },
    { label: 'Key Passes', value: txt(d.keyPasses, '0') },
    { label: 'Tackles', value: txt(d.tackles, '0') },
    { label: 'Duels', value: `${txt(d.duelsWon, '0')}/${txt(d.duelsTotal, '0')}` },
  ];

  return {
    width: 600,
    height: 620,
    tree: {
      type: 'div',
      props: {
        style: {
          width: 600,
          height: 620,
          background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Noto Sans',
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
          { type: 'div', props: { style: { display: 'flex', width: '100%', height: 3, background: 'linear-gradient(90deg, #00ff88, #00d4ff, #ff4466)' }, children: '' } },
          brandHeader('Player Stats'),
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', marginBottom: 10 },
              children: {
                type: 'span',
                props: { style: { fontSize: 12, color: '#768192' }, children: `${txt(d.homeTeam)} ${txt(d.homeGoals, '0')} - ${txt(d.awayGoals, '0')} ${txt(d.awayTeam)}` },
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
                padding: '16px',
                backgroundColor: 'rgba(255,255,255,0.03)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.06)',
                gap: 16,
              },
              children: [
                d.playerPhoto
                  ? { type: 'img', props: { src: d.playerPhoto, width: 68, height: 68, style: { borderRadius: '50%', border: `3px solid ${ratingColor}` } } }
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
                            { type: 'span', props: { style: { fontSize: 20, fontWeight: 'bold' }, children: txt(d.playerName, 'Player') } },
                            d.captain
                              ? { type: 'span', props: { style: { fontSize: 10, fontWeight: 'bold', backgroundColor: '#ffcc00', color: '#000', padding: '2px 6px', borderRadius: 4 }, children: 'C' } }
                              : null,
                          ].filter(Boolean),
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 },
                          children: [
                            d.teamLogo ? { type: 'img', props: { src: d.teamLogo, width: 20, height: 20 } } : null,
                            { type: 'span', props: { style: { fontSize: 13, color: '#9ba6b8' }, children: txt(d.teamName) } },
                            { type: 'span', props: { style: { fontSize: 12, color: '#6f7784' }, children: `• ${txt(d.position)}` } },
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
                          style: { display: 'flex', backgroundColor: ratingColor, padding: '12px 18px', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
                          children: { type: 'span', props: { style: { fontSize: 28, fontWeight: 'bold', color: '#000' }, children: txt(d.rating, 'N/A') } },
                        },
                      },
                      { type: 'span', props: { style: { fontSize: 9, color: '#666', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }, children: 'Rating' } },
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
              children: statCards.map((s) => ({
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
                    { type: 'span', props: { style: { fontSize: 22, fontWeight: 'bold', color: '#ffcc00', lineHeight: 1.05 }, children: txt(s.value, '0') } },
                    { type: 'span', props: { style: { fontSize: 10, color: '#777', marginTop: 4 }, children: s.label } },
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
    },
  };
}

function renderLineupCard(d) {
  const homeXI = Array.isArray(d.homeXI) ? d.homeXI : [];
  const awayXI = Array.isArray(d.awayXI) ? d.awayXI : [];
  const homeRows = Array.from({ length: 11 }, (_, i) => playerShortName(homeXI[i]));
  const awayRows = Array.from({ length: 11 }, (_, i) => playerShortName(awayXI[i]));
  const ko = kickoffTR(d.kickoff);

  return {
    width: 600,
    height: 760,
    tree: {
      type: 'div',
      props: {
        style: {
          width: 600,
          height: 760,
          background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Noto Sans',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          { type: 'div', props: { style: { display: 'flex', width: '100%', height: 3, background: 'linear-gradient(90deg, #00ff88, #00d4ff, #ff4466)' }, children: '' } },
          brandHeader('Starting XI'),
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', marginTop: 2 },
              children: { type: 'span', props: { style: { fontSize: 12, color: '#9aa0aa' }, children: `${txt(d.league)}${d.round ? ` • ${d.round}` : ''}` } },
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', marginTop: 6 },
              children: {
                type: 'span',
                props: {
                  style: { fontSize: 11, color: '#6f7784' },
                  children: `${d.venue ? `📍 ${d.venue}` : ''}${d.referee ? ` • Ref: ${d.referee}` : ''}${ko ? ` • ${ko}` : ''}`,
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
                justifyContent: 'center',
                gap: 14,
                margin: '14px 24px 12px',
                padding: '14px 16px',
                borderRadius: 14,
                backgroundColor: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: 8, width: 210 },
                    children: [
                      d.homeLogo ? { type: 'img', props: { src: d.homeLogo, width: 26, height: 26 } } : null,
                      { type: 'span', props: { style: { fontSize: 16, fontWeight: 'bold' }, children: txt(d.homeTeam, 'Home') } },
                    ].filter(Boolean),
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', padding: '6px 12px', borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.08)' },
                    children: { type: 'span', props: { style: { fontSize: 12, color: '#8aa1c0', textTransform: 'uppercase' }, children: txt(d.statusShort, 'NS') } },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: 8, width: 210, justifyContent: 'flex-end' },
                    children: [
                      { type: 'span', props: { style: { fontSize: 16, fontWeight: 'bold' }, children: txt(d.awayTeam, 'Away') } },
                      d.awayLogo ? { type: 'img', props: { src: d.awayLogo, width: 26, height: 26 } } : null,
                    ].filter(Boolean),
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', gap: 12, margin: '0 24px' },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', width: 270, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 10px 8px' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
                          children: [
                            { type: 'span', props: { style: { fontSize: 11, color: '#00ff88', fontWeight: 'bold' }, children: txt(d.homeTeam, 'Home') } },
                            { type: 'span', props: { style: { fontSize: 10, color: '#8aa1c0' }, children: txt(d.homeFormation, '-') } },
                          ],
                        },
                      },
                      ...homeRows.map((name, i) => ({
                        type: 'div',
                        props: {
                          style: { display: 'flex', alignItems: 'center', height: 22, borderBottom: i === 10 ? 'none' : '1px solid rgba(255,255,255,0.05)' },
                          children: [
                            { type: 'span', props: { style: { width: 18, fontSize: 10, color: '#6f7784' }, children: String(i + 1) } },
                            { type: 'span', props: { style: { fontSize: 11, color: '#d8e0eb' }, children: name } },
                          ],
                        },
                      })),
                    ],
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', width: 270, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.06)', padding: '10px 10px 8px' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8 },
                          children: [
                            { type: 'span', props: { style: { fontSize: 11, color: '#00d4ff', fontWeight: 'bold' }, children: txt(d.awayTeam, 'Away') } },
                            { type: 'span', props: { style: { fontSize: 10, color: '#8aa1c0' }, children: txt(d.awayFormation, '-') } },
                          ],
                        },
                      },
                      ...awayRows.map((name, i) => ({
                        type: 'div',
                        props: {
                          style: { display: 'flex', alignItems: 'center', height: 22, borderBottom: i === 10 ? 'none' : '1px solid rgba(255,255,255,0.05)' },
                          children: [
                            { type: 'span', props: { style: { width: 18, fontSize: 10, color: '#6f7784' }, children: String(i + 1) } },
                            { type: 'span', props: { style: { fontSize: 11, color: '#d8e0eb' }, children: name } },
                          ],
                        },
                      })),
                    ],
                  },
                },
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 0 14px', marginTop: 'auto', gap: 6 },
              children: [
                { type: 'span', props: { style: { fontSize: 9, color: '#444' }, children: 'Generated by' } },
                { type: 'span', props: { style: { fontSize: 9, color: '#00ff88', fontWeight: 'bold' }, children: 'TouchlineBoard' } },
                { type: 'span', props: { style: { fontSize: 9, color: '#444' }, children: '• AI-Powered Lineups' } },
              ],
            },
          },
        ],
      },
    },
  };
}

function renderMatchCard(d) {
  const stats = d.stats || [];
  const homeWin = (d.homeGoals ?? 0) > (d.awayGoals ?? 0);
  const awayWin = (d.awayGoals ?? 0) > (d.homeGoals ?? 0);
  const isDraw = (d.homeGoals ?? 0) === (d.awayGoals ?? 0);

  return {
    width: 600,
    height: 680,
    tree: {
      type: 'div',
      props: {
        style: {
          width: 600,
          height: 680,
          background: 'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%)',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Noto Sans',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          { type: 'div', props: { style: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)', display: 'flex' }, children: '' } },
          { type: 'div', props: { style: { position: 'absolute', bottom: -80, left: -80, width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,68,102,0.06) 0%, transparent 70%)', display: 'flex' }, children: '' } },
          { type: 'div', props: { style: { display: 'flex', width: '100%', height: 3, background: 'linear-gradient(90deg, #00ff88, #00d4ff, #ff4466)' }, children: '' } },
          brandHeader('Full Time'),
          { type: 'div', props: { style: { display: 'flex', justifyContent: 'center', marginTop: 3 }, children: { type: 'span', props: { style: { fontSize: 12, color: '#aaa' }, children: txt(d.league, 'League') } } } },
          {
            type: 'div',
            props: {
              style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 20px', gap: 20 },
              children: [
                { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 170 }, children: [d.homeLogo ? { type: 'img', props: { src: d.homeLogo, width: 50, height: 50, style: { marginBottom: 8 } } } : null, { type: 'span', props: { style: { fontSize: 18, fontWeight: 'bold', color: homeWin ? '#fff' : '#888' }, children: txt(d.homeTeam, 'Home') } }].filter(Boolean) } },
                { type: 'div', props: { style: { display: 'flex', alignItems: 'center', gap: 8, padding: '15px 25px', borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }, children: [{ type: 'span', props: { style: { fontSize: 48, fontWeight: 'bold', color: homeWin ? '#fff' : isDraw ? '#fff' : '#666' }, children: txt(d.homeGoals, '0') } }, { type: 'span', props: { style: { fontSize: 24, color: '#333' }, children: ':' } }, { type: 'span', props: { style: { fontSize: 48, fontWeight: 'bold', color: awayWin ? '#fff' : isDraw ? '#fff' : '#666' }, children: txt(d.awayGoals, '0') } }] } },
                { type: 'div', props: { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 170 }, children: [d.awayLogo ? { type: 'img', props: { src: d.awayLogo, width: 50, height: 50, style: { marginBottom: 8 } } } : null, { type: 'span', props: { style: { fontSize: 18, fontWeight: 'bold', color: awayWin ? '#fff' : '#888' }, children: txt(d.awayTeam, 'Away') } }].filter(Boolean) } },
              ],
            },
          },
          { type: 'div', props: { style: { display: 'flex', justifyContent: 'center', marginBottom: 12 }, children: { type: 'span', props: { style: { fontSize: 11, color: '#666' }, children: d.venue ? `📍 ${d.venue}` : '' } } } },
          {
            type: 'div',
            props: {
              style: { display: 'flex', flexDirection: 'column', margin: '0 24px', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 16, padding: '20px 24px', flex: 1, border: '1px solid rgba(255,255,255,0.05)' },
              children: [
                { type: 'div', props: { style: { display: 'flex', justifyContent: 'center', marginBottom: 14 }, children: { type: 'span', props: { style: { fontSize: 10, color: '#777', textTransform: 'uppercase', letterSpacing: 2 }, children: 'Match Statistics' } } } },
                ...stats.slice(0, 6).map((stat, i) => {
                  const homeNum = parseFloat(stat.home) || 0;
                  const awayNum = parseFloat(stat.away) || 0;
                  const homeColor = homeNum > awayNum ? '#00ff88' : homeNum < awayNum ? '#ff4466' : '#888';
                  const awayColor = awayNum > homeNum ? '#00ff88' : awayNum < homeNum ? '#ff4466' : '#888';
                  return {
                    type: 'div',
                    props: {
                      style: { display: 'flex', alignItems: 'center', marginBottom: i < 5 ? 12 : 0, height: 26 },
                      children: [
                        { type: 'span', props: { style: { width: 36, fontSize: 14, fontWeight: 'bold', color: homeColor, textAlign: 'left' }, children: txt(stat.home, '0') } },
                        {
                          type: 'div',
                          props: {
                            style: { display: 'flex', flex: 1, alignItems: 'center', margin: '0 12px', gap: 10 },
                            children: [
                              { type: 'div', props: { style: { display: 'flex', flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, justifyContent: 'flex-end', overflow: 'hidden' }, children: { type: 'div', props: { style: { width: `${stat.homePercent}%`, height: '100%', backgroundColor: homeColor, borderRadius: 3 }, children: '' } } } },
                              { type: 'span', props: { style: { width: 88, fontSize: 9, color: '#666', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5, lineHeight: 1.2 }, children: txt(stat.label, '-') } },
                              { type: 'div', props: { style: { display: 'flex', flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }, children: { type: 'div', props: { style: { width: `${stat.awayPercent}%`, height: '100%', backgroundColor: awayColor, borderRadius: 3 }, children: '' } } } },
                            ],
                          },
                        },
                        { type: 'span', props: { style: { width: 36, fontSize: 14, fontWeight: 'bold', color: awayColor, textAlign: 'right' }, children: txt(stat.away, '0') } },
                      ],
                    },
                  };
                }),
              ],
            },
          },
          {
            type: 'div',
            props: {
              style: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '12px 0', gap: 6 },
              children: [
                { type: 'span', props: { style: { fontSize: 9, color: '#444' }, children: 'Generated by' } },
                { type: 'span', props: { style: { fontSize: 9, color: '#00ff88', fontWeight: 'bold' }, children: 'TouchlineBoard' } },
                { type: 'span', props: { style: { fontSize: 9, color: '#444' }, children: '• AI-Powered Stats' } },
              ],
            },
          },
        ],
      },
    },
  };
}

export default async function handler(req, res) {
  try {
    const { type, data } = req.query;
    const d = safeParseData(data);

    const regularFont = await fetchFirstFont([
      'https://cdn.jsdelivr.net/gh/google/fonts/ofl/notosans/static/NotoSans-Regular.ttf',
      'https://cdn.jsdelivr.net/gh/google/fonts/apache/notosans/NotoSans-Regular.ttf',
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff',
    ]);

    const boldFont = await fetchFirstFont([
      'https://cdn.jsdelivr.net/gh/google/fonts/ofl/notosans/static/NotoSans-Bold.ttf',
      'https://cdn.jsdelivr.net/gh/google/fonts/apache/notosans/NotoSans-Bold.ttf',
      'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_EeA.woff',
    ]);

    let view;
    if (type === 'player') view = renderPlayerCard(d);
    else if (type === 'lineup') view = renderLineupCard(d);
    else view = renderMatchCard(d);

    const svg = await satori(view.tree, {
      width: view.width,
      height: view.height,
      fonts: [
        { name: 'Noto Sans', data: regularFont, style: 'normal', weight: 400 },
        { name: 'Noto Sans', data: boldFont, style: 'normal', weight: 700 },
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
