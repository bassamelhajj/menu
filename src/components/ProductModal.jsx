import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import {
  fmtAlt,
  fmtPrice,
  isBundleProduct,
  productUnitPricing,
} from '../lib/format'
import {
  IconClose,
  IconHeart,
  IconMinus,
  IconPlus,
  IconSparkle,
  IconStar,
  IconCheck,
  IconTag,
  IconLeaf,
  IconFlame,
  IconShoppingBag,
} from './icons'

/**
 * منتج modal فاخر مع glassmorphism، حاسبة سعر فورية، وتحرير سلة سلس.
 */
export default function ProductModal({ product, onClose, editLine }) {
  const { lang, currency, t, addToCart, removeLine, isFavorite, toggleFavorite } = useApp()
  const { usdRate, activeExtras, activeProducts, globalOffer } = useContent()

  // --- الحالة المحلية ---
  const [sizeIdx, setSizeIdx] = useState(0)
  const [picked, setPicked] = useState([])
  const [qty, setQty] = useState(1)
  const [note, setNote] = useState('')

  // إذا كنا في وضع التحرير، نملأ الحالة من السطر الموجود
  useEffect(() => {
    if (editLine) {
      setSizeIdx(editLine.sizeIdx ?? 0)
      setPicked(editLine.extras ?? [])
      setQty(editLine.qty ?? 1)
      setNote(editLine.note ?? '')
    } else {
      setSizeIdx(0)
      setPicked([])
      setQty(1)
      setNote('')
    }
  }, [editLine])

  // منع تمرير الصفحة
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // --- الحسابات المشتقة ---
  const size = product.sizes[sizeIdx] || product.sizes[0]
  const bundle = isBundleProduct(product)
  const availableExtras = useMemo(
    () =>
      activeExtras.filter(
        (extra) =>
          !Array.isArray(extra.catIds) ||
          extra.catIds.length === 0 ||
          extra.catIds.includes(product.cat),
      ),
    [activeExtras, product.cat],
  )
  const extrasTotal = useMemo(() => picked.reduce((sum, e) => sum + e.priceLL, 0), [picked])
  const fav = isFavorite(product.id)

  const unitPricing = productUnitPricing({
    product,
    size,
    allProducts: activeProducts,
    globalOffer,
  })
  const unitBase = unitPricing.originalLL + extrasTotal
  const baseLL = unitPricing.finalLL + extrasTotal
  const originalTotalLL = unitBase * qty
  const totalLL = baseLL * qty
  const savedLL = unitBase - baseLL
  const hasDiscount = savedLL > 0

  const bundleContents = useMemo(
    () =>
      bundle
        ? (product.bundleItems || [])
            .map((item) => {
              const component = activeProducts.find((entry) => entry.id === item.productId)
              if (!component) return null
              return {
                id: component.id,
                name: lang === 'ar' ? component.ar : component.en,
                emoji: component.emoji,
                qty: Math.max(1, Number(item.qty) || 1),
              }
            })
            .filter(Boolean)
        : [],
    [activeProducts, bundle, lang, product.bundleItems],
  )

  const toggleExtra = (extra) =>
    setPicked((prev) =>
      prev.find((e) => e.id === extra.id)
        ? prev.filter((e) => e.id !== extra.id)
        : [...prev, extra],
    )

  const handleAddToCart = () => {
    addToCart({ product, sizeIdx, size, extras: picked, qty, note })
    onClose()
  }

  const handleUpdateLine = () => {
    removeLine(editLine.key)
    addToCart({ product, sizeIdx, size, extras: picked, qty, note })
    onClose()
  }

  // --- أرقام الأحجام ---
  const sizeLabels = product.sizes.map((sz, i) => {
    const pricing = productUnitPricing({
      product,
      size: sz,
      allProducts: activeProducts,
      globalOffer,
    })
    return {
      key: i,
      label: lang === 'ar' ? sz.labelAr : sz.labelEn,
      price: fmtPrice(pricing.finalLL, currency, usdRate),
      original:
        pricing.hasDiscount && currency === 'LL'
          ? fmtPrice(pricing.originalLL, currency, usdRate)
          : '',
      isActive: i === sizeIdx,
    }
  })

  // --- المكونات (Ingredients) ---
  const ingredients = [
    { icon: '🌾', ar: 'دقيق ممتاز', en: 'Premium flour' },
    { icon: '🥚', ar: 'بيض طازج', en: 'Fresh eggs' },
    { icon: '🥛', ar: 'حليب كامل الدسم', en: 'Full-fat milk' },
    { icon: '🧈', ar: 'زبدة طبيعية', en: 'Real butter' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* الخلفية المعتمة */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-cocoa/60 backdrop-blur-md"
      />

      {/* البطاقة الرئيسية */}
      <motion.div
        initial={{ y: '100%', opacity: 0.6, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: '100%', opacity: 0.4 }}
        transition={{ type: 'spring', stiffness: 280, damping: 30 }}
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-line bg-bg shadow-2xl sm:max-w-lg sm:rounded-[2rem]"
      >
        {/* ─── منطقة الصورة (Hero) ─── */}
        <div className="relative flex h-56 shrink-0 items-center justify-center overflow-hidden bg-panel sm:h-72">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(192,154,78,0.34),transparent_62%)]" />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa/40 via-transparent to-transparent" />

          {product.image ? (
            <img
              src={product.image}
              alt={lang === 'ar' ? product.ar : product.en}
              className="relative h-full w-full object-cover"
            />
          ) : (
            <motion.span
              className="relative text-[110px] leading-none drop-shadow-[0_14px_22px_rgba(0,0,0,0.22)] sm:text-[132px]"
              animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            >
              {product.emoji}
            </motion.span>
          )}

          {/* زر الإغلاق */}
          <button
            type="button"
            aria-label={t('close')}
            onClick={onClose}
            className="absolute end-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-line bg-surface/85 text-ink backdrop-blur transition-colors hover:text-primary hover:border-primary/50 active:scale-90"
          >
            <IconClose size={18} />
          </button>

          {/* زر المفضلة */}
          <button
            type="button"
            aria-label={t('favorites')}
            onClick={() => toggleFavorite(product.id)}
            className={`absolute start-3 top-3 grid h-10 w-10 place-items-center rounded-full border backdrop-blur transition-all active:scale-90 ${
              fav
                ? 'border-transparent gold-bg text-cocoa shadow-md'
                : 'border-line bg-surface/85 text-muted hover:text-primary hover:border-primary/50'
            }`}
          >
            <IconHeart size={18} filled={fav} />
          </button>

          {/* الشارات */}
          <div className="absolute bottom-3 start-3 flex flex-wrap gap-1.5">
            {product.tags?.includes('best') && (
              <span className="inline-flex items-center gap-1 rounded-full gold-bg px-2.5 py-1 text-[9px] font-black text-cocoa shadow">
                <IconStar size={10} />
                {t('bestSeller')}
              </span>
            )}
            {product.tags?.includes('new') && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black text-cream shadow">
                <IconSparkle size={10} />
                {t('isNew')}
              </span>
            )}
            {hasDiscount && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-600/90 px-2.5 py-1 text-[9px] font-black text-white shadow">
                <IconFlame size={10} />
                {t('offerBadge')}
              </span>
            )}
          </div>
        </div>

        {/* ─── الجسم القابل للتمرير ─── */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-5 py-4">
          {/* العنوان */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-black text-ink">
                {lang === 'ar' ? product.ar : product.en}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {lang === 'ar' ? product.descAr : product.descEn}
              </p>
            </div>
            <span className="shrink-0 grid h-10 w-10 place-items-center rounded-2xl border border-gold/30 bg-gold/10 text-gold-deep">
              <IconTag size={18} />
            </span>
          </div>

          {/* الباقة: محتوياتها. المنتج العادي: مكوناته الأساسية */}
          {bundle && bundleContents.length > 0 ? (
            <div className="mb-4 rounded-2xl border border-gold/35 bg-gold/8 p-3 backdrop-blur-sm">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-black tracking-wide text-gold-deep">
                <IconTag size={12} />
                {lang === 'ar' ? 'محتويات العرض' : 'What’s inside'}
              </h3>
              <div className="space-y-1.5">
                {bundleContents.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-line/50 bg-bg/60 px-3 py-2"
                  >
                    <span className="flex min-w-0 items-center gap-2 text-[11px] font-extrabold text-ink">
                      <span className="text-base">{item.emoji}</span>
                      <span className="truncate">{item.name}</span>
                    </span>
                    <span className="shrink-0 rounded-full bg-gold/15 px-2 py-0.5 text-[10px] font-black text-gold-deep">
                      ×{item.qty}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-4 rounded-2xl border border-line/50 bg-surface/50 p-3 backdrop-blur-sm">
              <h3 className="flex items-center gap-1.5 text-xs font-black tracking-wide text-primary mb-2">
                <IconLeaf size={12} />
                {lang === 'ar' ? 'المكونات الأساسية' : 'Key ingredients'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border border-line/50 bg-bg/50 px-2.5 py-1 text-[10px] font-semibold text-muted"
                  >
                    <span>{ing.icon}</span>
                    {lang === 'ar' ? ing.ar : ing.en}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* اختيار الحجم */}
          {product.sizes.length > 1 && (
            <div className="mb-5">
              <h3 className="mb-2 text-xs font-black tracking-wide text-primary">
                {t('selectSize')}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {sizeLabels.map((sz) => (
                  <button
                    key={sz.key}
                    type="button"
                    onClick={() => setSizeIdx(sz.key)}
                    className={`rounded-2xl border px-2 py-2.5 text-center transition-all relative overflow-hidden ${
                      sz.isActive
                        ? 'border-transparent primary-bg text-cream shadow-[0_8px_20px_-8px_rgba(96,120,72,0.5)]'
                        : 'border-line bg-surface text-ink hover:border-gold/60 hover:bg-gold/5'
                    }`}
                  >
                    <span className="relative block text-[12px] font-extrabold">
                      {sz.label}
                    </span>
                    {sz.original && (
                      <span className={`relative mt-0.5 block text-[9px] line-through ${sz.isActive ? 'text-cream/60 opacity-70' : 'text-stone-400 font-normal opacity-70'}`}>
                        {sz.original}
                      </span>
                    )}
                    <span className={`relative block text-[10px] font-bold ${sz.isActive ? 'text-cream/80' : 'text-amber-500'}`}>
                      {sz.price}
                    </span>
                    {sz.isActive && (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className="absolute inset-0 border-2 border-gold/50 rounded-2xl"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* الإضافات */}
          {availableExtras.length > 0 && (
            <div className="mb-5">
              <h3 className="mb-2 flex items-center gap-1.5 text-xs font-black tracking-wide text-primary">
                <IconSparkle size={12} />
                {t('addExtras')}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {availableExtras.map((extra) => {
                  const on = picked.some((e) => e.id === extra.id)
                  const extraPrice = fmtPrice(extra.priceLL, currency, usdRate)
                  return (
                    <button
                      key={extra.id}
                      type="button"
                      onClick={() => toggleExtra(extra)}
                      className={`flex items-center justify-between gap-2 rounded-2xl border px-3 py-2.5 text-start transition-all relative overflow-hidden ${
                        on
                          ? 'border-gold bg-gold/12 shadow-sm'
                          : 'border-line bg-surface hover:border-gold/50 hover:bg-gold/5'
                      }`}
                    >
                      <span className="relative text-[11px] font-extrabold text-ink">
                        {lang === 'ar' ? extra.ar : extra.en}
                      </span>
                      <span className="relative shrink-0 flex items-center gap-1 text-[10px] font-black text-gold-deep">
                        +{extraPrice}
                      </span>
                      <AnimatePresence>
                        {on && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute inset-0 bg-gradient-to-r from-gold/10 to-transparent"
                          />
                        )}
                      </AnimatePresence>
                      <AnimatePresence>
                        {on && (
                          <motion.div
                            initial={{ opacity: 0, rotate: -45 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            className="absolute end-2 top-1/2 -translate-y-1/2"
                          >
                            <IconCheck size={14} className="text-gold" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* ملاحظات خاصة على الصنف */}
          <label className="mb-5 block">
            <span className="mb-1.5 block text-xs font-black tracking-wide text-primary">
              {lang === 'ar' ? 'ملاحظات على الصنف (اختياري)' : 'Item notes (optional)'}
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={180}
              rows={2}
              placeholder={
                lang === 'ar'
                  ? 'مثلاً: بدون سكر، إضافة شوكولاتة…'
                  : 'For example: no sugar, extra chocolate…'
              }
              className="field resize-none text-[12px]"
            />
          </label>

          {/* ملخص السعر الفوري */}
          <div className="rounded-2xl border border-gold/30 bg-gold/8 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/15 text-gold-deep">
                  <IconShoppingBag size={18} />
                </span>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wide text-gold-deep">
                    {lang === 'ar' ? 'السعر الفوري' : 'Live price'}
                  </p>
                  <p className="text-lg font-bold text-amber-500">
                    {fmtPrice(totalLL, currency, usdRate)}
                  </p>
                </div>
              </div>
              <div className="text-end">
                <p className="text-[10px] font-bold text-muted">{t('finalPrice')}</p>
                {hasDiscount && (
                  <p className="text-xs text-stone-400 font-normal line-through opacity-70">
                    {fmtPrice(originalTotalLL, currency, usdRate)}
                  </p>
                )}
                <p className="text-xl font-bold text-amber-500">
                  {fmtPrice(totalLL, currency, usdRate)}
                </p>
                {hasDiscount && (
                  <p className="text-[10px] text-stone-400 font-normal line-through opacity-70">
                    {fmtAlt(originalTotalLL, currency, usdRate)}
                  </p>
                )}
                <p className="text-[10px] font-bold text-amber-500/85">
                  {fmtAlt(totalLL, currency, usdRate)}
                </p>
                {savedLL > 0 && (
                  <p className="mt-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    {lang === 'ar' ? 'وفّرت' : 'You save'} {fmtPrice(savedLL, currency, usdRate)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── الفوتر (الكمية + زر الإضافة) ─── */}
        <div className="shrink-0 border-t border-line bg-surface/80 px-5 py-4 backdrop-blur-xl">
          {/* عداد الكمية */}
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="flex items-center gap-1 rounded-2xl border border-line bg-bg p-1">
              <button
                type="button"
                aria-label="-"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="grid h-9 w-9 place-items-center rounded-xl text-ink transition-colors hover:bg-panel active:scale-90"
              >
                <IconMinus size={17} />
              </button>
              <span className="w-8 text-center text-sm font-black text-ink">{qty}</span>
              <button
                type="button"
                aria-label="+"
                onClick={() => setQty((q) => Math.min(20, q + 1))}
                className="grid h-9 w-9 place-items-center rounded-xl text-ink transition-colors hover:bg-panel active:scale-90"
              >
                <IconPlus size={17} />
              </button>
            </div>

            <div className="text-end">
              <p className="text-[10px] font-bold text-muted">{t('finalPrice')}</p>
              {hasDiscount && (
                <p className="text-[10px] text-stone-400 font-normal line-through opacity-70">
                  {fmtPrice(originalTotalLL, currency, usdRate)}
                </p>
              )}
              <p className="text-lg font-bold text-amber-500">
                {fmtPrice(totalLL, currency, usdRate)}
              </p>
              <p className="text-[10px] font-bold text-amber-500/85">
                {fmtAlt(totalLL, currency, usdRate)}
              </p>
              {hasDiscount && (
                <p className="text-[10px] text-stone-400 font-normal line-through opacity-70">
                  {fmtAlt(originalTotalLL, currency, usdRate)}
                </p>
              )}
            </div>
          </div>

          {/* زر الإضافة / التحديث */}
          <motion.button
            type="button"
            whileTap={{ scale: 0.97 }}
            onClick={editLine ? handleUpdateLine : handleAddToCart}
            className="flex w-full items-center justify-center gap-2 rounded-2xl gold-bg py-3.5 text-sm font-black text-cocoa shadow-lg transition-all hover:shadow-xl"
          >
            <IconPlus size={18} />
            {editLine ? t('update') : t('addToCart')}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}