/**
 * pages/FavoritesPage.jsx — المفضلة
 * ===========================================================================
 * • كل صنف محفوظ بيظهر بكرت مستقل، مع اختيار الحجم والإضافة السريعة للسلة.
 * • زر إزالة واضح + زر عرض التفاصيل لنافذة التخصيص الكاملة.
 * • Empty state أنيق مع CTA لتصفّح المنيو.
 */
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { useUI } from '../store/UIContext'
import { navigate } from '../lib/hashRoute'
import { applyOffers, fmtAlt, fmtPrice, offerActive } from '../lib/format'
import PageBanner from '../components/PageBanner'
import BottomNav from '../components/BottomNav'
import {
  IconCart,
  IconChevron,
  IconEye,
  IconHeart,
  IconSparkle,
  IconTrash,
} from '../components/icons'

function FavoriteCard({ product, index, category, onOpen, onRemove }) {
  const { lang, currency, addToCart } = useApp()
  const { usdRate, globalOffer } = useContent()
  const [sizeIdx, setSizeIdx] = useState(0)
  const ar = lang === 'ar'

  const safeIdx = Math.min(sizeIdx, Math.max(0, product.sizes.length - 1))
  const size = product.sizes[safeIdx]
  const finalLL = size ? applyOffers(size.priceLL, product.offer, globalOffer) : 0
  const hasOffer =
    offerActive(product.offer) || offerActive(globalOffer)
  const hasSizes = product.sizes.length > 1

  const add = () => {
    if (!size) return
    addToCart({
      product,
      sizeIdx: safeIdx,
      size,
      extras: [],
      qty: 1,
    })
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.32, delay: Math.min(index * 0.04, 0.24) }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-line/80 bg-surface/75 shadow-[0_20px_46px_-32px_rgba(22,33,26,0.6)] backdrop-blur-xl transition-[border-color,box-shadow] duration-400 hover:border-gold/45 hover:shadow-[0_30px_60px_-32px_rgba(176,138,69,0.45)] dark:border-white/10 dark:bg-white/[0.045]"
    >
      {/* ─── الصورة / الإيموجي ─── */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden sm:h-44">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(192,154,78,0.24),transparent_68%)]" />
        <div className="absolute bottom-4 h-3.5 w-20 rounded-full bg-cocoa/20 blur-lg" />

        {product.image ? (
          <img
            src={product.image}
            alt={ar ? product.ar : product.en}
            loading="lazy"
            className="relative h-full w-full scale-[0.84] object-contain transition-transform duration-700 group-hover:scale-100 group-hover:-rotate-2"
          />
        ) : (
          <motion.span
            animate={{ y: [0, -8, 0] }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: index * 0.12,
            }}
            className="relative text-[62px] leading-none drop-shadow-[0_16px_22px_rgba(0,0,0,0.28)] transition-transform duration-700 group-hover:-translate-y-1 group-hover:rotate-6 sm:text-[72px]"
          >
            {product.emoji || '🍽️'}
          </motion.span>
        )}

        {category && (
          <span className="absolute start-3.5 top-3.5 inline-flex max-w-[60%] items-center gap-1.5 truncate rounded-full border border-line/70 bg-surface/75 px-2.5 py-1 text-[9px] font-black text-muted backdrop-blur dark:border-white/10 dark:bg-white/[0.07]">
            <span>{category.icon}</span>
            <span className="truncate">{ar ? category.ar : category.en}</span>
          </span>
        )}

        <button
          type="button"
          onClick={onRemove}
          aria-label={ar ? 'إزالة من المفضلة' : 'Remove from favorites'}
          title={ar ? 'إزالة من المفضلة' : 'Remove from favorites'}
          className="absolute end-3 top-3 grid h-9 w-9 place-items-center rounded-full border border-red-400/25 bg-surface/80 text-red-500 shadow-sm backdrop-blur transition-all hover:border-red-400/60 hover:bg-red-500 hover:text-white active:scale-90 dark:border-red-400/20 dark:bg-white/[0.07] dark:text-red-300"
        >
          <IconTrash size={15} />
        </button>

        <button
          type="button"
          onClick={onOpen}
          className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-cocoa/50 px-3 py-1.5 text-[10px] font-black text-cream backdrop-blur-md transition-all hover:border-gold/60 hover:bg-cocoa/70 active:scale-95"
        >
          <IconEye size={13} />
          {ar ? 'عرض' : 'View'}
        </button>

        {hasOffer && (
          <span className="absolute bottom-3 end-3 rounded-full bg-red-600/90 px-2.5 py-1 text-[9px] font-black text-white shadow-lg">
            🔥 {ar ? 'عرض' : 'Offer'}
          </span>
        )}
      </div>

      {/* ─── المحتوى ─── */}
      <div className="flex flex-1 flex-col px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
        <div className="mb-3 h-px w-full bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <h3 className="font-display text-[15px] font-bold leading-snug text-ink sm:text-[17px] dark:text-cream">
          {ar ? product.ar : product.en}
        </h3>
        <p className="mt-1.5 line-clamp-2 min-h-[32px] text-[11px] leading-relaxed text-muted sm:text-xs">
          {ar ? product.descAr : product.descEn}
        </p>

        {hasSizes && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {product.sizes.map((item, idx) => (
              <button
                key={`${item.labelEn}-${idx}`}
                type="button"
                onClick={() => setSizeIdx(idx)}
                aria-pressed={safeIdx === idx}
                className={`rounded-full border px-2.5 py-1 text-[9.5px] font-black transition-colors ${
                  safeIdx === idx
                    ? 'border-gold/60 bg-gold/15 text-gold-deep dark:text-gold'
                    : 'border-line bg-bg/40 text-muted hover:border-gold/35'
                }`}
              >
                {ar ? item.labelAr : item.labelEn}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2.5 pt-4">
          <div className="min-w-0 flex-1">
            {hasOffer && (
              <span className="block text-[9.5px] font-bold text-muted/60 line-through">
                {fmtPrice(size?.priceLL || 0, currency, usdRate)}
              </span>
            )}
            <span className="block truncate text-[16px] font-black text-gold-deep dark:text-gold">
              {fmtPrice(finalLL, currency, usdRate)}
            </span>
            <span className="block truncate text-[9.5px] font-semibold text-muted/75">
              {fmtAlt(finalLL, currency, usdRate)}
            </span>
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={add}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full gold-bg px-3.5 py-2.5 text-[11px] font-black text-cocoa shadow-[0_8px_20px_-8px_rgba(176,138,69,0.9)] transition-transform hover:scale-105"
          >
            <IconCart size={15} />
            {ar ? 'أضف للسلة' : 'Add to cart'}
          </motion.button>
        </div>
      </div>
    </motion.article>
  )
}

export default function FavoritesPage() {
  const { lang, favorites, toggleFavorite } = useApp()
  const { activeProducts, activeCategories } = useContent()
  const { openProduct, openCart } = useUI()
  const ar = lang === 'ar'

  const savedProducts = useMemo(
    () => activeProducts.filter((product) => favorites.includes(product.id)),
    [activeProducts, favorites],
  )

  const categoriesById = useMemo(
    () => new Map(activeCategories.map((category) => [category.id, category])),
    [activeCategories],
  )

  return (
    <div className="min-h-screen bg-bg pb-16">
      <PageBanner
        title={ar ? 'المفضلة' : 'Favorites'}
        kicker="BENOVA · SAVED"
        icon={<IconHeart size={25} filled />}
        subtitle={
          ar
            ? 'كل الأصناف اللي حبيتها محفوظة هون — جاهزة للإضافة للسلة بضغطة واحدة.'
            : 'Everything you loved, saved in one place — ready for the cart in one tap.'
        }
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-3 py-2 text-[10px] font-black text-muted dark:border-white/10 dark:bg-white/[0.05]">
          <IconSparkle size={12} className="text-gold" />
          {savedProducts.length} {ar ? 'صنف محفوظ' : 'saved items'}
        </span>
        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="btn-ghost px-4 py-2 text-[10.5px]"
        >
          {ar ? 'تصفّح المنيو' : 'Browse menu'}
          <span className={ar ? 'rotate-90' : '-rotate-90'}>
            <IconChevron size={11} />
          </span>
        </button>
      </PageBanner>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        {savedProducts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-[32px] border border-dashed border-gold/35 bg-surface/55 px-5 py-16 text-center backdrop-blur-xl dark:border-gold/20 dark:bg-white/[0.03] sm:py-20"
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute start-1/2 top-8 h-52 w-52 -translate-x-1/2 rounded-full bg-gold/10 blur-[70px]" />
            </div>

            <div className="relative mx-auto w-fit">
              <span className="absolute -inset-4 rounded-full border border-gold/15" />
              <span className="absolute -inset-8 rounded-full border border-gold/10" />
              <span className="relative grid h-20 w-20 place-items-center rounded-full border border-gold/30 bg-gold/12 text-gold-deep dark:text-gold">
                <IconHeart size={34} />
              </span>
            </div>

            <h2 className="relative mt-7 font-display text-2xl tracking-wide text-ink dark:text-cream">
              {ar ? 'المفضلة فاضية بعد' : 'No favorites yet'}
            </h2>
            <p className="relative mx-auto mt-2 max-w-sm text-[12px] font-semibold leading-relaxed text-muted">
              {ar
                ? 'اضغط على القلب بجانب أي صنف لتحفظه هنا، وترجع له بلحظة.'
                : 'Tap the heart on any item to save it here and find it whenever you come back.'}
            </p>
            <div className="relative mt-6 flex flex-wrap justify-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/menu')}
                className="btn-primary px-6 py-3.5"
              >
                {ar ? 'اكتشف المنيو' : 'Explore the menu'}
                <span className={ar ? 'rotate-90' : '-rotate-90'}>
                  <IconChevron size={13} />
                </span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/offers')}
                className="btn-ghost px-6 py-3.5"
              >
                🎁 {ar ? 'شوف العروض' : 'See offers'}
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.26em] text-gold-deep dark:text-gold/80">
                  {ar ? 'اختياراتك' : 'YOUR PICKS'}
                </span>
                <h2 className="mt-1 font-display text-xl tracking-wide text-ink dark:text-cream sm:text-2xl">
                  {ar ? 'محفوظاتك من المنيو' : 'Saved from the menu'}
                </h2>
              </div>
              <button
                type="button"
                onClick={openCart}
                className="inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/8 px-3.5 py-2 text-[10px] font-black text-gold-deep transition-colors hover:border-gold/60 dark:text-gold"
              >
                <IconCart size={13} />
                {ar ? 'افتح السلة' : 'Open cart'}
              </button>
            </div>

            <motion.div
              layout
              className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4"
            >
              <AnimatePresence mode="popLayout">
                {savedProducts.map((product, index) => (
                  <FavoriteCard
                    key={product.id}
                    product={product}
                    index={index}
                    category={categoriesById.get(product.cat)}
                    onOpen={() => openProduct(product)}
                    onRemove={() => toggleFavorite(product.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
