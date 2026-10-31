/**
 * pages/AboutPage.jsx — من نحن
 * ===========================================================================
 * • سرد بصري هادئ: صورة/تكوين براند، قصة المحل من لوحة التحكم، ومعايير الجودة.
 * • الأرقام بتتحدّث تلقائياً من المنتجات والأقسام المفعّلة.
 * • كل التخطيطات منطقية (start/end) لتنقلب صح بين العربي والإنجليزي.
 */
import { motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { navigate } from '../lib/hashRoute'
import PageBanner, { PageDisabled } from '../components/PageBanner'
import BottomNav from '../components/BottomNav'
import { IconChevron, IconSparkle } from '../components/icons'

const FALLBACK_LOGO = '/brand/benova-logo.png'

function BrandArtwork({ ar, settings, productCount, categoryCount }) {
  const logoSrc = settings.logo || FALLBACK_LOGO

  return (
    <div className="relative mx-auto w-full max-w-[430px]">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[38px] border border-gold/25 bg-gradient-to-br from-[#2b3c24] via-[#1a2a17] to-[#0d150b] shadow-[0_40px_90px_-45px_rgba(12,25,12,0.95)]">
        {/* ─── خلفية فنية ─── */}
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-16 -start-14 h-60 w-60 rounded-full bg-gold/20 blur-[70px]" />
          <div className="absolute -bottom-24 -end-16 h-64 w-64 rounded-full bg-primary/35 blur-[80px]" />
          <div className="absolute inset-6 rounded-[30px] border border-gold/15" />
          <div className="absolute inset-10 rounded-[24px] border border-gold/10" />
          <div className="absolute start-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/15" />
          <div className="absolute start-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold/10" />
          <span className="absolute start-[18%] top-[22%] text-[9px] text-gold/60">✦</span>
          <span className="absolute end-[14%] top-[30%] text-[7px] text-gold/40">✦</span>
          <span className="absolute start-[22%] bottom-[38%] text-[7px] text-gold/40">✦</span>
          <span className="absolute end-[20%] bottom-[22%] text-[10px] text-gold/50">✦</span>
        </div>

        {/* ─── الميدالية ─── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pb-16">
          <motion.div
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <span className="absolute -inset-5 rounded-full border border-gold/20" />
            <span className="absolute -inset-9 rounded-full border border-gold/10" />
            <span className="relative grid h-28 w-28 place-items-center overflow-hidden rounded-full bg-[#f4ead3] p-2 shadow-[0_24px_50px_-18px_rgba(0,0,0,0.8)] ring-4 ring-gold/50 sm:h-32 sm:w-32">
              <img
                src={logoSrc}
                alt={settings.name?.en || 'BENOVA'}
                onError={(event) => {
                  if (event.currentTarget.dataset.fallback) return
                  event.currentTarget.dataset.fallback = 'true'
                  event.currentTarget.src = FALLBACK_LOGO
                }}
                className="h-full w-full object-contain"
              />
            </span>
          </motion.div>

          <p className="mt-6 font-display text-[30px] leading-none tracking-[0.24em] text-cream sm:text-[34px]">
            BENOVA
          </p>
          <p className="mt-2 text-[9px] font-black uppercase tracking-[0.34em] text-gold/75">
            {ar ? settings.tagline?.ar : settings.tagline?.en}
          </p>
          <span className="mt-5 h-px w-16 bg-gradient-to-r from-transparent via-gold/80 to-transparent" />
          <p className="mt-3 text-[10px] font-semibold tracking-[0.18em] text-cream/40">
            {ar ? 'صُنع بحب في لبنان' : 'MADE WITH LOVE IN LEBANON'}
          </p>
        </div>

        {/* ─── بطاقات طافية ─── */}
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute start-4 top-6 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black text-cream/85 shadow-lg backdrop-blur-md"
        >
          🍫 {ar ? 'بلجيكي' : 'Belgian'}
        </motion.span>
        <motion.span
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
          className="absolute end-4 top-14 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-[10px] font-black text-cream/85 shadow-lg backdrop-blur-md"
        >
          🥞 {ar ? 'طازج' : 'Fresh'}
        </motion.span>

        {/* ─── شريط الأرقام ─── */}
        <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-1.5 rounded-2xl border border-white/12 bg-black/25 p-2 backdrop-blur-md">
          {[
            { value: `${categoryCount}`, label: ar ? 'قسم' : 'Sections' },
            { value: `${productCount}+`, label: ar ? 'صنف' : 'Creations' },
            { value: '100%', label: ar ? 'طازج' : 'Fresh' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl px-1 py-2 text-center">
              <p className="font-display text-lg leading-none text-gold">{stat.value}</p>
              <p className="mt-1 text-[8px] font-black uppercase tracking-[0.14em] text-cream/45">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const PILLARS = [
  {
    emoji: '🌿',
    ar: 'طازج كل يوم',
    en: 'Fresh every day',
    arText: 'مواد تُختار يومياً، وفواكه تُقطّع عند الطلب — بلا مجمّدات.',
    enText: 'Daily-picked ingredients and fruit cut to order — never frozen.',
  },
  {
    emoji: '🍫',
    ar: 'شوكولاتة بلجيكية',
    en: 'Belgian chocolate',
    arText: 'نكهة عميقة وغنية، لأن التفاصيل الصغيرة هي اللي بتفرق.',
    enText: 'Deep, rich flavour — because the smallest details make the difference.',
  },
  {
    emoji: '👨‍🍳',
    ar: 'يُحضّر قدامك',
    en: 'Made in front of you',
    arText: 'كل طلب بيتبني لحظتها، على مزاجك وبالعناصر اللي بتحبها.',
    enText: 'Every order is built to order, exactly the way you like it.',
  },
  {
    emoji: '💛',
    ar: 'بكل حب',
    en: 'With love',
    arText: 'من أول اختيار النكهة لآخر لمسة تقديم — بنحضّر وكأنه لأهلنا.',
    enText: 'From the first flavour choice to the final garnish — made like it is for family.',
  },
]

export default function AboutPage() {
  const { lang } = useApp()
  const { pages, settings, activeProducts, activeCategories } = useContent()
  const ar = lang === 'ar'
  const page = pages.about

  if (!page?.active) return <PageDisabled />

  const title = page.title?.[lang] || (ar ? 'من نحن' : 'About us')
  const body = page.body?.[lang] || settings.bio?.[lang] || ''
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-bg pb-16">
      <PageBanner
        title={title}
        kicker={ar ? 'BENOVA · حكايتنا' : 'BENOVA · OUR STORY'}
        icon={<IconSparkle size={25} />}
        subtitle={
          ar
            ? 'حكاية كريب طازج، شوكولاتة حقيقية، وتفاصيل صغيرة صنعت نكهة BENOVA.'
            : 'A story of fresh crepes, real chocolate, and the small details that made BENOVA.'
        }
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/8 px-3 py-2 text-[10px] font-black text-gold-deep dark:text-gold">
          <span className="h-1.5 w-1.5 rounded-full bg-gold" />
          {ar ? 'منذ 2026' : 'SINCE 2026'}
        </span>
      </PageBanner>

      {/* ─── القصة ─── */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
          <motion.div
            initial={{ opacity: 0, x: ar ? 22 : -22 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <BrandArtwork
              ar={ar}
              settings={settings}
              productCount={activeProducts.length}
              categoryCount={activeCategories.length}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="min-w-0"
          >
            <span className="text-[9px] font-black uppercase tracking-[0.28em] text-gold-deep dark:text-gold/80">
              {ar ? 'البداية' : 'THE BEGINNING'}
            </span>
            <h2 className="mt-2 font-display text-[26px] leading-tight tracking-wide text-ink dark:text-cream sm:text-[32px]">
              {ar ? 'نكهة بتشبه البيت… بلمسة استثنائية' : 'A taste of home, made extraordinary'}
            </h2>
            <div className="mt-4 h-px w-24 bg-gradient-to-r from-gold via-gold/55 to-transparent" />

            <div className="mt-5 space-y-4">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className={
                    index === 0
                      ? 'text-[14px] font-semibold leading-8 text-ink/85 dark:text-cream/75 sm:text-[15px]'
                      : 'text-[12.5px] font-medium leading-7 text-muted sm:text-[13px]'
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="btn-primary px-6 py-3.5"
              >
                {ar ? 'تذوّق المنيو' : 'Taste the menu'}
                <span className={ar ? 'rotate-90' : '-rotate-90'}>
                  <IconChevron size={13} />
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/contact')}
                className="btn-ghost px-5 py-3.5"
              >
                {ar ? 'تواصل معنا' : 'Get in touch'}
              </button>
            </div>

            <div className="mt-7 flex items-center gap-3 rounded-2xl border border-line/70 bg-surface/55 p-3.5 dark:border-white/10 dark:bg-white/[0.035]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold-deep dark:text-gold">
                <IconSparkle size={18} />
              </span>
              <p className="text-[11px] font-semibold leading-relaxed text-muted">
                {ar
                  ? settings.bio?.ar
                  : settings.bio?.en}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── معايير الجودة ─── */}
      <section className="relative overflow-hidden border-y border-line/60 bg-surface/35 py-12 dark:bg-white/[0.015] sm:py-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className="absolute -top-24 end-1/4 h-64 w-64 rounded-full bg-gold/8 blur-[90px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-[9px] font-black uppercase tracking-[0.28em] text-gold-deep dark:text-gold/80">
              {ar ? 'المعايير' : 'THE STANDARD'}
            </span>
            <h2 className="mt-2 font-display text-2xl tracking-wide text-ink dark:text-cream sm:text-3xl">
              {ar ? 'أربع وعود صغيرة… بنكهة كبيرة' : 'Four little promises, one big flavour'}
            </h2>
            <p className="mt-2 text-[11.5px] font-semibold leading-relaxed text-muted">
              {ar
                ? 'ما منخفّف التفاصيل. كل شي من أول المكوّن لآخر رشة بيستاهل العناية.'
                : 'We never cut the details. From the first ingredient to the final dusting, it all matters.'}
            </p>
          </div>

          <div className="mt-8 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {PILLARS.map((pillar, index) => (
              <motion.div
                key={pillar.en}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                className="group relative overflow-hidden rounded-[26px] border border-line/75 bg-surface/80 p-5 shadow-[0_18px_38px_-32px_rgba(22,33,26,0.6)] backdrop-blur transition-[border-color,transform] duration-300 hover:-translate-y-1 hover:border-gold/45 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <span className="pointer-events-none absolute -top-8 -end-8 h-24 w-24 rounded-full bg-gold/8 blur-2xl transition-opacity group-hover:opacity-100" />
                <span className="relative grid h-12 w-12 place-items-center rounded-2xl border border-gold/25 bg-gold/10 text-[24px]">
                  {pillar.emoji}
                </span>
                <h3 className="relative mt-4 font-display text-[16px] tracking-wide text-ink dark:text-cream">
                  {ar ? pillar.ar : pillar.en}
                </h3>
                <p className="relative mt-2 text-[11px] font-medium leading-6 text-muted">
                  {ar ? pillar.arText : pillar.enText}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── اقتباس + CTA ─── */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-[30px] border border-line/75 bg-surface/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.035] sm:p-8"
          >
            <span className="pointer-events-none absolute -top-3 start-4 font-display text-[100px] leading-none text-gold/15">
              “
            </span>
            <p className="relative mt-7 font-display text-[20px] leading-relaxed tracking-wide text-ink dark:text-cream sm:text-[24px]">
              {ar
                ? 'ما بنبيع حلويات… بنصنع لحظة صغيرة بتضل بذاكرتك.'
                : 'We don’t just serve sweets — we make a little moment you remember.'}
            </p>
            <div className="relative mt-5 flex items-center gap-3">
              <span className="h-px w-10 bg-gold/60" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-deep dark:text-gold/85">
                {ar ? 'فريق BENOVA' : 'The BENOVA team'}
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="relative overflow-hidden rounded-[30px] primary-bg p-6 text-cream shadow-[0_30px_60px_-35px_rgba(30,70,51,0.8)] sm:p-8"
          >
            <div className="pointer-events-none absolute -top-12 -end-10 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 start-0 h-40 w-40 rounded-full bg-cocoa/40 blur-3xl" />
            <div className="relative">
              <span className="text-[9px] font-black uppercase tracking-[0.26em] text-gold/90">
                {ar ? 'جاهز للتجربة؟' : 'READY TO TASTE?'}
              </span>
              <h2 className="mt-2 font-display text-2xl leading-tight tracking-wide">
                {ar ? 'الحكاية بتكمّل بأول لقمة' : 'The story continues with the first bite'}
              </h2>
              <p className="mt-2.5 text-[11.5px] font-semibold leading-6 text-cream/70">
                {ar
                  ? 'تصفّح 14 قسم من الكريبات والعصائر والحلويات، واطلب مباشرة عبر واتساب.'
                  : 'Browse 14 sections of crepes, juices and desserts, and order straight on WhatsApp.'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-[11px] font-black text-cocoa shadow-lg transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                {ar ? 'افتح المنيو' : 'Open the menu'}
                <span className={ar ? 'rotate-90' : '-rotate-90'}>
                  <IconChevron size={12} />
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <BottomNav />
    </div>
  )
}
