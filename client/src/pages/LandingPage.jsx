import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { startDemo } from '../api/auth';
import { useLanguage } from '../i18n/LanguageContext';
import LanguageToggle from '../components/LanguageToggle';
import FarmCrossSection from '../components/illustrations/FarmCrossSection';
import { LeafScan, SoilProbe } from '../components/illustrations/SpotIllustrations';

// Held-out PlantVillage test accuracy (ml-engine/model/artifacts/cnn/cnn_metrics.json)
const TEST_ACCURACY = { tomato: '93.3%', maize: '95.3%' };

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginWithData } = useAuth();
  const { t } = useLanguage();
  const [starting, setStarting] = useState(false);

  const handleDemoLogin = async () => {
    setStarting(true);
    try {
      // Each visitor gets a private guest account with sample (simulated) data
      const { token, user } = await startDemo();
      localStorage.removeItem('activeFarmId');
      loginWithData(token, user);
      navigate('/dashboard/overview');
    } catch (err) {
      const msg = err.response?.data?.error;
      if (msg) toast.error(msg);
      else if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') toast.error(t('demo.offline'));
      else toast.error(t('demo.unavailable'));
    } finally {
      setStarting(false);
    }
  };

  const callouts = {
    leaf: t('hero.callout.leaf'),
    sensor: t('hero.callout.sensor'),
    life: t('hero.callout.life'),
  };

  const steps = [1, 2, 3, 4].map((n) => ({ n, title: t(`steps.${n}.title`), body: t(`steps.${n}.body`) }));

  return (
    <div className="min-h-screen bg-mist text-ink">
      {/* Header */}
      <header className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between gap-3">
        <a href="/" className="flex items-center gap-2 font-display text-xl font-bold text-mlima">
          <span className="grid place-items-center w-9 h-9 rounded-xl bg-mlima text-maize"><Leaf size={18} aria-hidden="true" /></span>
          SoilAI
        </a>
        <nav className="flex items-center gap-1 sm:gap-2">
          <LanguageToggle className="text-mlima hover:bg-white/70" />
          <button onClick={() => navigate('/login')} className="hidden sm:inline-flex px-3 py-1.5 rounded-full text-sm font-medium text-mlima hover:bg-white/70">
            {t('nav.login')}
          </button>
          <button onClick={() => navigate('/register')} className="px-4 py-2 rounded-full text-sm font-semibold bg-mlima text-white hover:bg-primary-900">
            {t('nav.register')}
          </button>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
          <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-end">
            <h1 className="lg:col-span-7 font-display font-bold text-mlima text-[2.6rem] leading-[1.02] sm:text-6xl lg:text-[4.4rem] text-balance">
              {t('hero.title')}
            </h1>
            <div className="lg:col-span-5 lg:pb-2">
              <p className="text-lg leading-relaxed text-ink/80 max-w-prose">{t('hero.body')}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={handleDemoLogin} disabled={starting}
                  className="px-6 py-3.5 rounded-full bg-shamba text-white font-semibold text-base hover:bg-primary-600 disabled:opacity-70 shadow-[0_6px_0_#1f4d3a] active:translate-y-[3px] active:shadow-[0_3px_0_#1f4d3a] transition">
                  {starting ? '…' : t('hero.try')}
                </button>
                <button onClick={() => navigate('/register')}
                  className="px-6 py-3.5 rounded-full border-2 border-mlima text-mlima font-semibold text-base hover:bg-white">
                  {t('hero.register')}
                </button>
              </div>
              <p className="mt-3 text-sm text-ink/60">{t('hero.note')}</p>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
          <div className="rounded-[2rem] overflow-hidden ring-1 ring-mlima/10 bg-soil">
            <FarmCrossSection labels={callouts} title={t('hero.alt')} className="w-full h-[300px] sm:h-[420px] lg:h-[540px] block" />
          </div>
          {/* Callouts as a list where the drawing is too small to label */}
          <ul className="md:hidden mt-4 space-y-2">
            {Object.values(callouts).map((c) => (
              <li key={c} className="flex items-center gap-3 text-sm text-ink/80">
                <span className="w-3 h-3 rounded-full bg-maize ring-2 ring-white flex-shrink-0" aria-hidden="true" />{c}
              </li>
            ))}
          </ul>
        </section>

        {/* Two checks */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-mlima">{t('checks.title')}</h2>
          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <article className="bg-white rounded-3xl p-6 sm:p-8">
              <LeafScan className="w-40 h-auto" />
              <h3 className="mt-5 font-display text-2xl font-semibold">{t('checks.leaf.title')}</h3>
              <p className="mt-2 text-ink/75 leading-relaxed">{t('checks.leaf.body')}</p>
              <dl className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <dt className="sr-only">Tomato</dt>
                  <dd className="font-display text-4xl font-bold text-shamba">{TEST_ACCURACY.tomato}</dd>
                  <dd className="text-sm text-ink/70 mt-1">{t('checks.leaf.stat.tomato')}</dd>
                </div>
                <div>
                  <dt className="sr-only">Maize</dt>
                  <dd className="font-display text-4xl font-bold text-shamba">{TEST_ACCURACY.maize}</dd>
                  <dd className="text-sm text-ink/70 mt-1">{t('checks.leaf.stat.maize')}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-ink/55 leading-relaxed">{t('checks.leaf.foot')}</p>
            </article>

            <article className="bg-white rounded-3xl p-6 sm:p-8">
              <SoilProbe className="w-40 h-auto" />
              <h3 className="mt-5 font-display text-2xl font-semibold">{t('checks.soil.title')}</h3>
              <p className="mt-2 text-ink/75 leading-relaxed">{t('checks.soil.body')}</p>
              <p className="mt-6 rounded-2xl bg-maize/15 border border-maize/40 px-4 py-3 text-sm text-soil leading-relaxed">
                {t('checks.soil.note')}
              </p>
            </article>
          </div>
        </section>

        {/* How it works: a real sequence, so the steps are numbered */}
        <section className="bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-mlima">{t('steps.title')}</h2>
            <ol className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map(({ n, title, body }) => (
                <li key={n} className="relative pl-14">
                  <span className="absolute left-0 top-0 grid place-items-center w-10 h-10 rounded-full bg-mlima text-maize font-display font-bold">
                    {n}
                  </span>
                  <h3 className="font-display text-lg font-semibold">{title}</h3>
                  <p className="mt-1 text-ink/70 leading-relaxed">{body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="bg-mlima text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="font-display text-3xl font-bold">{t('cta.title')}</h2>
              <p className="mt-2 text-white/75">{t('cta.body')}</p>
            </div>
            <button onClick={handleDemoLogin} disabled={starting}
              className="self-start md:self-auto px-6 py-3.5 rounded-full bg-maize text-mlima font-bold hover:bg-[#ecc35a] disabled:opacity-70">
              {t('hero.try')}
            </button>
          </div>
        </section>
      </main>

      <footer className="bg-primary-900 text-white/60 text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row gap-2 sm:justify-between">
          <span>© {new Date().getFullYear()} SoilAI</span>
          <span>{t('footer.credit')}</span>
        </div>
      </footer>
    </div>
  );
}
