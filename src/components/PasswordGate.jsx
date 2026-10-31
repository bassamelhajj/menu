import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { verifySecret } from '../lib/auth'
import { SITE_PASSWORD_HASH, isSiteLockEnabled } from '../lib/env'
import { IconEye, IconSparkle } from './icons'

/**
 * Optional storefront lock. The password itself is never bundled: only its
 * SHA-256 hash arrives through VITE_SITE_PASSWORD_SHA256. Unlocking lasts for
 * the browser tab via sessionStorage.
 */
const UNLOCK_KEY = 'benova:unlocked'

export default function PasswordGate({ children }) {
  const { lang } = useApp()
  const { settings } = useContent()

  const [unlocked, setUnlocked] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem(UNLOCK_KEY) === '1',
  )
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [shakeKey, setShakeKey] = useState(0)
  const inputRef = useRef(null)

  const enabled = isSiteLockEnabled

  useEffect(() => {
    if (unlocked) return
    inputRef.current?.focus()
  }, [unlocked])

  // منع تمرير الصفحة خلف القفل
  useEffect(() => {
    if (!enabled || unlocked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [enabled, unlocked])

  const submit = async (e) => {
    e.preventDefault()
    if (await verifySecret(value, SITE_PASSWORD_HASH)) {
      sessionStorage.setItem(UNLOCK_KEY, '1')
      setUnlocked(true)
      return
    }
    // كلمة سر غلط: اهتزاز + خطأ
    setError(true)
    setValue('')
    setShakeKey((key) => key + 1)
    inputRef.current?.focus()
    setTimeout(() => setError(false), 1600)
  }

  // بدون كلمة سر مضبوطة (enabled=false) نعرض الموقع مباشرة.
  if (!enabled || unlocked) return children

  const ar = lang === 'ar'

  return (
    <motion.div
      key={shakeKey}
      animate={error ? { x: [0, -10, 10, -8, 8, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-cocoa px-6"
    >
      {/* توهّج خلفي */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-gold/25 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-72 w-72 rounded-full bg-primary/20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-sm text-center"
      >
        {/* الشعار */}
        <img
          src={settings.logo || '/brand/benova-logo.png'}
          alt={settings.name?.en || 'BENOVA'}
          className="mx-auto h-20 w-auto object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.5)]"
        />

        <h1 className="mt-5 font-display text-2xl tracking-wide text-cream">
          {ar ? 'المطعم مقفل' : 'Locked'}
        </h1>
        <p className="mt-1.5 text-xs font-bold text-cream/60">
          {ar ? 'اكتب كلمة السر لتدخل' : 'Enter the password to continue'}
        </p>

        <form onSubmit={submit} className="mt-7">
          <div className="relative">
            <input
              ref={inputRef}
              type="password"
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError(false)
              }}
              placeholder={ar ? 'كلمة السر…' : 'Password…'}
              autoComplete="current-password"
              className={`w-full rounded-2xl border bg-cream/10 px-5 py-4 text-center text-base font-black tracking-widest text-cream outline-none transition-all placeholder:font-bold placeholder:tracking-normal placeholder:text-cream/35 ${
                error
                  ? 'border-red-400/80 bg-red-500/10'
                  : 'border-cream/25 focus:border-gold focus:bg-cream/15'
              }`}
            />
          </div>

          <motion.button
            type="submit"
            whileTap={{ scale: 0.96 }}
            disabled={!value}
            className="mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-black text-cocoa shadow-[0_12px_28px_-10px_rgba(192,154,78,0.9)] transition-opacity disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #eac96f 0%, #c39a4e 100%)' }}
          >
            <IconEye size={17} />
            {ar ? 'دخول' : 'Enter'}
          </motion.button>
        </form>

        {/* رسالة الخطأ */}
        <div className="h-6 pt-2">
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 text-[11px] font-black text-red-300"
            >
              <IconSparkle size={12} />
              {ar ? 'كلمة السر غلط' : 'Wrong password'}
            </motion.p>
          )}
        </div>

        <p className="pt-2 text-[10px] font-bold text-cream/30">
          BENOVA · {ar ? 'كريب وعصائر' : 'Crepes & Juices'}
        </p>
      </motion.div>
    </motion.div>
  )
}