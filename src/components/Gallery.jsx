import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import BookViewer from './BookViewer'
import { IconBook, IconSparkle } from './icons'

/**
 * قسم "المنيو": بدل ما نعرض صور الأقسام، نعرض كتاب ثلاثي الأبعاد عليه اللوغو.
 * الضغط عليه يفتح عارض الكتاب (BookViewer) نفسه مثل قبل.
 */
export default function Gallery() {
  const { lang, t } = useApp()
  const { settings } = useContent()
  const [open, setOpen] = useState(false)

  const titleEn = settings?.name?.en || 'BENOVA'
  const subAr = settings?.tagline?.ar || 'كريب وعصائر'
  const subEn = settings?.tagline?.en || 'Crepes & Juices'

  return (
    <section id="sections" className="mx-auto max-w-5xl px-4 pt-10">
      <div className="mb-6 text-center">
        <h2 className="font-display text-2xl tracking-wide text-ink sm:text-3xl">
          {t('sections')}
        </h2>
        <p className="mt-1 text-xs font-semibold text-muted">{t('sectionsHint')}</p>
      </div>

      <div className="flex justify-center" style={{ perspective: 1500 }}>
        {/* طفو ناعم للكتاب */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            aria-label={lang === 'ar' ? 'افتح المنيو' : 'Open menu'}
            initial={{ opacity: 0, y: 24, rotateY: -30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            animate={{ rotateY: [-26, -14, -26], rotateX: [6, 3, 6] }}
            whileHover={{ rotateY: -4, rotateX: 2, scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            transition={{ rotateY: { duration: 8, repeat: Infinity, ease: 'easeInOut' }, rotateX: { duration: 8, repeat: Infinity, ease: 'easeInOut' } }}
            style={{ transformStyle: 'preserve-3d' }}
            className="group relative h-72 w-56 outline-none sm:h-80 sm:w-64"
          >
            {/* أوراق الكتاب (الحافة اليمنى) */}
            <span className="absolute inset-y-3 right-[-6px] w-2 rounded-e-md bg-cream shadow-md" />
            <span className="absolute inset-y-4 right-[-11px] w-2 rounded-e-md bg-cream/80 shadow" />
            <span className="absolute inset-y-5 right-[-15px] w-1.5 rounded-e-md bg-cream/60" />

            {/* الغلاف */}
            <span
              className="absolute inset-0 overflow-hidden rounded-e-2xl rounded-s-md border border-gold/50 shadow-[0_30px_60px_-25px_rgba(31,39,25,0.85)]"
              style={{ background: 'linear-gradient(135deg, #3e4a33 0%, #607848 52%, #2f3a27 100%)' }}
            >
              {/* إطار ذهبي */}
              <span className="pointer-events-none absolute inset-3 rounded-xl border border-gold/45" />
              <span className="pointer-events-none absolute inset-[14px] rounded-lg border border-gold/20" />

              {/* لمعان علوي */}
              <span className="pointer-events-none absolute -left-10 top-0 h-40 w-24 rotate-12 bg-cream/10 blur-xl" />

              {/* اللوغو */}
              <img
                src={settings?.logo || '/brand/benova-logo.png'}
                alt={titleEn}
                className="absolute left-1/2 top-8 h-28 w-auto -translate-x-1/2 rounded-lg object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] sm:h-32"
              />

              {/* العنوان */}
              <span className="absolute inset-x-0 bottom-[68px] text-center font-display text-[26px] tracking-[0.28em] gold-text sm:text-[30px]">
                {titleEn}
              </span>

              {/* الشعار النصّي */}
              <span className="absolute inset-x-0 bottom-[46px] text-center text-[10px] font-bold tracking-[0.32em] text-cream/85">
                {lang === 'ar' ? subAr : subEn.toUpperCase()}
              </span>

              {/* شارة داشرة */}
              <span className="absolute inset-x-0 bottom-4 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-cocoa/30 px-3 py-1.5 text-[10px] font-black text-cream backdrop-blur">
                  <IconBook size={13} />
                  {lang === 'ar' ? 'اضغط لفتح المنيو' : 'Tap to open menu'}
                </span>
              </span>
            </span>

            {/* الكعبة (السباين) */}
            <span
              className="absolute inset-y-0 left-0 w-4 rounded-s-md"
              style={{ background: 'linear-gradient(to right, #1f2719, #2f3a27 70%, rgba(0,0,0,0.25))' }}
            />
            <span className="absolute inset-y-2 left-1 w-[3px] rounded-full bg-gold/50" />
          </motion.button>
        </motion.div>
      </div>

      {/* تلميح */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-6 flex items-center justify-center gap-1.5 text-center text-[11px] font-bold text-gold-deep"
      >
        <IconSparkle size={13} />
        {lang === 'ar' ? 'كتاب المنيو — يتفتح صفحة صفحة' : 'The magic menu book — flips page by page'}
      </motion.p>

      <AnimatePresence>
        {open && <BookViewer key="book" startIndex={0} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </section>
  )
}
