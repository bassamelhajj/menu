/**
 * components/PageBanner.jsx — بانر موحّد وأنيق للصفحات الثانوية
 * ===========================================================================
 * • تصميم بسيط وواسع: عنوان الصفحة + breadcrumb زجاجي فقط.
 * • خلفية فاتحة نظيفة في الوضع النهاري، وزجاج داكن ناعم في الوضع الليلي.
 * • مساحات منطقية (start/end) حتى ينقلب الترتيب تلقائياً بين AR/EN.
 */
import { motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { navigate } from '../lib/hashRoute'
import { IconChevron, IconHome } from './icons'

export default function PageBanner({ title, subtitle, children }) {
  const { lang, t } = useApp()
  const ar = lang === 'ar'

  return (
    <section className="relative overflow-hidden border-b border-line/50 bg-bg">
      {/* ─── إضاءة خلفية ناعمة جداً ─── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="absolute -top-32 start-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-[110px] dark:bg-gold/[0.05]" />
        <div className="absolute -bottom-24 end-[8%] h-48 w-48 rounded-full bg-primary/[0.05] blur-[90px] dark:bg-primary/[0.09]" />
      </div>

      <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:py-14">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[30px] border border-line/70 bg-surface/65 px-5 py-10 text-center shadow-[0_30px_70px_-56px_rgba(22,33,26,0.45)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.04] dark:shadow-[0_36px_80px_-46px_rgba(0,0,0,0.85)] sm:rounded-[34px] sm:px-10 sm:py-14"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold/55 to-transparent"
          />

          {/* ─── Breadcrumb ─── */}
          <nav aria-label={ar ? 'مسار التنقّل' : 'Breadcrumb'} className="flex justify-center">
            <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-line/60 bg-bg/70 px-3 py-1.5 text-[10px] font-bold text-muted shadow-[0_10px_30px_-26px_rgba(22,33,26,0.5)] backdrop-blur-md dark:border-white/10 dark:bg-white/[0.05] dark:text-white/45">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-1 rounded-full px-1 py-0.5 transition-colors hover:text-gold-deep dark:hover:text-gold"
              >
                <IconHome size={11} />
                <span>{t('home')}</span>
              </button>
              <span
                className={`shrink-0 text-muted/40 dark:text-white/25 ${
                  ar ? 'rotate-90' : '-rotate-90'
                }`}
              >
                <IconChevron size={10} />
              </span>
              <span
                aria-current="page"
                className="max-w-[58vw] truncate px-1 text-ink/70 dark:text-cream/70 sm:max-w-none"
              >
                {title}
              </span>
            </div>
          </nav>

          {/* ─── العنوان ─── */}
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-[28px] font-semibold leading-[1.16] tracking-tight text-ink sm:text-[38px] lg:text-[44px] dark:text-cream">
            {title}
          </h1>

          <span
            aria-hidden
            className="mx-auto mt-5 block h-px w-14 bg-gradient-to-r from-transparent via-gold/80 to-transparent"
          />

          {/* ─── وصف اختياري قصير ─── */}
          {subtitle && (
            <p className="mx-auto mt-4 max-w-xl text-[12px] font-medium leading-relaxed text-muted sm:text-[13px] dark:text-white/45">
              {subtitle}
            </p>
          )}

          {/* ─── إجراءات اختيارية ─── */}
          {children && (
            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              {children}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

/** شاشة أنيقة للصفحة الموقوفة من لوحة التحكم */
export function PageDisabled() {
  const { lang, t } = useApp()
  const ar = lang === 'ar'

  return (
    <div className="relative flex min-h-[62vh] items-center justify-center overflow-hidden bg-bg px-4 py-16">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute start-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/10 blur-[100px]" />
      </div>
      <div className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-line bg-surface/80 p-8 text-center shadow-[0_34px_80px_-50px_rgba(22,33,26,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-[#0d1810]/80">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/30 bg-gold/10 text-3xl">
          🔒
        </span>
        <h2 className="mt-5 font-display text-xl text-ink dark:text-cream">
          {t('pageDisabled')}
        </h2>
        <p className="mt-2 text-[11.5px] leading-relaxed text-muted">
          {ar
            ? 'هالصفحة موقوفة مؤقتاً من لوحة التحكم. جرّب تتصفّح المنيو أو تواصل معنا.'
            : 'This page is paused from the dashboard. Browse the menu or reach out to us.'}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => navigate('/menu')} className="btn-primary px-5 py-3">
            {t('viewMenu')}
          </button>
          <button type="button" onClick={() => navigate('/contact')} className="btn-ghost px-5 py-3">
            {t('contactUs')}
          </button>
        </div>
      </div>
    </div>
  )
}
