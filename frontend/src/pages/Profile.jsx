import { useState, useEffect } from 'react';
import { User, Mail, Edit2, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import LoadingButton from '../components/LoadingButton';
import PageShell from '../components/PageShell';

export default function Profile() {
  const { user, isLoaded } = useUser();
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isLoaded && user) {
      setForm({
        username: user.firstName || user.username || '',
        email: user.primaryEmailAddress?.emailAddress || '',
      });
    }
  }, [isLoaded, user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await user.update({ firstName: form.username });
      setMessage('Profile updated');
      setEditing(false);
    } catch (err) {
      setMessage('Failed to update');
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) return <div style={{ padding: '32px', color: '#64748b' }}>Loading profile...</div>;

  return (
    <PageShell
      title="Profile"
      subtitle="Manage your account details"
      icon={<User style={{ width: '22px', height: '22px' }} />}
      maxWidth="800px"
    >
      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: '12px',
          background: message.includes('Failed') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
          border: `1px solid ${message.includes('Failed') ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
          color: message.includes('Failed') ? '#fca5a5' : '#34d399',
          marginBottom: '20px', fontSize: '13px'
        }}>
          {message}
        </div>
      )}

      <div className="glass-card" style={{ padding: '28px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>Account Details</h3>
          <button onClick={() => setEditing(!editing)} className="btn-ghost">
            {editing ? <X style={{ width: '12px', height: '12px' }} /> : <Edit2 style={{ width: '12px', height: '12px' }} />} {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff7e5f, #feb47b)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '800', color: '#080511',
            fontFamily: "var(--font-heading)",
            boxShadow: '0 4px 15px rgba(255,126,95,0.3)'
          }}>
            {form.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ fontSize: '20px', fontWeight: '700', color: '#f8fafc', fontFamily: "var(--font-heading)" }}>{form.username}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
              <User style={{ width: '12px', height: '12px' }} /> Username
            </label>
            {editing ? (
              <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} className="input-field" />
            ) : (
              <p style={{ fontSize: '14px', color: '#f8fafc' }}>{form.username}</p>
            )}
          </div>
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginBottom: '6px' }}>
              <Mail style={{ width: '12px', height: '12px' }} /> Email
            </label>
            <p style={{ fontSize: '14px', color: '#f8fafc' }}>{form.email}</p>
          </div>
        </div>

        {editing && (
          <div style={{ marginTop: '24px' }}>
            <LoadingButton onClick={handleSave} loading={saving} className="btn-primary" style={{ border: 'none' }}>Save Changes</LoadingButton>
          </div>
        )}
      </div>
    </PageShell>
  );
}
