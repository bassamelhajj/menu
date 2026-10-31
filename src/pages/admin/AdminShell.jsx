import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { useBusinessStatus } from '../../lib/hours'
import { navigate } from '../../lib/hashRoute'
import {
  IconBox,
  IconChevron,
  IconClock,
  IconClose,
  IconCog,
  IconDashboard,
  IconDatabase,
  IconExternal,
  IconImage,
  IconLayers,
  IconLogout,
  IconMenu,
  IconReceipt,
  IconSparkle,
  IconStar,
  IconTruck,
  IconUsers,
} from '../../components/icons'

const SIDEBAR_KEY = 'benova:admin:sidebar'
const STORAGE_LIMIT = 5 * 1024 * 1024

const NAV_GROUPS = [
  {
    id: 'overview',
    ar: 'نظرة عامة',
    en: 'Overview',
    items: [
      { id: 'dashboard', ar: 'لوحة القيادة', en: 'Overview', Icon: IconDashboard },
    ],
  },
  {
    id: 'store',
    ar: 'المتجر والمنيو',
    en: 'Store & Menu',
    items: [
      { id: 'products', ar: 'المنتجات', en: 'Products', Icon: IconBox },
      { id: 'categories', ar: 'الأقسام', en: 'Categories', Icon: IconLayers },
      { id: 'extras', ar: 'الإضافات', en: 'Extras', Icon: IconSparkle },
      { id: 'orders', ar: 'الطلبات', en: 'Orders', Icon: IconReceipt },
    ],
  },
  {
    id: 'community',
    ar: 'المجتمع والمحتوى',
    en: 'Community & Content',
    items: [
      { id: 'customers', ar: 'الزبائن', en: 'Customers', Icon: IconUsers },
      { id: 'reviews', ar: 'الآراء', en: 'Reviews', Icon: IconStar },
      { id: 'pages', ar: 'الصفحات والمعرض', en: 'Pages & Media', Icon: IconImage },
    ],
  },
  {
    id: 'system',
    ar: 'النظام والأمان',
    en: 'System & Security',
    items: [
      { id: 'settings', ar: 'الإعدادات', en: 'Settings', Icon: IconCog },
      { id: 'delivery', ar: 'التوصيل والرسوم', en: 'Delivery & Fees', Icon: IconTruck },
      { id: 'publish', ar: 'النسخ والنشر', en: 'Backup & Publish', Icon: IconDatabase },
    ],
  },
]

const readCollapsed = () => {
  try {
    return localStorage.getItem(SIDEBAR_KEY) === '1'
  } catch {
    return false
  }
}

const readStorageUsage = () => {
  try {
    let bytes = 0
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i) || ''
      const value = localStorage.getItem(key) || ''
      bytes += new Blob([key, value]).size
    }
    return bytes
  } catch {
    return 0
  }
}

const useStorageUsage = () => {
  const [used, setUsed] = useState(readStorageUsage)

  useEffect(() => {
    const update = () => setUsed(readStorageUsage())
    update()
    const timer = window.setInterval(update, 5000)
    window.addEventListener('focus', update)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener('focus', update)
    }
  }, [])

  return used
}

function StorageMeter({ used, compact = false }) {
  const pct = Math.min(100, (used / STORAGE_LIMIT) * 100)
  const usedMB = used / (1024 * 1024)
  const freeMB = Math.max(0, (STORAGE_LIMIT - used) / (1024 * 1024))
  const tone =
    pct >= 85 ? 'bg-red-400' : pct >= 60 ? 'bg-gold' : 'bg-emerald-400'
  const textTone =
    pct >= 85 ? 'text-red-300' : pct >= 60 ? 'text-gold' : 'text-emerald-300'

  if (compact) {
    return (
      <div
        className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.035] px-2.5 py-2"
        title={`${usedMB.toFixed(2)} MB used · ${freeMB.toFixed(2)} MB free`}
      >
        <IconDatabase size={14} className="shrink-0 text-white/35" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[8px] font-black uppercase tracking-[0.16em] text-white/35">
              Local
            </span>
            <span className={`text-[9px] font-black ${textTone}`}>
              {usedMB.toFixed(2)} / 5 MB
            </span>
          </div>
          <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 24 }}
              className={`h-full rounded-full ${tone}`}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-[11.5rem] shrink-0 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.18em] text-white/35">
          <IconDatabase size={11} />
          Local storage
        </span>
        <span className={`text-[9px] font-black ${textTone}`}>{pct.toFixed(0)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 24 }}
          className={`h-full rounded-full ${tone}`}
        />
      </div>
      <div className="mt-1 flex justify-between text-[7.5px] font-bold text-white/30">
        <span>{usedMB.toFixed(2)} MB used</span>
        <span>{freeMB.toFixed(2)} MB free</span>
      </div>
    </div>
  )
}

function StoreStatusControl({ status, manual, compact = false, onToggle, onAuto }) {
  const open = status.open === true

  if (compact) {
    return (
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <button
          type="button"
          role="switch"
          aria-checked={open}
          onClick={onToggle}
          className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl border px-2.5 py-2 text-start transition-colors ${
            open
              ? 'border-emerald-400/25 bg-emerald-400/[0.08]'
              : 'border-red-400/25 bg-red-500/[0.08]'
          }`}
        >
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              open ? 'bg-emerald-400 exec-status-open' : 'bg-red-400'
            }`}
          />
          <span className="min-w-0 flex-1 truncate text-[9.5px] font-black text-white/75">
            {open ? 'استقبال الطلبات · Open' : 'مغلق حالياً · Closed'}
          </span>
          <span className="text-[8px] font-black text-white/30">
            {manual ? 'MANUAL' : 'AUTO'}
          </span>
        </button>
        {manual && (
          <button
            type="button"
            onClick={onAuto}
            title="العودة إلى ساعات الدوام التلقائية"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.035] text-white/35"
          >
            <IconClock size={12} />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={open}
        onClick={onToggle}
        title={open ? 'إغلاق استقبال الطلبات' : 'فتح استقبال الطلبات'}
        className={`group flex items-center gap-2.5 rounded-full border py-1.5 ps-2 pe-1.5 transition-all ${
          open
            ? 'border-emerald-400/30 bg-emerald-400/[0.08] hover:bg-emerald-400/[0.13]'
            : 'border-red-400/30 bg-red-500/[0.08] hover:bg-red-500/[0.13]'
        }`}
      >
        <span
          className={`h-2 w-2 shrink-0 rounded-full ${
            open ? 'bg-emerald-400 exec-status-open' : 'bg-red-400'
          }`}
        />
        <span className="flex flex-col items-start leading-none">
          <span className="text-[9.5px] font-black text-white/80">
            {open ? 'استقبال الطلبات' : 'مغلق حالياً'}
          </span>
          <span className="mt-1 text-[7px] font-black uppercase tracking-[0.16em] text-white/30">
            {open ? 'Open' : 'Closed'} · {manual ? 'Manual' : 'Auto hours'}
          </span>
        </span>
        <span
          className={`relative ms-1 h-5 w-9 shrink-0 rounded-full border transition-colors ${
            open
              ? 'border-emerald-300/20 bg-emerald-400/20'
              : 'border-white/10 bg-white/10'
          }`}
        >
          <span
            style={{
              transform: open
                ? 'translateX(var(--status-travel, 1rem))'
                : 'translateX(0)',
            }}
            className="absolute top-0.5 start-0.5 h-3.5 w-3.5 rounded-full bg-[#fff8e7] shadow transition-transform duration-300 ease-out"
          />
        </span>
      </button>

      {manual && (
        <button
          type="button"
          onClick={onAuto}
          title="العودة إلى ساعات الدوام التلقائية"
          className="grid h-7 w-7 place-items-center rounded-full border border-white/[0.08] bg-white/[0.035] text-white/30 transition-colors hover:border-gold/40 hover:text-gold"
        >
          <IconClock size={12} />
        </button>
      )}
    </div>
  )
}

function NavButton({ item, active, collapsed, badge, onClick }) {
  const Icon = item.Icon
  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? item.en : undefined}
      className={`group relative flex w-full items-center rounded-2xl border transition-all ${
        collapsed ? 'justify-center px-2 py-2.5' : 'gap-2.5 px-2.5 py-2'
      } ${
        active
          ? 'exec-nav-active text-[#f7f1e5]'
          : 'border-transparent text-white/45 hover:border-white/[0.07] hover:bg-white/[0.035] hover:text-white/80'
      }`}
    >
      <span
        className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl border transition-colors ${
          active
            ? 'border-gold/25 bg-gold/10 text-gold'
            : 'border-white/[0.05] bg-white/[0.02] text-white/38 group-hover:text-gold/75'
        }`}
      >
        <Icon size={16} />
      </span>
      {!collapsed && (
        <span className="min-w-0 flex-1 truncate text-start text-[11px] font-extrabold">
          {item.ar}
        </span>
      )}
      {badge > 0 && (
        <span
          className={`grid min-w-[1.1rem] place-items-center rounded-full bg-gold/15 px-1 text-[8.5px] font-black text-gold ${
            collapsed ? 'absolute -end-0.5 -top-0.5 h-4 min-w-4' : 'h-4'
          }`}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      {active && !collapsed && (
        <span className="absolute -start-px h-5 w-[2px] rounded-full bg-gold shadow-[0_0_14px_rgba(231,201,123,0.8)]" />
      )}
    </button>
  )
}

function Brand({ collapsed }) {
  return (
    <div
      className={`flex items-center gap-3 ${
        collapsed ? 'justify-center px-0' : 'px-1'
      }`}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl border border-gold/25 bg-[#fbf6e9] shadow-[0_12px_30px_-18px_rgba(231,201,123,0.8)]">
        <img
          src="/brand/benova-logo.png"
          alt="BENOVA"
          className="h-9 w-9 object-contain"
        />
      </span>
      {!collapsed && (
        <div className="min-w-0">
          <p className="font-display text-[16px] font-semibold tracking-[0.12em] text-[#f7f1e5]">
            BENOVA
          </p>
          <p className="mt-0.5 text-[7.5px] font-black uppercase tracking-[0.24em] text-white/28">
            Executive Console
          </p>
        </div>
      )}
    </div>
  )
}

function SidebarContent({
  lang,
  tab,
  collapsed,
  counts,
  onTab,
  onLogout,
  status,
}) {
  return (
    <>
      <div className={`pt-6 ${collapsed ? 'px-3' : 'px-5'}`}>
        <Brand collapsed={collapsed} />
      </div>

      <nav
        className={`exec-scroll mt-6 flex-1 overflow-y-auto pb-4 ${
          collapsed ? 'px-2.5' : 'px-3'
        }`}
      >
        <div className="space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.id}>
              {!collapsed ? (
                <p className="mb-2 px-2.5 text-[7.5px] font-black uppercase tracking-[0.22em] text-white/24">
                  {lang === 'ar' ? group.ar : group.en}
                </p>
              ) : (
                <div className="mx-3 mb-2 h-px bg-white/[0.06]" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    active={tab === item.id}
                    collapsed={collapsed}
                    badge={counts[item.id] || 0}
                    onClick={() => onTab(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      <div className={`shrink-0 border-t border-white/[0.06] p-3 ${collapsed ? 'space-y-2' : 'space-y-2.5'}`}>
        {!collapsed && (
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  status.open ? 'bg-emerald-400 exec-status-open' : 'bg-red-400'
                }`}
              />
              <span className="text-[9px] font-black text-white/65">
                {status.open ? 'المتجر يستقبل الطلبات' : 'استقبال الطلبات متوقف'}
              </span>
            </div>
            <p className="mt-1.5 text-[8px] font-semibold leading-relaxed text-white/25">
              {status.manual
                ? 'تحكّم يدوي من لوحة القيادة'
                : 'الحالة تتبع ساعات الدوام'}
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => navigate('/')}
          title="عرض الموقع"
          className={`flex w-full items-center rounded-xl border border-white/[0.06] bg-white/[0.025] py-2 text-white/38 transition-colors hover:border-gold/30 hover:text-gold ${
            collapsed ? 'justify-center' : 'gap-2 px-3'
          }`}
        >
          <IconExternal size={14} />
          {!collapsed && <span className="text-[10px] font-extrabold">عرض الموقع</span>}
        </button>

        <button
          type="button"
          onClick={onLogout}
          title="تسجيل الخروج"
          className={`flex w-full items-center rounded-xl border border-red-400/10 bg-red-500/[0.035] py-2 text-red-300/55 transition-colors hover:border-red-400/30 hover:text-red-200 ${
            collapsed ? 'justify-center' : 'gap-2 px-3'
          }`}
        >
          <IconLogout size={14} />
          {!collapsed && <span className="text-[10px] font-extrabold">تسجيل الخروج</span>}
        </button>

        {!collapsed && (
          <p className="text-center text-[7px] font-black uppercase tracking-[0.22em] text-white/15">
            Local-first · v26
          </p>
        )}
      </div>
    </>
  )
}

function MobileDrawer({ open, onClose, lang, tab, counts, onTab, onLogout, status }) {
  const ar = lang === 'ar'

  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
          />
          <motion.aside
            initial={{ x: ar ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: ar ? '100%' : '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="exec-admin absolute inset-y-0 start-0 flex w-[min(88vw,20rem)] flex-col border-e border-white/10 bg-[#0d0a07]/95 shadow-[0_0_100px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between px-4 pt-5">
              <Brand collapsed={false} />
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/[0.035] text-white/45 hover:text-gold"
                aria-label="Close menu"
              >
                <IconClose size={17} />
              </button>
            </div>

            <div className="exec-scroll flex-1 overflow-y-auto px-3 pt-5">
              <div className="space-y-5">
                {NAV_GROUPS.map((group) => (
                  <div key={group.id}>
                    <p className="mb-2 px-2.5 text-[7.5px] font-black uppercase tracking-[0.22em] text-white/24">
                      {ar ? group.ar : group.en}
                    </p>
                    <div className="space-y-0.5">
                      {group.items.map((item) => (
                        <NavButton
                          key={item.id}
                          item={item}
                          active={tab === item.id}
                          collapsed={false}
                          badge={counts[item.id] || 0}
                          onClick={() => {
                            onTab(item.id)
                            onClose()
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/[0.07] p-3">
              <div className="mb-2 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    status.open ? 'bg-emerald-400 exec-status-open' : 'bg-red-400'
                  }`}
                />
                <span className="text-[9px] font-black text-white/55">
                  {status.open ? 'المتجر يستقبل الطلبات' : 'استقبال الطلبات متوقف'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] py-2.5 text-[10px] font-black text-white/50"
                >
                  <IconExternal size={14} />
                  عرض الموقع
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex items-center justify-center gap-2 rounded-xl border border-red-400/15 bg-red-500/[0.05] py-2.5 text-[10px] font-black text-red-300/65"
                >
                  <IconLogout size={14} />
                  خروج
                </button>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function AdminShell({ tab, onTab, onLogout, children }) {
  const { lang, t, notify } = useApp()
  const { settings, setSettings, orders, reviews } = useContent()
  const status = useBusinessStatus(settings.hours, lang, settings.storeStatus)
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const [mobileOpen, setMobileOpen] = useState(false)
  const used = useStorageUsage()

  const counts = useMemo(
    () => ({
      orders: orders.filter((order) => order.status === 'new').length,
      reviews: reviews.filter((review) => review.status === 'pending').length,
    }),
    [orders, reviews],
  )

  const tabMeta = useMemo(() => {
    for (const group of NAV_GROUPS) {
      const item = group.items.find((entry) => entry.id === tab)
      if (item) return { ...item, group }
    }
    return NAV_GROUPS[0].items[0]
  }, [tab])

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, collapsed ? '1' : '0')
    } catch {
      /* تجاهل */
    }
  }, [collapsed])

  useEffect(() => {
    setMobileOpen(false)
  }, [tab])

  const toggleStore = useCallback(() => {
    const next = status.open ? 'closed' : 'open'
    setSettings({ storeStatus: next })
    notify(
      next === 'open'
        ? lang === 'ar'
          ? 'تم فتح استقبال الطلبات 🟢'
          : 'Ordering is now open 🟢'
        : lang === 'ar'
          ? 'تم إيقاف استقبال الطلبات 🔴'
          : 'Ordering is now closed 🔴',
    )
  }, [lang, notify, setSettings, status.open])

  const autoStore = useCallback(() => {
    setSettings({ storeStatus: 'auto' })
    notify(
      lang === 'ar'
        ? 'عادت الحالة لتتبع ساعات الدوام'
        : 'Store status is following business hours again',
    )
  }, [lang, notify, setSettings])

  const previewUrl = useMemo(() => {
    if (typeof window === 'undefined') return '#/'
    return `${window.location.origin}${window.location.pathname}#/`
  }, [])

  const manual = settings.storeStatus !== 'auto'

  return (
    <div className="exec-admin relative min-h-screen" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 start-[16%] h-[28rem] w-[28rem] rounded-full bg-gold/[0.08] blur-[120px]" />
        <div className="absolute end-[-8rem] top-[18%] h-[24rem] w-[24rem] rounded-full bg-emerald-500/[0.055] blur-[120px]" />
        <div className="absolute bottom-[-12rem] start-[35%] h-[30rem] w-[30rem] rounded-full bg-[#b78236]/[0.06] blur-[140px]" />
      </div>

      <div className="relative flex min-h-screen">
        <aside
          className={`sticky top-0 hidden h-screen shrink-0 flex-col border-e border-white/[0.07] bg-[#0c0906]/70 backdrop-blur-2xl transition-[width] duration-300 ease-out lg:flex ${
            collapsed ? 'w-[5.25rem]' : 'w-[17rem]'
          }`}
        >
          <SidebarContent
            lang={lang}
            tab={tab}
            collapsed={collapsed}
            counts={counts}
            onTab={onTab}
            onLogout={onLogout}
            status={status}
          />

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            title={collapsed ? 'توسيع القائمة' : 'تصغير القائمة'}
            className="absolute -end-3 top-[5.4rem] z-20 grid h-6 w-6 place-items-center rounded-full border border-gold/20 bg-[#17120d] text-gold/65 shadow-lg transition-colors hover:border-gold/50 hover:text-gold"
          >
            <IconChevron
              size={12}
              className={`transition-transform duration-300 ${
                collapsed
                  ? lang === 'ar'
                    ? 'rotate-90'
                    : '-rotate-90'
                  : lang === 'ar'
                    ? '-rotate-90'
                    : 'rotate-90'
              }`}
            />
          </button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-[#0a0806]/76 backdrop-blur-2xl">
            <div className="mx-auto flex h-[4.3rem] w-full max-w-[1680px] items-center gap-2 px-3 sm:px-5 lg:px-6">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/55 transition-colors hover:border-gold/35 hover:text-gold lg:hidden"
                aria-label="Open menu"
              >
                <IconMenu size={18} />
              </button>

              <div className="min-w-0 flex-1">
                <p className="hidden text-[7.5px] font-black uppercase tracking-[0.24em] text-gold/50 sm:block">
                  {lang === 'ar' ? tabMeta.group.ar : tabMeta.group.en}
                </p>
                <h1 className="truncate text-[14px] font-black text-[#f7f1e5] sm:mt-0.5 sm:text-[15px]">
                  {lang === 'ar' ? tabMeta.ar : tabMeta.en}
                </h1>
              </div>

              <div className="hidden xl:block">
                <StorageMeter used={used} />
              </div>

              <div className="hidden lg:block">
                <StoreStatusControl
                  status={status}
                  manual={manual}
                  onToggle={toggleStore}
                  onAuto={autoStore}
                />
              </div>

              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-9 shrink-0 items-center gap-2 rounded-xl border border-gold/25 bg-gold/[0.08] px-3 text-[10px] font-black text-gold transition-all hover:border-gold/50 hover:bg-gold/[0.14]"
                title={lang === 'ar' ? 'معاينة الموقع مباشرة' : 'Live site preview'}
              >
                <IconExternal size={14} />
                <span className="hidden 2xl:inline">
                  {lang === 'ar' ? 'معاينة مباشرة' : 'Live preview'}
                </span>
              </a>
            </div>

            <div className="flex items-center gap-2 border-t border-white/[0.05] px-3 py-2 lg:hidden">
              <StoreStatusControl
                status={status}
                manual={manual}
                compact
                onToggle={toggleStore}
                onAuto={autoStore}
              />
              <div className="w-[42%] max-w-[11rem]">
                <StorageMeter used={used} compact />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1680px] flex-1 px-3 pb-16 pt-5 sm:px-5 sm:pt-6 lg:px-6 xl:px-8">
            {children}
          </main>

          <footer className="border-t border-white/[0.05] px-4 py-3 text-center text-[8px] font-black uppercase tracking-[0.22em] text-white/15">
            BENOVA · {t('adminTitle')}
          </footer>
        </div>
      </div>

      <MobileDrawer
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        lang={lang}
        tab={tab}
        counts={counts}
        onTab={onTab}
        onLogout={onLogout}
        status={status}
      />
    </div>
  )
}
