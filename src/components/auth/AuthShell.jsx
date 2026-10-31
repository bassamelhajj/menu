/**
 * components/auth/AuthShell.jsx — الإطار البصري الموحّد للمصادقة
 * ===========================================================================
 * • نفس لغة تصميم بوابة الإدارة: بطاقة واحدة مركّزة، ميدالية اللوغو،
 *   شبكة ذهبية ناعمة، ظلال عميقة، وحركة دخول هادئة.
 * • بيتكيّف تلقائياً مع الدارك/اللايت عبر متغيّرات الثيم.
 * • فيه تبديل اللغة والثيم مباشرة، لأن الهيدر العام مخفي بصفحات الدخول.
 * • نفس الشاشة بتخدم الزبون وصاحب المحل — التوجيه بيصير من الحساب نفسه.
 */
import { motion } from 'framer-motion'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { navigate } from '../../lib/hashRoute'
import {
  IconChevron,
  IconGlobe,
  IconLock,
  IconMoon,
  IconShield,
  IconSun,
} from '../icons'

/** ميدالية اللوغو — نفس لغة الهيدر والفوتر */
function Medallion({ src, name }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.08, duration: 0.4 }}
      className="relative mx-auto w-fit"
    >
      <div className="grid h-[74px] w-[74px] place-items-center overflow-hidden rounded-full bg-[#f4ead3] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.65)] ring-4 ring-gold/55">
        <img
          src={src}
          alt={name}
          onError={(event) => {
            if (event.currentTarget.dataset.fallback) return
            event.currentTarget.dataset.fallback = 'true'
            event.currentTarget.src = '/brand/benova-logo.png'
          }}
          className="h-[82%] w-[82%] object-contain"
        />
      </div>
      <span className="absolute -bottom-1.5 -end-1.5 grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#eed89a] to-[#b08a45] text-[#241708] shadow-lg ring-2 ring-surface dark:ring-[#0d1810]">
        <IconShield size={14} />
      </span>
    </motion.div>
  )
}

export default function AuthShell({ ar, signedIn = false, children }) {
  const { settings } = useContent()
  const { dark, toggleDark, toggleLang } = useApp()

  const logoSrc = settings?.logo || '/brand/benova-logo.png'
  const brand = settings?.name?.[ar ? 'ar' : 'en'] || 'BENOVA'

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-ink transition-colors duration-300">
      {/* ─── خلفية المصادقة: شبكة + هالات + دوائر ─── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0 opacity-[0.22] dark:opacity-[0.2]"
          style={{
            backgroundImage:
              'linear-gradient(color-mix(in srgb, var(--gold) 55%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--gold) 55%, transparent) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
            maskImage: 'radial-gradient(ellipse at center, black 18%, transparent 76%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 18%, transparent 76%)',
          }}
        />
        <div className="absolute -top-36 start-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold/15 blur-[120px]" />
        <div className="absolute -bottom-44 end-1/4 h-96 w-96 rounded-full bg-primary/15 blur-[130px]" />
        <div className="absolute end-8 top-20 h-40 w-40 rounded-full border border-gold/15" />
        <div className="absolute -start-14 bottom-24 h-56 w-56 rounded-full border border-gold/10" />
        <span className="absolute start-[16%] top-24 text-[9px] text-gold/50">✦</span>
        <span className="absolute end-[18%] bottom-28 text-[8px] text-gold/35">✦</span>
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[460px] flex-col px-4 py-5 sm:py-7">
        {/* ─── شريط علوي: رجوع + لغة + ثيم ─── */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="group inline-flex items-center gap-2 rounded-full border border-line bg-surface/85 px-3.5 py-2 text-[11px] font-black text-muted shadow-sm backdrop-blur transition-all hover:border-gold/60 hover:text-gold-deep active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45 dark:hover:border-gold/40 dark:hover:text-gold"
          >
            <span
              className={`transition-transform group-hover:-translate-x-0.5 ${
                ar ? '-rotate-90' : 'rotate-90'
              }`}
            >
              <IconChevron size={14} />
            </span>
            {ar ? 'رجوع للمنيو' : 'Back to menu'}
          </button>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-gold/25 bg-gold/10 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.2em] text-gold-deep sm:inline-flex dark:text-gold">
              {ar ? 'دخول آمن' : 'Secure access'}
            </span>

            <button
              type="button"
              onClick={toggleLang}
              title={ar ? 'English' : 'العربية'}
              aria-label={ar ? 'Switch to English' : 'التبديل للعربية'}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line bg-surface/85 px-3 text-[10px] font-black text-muted shadow-sm backdrop-blur transition-all hover:border-gold/55 hover:text-gold-deep active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45 dark:hover:border-gold/40 dark:hover:text-gold"
            >
              <IconGlobe size={13} />
              {ar ? 'EN' : 'ع'}
            </button>

            <button
              type="button"
              onClick={toggleDark}
              title={dark ? (ar ? 'الوضع الفاتح' : 'Light mode') : ar ? 'الوضع الداكن' : 'Dark mode'}
              aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface/85 text-muted shadow-sm backdrop-blur transition-all hover:border-gold/55 hover:text-gold-deep active:scale-95 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45 dark:hover:border-gold/40 dark:hover:text-gold"
            >
              {dark ? <IconSun size={15} /> : <IconMoon size={15} />}
            </button>
          </div>
        </div>

        {/* ─── البطاقة ─── */}
        <div className="flex flex-1 items-center justify-center py-6 sm:py-8">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="overflow-hidden rounded-[30px] border border-line bg-surface/95 shadow-[0_50px_120px_-45px_rgba(22,33,26,0.6)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#0d1810]/90 dark:shadow-[0_50px_120px_-40px_rgba(0,0,0,0.9)]">
              {/* رأس البطاقة */}
              <div className="relative overflow-hidden border-b border-line px-6 pb-6 pt-7 text-center dark:border-white/10">
                <div className="pointer-events-none absolute -top-16 start-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-gold/15 blur-[60px]" />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />

                <Medallion src={logoSrc} name={settings?.name?.en || 'BENOVA'} />

                <h1
                  className={`relative mt-4 text-[23px] tracking-wide text-ink dark:text-cream ${
                    ar ? 'font-sans font-black' : 'font-display'
                  }`}
                >
                  {ar ? `حساب ${brand}` : `${brand} account`}
                </h1>
                <p className="relative mx-auto mt-1.5 max-w-[300px] text-[11px] font-semibold leading-relaxed text-muted dark:text-white/40">
                  {signedIn
                    ? ar
                      ? 'مساحتك الشخصية داخل BENOVA — مفضلاتك، آراؤك، وعروضك.'
                      : 'Your personal BENOVA space — favorites, reviews and offers.'
                    : ar
                      ? 'دخول موحّد وآمن للزبائن وإدارة المطعم — من دون أبواب منفصلة.'
                      : 'One secure sign-in for customers and the restaurant team — no separate doors.'}
                </p>
              </div>

              {/* نموذج/محتوى الصفحة */}
              <div className="p-5 pt-5 sm:p-7">{children}</div>
            </div>
          </motion.div>
        </div>

        <p className="flex items-center justify-center gap-1.5 text-center text-[10px] font-bold text-muted/65 dark:text-white/30">
          <IconLock size={11} />
          {ar
            ? 'جلسة محلية على هذا الجهاز فقط — تنتهي عند إغلاق المتصفح'
            : 'Local session on this device only — ends when the browser closes'}
        </p>
      </div>
    </div>
  )
}
