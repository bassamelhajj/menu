/**
 * components/Header.jsx — الهيدر الرئيسي (Sticky + Glassmorphism)
 * ===========================================================================
 * • Top Utility Bar (فوق الهيدر الملتصق): الوضع · اللغة · العملة · حالة المحل
 * • Main Sticky Navbar (الأساسي): اللوغو + روابط رئيسية + أزرار بحث/حساب/سلة
 * • النقاط الأساسية: BENOVA · المنيو · العروض · من نحن · تواصل
 * • أزرار سريعة: بحث · حساب/بروفايل · السلة
 * • كل التصميم محسوب باستخدام منطق RTL (يمين للعربي، يسار للإنجليزي).
 */
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { useUI } from '../store/UIContext'
import { useBusinessStatus } from '../lib/hours'
import { navigate, useHashRoute } from '../lib/hashRoute'
import { clearSession, getSession, hasAdminSession, setAdminSession } from '../lib/session'
import {
  IconCart,
  IconChevron,
  IconHeart,
  IconLogout,
  IconSearch,
  IconShield,
  IconSun,
  IconMoon,
  IconUser,
} from './icons'
import SiteNav, { DesktopNav } from './SiteNav'

/** زر أيقونة موحّد — مساحة لمس مريحة على الموبايل */
function IconButton({ label, onClick, children, className = '' }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-line/70 bg-surface/60 text-ink transition-colors hover:border-gold/60 hover:text-primary sm:h-11 sm:w-11 ${className}`}
    >
      {children}
    </motion.button>
  )
}

/** قائمة الحساب — دروب داون زجاجي لسطح المكتب فقط */
function AccountMenu() {
  const { lang, notify } = useApp()
  const route = useHashRoute()
  const [open, setOpen] = useState(false)
  const [session, setSessionState] = useState(() => getSession())
  const [admin, setAdminState] = useState(() => hasAdminSession())
  const wrapRef = useRef(null)
  const ar = lang === 'ar'

  /* إغلاق تلقائي عند تغيير الصفحة */
  useEffect(() => {
    setOpen(false)
  }, [route])

  useEffect(() => {
    if (!open) return undefined

    setSessionState(getSession())
    setAdminState(hasAdminSession())

    const onPointerDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const signedIn = Boolean(session)
  const active = signedIn || admin
  const initial = String(session?.name || session?.email || '?').trim().charAt(0).toUpperCase()
  const name = session?.name || (admin ? (ar ? 'صاحب المحل' : 'Store owner') : ar ? 'زائر' : 'Guest')
  const email =
    session?.email ||
    (admin
      ? ar
        ? 'جلسة إدارة نشطة'
        : 'Admin session active'
      : ar
        ? 'سجّل دخولك للوصول لحسابك'
        : 'Sign in to access your account')

  const go = (target) => {
    setOpen(false)
    navigate(target)
  }

  const signOut = () => {
    clearSession()
    setAdminSession(false)
    setSessionState(null)
    setAdminState(false)
    setOpen(false)
    notify(ar ? 'تم تسجيل الخروج' : 'Logged out')
  }

  const itemClass =
    'flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[11.5px] font-bold text-ink/80 transition-colors hover:bg-primary/8 hover:text-primary dark:text-cream/80 dark:hover:bg-white/[0.06] dark:hover:text-gold'

  return (
    <div ref={wrapRef} className="relative hidden lg:block">
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((value) => !value)}
        aria-label={ar ? 'حسابي' : 'Account'}
        aria-haspopup="menu"
        aria-expanded={open}
        className="relative grid h-11 w-11 place-items-center rounded-2xl border border-line/70 bg-surface/60 text-ink transition-colors hover:border-gold/60 hover:text-primary"
      >
        {admin ? (
          <IconShield size={17} />
        ) : signedIn ? (
          <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-[10px] font-black text-cream">
            {initial}
          </span>
        ) : (
          <IconUser size={18} />
        )}
        {active && (
          <span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute end-0 top-[calc(100%+0.65rem)] z-[70] w-[19rem] overflow-hidden rounded-2xl border border-line/80 bg-surface/95 p-2 text-start shadow-[0_30px_70px_-34px_rgba(22,33,26,0.55)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#131c12]/95 dark:shadow-[0_34px_80px_-28px_rgba(0,0,0,0.9)]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
            />

            {/* بيانات الحساب */}
            <div className="flex items-center gap-3 rounded-xl bg-bg/60 p-3 dark:bg-white/[0.035]">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/12 text-[13px] font-black text-primary ring-1 ring-primary/20 dark:text-gold">
                {admin ? <IconShield size={18} /> : signedIn ? initial : <IconUser size={17} />}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-black text-ink dark:text-cream">
                  {name}
                </span>
                <span className="mt-0.5 block truncate text-[10px] font-semibold text-muted">
                  {email}
                </span>
              </span>
            </div>

            <div className="mt-1.5 space-y-0.5">
              <button type="button" role="menuitem" onClick={() => go('/account')} className={itemClass}>
                <IconUser size={15} className="shrink-0 text-gold" />
                <span className="flex-1 text-start">
                  {signedIn ? (ar ? 'ملفي الشخصي' : 'My profile') : ar ? 'تسجيل الدخول' : 'Sign in'}
                </span>
                <IconChevron
                  size={11}
                  className={`shrink-0 text-muted/50 ${ar ? 'rotate-90' : '-rotate-90'}`}
                />
              </button>

              <button type="button" role="menuitem" onClick={() => go('/favorites')} className={itemClass}>
                <IconHeart size={15} className="shrink-0 text-gold" />
                <span className="flex-1 text-start">{ar ? 'المفضلة' : 'Saved favorites'}</span>
                <IconChevron
                  size={11}
                  className={`shrink-0 text-muted/50 ${ar ? 'rotate-90' : '-rotate-90'}`}
                />
              </button>

              {admin && (
                <button type="button" role="menuitem" onClick={() => go('/admin')} className={itemClass}>
                  <IconShield size={15} className="shrink-0 text-gold" />
                  <span className="flex-1 text-start">{ar ? 'لوحة التحكم' : 'Admin dashboard'}</span>
                  <IconChevron
                    size={11}
                    className={`shrink-0 text-muted/50 ${ar ? 'rotate-90' : '-rotate-90'}`}
                  />
                </button>
              )}
            </div>

            {active && (
              <div className="mt-1.5 border-t border-line/70 pt-1.5 dark:border-white/10">
                <button
                  type="button"
                  role="menuitem"
                  onClick={signOut}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[11.5px] font-bold text-red-500 transition-colors hover:bg-red-500/10"
                >
                  <IconLogout size={15} className="shrink-0" />
                  <span className="flex-1 text-start">{ar ? 'تسجيل الخروج' : 'Logout'}</span>
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** زر تحكّم موحّد — شكل واحد لكل التبديلات السريعة */
const controlClass =
  'inline-flex h-8 shrink-0 items-center justify-center rounded-full border border-line/70 bg-surface/75 px-2.5 text-[10px] font-black text-ink/75 shadow-[0_8px_24px_-22px_rgba(22,33,26,0.55)] backdrop-blur-md transition-colors duration-200 hover:border-gold/60 hover:text-gold-deep dark:border-white/10 dark:bg-white/[0.045] dark:text-cream/80 dark:hover:border-gold/45 dark:hover:text-gold'

/** شريط الأدوات العلوي — الوضع · اللغة · العملة · حالة المحل */
function UtilityBar() {
  const { lang, toggleLang, currency, toggleCurrency, dark, toggleDark, t } = useApp()
  const { settings } = useContent()
  const status = useBusinessStatus(settings.hours, lang, settings.storeStatus)

  const ar = lang === 'ar'

  return (
    <div className="relative z-40 border-b border-line/60 bg-bg/85 backdrop-blur-xl dark:bg-[#0c120b]/85">
      <div className="mx-auto flex h-10 w-full max-w-7xl items-center justify-between gap-2 px-3 sm:px-5">
        {/* ─── التبديلات المفردة ─── */}
        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {/* الوضع: ☀️ بالداكن · 🌙 بالفاتح */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.88 }}
            onClick={toggleDark}
            aria-label={dark ? (ar ? 'التبديل للوضع النهاري' : 'Switch to light mode') : ar ? 'التبديل للوضع الليلي' : 'Switch to dark mode'}
            title={dark ? (ar ? 'وضع نهاري' : 'Light mode') : ar ? 'وضع ليلي' : 'Dark mode'}
            className={`${controlClass} w-8 px-0`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dark ? 'sun' : 'moon'}
                initial={{ rotate: -40, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 40, opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                className="grid place-items-center"
              >
                {dark ? <IconSun size={14} /> : <IconMoon size={14} />}
              </motion.span>
            </AnimatePresence>
          </motion.button>

          {/* اللغة: يعرض اللغة الهدف */}
          <button
            type="button"
            onClick={toggleLang}
            aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'}
            title={ar ? 'English' : 'العربية'}
            className={`${controlClass} min-w-[42px] px-3`}
          >
            {ar ? 'EN' : 'عربي'}
          </button>

          {/* العملة: العملة الحالية */}
          <button
            type="button"
            onClick={toggleCurrency}
            aria-label={t('currency')}
            title={t('currency')}
            className={`${controlClass} min-w-[62px] px-3`}
          >
            {currency === 'USD' ? '$ USD' : 'ل.ل LBP'}
          </button>
        </div>

        {/* ─── معلومة سريعة / حالة المحل ─── */}
        <button
          type="button"
          onClick={() => navigate('/contact')}
          className="inline-flex max-w-[40%] items-center gap-1.5 rounded-full border border-line/60 bg-surface/50 px-2.5 py-1 text-[9.5px] font-bold text-muted transition-colors hover:border-gold/60 hover:text-primary dark:border-white/10 dark:bg-white/[0.03] sm:max-w-[34%]"
        >
          <span
            className={`h-1.5 w-1.5 shrink-0 rounded-full ${
              status.open === true ? 'bg-emerald-500' : status.open === false ? 'bg-red-500' : 'bg-gold'
            }`}
          />
          <span className="truncate">{status.label}</span>
        </button>
      </div>
    </div>
  )
}

export default function Header() {
  const { lang, cartCount } = useApp()
  const { settings } = useContent()
  const { openCart, openSearch } = useUI()
  const route = useHashRoute()
  const status = useBusinessStatus(settings.hours, lang, settings.storeStatus)
  const headerRef = useRef(null)
  const [scrolled, setScrolled] = useState(false)
  const [cartPulse, setCartPulse] = useState(false)
  const previousCount = useRef(cartCount)

  const ar = lang === 'ar'

  /* قياس ارتفاع الهيدر لشريط الأقسام */
  useEffect(() => {
    const el = headerRef.current
    if (!el) return undefined
    const sync = () => {
      document.documentElement.style.setProperty('--site-header-h', `${el.offsetHeight}px`)
    }
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    window.addEventListener('orientationchange', sync)
    return () => {
      observer.disconnect()
      window.removeEventListener('orientationchange', sync)
    }
  }, [])

  /* ظهور الهيدر بدرج تدريجي */
  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 10)
        ticking = false
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* نبضة عدّاد السلة عند الإضافة */
  useEffect(() => {
    if (cartCount > previousCount.current) {
      setCartPulse(true)
      const timer = window.setTimeout(() => setCartPulse(false), 650)
      previousCount.current = cartCount
      return () => window.clearTimeout(timer)
    }
    previousCount.current = cartCount
    return undefined
  }, [cartCount])

  const goTop = () => {
    if (route !== '/') navigate('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const statusDot =
    status.open === true
      ? 'bg-emerald-500'
      : status.open === false
        ? 'bg-red-500'
        : 'bg-gold'

  return (
    <>
      {/* ── Top Utility Bar ── */}
      <UtilityBar />

      {/* ── Main Sticky Navbar ── */}
      <header
        ref={headerRef}
        data-site-header
        className={`sticky top-0 z-50 border-b pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow,border-color] duration-300 ${
          scrolled
            ? 'border-line/90 bg-surface/85 shadow-[0_18px_40px_-28px_rgba(22,33,26,0.55)] backdrop-blur-2xl'
            : 'border-line/60 bg-surface/70 backdrop-blur-xl'
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-5">
          {/* ── زر القائمة — موبايل فقط، بمحاذاة بداية الهيدر ── */}
          <SiteNav />

          {/* ── البراند ── */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={goTop}
            aria-label={ar ? 'BENOVA — العودة للأعلى' : 'BENOVA — back to top'}
            className="group flex min-w-0 shrink-0 items-center gap-2.5 text-start"
          >
            <span className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#f4ead3] p-1 shadow-[0_8px_20px_-14px_rgba(44,29,18,0.9)] ring-1 ring-gold/35 transition-transform duration-300 group-hover:-translate-y-0.5 sm:h-12 sm:w-12">
              <img
                src={settings.logo || '/brand/benova-logo.png'}
                alt={settings.name?.en || 'BENOVA'}
                className="h-full w-full object-contain"
              />
            </span>
            <span className="hidden min-w-0 sm:block">
              <span className="block font-display text-[17px] leading-none tracking-[0.16em] text-ink">
                BENOVA
              </span>
              <span className="mt-1 flex items-center gap-1.5">
                <span className="truncate text-[9.5px] font-black tracking-[0.08em] text-muted">
                  {ar ? settings.tagline?.ar : settings.tagline?.en}
                </span>
                <span className="hidden h-1 w-1 shrink-0 rounded-full bg-gold/70 lg:inline-block" />
                <span className="hidden items-center gap-1 lg:inline-flex">
                  <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
                  <span
                    className={`text-[8.5px] font-extrabold ${
                      status.open === true
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : status.open === false
                          ? 'text-red-500'
                          : 'text-muted'
                    }`}
                  >
                    {status.label}
                  </span>
                </span>
              </span>
            </span>
          </motion.button>

          {/* ── روابط الديسكتوب ── */}
          <div className="hidden flex-1 justify-center lg:flex">
            <DesktopNav />
          </div>

          {/* ── أزرار سريعة ── */}
          <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
            <IconButton label={ar ? 'بحث' : 'Search'} onClick={openSearch}>
              <IconSearch size={18} />
            </IconButton>

            <AccountMenu />

            <motion.button
              type="button"
              onClick={openCart}
              aria-label={`${ar ? 'السلة' : 'Cart'} (${cartCount})`}
              animate={
                cartPulse
                  ? { scale: [1, 1.11, 0.97, 1], rotate: [0, -4, 3, 0] }
                  : { scale: 1, rotate: 0 }
              }
              transition={{ duration: 0.55, ease: 'easeOut' }}
              className="relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-gold/35 bg-gold/10 text-gold-deep transition-colors hover:border-gold/70 hover:bg-gold/15 sm:h-11 sm:w-11"
            >
              <IconCart size={19} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute -end-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[9px] font-black text-cream shadow-md ring-2 ring-surface"
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </motion.span>
              )}
              {cartPulse && (
                <motion.span
                  initial={{ opacity: 0.6, scale: 0.8 }}
                  animate={{ opacity: 0, scale: 1.7 }}
                  transition={{ duration: 0.6 }}
                  className="pointer-events-none absolute inset-0 rounded-2xl border border-gold"
                />
              )}
            </motion.button>
          </div>
        </div>
      </header>
    </>
  )
}
