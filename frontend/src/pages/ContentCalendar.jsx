import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, ChevronLeft, ChevronRight, ArrowUpRight, X, Filter } from 'lucide-react';
import api from '../utils/api';
import PageShell from '../components/PageShell';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DOW = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const typeColors = {
  published: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)', color: '#34d399', dot: '#34d399' },
  scheduled_publish: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', color: '#f59e0b', dot: '#f59e0b' },
  scheduled_unpublish: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', color: '#fca5a5', dot: '#ef4444' },
  created: { bg: 'rgba(99,102,241,0.12)', border: 'rgba(99,102,241,0.25)', color: '#818cf8', dot: '#6366f1' },
};

const typeLabels = {
  published: 'Published',
  scheduled_publish: 'Scheduled Publish',
  scheduled_unpublish: 'Scheduled Unpublish',
  created: 'Created',
};

export default function ContentCalendar() {
  const now = new Date();
  const navigate = useNavigate();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [entries, setEntries] = useState([]);
  const [contentTypes, setContentTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterCT, setFilterCT] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDayEntries, setSelectedDayEntries] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/api/v1/calendar?year=${year}&month=${month}`),
      api.get('/api/v1/content-types'),
    ]).then(([cal, cts]) => {
      setEntries(cal.data.data || []);
      setContentTypes(cts.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [year, month]);

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDOW = new Date(year, month - 1, 1).getDay();
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month - 1;

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDOW }, (_, i) => null);

  const filtered = filterCT ? entries.filter(e => e.contentTypeSlug === filterCT) : entries;

  const map = {};
  filtered.forEach(e => {
    if (!map[e.day]) map[e.day] = [];
    map[e.day].push(e);
  });

  const prev = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else { setMonth(m => m - 1); } };
  const next = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else { setMonth(m => m + 1); } };
  const goToday = () => { setYear(today.getFullYear()); setMonth(today.getMonth() + 1); };

  const openDay = (day) => {
    const dayEntries = map[day] || [];
    if (dayEntries.length === 1) {
      navigate(`/content/${dayEntries[0].contentTypeSlug}`);
    } else if (dayEntries.length > 1) {
      setSelectedDay(day);
      setSelectedDayEntries(dayEntries);
    }
  };

  return (
    <PageShell
      title="Content Calendar"
      subtitle={`${MONTHS[month - 1]} ${year}`}
      icon={<Calendar style={{ width: '22px', height: '22px' }} />}
      iconColor="#8b5cf6"
      actions={
        <button onClick={goToday} className="btn-secondary" style={{ padding: '9px 16px', fontSize: '12px' }}>
          Today
        </button>
      }
    >
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <Filter style={{ width: '14px', height: '14px', color: '#64748b' }} />
        <select value={filterCT} onChange={e => setFilterCT(e.target.value)} className="select-field" style={{ width: '200px', fontSize: '12px' }}>
          <option value="">All Content Types</option>
          {contentTypes.map(ct => (
            <option key={ct._id} value={ct.slug}>{ct.name}</option>
          ))}
        </select>
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={prev} className="btn-ghost" style={{ padding: '8px 14px' }}>
            <ChevronLeft style={{ width: '16px', height: '16px' }} /> {MONTHS[month - 2] || 'Dec'}
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isCurrentMonth && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff7e5f' }} />}
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>
              {MONTHS[month - 1]} {year}
            </h2>
          </div>
          <button onClick={next} className="btn-ghost" style={{ padding: '8px 14px' }}>
            {MONTHS[month] || 'Jan'} <ChevronRight style={{ width: '16px', height: '16px' }} />
          </button>
        </div>

        {loading && <p style={{ textAlign: 'center', color: '#64748b', padding: '40px', fontSize: '13px' }}>Loading...</p>}

        {!loading && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px' }}>
              {DOW.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#475569', padding: '8px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{d}</div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
              {[...padding, ...days].map((day, i) => {
                const isToday = isCurrentMonth && day === today.getDate();
                const dayEntries = map[day] || [];
                const uniqueTypes = [...new Set(dayEntries.map(e => e.type))];
                return (
                  <div
                    key={i}
                    onClick={() => day && openDay(day)}
                    style={{
                      minHeight: '90px', padding: '6px', borderRadius: '8px', cursor: day ? 'pointer' : 'default',
                      background: day
                        ? isToday ? 'rgba(255,126,95,0.08)' : 'rgba(8,5,17,0.4)'
                        : 'transparent',
                      border: day
                        ? isToday ? '1px solid rgba(255,126,95,0.25)' : '1px solid rgba(255,255,255,0.04)'
                        : 'transparent',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { if (day) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; } }}
                    onMouseLeave={e => { if (day) { e.currentTarget.style.borderColor = isToday ? 'rgba(255,126,95,0.25)' : 'rgba(255,255,255,0.04)'; } }}
                  >
                    {day && (
                      <>
                        <div style={{
                          fontSize: '11px', fontWeight: isToday ? '700' : '600',
                          color: isToday ? '#ff7e5f' : '#64748b', marginBottom: '4px',
                        }}>
                          {day}
                        </div>
                        <div style={{ display: 'flex', gap: '3px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          {uniqueTypes.map(t => (
                            <div key={t} style={{
                              width: '6px', height: '6px', borderRadius: '50%',
                              background: typeColors[t]?.dot || '#6366f1',
                            }} />
                          ))}
                        </div>
                        {dayEntries.slice(0, 2).map(e => {
                          const tc = typeColors[e.type] || typeColors.created;
                          return (
                            <Link key={e._id + e.type} to={`/content/${e.contentTypeSlug}`} onClick={e => e.stopPropagation()} style={{
                              display: 'block', padding: '2px 6px', marginBottom: '2px', borderRadius: '4px',
                              fontSize: '10px', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              background: tc.bg, border: `1px solid ${tc.border}`, color: tc.color,
                            }} title={`${e.label} (${typeLabels[e.type]})`}>
                              {e.label}
                            </Link>
                          );
                        })}
                        {dayEntries.length > 2 && (
                          <div style={{ fontSize: '9px', color: '#475569', paddingLeft: '6px' }}>+{dayEntries.length - 2} more</div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {Object.entries(typeColors).map(([key, tc]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: tc.color }} />
            {typeLabels[key]}
          </div>
        ))}
      </div>

      {/* Day detail modal */}
      {selectedDay && (
        <div className="modal-backdrop" onClick={() => setSelectedDay(null)}>
          <div className="glass-card" style={{ maxWidth: '500px', width: '90%', padding: '24px', maxHeight: '70vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>
                {MONTHS[month - 1]} {selectedDay}, {year}
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 400, marginLeft: '8px' }}>
                  {selectedDayEntries.length} events
                </span>
              </h3>
              <button onClick={() => setSelectedDay(null)} className="btn-ghost" style={{ padding: '6px' }}>
                <X style={{ width: '16px', height: '16px' }} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedDayEntries.map(e => {
                const tc = typeColors[e.type] || typeColors.created;
                return (
                  <Link key={e._id + e.type} to={`/content/${e.contentTypeSlug}`} onClick={() => setSelectedDay(null)} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '10px', textDecoration: 'none',
                    background: tc.bg, border: `1px solid ${tc.border}`,
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = tc.bg.replace('0.12', '0.2'); }}
                    onMouseLeave={e => { e.currentTarget.style.background = tc.bg; }}
                  >
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tc.dot, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: tc.color }}>{e.label}</div>
                      <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', gap: '8px', marginTop: '2px' }}>
                        <span>/{e.contentTypeSlug}</span>
                        <span>{typeLabels[e.type]}</span>
                      </div>
                    </div>
                    <ArrowUpRight style={{ width: '14px', height: '14px', color: tc.color, flexShrink: 0 }} />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
