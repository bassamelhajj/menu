import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  CATEGORIES,
  PRODUCTS,
  EXTRAS,
  GALLERY,
  SAMPLE_BUNDLES,
  OFFERS_CATEGORY_ID,
} from '../data/menu'
import { STORE } from '../data/settings'
import { hashPassword, normEmail, normPhone } from '../lib/auth'
import { isBundleProduct, offerActive } from '../lib/format'
import { uid } from '../lib/helpers'

/**
 * ⚠️ لماذا uid صار بملف منفصل (lib/helpers.js)؟
 *   Vite React Fast Refresh يفشل عندما يصدّر ملف React **مكوّن + دوال/ثوابت**.
 *   عندها يفسد شجرة React وتظهر أخطاء وهمية مثل
 *   "useApp must be used inside AppProvider" — حتى لو الكود سليم 100%.
 *   الحل: هذا الملف يصدّر مكوّنات وـ hooks فقط.
 */

const ContentContext = createContext(null)

/** hook للوصول للمحتوى من أي مكوّن */
export const useContent = () => {
  const ctx = useContext(ContentContext)
  if (!ctx) throw new Error('useContent must be used inside <ContentProvider>')
  return ctx
}

const LS_KEY = 'benova:content'
const PUBLISHED_URL = '/content.json'

/** الحقول الافتراضية عند أول تشغيل أو إعادة ضبط */
const DEFAULT_PAGES = {
  about: {
    active: true,
    title: { ar: 'من نحن', en: 'About us' },
    body: {
      ar: 'قصة BENOVA\n\nبدأنا بشغف بسيط: كريب طازج وعصير طبيعي بطعم بيت. اليوم عندنا منيو كامل من الكريبات البلجيكية والأكواب الباردة وافل وميلك شيك.\n\nكل طلب بيتحضر قدامك — بلا مجمدات، بلا مواد حافظة، بلا استعجال.',
      en: 'Our story\n\nWe started with a simple passion: fresh crepes, natural juices, a home taste. Today we have a full menu: Belgian crepes, cold cups, waffles and shakes.\n\nEvery order is prepared in front of you — no frozen ingredients, no preservatives, no rushing.',
    },
  },
  faq: {
    active: true,
    title: { ar: 'أسئلة شائعة', en: 'FAQ' },
    items: [
      {
        id: 'q1',
        active: true,
        q: { ar: 'كيف أطلب؟', en: 'How do I order?' },
        a: { ar: 'اختار من المنيو، خصّص طلبك، واضغط «إتمام الطلب». بيوصلك واتساب بتأكيد الطلب.', en: 'Pick from the menu, customize it, then tap "Checkout". A WhatsApp message confirms your order.' },
      },
      {
        id: 'q2',
        active: true,
        q: { ar: 'هل في توصيل؟', en: 'Do you deliver?' },
        a: { ar: 'إحنا بنستلم الطلبات للاستلام من المحل. إذا بدك توصيل راسلنا واتساب.', en: 'We handle pickup orders. For delivery, message us on WhatsApp.' },
      },
      {
        id: 'q3',
        active: true,
        q: { ar: 'هل الأسعار بالليرة أو الدولار؟', en: 'Prices in LBP or USD?' },
        a: { ar: 'الاثنين متاحين. بدّل بينهم بزر العملة فوق. السعر بيتبدّل تلقائياً حسب سعر الصرف اللي ضبطه صاحب المحل.', en: 'Both are available. Toggle with the currency button up top. It converts live using the owner-set rate.' },
      },
      {
        id: 'q4',
        active: true,
        q: { ar: 'كيف بدفع؟', en: 'How do I pay?' },
        a: { ar: 'الدفع نقداً عند الاستلام، أو عبر المحفظة الإلكترونية / بطاقة إذا توفّر. التفاصيل على واتساب.', en: 'Cash on pickup, or digital wallet / card if available. Details on WhatsApp.' },
      },
      {
        id: 'q5',
        active: true,
        q: { ar: 'هل ممكن أغيّر المكوّنات؟', en: 'Can I change ingredients?' },
        a: { ar: 'أيوه، تقدر تضيف أو تشيل أي مكوّن من نافذة التخصيص. إذا عندك حساسية قلك موظّف المحل.', en: 'Yes — add or remove any ingredient from the customization modal. Mention allergies to our staff.' },
      },
      {
        id: 'q6',
        active: true,
        q: { ar: 'كم بتمشي الطلبية؟', en: 'How long does an order take?' },
        a: { ar: 'تقريباً ١٠–١٥ دقيقة للتحضير. وقت الذروة ممكن يتأخر شوية — نحنا نكلّمك بالواتساب.', en: 'Roughly 10–15 minutes to prepare. Rush hours may take a bit longer — we will ping you on WhatsApp.' },
      },
    ],
  },
  reviews: {
    active: true,
    title: { ar: 'آراء الزبائن', en: 'Reviews' },
    items: [
      {
        id: 'r1',
        active: true,
        name: 'ليلى ح.',
        rating: 5,
        text: { ar: 'أحلى كريب شوكولاتة بلجيكية جربته بحياتي! العجين طري والنكهة حقيقية ١٠٠٪.', en: 'Best Belgian chocolate crepe I\'ve ever had! The batter is fluffy and the flavor is 100% authentic.' },
        date: '2026-03-15',
      },
      {
        id: 'r2',
        active: true,
        name: 'كريم ص.',
        rating: 5,
        text: { ar: 'العصائر طازجة فعلاً، والوافل مقرمش من برّا وطري من جوّا. رح أرجع أكيد.', en: 'The juices are truly fresh, and the waffle is crisp outside, soft inside. Definitely coming back.' },
        date: '2026-02-28',
      },
      {
        id: 'r3',
        active: true,
        name: 'نور ع.',
        rating: 4,
        text: { ar: 'طلبت ميلك شيك فستق — نكهة غنية وقشدة مثالية. بس التوصيل تأخر شوية.', en: 'Ordered pistachio milkshake — rich flavor, perfect cream. Delivery was a bit slow though.' },
        date: '2026-01-20',
      },
    ],
  },
}

const CONTENT_VERSION = 2

/** Storefront settings only — credentials are intentionally excluded. */
const PUBLIC_SETTING_KEYS = [
  'name',
  'tagline',
  'logo',
  'bio',
  'whatsapp',
  'phone',
  'email',
  'socials',
  'mapsUrl',
  'hours',
  'address',
  'usdRate',
  'storeStatus',
  'deliveryFee',
  'freeDeliveryOver',
  'globalOffer',
]

const pickKeys = (source, keys) =>
  keys.reduce((out, key) => {
    if (source && Object.prototype.hasOwnProperty.call(source, key)) out[key] = source[key]
    return out
  }, {})

const DEFAULTS = {
  version: CONTENT_VERSION,
  settings: STORE,
  categories: CATEGORIES.filter((c) => c.id !== 'all'),
  products: PRODUCTS,
  extras: EXTRAS,
  gallery: GALLERY,
  pages: JSON.parse(JSON.stringify(DEFAULT_PAGES)),
  orders: [],
  customers: [],
  reviews: [],
  orderCounter: 1000,
  savedAt: 0,
}

/** يضمن أن الباقة بتبقى بقسم العروضات ومرتبطة بمكوّنات صحيحة */
const normalizeProduct = (product) => {
  if (!product || typeof product !== 'object') return product
  if (!isBundleProduct(product)) return product
  return {
    ...product,
    kind: 'bundle',
    cat: OFFERS_CATEGORY_ID,
    sizes:
      Array.isArray(product.sizes) && product.sizes.length
        ? product.sizes
        : [{ labelAr: 'باقة', labelEn: 'Combo', priceLL: 0 }],
    bundleItems: (product.bundleItems || [])
      .map((item) => ({
        productId: item.productId || item.id,
        qty: Math.max(1, Number(item.qty) || 1),
        ...(Number.isFinite(item.sizeIdx) ? { sizeIdx: item.sizeIdx } : {}),
      }))
      .filter((item) => item.productId),
    offer: {
      active: false,
      percent: 0,
      labelAr: 'عرض',
      labelEn: 'Offer',
      ...(product.offer || {}),
    },
  }
}

/**
 * ينظّف البيانات الواردة من localStorage أو ملف منشور
 * ويضمن أن كل الحقول موجودة وصحيحة
 */
const normalizeContent = (raw) => {
  if (!raw || typeof raw !== 'object') return DEFAULTS
  const version = Number(raw.version) || 1
  // Whitelisting also drops credentials left by older releases.
  const settings = { ...DEFAULTS.settings, ...pickKeys(raw.settings, PUBLIC_SETTING_KEYS) }
  settings.socials = { ...DEFAULTS.settings.socials, ...(settings.socials || {}) }
  // 🎁 العرض العام بيليف بمكان واحد (settings.globalOffer) بنفس الشكل الموحّد.
  //    نقبل مقدمة البديل raw.globalOffer (نسخ قديمة) لضمان التوافق الخلفي.
  settings.globalOffer = {
    ...DEFAULTS.settings.globalOffer,
    ...(raw.settings?.globalOffer || raw.globalOffer || {}),
  }

  // 🗂️ ترقية آمنة: قسم العروضات لازم يكون موجود حتى لو المحتوى محفوظ من نسخة قديمة.
  const seenCategories = new Set()
  let categories = (Array.isArray(raw.categories) ? raw.categories : DEFAULTS.categories)
    .filter((category) => category && !seenCategories.has(category.id) && seenCategories.add(category.id))
  if (!categories.some((category) => category.id === OFFERS_CATEGORY_ID)) {
    const offersCategory = DEFAULTS.categories.find(
      (category) => category.id === OFFERS_CATEGORY_ID,
    )
    categories = [offersCategory, ...categories]
  }

  let products = (Array.isArray(raw.products) ? raw.products : DEFAULTS.products)
    .filter(Boolean)
    .map(normalizeProduct)

  // 🎁 نضيف باقات البداية مرة واحدة فقط عند الترقية من النسخة 1،
  //    وبس إذا مكوّناتها موجودة فعلاً. بعدها الكلمة للأدمن (حذف/تعديل).
  if (version < CONTENT_VERSION && !products.some((product) => isBundleProduct(product))) {
    const productIds = new Set(products.map((product) => product.id))
    const seedBundles = SAMPLE_BUNDLES.filter(
      (bundle) =>
        !productIds.has(bundle.id) &&
        bundle.bundleItems.every((item) => productIds.has(item.productId)),
    )
    if (seedBundles.length > 0) {
      products = [
        ...seedBundles.map((bundle) => JSON.parse(JSON.stringify(bundle))),
        ...products,
      ]
    }
  }

  return {
    ...DEFAULTS,
    ...raw,
    version: CONTENT_VERSION,
    settings,
    categories,
    products,
    pages: {
      about: { ...DEFAULTS.pages.about, ...(raw.pages?.about || {}) },
      faq: { ...DEFAULTS.pages.faq, ...(raw.pages?.faq || {}) },
      reviews: { ...DEFAULTS.pages.reviews, ...(raw.pages?.reviews || {}) },
    },
    orders: Array.isArray(raw.orders) ? raw.orders : [],
    customers: Array.isArray(raw.customers) ? raw.customers : [],
    reviews: Array.isArray(raw.reviews) ? raw.reviews : [],
    orderCounter: Number.isFinite(raw.orderCounter) ? raw.orderCounter : DEFAULTS.orderCounter,
    savedAt: Number.isFinite(raw.savedAt) ? raw.savedAt : 0,
  }
}

/* ------------------------------------------------------------------ */
/*  Public publish helpers                                             */
/*  content.json contains storefront data only: no credentials,        */
/*  customers, orders or review emails.                                */
/* ------------------------------------------------------------------ */

/** نسخة عامة نظيفة صالحة للنشر على أي استضافة */
const buildPublicContent = (content) => ({
  version: content.version,
  settings: pickKeys(content.settings, PUBLIC_SETTING_KEYS),
  categories: content.categories,
  products: content.products,
  extras: content.extras,
  gallery: content.gallery,
  pages: content.pages,
  orders: [],
  customers: [],
  reviews: (content.reviews || [])
    .filter((review) => review.status === 'approved')
    .map(({ email: _email, customerId: _customerId, ...review }) => review),
  orderCounter: 1000,
  savedAt: content.savedAt,
})

/**
 * يستورد محتوى عاماً من غير أن يمسح البيانات المحلية:
 * الزبائن، الطلبات، وطابور الآراء غير المنشورة.
 */
const mergePublicContent = (raw, local) => {
  const incoming = normalizeContent(raw)
  const current = local || normalizeContent(DEFAULTS)
  const queuedReviews = (current.reviews || []).filter(
    (review) => review.status !== 'approved',
  )
  const importedApproved = (incoming.reviews || []).filter(
    (review) => review.status === 'approved',
  )
  const queuedIds = new Set(queuedReviews.map((review) => review.id))

  return {
    ...incoming,
    customers: current.customers || [],
    orders: current.orders || [],
    orderCounter: Number.isFinite(current.orderCounter)
      ? current.orderCounter
      : incoming.orderCounter,
    reviews: [
      ...queuedReviews,
      ...importedApproved.filter((review) => !queuedIds.has(review.id)),
    ],
  }
}

/** يقرأ البيانات من localStorage */
const readLS = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || null
  } catch {
    return null
  }
}

/** يكتب البيانات في localStorage */
const writeLS = (content) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(content))
  } catch {
    /* قد يكون التخزين ممتلئاً — نتجاهل بهدوء */
  }
}

/** مرجع دائم للمحتوى — نستخدمه بدون ما ننتظر re-render */
let contentRef = null

export function ContentProvider({ children }) {
  contentRef = useRef(null)
  const [content, setContentState] = useState(() => {
    const next = normalizeContent(readLS() || DEFAULTS)
    // Rewrite once so credentials stored by older releases are purged.
    writeLS(next)
    return next
  })

  /**
   * 🛠️ تعبئة المرجع بأول قيمة عند التحميل.
   * بدونه: customerExists / addReview بيقروا contentRef.current = null
   * لحد ما يصير أول تعديل — فيفشل فحص الإيميل المكرر أو إرسال رأي
   * بصفحة جديدة تماماً. هذا السطر بيضمن المرجع صحيح من أول لحظة.
   */
  useEffect(() => {
    contentRef.current = content
  }, [content])

  /**
   * تعديل المحتوى
   * @param {Function} fn دالة بتاخد المحتوى الحالي وبترجع الجديد
   * @param {boolean} stamp هل نسجّل وقت التعديل؟ (حتى ينحفظ تلقائياً)
   */
  const updateContent = useCallback((fn, stamp = false) => {
    setContentState((prev) => {
      const next = normalizeContent(fn(prev))
      if (stamp) next.savedAt = Date.now()
      writeLS(next)
      contentRef.current = next
      return next
    })
  }, [])

  /* ---------- إعدادات المتجر ---------- */
  const setSettings = useCallback(
    (patch) => updateContent((c) => ({ ...c, settings: { ...c.settings, ...patch } }), true),
    [updateContent],
  )

  /* ---------- الصفحات ---------- */
  const setPages = useCallback(
    (patch) => updateContent((c) => ({ ...c, pages: { ...c.pages, ...patch } }), true),
    [updateContent],
  )

  /* ---------- المنتجات ---------- */
  const setProducts = useCallback(
    (items) => updateContent((c) => ({ ...c, products: items }), true),
    [updateContent],
  )

  /* ---------- الأقسام ---------- */
  const setCategories = useCallback(
    (items) => updateContent((c) => ({ ...c, categories: items }), true),
    [updateContent],
  )

  /* ---------- الإضافات ---------- */
  const setExtras = useCallback(
    (items) => updateContent((c) => ({ ...c, extras: items }), true),
    [updateContent],
  )

  /* ---------- معرض الصور ---------- */
  const setGallery = useCallback(
    (items) => updateContent((c) => ({ ...c, gallery: items }), true),
    [updateContent],
  )

  /* ---------- الطلبات ---------- */
  const createOrder = useCallback(
    ({
      items,
      totalLL,
      originalTotalLL,
      savingsLL,
      mode,
      name,
      phone,
      address,
      pickupTime,
      payment,
      requests,
      shareLocation,
      area,
      locationLink,
      deliveryFee,
    }) => {
      const id = `BEN-${content.orderCounter + 1}`
      const order = {
        id,
        items,
        totalLL: Number(totalLL) || 0,
        originalTotalLL: Number(originalTotalLL) || Number(totalLL) || 0,
        savingsLL: Number(savingsLL) || 0,
        mode,
        name,
        phone,
        address: address || area || '',
        pickupTime: pickupTime || '',
        payment: payment || 'cash',
        requests,
        shareLocation,
        area: area || '',
        locationLink,
        deliveryFee: Number(deliveryFee) || 0,
        status: 'new',
        createdAt: new Date().toISOString(),
      }
      updateContent((c) => ({
        ...c,
        orders: [order, ...c.orders],
        orderCounter: c.orderCounter + 1,
      }))
      return order
    },
    [content.orderCounter, updateContent],
  )

  const setOrderStatus = useCallback(
    (id, status) =>
      updateContent((c) => ({
        ...c,
        orders: c.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      })),
    [updateContent],
  )

  const deleteOrder = useCallback(
    (id) =>
      updateContent((c) => ({ ...c, orders: c.orders.filter((o) => o.id !== id) })),
    [updateContent],
  )

  /* ---------- 👥 الزبائن (Sign up) ---------- */
  /**
   * تسجيل زبون جديد.
   * بيتحفظ مباشرة (مع stamp) حتى ما يضيعلو إذا سكّر المتصفح.
   * ⚠️ ملاحظة: التسجيل محلي على الجهاز لأن المشروع بدون سيرفر.
   *   صاحب المحل بيصدّرهم CSV من الأدمن ويحوّلهم لـ Excel / Google Sheets.
   */
  const addCustomer = useCallback((data) => {
    const email = normEmail(data.email)
    const customer = {
      id: uid('cus'),
      name: String(data.name || '').trim(),
      email,
      phone: normPhone(data.phone),
      // 🔑 بنخزّن بصمة كلمة السر مش النص (شوف lib/auth.js)
      passHash: hashPassword(data.password),
      createdAt: new Date().toISOString(),
    }
    updateContent((c) => {
      // ما بنسمح بإيميل مكرر
      if (c.customers.some((x) => x.email === email)) return { ...c }
      return { ...c, customers: [customer, ...c.customers] }
    }, true)
    return customer
  }, [updateContent])

  /** هل الإيميل مسجّل مسبقاً؟ (لإظهار رسالة أثناء Sign up) */
  const customerExists = useCallback((email) => {
    const e = normEmail(email)
    return contentRef.current?.customers?.some((x) => x.email === e) || false
  }, [])

  const deleteCustomer = useCallback(
    (id) =>
      updateContent(
        (c) => ({ ...c, customers: c.customers.filter((x) => x.id !== id) }),
        true,
      ),
    [updateContent],
  )

  /**
   * 🔑 تسجيل دخول الزبون: إيميل + كلمة سر
   * @returns {object|null} الحساب أو null إذا فشل
   */
  const signInCustomer = useCallback((email, password) => {
    const e = normEmail(email)
    const found = contentRef.current?.customers?.find((x) => x.email === e)
    if (!found) return null
    if (found.passHash !== hashPassword(password)) return null
    return found
  }, [])

  /**
   * ⭐ إرسال رأي جديد
   * بيبدأ بحالة 'pending' — ما بيظهر للزبائن إلا بعد موافقة الأدمن.
   * @returns {{ok:boolean, review?:object, reason?:string}}
   */
  const addReview = useCallback((data) => {
    const email = normEmail(data.email)
    const customer = contentRef.current?.customers?.find((x) => x.email === email)
    if (!customer) return { ok: false, reason: 'no-account' }

    const review = {
      id: uid('rev'),
      customerId: customer.id,
      name: customer.name || email,
      email,
      rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
      text: String(data.text || '').trim(),
      image: data.image || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    }
    updateContent((c) => ({ ...c, reviews: [review, ...c.reviews] }), true)
    return { ok: true, review }
  }, [updateContent])

  /**
   * ✅ الأدمن يوافق على رأي (بيظهر بالصفحة العامة) أو يرفضه
   * @param {'approved'|'rejected'} status
   */
  const setReviewStatus = useCallback(
    (id, status) =>
      updateContent(
        (c) => ({ ...c, reviews: c.reviews.map((r) => (r.id === id ? { ...r, status } : r)) }),
        true,
      ),
    [updateContent],
  )

  const deleteReview = useCallback(
    (id) =>
      updateContent(
        (c) => ({ ...c, reviews: c.reviews.filter((r) => r.id !== id) }),
        true,
      ),
    [updateContent],
  )

  /**
   * ⬇️ تصدير الزبائن كملف CSV — بيفتح مباشرة بـ Excel و Google Sheets.
   * ليش CSV مش XLSX؟ لأن XLSX بيلزمنا مكتبة ضخمة، و CSV بيفتح بالاثنين.
   */
  const exportCustomersCsv = useCallback(() => {
    const rows = contentRef.current.customers || []
    const head = ['الاسم', 'الإيميل', 'الهاتف', 'تاريخ التسجيل']
    // ⚠️ الفاصلة بين الحقول = فاصلة، والاقتباس المزدوج بيحمي النصوص
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const body = rows.map((c) =>
      [c.name, c.email, c.phone, (c.createdAt || '').slice(0, 10)]
        .map(esc)
        .join(','),
    )
    // \uFEFF ضروري وإلا Excel بيفتح الملف بترميز عربي غلط
    const csv = `\uFEFF${[head.map(esc).join(','), ...body].join('\r\n')}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benova-customers-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
  }, [])

  /* ---------- publish / import / reset ---------- */
  const exportJson = useCallback(() => {
    const publicContent = buildPublicContent(content)
    const blob = new Blob([JSON.stringify(publicContent, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'content.json'
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(url), 30_000)
  }, [content])

  const importJson = useCallback((file, onDone) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const raw = JSON.parse(String(reader.result))
        const fresh = mergePublicContent(raw, contentRef.current)
        contentRef.current = fresh
        setContentState(fresh)
        writeLS(fresh)
        onDone?.(true)
      } catch {
        onDone?.(false)
      }
    }
    reader.onerror = () => onDone?.(false)
    // ⚠️ readAsText مش readAsDataURL — الملف JSON نصّي، dataURL بيفسد الـ parse
    reader.readAsText(file)
  }, [])

  const resetContent = useCallback(() => {
    const fresh = JSON.parse(JSON.stringify(DEFAULTS))
    contentRef.current = fresh
    setContentState(fresh)
    writeLS(fresh)
  }, [])

  const restorePublished = useCallback(() => {
    fetch(PUBLISHED_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((raw) => {
        if (!raw) return
        const fresh = mergePublicContent(raw, contentRef.current)
        contentRef.current = fresh
        setContentState(fresh)
        writeLS(fresh)
      })
      .catch(() => {})
  }, [])

  /* ---------- بيانات مشتقة ---------- */
  const activeCategories = useMemo(
    () => content.categories.filter((c) => c.active !== false),
    [content.categories],
  )
  const activeProducts = useMemo(
    () => content.products.filter((p) => p.active !== false),
    [content.products],
  )
  const activeExtras = useMemo(
    () => content.extras.filter((e) => e.active !== false),
    [content.extras],
  )
  const offers = useMemo(
    () =>
      content.products.filter(
        (product) =>
          product.active !== false &&
          (isBundleProduct(product) || offerActive(product.offer)) &&
          product.sizes.some((size) => size.priceLL > 0),
      ),
    [content.products],
  )

  /* ---------- النشر ---------- */
  const [published, setPublished] = useState(null)
  useEffect(() => {
    fetch(PUBLISHED_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((raw) => {
        if (raw) setPublished(raw)
      })
      .catch(() => {})
  }, [])

  const value = useMemo(
    () => ({
      settings: content.settings,
      usdRate: content.settings.usdRate,
      globalOffer: content.settings.globalOffer,
      categories: content.categories,
      activeCategories,
      products: content.products,
      activeProducts,
      extras: content.extras,
      activeExtras,
      gallery: content.gallery,
      pages: content.pages,
      orders: content.orders,
      customers: content.customers,
      reviews: content.reviews,
      offers,
      published,
      updateContent,
      setProducts,
      setCategories,
      setExtras,
      setGallery,
      setSettings,
      setPages,
      createOrder,
      setOrderStatus,
      deleteOrder,
      addCustomer,
      deleteCustomer,
      customerExists,
      signInCustomer,
      addReview,
      setReviewStatus,
      deleteReview,
      exportCustomersCsv,
      exportJson,
      importJson,
      resetContent,
      restorePublished,
    }),
    [
      content, published, updateContent, setProducts, setCategories, setExtras, setGallery,
      setSettings, setPages, createOrder, setOrderStatus, deleteOrder, addCustomer,
      deleteCustomer, customerExists, signInCustomer, addReview, setReviewStatus,
      deleteReview, exportCustomersCsv, exportJson, importJson, resetContent, restorePublished,
      activeCategories, activeProducts, activeExtras, offers,
    ],
  )

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
