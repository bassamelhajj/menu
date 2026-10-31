/**
 * components/auth/AuthUI.jsx — مكوّنات واجهة المصادقة المشتركة
 * ===========================================================================
 * نفس العناصر بتُستخدم بصفحة المصادقة الموحّدة للزبون وصاحب المحل:
 *   • AuthTabs          تبويب تسجيل دخول / حساب جديد (مؤشّر منزلق)
 *   • AuthField         حقل إدخال مع أيقونة + إظهار/إخفاء كلمة السر + أخطاء
 *   • PasswordMeter     مقياس قوة كلمة السر
 *   • AuthAlert         رسالة خطأ/نجاح ناعمة
 *   • SubmitButton      زر رئيسي بحالة تحميل
 *
 * 🎨 عناصر واحدة للثيمين:
 *   tone="light"  → أسطح كريمية وحدود ناعمة
 *   tone="dark"   → أسطح زجاجية غامقة داخل الوضع الداكن
 *   اللمسة الذهبية والزر الأساسي ثابتين للحفاظ على هوية الأدمن الفخمة.
 */
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { IconAlert, IconCheck, IconEye, IconEyeOff } from '../icons'

/* ==================================================================== */
/*  تبويب تسجيل الدخول / حساب جديد                                       */
/* ==================================================================== */
export function AuthTabs({ mode, onChange, ar, tone = 'light' }) {
  const dark = tone === 'dark'
  const tabs = [
    { id: 'signIn', ar: 'تسجيل دخول', en: 'Sign in' },
    { id: 'signUp', ar: 'حساب جديد', en: 'Sign up' },
  ]

  return (
    <div
      role="tablist"
      aria-label={ar ? 'اختر نوع الدخول' : 'Choose auth mode'}
      className={`grid grid-cols-2 gap-1 rounded-2xl p-1 ${
        dark ? 'bg-white/[0.06]' : 'bg-panel'
      }`}
    >
      {tabs.map((tab) => {
        const activeTab = mode === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab}
            onClick={() => onChange(tab.id)}
            className={`relative rounded-xl px-3 py-2.5 text-[12.5px] font-black transition-colors ${
              activeTab
                ? dark
                  ? 'text-[#241708]'
                  : 'text-cream'
                : dark
                  ? 'text-white/50 hover:text-white/80'
                  : 'text-muted hover:text-ink'
            }`}
          >
            {activeTab && (
              <motion.span
                layoutId={`auth-tab-${tone}`}
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-xl gold-bg shadow-md"
              />
            )}
            <span className="relative z-10">{ar ? tab.ar : tab.en}</span>
          </button>
        )
      })}
    </div>
  )
}

/* ==================================================================== */
/*  حقل إدخال                                                            */
/* ==================================================================== */
export function AuthField({
  id,
  label,
  icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  success,
  ltr = false,
  tone = 'light',
  autoComplete,
  inputMode,
  autoFocus,
  maxLength,
  name,
  onBlur,
  onKeyUp,
}) {
  const [show, setShow] = useState(false)
  const dark = tone === 'dark'
  const isPassword = type === 'password'
  const inputType = isPassword && show ? 'text' : type

  const base = `peer w-full rounded-2xl border py-3.5 text-[14px] font-semibold shadow-sm outline-none transition-all duration-200 ${
    icon ? 'ps-11' : 'ps-4'
  } ${isPassword ? 'pe-12' : 'pe-4'}`

  const toneCls = dark
    ? 'bg-white/[0.055] text-cream placeholder:font-medium placeholder:text-white/25 hover:border-white/20'
    : 'bg-surface text-ink placeholder:font-medium placeholder:text-muted/50 hover:border-gold/40'

  const borderCls = error
    ? 'border-red-400/70 focus:border-red-400 focus:ring-4 focus:ring-red-400/10'
    : success
      ? 'border-primary/40 focus:border-primary/60 focus:ring-4 focus:ring-primary/10'
      : dark
        ? 'border-white/10 focus:border-gold/60 focus:ring-4 focus:ring-gold/10'
        : 'border-line focus:border-gold/70 focus:ring-4 focus:ring-gold/10'

  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div>
      <label
        htmlFor={id}
        className={`mb-1.5 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${
          dark ? 'text-white/40' : 'text-muted'
        }`}
      >
        {label}
      </label>

      <div className="relative" dir={ltr ? 'ltr' : undefined}>
        {icon && (
          <span
            className={`pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 transition-colors ${
              error ? 'text-red-400' : dark ? 'text-white/30' : 'text-muted/60'
            }`}
          >
            {icon}
          </span>
        )}

        <input
          id={id}
          name={name || id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyUp={onKeyUp}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          autoFocus={autoFocus}
          maxLength={maxLength}
          dir={ltr ? 'ltr' : undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy}
          className={`${base} ${toneCls} ${borderCls}`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={
              show
                ? 'إخفاء كلمة السر / Hide password'
                : 'إظهار كلمة السر / Show password'
            }
            aria-pressed={show}
            className={`absolute end-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg transition-colors ${
              dark
                ? 'text-white/35 hover:bg-white/10 hover:text-gold'
                : 'text-muted/70 hover:bg-panel hover:text-gold-deep'
            }`}
          >
            {show ? <IconEyeOff size={17} /> : <IconEye size={17} />}
          </button>
        )}

        {!isPassword && success && !error && (
          <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-primary">
            <IconCheck size={16} />
          </span>
        )}
      </div>

      <AnimatePresence initial={false}>
        {(error || hint) && (
          <motion.p
            key={error || hint}
            id={describedBy}
            role={error ? 'alert' : undefined}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`mt-1.5 overflow-hidden text-[11px] font-bold leading-relaxed ${
              error
                ? dark
                  ? 'text-red-300'
                  : 'text-red-500'
                : dark
                  ? 'text-white/35'
                  : 'text-muted/75'
            }`}
          >
            {error ? (
              <span className="inline-flex items-center gap-1.5">
                <IconAlert size={12} />
                {error}
              </span>
            ) : (
              hint
            )}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ==================================================================== */
/*  مقياس قوة كلمة السر                                                  */
/* ==================================================================== */
export function PasswordMeter({ value, ar }) {
  if (!value) return null

  const score = Math.min(
    4,
    [
      value.length >= 4,
      value.length >= 8,
      /[a-z]/.test(value) && /[A-Z]/.test(value),
      /\d/.test(value) || /[^A-Za-z0-9]/.test(value),
    ].filter(Boolean).length,
  )

  const labels = ar
    ? ['', 'ضعيفة', 'مقبولة', 'قوية', 'ممتازة']
    : ['', 'Weak', 'Fair', 'Strong', 'Excellent']

  const colors = ['', 'bg-red-400', 'bg-amber-400', 'bg-gold', 'bg-primary']

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              n <= score ? colors[score] : 'bg-line/70'
            }`}
          />
        ))}
      </div>
      <p className="mt-1 text-[10px] font-bold text-muted/70">
        {ar ? 'قوة كلمة السر: ' : 'Password strength: '}
        <span
          className={
            score <= 1
              ? 'text-red-500'
              : score === 2
                ? 'text-amber-500'
                : score === 3
                  ? 'text-gold-deep'
                  : 'text-primary'
          }
        >
          {labels[score]}
        </span>
      </p>
    </div>
  )
}

/* ==================================================================== */
/*  رسالة خطأ / نجاح                                                     */
/* ==================================================================== */
export function AuthAlert({ tone = 'error', dark = false, children }) {
  const isError = tone === 'error'
  const isSuccess = tone === 'success'

  const cls = dark
    ? isError
      ? 'border-red-400/25 bg-red-500/10 text-red-300'
      : isSuccess
        ? 'border-primary/35 bg-primary/15 text-cream'
        : 'border-gold/25 bg-gold/10 text-gold'
    : isError
      ? 'border-red-300/60 bg-red-500/[0.07] text-red-600 dark:border-red-400/30 dark:text-red-300'
      : isSuccess
        ? 'border-primary/25 bg-primary/8 text-primary'
        : 'border-gold/30 bg-gold/8 text-gold-deep'

  return (
    <motion.div
      role="alert"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className={`flex items-start gap-2 rounded-2xl border px-3.5 py-3 text-[11.5px] font-bold leading-relaxed ${cls}`}
    >
      <span className="mt-0.5 shrink-0">
        {isSuccess ? <IconCheck size={14} /> : <IconAlert size={14} />}
      </span>
      <span>{children}</span>
    </motion.div>
  )
}

/* ==================================================================== */
/*  زر الإرسال                                                           */
/* ==================================================================== */
export function SubmitButton({ busy = false, disabled = false, busyText, children }) {
  return (
    <motion.button
      type="submit"
      whileHover={busy || disabled ? undefined : { y: -1 }}
      whileTap={busy || disabled ? undefined : { scale: 0.985 }}
      disabled={busy || disabled}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#eed89a] via-[#d8b86f] to-[#b08a45] px-6 py-3.5 text-[13.5px] font-black text-[#241708] shadow-[0_16px_34px_-16px_rgba(192,154,78,0.8)] transition-shadow hover:shadow-[0_20px_38px_-14px_rgba(192,154,78,0.65)] disabled:cursor-not-allowed disabled:opacity-55"
    >
      {/* لمعة عند المرور */}
      {!busy && (
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      )}
      {busy ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80" />
          <span>{busyText || children}</span>
        </>
      ) : (
        <span className="relative flex items-center gap-2">{children}</span>
      )}
    </motion.button>
  )
}
