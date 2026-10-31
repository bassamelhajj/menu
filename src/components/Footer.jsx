/**
 * components/Footer.jsx — فوتر BENOVA
 * ===========================================================================
 * • ٤ أعمدة: البراند · روابط سريعة · ساعات العمل والحالة · السوشيال والموقع
 * • كل البيانات (الاسم، اللوغو، الوصف، السوشيال، واتساب، الساعات، العنوان)
 *   بتنسحب مباشرة من إعدادات الأدمن.
 * • حالة فتح/إغلاق حيّة بتتحدّث كل دقيقة حسب توقيت الزائر.
 * • بيظهر على كل الصفحات ما عدا لوحة التحكم (المسؤول عن ذلك App.jsx).
 * • مساحة سفلية كافية على الموبايل حتى ما يتغطى بالـ BottomNav.
 */
import { motion } from 'framer-motion'
import { useContent } from '../store/ContentContext'
import { useApp } from '../store/AppContext'
import { normalizeUrl } from '../data/settings'
import { useBusinessStatus } from '../lib/hours'
import { navigate, useHashRoute } from '../lib/hashRoute'
import {
  IconChevron,
  IconClock,
  IconFacebook,
  IconInstagram,
  IconPin,
  IconTikTok,
  IconWhatsApp,
} from './icons'

const FALLBACK_LOGO = '/brand/benova-logo.png'

/** عنوان عمود صغير بخط ذهبي */
function ColumnTitle({ children }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="h-3.5 w-[2px] rounded-full bg-gold/80" />
      <h4 className="text-[10px] font-black tracking-[0.24em] text-gold/90 uppercase">
        {children}
      </h4>
    </div>
  )
}

/** أيقونة سوشيال — رابط إذا موجود، أو حالة خفيفة إذا الرابط ناقص */
function SocialChip({ item }) {
  const Tag = item.url ? motion.a : motion.span
  return (
    <Tag
      {...(item.url
        ? {
            href: item.url,
            target: '_blank',
            rel: 'noreferrer',
            whileHover: { y: -3, scale: 1.06 },
            whileTap: { scale: 0.94 },
          }
        : {})}
      aria-label={item.label}
      aria-disabled={!item.url || undefined}
      title={item.url ? item.label : item.disabledHint}
      className={`grid h-10 w-10 place-items-center rounded-2xl border transition-[background-color,border-color,color,box-shadow] duration-300 ${
        item.url
          ? `${item.tone} border-transparent shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]`
          : 'cursor-not-allowed border-cream/10 bg-cream/[0.04] text-cream/25'
      }`}
    >
      {item.icon}
    </Tag>
  )
}

export default function Footer() {
  const { lang } = useApp()
  const { settings, pages } = useContent()
  const route = useHashRoute()
  const status = useBusinessStatus(settings.hours, lang, settings.storeStatus)

  const ar = lang === 'ar'
  const socials = settings.socials || {}
  const name = settings.name?.[lang] || settings.name?.en || 'BENOVA'
  const tagline = settings.tagline?.[lang] || settings.tagline?.en || ''
  const bio =
    settings.bio?.[lang] ||
    (ar
      ? 'كريب طازج، شوكولاتة بلجيكية، عصائر فواكه، وافل وميلك شيك — كل شي يُحضَّر عند الطلب وبكل حب.'
      : 'Fresh crepes, Belgian chocolate, fruit juices, waffles and shakes — everything made to order, with love.')
  const logoSrc = settings.logo || FALLBACK_LOGO

  const waLink = settings.whatsapp ? `https://wa.me/${settings.whatsapp}` : ''
  const mapsLink = settings.mapsUrl ? normalizeUrl(settings.mapsUrl) : ''

  /** روابط سريعة — بتحترم الصفحات الموقوفة من الأدمن */
  const quickLinks = [
    { key: 'menu', route: '/menu', label: ar ? 'المنيو' : 'Menu' },
    { key: 'offers', route: '/offers', label: ar ? 'العروض الخاصة' : 'Special Offers' },
    ...(pages.about?.active
      ? [{ key: 'about', route: '/about', label: ar ? 'من نحن' : 'About' }]
      : []),
    { key: 'contact', route: '/contact', label: ar ? 'تواصل معنا' : 'Contact' },
  ]

  const go = (target) => {
    if (target === '/menu') {
      if (route === '/' || route === '/menu') {
        document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        navigate('/menu')
      }
      return
    }
    navigate(target)
  }

  const isActive = (key) => {
    if (key === 'menu') return route === '/' || route === '/menu'
    return route === `/${key}`
  }

  const socialItems = [
    {
      key: 'wa',
      url: waLink,
      label: 'WhatsApp',
      icon: <IconWhatsApp size={18} />,
      tone: 'bg-[#25D366] text-white hover:shadow-[0_10px_24px_-8px_rgba(37,211,102,0.65)]',
      disabledHint: ar ? 'أضف رقم واتساب من لوحة التحكم' : 'Add WhatsApp from the admin panel',
    },
    {
      key: 'ig',
      url: socials.instagram ? normalizeUrl(socials.instagram) : '',
      label: 'Instagram',
      icon: <IconInstagram size={18} />,
      tone: 'bg-gradient-to-br from-[#f9a03f] via-[#e1306c] to-[#8a3ab9] text-white hover:shadow-[0_10px_24px_-8px_rgba(225,48,108,0.65)]',
      disabledHint: ar ? 'أضف إنستغرام من لوحة التحكم' : 'Add Instagram from the admin panel',
    },
    {
      key: 'fb',
      url: socials.facebook ? normalizeUrl(socials.facebook) : '',
      label: 'Facebook',
      icon: <IconFacebook size={18} />,
      tone: 'bg-[#1877F2] text-white hover:shadow-[0_10px_24px_-8px_rgba(24,119,242,0.65)]',
      disabledHint: ar ? 'أضف فيسبوك من لوحة التحكم' : 'Add Facebook from the admin panel',
    },
    {
      key: 'tt',
      url: socials.tiktok ? normalizeUrl(socials.tiktok) : '',
      label: 'TikTok',
      icon: <IconTikTok size={18} />,
      tone: 'bg-[#111] text-white ring-1 ring-cream/15 hover:shadow-[0_10px_24px_-8px_rgba(37,244,238,0.4)]',
      disabledHint: ar ? 'أضف تيك توك من لوحة التحكم' : 'Add TikTok from the admin panel',
    },
  ]

  const statusTone =
    status.open === true
      ? 'border-emerald-400/25 bg-emerald-400/[0.07]'
      : status.open === false
        ? 'border-red-400/20 bg-red-400/[0.06]'
        : 'border-gold/20 bg-gold/[0.05]'

  const dotTone =
    status.open === true
      ? 'bg-emerald-400'
      : status.open === false
        ? 'bg-red-400'
        : 'bg-gold'

  return (
    <footer
      id="site-footer"
      className="relative mt-16 scroll-mt-24 overflow-hidden border-t border-gold/25 bg-[#18261b] text-cream dark:bg-[#070d08]"
    >
      {/* ─── خلفية هادئة ─── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
        <div className="absolute -end-24 -top-36 h-80 w-80 rounded-full bg-gold/[0.07] blur-[100px]" />
        <div className="absolute -start-28 bottom-0 h-72 w-72 rounded-full bg-primary/20 blur-[110px]" />
        <div
          className="absolute inset-0 opacity-[0.13]"
          style={{
            backgroundImage:
              'radial-gradient(rgba(246,239,221,0.4) 1px, transparent 1px)',
            backgroundSize: '26px 26px',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-28 pt-12 sm:px-6 sm:pt-14 lg:px-8 lg:pb-10">
        {/* ─── شبكة الأعمدة الأربعة ─── */}
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-11 lg:grid-cols-[1.35fr_0.75fr_1.05fr_1.05fr] lg:gap-8">
          {/* ① البراند */}
          <div>
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="relative shrink-0"
              >
                <span className="absolute -inset-2 rounded-full border border-gold/25" />
                <span className="absolute -inset-3.5 rounded-full border border-gold/10" />
                <span className="relative grid h-[68px] w-[68px] place-items-center overflow-hidden rounded-full bg-[#f4ead3] p-1.5 shadow-[0_18px_32px_-16px_rgba(0,0,0,0.85)] ring-4 ring-gold/50">
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

              <div className="min-w-0">
                <span className="text-[9px] font-black tracking-[0.26em] text-gold/80 uppercase">
                  {tagline}
                </span>
                <h3 className="mt-1 truncate font-display text-[26px] leading-tight tracking-wide text-cream sm:text-[28px]">
                  {name}
                </h3>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-[12px] font-medium leading-relaxed text-cream/60">
              {bio}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              {waLink && (
                <motion.a
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  href={waLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2.5 text-[11px] font-black text-gold transition-colors hover:border-gold/60 hover:bg-gold/15"
                >
                  <IconWhatsApp size={15} />
                  {ar ? 'اطلب عالواتساب' : 'Order on WhatsApp'}
                </motion.a>
              )}
              <span className="inline-flex items-center gap-1.5 text-[9px] font-bold tracking-[0.14em] text-cream/35 uppercase">
                <span className="h-1 w-1 rounded-full bg-gold/70" />
                {ar ? 'صُنع بحب في لبنان' : 'Made with love in Lebanon'}
              </span>
            </div>
          </div>

          {/* ② روابط سريعة */}
          <div>
            <ColumnTitle>{ar ? 'روابط سريعة' : 'Quick links'}</ColumnTitle>
            <nav className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-1">
              {quickLinks.map((link) => {
                const active = isActive(link.key)
                return (
                  <button
                    key={link.key}
                    type="button"
                    onClick={() => go(link.route)}
                    className={`group flex items-center gap-2.5 rounded-xl px-2 py-2 text-start text-[12.5px] font-bold transition-colors ${
                      active
                        ? 'bg-cream/[0.06] text-gold'
                        : 'text-cream/70 hover:bg-cream/[0.04] hover:text-cream'
                    }`}
                  >
                    <span
                      className={`h-1 w-1 shrink-0 rounded-full transition-colors ${
                        active ? 'bg-gold' : 'bg-cream/25 group-hover:bg-gold/70'
                      }`}
                    />
                    <span className="flex-1">{link.label}</span>
                    <span
                      className={`transition-transform duration-300 ${
                        ar
                          ? 'rotate-90 group-hover:-translate-x-0.5'
                          : '-rotate-90 group-hover:translate-x-0.5'
                      } ${active ? 'text-gold/80' : 'text-cream/20 group-hover:text-gold/70'}`}
                    >
                      <IconChevron size={11} />
                    </span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* ③ ساعات العمل والحالة */}
          <div>
            <ColumnTitle>{ar ? 'ساعات العمل' : 'Opening hours'}</ColumnTitle>

            <div
              role="status"
              aria-live="polite"
              className={`rounded-2xl border p-4 ${statusTone}`}
            >
              <div className="flex items-center gap-3">
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  {status.open === true && (
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-65" />
                  )}
                  <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${dotTone}`} />
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-[12px] font-black ${
                      status.open === true
                        ? 'text-emerald-300'
                        : status.open === false
                          ? 'text-red-300'
                          : 'text-gold'
                    }`}
                  >
                    {status.label}
                  </p>
                  <p className="mt-0.5 text-[9.5px] font-semibold tracking-wide text-cream/40">
                    {ar ? 'حالة المحل هلق' : 'Live store status'}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 flex items-start gap-2.5 border-t border-cream/10 pt-3.5">
                <span className="mt-0.5 shrink-0 text-gold/70">
                  <IconClock size={14} />
                </span>
                <p className="text-[11px] font-bold leading-relaxed text-cream/65">
                  {status.detail || (ar ? settings.hours?.ar : settings.hours?.en)}
                </p>
              </div>
            </div>

            <p className="mt-3 px-1 text-[9.5px] font-medium leading-relaxed text-cream/35">
              {ar
                ? 'الحالة بتتحدّث تلقائياً من ساعات العمل المحفوظة بالأدمن.'
                : 'Status updates automatically from the hours saved in the dashboard.'}
            </p>
          </div>

          {/* ④ السوشيال والموقع */}
          <div>
            <ColumnTitle>{ar ? 'تابعنا وموقعنا' : 'Social & location'}</ColumnTitle>

            <p className="mb-3 text-[10.5px] font-semibold leading-relaxed text-cream/45">
              {ar ? 'تابعنا لآخر النكهات والعروض.' : 'Follow us for the latest drops & offers.'}
            </p>

            <div className="flex flex-wrap gap-2">
              {socialItems.map((item) => (
                <SocialChip key={item.key} item={item} />
              ))}
            </div>

            {mapsLink ? (
              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="group mt-3 flex items-center gap-3 rounded-2xl border border-cream/12 bg-cream/[0.04] p-3 transition-colors hover:border-gold/40 hover:bg-cream/[0.07]"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/12 text-gold ring-1 ring-gold/20">
                  <IconPin size={16} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[8.5px] font-black tracking-[0.18em] text-gold/70 uppercase">
                    {ar ? 'موقعنا' : 'Find us'}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] font-bold text-cream/75">
                    {ar ? settings.address?.ar : settings.address?.en}
                  </span>
                </span>
                <span
                  className={`shrink-0 text-cream/25 transition-[color,transform] group-hover:text-gold ${
                    ar ? 'rotate-90' : '-rotate-90'
                  }`}
                >
                  <IconChevron size={14} />
                </span>
              </motion.a>
            ) : (
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-cream/10 bg-cream/[0.03] p-3 text-cream/30">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-cream/5 text-gold/40">
                  <IconPin size={16} />
                </span>
                <span className="text-[10px] font-bold">
                  {ar ? 'أضف رابط الخريطة من لوحة التحكم' : 'Add a Maps link in the dashboard'}
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() => go('/contact')}
              className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-black text-gold/80 transition-colors hover:text-gold"
            >
              {ar ? 'كل طرق التواصل' : 'All contact options'}
              <span className={ar ? 'rotate-90' : '-rotate-90'}>
                <IconChevron size={11} />
              </span>
            </button>
          </div>
        </div>

        {/* ─── الشريط السفلي ─── */}
        <div className="mt-11 flex items-center justify-center gap-3.5 border-t border-cream/10 pt-6 sm:gap-5">
          <span
            aria-hidden
            className="h-px w-10 bg-gradient-to-r from-transparent to-gold/45 sm:w-16"
          />
          <p className="whitespace-nowrap font-display text-[15px] tracking-[0.22em] text-cream/75 sm:text-base">
            BENOVA
          </p>
          <span
            aria-hidden
            className="h-px w-10 bg-gradient-to-l from-transparent to-gold/45 sm:w-16"
          />
        </div>
      </div>
    </footer>
  )
}
