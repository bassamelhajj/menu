import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppContext'

export default function Toast() {
  const { toast } = useApp()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="pointer-events-auto max-w-[90vw] rounded-full border border-gold/40 bg-cocoa/95 px-5 py-3 text-center text-sm font-extrabold text-cream shadow-xl backdrop-blur"
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
