/**
 * components/ScrollJump.jsx — تحكّم عائم للقفز أعلى/أسفل الصفحة
 * ===========================================================================
 * • كبسولة زجاجية أنيقة بزاوية الشاشة (بتنعكس تلقائياً بالعربي RTL)
 * • «الاتصال والأرقام» بتوصل مباشرة لقسم الفوتر/التواصل
 * • «أعلى الصفحة» بترجّع المستخدم للهيدر بسلاسة
 * • بتختفي أزرارها تلقائياً لما تكون أصلاً بالبداية أو النهاية
 * • فوق شريط التنقل السفلي على الموبايل، وبدون تغطية المودالات
 */
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { IconChevron } from './icons'

const getScrollBehavior = () =>
  typeof document !== 'undefined' &&
  (document.visibilityState === 'hidden' ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    ? 'instant'
    : 'smooth'

export default function ScrollJump() {
  const { lang } = useApp()
  const ar = lang === 'ar'
  const [atTop, setAtTop] = useState(true)
  const [atFooter, setAtFooter] = useState(false)

  useEffect(() => {
    const update = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0
      const footer = document.getElementById('site-footer')
      const footerTop = footer ? footer.getBoundingClientRect().top : Infinity
      setAtTop(y < 24)
      setAtFooter(footerTop <= window.innerHeight * 0.45)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const jumpToTop = () => {
    window.scrollTo({ top: 0, behavior: getScrollBehavior() })
  }

  const jumpToFooter = () => {
    const footer = document.getElementById('site-footer')
    if (!footer) {
      window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: getScrollBehavior(),
      })
      return
    }
    footer.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' })
  }

  const buttonClass =
    'group flex h-9 items-center gap-2 rounded-xl px-2 text-[10px] font-black text-ink/80 transition-colors duration-200 hover:bg-gold/10 hover:text-gold-deep disabled:pointer-events-none disabled:opacity-30 dark:text-cream/80 dark:hover:text-gold'
  const iconClass =
    'grid h-6 w-6 shrink-0 place-items-center rounded-full border border-gold/30 bg-gold/10 text-gold-deep transition-transform duration-300 dark:border-gold/25 dark:text-gold'

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      role="group"
      aria-label={ar ? 'التنقل السريع داخل الصفحة' : 'Quick page navigation'}
      className="fixed bottom-[calc(6rem_+_env(safe-area-inset-bottom))] end-3 z-30 flex items-center gap-0.5 rounded-2xl border border-line/70 bg-surface/80 p-1 shadow-[0_20px_48px_-24px_rgba(22,33,26,0.6)] backdrop-blur-2xl lg:bottom-6 lg:end-6 dark:border-white/10 dark:bg-[#131c12]/85 dark:shadow-[0_24px_60px_-22px_rgba(0,0,0,0.9)]"
    >
      <motion.button
        type="button"
        onClick={jumpToFooter}
        disabled={atFooter}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={
          ar
            ? 'الاتصال والأرقام — الانتقال إلى أسفل الصفحة'
            : 'Contact and numbers — jump to the bottom'
        }
        title={ar ? 'الاتصال والأرقام' : 'Contact & numbers'}
        className={buttonClass}
      >
        <span className={`${iconClass} group-hover:translate-y-0.5`}>
          <IconChevron size={12} />
        </span>
        <span className="hidden whitespace-nowrap sm:inline">
          {ar ? 'الاتصال والأرقام' : 'Contact & numbers'}
        </span>
      </motion.button>

      <span
        aria-hidden
        className="h-5 w-px shrink-0 bg-line/80 dark:bg-white/10"
      />

      <motion.button
        type="button"
        onClick={jumpToTop}
        disabled={atTop}
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.95 }}
        aria-label={ar ? 'أعلى الصفحة' : 'Back to top'}
        title={ar ? 'أعلى الصفحة' : 'Back to top'}
        className={buttonClass}
      >
        <span className={`${iconClass} group-hover:-translate-y-0.5`}>
          <span className="rotate-180">
            <IconChevron size={12} />
          </span>
        </span>
        <span className="hidden whitespace-nowrap sm:inline">
          {ar ? 'أعلى الصفحة' : 'Back to top'}
        </span>
      </motion.button>
    </motion.div>
  )
}
