import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Lock, ShieldCheck, Bell, Palette, LogOut, Check, AlertCircle,
  BadgeCheck, Trash2,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import { DashReveal } from '../data.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { api, USING_MOCK } from '../../lib/api.js';
import { resetDemo } from '../../lib/mockApi.js';
import { fmtDate } from '../../lib/format.js';

function Section({ icon: Icon, title, subtitle, children }) {
  return (
    <div className="card rounded-2xl p-5 md:p-6">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(245,158,11,0.1)' }}>
          <Icon size={16} className="text-[color:var(--accent)]" />
        </div>
        <div>
          <p className="font-display text-[16px] font-medium text-[color:var(--ink)]">{title}</p>
          {subtitle && <p className="text-[12px] mt-0.5 text-[color:var(--muted-2)]">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ on, onChange, label, hint }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <div className="min-w-0">
        <p className="text-[13.5px] text-[color:var(--ink)]">{label}</p>
        {hint && <p className="text-[11.5px] mt-0.5 text-[color:var(--muted-2)]">{hint}</p>}
      </div>
      <button
        onClick={() => onChange(!on)}
        role="switch"
        aria-checked={on}
        aria-label={label}
        className="dash-toggle shrink-0"
        data-on={on}
      >
        <span className="dash-toggle-thumb" />
      </button>
    </div>
  );
}

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    country: user?.country || '',
  });
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwBusy, setPwBusy] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwErr, setPwErr] = useState('');

  const [twoFactor, setTwoFactor] = useState(!!user?.twoFactor);
  const [alerts, setAlerts] = useState({ transactions: true, statements: true, marketing: false });

  const kycStatus = user?.kyc?.status || 'unverified';

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileBusy(true);
    setProfileMsg('');
    try {
      const updated = await api.put('/api/users/me', profile);
      setUser(updated);
      setProfileMsg('Saved.');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err) {
      setProfileMsg(err.message);
    } finally {
      setProfileBusy(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwErr('');
    setPwMsg('');
    if (pw.newPassword.length < 8) { setPwErr('Use at least 8 characters.'); return; }
    if (pw.newPassword !== pw.confirm) { setPwErr('Those passwords don’t match.'); return; }
    setPwBusy(true);
    try {
      await api.put('/api/users/me/password', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwMsg('Password updated.');
      setTimeout(() => setPwMsg(''), 3000);
    } catch (err) {
      setPwErr(err.message);
    } finally {
      setPwBusy(false);
    }
  };

  const toggleTwoFactor = async (on) => {
    setTwoFactor(on);
    try {
      const updated = await api.put('/api/users/me', { twoFactor: on });
      setUser(updated);
    } catch {
      setTwoFactor(!on); // roll back the switch if the save didn't land
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Your account"
        title="Account Settings"
        subtitle="Profile, security and the alerts we send you."
      />

      <DashReveal className="grid lg:grid-cols-2 gap-4">
        <Section icon={User} title="Profile" subtitle="How we address you and reach you.">
          <form onSubmit={saveProfile} className="flex flex-col gap-4">
            <div>
              <label className="auth-label">Full name</label>
              <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} className="auth-field" />
            </div>
            <div>
              <label className="auth-label">Email</label>
              <input value={user?.email || ''} readOnly className="auth-field opacity-60" />
              <p className="text-[11px] mt-1.5 text-[color:var(--muted-2)]">Contact support to change the email on a bank account.</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="auth-label">Phone</label>
                <input value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} className="auth-field" />
              </div>
              <div>
                <label className="auth-label">Country</label>
                <input value={profile.country} onChange={(e) => setProfile((p) => ({ ...p, country: e.target.value }))} className="auth-field" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button type="submit" disabled={profileBusy} className="btn-gold text-[13px] px-5 py-3 disabled:opacity-60">
                {profileBusy ? 'Saving…' : 'Save changes'}
              </button>
              {profileMsg && <span className="flex items-center gap-1.5 text-[12.5px] text-[color:var(--up)]"><Check size={13} /> {profileMsg}</span>}
            </div>
          </form>
        </Section>

        <Section icon={Lock} title="Password" subtitle="Use something you don’t use anywhere else.">
          <form onSubmit={savePassword} className="flex flex-col gap-4">
            <div>
              <label className="auth-label">Current password</label>
              <input type="password" value={pw.currentPassword} onChange={(e) => { setPwErr(''); setPw((p) => ({ ...p, currentPassword: e.target.value })); }} className="auth-field" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="auth-label">New password</label>
                <input type="password" value={pw.newPassword} onChange={(e) => { setPwErr(''); setPw((p) => ({ ...p, newPassword: e.target.value })); }} className="auth-field" />
              </div>
              <div>
                <label className="auth-label">Confirm</label>
                <input type="password" value={pw.confirm} onChange={(e) => { setPwErr(''); setPw((p) => ({ ...p, confirm: e.target.value })); }} className="auth-field" />
              </div>
            </div>
            {pwErr && <p className="flex items-center gap-1.5 text-[12.5px] text-[color:var(--down)]"><AlertCircle size={13} /> {pwErr}</p>}
            <div className="flex items-center gap-3">
              <button type="submit" disabled={pwBusy} className="btn-gold text-[13px] px-5 py-3 disabled:opacity-60">
                {pwBusy ? 'Updating…' : 'Update password'}
              </button>
              {pwMsg && <span className="flex items-center gap-1.5 text-[12.5px] text-[color:var(--up)]"><Check size={13} /> {pwMsg}</span>}
            </div>
          </form>
        </Section>

        <Section icon={ShieldCheck} title="Security" subtitle="Extra locks on the door.">
          <Toggle
            on={twoFactor}
            onChange={toggleTwoFactor}
            label="Two-factor authentication"
            hint="Required for logins, wires and card changes."
          />
          <div className="flex items-center justify-between gap-4 py-3 mt-2 border-t border-[color:var(--rule-soft)]">
            <div>
              <p className="text-[13.5px] flex items-center gap-2 text-[color:var(--ink)]">
                Identity verification
                {kycStatus === 'verified' && <BadgeCheck size={14} className="text-[color:var(--up)]" />}
              </p>
              <p className="text-[11.5px] mt-0.5 text-[color:var(--muted-2)]">
                {kycStatus === 'verified'
                  ? `Approved${user?.kyc?.submittedAt ? ` · submitted ${fmtDate(user.kyc.submittedAt)}` : ''}`
                  : kycStatus === 'pending' ? 'In review — usually within 24 hours'
                    : 'Required before withdrawals and wires'}
              </p>
            </div>
            <button onClick={() => navigate('/dashboard/kyc')} className="btn-ghost text-[12px] px-4 py-2 shrink-0">
              {kycStatus === 'verified' ? 'View' : 'Verify'}
            </button>
          </div>
        </Section>

        <Section icon={Bell} title="Alerts" subtitle="What lands in your inbox.">
          <Toggle on={alerts.transactions} onChange={(v) => setAlerts((a) => ({ ...a, transactions: v }))} label="Transaction alerts" hint="Every card charge, transfer and deposit." />
          <Toggle on={alerts.statements} onChange={(v) => setAlerts((a) => ({ ...a, statements: v }))} label="Monthly statements" hint="A PDF summary on the first of each month." />
          <Toggle on={alerts.marketing} onChange={(v) => setAlerts((a) => ({ ...a, marketing: v }))} label="Product news" hint="New rates and products. No more than monthly." />
        </Section>
      </DashReveal>

      <DashReveal delay={80}>
        <Section icon={Palette} title="Session" subtitle="Theme follows your device unless you pick one in the top bar.">
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => { logout(); navigate('/login'); }} className="btn-ghost text-[13px] px-5 py-3 flex items-center gap-1.5">
              <LogOut size={14} /> Log out
            </button>
            {USING_MOCK && (
              <button
                onClick={() => { resetDemo(); logout(); navigate('/login'); }}
                className="btn-ghost text-[13px] px-5 py-3 flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Reset demo data
              </button>
            )}
          </div>
          {USING_MOCK && (
            <p className="text-[11.5px] mt-3 leading-relaxed text-[color:var(--muted-2)]">
              Running against the in-browser demo backend. Set <span className="font-mono">VITE_API_URL</span> to
              point the app at a real server — no other change is needed.
            </p>
          )}
        </Section>
      </DashReveal>
    </>
  );
}
