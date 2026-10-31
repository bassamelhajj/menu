const svg = (size) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
})

export const IconHeart = ({ size = 20, filled = false }) => (
  <svg {...svg(size)} fill={filled ? 'currentColor' : 'none'}>
    <path d="M20.8 8.6a5 5 0 0 0-8.8-3.1 5 5 0 0 0-8.8 3.1c0 4.4 8.8 10.4 8.8 10.4s8.8-6 8.8-10.4Z" />
  </svg>
)

export const IconCart = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M3 4h2.2l2.3 10.6A1.6 1.6 0 0 0 9.1 16h9a1.6 1.6 0 0 0 1.57-1.3L21.5 7H6" />
    <circle cx="9.5" cy="20" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="18" cy="20" r="1.3" fill="currentColor" stroke="none" />
  </svg>
)

export const IconSearch = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
)

export const IconHome = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M4 10.5 12 4l8 6.5" />
    <path d="M6 9.5V20h12V9.5" />
    <path d="M10 20v-5h4v5" />
  </svg>
)

export const IconSun = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
  </svg>
)

export const IconMoon = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
  </svg>
)

export const IconClose = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconPlus = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconMinus = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M5 12h14" />
  </svg>
)

export const IconTrash = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" />
    <path d="M10 11v6M14 11v6" />
  </svg>
)

export const IconGlobe = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c2.5 2.6 2.5 15.4 0 18M12 3c-2.5 2.6-2.5 15.4 0 18" />
  </svg>
)

export const IconCoin = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M15 8.5c-.7-.9-1.8-1.5-3-1.5-1.8 0-3 1-3 2.2 0 2.8 6 1.4 6 4.1 0 1.3-1.3 2.2-3 2.2-1.3 0-2.5-.6-3.1-1.6M12 5.5v13" />
  </svg>
)

export const IconSparkle = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
    <path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2Z" />
  </svg>
)

export const IconEye = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

export const IconChevron = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const IconStar = ({ size = 20, filled = true }) => (
  <svg {...svg(size)} fill={filled ? 'currentColor' : 'none'} stroke={filled ? 'none' : 'currentColor'}>
    <path d="M12 3.5l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.9l6-.8L12 3.5Z" />
  </svg>
)

export const IconWhatsApp = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.5 14.4c-.3-.15-1.7-.84-2-.94-.27-.1-.47-.15-.67.15-.2.3-.77.94-.94 1.14-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.48-.9-.8-1.5-1.78-1.67-2.08-.17-.3-.02-.46.13-.6.14-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.6-.92-2.2-.24-.57-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.07-.12-.27-.2-.57-.35Z" />
    <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.6 0-3.1-.43-4.4-1.18l-.3-.18-3 .78.8-2.9-.2-.32A8.2 8.2 0 1 1 12 20.2Z" />
  </svg>
)

export const IconInstagram = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
  </svg>
)

export const IconPin = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
)

export const IconClock = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5.5l3.5 2" />
  </svg>
)

export const IconGrid = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </svg>
)

export const IconDownload = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M12 3v11M7.5 9.5 12 14l4.5-4.5" />
    <path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" />
  </svg>
)

export const IconBook = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
    <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21.5v-16Z" />
    <path d="M4 21.5A2.5 2.5 0 0 0 6.5 24" transform="translate(0 -2)" />
  </svg>
)

export const IconEdit = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3Z" />
    <path d="m13.5 6.5 3 3" />
  </svg>
)

export const IconCheck = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
)

export const IconCog = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 2.5v2.6M12 18.9v2.6M2.5 12h2.6M18.9 12h2.6M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19" />
  </svg>
)

export const IconUpload = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M12 16V5M7.5 9.5 12 5l4.5 4.5" />
    <path d="M4 17v2.5A1.5 1.5 0 0 0 5.5 21h13a1.5 1.5 0 0 0 1.5-1.5V17" />
  </svg>
)

export const IconLogout = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M10 5H5.5A1.5 1.5 0 0 0 4 6.5v11A1.5 1.5 0 0 0 5.5 19H10" />
    <path d="m14 8 4 4-4 4" />
    <path d="M18 12H9" />
  </svg>
)

export const IconTag = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M4 4h7l9 9-7 7-9-9V4Z" />
    <circle cx="8.5" cy="8.5" r="1.4" fill="currentColor" stroke="none" />
  </svg>
)

export const IconMail = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <rect x="3" y="5" width="18" height="14" rx="2.5" />
    <path d="m4 7 8 6 8-6" />
  </svg>
)

export const IconPhone = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3A2 2 0 0 1 18 19.5C9.8 18 5 13.2 3.5 5a2 2 0 0 1 3-1.5Z" />
  </svg>
)

export const IconFacebook = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.3-1.5 1.6-1.5h1.6V3.6c-.3-.05-1.3-.14-2.4-.14-2.4 0-4 1.46-4 4.14v2.3H7.6V13h2.7v8h3.2Z" />
  </svg>
)

export const IconTikTok = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M16.6 3c.4 1.8 1.6 3.2 3.4 3.5v2.7c-1.3 0-2.5-.4-3.4-1.1v6.1a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.8a2.8 2.8 0 1 0 2 2.7V3h2.7Z" />
  </svg>
)

export const IconGrid2 = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </svg>
)

/** 👥 مجموعة أشخاص — لتبويب الزبائن */
export const IconUsers = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5" />
    <path d="M16.5 5.6a3.2 3.2 0 0 1 0 6" />
    <path d="M17.5 14.8c2 .6 3.5 2.4 3.5 4.7" />
  </svg>
)

/** 🙈 عين مشطوبة — إخفاء كلمة السر */
export const IconEyeOff = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M3 3l18 18" />
    <path d="M10.6 5.8A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.7 3.4" />
    <path d="M6.1 7.4A17.6 17.6 0 0 0 2.5 12S6 18.5 12 18.5a9.9 9.9 0 0 0 4.3-1" />
    <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
  </svg>
)

/** 🔒 قفل */
export const IconLock = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <rect x="4.5" y="10" width="15" height="10.5" rx="3" />
    <path d="M8 10V7.5a4 4 0 0 1 8 0V10" />
    <circle cx="12" cy="15.2" r="1.3" fill="currentColor" stroke="none" />
  </svg>
)

/** 👤 شخص */
export const IconUser = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20.5c0-3.6 3.4-6 7.5-6s7.5 2.4 7.5 6" />
  </svg>
)

/** 🛡️ درع — حماية/أدمن */
export const IconShield = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M12 3l7 3v5.5c0 4.6-3 7.9-7 9.5-4-1.6-7-4.9-7-9.5V6l7-3Z" />
    <path d="m8.8 12 2.2 2.2 4.2-4.4" />
  </svg>
)

/** ⚠️ تنبيه */
export const IconAlert = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V13" />
    <circle cx="12" cy="16.4" r="1" fill="currentColor" stroke="none" />
  </svg>
)

/** 🔥 لهب — للعروض */
export const IconFlame = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M8.5 14.5A2.5 2.5 0 0 1 11 12c0-1.38-.5-2.01-1.4-3A2.5 2.5 0 1 0 9.5 7.5c0 1.8 1.5 3.3 3.3 3.3.7 0 1.3-.2 1.8-.5a4 4 0 0 0 4.8 4.8c.3-.5.5-1.1.5-1.8 0-2.3-2-4.3-4.5-4.3A2.5 2.5 0 0 0 7 5.5c0 1.6 1.1 2.5 2.5 3.5.4.2.8.5 1.2.9a2 2 0 0 1 1.4 2.2c0 .4 0 .9-.1 1.3A6.3 6.3 0 0 1 8.5 14.5Z" />
  </svg>
)

/** 🛍️ حقيبة تسوق — للسعر الفوري */
export const IconShoppingBag = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <path d="M3 6h18" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

/** 🌿 ورقة — للمكونات */
export const IconLeaf = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M11 20A7 7 0 0 1 9.8 2.7C14 2.5 17.5 5.7 17 10a7 7 0 0 1-6 10Z" />
    <path d="M2 21l16-16" />
  </svg>
)

/* ------------------------------------------------------------------ */
/*  Executive admin icons                                              */
/* ------------------------------------------------------------------ */

/** لوحة قيادة */
export const IconDashboard = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M4 13h7V4H4v9ZM13 20h7v-9h-7v9ZM4 20h7v-4H4v4ZM13 8h7V4h-7v4Z" />
  </svg>
)

/** صندوق منتجات */
export const IconBox = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="m4 7 8-4 8 4v10l-8 4-8-4V7Z" />
    <path d="m4 7 8 4 8-4M12 11v10M8 5l8 4" />
  </svg>
)

/** طبقات / أقسام */
export const IconLayers = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 12 9 5 9-5M3 16l9 5 9-5" />
  </svg>
)

/** فاتورة / طلبات */
export const IconReceipt = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </svg>
)

/** صورة / معرض */
export const IconImage = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <rect x="3" y="4" width="18" height="16" rx="3" />
    <circle cx="8.5" cy="9" r="1.5" />
    <path d="m4 17 5-5 4 4 2.5-2.5L20 18" />
  </svg>
)

/** شاحنة توصيل */
export const IconTruck = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M3 6h11v10H3V6ZM14 10h4l3 3v3h-7v-6Z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="18" cy="18" r="1.6" />
  </svg>
)

/** قاعدة بيانات / نسخ ونشر */
export const IconDatabase = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
    <path d="M4.5 5.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
    <path d="M4.5 11.5v6c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-6" />
  </svg>
)

/** تكرار */
export const IconCopy = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <rect x="8" y="8" width="12" height="12" rx="2.5" />
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" />
  </svg>
)

/** مقبض سحب */
export const IconGrip = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <circle cx="8" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="6" r="1" fill="currentColor" stroke="none" />
    <circle cx="8" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="8" cy="18" r="1" fill="currentColor" stroke="none" />
    <circle cx="16" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
)

/** قائمة موبايل */
export const IconMenu = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M4 7h16M4 12h16M4 17h11" />
  </svg>
)

/** رابط خارجي */
export const IconExternal = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M14 4h6v6M20 4l-8 8" />
    <path d="M19 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
  </svg>
)

/** مقياس / مؤشر */
export const IconGauge = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M4.2 18a8.5 8.5 0 1 1 15.6 0" />
    <path d="m12 13 3.2-3.2" />
    <circle cx="12" cy="13" r="1.2" fill="currentColor" stroke="none" />
  </svg>
)

/** إعادة ضبط / مزامنة */
export const IconRefresh = ({ size = 20 }) => (
  <svg {...svg(size)}>
    <path d="M20 7v5h-5M4 17v-5h5" />
    <path d="M6.1 9A7 7 0 0 1 18.7 7M17.9 15A7 7 0 0 1 5.3 17" />
  </svg>
)
