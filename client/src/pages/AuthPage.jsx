import React, { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Leaf } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { register as apiRegister } from '../api/auth';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import FarmCrossSection from '../components/illustrations/FarmCrossSection';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const [tab, setTab] = useState(window.location.pathname === '/register' ? 'register' : 'login');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', farmLocation: '', farmSizeHa: '' });
  const { login, loginWithData, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) return <Navigate to="/dashboard/overview" replace />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard/overview');
    } catch (err) {
      toast.error(err.response?.data?.error || t('auth.err.login'));
    } finally { setLoading(false); }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error(t('auth.err.email'));
    if (form.password.length < 8) return toast.error(t('auth.err.short'));
    if (form.password !== form.confirm) return toast.error(t('auth.err.match'));

    setLoading(true);
    try {
      const { token, user } = await apiRegister({ name: form.name, email: form.email, password: form.password, farmLocation: form.farmLocation, farmSizeHa: form.farmSizeHa });
      loginWithData(token, user);
      toast.success(t('auth.welcome'));
      navigate('/dashboard/overview');
    } catch (err) {
      toast.error(err.response?.data?.error || t('auth.err.register'));
    } finally { setLoading(false); }
  };

  const inputClass = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-shamba focus:border-transparent';
  const labelClass = 'block text-sm font-semibold text-ink mb-1.5';
  const isLogin = tab === 'login';

  const passwordToggle = (
    <button type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? t('auth.hide') : t('auth.show')}
      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-mlima">
      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-mist">
      {/* Form side */}
      <div className="flex flex-col px-4 sm:px-10 py-6">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-mlima">
            <span className="grid place-items-center w-9 h-9 rounded-xl bg-mlima text-maize"><Leaf size={18} aria-hidden="true" /></span>
            SoilAI
          </Link>
          <LanguageToggle className="text-mlima hover:bg-white/70" />
        </div>

        <div className="flex-1 flex items-center justify-center py-10">
          <div className="w-full max-w-md">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-mlima">
              {isLogin ? t('auth.login.title') : t('auth.register.title')}
            </h1>
            <p className="mt-2 text-ink/70">{isLogin ? t('auth.login.body') : t('auth.register.body')}</p>

            <div className="mt-6 inline-flex rounded-full bg-white p-1 ring-1 ring-mlima/10" role="tablist">
              {['login', 'register'].map((k) => (
                <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors
                    ${tab === k ? 'bg-mlima text-white' : 'text-mlima hover:bg-mist'}`}>
                  {t(`auth.tab.${k}`)}
                </button>
              ))}
            </div>

            {isLogin ? (
              <form onSubmit={handleLogin} className="mt-6 space-y-4">
                <div>
                  <label htmlFor="login-email" className={labelClass}>{t('auth.email')}</label>
                  <input id="login-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} className={inputClass} placeholder="you@farm.co.tz" required />
                </div>
                <div>
                  <label htmlFor="login-password" className={labelClass}>{t('auth.password')}</label>
                  <div className="relative">
                    <input id="login-password" type={showPass ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={set('password')} className={inputClass} placeholder={t('auth.ph.password')} required />
                    {passwordToggle}
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 rounded-full bg-shamba text-white font-semibold text-base hover:bg-primary-600 disabled:opacity-60">
                  {loading ? t('auth.submit.loggingIn') : t('auth.submit.login')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="mt-6 grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="reg-name" className={labelClass}>{t('auth.name')}</label>
                  <input id="reg-name" autoComplete="name" value={form.name} onChange={set('name')} className={inputClass} required />
                </div>
                <div className="col-span-2">
                  <label htmlFor="reg-email" className={labelClass}>{t('auth.email')}</label>
                  <input id="reg-email" type="email" autoComplete="email" value={form.email} onChange={set('email')} className={inputClass} placeholder="you@farm.co.tz" required />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="reg-password" className={labelClass}>{t('auth.password')}</label>
                  <div className="relative">
                    <input id="reg-password" type={showPass ? 'text' : 'password'} autoComplete="new-password" value={form.password} onChange={set('password')} className={inputClass} placeholder={t('auth.ph.newPassword')} required />
                    {passwordToggle}
                  </div>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="reg-confirm" className={labelClass}>{t('auth.confirm')}</label>
                  <input id="reg-confirm" type="password" autoComplete="new-password" value={form.confirm} onChange={set('confirm')} className={inputClass} placeholder={t('auth.ph.confirm')} required />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="reg-location" className={labelClass}>{t('auth.location')} <span className="font-normal text-ink/50">({t('auth.optional')})</span></label>
                  <input id="reg-location" value={form.farmLocation} onChange={set('farmLocation')} className={inputClass} placeholder={t('auth.ph.location')} />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="reg-size" className={labelClass}>{t('auth.size')} <span className="font-normal text-ink/50">({t('auth.optional')})</span></label>
                  <input id="reg-size" type="number" step="0.1" min="0.1" value={form.farmSizeHa} onChange={set('farmSizeHa')} className={inputClass} placeholder="2.5" />
                </div>
                <button type="submit" disabled={loading}
                  className="col-span-2 w-full py-3.5 rounded-full bg-shamba text-white font-semibold text-base hover:bg-primary-600 disabled:opacity-60">
                  {loading ? t('auth.submit.registering') : t('auth.submit.register')}
                </button>
              </form>
            )}

            <Link to="/" className="mt-6 inline-block text-sm font-medium text-mlima hover:underline">{t('auth.back')}</Link>
          </div>
        </div>
      </div>

      {/* Illustration side (large screens) */}
      <aside className="hidden lg:flex flex-col bg-mlima text-white p-10">
        <div className="flex-1 rounded-[2rem] overflow-hidden">
          <FarmCrossSection labels={{}} title={t('hero.alt')} className="w-full h-full block" />
        </div>
        <h2 className="mt-8 font-display text-3xl font-bold">{t('auth.side.title')}</h2>
        <p className="mt-2 text-white/75 max-w-md">{t('auth.side.body')}</p>
      </aside>
    </div>
  );
}
