import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, IdCard, FileText, Upload, Check, ArrowRight, ArrowLeft,
  AlertCircle, Clock, BadgeCheck, Lock,
} from 'lucide-react';
import PageHeader from './PageHeader.jsx';
import Stepper from '../components/Stepper.jsx';
import { DashReveal } from '../data.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import { api } from '../../lib/api.js';
import { fmtDate } from '../../lib/format.js';

const STEPS = ['Your details', 'Document', 'Submit'];

const DOC_TYPES = [
  { id: 'passport', label: 'Passport', icon: IdCard, hint: 'Photo page, all four corners visible' },
  { id: 'drivers-license', label: 'Driver’s licence', icon: IdCard, hint: 'Front and back' },
  { id: 'national-id', label: 'National ID card', icon: FileText, hint: 'Front and back' },
];

export default function Kyc() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const status = user?.kyc?.status || 'unverified';

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    fullName: user?.name || '',
    dob: '',
    address: '',
    city: '',
    postcode: '',
    country: user?.country || '',
  });
  const [documentType, setDocumentType] = useState('passport');
  const [fileName, setFileName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const update = (k) => (e) => { setError(''); setForm((f) => ({ ...f, [k]: e.target.value })); };

  /* ---------- already submitted / approved ---------- */
  if (status === 'pending' || status === 'verified') {
    const approved = status === 'verified';
    return (
      <>
        <PageHeader eyebrow="Compliance" title="Identity verification" />
        <DashReveal>
          <div className="card dash-surface rounded-3xl p-8 md:p-12 flex flex-col items-center text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: approved ? 'rgba(52,211,153,0.12)' : 'rgba(245,158,11,0.12)' }}
            >
              {approved
                ? <BadgeCheck size={28} className="text-[color:var(--up)]" />
                : <Clock size={28} className="text-[color:var(--accent)]" />}
            </div>
            <h3 className="font-display text-[22px] font-semibold mt-5 text-[color:var(--ink)]">
              {approved ? 'You’re verified' : 'Documents in review'}
            </h3>
            <p className="text-[13.5px] mt-2 max-w-sm leading-relaxed text-[color:var(--muted-2)]">
              {approved
                ? 'Withdrawals, wires and higher limits are open on your account.'
                : 'Our compliance team is reviewing your submission — this usually completes within 24 hours. We’ll email you the moment it clears.'}
            </p>
            {user?.kyc?.submittedAt && (
              <p className="text-[11.5px] mt-3 text-[color:var(--muted-2)]">
                Submitted {fmtDate(user.kyc.submittedAt)}
                {user.kyc.documentType ? ` · ${user.kyc.documentType.replace(/-/g, ' ')}` : ''}
              </p>
            )}
            <button onClick={() => navigate('/dashboard')} className="btn-gold text-[13.5px] px-7 py-3 mt-7">
              Back to overview
            </button>
          </div>
        </DashReveal>
      </>
    );
  }

  /* ---------- submission wizard ---------- */
  const detailsReady = form.fullName.trim() && form.dob && form.address.trim() && form.country.trim();

  const next = () => {
    if (step === 0 && !detailsReady) { setError('Fill in your name, date of birth, address and country.'); return; }
    if (step === 1 && !fileName) { setError('Attach a photo of your document to continue.'); return; }
    setError('');
    setStep((s) => s + 1);
  };

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      const updated = await api.post('/api/kyc', {
        documentType,
        fullName: form.fullName,
        dob: form.dob,
        address: `${form.address}, ${form.city} ${form.postcode}, ${form.country}`.trim(),
      });
      setUser(updated);
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="Compliance"
        title="Verify your identity"
        subtitle="Required by law before we can open the full account. It takes about two minutes."
      />

      <DashReveal>
        <div className="card dash-surface rounded-3xl p-6 md:p-8">
          <Stepper steps={STEPS} current={step} />

          <div className="mt-8 dash-step-panel" key={step}>
            {step === 0 && (
              <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
                <div>
                  <label className="auth-label">Full legal name</label>
                  <input value={form.fullName} onChange={update('fullName')} placeholder="Alexandra Reyes" className="auth-field" />
                </div>
                <div>
                  <label className="auth-label">Date of birth</label>
                  <input type="date" value={form.dob} onChange={update('dob')} className="auth-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="auth-label">Residential address</label>
                  <input value={form.address} onChange={update('address')} placeholder="1420 Sansome Street, Apt 6B" className="auth-field" />
                </div>
                <div>
                  <label className="auth-label">City</label>
                  <input value={form.city} onChange={update('city')} placeholder="San Francisco" className="auth-field" />
                </div>
                <div>
                  <label className="auth-label">Postal code</label>
                  <input value={form.postcode} onChange={update('postcode')} placeholder="94111" className="auth-field" />
                </div>
                <div className="md:col-span-2">
                  <label className="auth-label">Country</label>
                  <input value={form.country} onChange={update('country')} placeholder="United States" className="auth-field" />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="max-w-2xl">
                <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)] mb-3">Document type</p>
                <div className="grid sm:grid-cols-3 gap-3">
                  {DOC_TYPES.map((d) => {
                    const selected = documentType === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => setDocumentType(d.id)}
                        className="flex flex-col text-left p-4 rounded-2xl transition-colors"
                        style={{
                          background: selected ? 'rgba(245,158,11,0.09)' : 'var(--surface-2)',
                          border: `1px solid ${selected ? 'var(--accent)' : 'var(--rule-soft)'}`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <d.icon size={17} className="text-[color:var(--accent)]" />
                          {selected && <Check size={15} className="text-[color:var(--accent)]" />}
                        </div>
                        <p className="text-[13.5px] font-medium mt-3 text-[color:var(--ink)]">{d.label}</p>
                        <p className="text-[11px] mt-1 leading-relaxed text-[color:var(--muted-2)]">{d.hint}</p>
                      </button>
                    );
                  })}
                </div>

                <label
                  className="flex flex-col items-center justify-center gap-2 mt-5 px-6 py-10 rounded-2xl cursor-pointer text-center"
                  style={{ border: `1.5px dashed ${fileName ? 'var(--accent)' : 'var(--rule)'}`, background: 'var(--surface-2)' }}
                >
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => { setError(''); setFileName(e.target.files?.[0]?.name || ''); }}
                  />
                  {fileName ? <Check size={22} className="text-[color:var(--up)]" /> : <Upload size={22} className="text-[color:var(--muted-2)]" />}
                  <p className="text-[13.5px] text-[color:var(--ink)]">{fileName || 'Tap to attach a photo or PDF'}</p>
                  <p className="text-[11.5px] text-[color:var(--muted-2)]">
                    Clear, uncropped, under 10 MB. JPG, PNG or PDF.
                  </p>
                </label>

                <p className="flex items-start gap-2 text-[11.5px] mt-4 leading-relaxed text-[color:var(--muted-2)]">
                  <Lock size={13} className="text-[color:var(--accent)] shrink-0 mt-0.5" />
                  Documents are encrypted in transit and at rest, seen only by our compliance team,
                  and never shared with third parties for marketing.
                </p>
              </div>
            )}

            {step === 2 && (
              <div className="max-w-md">
                <div className="card-grad rounded-2xl p-6">
                  <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted-2)] mb-4">Review submission</p>
                  {[
                    ['Name', form.fullName],
                    ['Date of birth', form.dob],
                    ['Address', [form.address, form.city, form.postcode, form.country].filter(Boolean).join(', ')],
                    ['Document', DOC_TYPES.find((d) => d.id === documentType)?.label],
                    ['File', fileName],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-start justify-between gap-4 py-1.5 text-[13px]">
                      <span className="text-[color:var(--muted-2)] shrink-0">{k}</span>
                      <span className="text-[color:var(--ink)] text-right break-words">{v}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11.5px] mt-4 leading-relaxed text-[color:var(--muted-2)]">
                  By submitting you confirm the information is accurate and the document belongs to you.
                  Reviews usually finish within 24 hours.
                </p>
              </div>
            )}

            {error && (
              <p className="flex items-center gap-1.5 text-[12.5px] mt-5 text-[color:var(--down)]">
                <AlertCircle size={13} /> {error}
              </p>
            )}

            <div className="flex items-center gap-3 mt-8">
              {step > 0 && (
                <button onClick={() => { setError(''); setStep((s) => s - 1); }} className="btn-ghost text-[13px] px-5 py-3 flex items-center gap-1.5">
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              {step < 2 ? (
                <button onClick={next} className="btn-gold text-[13.5px] px-7 py-3 flex items-center gap-1.5">
                  Continue <ArrowRight size={15} />
                </button>
              ) : (
                <button onClick={submit} disabled={busy} className="btn-gold text-[13.5px] px-7 py-3 flex items-center gap-1.5 disabled:opacity-60">
                  {busy ? 'Submitting…' : 'Submit for review'} <ShieldCheck size={15} />
                </button>
              )}
            </div>
          </div>
        </div>
      </DashReveal>

      <DashReveal delay={80} className="grid sm:grid-cols-3 gap-4">
        {[
          { icon: ShieldCheck, title: 'Why we ask', body: 'Anti-money-laundering law requires banks to know who holds each account.' },
          { icon: Clock, title: 'How long it takes', body: 'Most submissions clear within 24 hours; complex cases within three days.' },
          { icon: Lock, title: 'What happens to it', body: 'Stored encrypted, retained only as long as regulation requires, never sold.' },
        ].map((c) => (
          <div key={c.title} className="card dash-surface rounded-2xl p-5">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <c.icon size={16} className="text-[color:var(--accent)]" />
            </div>
            <p className="text-[14px] font-medium mt-3.5 text-[color:var(--ink)]">{c.title}</p>
            <p className="text-[12.5px] mt-1.5 leading-relaxed text-[color:var(--muted-2)]">{c.body}</p>
          </div>
        ))}
      </DashReveal>
    </>
  );
}
