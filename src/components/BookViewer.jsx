import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { downloadMenuPdf } from '../lib/pdf'
import { IconChevron, IconClose, IconDownload } from './icons'

const RATIO = 905 / 1280 // section image ratio

const turnVariants = {
  enter: (d) => ({
    rotateY: d > 0 ? -112 : 112,
    opacity: 0.35,
    x: d > 0 ? -46 : 46,
    zIndex: 8,
  }),
  center: { rotateY: 0, opacity: 1, x: 0, zIndex: 12 },
  exit: (d) => ({
    rotateY: d > 0 ? 112 : -112,
    opacity: 0.15,
    x: d > 0 ? 46 : -46,
    zIndex: 6,
  }),
}

export default function BookViewer({ startIndex = 0, onClose }) {
  const { lang, t } = useApp()
  const { gallery } = useContent()
  const [page, setPage] = useState(startIndex)
  const [dir, setDir] = useState(1)
  const total = gallery.length

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // ⬇️ التحميل صار بزر فقط — لا تحميل تلقائي عند فتح الكتاب

  const turn = (d) => {
    setDir(d)
    setPage((p) => (p + d + total) % total)
  }

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') turn(1)
      else if (e.key === 'ArrowLeft') turn(-1)
      else if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total])

  const label = lang === 'ar' ? 'أقسام المنيو' : 'Menu sections'

  return (
    <div
      className="fixed inset-0 z-[70] flex flex-col bg-cocoa/95 backdrop-blur-sm"
      dir="ltr"
    >
      {/* top bar */}
      <div className="flex shrink-0 items-center justify-between px-3 py-3 sm:px-5">
        <button
          type="button"
          aria-label={t('close')}
          onClick={onClose}
          className="grid h-11 w-11 place-items-center rounded-full border border-cream/25 bg-cream/10 text-cream transition active:scale-90"
        >
          <IconClose size={19} />
        </button>

        <div className="text-center">
          <p className="text-[11px] font-extrabold tracking-[0.28em] text-gold">
            BENOVA
          </p>
          <p className="mt-0.5 text-[10px] font-bold text-cream/70">{label}</p>
        </div>

        <button
          type="button"
          onClick={() => downloadMenuPdf()}
          className="inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/15 px-3.5 py-2 text-[11px] font-black text-gold transition hover:bg-gold/25 active:scale-95"
        >
          <IconDownload size={16} />
          <span>{lang === 'ar' ? 'تحميل PDF' : 'Download PDF'}</span>
        </button>
      </div>

      {/* book stage */}
      <div className="flex min-h-0 flex-1 items-center justify-center gap-2 px-2 pb-10">
        <button
          type="button"
          aria-label="prev"
          onClick={() => turn(-1)}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-cream/20 bg-cream/10 text-cream transition active:scale-90"
        >
          <span className="rotate-90">
            <IconChevron size={22} />
          </span>
        </button>

        <div
          className="relative"
          style={{
            width: 'min(88vw, 50.9vh)',
            aspectRatio: `${RATIO}`,
            perspective: 1800,
          }}
        >
          {/* spine shadow */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[7%] bg-gradient-to-r from-black/50 to-transparent" />

          <AnimatePresence custom={dir} mode="popLayout">
            <motion.div
              key={page}
              custom={dir}
              variants={turnVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: [0.45, 0, 0.2, 1] }}
              className="absolute inset-0"
              style={{
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* paper page */}
              <div className="h-full w-full rounded-r-[14px] bg-[#f6efdd] p-2 shadow-[0_22px_60px_rgba(0,0,0,0.5)] sm:p-3">
                <div className="relative h-full w-full overflow-hidden rounded-r-[8px] border border-[#e5dcc3]">
                  <img
                    src={gallery[page].src}
                    alt={gallery[page].en}
                    className="h-full w-full object-cover"
                    draggable={false}
                  />
                  {/* page number on the right edge, like a book */}
                  <span className="absolute bottom-2.5 right-3 rounded-full bg-cocoa/55 px-2.5 py-1 text-[10px] font-black text-cream backdrop-blur">
                    {page + 1} / {total}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          aria-label="next"
          onClick={() => turn(1)}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-cream/20 bg-cream/10 text-cream transition active:scale-90"
        >
          <span className="-rotate-90">
            <IconChevron size={22} />
          </span>
        </button>
      </div>

      {/* page dots */}
      <div className="absolute inset-x-0 bottom-4 flex justify-center gap-2">
        {gallery.map((g, i) => (
          <button
            key={g.id}
            type="button"
            aria-label={g.en}
            onClick={() => {
              setDir(i > page ? 1 : -1)
              setPage(i)
            }}
            className={`h-2.5 rounded-full transition-all ${
              i === page ? 'w-7 bg-gold' : 'w-2.5 bg-cream/30 hover:bg-cream/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}