import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  User, Mail, Phone, Globe, Eye, EyeOff, ArrowRight, ArrowLeft,
  Check, ShieldCheck, RefreshCw,
} from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { useAuth } from './AuthContext.jsx';

/* ============================================================
   Account opening — a three-step wizard so the form never feels
   like a wall: who you are → how you'll sign in → confirm & agree.
   ============================================================ */

const STEPS = ['Your details', 'Security', 'Confirm'];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Ireland', 'Germany', 'France',
  'Netherlands', 'Spain', 'Italy', 'Switzerland', 'United Arab Emirates',
  'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'India', 'Singapore',
  'Australia', 'New Zealand', 'Japan', 'Brazil', 'Mexico',
];

const randomCode = () => Math.random().toString(36).replace(/[^a-z0-9]/g, '').slice(0, 5).toUpperCase();

/* 0–4: length, case mix, digit, symbol */
function strengthOf(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}
const STRENGTH_LABEL = ['Too short', 'Weak', 'Fair', 'Strong', 'Excellent'];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [params] = useSearchParams();

  const [step, setStep] = useState(0);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', country: 'United States',
    password: '', confirm: '',
    referral: params.get('ref') || '',
  });
  const [captcha, setCaptcha] = useState(randomCode);
  const [captchaInput, setCaptchaInput] = useState('');
  const [human, setHuman] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => { setError(''); setForm((f) => ({ ...f, [k]: e.target.value })); };
  const strength = useMemo(() => strengthOf(form.password), [form.password]);

  const stepValid = () => {
    if (step === 0) return form.name.trim().length > 1 && /\S+@\S+\.\S+/.test(form.email);
    if (step === 1) return strength >= 2 && form.password === form.confirm;
    return human && agreed && captchaInput.trim().toUpperCase() === captcha;
  };

  const next = () => {
    if (!stepValid()) {
      setError(
        step === 0 ? 'Add your full name and a valid email address.'
          : step === 1 ? (form.password !== form.confirm ? 'Those passwords don’t match.' : 'Pick a stronger password — 8+ characters with mixed case or a number.')
            : 'Complete the checks below to continue.'
      );
      return;
    }
    setError('');
    setStep((s) => s + 1);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!stepValid()) { setError('Complete the checks below to continue.'); return; }
    setSubmitting(true);
    setError('');
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        country: form.country,
        password: form.password,
        referral: form.referral.trim() || undefined,
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-6">
        <p className="text-[11px] tracking-widest uppercase text-[color:var(--accent-soft)] mb-2">Open an account</p>
        <h1 className="font-display text-[28px] font-semibold text-[color:var(--ink)]">Start banking and investing</h1>
        <p className="text-[13.5px] mt-2 text-[color:var(--muted-2)]">
          Three short steps. No monthly fee, no minimum balance.
        </p>
      </div>

      <div className="auth-steps">
        {STEPS.map((label, i) => (
          <div key={label} className="flex-1">
            <div className="auth-step-bar" data-done={i <= step} />
            <p className={`text-[10.5px] mt-2 ${i === step ? 'text-[color:var(--ink)]' : 'text-[color:var(--muted-2)]'}`}>{label}</p>
          </div>
        ))}
      </div>

      <form onSubmit={step === 2 ? submit : (e) => { e.preventDefault(); next(); }} className="flex flex-col gap-4">
        {step === 0 && (
          <div key="s0" className="auth-panel flex flex-col gap-4">
            <div>
              <label className="auth-label" htmlFor="name">Full legal name</label>
              <div className="auth-field-wrap">
                <input id="name" required value={form.name} onChange={update('name')} placeholder="Alexandra Reyes" className="auth-field" style={{ paddingRight: 40 }} />
                <span className="auth-field-icon"><User size={16} /></span>
              </div>
            </div>
            <div>
              <label className="auth-label" htmlFor="email">Email address</label>
              <div className="auth-field-wrap">
                <input id="email" type="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" className="auth-field" style={{ paddingRight: 40 }} />
                <span className="auth-field-icon"><Mail size={16} /></span>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="auth-label" htmlFor="phone">Phone (optional)</label>
                <div className="auth-field-wrap">
                  <input id="phone" value={form.phone} onChange={update('phone')} placeholder="+1 415 555 0142" className="auth-field" style={{ paddingRight: 40 }} />
                  <span className="auth-field-icon"><Phone size={16} /></span>
                </div>
              </div>
              <div>
                <label className="auth-label" htmlFor="country">Country of residence</label>
                <div className="auth-field-wrap">
                  <select id="country" value={form.country} onChange={update('country')} className="auth-field" style={{ paddingRight: 40, appearance: 'none' }}>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className="auth-field-icon"><Globe size={16} /></span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div key="s1" className="auth-panel flex flex-col gap-4">
            <div>
              <label className="auth-label" htmlFor="password">Create a password</label>
              <div className="auth-field-wrap">
                <input id="password" type={showPw ? 'text' : 'password'} required value={form.password} onChange={update('password')} placeholder="••••••••" className="auth-field" style={{ paddingRight: 40 }} />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="auth-field-icon" aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="auth-strength">
                {[0, 1, 2, 3].map((i) => <span key={i} data-on={i < strength} />)}
              </div>
              <p className="text-[11px] mt-1.5 text-[color:var(--muted-2)]">
                {form.password ? STRENGTH_LABEL[strength] : 'At least 8 characters, with mixed case or a number.'}
              </p>
            </div>
            <div>
              <label className="auth-label" htmlFor="confirm">Confirm password</label>
              <input id="confirm" type={showPw ? 'text' : 'password'} required value={form.confirm} onChange={update('confirm')} placeholder="••••••••" className="auth-field" />
            </div>
            <div>
              <label className="auth-label" htmlFor="referral">Referral code (optional)</label>
              <input id="referral" value={form.referral} onChange={update('referral')} placeholder="AURI-XXXXX" className="auth-field font-mono" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div key="s2" className="auth-panel flex flex-col gap-4">
            <div className="card rounded p-5">
              <p className="text-[10.5px] uppercase tracking-widest text-[color:var(--muted-2)] mb-3">Review</p>
              {[
                ['Name', form.name],
                ['Email', form.email],
                ['Country', form.country],
                ['Phone', form.phone || '—'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-1.5 text-[13px]">
                  <span className="text-[color:var(--muted-2)]">{k}</span>
                  <span className="text-[color:var(--ink)] truncate ml-4">{v}</span>
                </div>
              ))}
            </div>

            <div className="auth-captcha">
              <span
                role="checkbox"
                aria-checked={human}
                tabIndex={0}
                onClick={() => setHuman((v) => !v)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setHuman((v) => !v); } }}
                className="auth-captcha-box"
                data-checked={human}
              >
                {human && <Check size={14} className="text-[color:var(--on-accent)]" strokeWidth={3} />}
              </span>
              <span className="text-[13px] text-[color:var(--ink)]">I&rsquo;m not a robot</span>
              <span className="auth-captcha-code">{captcha}</span>
              <button type="button" onClick={() => { setCaptcha(randomCode()); setCaptchaInput(''); }} aria-label="New code" className="text-[color:var(--muted-2)] hover:text-[color:var(--ink)]">
                <RefreshCw size={14} />
              </button>
            </div>
            <input
              value={captchaInput}
              onChange={(e) => { setError(''); setCaptchaInput(e.target.value); }}
              placeholder="Type the code above"
              className="auth-field font-mono tracking-[0.3em] uppercase"
            />

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-[color:var(--accent)]" />
              <span className="text-[12px] leading-relaxed text-[color:var(--muted)]">
                I agree to the Client Agreement, Deposit Account Terms and Privacy Notice, and I understand
                that investment products are not deposits, are not insured, and may lose value.
              </span>
            </label>
          </div>
        )}

        {error && <p className="text-[12.5px] text-[color:var(--down)]">{error}</p>}

        <div className="flex items-center gap-3 mt-2">
          {step > 0 && (
            <button type="button" onClick={() => { setError(''); setStep((s) => s - 1); }} className="btn-outline text-[13.5px] px-5 py-3.5 flex items-center gap-1.5">
              <ArrowLeft size={15} /> Back
            </button>
          )}
          <button type="submit" disabled={submitting} className="btn-solid flex-1 text-[14px] px-6 py-3.5 flex items-center justify-center gap-2 disabled:opacity-60">
            {step === 2 ? (submitting ? 'Opening your account…' : 'Open my account') : 'Continue'} <ArrowRight size={16} />
          </button>
        </div>
      </form>

      <p className="flex items-center justify-center gap-1.5 text-[11.5px] mt-5 text-[color:var(--muted-2)]">
        <ShieldCheck size={13} className="text-[color:var(--accent)]" /> Bank-grade encryption on every field
      </p>

      <p className="text-[13px] text-center mt-4 text-[color:var(--muted-2)]">
        Already with us?{' '}
        <Link to="/login" className="text-[color:var(--accent)] font-medium">Log in</Link>
      </p>
    </AuthShell>
  );
}
