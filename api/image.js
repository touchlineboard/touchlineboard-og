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

  for (const item of candidates) {
    try {
      return JSON.parse(item);
    } catch (_) {}
  }

  return {};
}

function toText(v, fallback = '0') {
  if (v === null || v === undefined || v === '') return fallback;
  return String(v);
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
    let renderHeight = type === 'player' ? 700 : 680;

    if (type === 'player') {
      const rating = parseFloat(d.rating) || 0;
      const ratingColor = rating >= 8 ? '#00ff88' : rating >= 7 ? '#ffcc00' : rating > 0 ? '#ff4466' : '#888';
      const minutes = Number(d.minutes || 0);
      const minutesPercent = Math.min(Math.round((minutes / 90) * 100), 100);

      const defaultStatItems = [
        { label: 'Goals', value: d.goals ?? 0 },
        { label: 'Assists', value: d.assists ?? 0 },
        { label: 'Passes', value: d.passes ?? 0 },
        { label: 'Shots', value: d.shots ?? 0 },
        { label: 'Shots On', value: d.shotsOn ?? 0 },
        { label: 'Key Passes', value: d.keyPasses ?? 0 },
        { label: 'Pass Acc', value: d.accuracy ? `${d.accuracy}%` : 0 },
        { label: 'Tackles', value: d.tackles ?? 0 },
        { label: 'Interceptions', value: d.interceptions ?? 0 },
        { label: 'Blocks', value: d.blocks ?? 0 },
        { label: 'Duels', value: `${d.duelsWon ?? 0}/${d.duelsTotal ?? 0}` },
        { label: 'Dribbles', value: `${d.dribblesSuccess ?? 0}/${d.dribbles ?? 0}` },
        { label: 'Fouls Won', value: d.foulsDrawn ?? 0 },
        { label: 'Fouls Made', value: d.foulsCommitted ?? 0 },
        { label: 'Offsides', value: d.offsides ?? 0 },
        { label: 'Yellow', value: d.yellowCard ?? 0 },
        { label: 'Red', value: d.redCard ?? 0 },
        { label: 'Pen Won', value: d.penaltyWon ?? 0 },
        { label: 'Pen Scored', value: d.penaltyScored ?? 0 },
        { label: 'Pen Missed', value: d.penaltyMissed ?? 0 },
        { label: 'Saves', value: d.saves ?? 0 },
      ];

      const rawStatItems = Array.isArray(d.statItems) && d.statItems.length ? d.statItems : defaultStatItems;

      const uniqueMap = new Map();
      for (const s of rawStatItems) {
        if (!s || !s.label) continue;
        const key = String(s.label).trim().toLowerCase();
        if (!key) continue;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, {
            label: String(s.label).trim().slice(0, 16),
            value: toText(s.value, '0'),
          });
        }
      }

      const allStats = Array.from(uniqueMap.values()).filter((s) => s.value !== '');

      const mainOrder = ['goals', 'assists', 'passes'];
      const mainStats = [];

      for (const key of mainOrder) {
        const found = allStats.find((s) => s.label.toLowerCase() === key);
        if (found) mainStats.push(found);
      }

      for (const s of allStats) {
        if (mainStats.length >= 3) break;
        const already = mainStats.find((m) => m.label.toLowerCase() === s.label.toLowerCase());
        if (!already) mainStats.push(s);
      }

      while (mainStats.length < 3) {
        mainStats.push({ label: ['Goals', 'Assists', 'Passes'][mainStats.length], value: '0' });
      }

      let secondaryStats = allStats.filter(
        (s) => !mainStats.find((m) => m.label.toLowerCase() === s.label.toLowerCase())
      );

      if (!secondaryStats.length) {
        secondaryStats = [
          { label: 'Shots', value: toText(d.shots ?? 0) },
          { label: 'Key Passes', value: toText(d.keyPasses ?? 0) },
          { label: 'Tackles', value: toText(d.tackles ?? 0) },
          { label: 'Duels', value: `${d.duelsWon ?? 0}/${d.duelsTotal ?? 0}` },
        ];
      }

      secondaryStats = secondaryStats.slice(0, 20);

      const secondaryRows = Math.max(1, Math.ceil(secondaryStats.length / 4));
      renderHeight = 700 + Math.max(0, secondaryRows - 1) * 78;

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
                style: {
                  display: 'flex',
                  width: '100%',
                  height: 3,
                  background: 'linear-gradient(90deg, #00ff88, #00d4ff, #ff4466)',
                },
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
                            children: {
                              type: 'span',
                              props: { style: { fontSize: 14, fontWeight: 'bold', color: '#000' }, children: 'T' },
                            },
                          },
                        },
                        {
                          type: 'span',
                          props: {
                            style: {
                              fontSize: 11,
                              fontWeight: 'bold',
                              color: '#fff',
                              letterSpacing: 1.5,
                              textTransform: 'uppercase',
                            },
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
                        props: {
                          style: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1 },
                          children: 'Player Stats',
                        },
                      },
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', justifyContent: 'center', marginBottom: 15 },
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
                  padding: '20px',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderRadius: 16,
                  border: '1px solid rgba(255,255,255,0.05)',
                  gap: 20,
                },
                children: [
                  d.playerPhoto
                    ? {
                        type: 'img',
                        props: {
                          src: d.playerPhoto,
                          width: 70,
                          height: 70,
                          style: { borderRadius: '50%', border: `3px solid ${ratingColor}` },
                        },
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
                              {
                                type: 'span',
                                props: { style: { fontSize: 20, fontWeight: 'bold' }, children: d.playerName || 'Player' },
                              },
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
                          props: {
                            style: { fontSize: 9, color: '#666', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
                            children: 'Rating',
                          },
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
                style: {
                  display: 'flex',
                  alignItems: 'center',
                  margin: '15px 24px',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: 10,
                  gap: 12,
                },
                children: [
                  { type: 'span', props: { style: { fontSize: 12, color: '#888' }, children: `⏱ ${minutes}'` } },
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        flex: 1,
                        height: 6,
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderRadius: 3,
                        overflow: 'hidden',
                      },
                      children: {
                        type: 'div',
                        props: {
                          style: {
                            width: `${minutesPercent}%`,
                            height: '100%',
                            backgroundColor: '#00ff88',
                            borderRadius: 3,
                          },
                          children: '',
                        },
                      },
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', margin: '0 24px', gap: 12 },
                children: [
                  { bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.2)', color: '#00ff88' },
                  { bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.2)', color: '#00d4ff' },
                  { bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.05)', color: '#fff' },
                ].map((theme, i) => ({
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flex: 1,
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: theme.bg,
                      borderRadius: 12,
                      padding: '18px 0',
                      border: `1px solid ${theme.border}`,
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: 32, fontWeight: 'bold', color: theme.color },
                          children: toText(mainStats[i]?.value, '0'),
                        },
                      },
                      {
                        type: 'span',
                        props: { style: { fontSize: 11, color: '#888', marginTop: 4 }, children: mainStats[i]?.label || '-' },
                      },
                    ],
                  },
                })),
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexWrap: 'wrap',
                  margin: '12px 24px',
                  gap: 10,
                },
                children: secondaryStats.map((stat) => ({
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      width: 130,
                      flexDirection: 'column',
                      alignItems: 'center',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      borderRadius: 10,
                      padding: '10px 6px',
                      border: '1px solid rgba(255,255,255,0.05)',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: 20, fontWeight: 'bold', color: '#ffcc00', lineHeight: 1.1 },
                          children: toText(stat.value, '0'),
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: 9, color: '#666', marginTop: 3, textAlign: 'center', lineHeight: 1.15 },
                          children: stat.label,
                        },
                      },
                    ],
                  },
                })),
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '14px 0', marginTop: 'auto', gap: 6 },
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
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  top: -100,
                  right: -100,
                  width: 300,
                  height: 300,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0,255,136,0.08) 0%, transparent 70%)',
                  display: 'flex',
                },
                children: '',
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  bottom: -80,
                  left: -80,
                  width: 250,
                  height: 250,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,68,102,0.06) 0%, transparent 70%)',
                  display: 'flex',
                },
                children: '',
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  width: '100%',
                  height: 3,
                  background: 'linear-gradient(90deg, #00ff88, #00d4ff, #ff4466)',
                },
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
                        border: '1px solid rgba(255,255,255,0.1)',
                      },
                      children: {
                        type: 'span',
                        props: { style: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }, children: 'Full Time' },
                      },
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', justifyContent: 'center', marginTop: 5 },
                children: {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      padding: '8px 20px',
                      borderRadius: 25,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    },
                    children: {
                      type: 'span',
                      props: { style: { fontSize: 12, color: '#aaa', letterSpacing: 2, textTransform: 'uppercase' }, children: d.league || 'League' },
                    },
                  },
                },
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '25px 20px', gap: 20 },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 170 },
                      children: [
                        d.homeLogo ? { type: 'img', props: { src: d.homeLogo, width: 50, height: 50, style: { marginBottom: 8 } } } : null,
                        {
                          type: 'span',
                          props: {
                            style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: homeWin ? '#fff' : '#888' },
                            children: d.homeTeam || 'Home',
                          },
                        },
                      ].filter(Boolean),
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '15px 25px',
                        borderRadius: 16,
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      },
                      children: [
                        {
                          type: 'span',
                          props: {
                            style: { fontSize: 48, fontWeight: 'bold', color: homeWin ? '#fff' : isDraw ? '#fff' : '#666' },
                            children: String(d.homeGoals ?? 0),
                          },
                        },
                        { type: 'span', props: { style: { fontSize: 24, color: '#333', margin: '0 5px' }, children: ':' } },
                        {
                          type: 'span',
                          props: {
                            style: { fontSize: 48, fontWeight: 'bold', color: awayWin ? '#fff' : isDraw ? '#fff' : '#666' },
                            children: String(d.awayGoals ?? 0),
                          },
                        },
                      ],
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 170 },
                      children: [
                        d.awayLogo ? { type: 'img', props: { src: d.awayLogo, width: 50, height: 50, style: { marginBottom: 8 } } } : null,
                        {
                          type: 'span',
                          props: {
                            style: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', color: awayWin ? '#fff' : '#888' },
                            children: d.awayTeam || 'Away',
                          },
                        },
                      ].filter(Boolean),
                    },
                  },
                ],
              },
            },
            {
              type: 'div',
              props: {
                style: { display: 'flex', justifyContent: 'center', marginBottom: 15 },
                children: {
                  type: 'span',
                  props: { style: { fontSize: 11, color: '#555' }, children: d.venue ? `📍 ${d.venue}` : '' },
                },
              },
            },
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  margin: '0 24px',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  borderRadius: 16,
                  padding: '20px 24px',
                  flex: 1,
                  border: '1px solid rgba(255,255,255,0.05)',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: { display: 'flex', justifyContent: 'center', marginBottom: 16 },
                      children: {
                        type: 'span',
                        props: {
                          style: { fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: 2 },
                          children: 'Match Statistics',
                        },
                      },
                    },
                  },
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
                          {
                            type: 'span',
                            props: { style: { width: 36, fontSize: 14, fontWeight: 'bold', color: homeColor, textAlign: 'left' }, children: String(stat.home) },
                          },
                          {
                            type: 'div',
                            props: {
                              style: { display: 'flex', flex: 1, alignItems: 'center', margin: '0 12px', gap: 10 },
                              children: [
                                {
                                  type: 'div',
                                  props: {
                                    style: {
                                      display: 'flex',
                                      flex: 1,
                                      height: 6,
                                      backgroundColor: 'rgba(255,255,255,0.08)',
                                      borderRadius: 3,
                                      justifyContent: 'flex-end',
                                      overflow: 'hidden',
                                    },
                                    children: {
                                      type: 'div',
                                      props: { style: { width: `${stat.homePercent}%`, height: '100%', backgroundColor: homeColor, borderRadius: 3 }, children: '' },
                                    },
                                  },
                                },
                                {
                                  type: 'span',
                                  props: {
                                    style: {
                                      width: 80,
                                      fontSize: 9,
                                      color: '#666',
                                      textAlign: 'center',
                                      textTransform: 'uppercase',
                                      letterSpacing: 0.5,
                                      lineHeight: 1.2,
                                    },
                                    children: stat.label,
                                  },
                                },
                                {
                                  type: 'div',
                                  props: {
                                    style: { display: 'flex', flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
                                    children: {
                                      type: 'div',
                                      props: { style: { width: `${stat.awayPercent}%`, height: '100%', backgroundColor: awayColor, borderRadius: 3 }, children: '' },
                                    },
                                  },
                                },
                              ],
                            },
                          },
                          {
                            type: 'span',
                            props: { style: { width: 36, fontSize: 14, fontWeight: 'bold', color: awayColor, textAlign: 'right' }, children: String(stat.away) },
                          },
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
                style: { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '14px 0', gap: 6 },
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
