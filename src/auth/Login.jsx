import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import AuthShell from './AuthShell.jsx';
import { useAuth } from './AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (k) => (e) => { setError(''); setForm((f) => ({ ...f, [k]: e.target.value })); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <div className="mb-7">
        <p className="text-[11px] tracking-widest uppercase text-[color:var(--accent-soft)] mb-2">Welcome back</p>
        <h1 className="font-display text-[28px] font-semibold text-[color:var(--ink)]">Log in to your account</h1>
        <p className="text-[13.5px] mt-2 text-[color:var(--muted-2)]">Enter your details to access your dashboard.</p>
      </div>


      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="auth-label" htmlFor="email">Email address</label>
          <div className="auth-field-wrap">
            <input id="email" type="email" required value={form.email} onChange={update('email')} placeholder="you@example.com" className="auth-field" style={{ paddingRight: 40 }} />
            <span className="auth-field-icon"><Mail size={16} /></span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="auth-label mb-0" htmlFor="password">Password</label>
            <a href="#" className="text-[11.5px] text-[color:var(--accent-soft)]">Forgot password?</a>
          </div>
          <div className="auth-field-wrap">
            <input id="password" type={showPw ? 'text' : 'password'} required value={form.password} onChange={update('password')} placeholder="••••••••" className="auth-field" style={{ paddingRight: 40 }} />
            <button type="button" onClick={() => setShowPw((v) => !v)} className="auth-field-icon" aria-label={showPw ? 'Hide password' : 'Show password'}>
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {error && <p className="text-[12.5px] text-[color:var(--down)]">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-solid text-[14px] px-6 py-3.5 mt-2 flex items-center justify-center gap-2 disabled:opacity-60">
          {submitting ? 'Logging in…' : 'Log in'} <ArrowRight size={16} />
        </button>
      </form>

      <p className="text-[13px] text-center mt-6 text-[color:var(--muted-2)]">
        Don&rsquo;t have an account?{' '}
        <Link to="/register" className="text-[color:var(--accent)] font-medium">Open one</Link>
      </p>
    </AuthShell>
  );
}
