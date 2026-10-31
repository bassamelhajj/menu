import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { IconAlert, IconClose, IconTrash } from '../../components/icons'

export const Field = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  rows,
  step,
  min,
  max,
  disabled = false,
  hint,
}) => (
  <label className={`block ${disabled ? 'opacity-55' : ''}`}>
    {label && <span className="label-in">{label}</span>}
    {rows ? (
      <textarea
        className="field"
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      />
    ) : (
      <input
        className="field"
        type={type}
        step={step}
        min={min}
        max={max}
        value={value ?? ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
      />
    )}
    {hint && (
      <span className="mt-1.5 block text-[9.5px] font-bold leading-relaxed text-white/35">
        {hint}
      </span>
    )}
  </label>
)

export const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={!!checked}
    onClick={() => onChange(!checked)}
    className="flex items-center gap-2.5"
  >
    <span
      className={`relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300 ${
        checked
          ? 'border-gold/25 bg-gold/90 shadow-[0_0_0_3px_rgba(213,180,106,0.12),0_8px_22px_-12px_rgba(213,180,106,0.8)]'
          : 'border-white/10 bg-white/12'
      }`}
    >
      <span
        style={{
          transform: checked
            ? 'translateX(var(--toggle-travel, 1.25rem))'
            : 'translateX(0)',
        }}
        className="absolute top-0.5 start-0.5 h-5 w-5 rounded-full bg-[#fff8e7] shadow transition-transform duration-300 ease-out"
      />
    </span>
    {label && <span className="text-xs font-extrabold text-white/70">{label}</span>}
  </button>
)

export const SectionHead = ({ title, hint, action }) => (
  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
    <div>
      <h2 className="font-display text-[20px] font-semibold tracking-wide text-[#f7f1e5] sm:text-[23px]">
        {title}
      </h2>
      {hint && (
        <p className="mt-1 max-w-2xl text-[10.5px] font-semibold leading-relaxed text-white/38">
          {hint}
        </p>
      )}
    </div>
    {action}
  </div>
)

export const Card = ({ children, className = '' }) => (
  <div className={`admin-card p-4 sm:p-5 ${className}`}>{children}</div>
)

export const IconBtn = ({ children, onClick, title, danger = false, disabled = false }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    disabled={disabled}
    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-all active:scale-90 disabled:pointer-events-none disabled:opacity-35 ${
      danger
        ? 'border-red-400/20 bg-red-500/[0.07] text-red-300 hover:border-red-400/45 hover:bg-red-500/12 hover:text-red-200'
        : 'border-white/[0.08] bg-white/[0.035] text-white/48 hover:border-gold/40 hover:bg-gold/[0.07] hover:text-gold'
    }`}
  >
    {children}
  </button>
)

/* ------------------------------------------------------------------ */
/*  Glass confirmation dialog                                          */
/* ------------------------------------------------------------------ */

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel?.()
    }
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onCancel])

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="confirm-dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onCancel}
            className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ opacity: 0, y: 18, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="relative w-full max-w-[25rem] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#15100b]/95 p-5 text-[#f7f1e5] shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute -end-14 -top-14 h-40 w-40 rounded-full bg-gold/10 blur-3xl" />

            <div className="relative flex items-start gap-3.5">
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${
                  danger
                    ? 'border-red-400/25 bg-red-500/10 text-red-300'
                    : 'border-gold/25 bg-gold/10 text-gold'
                }`}
              >
                {danger ? <IconTrash size={19} /> : <IconAlert size={19} />}
              </span>

              <div className="min-w-0 flex-1">
                <h3 id="confirm-title" className="text-[15px] font-black text-[#f7f1e5]">
                  {title}
                </h3>
                {message && (
                  <p className="mt-1.5 text-[11px] font-semibold leading-relaxed text-white/45">
                    {message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onCancel}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.035] text-white/40 transition-colors hover:border-white/20 hover:text-white/70"
                aria-label="Close"
              >
                <IconClose size={14} />
              </button>
            </div>

            <div className="relative mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={onCancel} className="btn-ghost px-4 py-2.5">
                {cancelLabel}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[11px] font-black transition-all active:scale-95 ${
                  danger
                    ? 'border border-red-400/30 bg-red-500/15 text-red-200 hover:border-red-400/50 hover:bg-red-500/25'
                    : 'btn-primary'
                }`}
              >
                {danger && <IconTrash size={14} />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/** Hook سهل: const [ask, dialog] = useConfirm() ... {dialog} */
export function useConfirm() {
  const [request, setRequest] = useState(null)

  const ask = useCallback(
    (options) =>
      new Promise((resolve) => {
        setRequest({ ...options, resolve })
      }),
    [],
  )

  const finish = useCallback((approved) => {
    setRequest((current) => {
      current?.resolve?.(approved)
      return null
    })
  }, [])

  const dialog = (
    <ConfirmDialog
      open={Boolean(request)}
      title={request?.title}
      message={request?.message}
      confirmLabel={request?.confirmLabel}
      cancelLabel={request?.cancelLabel}
      danger={request?.danger ?? true}
      onConfirm={() => finish(true)}
      onCancel={() => finish(false)}
    />
  )

  return [ask, dialog]
}
