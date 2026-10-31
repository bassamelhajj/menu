/**
 * pages/ReviewsPage.jsx — آراء الزبائن
 * ===========================================================================
 * • ملخّص تقييم (متوسط + توزيع النجوم) + نموذج مشاركة للزبائن المسجّلين.
 * • آراء موافق عليها من لوحة التحكم، وآراء مختارة يديرها صاحب المحل.
 * • شبكة testimonial cards موحّدة، مع حالات فراغ أنيقة.
 */
import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { navigate } from '../lib/hashRoute'
import { clearSession, getSession } from '../lib/session'
import ReviewForm from '../components/ReviewForm'
import PageBanner, { PageDisabled } from '../components/PageBanner'
import BottomNav from '../components/BottomNav'
import {
  IconChevron,
  IconSparkle,
  IconStar,
  IconUser,
} from '../components/icons'

function Stars({ rating, size = 14, showEmpty = true }) {
  return (
    <div className="flex items-center gap-0.5 text-gold" aria-label={`${rating} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= rating || !showEmpty ? 'opacity-100' : 'opacity-25'}
        >
          <IconStar size={size} filled={n <= rating} />
        </span>
      ))}
    </div>
  )
}

const parseTime = (value) => {
  const time = Date.parse(value || '')
  return Number.isFinite(time) ? time : 0
}

export default function ReviewsPage() {
  const { lang } = useApp()
  const { pages, reviews } = useContent()
  const ar = lang === 'ar'
  const page = pages.reviews

  const [session, setSession] = useState(() => getSession())

  const approved = useMemo(
    () =>
      (reviews || [])
        .filter((review) => review.status === 'approved')
        .map((review) => ({
          key: `customer-${review.id}`,
          name: review.name || (ar ? 'زبون BENOVA' : 'BENOVA guest'),
          rating: Number(review.rating) || 5,
          text: review.text || '',
          image: review.image || '',
          date: (review.createdAt || '').slice(0, 10),
          verified: true,
        })),
    [ar, reviews],
  )

  const featured = useMemo(
    () =>
      (page?.items || [])
        .filter((item) => item.active !== false)
        .map((item) => ({
          key: `featured-${item.id}`,
          name: item.name || (ar ? 'ضيف BENOVA' : 'BENOVA guest'),
          rating: Number(item.rating) || 5,
          text: item.text?.[lang] || item.text?.en || item.text?.ar || '',
          image: '',
          date: item.date || '',
          featured: true,
        })),
    [ar, lang, page],
  )

  const allReviews = useMemo(
    () =>
      [...approved, ...featured].sort(
        (a, b) => parseTime(b.date) - parseTime(a.date),
      ),
    [approved, featured],
  )

  const stats = useMemo(() => {
    const total = allReviews.length
    const sum = allReviews.reduce((acc, review) => acc + review.rating, 0)
    const average = total ? sum / total : 0
    const distribution = [5, 4, 3, 2, 1].map((star) => {
      const count = allReviews.filter((review) => review.rating === star).length
      return {
        star,
        count,
        percent: total ? Math.round((count / total) * 100) : 0,
      }
    })
    return { total, average, distribution }
  }, [allReviews])

  if (!page?.active) return <PageDisabled />

  const title = page.title?.[lang] || (ar ? 'آراء الزبائن' : 'Reviews')
  const averageLabel = stats.total ? stats.average.toFixed(1) : '—'

  return (
    <div className="min-h-screen bg-bg pb-16">
      <PageBanner
        title={title}
        kicker={ar ? 'BENOVA · المجتمع' : 'BENOVA · COMMUNITY'}
        icon={<IconStar size={26} />}
        subtitle={
          ar
            ? 'كلمات حقيقية من زبائن BENOVA — تجارب، تفاصيل، ونجوم بتعبّر عن كل لقمة.'
            : 'Real words from BENOVA guests — experiences, details, and stars for every bite.'
        }
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/8 px-3 py-2 text-[10px] font-black text-gold-deep dark:text-gold">
          <Stars rating={Math.round(stats.average)} size={11} />
          {stats.total ? `${averageLabel} · ${stats.total}` : ar ? 'كون أول رأي' : 'Be the first'}
        </span>
      </PageBanner>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        {/* ─── ملخّص + مشاركة ─── */}
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr] lg:gap-5">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative overflow-hidden rounded-[30px] border border-line/75 bg-surface/70 p-5 shadow-[0_24px_54px_-40px_rgba(22,33,26,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-6"
          >
            <div className="pointer-events-none absolute -top-16 -end-12 h-48 w-48 rounded-full bg-gold/12 blur-[70px]" />
            <div className="relative flex flex-wrap items-start justify-between gap-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.26em] text-gold-deep dark:text-gold/80">
                  {ar ? 'تقييم الزبائن' : 'GUEST RATING'}
                </span>
                <div className="mt-2 flex items-end gap-3">
                  <span className="font-display text-[52px] leading-none tracking-tight text-ink dark:text-cream">
                    {averageLabel}
                  </span>
                  <div className="pb-1.5">
                    <Stars rating={Math.round(stats.average)} size={15} />
                    <p className="mt-1.5 text-[10px] font-bold text-muted">
                      {stats.total
                        ? ar
                          ? `${stats.total} تقييم منشور`
                          : `${stats.total} published reviews`
                        : ar
                          ? 'ما في تقييمات بعد'
                          : 'No ratings yet'}
                    </p>
                  </div>
                </div>
              </div>

              <span className="grid h-12 w-12 place-items-center rounded-2xl border border-gold/25 bg-gold/10 text-gold-deep dark:text-gold">
                <IconSparkle size={21} />
              </span>
            </div>

            <div className="relative mt-5 space-y-2">
              {stats.distribution.map((row) => (
                <div key={row.star} className="flex items-center gap-2">
                  <span className="flex w-7 items-center gap-1 text-[10px] font-black text-muted">
                    {row.star}
                    <IconStar size={9} />
                  </span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line/70 dark:bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${row.percent}%` }}
                      transition={{ duration: 0.7, delay: 0.15 }}
                      className="h-full rounded-full gold-bg"
                    />
                  </div>
                  <span className="w-7 text-end text-[9px] font-bold text-muted/70">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative mt-5 flex items-center gap-2 rounded-2xl border border-line/70 bg-bg/45 px-3 py-2.5 dark:border-white/10 dark:bg-black/10">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <p className="text-[9.5px] font-semibold leading-relaxed text-muted">
                {ar
                  ? 'كل رأي بيظهر بعد موافقة صاحب المحل — بلا حسابات وهمية.'
                  : 'Every review goes live after owner approval — no fake accounts.'}
              </p>
            </div>
          </motion.div>

          {/* مشاركة رأي */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="min-w-0"
          >
            {session ? (
              <div className="relative overflow-hidden rounded-[30px] border border-line/75 bg-surface/70 p-2 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 pb-1.5 pt-3">
                  <span className="inline-flex min-w-0 items-center gap-2 text-[10px] font-black text-primary">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full primary-bg text-[10px] text-cream">
                      {(session.name || '?').slice(0, 1).toUpperCase()}
                    </span>
                    <span className="truncate">
                      {ar ? `مسجّل دخولك: ${session.name}` : `Signed in as ${session.name}`}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      clearSession()
                      setSession(null)
                    }}
                    className="text-[10px] font-black text-muted underline-offset-2 transition-colors hover:text-red-500 hover:underline"
                  >
                    {ar ? 'خروج' : 'Log out'}
                  </button>
                </div>
                <ReviewForm email={session.email} ar={ar} compact />
              </div>
            ) : (
              <div className="relative h-full overflow-hidden rounded-[30px] border border-gold/25 bg-surface/70 p-6 text-center backdrop-blur-xl dark:border-gold/20 dark:bg-white/[0.04] sm:p-7">
                <div className="pointer-events-none absolute -top-16 start-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-gold/12 blur-[60px]" />
                <div className="relative mx-auto w-fit">
                  <span className="absolute -inset-3 rounded-full border border-gold/15" />
                  <span className="relative grid h-16 w-16 place-items-center rounded-full border border-gold/30 bg-gold/12 text-gold-deep dark:text-gold">
                    <IconStar size={28} />
                  </span>
                </div>
                <h2 className="relative mt-5 font-display text-[21px] tracking-wide text-ink dark:text-cream">
                  {ar ? 'شارك تجربتك' : 'Share your experience'}
                </h2>
                <p className="relative mx-auto mt-2 max-w-xs text-[11.5px] font-semibold leading-6 text-muted">
                  {ar
                    ? 'سجّل دخولك أو اعمل حساب (٣٠ ثانية) واكتب رأيك، مع صورة لطلبك إذا بدك.'
                    : 'Sign in or create an account (30 seconds) to review your order and add a photo.'}
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/account')}
                  className="relative mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl gold-bg px-5 py-3.5 text-[12px] font-black text-cocoa shadow-[0_14px_30px_-16px_rgba(176,138,69,0.8)] transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  <IconUser size={15} />
                  {ar ? 'سجّل دخول / حساب جديد' : 'Sign in / Sign up'}
                </button>
                <p className="relative mt-3 text-[9.5px] font-semibold text-muted/70">
                  {ar
                    ? 'حسابك بيخليك تحفظ مفضلاتك وتكتب آراء موثّقة.'
                    : 'An account saves your favorites and lets you post verified reviews.'}
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* ─── شبكة الآراء ─── */}
        <section className="mt-9">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.26em] text-gold-deep dark:text-gold/80">
                {ar ? 'من مجتمع BENOVA' : 'FROM THE COMMUNITY'}
              </span>
              <h2 className="mt-1 font-display text-xl tracking-wide text-ink dark:text-cream sm:text-2xl">
                {ar ? 'كلمات بتستاهل تنقرأ' : 'Words worth reading'}
              </h2>
            </div>
            {stats.total > 0 && (
              <span className="rounded-full border border-line bg-surface/60 px-3 py-1.5 text-[9.5px] font-black text-muted dark:border-white/10 dark:bg-white/[0.04]">
                {stats.total} {ar ? 'رأي' : 'reviews'}
              </span>
            )}
          </div>

          {allReviews.length === 0 ? (
            <div className="relative overflow-hidden rounded-[30px] border border-dashed border-line bg-surface/45 px-5 py-14 text-center backdrop-blur dark:border-white/10 dark:bg-white/[0.025] sm:py-16">
              <div className="mx-auto flex justify-center gap-1 text-gold/45">
                {[1, 2, 3, 4, 5].map((n) => (
                  <IconStar key={n} size={24} filled />
                ))}
              </div>
              <h3 className="mt-4 font-display text-xl tracking-wide text-ink dark:text-cream">
                {ar ? 'كون أول من يكتب رأي' : 'Be the first to review'}
              </h3>
              <p className="mx-auto mt-2 max-w-sm text-[11.5px] font-semibold leading-6 text-muted">
                {ar
                  ? 'جرّبت شي طيب؟ كلمة منك بتساعد غيرك يختار، وبتخلّي فريقنا يكمل بحب.'
                  : 'Tried something you loved? Your words help others choose — and keep our team smiling.'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/account')}
                className="btn-primary relative mt-5 px-6 py-3.5"
              >
                {ar ? 'اكتب أول رأي' : 'Write the first review'}
                <span className={ar ? 'rotate-90' : '-rotate-90'}>
                  <IconChevron size={12} />
                </span>
              </button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {allReviews.map((review, index) => (
                <motion.article
                  key={review.key}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.25) }}
                  className="group relative flex h-full flex-col overflow-hidden rounded-[26px] border border-line/75 bg-surface/70 p-5 shadow-[0_18px_40px_-34px_rgba(22,33,26,0.55)] backdrop-blur transition-[border-color,transform,box-shadow] duration-300 hover:-translate-y-1 hover:border-gold/40 hover:shadow-[0_26px_48px_-30px_rgba(176,138,69,0.35)] dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-3 end-3 font-display text-[64px] leading-none text-gold/12"
                  >
                    ”
                  </span>

                  <div className="relative flex items-center justify-between gap-2">
                    <Stars rating={review.rating} size={13} />
                    <span
                      className={`rounded-full border px-2 py-1 text-[8px] font-black uppercase tracking-[0.12em] ${
                        review.verified
                          ? 'border-primary/25 bg-primary/10 text-primary'
                          : 'border-gold/25 bg-gold/10 text-gold-deep dark:text-gold'
                      }`}
                    >
                      {review.verified
                        ? ar
                          ? 'موثّق'
                          : 'Verified'
                        : ar
                          ? 'مختار'
                          : 'Featured'}
                    </span>
                  </div>

                  <p className="relative mt-3 flex-1 text-[12px] font-medium leading-7 text-muted whitespace-pre-line">
                    {review.text}
                  </p>

                  {review.image && (
                    <a
                      href={review.image}
                      target="_blank"
                      rel="noreferrer"
                      className="relative mt-3 block overflow-hidden rounded-2xl border border-line/70"
                    >
                      <img
                        src={review.image}
                        alt={ar ? 'صورة الطلب' : 'Order photo'}
                        loading="lazy"
                        className="max-h-44 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </a>
                  )}

                  <div className="relative mt-4 flex items-center gap-2.5 border-t border-line/70 pt-3.5 dark:border-white/10">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full primary-bg text-[11px] font-black text-cream">
                      {(review.name || '?').slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11.5px] font-extrabold text-ink dark:text-cream">
                        {review.name}
                      </p>
                      {review.date && (
                        <p className="mt-0.5 text-[9px] font-semibold text-muted/70">
                          {review.date}
                        </p>
                      )}
                    </div>
                    <span className="text-gold/45">
                      <IconSparkle size={13} />
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomNav />
    </div>
  )
}
