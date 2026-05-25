import { useState, useEffect } from 'react';
import { History, RotateCcw, Eye, X, Clock, User, FileText, GitCompare, ArrowRight, Plus, Minus, Pencil } from 'lucide-react';
import api from '../utils/api';

const statusColors = { draft: '#f59e0b', published: '#34d399' };

function DiffView({ diff, fromVersion, toVersion }) {
  const [showUnchanged, setShowUnchanged] = useState(false);
  const hasChanges = Object.keys(diff.added).length > 0 || Object.keys(diff.removed).length > 0 || Object.keys(diff.changed).length > 0;

  if (!hasChanges) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
        No differences between these versions.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', fontSize: '11px' }}>
        <div style={{ flex: 1, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px' }}>
          <span style={{ color: '#94a3b8' }}>From: </span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>v{fromVersion.version}</span>
          <span style={{ color: '#64748b', marginLeft: '8px' }}>{new Date(fromVersion.createdAt).toLocaleString()}</span>
        </div>
        <ArrowRight style={{ width: '14px', height: '14px', color: '#64748b', alignSelf: 'center', flexShrink: 0 }} />
        <div style={{ flex: 1, padding: '8px 12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '8px' }}>
          <span style={{ color: '#94a3b8' }}>To: </span>
          <span style={{ color: '#f8fafc', fontWeight: 600 }}>v{toVersion.version}</span>
          <span style={{ color: '#64748b', marginLeft: '8px' }}>{new Date(toVersion.createdAt).toLocaleString()}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', fontSize: '11px', color: '#64748b' }}>
        <span style={{ color: '#34d399' }}>+{Object.keys(diff.added).length} added</span>
        <span style={{ color: '#f87171' }}>-{Object.keys(diff.removed).length} removed</span>
        <span style={{ color: '#fbbf24' }}>~{Object.keys(diff.changed).length} changed</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Object.entries(diff.added).map(([key, val]) => (
          <div key={key} style={{
            background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: '8px', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
              <Plus style={{ width: '12px', height: '12px', color: '#34d399', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>{key}</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(34,197,94,0.12)', color: '#34d399' }}>Added</span>
            </div>
            <div style={{ padding: '0 12px 8px 32px' }}>
              <code style={{ fontSize: '12px', color: '#86efac', fontFamily: 'ui-monospace, monospace' }}>{JSON.stringify(val.new)}</code>
            </div>
          </div>
        ))}

        {Object.entries(diff.removed).map(([key, val]) => (
          <div key={key} style={{
            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '8px', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
              <Minus style={{ width: '12px', height: '12px', color: '#f87171', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>{key}</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(239,68,68,0.12)', color: '#f87171' }}>Removed</span>
            </div>
            <div style={{ padding: '0 12px 8px 32px' }}>
              <code style={{ fontSize: '12px', color: '#fca5a5', fontFamily: 'ui-monospace, monospace' }}>{JSON.stringify(val.old)}</code>
            </div>
          </div>
        ))}

        {Object.entries(diff.changed).map(([key, val]) => (
          <div key={key} style={{
            background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '8px', overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
              <Pencil style={{ width: '12px', height: '12px', color: '#fbbf24', flexShrink: 0 }} />
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>{key}</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(251,191,36,0.12)', color: '#fbbf24' }}>Changed</span>
            </div>
            <div style={{ padding: '0 12px 8px 32px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#f87171' }}>—</span>
                <code style={{ fontSize: '12px', color: '#fca5a5', fontFamily: 'ui-monospace, monospace', textDecoration: 'line-through' }}>{JSON.stringify(val.old)}</code>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: '#34d399' }}>+</span>
                <code style={{ fontSize: '12px', color: '#86efac', fontFamily: 'ui-monospace, monospace' }}>{JSON.stringify(val.new)}</code>
              </div>
            </div>
          </div>
        ))}
      </div>

      {Object.keys(diff.unchanged).length > 0 && (
        <div style={{ marginTop: '12px' }}>
          <button onClick={() => setShowUnchanged(!showUnchanged)} className="btn-ghost" style={{ fontSize: '11px', color: '#64748b', padding: '4px 8px', width: '100%', justifyContent: 'center' }}>
            {showUnchanged ? 'Hide' : 'Show'} unchanged fields ({Object.keys(diff.unchanged).length})
          </button>
          {showUnchanged && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
              {Object.keys(diff.unchanged).map(key => (
                <span key={key} style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'rgba(100,116,139,0.08)', color: '#64748b' }}>{key}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function VersionHistory({ slug, entryId, entryName, onClose, onRollback }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [rollbacking, setRollbacking] = useState(null);
  const [error, setError] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSelection, setCompareSelection] = useState([]);
  const [diffData, setDiffData] = useState(null);

  useEffect(() => {
    api.get(`/api/v1/dynamic/${slug}/${entryId}/versions`)
      .then(r => { setVersions(r.data.data || []); setLoading(false); })
      .catch(err => { setError(err.response?.data?.message || 'Failed to load versions'); setLoading(false); });
  }, [slug, entryId]);

  useEffect(() => {
    if (compareSelection.length === 2) {
      const [v1, v2] = compareSelection;
      const from = v1.version < v2.version ? v1._id : v2._id;
      const to = v1.version < v2.version ? v2._id : v1._id;
      api.get(`/api/v1/dynamic/${slug}/${entryId}/versions/diff?from=${from}&to=${to}`)
        .then(r => setDiffData(r.data))
        .catch(err => setError(err.response?.data?.message || 'Diff failed'));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDiffData(null);
    }
  }, [compareSelection, slug, entryId]);

  const handleRollback = async (version) => {
    if (!confirm(`Rollback to version ${version.version}? Current data will be overwritten.`)) return;
    setRollbacking(version._id);
    try {
      await api.post(`/api/v1/dynamic/${slug}/${entryId}/rollback/${version._id}`);
      onRollback?.();
      onClose?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Rollback failed');
    } finally {
      setRollbacking(null);
    }
  };

  const toggleCompare = (v) => {
    setCompareSelection(prev => {
      if (prev.find(p => p._id === v._id)) return prev.filter(p => p._id !== v._id);
      if (prev.length >= 2) return [prev[1], v];
      return [...prev, v];
    });
  };

  const exitCompareMode = () => {
    setCompareMode(false);
    setCompareSelection([]);
    setDiffData(null);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="glass-card" style={{ width: '90%', maxWidth: diffData ? '800px' : '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn 0.2s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255, 126, 95, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 126, 95, 0.2)' }}>
              <History style={{ width: '16px', height: '16px', color: '#ff7e5f' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>
                {diffData ? 'Version Comparison' : 'Version History'}
              </h2>
              <p style={{ fontSize: '12px', color: '#64748b' }}>{entryName}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {!compareMode && (
              <button onClick={() => setCompareMode(true)} className="btn-ghost" style={{ padding: '8px', color: '#94a3b8' }} title="Compare versions">
                <GitCompare style={{ width: '16px', height: '16px' }} />
              </button>
            )}
            {compareMode && (
              <button onClick={exitCompareMode} className="btn-ghost" style={{ padding: '8px', color: '#f59e0b', fontSize: '11px' }}>
                Exit Compare
              </button>
            )}
            <button onClick={onClose} className="btn-ghost" style={{ padding: '8px' }}>
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
              <div className="spinner" style={{ margin: '0 auto 12px' }} />
              Loading versions...
            </div>
          )}

          {error && (
            <div style={{ padding: '14px 18px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#fca5a5', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {!loading && !error && versions.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
              No version history yet.
            </div>
          )}

          {compareMode && (
            <div style={{ marginBottom: '12px', fontSize: '12px', color: '#64748b', padding: '8px 12px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)', borderRadius: '8px' }}>
              Select two versions to compare ({compareSelection.length}/2 selected)
            </div>
          )}

          {diffData && (
            <div style={{ marginBottom: '16px' }}>
              <DiffView diff={diffData.diff} fromVersion={diffData.fromVersion} toVersion={diffData.toVersion} />
            </div>
          )}

          {!loading && !error && versions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {versions.map((v, idx) => {
                const isLatest = idx === 0;
                const isSelected = selectedVersion?._id === v._id;
                const isCompareSelected = compareSelection.find(p => p._id === v._id);
                return (
                  <div key={v._id} className="version-card" style={{
                    borderRadius: '10px', border: isCompareSelected ? '1px solid rgba(251,191,36,0.3)' : isSelected ? '1px solid rgba(255,126,95,0.3)' : '1px solid rgba(255,255,255,0.06)',
                    background: isCompareSelected ? 'rgba(251,191,36,0.06)' : isSelected ? 'rgba(255,126,95,0.06)' : 'rgba(8,5,17,0.3)', overflow: 'hidden',
                    transition: 'all 0.15s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px' }}>
                      {compareMode && (
                        <div onClick={() => toggleCompare(v)} style={{ cursor: 'pointer', flexShrink: 0, width: '20px', height: '20px', borderRadius: '4px', border: isCompareSelected ? '2px solid #f59e0b' : '2px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isCompareSelected ? 'rgba(251,191,36,0.2)' : 'transparent' }}>
                          {isCompareSelected && <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: 700 }}>{isCompareSelected === compareSelection[0] ? '1' : '2'}</span>}
                        </div>
                      )}
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: isLatest ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.04)',
                        border: isLatest ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <FileText style={{ width: '14px', height: '14px', color: isLatest ? '#34d399' : '#475569' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                          <span style={{ fontSize: '14px', fontWeight: '600', color: '#f8fafc' }}>
                            v{v.version}
                          </span>
                          {isLatest && <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: '600' }}>Latest</span>}
                          <span style={{
                            marginLeft: 'auto', fontSize: '10px', padding: '2px 8px', borderRadius: '4px',
                            background: `${statusColors[v.status]}15`, color: statusColors[v.status], fontWeight: '600'
                          }}>{v.status}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: '#64748b' }}>
                          {v.changeDescription && <span>{v.changeDescription}</span>}
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock style={{ width: '10px', height: '10px' }} />
                            {new Date(v.createdAt).toLocaleString()}
                          </span>
                          {v.createdBy && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User style={{ width: '10px', height: '10px' }} />
                            {v.createdBy.substring(0, 8)}
                          </span>}
                        </div>
                      </div>
                      {!compareMode && (
                        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                          <button onClick={() => setSelectedVersion(isSelected ? null : v)} className="btn-ghost" style={{ padding: '6px' }} title="View details">
                            <Eye style={{ width: '14px', height: '14px' }} />
                          </button>
                          <button onClick={() => handleRollback(v)} disabled={rollbacking === v._id || isLatest} className="btn-ghost" style={{ padding: '6px', color: isLatest ? '#475569' : '#f59e0b' }} title={isLatest ? 'Already latest' : 'Rollback to this version'}>
                            <RotateCcw style={{ width: '14px', height: '14px', animation: rollbacking === v._id ? 'spin 1s linear infinite' : 'none' }} />
                          </button>
                        </div>
                      )}
                    </div>

                    {isSelected && !compareMode && (
                      <div style={{ padding: '0 14px 14px', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                        <pre style={{
                          margin: '12px 0 0', padding: '12px', background: 'rgba(8,5,17,0.6)', borderRadius: '8px',
                          border: '1px solid rgba(255,255,255,0.04)', fontSize: '12px', lineHeight: '1.6',
                          color: '#94a3b8', overflowX: 'auto', maxHeight: '300px', fontFamily: 'ui-monospace, monospace'
                        }}>
                          {JSON.stringify(v.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
