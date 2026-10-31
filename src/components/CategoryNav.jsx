/**
 * components/CategoryNav.jsx — شريط الأقسام الثانوي
 * ===========================================================================
 * • لاصق مباشرة تحت الهيدر (بيعتمد على --site-header-h المقاس من الهيدر)
 * • سكرول أفقي ناعم بدون scrollbar ظاهر — سحب بالإصبع على الموبايل
 * • سطح المكتب: سحب بالماوس + تحويل عجلة الماوس لسكرول أفقي
 * • أسهم زجاجية ذكية على الأطراف (تظهر عند وجود محتوى مخفي)
 * • Pill active بتوضيح قوي + انتقالات ناعمة
 * • عند تغيّر القسم النشط، البطاقة بتمركز حالها بالوسط تلقائياً
 */
import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { IconChevron } from './icons'

export default function CategoryNav({ categories, active, onChange }) {
  const { lang, t } = useApp()
  const scrollerRef = useRef(null)
  const barRef = useRef(null)
  const pillsRef = useRef(new Map())
  const dragRef = useRef({ active: false, moved: false, startX: 0, startScroll: 0 })
  const suppressClickRef = useRef(false)
  const scrollRafRef = useRef(0)
  const [dragging, setDragging] = useState(false)
  const [edges, setEdges] = useState({ left: false, right: false, overflow: false })

  const ar = lang === 'ar'

  /* كروم بيتجاهل smooth scroll مع القيم السالبة بـ RTL — منحرّكها يدوياً */
  const cancelScrollAnimation = () => {
    if (scrollRafRef.current) {
      window.cancelAnimationFrame(scrollRafRef.current)
      scrollRafRef.current = 0
    }
  }

  const animateScrollLeft = (el, target) => {
    cancelScrollAnimation()
    const from = el.scrollLeft
    const delta = target - from
    if (Math.abs(delta) < 1) return

    if (
      document.visibilityState === 'hidden' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      el.scrollLeft = target
      return
    }

    const duration = Math.min(520, Math.max(260, Math.abs(delta) * 0.45))
    const startedAt = window.performance.now()
    const easeOutCubic = (t) => 1 - (1 - t) ** 3

    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration)
      el.scrollLeft = from + delta * easeOutCubic(progress)
      if (progress < 1) {
        scrollRafRef.current = window.requestAnimationFrame(step)
      } else {
        scrollRafRef.current = 0
      }
    }

    scrollRafRef.current = window.requestAnimationFrame(step)
  }

  useEffect(() => cancelScrollAnimation, [])

  /* تخزين ارتفاع شريط الأقسام لاستخدامه بـ scroll-margin */
  useEffect(() => {
    const el = barRef.current
    if (!el) return undefined
    const sync = () => {
      document.documentElement.style.setProperty(
        '--category-nav-h',
        `${el.offsetHeight}px`,
      )
    }
    sync()
    const observer = new ResizeObserver(sync)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  /* توسيط القسم النشط داخل الشريط */
  useEffect(() => {
    if (!active) return
    const scroller = scrollerRef.current
    const pill = pillsRef.current.get(active)
    if (!scroller || !pill) return

    const box = scroller.getBoundingClientRect()
    const target = pill.getBoundingClientRect()
    const delta = target.left + target.width / 2 - (box.left + box.width / 2)

    if (Math.abs(delta) > 3) {
      animateScrollLeft(scroller, scroller.scrollLeft + delta)
    }
  }, [active, lang])

  /* تتبّع حالة الأطراف لتشغيل/تعطيل الأسهم */
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return undefined

    const update = () => {
      const max = Math.max(0, el.scrollWidth - el.clientWidth)
      const pos = Math.min(Math.max(Math.abs(el.scrollLeft), 0), max)
      const overflow = max > 4
      /* في RTL: البداية على اليمين والنهاية على اليسار */
      const left = overflow && (ar ? pos < max - 2 : pos > 2)
      const right = overflow && (ar ? pos > 2 : pos < max - 2)
      setEdges((previous) =>
        previous.left === left && previous.right === right && previous.overflow === overflow
          ? previous
          : { left, right, overflow },
      )
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(el)
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [ar, categories.length])

  /* تحويل عجلة الماوس العمودية إلى سكرول أفقي */
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return undefined

    const onWheel = (event) => {
      if (event.ctrlKey) return
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return
      const max = Math.max(0, el.scrollWidth - el.clientWidth)
      if (max <= 4) return

      const forward = event.deltaY > 0
      const position = Math.abs(el.scrollLeft)
      /* عند نهاية الشريط نسمح للصفحة تكمل سكرول عادي بدل ما نحبسها */
      if ((forward && position >= max - 2) || (!forward && position <= 2)) return

      event.preventDefault()
      cancelScrollAnimation()
      const unit =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? el.clientWidth
            : 1
      /* عجلة للأسفل = تقدّم باتجاه نهاية القراءة (يمين LTR / يسار RTL) */
      el.scrollLeft += (ar ? -1 : 1) * event.deltaY * unit
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [ar])

  /* سحب أفقي بالماوس */
  const onPointerDown = (event) => {
    if (event.pointerType !== 'mouse' || event.button !== 0) return
    const el = scrollerRef.current
    if (!el || el.scrollWidth <= el.clientWidth + 4) return

    cancelScrollAnimation()
    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScroll: el.scrollLeft,
    }
    suppressClickRef.current = false
  }

  const onPointerMove = (event) => {
    const el = scrollerRef.current
    if (!el || !dragRef.current.active) return

    /* إذا انفكّ الزر خارج الشريط، منوقف السحب فوراً */
    if ((event.buttons & 1) === 0) {
      dragRef.current.active = false
      setDragging(false)
      return
    }

    const delta = event.clientX - dragRef.current.startX
    if (!dragRef.current.moved) {
      if (Math.abs(delta) < 5) return
      dragRef.current.moved = true
      setDragging(true)
      /* نمسك المؤشر بس بعد ما يتأكد السحب — حتى الكليك العادي يضل شغال */
      try {
        el.setPointerCapture?.(event.pointerId)
      } catch {
        /* ignore */
      }
    }
    el.scrollLeft = dragRef.current.startScroll - delta
  }

  const endDrag = (event) => {
    const el = scrollerRef.current
    if (!el || !dragRef.current.active) return

    const moved = dragRef.current.moved
    if (moved) {
      suppressClickRef.current = true
      window.setTimeout(() => {
        suppressClickRef.current = false
      }, 180)
    }

    dragRef.current.active = false
    setDragging(false)
    if (moved && event?.pointerId !== undefined) {
      try {
        el.releasePointerCapture(event.pointerId)
      } catch {
        /* ignore */
      }
    }
  }

  /* قفزة واحدة لنهاية الشريط بالاتجاه المطلوب */
  const jumpToEdge = (direction) => {
    const el = scrollerRef.current
    if (!el) return
    const max = Math.max(0, el.scrollWidth - el.clientWidth)
    const target = direction < 0
      ? ar
        ? -max
        : 0
      : ar
        ? 0
        : max
    animateScrollLeft(el, target)
  }

  if (!categories.length) return null

  const arrowClass =
    'absolute top-1/2 z-20 hidden h-8 w-8 -translate-y-1/2 place-items-center rounded-full border border-line/60 bg-surface/75 text-ink shadow-[0_10px_26px_-14px_rgba(22,33,26,0.55)] backdrop-blur-xl transition-all duration-200 hover:border-gold/60 hover:text-gold-deep disabled:pointer-events-none lg:grid dark:border-white/10 dark:bg-white/[0.06] dark:text-cream/80 dark:hover:border-gold/40 dark:hover:text-gold'

  return (
    <div
      id="category-nav"
      ref={barRef}
      className="sticky z-40 border-b border-line/70 bg-surface/78 shadow-[0_14px_30px_-28px_rgba(22,33,26,0.55)] backdrop-blur-2xl"
      style={{ top: 'var(--site-header-h, 4rem)' }}
    >
      <div className="relative mx-auto max-w-7xl">
        {/* ─── سكرول أفقي: سحب + عجلة + أسهم ─── */}
        <div
          ref={scrollerRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDragStart={(event) => event.preventDefault()}
          onClickCapture={(event) => {
            if (!suppressClickRef.current) return
            event.preventDefault()
            event.stopPropagation()
            suppressClickRef.current = false
          }}
          className={`no-scrollbar flex select-none items-center gap-2 overflow-x-auto overscroll-x-contain px-3 py-2 sm:px-5 sm:py-2.5 lg:px-12 ${
            dragging
              ? 'cursor-grabbing snap-none'
              : 'snap-x snap-proximity md:cursor-grab'
          }`}
        >
          <span className="me-1 hidden shrink-0 items-center gap-1.5 text-[9px] font-black tracking-[0.18em] text-muted/80 uppercase md:flex">
            <span className="h-1 w-1 rounded-full bg-gold" />
            {t('sections')}
          </span>

          {categories.map((cat) => {
            const isActive = active === cat.id
            return (
              <motion.button
                key={cat.id}
                ref={(node) => {
                  if (node) pillsRef.current.set(cat.id, node)
                  else pillsRef.current.delete(cat.id)
                }}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => onChange(cat.id)}
                aria-current={isActive ? 'true' : undefined}
                className={`group flex min-h-9 shrink-0 snap-center items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11.5px] font-extrabold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-300 sm:min-h-10 sm:gap-2 sm:px-4 sm:text-[12.5px] ${
                  isActive
                    ? 'border-transparent primary-bg text-cream shadow-[0_10px_24px_-12px_var(--glow)]'
                    : 'border-line/80 bg-surface/70 text-ink hover:-translate-y-0.5 hover:border-gold/55 hover:bg-surface'
                }`}
              >
                <span
                  className={`text-[15px] leading-none transition-transform duration-300 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  }`}
                >
                  {cat.icon}
                </span>
                <span>{lang === 'ar' ? cat.ar : cat.en}</span>
                {isActive && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ms-0.5 h-1.5 w-1.5 rounded-full bg-gold"
                  />
                )}
              </motion.button>
            )
          })}
        </div>

        {/* ─── تلاشي الأطراف على الموبايل ─── */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-5 bg-gradient-to-r from-surface via-surface/80 to-transparent sm:hidden"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 right-0 w-5 bg-gradient-to-l from-surface via-surface/80 to-transparent sm:hidden"
        />

        {/* ─── تلاشي زجاجي خفيف خلف الأسهم على الديسكتوب ─── */}
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 hidden w-14 bg-gradient-to-r from-surface via-surface/85 to-transparent transition-opacity duration-300 lg:block ${
            edges.left ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <span
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 hidden w-14 bg-gradient-to-l from-surface via-surface/85 to-transparent transition-opacity duration-300 lg:block ${
            edges.right ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* ─── أسهم الزجاج ─── */}
        <button
          type="button"
          onClick={() => jumpToEdge(-1)}
          disabled={!edges.left}
          aria-label={
            ar ? 'القفز إلى نهاية الأقسام' : 'Jump to the start of categories'
          }
          title={ar ? 'نهاية الأقسام' : 'Start of categories'}
          className={`${arrowClass} left-2 ${edges.left ? 'opacity-100' : 'opacity-0'}`}
        >
          <span className="rotate-90">
            <IconChevron size={14} />
          </span>
        </button>

        <button
          type="button"
          onClick={() => jumpToEdge(1)}
          disabled={!edges.right}
          aria-label={
            ar ? 'القفز إلى بداية الأقسام' : 'Jump to the end of categories'
          }
          title={ar ? 'بداية الأقسام' : 'End of categories'}
          className={`${arrowClass} right-2 ${edges.right ? 'opacity-100' : 'opacity-0'}`}
        >
          <span className="-rotate-90">
            <IconChevron size={14} />
          </span>
        </button>
      </div>
    </div>
  )
}
