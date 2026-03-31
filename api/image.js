const fontRegularUrl = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Regular.ttf';
const fontBoldUrl = 'https://cdn.jsdelivr.net/gh/googlefonts/noto-fonts@main/hinted/ttf/NotoSans/NotoSans-Bold.ttf';

function safeString(v, fallback = '') {
  if (v === null || v === undefined) return fallback;
  return String(v);
}

function toNumber(v, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function parseData(raw) {
  if (!raw) return {};
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch (_) {
    return {};
  }
}

async function loadFonts() {
  const fonts = [];
  try {
    const reg = await fetch(fontRegularUrl).then((r) => r.arrayBuffer());
    fonts.push({ name: 'Noto Sans', data: reg, weight: 400, style: 'normal' });
  } catch (_) {}
  try {
    const bold = await fetch(fontBoldUrl).then((r) => r.arrayBuffer());
    fonts.push({ name: 'Noto Sans', data: bold, weight: 700, style: 'normal' });
  } catch (_) {}
  return fonts;
}

function bgShell(width, height, content) {
  return {
    type: 'div',
    props: {
      style: {
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
        background:
          'radial-gradient(circle at 88% 10%, rgba(50,255,190,0.18), transparent 28%), radial-gradient(circle at 10% 100%, rgba(0,163,255,0.15), transparent 32%), linear-gradient(135deg, #07111f 0%, #0a1427 55%, #060d1a 100%)',
        color: '#EAF0FF',
        fontFamily: 'Noto Sans',
        padding: '34px 36px',
        boxSizing: 'border-box',
        position: 'relative'
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: 6,
              background: 'linear-gradient(90deg,#00ff95,#00c7ff,#ff4d77)'
            }
          }
        },
        content
      ]
    }
  };
}

function brandHeader(tagText) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18
      },
      children: [
        {
          type: 'div',
          props: {
            style: { display: 'flex', alignItems: 'center', gap: 14 },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: 'linear-gradient(135deg,#00ff95,#19b7ff)',
                    color: '#04111f',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontWeight: 700,
                    fontSize: 26
                  },
                  children: 'T'
                }
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 34,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: 'uppercase'
                  },
                  children: 'TOUCHLINEBOARD'
                }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            style: {
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.15)',
              padding: '8px 18px',
              fontSize: 20,
              color: '#BFC8DC',
              textTransform: 'uppercase',
              letterSpacing: 1.2
            },
            children: tagText
          }
        }
      ]
    }
  };
}

function renderPlayerCard(d) {
  const stats = Array.isArray(d.statItems) ? d.statItems.slice(0, 8) : [];
  while (stats.length < 8) stats.push({ label: '-', value: '0' });
  const statRows = [stats.slice(0, 4), stats.slice(4, 8)];

  const rating = toNumber(d.rating, 0);
  const ratingColor = rating >= 8 ? '#1BFFB4' : rating >= 7 ? '#35D7FF' : '#FF5A8A';
  const minutes = Math.max(0, Math.min(120, toNumber(d.minutes, 0)));
  const minutePct = Math.round((minutes / 120) * 100);

  const content = {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', height: '100%' },
      children: [
        brandHeader('Player Stats'),
        {
          type: 'div',
          props: {
            style: {
              textAlign: 'center',
              color: '#9FB0CC',
              fontSize: 32,
              marginBottom: 18
            },
            children:
              safeString(d.homeTeam, 'Home') +
              ' ' +
              safeString(d.homeGoals, 0) +
              ' - ' +
              safeString(d.awayGoals, 0) +
              ' ' +
              safeString(d.awayTeam, 'Away')
          }
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.04)',
              padding: '20px 22px',
              marginBottom: 16
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: 16 },
                  children: [
                    {
                      type: 'img',
                      props: {
                        src: safeString(d.playerPhoto, 'https://cdn-icons-png.flaticon.com/512/149/149071.png'),
                        width: 100,
                        height: 100,
                        style: {
                          width: 100,
                          height: 100,
                          borderRadius: 999,
                          border: '5px solid ' + ratingColor,
                          objectFit: 'cover'
                        }
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: { display: 'flex', flexDirection: 'column' },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { fontSize: 54, fontWeight: 700, lineHeight: 1.05 },
                              children: safeString(d.playerName, 'Unknown Player')
                            }
                          },
                          {
                            type: 'div',
                            props: {
                              style: {
                                display: 'flex',
                                alignItems: 'center',
                                gap: 10,
                                marginTop: 4,
                                fontSize: 30,
                                color: '#AAB7D0'
                              },
                              children: [
                                d.teamLogo
                                  ? {
                                      type: 'img',
                                      props: {
                                        src: safeString(d.teamLogo),
                                        width: 28,
                                        height: 28,
                                        style: { width: 28, height: 28, objectFit: 'contain' }
                                      }
                                    }
                                  : null,
                                safeString(d.teamName, 'Team') + '  •  ' + safeString(d.position, '-')
                              ].filter(Boolean)
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: 170 },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          width: 140,
                          height: 116,
                          borderRadius: 24,
                          background: ratingColor,
                          color: '#05111E',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontWeight: 700,
                          fontSize: 64
                        },
                        children: safeString(d.rating, '0.0')
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          marginTop: 10,
                          letterSpacing: 2,
                          fontSize: 20,
                          color: '#8D9BB6',
                          textTransform: 'uppercase'
                        },
                        children: 'Rating'
                      }
                    }
                  ]
                }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              borderRadius: 16,
              background: 'rgba(0,0,0,0.32)',
              padding: '10px 14px',
              marginBottom: 14
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { width: 66, fontSize: 28, color: '#9FB0CC' },
                  children: safeString(minutes) + "'"
                }
              },
              {
                type: 'div',
                props: {
                  style: {
                    flex: 1,
                    height: 14,
                    borderRadius: 999,
                    background: 'rgba(255,255,255,0.12)',
                    overflow: 'hidden'
                  },
                  children: {
                    type: 'div',
                    props: {
                      style: {
                        width: minutePct + '%',
                        height: '100%',
                        borderRadius: 999,
                        background: 'linear-gradient(90deg,#00ff95,#00d9ff)'
                      }
                    }
                  }
                }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              marginBottom: 12
            },
            children: statRows.map((row, rowIndex) => ({
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: rowIndex === statRows.length - 1 ? 0 : 12
                },
                children: row.map((s) => ({
                  type: 'div',
                  props: {
                    style: {
                      width: 270,
                      borderRadius: 16,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(0,0,0,0.28)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '12px 10px',
                      minHeight: 100,
                      boxSizing: 'border-box'
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: 42, fontWeight: 700, color: '#FFD93D', lineHeight: 1.05 },
                          children: safeString(s.value, '0')
                        }
                      },
                      {
                        type: 'div',
                        props: {
                          style: { fontSize: 22, color: '#98A7C4', marginTop: 2 },
                          children: safeString(s.label, '-')
                        }
                      }
                    ]
                  }
                }))
              }
            }))
          }
        },
        {
          type: 'div',
          props: {
            style: {
              marginTop: 4,
              textAlign: 'center',
              color: '#7A8AA8',
              fontSize: 20
            },
            children: 'Generated by TouchlineBoard • AI-Powered Stats'
          }
        }
      ]
    }
  };

  return { width: 1200, height: 900, node: bgShell(1200, 900, content) };
}

function renderLineupCard(d) {
  const homeXI = Array.isArray(d.homeXI) ? d.homeXI.slice(0, 11) : [];
  const awayXI = Array.isArray(d.awayXI) ? d.awayXI.slice(0, 11) : [];
  const totalHeight = 1020;

  const lineupCol = (title, formation, players) => ({
    type: 'div',
    props: {
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 18,
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.03)',
        padding: '14px 14px 12px 14px'
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            },
            children: [
              {
                type: 'div',
                props: { style: { fontSize: 30, fontWeight: 700 }, children: safeString(title, '-') }
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: 20,
                    color: '#A6B5CF',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.12)',
                    padding: '4px 12px'
                  },
                  children: safeString(formation || '-', '-')
                }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            },
            children: Array.from({ length: 11 }).map((_, i) => ({
              type: 'div',
              props: {
                style: {
                  minHeight: 36,
                  borderRadius: 10,
                  background: 'rgba(0,0,0,0.28)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  color: players[i] ? '#EAF0FF' : '#66758F',
                  fontSize: 24
                },
                children: (i + 1) + '. ' + safeString(players[i], '-')
              }
            }))
          }
        }
      ]
    }
  });

  const content = {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column' },
      children: [
        brandHeader('Official Lineups'),
        {
          type: 'div',
          props: {
            style: {
              textAlign: 'center',
              color: '#DDE6FA',
              fontSize: 38,
              fontWeight: 700,
              marginBottom: 4
            },
            children: safeString(d.homeTeam, 'Home') + ' vs ' + safeString(d.awayTeam, 'Away')
          }
        },
        {
          type: 'div',
          props: {
            style: {
              textAlign: 'center',
              color: '#98A8C6',
              fontSize: 24,
              marginBottom: 16
            },
            children:
              safeString(d.league, '') +
              (d.round ? ' • ' + safeString(d.round) : '') +
              (d.kickoff ? ' • ' + safeString(d.kickoff).replace('T', ' ').slice(0, 16) : '')
          }
        },
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'center',
              gap: 18,
              marginBottom: 14
            },
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: 'rgba(0,0,0,0.28)'
                  },
                  children: [
                    d.homeLogo
                      ? {
                          type: 'img',
                          props: {
                            src: safeString(d.homeLogo),
                            width: 34,
                            height: 34,
                            style: { width: 34, height: 34, objectFit: 'contain' }
                          }
                        }
                      : null,
                    {
                      type: 'div',
                      props: { style: { fontSize: 24 }, children: safeString(d.homeTeam, 'Home') }
                    }
                  ].filter(Boolean)
                }
              },
              {
                type: 'div',
                props: {
                  style: {
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    borderRadius: 12,
                    background: 'rgba(0,0,0,0.28)'
                  },
                  children: [
                    d.awayLogo
                      ? {
                          type: 'img',
                          props: {
                            src: safeString(d.awayLogo),
                            width: 34,
                            height: 34,
                            style: { width: 34, height: 34, objectFit: 'contain' }
                          }
                        }
                      : null,
                    {
                      type: 'div',
                      props: { style: { fontSize: 24 }, children: safeString(d.awayTeam, 'Away') }
                    }
                  ].filter(Boolean)
                }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', gap: 14, marginBottom: 12 },
            children: [
              lineupCol(d.homeTeam, d.homeFormation, homeXI),
              lineupCol(d.awayTeam, d.awayFormation, awayXI)
            ]
          }
        },
        {
          type: 'div',
          props: {
            style: {
              borderRadius: 12,
              background: 'rgba(0,0,0,0.28)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              marginBottom: 8
            },
            children: [
              {
                type: 'div',
                props: { style: { fontSize: 20, color: '#9AABC8' }, children: 'Venue: ' + safeString(d.venue, 'N/A') }
              },
              {
                type: 'div',
                props: { style: { fontSize: 20, color: '#9AABC8' }, children: 'Referee: ' + safeString(d.referee, 'N/A') }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            style: {
              textAlign: 'center',
              color: '#7A8AA8',
              fontSize: 20,
              paddingBottom: 8
            },
            children: 'Generated by TouchlineBoard • Official XI'
          }
        }
      ]
    }
  };

  return { width: 1200, height: totalHeight, node: bgShell(1200, totalHeight, content) };
}

function renderMatchStatsCard(d) {
  const stats = Array.isArray(d.stats) ? d.stats.slice(0, 6) : [];

  const content = {
    type: 'div',
    props: {
      style: { display: 'flex', flexDirection: 'column', height: '100%' },
      children: [
        brandHeader('Match Stats'),
        {
          type: 'div',
          props: {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 18
            },
            children: [
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: 10 },
                  children: [
                    d.homeLogo
                      ? {
                          type: 'img',
                          props: {
                            src: safeString(d.homeLogo),
                            width: 42,
                            height: 42,
                            style: { width: 42, height: 42, objectFit: 'contain' }
                          }
                        }
                      : null,
                    { type: 'div', props: { style: { fontSize: 34, fontWeight: 700 }, children: safeString(d.homeTeam, 'Home') } }
                  ].filter(Boolean)
                }
              },
              {
                type: 'div',
                props: {
                  style: { fontSize: 72, fontWeight: 700, color: '#ffffff' },
                  children: safeString(d.homeGoals, '0') + ' - ' + safeString(d.awayGoals, '0')
                }
              },
              {
                type: 'div',
                props: {
                  style: { display: 'flex', alignItems: 'center', gap: 10 },
                  children: [
                    { type: 'div', props: { style: { fontSize: 34, fontWeight: 700 }, children: safeString(d.awayTeam, 'Away') } },
                    d.awayLogo
                      ? {
                          type: 'img',
                          props: {
                            src: safeString(d.awayLogo),
                            width: 42,
                            height: 42,
                            style: { width: 42, height: 42, objectFit: 'contain' }
                          }
                        }
                      : null
                  ].filter(Boolean)
                }
              }
            ]
          }
        },
        {
          type: 'div',
          props: {
            style: {
              borderRadius: 16,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '12px 14px',
              marginBottom: 12,
              fontSize: 24,
              color: '#A3B3CF',
              textAlign: 'center'
            },
            children: safeString(d.league, '') + (d.venue ? ' • ' + safeString(d.venue) : '')
          }
        },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: 10 },
            children: stats.map((s) => {
              const hp = Math.max(0, Math.min(100, toNumber(s.homePercent, 50)));
              const ap = 100 - hp;
              return {
                type: 'div',
                props: {
                  style: {
                    borderRadius: 12,
                    background: 'rgba(0,0,0,0.28)',
                    padding: '8px 12px',
                    display: 'flex',
                    flexDirection: 'column'
                  },
                  children: [
                    {
                      type: 'div',
                      props: {
                        style: {
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 6,
                          fontSize: 22
                        },
                        children: [
                          safeString(s.home, '0'),
                          safeString(s.label, '-'),
                          safeString(s.away, '0')
                        ]
                      }
                    },
                    {
                      type: 'div',
                      props: {
                        style: {
                          height: 10,
                          borderRadius: 999,
                          background: 'rgba(255,255,255,0.1)',
                          overflow: 'hidden',
                          display: 'flex'
                        },
                        children: [
                          {
                            type: 'div',
                            props: {
                              style: { width: hp + '%', height: '100%', background: '#00ff95' }
                            }
                          },
                          {
                            type: 'div',
                            props: {
                              style: { width: ap + '%', height: '100%', background: '#00b7ff' }
                            }
                          }
                        ]
                      }
                    }
                  ]
                }
              };
            })
          }
        }
      ]
    }
  };

  return { width: 1200, height: 880, node: bgShell(1200, 880, content) };
}

function buildCard(type, data) {
  if (type === 'lineup') return renderLineupCard(data);
  if (type === 'stats') return renderMatchStatsCard(data);
  return renderPlayerCard(data);
}

export default async function handler(req, res) {
  try {
    const { default: satori } = await import('satori');
    const sharpModule = await import('sharp');
    const sharp = sharpModule.default || sharpModule;

    const type = safeString(req.query.type || 'player').toLowerCase();
    const data = parseData(req.query.data);
    const card = buildCard(type, data);
    const fonts = await loadFonts();

    const svg = await satori(card.node, {
      width: card.width,
      height: card.height,
      fonts
    });

    const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9, quality: 100 }).toBuffer();

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300');
    res.status(200).send(png);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
