import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { useBusinessStatus } from '../../lib/hours'
import { fmtPrice } from '../../lib/format'
import { Card } from './ui'
import {
  IconBox,
  IconCoin,
  IconDatabase,
  IconExternal,
  IconImage,
  IconReceipt,
  IconSparkle,
  IconStar,
  IconTruck,
  IconUsers,
} from '../../components/icons'

const STATUS_TONES = {
  gold: {
    wrap: 'border-gold/18 bg-gold/[0.07]',
    icon: 'border-gold/25 bg-gold/10 text-gold',
    value: 'text-[#f4e5b8]',
  },
  emerald: {
    wrap: 'border-emerald-400/15 bg-emerald-400/[0.055]',
    icon: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    value: 'text-emerald-200',
  },
  sky: {
    wrap: 'border-sky-400/15 bg-sky-400/[0.055]',
    icon: 'border-sky-400/20 bg-sky-400/10 text-sky-300',
    value: 'text-sky-200',
  },
  rose: {
    wrap: 'border-rose-400/15 bg-rose-400/[0.055]',
    icon: 'border-rose-400/20 bg-rose-400/10 text-rose-300',
    value: 'text-rose-200',
  },
}

export default function DashboardTab({ goTab }) {
  const { lang, currency } = useApp()
  const {
    products,
    activeCategories,
    orders,
    offers,
    customers,
    reviews,
    settings,
    usdRate,
    gallery,
  } = useContent()

  const ar = lang === 'ar'
  const status = useBusinessStatus(settings.hours, lang, settings.storeStatus)
  const newOrders = orders.filter((order) => order.status === 'new').length
  const pendingReviews = reviews.filter((review) => review.status === 'pending').length
  const activeProducts = products.filter((product) => product.active !== false).length
  const revenue = orders.reduce((sum, order) => sum + (Number(order.totalLL) || 0), 0)

  const dateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(ar ? 'ar-LB' : 'en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date()),
    [ar],
  )

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (ar) return hour < 12 ? 'صباح الخير' : hour < 18 ? 'مساء الخير' : 'مساء الخير'
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  }, [ar])

  const stats = [
    {
      label: ar ? 'الطلبات' : 'Orders',
      value: orders.length,
      caption: newOrders
        ? ar
          ? `${newOrders} بانتظار المعالجة`
          : `${newOrders} awaiting action`
        : ar
          ? 'كل الطلبات مُعالجة'
          : 'All caught up',
      Icon: IconReceipt,
      tab: 'orders',
      tone: 'gold',
    },
    {
      label: ar ? 'الإيرادات المسجّلة' : 'Recorded revenue',
      value: fmtPrice(revenue, currency, usdRate),
      caption: ar ? 'مجموع الطلبات المحلية' : 'Local orders total',
      Icon: IconCoin,
      tab: 'orders',
      tone: 'emerald',
    },
    {
      label: ar ? 'المنتجات النشطة' : 'Active products',
      value: activeProducts,
      caption: `${products.length} ${ar ? 'إجمالي ·' : 'total ·'} ${activeCategories.length} ${ar ? 'قسم' : 'categories'}`,
      Icon: IconBox,
      tab: 'products',
      tone: 'sky',
    },
    {
      label: ar ? 'الزبائن' : 'Customers',
      value: customers.length,
      caption: pendingReviews
        ? ar
          ? `${pendingReviews} رأي بانتظار المراجعة`
          : `${pendingReviews} reviews to moderate`
        : ar
          ? 'لا آراء معلّقة'
          : 'No pending reviews',
      Icon: IconUsers,
      tab: 'customers',
      tone: 'rose',
    },
  ]

  const previewUrl = useMemo(() => {
    if (typeof window === 'undefined') return '#/'
    return `${window.location.origin}${window.location.pathname}#/`
  }, [])

  const recentOrders = orders.slice(0, 4)

  const fmtDate = (ts) =>
    new Date(ts).toLocaleString(ar ? 'ar-LB' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="exec-glass relative overflow-hidden rounded-[1.7rem] p-5 sm:p-7">
        <div className="pointer-events-none absolute -end-24 -top-28 h-72 w-72 rounded-full border border-gold/10" />
        <div className="pointer-events-none absolute -end-10 -top-14 h-48 w-48 rounded-full border border-gold/[0.07]" />
        <div className="pointer-events-none absolute -start-20 bottom-[-8rem] h-64 w-64 rounded-full bg-gold/[0.06] blur-3xl" />
        <div className="exec-shimmer pointer-events-none absolute inset-x-0 top-0 h-px" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-gold/25 bg-gold/[0.08] px-2.5 py-1 text-[7.5px] font-black uppercase tracking-[0.22em] text-gold">
                BENOVA · Executive
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-[8px] font-black text-white/40">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    status.open ? 'bg-emerald-400 exec-status-open' : 'bg-red-400'
                  }`}
                />
                {status.open
                  ? ar
                    ? 'المتجر مفتوح'
                    : 'Store is open'
                  : ar
                    ? 'المتجر مغلق'
                    : 'Store is closed'}
              </span>
            </div>

            <h2 className="mt-4 font-display text-[26px] font-semibold leading-tight tracking-wide text-[#f7f1e5] sm:text-[34px]">
              {greeting}، <span className="text-gold">{ar ? 'أهلاً بك' : 'welcome back'}</span>
            </h2>
            <p className="mt-2 max-w-xl text-[11px] font-semibold leading-relaxed text-white/38 sm:text-xs">
              {ar
                ? 'مركز قيادة واحد لكل تفاصيل BENOVA: المنيو، الطلبات، الزبائن، الهوية، والنشر — بتجربة محلية سريعة وآمنة.'
                : 'One command center for every BENOVA detail: menu, orders, customers, identity and publishing — fast, local and private.'}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => goTab('orders')}
                className="btn-primary inline-flex items-center gap-2 px-4 py-2.5"
              >
                <IconReceipt size={15} />
                {ar ? 'إدارة الطلبات' : 'Manage orders'}
                {newOrders > 0 && (
                  <span className="rounded-full bg-[#1a130b]/15 px-1.5 py-0.5 text-[9px] font-black">
                    {newOrders}
                  </span>
                )}
              </button>

              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost inline-flex items-center gap-2 px-4 py-2.5"
              >
                <IconExternal size={14} />
                {ar ? 'معاينة الموقع' : 'Live preview'}
              </a>

              <button
                type="button"
                onClick={() => goTab('publish')}
                className="btn-ghost inline-flex items-center gap-2 px-4 py-2.5"
              >
                <IconDatabase size={14} />
                {ar ? 'نشر المحتوى' : 'Publish content'}
              </button>
            </div>
          </div>

          <div className="grid shrink-0 grid-cols-2 gap-2.5 sm:min-w-[19rem]">
            <div className="rounded-2xl border border-white/[0.07] bg-black/15 px-3.5 py-3 backdrop-blur-xl">
              <p className="text-[7.5px] font-black uppercase tracking-[0.2em] text-white/25">
                {ar ? 'اليوم' : 'Today'}
              </p>
              <p className="mt-1.5 text-[10px] font-extrabold leading-snug text-white/65">
                {dateLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-black/15 px-3.5 py-3 backdrop-blur-xl">
              <p className="text-[7.5px] font-black uppercase tracking-[0.2em] text-white/25">
                {ar ? 'الدوام' : 'Hours'}
              </p>
              <p className="mt-1.5 line-clamp-2 text-[10px] font-extrabold leading-snug text-white/65">
                {settings.hours?.[lang] || settings.hours?.en || '—'}
              </p>
            </div>
            <div className="col-span-2 flex items-center justify-between rounded-2xl border border-white/[0.07] bg-black/15 px-3.5 py-2.5 backdrop-blur-xl">
              <span className="flex items-center gap-2 text-[8.5px] font-black text-white/35">
                <IconTruck size={13} className="text-gold/70" />
                {ar ? 'سعر التوصيل' : 'Delivery fee'}
              </span>
              <span className="text-[10px] font-black text-gold">
                {Number(settings.deliveryFee) > 0
                  ? fmtPrice(Number(settings.deliveryFee), currency, usdRate)
                  : ar
                    ? 'غير مفعّل'
                    : 'Not set'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
        {stats.map((stat, index) => {
          const tone = STATUS_TONES[stat.tone]
          const Icon = stat.Icon
          return (
            <motion.button
              key={stat.label}
              type="button"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.045, duration: 0.3 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.985 }}
              onClick={() => goTab(stat.tab)}
              className={`group relative overflow-hidden rounded-[1.35rem] border p-3.5 text-start backdrop-blur-2xl transition-colors sm:p-4 ${tone.wrap}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className={`truncate text-[19px] font-black leading-none tracking-tight sm:text-[23px] ${tone.value}`}>
                    {stat.value}
                  </p>
                  <p className="mt-2 text-[9px] font-black uppercase tracking-[0.08em] text-white/35">
                    {stat.label}
                  </p>
                </div>
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${tone.icon}`}>
                  <Icon size={16} />
                </span>
              </div>
              <p className="mt-2 line-clamp-1 text-[8.5px] font-bold text-white/28">
                {stat.caption}
              </p>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </motion.button>
          )
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-[17px] font-semibold tracking-wide text-[#f7f1e5]">
                {ar ? 'آخر الطلبات' : 'Recent orders'}
              </h3>
              <p className="mt-0.5 text-[9px] font-bold text-white/30">
                {ar ? 'آخر الحركة على هذا الجهاز' : 'Latest activity on this device'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => goTab('orders')}
              className="text-[9px] font-black text-gold/70 transition-colors hover:text-gold"
            >
              {ar ? 'عرض الكل ←' : 'View all →'}
            </button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-10 text-center">
              <span className="grid mx-auto h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.03] text-gold/50">
                <IconReceipt size={20} />
              </span>
              <p className="mt-3 text-[11px] font-bold text-white/35">
                {ar ? 'ما في طلبات مسجّلة بعد.' : 'No orders logged yet.'}
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {recentOrders.map((order) => {
                const done = order.status === 'done'
                return (
                  <button
                    key={order.id}
                    type="button"
                    onClick={() => goTab('orders')}
                    className="flex w-full items-center gap-3 rounded-2xl border border-transparent px-2.5 py-2.5 text-start transition-colors hover:border-white/[0.06] hover:bg-white/[0.025]"
                  >
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border ${
                        done
                          ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                          : 'border-gold/20 bg-gold/10 text-gold'
                      }`}
                    >
                      {done ? <IconCheckSafe /> : <IconReceipt size={15} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate text-[10.5px] font-black text-white/75">
                          #{order.id} · {order.name || (ar ? 'زبون' : 'Guest')}
                        </span>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider ${
                            done
                              ? 'bg-emerald-400/10 text-emerald-300/75'
                              : 'bg-gold/10 text-gold/80'
                          }`}
                        >
                          {done ? (ar ? 'مكتمل' : 'Done') : ar ? 'جديد' : 'New'}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-[8.5px] font-semibold text-white/28">
                        {fmtDate(order.createdAt)} ·{' '}
                        {order.items?.reduce((sum, item) => sum + item.qty, 0) || 0}{' '}
                        {ar ? 'عنصر' : 'items'} ·{' '}
                        {order.mode === 'delivery' ? (ar ? 'توصيل' : 'Delivery') : ar ? 'استلام' : 'Pickup'}
                      </span>
                    </span>
                    <span className="shrink-0 text-[10px] font-black text-gold/85">
                      {fmtPrice(order.totalLL, currency, usdRate)}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-[16px] font-semibold tracking-wide text-[#f7f1e5]">
                {ar ? 'اختصارات سريعة' : 'Quick actions'}
              </h3>
              <IconSparkle size={15} className="text-gold/55" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: ar ? 'إضافة منتج' : 'Add product', Icon: IconBox, tab: 'products' },
                { label: ar ? 'إدارة الأقسام' : 'Categories', Icon: IconSparkle, tab: 'categories' },
                { label: ar ? 'وسائط المنيو' : 'Menu media', Icon: IconImage, tab: 'pages' },
                { label: ar ? 'رسوم التوصيل' : 'Delivery fees', Icon: IconTruck, tab: 'delivery' },
              ].map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => goTab(action.tab)}
                  className="flex flex-col items-start gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-start transition-colors hover:border-gold/25 hover:bg-gold/[0.045]"
                >
                  <action.Icon size={15} className="text-gold/65" />
                  <span className="text-[9px] font-black leading-tight text-white/50">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -end-12 -top-12 h-32 w-32 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gold/45">
                  {ar ? 'صحة المحتوى' : 'Content pulse'}
                </p>
                <h3 className="mt-1 font-display text-[17px] font-semibold tracking-wide text-[#f7f1e5]">
                  {ar ? 'جاهز للنشر' : 'Ready to publish'}
                </h3>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-2xl border border-gold/20 bg-gold/10 text-gold">
                <IconDatabase size={17} />
              </span>
            </div>

            <div className="relative mt-4 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3">
              {[
                { value: products.length, label: ar ? 'منتج' : 'items' },
                { value: activeCategories.length, label: ar ? 'قسم' : 'sections' },
                { value: gallery.length, label: ar ? 'صفحة' : 'pages' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-[15px] font-black text-white/75">{item.value}</p>
                  <p className="mt-0.5 text-[7.5px] font-black uppercase tracking-wider text-white/25">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => goTab('publish')}
              className="relative mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gold/20 bg-gold/[0.07] py-2.5 text-[9.5px] font-black text-gold/85 transition-colors hover:border-gold/40 hover:bg-gold/[0.12]"
            >
              <IconExternal size={13} />
              {ar ? 'فتح مركز النشر' : 'Open publishing center'}
            </button>
          </Card>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => goTab('reviews')}
              className="rounded-[1.2rem] border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-start transition-colors hover:border-gold/20"
            >
              <IconStar size={15} className="text-gold/55" />
              <p className="mt-2 text-[16px] font-black text-white/70">{pendingReviews}</p>
              <p className="text-[8px] font-black text-white/28">
                {ar ? 'آراء معلّقة' : 'pending reviews'}
              </p>
            </button>
            <button
              type="button"
              onClick={() => goTab('products')}
              className="rounded-[1.2rem] border border-white/[0.06] bg-white/[0.025] px-3 py-3 text-start transition-colors hover:border-gold/20"
            >
              <IconSparkle size={15} className="text-gold/55" />
              <p className="mt-2 text-[16px] font-black text-white/70">{offers.length}</p>
              <p className="text-[8px] font-black text-white/28">
                {ar ? 'عروض نشطة' : 'live offers'}
              </p>
            </button>
          </div>
        </div>
      </div>

      <p className="px-1 text-center text-[8px] font-bold leading-relaxed text-white/18">
        {ar
          ? 'كل التعديلات تُحفظ محلياً أولاً. انسخ المحتوى المنشور لتطبيقها على أجهزة الزبائن.'
          : 'Every change is saved locally first. Publish the clean content file to apply it on customer devices.'}
      </p>

    </div>
  )
}

/** علامة صح صغيرة معزولة لتفادي أخطاء الاستيراد */
function IconCheckSafe() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m5 12.5 4.3 4.3L19 7" />
    </svg>
  )
}
