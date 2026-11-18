import { useEffect, useState } from 'react'
import { useApp } from '../../store/AppContext'
import { changeAdminCredentials, getAdminSession } from '../../lib/adminApi'
import {
  IconAlert,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconLock,
  IconShield,
  IconUser,
} from '../../components/icons'
import { Card, SectionHead } from './ui'

const MIN_PASSWORD_LENGTH = 12
const USERNAME_PATTERN = /^[A-Za-z0-9._@+-]{3,64}$/

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
  visible,
  onToggle,
  disabled,
}) {
  return (
    <label className="block">
      <span className="label-in">{label}</span>
      <span className="relative block">
        <input
          className="field w-full pe-11"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          maxLength={200}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute end-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-white/35 transition-colors hover:bg-white/[0.06] hover:text-gold disabled:opacity-40"
        >
          {visible ? <IconEyeOff size={15} /> : <IconEye size={15} />}
        </button>
      </span>
    </label>
  )
}

function errorFor(result, ar) {
  const code = result.data?.error || (result.networkError ? 'network_error' : 'unknown')

  const messages = {
    database_not_configured: ar
      ? 'قاعدة البيانات غير مربوطة بعد. أضف DATABASE_URL ثم شغّل npm run db:init.'
      : 'The database is not configured. Add DATABASE_URL, then run npm run db:init.',
    database_not_initialized: ar
      ? 'جداول الأدمن غير موجودة. شغّل npm run db:init.'
      : 'The admin tables are missing. Run npm run db:init.',
    database_unavailable: ar
      ? 'تعذّر الوصول إلى قاعدة البيانات. حاول بعد قليل.'
      : 'The database is unavailable. Try again shortly.',
    not_configured: ar
      ? 'إعدادات السيرفر ناقصة. تحقق من ADMIN_SESSION_SECRET.'
      : 'Server configuration is incomplete. Check ADMIN_SESSION_SECRET.',
    admin_not_initialized: ar
      ? 'لا يوجد حساب أدمن بعد. شغّل npm run db:init.'
      : 'No admin account exists yet. Run npm run db:init.',
    unauthorized: ar
      ? 'انتهت الجلسة. سجّل الدخول من جديد.'
      : 'Your session expired. Sign in again.',
    invalid_current_password: ar
      ? 'كلمة السر الحالية غير صحيحة.'
      : 'The current password is incorrect.',
    username_taken: ar
      ? 'اسم المستخدم مستخدم بالفعل.'
      : 'That username is already in use.',
    invalid_username: ar
      ? 'اسم المستخدم يجب أن يكون 3–64 حرفاً: حروف، أرقام، أو . _ @ + -'
      : 'Username must be 3–64 characters: letters, numbers, or . _ @ + -',
    password_too_short: ar
      ? `كلمة السر الجديدة يجب أن تكون ${MIN_PASSWORD_LENGTH} حرفاً على الأقل.`
      : `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
    password_too_long: ar
      ? 'كلمة السر أطول من الحد المسموح.'
      : 'The password is too long.',
    password_mismatch: ar
      ? 'تأكيد كلمة السر غير مطابق.'
      : 'The password confirmation does not match.',
    password_reused: ar
      ? 'اختر كلمة سر مختلفة عن الحالية.'
      : 'Choose a password different from the current one.',
    no_changes: ar
      ? 'لا يوجد تغيير. عدّل اسم المستخدم أو كلمة السر.'
      : 'Nothing changed. Update the username or password.',
    current_password_required: ar
      ? 'أدخل كلمة السر الحالية للتأكيد.'
      : 'Enter your current password to confirm.',
    too_many_attempts: ar
      ? 'محاولات كثيرة. انتظر 10 دقائق ثم حاول.'
      : 'Too many attempts. Wait 10 minutes and try again.',
    network_error: ar
      ? 'تعذّر الوصول إلى السيرفر. تحقق من الاتصال.'
      : 'Could not reach the server. Check your connection.',
    unknown: ar
      ? 'تعذّر تحديث البيانات. حاول مرة أخرى.'
      : 'Could not update the credentials. Try again.',
  }

  return messages[code] || messages.unknown
}

export default function CredentialsTab({ notify }) {
  const { lang } = useApp()
  const ar = lang === 'ar'

  const [currentUsername, setCurrentUsername] = useState('')
  const [form, setForm] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [visible, setVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  })
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState(null)

  useEffect(() => {
    let alive = true

    getAdminSession()
      .then((result) => {
        if (!alive) return
        const username = result.data?.username
        if (result.data?.authenticated && username) {
          setCurrentUsername(username)
          setForm((value) => ({ ...value, username }))
        }
      })
      .catch(() => {
        // The page remains usable; the API will reject an expired session.
      })

    return () => {
      alive = false
    }
  }, [])

  const set = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setStatus(null)
  }

  const toggleVisible = (key) => {
    setVisible((current) => ({ ...current, [key]: !current[key] }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setStatus(null)

    const username = form.username.trim()
    const usernameChanged =
      username.toLowerCase() !== String(currentUsername).toLowerCase()

    if (!form.currentPassword) {
      setStatus({ type: 'error', message: errorFor({ data: { error: 'current_password_required' } }, ar) })
      return
    }

    if (!USERNAME_PATTERN.test(username)) {
      setStatus({ type: 'error', message: errorFor({ data: { error: 'invalid_username' } }, ar) })
      return
    }

    if (form.newPassword && form.newPassword.length < MIN_PASSWORD_LENGTH) {
      setStatus({ type: 'error', message: errorFor({ data: { error: 'password_too_short' } }, ar) })
      return
    }

    if (form.newPassword !== form.confirmPassword) {
      setStatus({ type: 'error', message: errorFor({ data: { error: 'password_mismatch' } }, ar) })
      return
    }

    if (!form.newPassword && !usernameChanged) {
      setStatus({ type: 'error', message: errorFor({ data: { error: 'no_changes' } }, ar) })
      return
    }

    setSubmitting(true)
    try {
      const result = await changeAdminCredentials({
        username,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      })

      if (!result.ok) {
        setStatus({ type: 'error', message: errorFor(result, ar) })
        return
      }

      const nextUsername = result.data?.username || username
      setCurrentUsername(nextUsername)
      setForm({
        username: nextUsername,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setStatus({
        type: 'success',
        message: ar
          ? 'تم تحديث بيانات الدخول. تم تسجيل الخروج من الأجهزة الأخرى.'
          : 'Credentials updated. Other devices have been signed out.',
      })
      notify?.(ar ? 'تم تحديث بيانات الدخول' : 'Credentials updated')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <SectionHead
        title={ar ? 'بيانات الدخول والأمان' : 'Credentials & Security'}
        hint={
          ar
            ? 'غيّر اسم المستخدم أو كلمة السر من هنا. التغيير يُحفظ على السيرفر ويُنهي الجلسات الأخرى.'
            : 'Change your username or password here. The change is stored on the server and closes other sessions.'
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] xl:items-start">
        <Card>
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-gold/15 bg-gold/[0.045] p-3.5">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
              <IconShield size={18} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gold/75">
                {ar ? 'الحساب الحالي' : 'Current account'}
              </p>
              <p className="mt-1 truncate text-[13px] font-black text-[#f7f1e5]">
                {currentUsername || (ar ? 'جارٍ التحميل…' : 'Loading…')}
              </p>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3.5">
            <label className="block">
              <span className="label-in">
                {ar ? 'اسم المستخدم أو الإيميل' : 'Username or email'}
              </span>
              <span className="relative block">
                <input
                  className="field w-full pe-11"
                  value={form.username}
                  onChange={(event) => set('username', event.target.value)}
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={64}
                  placeholder="admin@example.com"
                  disabled={submitting}
                  required
                />
                <span className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-white/25">
                  <IconUser size={15} />
                </span>
              </span>
            </label>

            <PasswordField
              label={ar ? 'كلمة السر الحالية' : 'Current password'}
              value={form.currentPassword}
              onChange={(value) => set('currentPassword', value)}
              autoComplete="current-password"
              placeholder={ar ? 'مطلوبة للتأكيد' : 'Required to confirm'}
              visible={visible.currentPassword}
              onToggle={() => toggleVisible('currentPassword')}
              disabled={submitting}
            />

            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5">
              <p className="mb-3 flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/35">
                <IconLock size={13} />
                {ar ? 'بيانات جديدة' : 'New credentials'}
              </p>

              <div className="space-y-3.5">
                <PasswordField
                  label={ar ? 'كلمة السر الجديدة' : 'New password'}
                  value={form.newPassword}
                  onChange={(value) => set('newPassword', value)}
                  autoComplete="new-password"
                  placeholder={ar ? 'اتركها فارغة للإبقاء على الحالية' : 'Leave blank to keep the current one'}
                  visible={visible.newPassword}
                  onToggle={() => toggleVisible('newPassword')}
                  disabled={submitting}
                />

                <PasswordField
                  label={ar ? 'تأكيد كلمة السر الجديدة' : 'Confirm new password'}
                  value={form.confirmPassword}
                  onChange={(value) => set('confirmPassword', value)}
                  autoComplete="new-password"
                  placeholder={ar ? 'أعد كتابة كلمة السر' : 'Repeat the new password'}
                  visible={visible.confirmPassword}
                  onToggle={() => toggleVisible('confirmPassword')}
                  disabled={submitting}
                />
              </div>

              <p className="mt-3 text-[9px] font-bold leading-relaxed text-white/30">
                {ar
                  ? `كلمة السر ${MIN_PASSWORD_LENGTH} حرفاً على الأقل. اترك الحقلين فارغين إذا كنت تغيّر اسم المستخدم فقط.`
                  : `Use at least ${MIN_PASSWORD_LENGTH} characters. Leave both password fields empty to change only the username.`}
              </p>
            </div>

            {status && (
              <div
                role="status"
                aria-live="polite"
                className={`flex items-start gap-2.5 rounded-xl border px-3 py-2.5 text-[10px] font-bold leading-relaxed ${
                  status.type === 'success'
                    ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200'
                    : 'border-red-400/20 bg-red-500/[0.07] text-red-200'
                }`}
              >
                <span className="mt-0.5 shrink-0">
                  {status.type === 'success' ? <IconCheck size={14} /> : <IconAlert size={14} />}
                </span>
                <span>{status.message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-3 disabled:pointer-events-none disabled:opacity-50"
            >
              {submitting
                ? ar
                  ? 'جارٍ الحفظ…'
                  : 'Saving…'
                : ar
                  ? 'حفظ بيانات الدخول'
                  : 'Save credentials'}
            </button>
          </form>
        </Card>

        <Card>
          <p className="mb-3 flex items-center gap-2 text-[11px] font-black text-gold">
            <IconShield size={15} />
            {ar ? 'كيف نحمي الحساب' : 'How the account is protected'}
          </p>
          <ul className="space-y-2.5 text-[10px] font-semibold leading-relaxed text-white/45">
            <li>
              {ar
                ? 'تُحفظ كلمة السر كبصمة scrypt على السيرفر، ولا تُرسل إلى المتصفح.'
                : 'The password is stored as a scrypt hash on the server and is never sent to the browser.'}
            </li>
            <li>
              {ar
                ? 'تغيير البيانات يزيد إصدار الجلسة، فتصبح كل الجلسات القديمة غير صالحة.'
                : 'Changing credentials bumps the session version, so every old session becomes invalid.'}
            </li>
            <li>
              {ar
                ? 'يجب إدخال كلمة السر الحالية قبل أي تغيير.'
                : 'The current password is required before any change.'}
            </li>
            <li>
              {ar
                ? 'بعد 5 محاولات خاطئة يتم القفل لمدة 10 دقائق.'
                : 'After 5 failed attempts, changes are locked for 10 minutes.'}
            </li>
          </ul>

          <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[9px] font-bold leading-relaxed text-white/30">
            {ar
              ? 'إذا فقدت كلمة السر، استخدم npm run db:reset-admin من السيرفر.'
              : 'If you lose the password, use npm run db:reset-admin from the server.'}
          </p>
        </Card>
      </div>
    </div>
  )
}
