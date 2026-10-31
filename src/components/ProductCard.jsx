import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import {
  fmtAlt,
  fmtPrice,
  isBundleProduct,
  productUnitPricing,
} from '../lib/format'
import { IconEye, IconHeart, IconPlus, IconSparkle } from './icons'

const supportsHover = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches

/**
 * كرت المنتج — تصميم حصري مستوحى من ستايل الصور المرجعية:
 *   خلفية دافئة داكنة + تأثير زجاجي (glass) + صورة طافية + تايبوغرافي فخمة.
 */
export default function ProductCard({ product, index, onOpen }) {
  const { lang, currency, t, isFavorite, toggleFavorite } = useApp()
  const { usdRate, globalOffer, activeProducts } = useContent()
  const rxRaw = useMotionValue(0)
  const ryRaw = useMotionValue(0)
  const rx = useSpring(rxRaw, { stiffness: 200, damping: 20 })
  const ry = useSpring(ryRaw, { stiffness: 200, damping: 20 })

  const fav = isFavorite(product.id)
  const multi = product.sizes.length > 1
  const fromLabel = lang === 'ar' ? 'من' : 'from'
  const bundle = isBundleProduct(product)
  const pricing = productUnitPricing({
    product,
    size: product.sizes[0],
    allProducts: activeProducts,
    globalOffer,
  })
  const baseLL = pricing.finalLL
  const hasDiscount = pricing.hasDiscount
  const discountPercent = pricing.originalLL
    ? Math.round((pricing.discountLL / pricing.originalLL) * 100)
    : 0
  const bundleSummary = bundle
    ? (product.bundleItems || [])
        .map((item) => {
          const component = activeProducts.find((entry) => entry.id === item.productId)
          if (!component) return ''
          return `${Math.max(1, Number(item.qty) || 1)}× ${lang === 'ar' ? component.ar : component.en}`
        })
        .filter(Boolean)
        .join(' + ')
    : ''
  const isBest = product.tags?.includes('best')
  const isNew = product.tags?.includes('new')

  // تسمية صغيرة فوق الاسم (مثل صور التصميم المرجعية)
  const kicker = bundle
    ? lang === 'ar'
      ? 'عرض باقة'
      : 'Combo deal'
    : isBest
      ? t('bestSeller')
      : isNew
        ? t('isNew')
        : lang === 'ar'
          ? 'BENOVA'
          : 'BENOVA'

  const handleMove = (e) => {
    if (!supportsHover()) return
    const box = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - box.left) / box.width - 0.5
    const py = (e.clientY - box.top) / box.height - 0.5
    ryRaw.set(px * 14)
    rxRaw.set(-py * 10)
  }

  const reset = () => {
    rxRaw.set(0)
    ryRaw.set(0)
  }

  return (
    <div style={{ perspective: 1200 }}>
      <motion.article
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.42, delay: Math.min(index * 0.035, 0.35) }}
        onPointerMove={handleMove}
        onPointerLeave={reset}
        onClick={() => onOpen(product)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen(product)
          }
        }}
        role="button"
        tabIndex={0}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="card-3d group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[28px] border border-line/70 bg-surface/70 shadow-[0_18px_40px_-28px_rgba(22,33,26,0.75)] backdrop-blur-xl transition-[box-shadow,border-color,background-color] duration-500 hover:border-gold/60 hover:bg-surface/85 hover:shadow-[0_34px_60px_-30px_rgba(176,138,69,0.6)]"
      >
        {/* توهّج خلفي دافئ */}
        <div className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-gold/25 blur-3xl" />

        {/* منطقة الصورة */}
        <div className="relative flex h-40 items-center justify-center overflow-hidden sm:h-44">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(192,154,78,0.28),transparent_68%)]" />
          {/* ظل أرضي ناعم يعطي إحساس الطفو */}
          <div className="absolute bottom-5 h-4 w-24 rounded-[100%] bg-cocoa/25 blur-lg" />

          {product.image ? (
            <img
              src={product.image}
              alt={lang === 'ar' ? product.ar : product.en}
              loading="lazy"
              className="relative h-full w-full scale-[0.86] object-contain transition-transform duration-700 group-hover:scale-100 group-hover:-rotate-2"
            />
          ) : (
            <motion.span
              className="relative text-[62px] leading-none drop-shadow-[0_16px_24px_rgba(0,0,0,0.3)] transition-transform duration-700 group-hover:-translate-y-1 group-hover:rotate-6 sm:text-[76px]"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.12 }}
            >
              {product.emoji}
            </motion.span>
          )}

          {/* التسمية الصغيرة */}
          <span className="absolute start-4 top-3.5 inline-flex items-center gap-1.5 text-[9px] font-black tracking-[0.2em] text-gold-deep uppercase">
            <IconSparkle size={10} />
            {kicker}
          </span>

          {hasDiscount && (
            <span className="absolute end-4 top-3.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[9px] font-black text-white shadow-lg">
              🔥 {discountPercent > 0 ? `${discountPercent}%` : t('offerBadge')}
            </span>
          )}

          <button
            type="button"
            aria-label={t('favorites')}
            onClick={(e) => {
              e.stopPropagation()
              toggleFavorite(product.id)
            }}
            className={`absolute end-3.5 bottom-3.5 grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition-all active:scale-90 ${
              fav
                ? 'border-transparent gold-bg text-cocoa shadow-md'
                : 'border-cream/25 bg-cocoa/40 text-cream hover:bg-cocoa/60'
            }`}
          >
            <IconHeart size={16} filled={fav} />
          </button>

          {/* زر عرض التفاصيل */}
          <button
            type="button"
            aria-label={lang === 'ar' ? 'عرض التفاصيل' : 'View details'}
            onClick={(e) => {
              e.stopPropagation()
              onOpen(product)
            }}
            className="absolute start-3.5 bottom-3.5 inline-flex items-center gap-1.5 rounded-full border border-cream/25 bg-cocoa/45 px-3 py-1.5 text-[10px] font-black text-cream backdrop-blur-md transition-all hover:border-gold/60 hover:bg-cocoa/65 active:scale-95"
          >
            <IconEye size={13} />
            {lang === 'ar' ? 'عرض' : 'View'}
          </button>
        </div>

        {/* المحتوى */}
        <div className="relative flex flex-1 flex-col px-4 pt-1 pb-4 sm:px-5 sm:pb-5">
          {/* خط فاصل فاخر */}
          <div className="mb-3 h-px w-full bg-gradient-to-r from-transparent via-gold/35 to-transparent" />

          <h3 className="font-display text-[15px] leading-snug font-bold text-ink sm:text-[17px]">
            {lang === 'ar' ? product.ar : product.en}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted sm:text-xs">
            {lang === 'ar' ? product.descAr : product.descEn}
          </p>
          {bundleSummary && (
            <p className="mt-1.5 line-clamp-2 text-[10px] font-bold leading-relaxed text-gold-deep/90">
              🎁 {bundleSummary}
            </p>
          )}

          <div className="mt-auto flex items-end justify-between gap-2 pt-4">
            <div className="min-w-0 flex-1">
              {multi && (
                <span className="block text-[9px] font-bold tracking-wide text-muted uppercase">
                  {fromLabel}
                </span>
              )}
              {hasDiscount && (
                <span className="block truncate text-[11px] text-stone-400 font-normal line-through opacity-70">
                  {fmtPrice(pricing.originalLL, currency, usdRate)}
                </span>
              )}
              <span
                className={`block truncate text-[15px] sm:text-[17px] ${
                  hasDiscount ? 'font-bold text-amber-500' : 'font-black text-gold-deep'
                }`}
              >
                {fmtPrice(baseLL, currency, usdRate)}
              </span>
              {hasDiscount && (
                <span className="block truncate text-[9px] text-stone-400 font-normal line-through opacity-70">
                  {fmtAlt(pricing.originalLL, currency, usdRate)}
                </span>
              )}
              <span
                className={`block truncate text-[10px] ${
                  hasDiscount
                    ? 'font-bold text-amber-500/85'
                    : 'font-semibold text-muted/80'
                }`}
              >
                {multi ? '≤ ' : ''}
                {fmtAlt(baseLL, currency, usdRate)}
              </span>
            </div>

            {/* زر إضافة: كبسولة ذهبية (مثل التصميم المرجعي) */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.stopPropagation()
                onOpen(product)
              }}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full gold-bg px-3.5 py-2.5 text-[11px] font-black text-cocoa shadow-[0_8px_20px_-8px_rgba(176,138,69,0.9)] transition-transform duration-300 group-hover:scale-105 sm:px-4"
            >
              <IconPlus size={16} />
              {lang === 'ar' ? 'أضف' : 'Add'}
            </motion.button>
          </div>
        </div>

        {/* إطار ذهبي يظهر عند المرور */}
        <span className="pointer-events-none absolute inset-0 rounded-[28px] border border-gold/45 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      </motion.article>
    </div>
  )
}