/**
 * lib/format.js — دوال تنسيق الأسعار والمبالغ
 * ===========================================================================
 * 📌 أهم قاعدة لازم تفهمها قبل ما تعدّل أي سعر:
 *
 *    الأسعار تُخزَّن بالطريقة الكاملة (Full LBP).
 *    يعني 200000 = مئتا ألف ليرة لبنانية، مش 200 ل.ل.
 *
 *    والتحويل للدولار بيصير تلقائياً:
 *        السعر بالدولار = السعر بالليرة ÷ سعر الصرف
 *
 * ⚠️ لو غيّرت `USD_RATE` هون، كل الأسعار المعروضة بالدولار بتتغيّر تلقائياً.
 *    قيمته الافتراضية 90,000 (يعني 300,000 ل.ل ≈ 3.33 دولار).
 */

// سعر الصرف: عدد الليرات الذي يساوي دولاراً واحداً.
// (يُستبدل فعلياً من لوحة التحكم ← الإعدادات ← سعر الصرف)
export const USD_RATE = 90000

/** يحوّل من الليرة إلى الدولار */
export const toUSD = (priceLL, rate = USD_RATE) => priceLL / rate

/** 200000 → "200,000 ل.ل" */
export const fmtLL = (priceLL) =>
  `${Math.round(priceLL).toLocaleString('en-US')} ل.ل`

/** 200000 → "$2.22" */
export const fmtUSD = (priceLL, rate = USD_RATE) => `$${toUSD(priceLL, rate).toFixed(2)}`

/**
 * السعر **الرئيسي** بعملة الزبون المختارة.
 * @param {number} priceLL السعر الكامل بالليرة
 * @param {'LL'|'USD'} currency العملة المختارة
 * @param {number} rate سعر الصرف
 */
export const fmtPrice = (priceLL, currency = 'LL', rate = USD_RATE) =>
  currency === 'USD' ? fmtUSD(priceLL, rate) : fmtLL(priceLL)

/**
 * السعر **الثانوي** (العملة الأخرى) — يظهر تحت السعر الرئيسي صغيرةً.
 * إذا الزبون مختار الليرة، بنعرض له الدولار كسطر مساعد والعكس.
 */
export const fmtAlt = (priceLL, currency = 'LL', rate = USD_RATE) =>
  currency === 'USD' ? fmtLL(priceLL) : fmtUSD(priceLL, rate)

/** نسبة خصم آمنة: بين 0 و99 — ما بتسمح بسعر سالب */
export const clampPercent = (value) =>
  Math.min(99, Math.max(0, Number(value) || 0))

/**
 * 🎁 هل العرض مفعّل فعلاً الآن؟ (مفعّل + نسبة > 0 + داخل تاريخي البداية/النهاية)
 * التواريخ اختيارية — فاضية = ما في حدود زمنية.
 */
export const offerActive = (offer) => {
  if (!offer?.active) return false
  if ((Number(offer.percent) || 0) <= 0) return false
  const today = new Date().toISOString().slice(0, 10)
  if (offer.startDate && today < offer.startDate) return false
  if (offer.endDate && today > offer.endDate) return false
  return true
}

/**
 * 💰 السعر النهائي بعد الخصومات.
 * يطبّق عرض المنتج الخاص + العرض العام للمنيو،
 * والقاعدة: **ينصبّط السعر الأقل بين الاثنين** (ما بينجمع الخصمان).
 * @param {number} priceLL السعر الأساسي بالليرة
 * @param {object|null} productOffer عرض المنتج (offer.active / offer.percent)
 * @param {object|null} globalOffer العرض العام للمنيو (settings.globalOffer)
 * @returns {number} السعر النهائي (مقرَّب لأقرب ليرة)
 */
export const applyOffers = (priceLL, productOffer, globalOffer) => {
  let price = Number(priceLL) || 0
  if (offerActive(productOffer)) {
    price = Math.min(price, priceLL * (1 - clampPercent(productOffer.percent) / 100))
  }
  if (offerActive(globalOffer)) {
    price = Math.min(price, priceLL * (1 - clampPercent(globalOffer.percent) / 100))
  }
  return Math.round(price)
}

/**
 * سعر التوصيل النهائي حسب إعدادات المتجر.
 * - الاستلام من المحل دائماً مجاني.
 * - freeDeliveryOver = 0 يعني ما في توصيل مجاني.
 */
export const calcDeliveryFee = (settings, subtotalLL, mode = 'pickup') => {
  if (mode !== 'delivery') return 0
  const subtotal = Math.max(0, Number(subtotalLL) || 0)
  const fee = Math.max(0, Number(settings?.deliveryFee) || 0)
  const freeOver = Math.max(0, Number(settings?.freeDeliveryOver) || 0)
  if (freeOver > 0 && subtotal >= freeOver) return 0
  return fee
}

/** هل العنصر باقة / عرض مركّب من أكثر من منتج؟ */
export const isBundleProduct = (product) =>
  Boolean(
    product &&
      (product.kind === 'bundle' ||
        (Array.isArray(product.bundleItems) && product.bundleItems.length > 0)),
  )

/**
 * القيمة الأصلية للباقة = مجموع أسعار مكوّناتها الأساسية قبل خصم الباقة.
 * بنستخدم أول حجم لكل مكوّن لأنه هو السعر المرجعي المعروض بالمنيو.
 */
export const bundleOriginalLL = (bundle, allProducts = []) => {
  const byId = new Map((allProducts || []).map((product) => [product.id, product]))
  return (bundle?.bundleItems || []).reduce((sum, item) => {
    const component = byId.get(item.productId)
    const size = component?.sizes?.[item.sizeIdx || 0] || component?.sizes?.[0]
    const qty = Math.max(1, Number(item.qty) || 1)
    return sum + (Number(size?.priceLL) || 0) * qty
  }, 0)
}

/**
 * تسعير وحدة واحدة قبل/بعد الخصم.
 * - المنتج العادي: السعر الأصلي = سعر الحجم، والنهائي = بعد عرض المنتج/العرض العام.
 * - الباقة: السعر النهائي = سعر الباقة المحدد، والأصلي = مجموع مكوّناتها.
 */
export const productUnitPricing = ({
  product,
  size,
  allProducts = [],
  globalOffer = null,
}) => {
  const bundle = isBundleProduct(product)
  const packagePrice = Math.max(0, Number(size?.priceLL) || 0)
  const originalLL = bundle
    ? bundleOriginalLL(product, allProducts) || packagePrice
    : Math.max(0, Number(size?.priceLL) || 0)
  const finalLL = bundle
    ? packagePrice
    : applyOffers(originalLL, product?.offer, globalOffer)
  return {
    originalLL,
    finalLL,
    discountLL: Math.max(0, originalLL - finalLL),
    hasDiscount: finalLL < originalLL,
  }
}