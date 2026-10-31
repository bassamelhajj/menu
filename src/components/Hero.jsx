import { motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import Hero3D from './Hero3D'
import { IconSparkle, IconStar, IconWhatsApp } from './icons'

const stats = [
  { ar: 'أكثر من ١٢٠ عنصر', en: '120+ items' },
  { ar: 'شوكولاتة بلجيكية', en: 'Belgian chocolate' },
  { ar: 'عصائر طازجة', en: 'Fresh juices' },
]

export default function Hero({ category = 'all' }) {
  const { t, lang } = useApp()
  const { settings } = useContent()

  return (
    <section id="top" className="px-4 pt-5">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] primary-bg text-cream shadow-[0_25px_60px_-25px_rgba(63,82,48,0.7)]">
        {/* glow blobs */}
        <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full bg-gold/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -start-10 h-56 w-56 rounded-full bg-cream/10 blur-3xl" />

        <div className="relative grid items-center gap-2 md:grid-cols-2">
          <div className="relative order-1 h-72 sm:h-80 md:order-2 md:h-[440px]">
            {/* 🎯 category = القسم المختار، ليشتغل المشهد التفاعلي */}
            <Hero3D category={category} />
          </div>

          <div className="order-2 px-6 pb-8 text-center md:order-1 md:py-12 md:ps-10 md:pe-2 md:text-start">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cocoa/25 px-4 py-1.5 text-[11px] font-extrabold tracking-[0.22em] text-gold backdrop-blur"
            >
              <IconSparkle size={14} />
              {t('heroKicker')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="mt-4 font-display text-4xl leading-tight tracking-wide sm:text-5xl"
              dir="ltr"
            >
              BENOVA
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="mt-2 text-lg font-extrabold gold-text"
            >
              {t('heroTitle')}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-cream/80 md:mx-0"
            >
              {t('heroText')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.26 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-3 md:justify-start"
            >
              <a
                href="#menu"
                className="gold-bg rounded-2xl px-6 py-3 text-sm font-black text-cocoa shadow-lg transition-transform hover:scale-[1.03] active:scale-95"
              >
                {t('viewMenu')}
              </a>
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-cream/25 bg-cream/10 px-5 py-3 text-sm font-bold text-cream backdrop-blur transition-colors hover:bg-cream/20"
              >
                <IconWhatsApp size={18} />
                {lang === 'ar' ? 'اطلب مباشرة' : 'Order now'}
              </a>
            </motion.div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:justify-start">
              {stats.map((s) => (
                <span
                  key={s.en}
                  className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 bg-cocoa/20 px-3 py-1.5 text-[11px] font-bold text-cream/85"
                >
                  <IconStar size={12} filled />
                  {lang === 'ar' ? s.ar : s.en}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
