/**
 * components/SearchModal.jsx — البحث السريع
 * ===========================================================================
 * نافذة خفيفة بتفتح من أي صفحة (زر البحث أو Ctrl/⌘ + K).
 * بتدور بالعربي والإنجليزي، وبتفتح المنتج مباشرة بدون ما تطلع من الصفحة.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { useUI } from '../store/UIContext'
import { applyOffers, fmtPrice } from '../lib/format'
import {
  IconChevron,
  IconClose,
  IconSearch,
  IconSparkle,
  IconStar,
} from './icons'

const norm = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[ؤئ]/g, 'ء')

export default function SearchModal() {
  const { lang, currency, t } = useApp()
  const { activeProducts, activeCategories, usdRate, globalOffer } = useContent()
  const { searchOpen, closeSearch, openSearch, openProduct } = useUI()
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const ar = lang === 'ar'

  /* اختصار Ctrl/⌘ + K و / لفتح البحث */
  useEffect(() => {
    const onKey = (event) => {
      const tag = document.activeElement?.tagName
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable
      const shortcut =
        (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) ||
        (event.key === '/' && !typing)
      if (!shortcut) return
      event.preventDefault()
      if (!searchOpen) openSearch()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openSearch, searchOpen])

  /* قفل تمرير الصفحة + Esc + تركيز الحقل */
  useEffect(() => {
    if (!searchOpen) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const timer = window.setTimeout(() => inputRef.current?.focus(), 100)

    const onKey = (event) => {
      if (event.key === 'Escape') closeSearch()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      document.body.style.overflow = previous
      window.clearTimeout(timer)
      window.removeEventListener('keydown', onKey)
    }
  }, [searchOpen, closeSearch])

  useEffect(() => {
    if (!searchOpen) setQuery('')
  }, [searchOpen])

  const categoryName = useMemo(() => {
    const map = new Map(activeCategories.map((cat) => [cat.id, cat]))
    return (id) => {
      const cat = map.get(id)
      return cat ? (ar ? cat.ar : cat.en) : ''
    }
  }, [activeCategories, ar])

  const results = useMemo(() => {
    const q = norm(query.trim())
    if (!q) {
      const best = activeProducts.filter((product) => product.tags?.includes('best'))
      return (best.length >= 5 ? best : activeProducts).slice(0, 6)
    }
    return activeProducts
      .filter((product) =>
        norm(
          `${product.ar} ${product.en} ${product.descAr} ${product.descEn} ${categoryName(product.cat)}`,
        ).includes(q),
      )
      .slice(0, 9)
  }, [activeProducts, categoryName, query])

  const handlePick = (product) => {
    closeSearch()
    setQuery('')
    openProduct(product)
  }

  return createPortal(
    <AnimatePresence>
      {searchOpen && (
        <div className="fixed inset-0 z-[120] flex items-start justify-center px-3 pt-[calc(env(safe-area-inset-top)+0.9rem)] sm:items-center sm:px-5 sm:pt-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSearch}
            className="absolute inset-0 bg-cocoa/70 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: -18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label={ar ? 'البحث في المنيو' : 'Search the menu'}
            className="relative flex max-h-[86vh] w-full max-w-xl flex-col overflow-hidden rounded-[28px] border border-line bg-bg shadow-[0_35px_90px_-30px_rgba(15,23,16,0.7)] sm:max-h-[80vh]"
          >
            {/* رأس البحث */}
            <div className="relative shrink-0 border-b border-line/70 bg-surface/70 p-3 sm:p-4">
              <div className="pointer-events-none absolute -top-20 start-1/4 h-32 w-32 rounded-full bg-gold/20 blur-3xl" />
              <div className="relative flex items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-line bg-bg/80 px-3.5 focus-within:border-gold focus-within:ring-4 focus-within:ring-gold/12">
                  <span className="shrink-0 text-gold-deep">
                    <IconSearch size={18} />
                  </span>
                  <input
                    ref={inputRef}
                    type="search"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t('searchPh')}
                    className="w-full bg-transparent py-3.5 text-[13px] font-semibold text-ink outline-none placeholder:font-medium placeholder:text-muted/80 sm:text-sm"
                  />
                  {query && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('')
                        inputRef.current?.focus()
                      }}
                      aria-label={t('clear')}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-panel hover:text-ink"
                    >
                      <IconClose size={14} />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label={t('close')}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-line bg-surface text-ink transition-colors hover:border-gold/60 hover:text-primary active:scale-95"
                >
                  <IconClose size={18} />
                </button>
              </div>
              <div className="relative mt-2 flex items-center justify-between gap-3 px-1">
                <span className="text-[10px] font-extrabold tracking-wide text-muted">
                  {query
                    ? ar
                      ? `${results.length} نتيجة`
                      : `${results.length} result${results.length === 1 ? '' : 's'}`
                    : ar
                      ? 'ابحث بالاسم أو المكوّن…'
                      : 'Search by name or ingredient…'}
                </span>
                <span className="hidden items-center gap-1 text-[9px] font-bold text-muted/70 sm:flex">
                  <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5">Ctrl</kbd>
                  <span>+</span>
                  <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5">K</kbd>
                </span>
              </div>
            </div>

            {/* النتائج */}
            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-2.5 sm:p-3">
              {!query && (
                <div className="mb-1 flex items-center gap-2 px-2 pb-1.5 pt-1">
                  <span className="text-gold-deep">
                    <IconSparkle size={13} />
                  </span>
                  <span className="text-[9px] font-black tracking-[0.22em] text-gold-deep uppercase">
                    {ar ? 'الأكثر طلباً' : 'Popular right now'}
                  </span>
                  <span className="h-px flex-1 bg-gradient-to-r from-gold/40 to-transparent" />
                </div>
              )}

              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-3xl bg-panel text-2xl text-muted">
                    🔍
                  </span>
                  <p className="mt-4 text-sm font-black text-ink">{t('noResults')}</p>
                  <p className="mt-1 max-w-xs text-[11px] leading-relaxed text-muted">
                    {ar
                      ? 'جرّب كلمة أبسط أو ابحث بالفرنسي/الإنجليزي.'
                      : 'Try a simpler word or search in Arabic/English.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((product, index) => {
                    const base = applyOffers(
                      product.sizes[0]?.priceLL || 0,
                      product.offer,
                      globalOffer,
                    )
                    return (
                      <motion.button
                        key={product.id}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.025, 0.15) }}
                        onClick={() => handlePick(product)}
                        className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-2.5 py-2.5 text-start transition-colors hover:border-line hover:bg-surface"
                      >
                        <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-panel text-[25px] shadow-inner">
                          <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(192,154,78,0.28),transparent_70%)]" />
                          <span className="relative">{product.emoji}</span>
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-[13px] font-extrabold text-ink">
                              {ar ? product.ar : product.en}
                            </span>
                            {product.tags?.includes('best') && (
                              <span className="shrink-0 text-gold">
                                <IconStar size={10} />
                              </span>
                            )}
                          </span>
                          <span className="mt-0.5 block truncate text-[10px] font-semibold text-muted">
                            {categoryName(product.cat)}
                            {product.sizes.length > 1
                              ? ` · ${ar ? 'أحجام متعددة' : 'multiple sizes'}`
                              : ''}
                          </span>
                        </span>

                        <span className="shrink-0 text-end">
                          <span className="block text-[12px] font-black text-gold-deep">
                            {fmtPrice(base, currency, usdRate)}
                          </span>
                          <span className="mt-0.5 flex items-center justify-end gap-0.5 text-[9px] font-bold text-muted/80">
                            {ar ? 'عرض' : 'View'}
                            <IconChevron size={10} />
                          </span>
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line/70 px-4 py-2.5 text-[9px] font-bold text-muted/75">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {ar ? 'الأسعار محدّثة من لوحة التحكم' : 'Prices synced from the dashboard'}
              </span>
              <span className="hidden sm:inline">Esc {ar ? 'للإغلاق' : 'to close'}</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
