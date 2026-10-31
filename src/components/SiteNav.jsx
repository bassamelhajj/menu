/**
 * components/SiteNav.jsx — التنقّل الرئيسي + درج الموبايل
 * ===========================================================================
 * 💻 DesktopNav: روابط سريعة أنيقة بوسط الهيدر (المنيو · العروض · من نحن · تواصل)
 * 📱 SiteNav: زر ☰ + درج جانبي ديناميكي RTL/LTR مع أنيميشن فاخرة:
 *    • Glassmorphism backdrop (blur 12px)
 *    • Elastic spring transition مع staggered items
 *    • يحترم اتجاه اللغة تلقائياً (يمين للعربي، يسار للإنجليزي)
 *    • زر إغلاق "X" محاذٍ لاتجاه النص
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { useBusinessStatus } from '../lib/hours'
import { normalizeUrl } from '../data/settings'
import { navigate, useHashRoute } from '../lib/hashRoute'
import {
  IconBook,
  IconClock,
  IconClose,
  IconCoin,
  IconFacebook,
  IconGlobe,
  IconHeart,
  IconHome,
  IconInstagram,
  IconMoon,
  IconPhone,
  IconPin,
  IconSparkle,
  IconStar,
  IconSun,
  IconTag,
  IconTikTok,
  IconUser,
  IconWhatsApp,
} from './icons'

const HOME_ROUTES = new Set(['/', '/menu'])

const goTo = (target, currentRoute) => {
  if (target === '/menu' && currentRoute === '/menu') {
    document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    return
  }
  if (target === currentRoute) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  navigate(target)
}

/** روابط الموقع — بتحترم الصفحات الموقوفة من الأدمن */
function useSiteLinks() {
  const { lang, t } = useApp()
  const { pages } = useContent()

  return useMemo(() => {
    const all = [
      { key: 'home', route: '/', icon: <IconHome size={18} />, label: t('home'), always: true },
      { key: 'menu', route: '/menu', icon: <IconBook size={18} />, label: t('menu'), always: true },
      { key: 'offers', route: '/offers', icon: <IconTag size={18} />, label: t('offers'), always: true },
      { key: 'favorites', route: '/favorites', icon: <IconHeart size={18} />, label: t('favorites'), always: true },
      { key: 'about', route: '/about', icon: <IconSparkle size={18} />, label: t('aboutPage'), page: 'about' },
      { key: 'faq', route: '/faq', icon: <span className="text-[15px] font-black leading-none">؟</span>, label: t('faqPage'), page: 'faq' },
      { key: 'reviews', route: '/reviews', icon: <IconStar size={18} />, label: t('reviewsPage'), page: 'reviews' },
      { key: 'contact', route: '/contact', icon: <IconPhone size={18} />, label: t('contactUs'), always: true },
      { key: 'account', route: '/account', icon: <IconUser size={18} />, label: t('account'), always: true },
    ]

    return all
      .filter((link) => link.always || pages[link.page]?.active)
      .map((link) => ({ ...link, label: link.label || (lang === 'ar' ? link.ar : link.en) }))
  }, [lang, pages, t])
}

const isLinkActive = (key, route) => {
  if (key === 'menu') return HOME_ROUTES.has(route)
  if (key === 'home') return route === '/'
  if (key === 'offers') return route === '/offers'
  if (key === 'favorites') return route === '/favorites'
  return route === `/${key}`
}

/** روابط الديسكتوب — الجزء الوسط من الهيدر */
export function DesktopNav() {
  const { t } = useApp()
  const { pages } = useContent()
  const route = useHashRoute()

  const links = [
    { key: 'menu', route: '/menu', label: t('menu') },
    { key: 'favorites', route: '/favorites', label: t('favorites') },
    ...(pages.about?.active ? [{ key: 'about', route: '/about', label: t('aboutPage') }] : []),
    ...(pages.faq?.active ? [{ key: 'faq', route: '/faq', label: t('faqPage') }] : []),
    ...(pages.reviews?.active ? [{ key: 'reviews', route: '/reviews', label: t('reviewsPage') }] : []),
    { key: 'contact', route: '/contact', label: t('contactUs') },
  ]

  return (
    <nav aria-label={t('menu')} className="flex items-center gap-0.5">
      {links.map((link) => {
        const active = isLinkActive(link.key, route)
        return (
          <button
            key={link.key}
            type="button"
            onClick={() => goTo(link.route, route)}
            aria-current={active ? 'page' : undefined}
            className={`group relative shrink-0 rounded-lg px-3 py-2 text-[12.5px] font-extrabold tracking-[0.01em] transition-colors duration-200 ${
              active ? 'text-primary' : 'text-muted hover:text-ink'
            }`}
          >
            <span className="relative z-10">{link.label}</span>
            {/* خط سفلي متوهّج — يظهر عند الهوفر ويبقى للصفحة النشطة */}
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-x-2.5 bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-transparent via-gold to-transparent transition-all duration-300 ${
                active
                  ? 'scale-x-100 opacity-100'
                  : 'scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100'
              }`}
            />
            <span
              aria-hidden
              className={`pointer-events-none absolute inset-x-3 bottom-0 h-2 rounded-full bg-gold/40 blur-[6px] transition-opacity duration-300 ${
                active ? 'opacity-70' : 'opacity-0 group-hover:opacity-70'
              }`}
            />
          </button>
        )
      })}
    </nav>
  )
}

/** زر ☰ + الدرج — موبايل فقط */
export default function SiteNav() {
  const { lang, toggleLang, currency, toggleCurrency, dark, toggleDark, t } = useApp()
  const { settings } = useContent()
  const route = useHashRoute()
  const links = useSiteLinks()
  const status = useBusinessStatus(settings.hours, lang, settings.storeStatus)
  const [open, setOpen] = useState(false)
  const closeRef = useRef(null)
  const drawerRef = useRef(null)

  const ar = lang === 'ar'
  const socials = settings.socials || {}

  useEffect(() => {
    setOpen(false)
  }, [route])

  /* إغلاق الدرج تلقائياً عند الانتقال لسطح المكتب */
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined
    const query = window.matchMedia('(min-width: 1024px)')
    const onChange = (event) => {
      if (event.matches) setOpen(false)
    }
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const timer = window.setTimeout(() => closeRef.current?.focus(), 80)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(timer)
    }
  }, [open])

  const openMenu = () => {
    setOpen(true)
  }

  const socialItems = [
    {
      key: 'wa',
      href: settings.whatsapp ? `https://wa.me/${settings.whatsapp}` : '',
      label: 'WhatsApp',
      icon: <IconWhatsApp size={17} />,
      tone: 'bg-[#25D366] text-white',
    },
    {
      key: 'ig',
      href: socials.instagram ? normalizeUrl(socials.instagram) : '',
      label: 'Instagram',
      icon: <IconInstagram size={17} />,
      tone: 'bg-gradient-to-br from-[#f9a03f] via-[#e1306c] to-[#8a3ab9] text-white',
    },
    {
      key: 'fb',
      href: socials.facebook ? normalizeUrl(socials.facebook) : '',
      label: 'Facebook',
      icon: <IconFacebook size={17} />,
      tone: 'bg-[#1877F2] text-white',
    },
    {
      key: 'tt',
      href: socials.tiktok ? normalizeUrl(socials.tiktok) : '',
      label: 'TikTok',
      icon: <IconTikTok size={17} />,
      tone: 'bg-[#111] text-white',
    },
    {
      key: 'map',
      href: settings.mapsUrl ? normalizeUrl(settings.mapsUrl) : '',
      label: 'Google Maps',
      icon: <IconPin size={17} />,
      tone: 'bg-[#34A853] text-white',
    },
  ]

  const statusTone =
    status.open === true
      ? 'border-emerald-500/30 bg-emerald-500/10'
      : status.open === false
        ? 'border-red-500/25 bg-red-500/8'
        : 'border-line bg-surface'

  // اتجاه الدرج: في RTL يفتح من اليمين (start = right)، في LTR من اليسار (start = left)
  // border-e = نهاية الدرج (يسار في RTL، يمين في LTR) — الصحيح تماماً
  const drawerSideClass = 'fixed inset-y-0 start-0 z-[110] flex w-[88%] max-w-sm flex-col border-e border-line bg-bg shadow-2xl lg:hidden'
  const backdropClass = 'fixed inset-0 z-[100] bg-cocoa/70 backdrop-blur-xl lg:hidden'

  return (
    <>
      {/* زر الهامبرجر */}
      <button
        type="button"
        aria-label={ar ? 'فتح القائمة' : 'Open menu'}
        aria-expanded={open}
        aria-controls="mobile-drawer"
        onClick={openMenu}
        className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-line/70 bg-surface/65 text-ink transition-colors hover:border-gold/70 hover:text-primary active:scale-95 lg:hidden"
      >
        <span className="flex flex-col gap-[4px]">
          <span className="block h-[2px] w-[18px] rounded-full bg-current" />
          <span className="block h-[2px] w-[18px] rounded-full bg-current" />
          <span className="block h-[2px] w-[11px] rounded-full bg-current" />
        </span>
        <span className="absolute -end-0.5 -top-0.5 h-2 w-2 rounded-full bg-gold ring-2 ring-surface" />
      </button>

      {/* Portal للدرج والخلفية */}
      {createPortal(
        <AnimatePresence>
          {open && (
            <>
              {/* Glassmorphism Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className={backdropClass}
              />

              {/* الدرج الرئيسي */}
              <motion.aside
                ref={drawerRef}
                id="mobile-drawer"
                initial={{ x: ar ? '100%' : '-100%', scale: 0.98, opacity: 0.3 }}
                animate={{ x: 0, scale: 1, opacity: 1 }}
                exit={{ x: ar ? '100%' : '-100%', scale: 0.98, opacity: 0.3 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 26,
                  duration: 0.45,
                }}
                role="dialog"
                aria-modal="true"
                aria-label={ar ? 'قائمة الموقع' : 'Site menu'}
                className={drawerSideClass}
              >
                {/* رأس الدرج */}
                <div className="relative shrink-0 overflow-hidden border-b border-line/70 px-5 pb-4 pt-[calc(1.15rem+env(safe-area-inset-top))]">
                  <div className="pointer-events-none absolute -top-16 -start-1/4 h-36 w-36 rounded-full bg-gold/20 blur-3xl" />
                  <div className="relative flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f4ead3] p-1 shadow-sm ring-1 ring-gold/40">
                        <img
                          src={settings.logo || '/brand/benova-logo.png'}
                          alt={settings.name?.en || 'BENOVA'}
                          className="h-full w-full object-contain"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="font-display text-[17px] leading-none tracking-[0.13em] text-ink">
                          BENOVA
                        </p>
                        <p className="mt-1 truncate text-[10px] font-bold tracking-wide text-muted">
                          {ar ? settings.tagline?.ar : settings.tagline?.en}
                        </p>
                      </div>
                    </div>
                    {/* زر الإغلاق — محاذٍ للاتجاه */}
                    <button
                      ref={closeRef}
                      type="button"
                      aria-label={t('close')}
                      onClick={() => setOpen(false)}
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface text-ink transition-colors hover:text-primary hover:border-primary/50 active:scale-90"
                    >
                      <IconClose size={17} />
                    </button>
                  </div>

                  {/* حالة المحل */}
                  <div className={`mt-4 flex items-center gap-3 rounded-2xl border px-3.5 py-2.5 ${statusTone}`}>
                    <span className="relative flex h-2.5 w-2.5 shrink-0">
                      {status.open === true && (
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
                      )}
                      <span
                        className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                          status.open === true
                            ? 'bg-emerald-500'
                            : status.open === false
                              ? 'bg-red-500'
                              : 'bg-gold'
                        }`}
                      />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-[11px] font-black ${
                          status.open === true
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : status.open === false
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-ink'
                        }`}
                      >
                        {status.label}
                      </p>
                      <p className="mt-0.5 truncate text-[10px] font-semibold text-muted">
                        {status.detail}
                      </p>
                    </div>
                    <span className="shrink-0 text-muted">
                      <IconClock size={16} />
                    </span>
                  </div>
                </div>

                {/* الروابط — مع staggered entrance */}
                <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-3">
                  <p className="px-3 pb-1.5 text-[9px] font-black tracking-[0.24em] text-muted/80 uppercase">
                    {ar ? 'تنقّل سريع' : 'Quick navigation'}
                  </p>
                  {links.map((link, index) => {
                    const active = isLinkActive(link.key, route)
                    return (
                      <motion.button
                        key={link.key}
                        type="button"
                        initial={{ opacity: 0, x: ar ? 30 : -30, y: 8 }}
                        animate={{ opacity: 1, x: 0, y: 0 }}
                        transition={{
                          delay: 0.08 + index * 0.045,
                          duration: 0.35,
                          ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        onClick={() => {
                          setOpen(false)
                          goTo(link.route, route)
                        }}
                        aria-current={active ? 'page' : undefined}
                        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-start text-[13.5px] font-extrabold transition-colors ${
                          active
                            ? 'bg-primary/10 text-primary ring-1 ring-primary/20'
                            : 'text-ink hover:bg-surface'
                        }`}
                      >
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors ${
                            active ? 'bg-primary text-cream shadow-sm' : 'bg-panel text-primary'
                          }`}
                        >
                          {link.icon}
                        </span>
                        <span className="flex-1">{link.label}</span>
                        {active && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                      </motion.button>
                    )
                  })}
                </nav>

                {/* سوشيال + ساعات + أدوات */}
                <div className="shrink-0 space-y-3 border-t border-line/70 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-3">
                  {socialItems.length > 0 && (
                    <div>
                      <p className="mb-2 text-[9px] font-black tracking-[0.22em] text-muted/80 uppercase">
                        {ar ? 'تابعنا' : 'Follow us'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {socialItems.map((social) => {
                          const Tag = social.href ? 'a' : 'span'
                          return (
                            <motion.div
                              key={social.key}
                              initial={{ opacity: 0, scale: 0.9, y: 8 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: 0.2 }}
                              className="grid h-9 w-9 place-items-center rounded-xl transition-transform"
                            >
                              <Tag
                                {...(social.href
                                  ? { href: social.href, target: '_blank', rel: 'noreferrer' }
                                  : {})}
                                aria-label={social.label}
                                aria-disabled={!social.href || undefined}
                                title={
                                  social.href
                                    ? social.label
                                    : `${social.label} — ${
                                        ar ? 'أضف الرابط من لوحة التحكم' : 'add link from admin'
                                      }`
                                }
                                className={`h-full w-full flex items-center justify-center rounded-xl ${
                                  social.href
                                    ? `${social.tone} hover:-translate-y-0.5 active:scale-95`
                                    : 'cursor-not-allowed border border-line bg-panel text-muted/45'
                                }`}
                              >
                                {social.icon}
                              </Tag>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {settings.mapsUrl && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.25 }}
                    >
                      <a
                        href={normalizeUrl(settings.mapsUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 rounded-xl border border-line bg-surface/60 px-3 py-2 text-[10.5px] font-bold text-muted transition-colors hover:text-primary"
                      >
                        <span className="shrink-0 text-gold">
                          <IconPin size={14} />
                        </span>
                        <span className="truncate">
                          {ar ? settings.address?.ar : settings.address?.en}
                        </span>
                      </a>
                    </motion.div>
                  )}

                  {/* أدوات سريعة — تبديلات مفردة */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.28 }}
                    className="flex items-center gap-2"
                  >
                    <button
                      type="button"
                      onClick={toggleDark}
                      aria-label={
                        dark
                          ? ar
                            ? 'التبديل للوضع النهاري'
                            : 'Switch to light mode'
                          : ar
                            ? 'التبديل للوضع الليلي'
                            : 'Switch to dark mode'
                      }
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line bg-surface text-ink transition-colors hover:border-gold/60"
                    >
                      {dark ? <IconSun size={15} /> : <IconMoon size={15} />}
                    </button>
                    <button
                      type="button"
                      onClick={toggleLang}
                      aria-label={ar ? 'Switch to English' : 'التبديل إلى العربية'}
                      className="h-9 flex-1 rounded-xl border border-line bg-surface text-[10.5px] font-black text-ink transition-colors hover:border-gold/60"
                    >
                      {ar ? 'EN' : 'عربي'}
                    </button>
                    <button
                      type="button"
                      onClick={toggleCurrency}
                      aria-label={ar ? 'تبديل العملة' : 'Toggle currency'}
                      className="h-9 flex-1 rounded-xl border border-line bg-surface text-[10.5px] font-black text-ink transition-colors hover:border-gold/60"
                    >
                      {currency === 'USD' ? '$ USD' : 'ل.ل LBP'}
                    </button>
                  </motion.div>

                  {settings.whatsapp && (
                    <motion.a
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.3 }}
                      href={`https://wa.me/${settings.whatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-[11px] font-black text-white shadow-sm transition-transform active:scale-95"
                    >
                      <IconWhatsApp size={15} />
                      {ar ? 'اطلب واتساب' : 'WhatsApp'}
                    </motion.a>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.32 }}
                    className="flex items-center justify-center gap-2 pt-0.5 text-[9px] font-bold text-muted/70"
                  >
                    <IconGlobe size={11} />
                    <span>{ar ? 'أسعار بل.ل والدولار' : 'Prices in L.L. & USD'}</span>
                    <IconCoin size={11} />
                  </motion.div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  )
}