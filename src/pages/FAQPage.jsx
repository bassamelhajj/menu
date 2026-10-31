/**
 * pages/FAQPage.jsx — الأسئلة الشائعة
 * ===========================================================================
 * • أكورديون أنيق مع بحث فوري داخل الأسئلة والأجوبة.
 * • sidebar ثابت فيه تواصل سريع وواتساب، وبيتحوّل لبطاقة عادية على الموبايل.
 * • محتوى الأسئلة نفسه إدارة كاملة من لوحة التحكم ← الصفحات.
 */
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { navigate } from '../lib/hashRoute'
import PageBanner, { PageDisabled } from '../components/PageBanner'
import BottomNav from '../components/BottomNav'
import {
  IconChevron,
  IconClose,
  IconPlus,
  IconSearch,
  IconSparkle,
  IconWhatsApp,
} from '../components/icons'

export default function FAQPage() {
  const { lang } = useApp()
  const { pages, settings } = useContent()
  const ar = lang === 'ar'
  const page = pages.faq

  const activeItems = useMemo(
    () => (page?.items || []).filter((item) => item.active !== false),
    [page],
  )

  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(() => activeItems[0]?.id || null)

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return activeItems
    return activeItems.filter((item) => {
      const haystack = [
        item.q?.ar,
        item.q?.en,
        item.a?.ar,
        item.a?.en,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      return haystack.includes(term)
    })
  }, [activeItems, query])

  if (!page?.active) return <PageDisabled />

  const title = page.title?.[lang] || (ar ? 'الأسئلة الشائعة' : 'FAQ')
  const waLink = settings.whatsapp ? `https://wa.me/${settings.whatsapp}` : ''

  return (
    <div className="min-h-screen bg-bg pb-16">
      <PageBanner
        title={title}
        kicker={ar ? 'BENOVA · مساعدة' : 'BENOVA · HELP'}
        icon={<span className="font-display text-2xl leading-none">؟</span>}
        subtitle={
          ar
            ? 'كل شي بدك تعرفه عن الطلب، التوصيل، الدفع، والمكوّنات — بجواب واضح ومباشر.'
            : 'Everything about ordering, delivery, payment and ingredients — clear and direct.'
        }
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-2 text-[10px] font-black text-muted dark:border-white/10 dark:bg-white/[0.05]">
          <IconSparkle size={12} />
          {activeItems.length} {ar ? 'سؤال' : 'answers'}
        </span>
      </PageBanner>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[0.74fr_1.26fr] lg:items-start lg:gap-8">
          {/* ─── العمود الجانبي ─── */}
          <aside className="space-y-4 lg:sticky lg:top-[calc(var(--site-header-h,4.5rem)+1.25rem)]">
            <div className="relative overflow-hidden rounded-[28px] primary-bg p-6 text-cream shadow-[0_26px_55px_-34px_rgba(30,70,51,0.9)]">
              <div className="pointer-events-none absolute -top-14 -end-10 h-40 w-40 rounded-full bg-gold/25 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 start-0 h-36 w-36 rounded-full bg-cocoa/40 blur-3xl" />
              <div className="relative">
                <span className="text-[9px] font-black uppercase tracking-[0.26em] text-gold/90">
                  {ar ? 'محتاج مساعدة؟' : 'NEED A HAND?'}
                </span>
                <h2 className="mt-2 font-display text-2xl leading-tight tracking-wide">
                  {ar ? 'نحنا على بعد رسالة' : 'We are one message away'}
                </h2>
                <p className="mt-2 text-[11.5px] font-semibold leading-6 text-cream/70">
                  {ar
                    ? 'إذا سؤالك مو موجود أو بدك تعدّل طلبك، راسلنا واتساب وردّ عليك فريق BENOVA.'
                    : 'If your question is not here or you need to adjust an order, message us on WhatsApp.'}
                </p>

                <div className="mt-5 space-y-2.5">
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-4 py-3 text-[11.5px] font-black text-white shadow-lg transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                    >
                      <IconWhatsApp size={16} />
                      {ar ? 'احكي معنا واتساب' : 'Chat on WhatsApp'}
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => navigate('/contact')}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-cream/20 bg-cream/10 px-4 py-3 text-[11.5px] font-black text-cream transition-colors hover:bg-cream/15 active:scale-[0.98]"
                  >
                    {ar ? 'كل طرق التواصل' : 'All contact options'}
                    <span className={ar ? 'rotate-90' : '-rotate-90'}>
                      <IconChevron size={12} />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[26px] border border-line/75 bg-surface/60 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.035]">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-gold-deep dark:text-gold/80">
                {ar ? 'قبل ما تسأل' : 'BEFORE YOU ASK'}
              </p>
              <div className="mt-3 space-y-3">
                {[
                  {
                    icon: '🚚',
                    label: ar ? 'التوصيل والاستلام' : 'Delivery & pickup',
                  },
                  {
                    icon: '💳',
                    label: ar ? 'طرق الدفع والعملات' : 'Payment & currencies',
                  },
                  {
                    icon: '🥞',
                    label: ar ? 'المكوّنات والتخصيص' : 'Ingredients & customisation',
                  },
                ].map((topic) => (
                  <div key={topic.label} className="flex items-center gap-2.5 text-[11px] font-bold text-muted">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-line/80 bg-bg/50 text-[14px] dark:border-white/10 dark:bg-white/[0.04]">
                      {topic.icon}
                    </span>
                    <span className="min-w-0 flex-1">{topic.label}</span>
                    <span className="h-1 w-1 rounded-full bg-gold/70" />
                  </div>
                ))}
              </div>
              <p className="mt-4 border-t border-line/70 pt-3 text-[9.5px] font-semibold leading-relaxed text-muted/70 dark:border-white/10">
                {ar
                  ? 'كل الأجوبة قابلة للتعديل من لوحة التحكم.'
                  : 'Every answer is editable from the dashboard.'}
              </p>
            </div>
          </aside>

          {/* ─── الأكورديون ─── */}
          <div className="min-w-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.26em] text-gold-deep dark:text-gold/80">
                  {ar ? 'إجابات سريعة' : 'QUICK ANSWERS'}
                </span>
                <h2 className="mt-1 font-display text-xl tracking-wide text-ink dark:text-cream sm:text-2xl">
                  {ar ? 'اسأل… ونحنا نجيب' : 'Ask away — we have answers'}
                </h2>
              </div>

              <div className="relative w-full sm:w-64">
                <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted/60">
                  <IconSearch size={15} />
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={ar ? 'ابحث داخل الأسئلة…' : 'Search the FAQ…'}
                  aria-label={ar ? 'ابحث داخل الأسئلة الشائعة' : 'Search frequently asked questions'}
                  className="w-full rounded-2xl border border-line bg-surface/75 py-2.5 pe-9 ps-9 text-[11.5px] font-semibold text-ink shadow-sm outline-none backdrop-blur transition-all placeholder:text-muted/55 focus:border-gold/70 focus:ring-4 focus:ring-gold/10 dark:border-white/10 dark:bg-white/[0.05] dark:text-cream"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label={ar ? 'مسح البحث' : 'Clear search'}
                    className="absolute end-2.5 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-lg text-muted transition-colors hover:bg-panel hover:text-ink"
                  >
                    <IconClose size={12} />
                  </button>
                )}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-line bg-surface/45 px-6 py-14 text-center backdrop-blur">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-gold/25 bg-gold/10 text-2xl">
                  🔎
                </span>
                <h3 className="mt-4 font-display text-lg text-ink dark:text-cream">
                  {ar ? 'ما لقينا جواب مطابق' : 'No matching answer'}
                </h3>
                <p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-relaxed text-muted">
                  {ar
                    ? 'جرّب كلمة أبسط، أو راسلنا واتساب ومنساعدك مباشرة.'
                    : 'Try a simpler word, or message us on WhatsApp and we will help directly.'}
                </p>
                <div className="mt-4 flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="btn-ghost px-4 py-2.5 text-[10.5px]"
                  >
                    {ar ? 'مسح البحث' : 'Clear search'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/contact')}
                    className="btn-primary px-4 py-2.5 text-[10.5px]"
                  >
                    {ar ? 'تواصل معنا' : 'Contact us'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filtered.map((item, index) => {
                  const open = openId === item.id
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: Math.min(index * 0.035, 0.2) }}
                      className={`overflow-hidden rounded-[22px] border transition-[border-color,background-color,box-shadow] duration-300 ${
                        open
                          ? 'border-gold/45 bg-surface/90 shadow-[0_20px_44px_-34px_rgba(176,138,69,0.75)] dark:border-gold/30 dark:bg-white/[0.055]'
                          : 'border-line/80 bg-surface/65 shadow-[0_12px_30px_-28px_rgba(22,33,26,0.4)] hover:border-gold/35 dark:border-white/10 dark:bg-white/[0.03]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenId(open ? null : item.id)}
                        aria-expanded={open}
                        aria-controls={`faq-answer-${item.id}`}
                        id={`faq-question-${item.id}`}
                        className="flex w-full items-center gap-3 px-4 py-4 text-start sm:gap-4 sm:px-5 sm:py-4.5"
                      >
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border text-[10px] font-black transition-colors ${
                            open
                              ? 'border-gold/40 bg-gold text-cocoa'
                              : 'border-line bg-bg/60 text-muted dark:border-white/10 dark:bg-white/[0.04]'
                          }`}
                        >
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="min-w-0 flex-1 text-[12.5px] font-extrabold leading-6 text-ink dark:text-cream sm:text-[13.5px]">
                          {ar ? item.q?.ar : item.q?.en}
                        </span>
                        <motion.span
                          animate={{ rotate: open ? 45 : 0 }}
                          transition={{ duration: 0.22 }}
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border transition-colors ${
                            open
                              ? 'border-gold/40 bg-gold/12 text-gold-deep dark:text-gold'
                              : 'border-line/80 text-muted dark:border-white/10'
                          }`}
                        >
                          <IconPlus size={14} />
                        </motion.span>
                      </button>

                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            id={`faq-answer-${item.id}`}
                            role="region"
                            aria-labelledby={`faq-question-${item.id}`}
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="mx-4 mb-4 rounded-2xl border border-line/60 bg-bg/45 px-4 py-3.5 dark:border-white/10 dark:bg-black/10 sm:mx-5">
                              <p className="text-[11.5px] font-medium leading-7 text-muted sm:text-[12px]">
                                {ar ? item.a?.ar : item.a?.en}
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
