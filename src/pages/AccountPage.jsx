/**
 * pages/AccountPage.jsx — الدخول الموحّد + حساب الزبون + التقييم
 * ===========================================================================
 * 🧠 المنطق:
 *   • صفحة دخول واحدة للزبائن وصاحب المحل — بدون زر «دخول الإدارة».
 *   • إذا نجح دخول الأدمن على السيرفر → #/admin.
 *   • إذا كان زبوناً عادياً → جلسة زبون + توجيه للمنيو الرئيسي.
 *   • إنشاء حساب جديد → جلسة زبون + توجيه للمنيو الرئيسي.
 *   • جلسة الزبون = sessionStorage بمفتاح benova:customer
 *   • جلسة الأدمن = كوكي HttpOnly يضبطها السيرفر (وليست sessionStorage)
 *
 * 🎨 نفس هوية بوابة الإدارة: بطاقة داكنة/فاتحة متكيّفة، ذهب وزمرد،
 *    حقول ناعمة، إظهار/إخفاء كلمة السر، تحقق لحظي، وتهدئة بعد المحاولات.
 */
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { navigate } from '../lib/hashRoute'
import { isEmail, isPhone } from '../lib/auth'
import { loginAdmin } from '../lib/adminApi'
import { clearSession, getSession, setSession } from '../lib/session'
import ReviewForm from '../components/ReviewForm'
import AuthShell from '../components/auth/AuthShell'
import {
  AuthAlert,
  AuthField,
  AuthTabs,
  PasswordMeter,
  SubmitButton,
} from '../components/auth/AuthUI'
import {
  IconLock,
  IconMail,
  IconPhone,
  IconShield,
  IconSparkle,
  IconUser,
  IconWhatsApp,
} from '../components/icons'

const MAX_ATTEMPTS = 5
const COOLDOWN_SECONDS = 30

export default function AccountPage({ adminEntry = false, onAdminAuthed }) {
  const { lang, notify, dark } = useApp()
  const { settings, addCustomer, customerExists, signInCustomer } = useContent()
  const ar = lang === 'ar'
  const tone = dark ? 'dark' : 'light'

  /* 🔐 الحساب الحالي + نوع آخر نجاح */
  const [user, setUser] = useState(() => (adminEntry ? null : getSession()))
  const [welcome, setWelcome] = useState(null) // 'signup' | 'signin' | null

  /* 🧾 الحقول — نبدأ دائماً بصفحة الدخول الموحّدة */
  const [mode, setMode] = useState('signIn') // signIn | signUp
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')

  /* ⚠️ الأخطاء + حماية المحاولات */
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [attempts, setAttempts] = useState(0)
  const [cooldown, setCooldown] = useState(0)
  const [capsLock, setCapsLock] = useState(false)

  const isUp = mode === 'signUp'
  const locked = cooldown > 0
  const identifierOk = isEmail(email) || (!isUp && String(email).trim().length > 0)

  /* ⏳ عدّاد التهدئة بعد المحاولات الكثيرة */
  useEffect(() => {
    if (cooldown <= 0) return undefined
    const id = setInterval(() => {
      setCooldown((value) => (value <= 1 ? 0 : value - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [cooldown])

  /* ---------------------- التحقق ---------------------- */
  const validators = {
    name: (value) =>
      String(value).trim() ? '' : ar ? 'اكتب اسمك الكامل' : 'Please enter your full name',
    email: (value) => {
      if (isEmail(value)) return ''
      if (!isUp && String(value).trim()) return ''
      return ar
        ? 'إيميل غير صالح — مثال: name@mail.com'
        : 'Enter a valid email — e.g. name@mail.com'
    },
    phone: (value) =>
      isPhone(value)
        ? ''
        : ar
          ? 'رقم الهاتف غير صالح — ٧ أرقام على الأقل'
          : 'Enter a valid phone number (7+ digits)',
    password: (value) => {
      if (!value) return ar ? 'اكتب كلمة السر' : 'Please enter your password'
      return String(value).length >= 4
        ? ''
        : ar
          ? 'كلمة السر ٤ خانات على الأقل'
          : 'Password needs at least 4 characters'
    },
  }

  const validate = (key, value) => {
    const message = validators[key](value)
    setErrors((current) => ({ ...current, [key]: message }))
    return message
  }

  /** تحقق ناعم عند مغادرة الحقل — بس إذا المستخدم كتب شي */
  const softValidate = (key, value) => {
    if (String(value).trim() === '') {
      setErrors((current) => ({ ...current, [key]: '' }))
      return
    }
    validate(key, value)
  }

  const clearErrors = (key) => {
    if (errors[key]) setErrors((current) => ({ ...current, [key]: '' }))
    if (formError) setFormError('')
  }

  const switchMode = (next) => {
    if (next === mode) return
    setMode(next)
    setErrors({})
    setFormError('')
    setPassword('')
    setCapsLock(false)
  }

  /** محاولة دخول فاشلة — بعد ٥ محاولات تهدئة قصيرة */
  const registerFailure = (message) => {
    const next = attempts + 1
    setAttempts(next)

    if (next >= MAX_ATTEMPTS) {
      setAttempts(0)
      setCooldown(COOLDOWN_SECONDS)
      setFormError('')
      notify(
        ar
          ? `محاولات كتير — تهدئة ${COOLDOWN_SECONDS} ثانية`
          : `Too many attempts — ${COOLDOWN_SECONDS}s cooldown`,
      )
      return
    }

    setFormError(message)
  }

  /* ---------------------- 🟢 حساب جديد ---------------------- */
  const submitSignUp = (event) => {
    event.preventDefault()
    setFormError('')

    const next = {
      name: validators.name(name),
      email: validators.email(email),
      phone: validators.phone(phone),
      password: validators.password(password),
    }
    setErrors(next)
    if (Object.values(next).some(Boolean)) return

    // إيميل مكرر؟
    if (customerExists(email)) {
      setErrors({
        email: ar
          ? 'هذا الإيميل مسجّل مسبقاً — بدّل لتسجيل الدخول'
          : 'This email is already registered — switch to sign in',
      })
      return
    }

    const created = addCustomer({ name, email, phone, password })
    const account = {
      name: created.name,
      email: created.email,
      phone: created.phone,
      createdAt: created.createdAt,
    }

    setSession(account)
    setUser(account)
    setWelcome('signup')
    setPassword('')
    setCapsLock(false)
    notify(ar ? 'تم إنشاء حسابك ✅' : 'Account created ✅')
    navigate('/')
  }

  /* ---------------------- 🔵 تسجيل دخول موحّد ---------------------- */
  const submitSignIn = async (event) => {
    event.preventDefault()
    if (locked) return
    setFormError('')

    const next = {
      email: validators.email(email),
      password: validators.password(password),
    }
    setErrors(next)
    if (next.email || next.password) return

    const entered = String(email).trim()

    // 👑 دخول الأدمن يتم التحقق منه على السيرفر عبر كوكي HttpOnly
    const adminResult = await loginAdmin(entered, password)
    if (adminResult.ok && adminResult.data?.authenticated) {
      setAttempts(0)
      setCooldown(0)
      setCapsLock(false)
      notify(ar ? 'أهلاً فيك بلوحة التحكم 👑' : 'Welcome to the dashboard 👑')
      if (onAdminAuthed) onAdminAuthed()
      else navigate('/admin')
      return
    }

    if (adminResult.status === 429) {
      registerFailure(
        ar
          ? 'محاولات كتير على السيرفر — جرّب بعد شوي'
          : 'Too many server attempts — try again later',
      )
      setPassword('')
      return
    }

    // 👤 زبون عادي → جلسة زبون ثم المنيو الرئيسي
    const found = signInCustomer(entered, password)
    if (!found) {
      registerFailure(
        ar
          ? 'الإيميل أو كلمة السر غير صحيحة — أو ما عندك حساب بعد.'
          : 'Wrong email or password — or you have no account yet.',
      )
      setPassword('')
      return
    }

    const account = {
      name: found.name,
      email: found.email,
      phone: found.phone,
      createdAt: found.createdAt,
    }

    setSession(account)
    setUser(account)
    setWelcome('signin')
    setPassword('')
    setCapsLock(false)
    setAttempts(0)
    setCooldown(0)
    notify(ar ? `أهلاً ${found.name} 👋` : `Welcome ${found.name} 👋`)
    navigate('/')
  }

  const logout = () => {
    clearSession()
    setUser(null)
    setWelcome(null)
    setPassword('')
    setCapsLock(false)
    setErrors({})
    setFormError('')
    setAttempts(0)
    setCooldown(0)
    setMode('signIn')
    notify(ar ? 'تم تسجيل الخروج' : 'Logged out')
  }

  /* ======================= واجهة ======================= */
  return (
    <AuthShell ar={ar} signedIn={Boolean(user && !adminEntry)}>
      {user && !adminEntry ? (
        <AccountPanel
          user={user}
          ar={ar}
          dark={dark}
          welcome={welcome}
          onLogout={logout}
        />
      ) : (
        <div>
          {/* التبويبات */}
          <AuthTabs mode={mode} onChange={switchMode} ar={ar} tone={tone} />

          {/* العنوان */}
          <div className="mt-4">
            <p className="text-[9px] font-black uppercase tracking-[0.28em] text-gold-deep dark:text-gold">
              {isUp
                ? ar
                  ? 'عضوية BENOVA'
                  : 'BENOVA MEMBERSHIP'
                : ar
                  ? 'دخول موحّد'
                  : 'UNIFIED SIGN IN'}
            </p>
            <h2
              className={`mt-1.5 text-[25px] leading-tight tracking-wide text-ink sm:text-[27px] dark:text-cream ${
                ar ? 'font-sans font-black' : 'font-display'
              }`}
            >
              {isUp
                ? ar
                  ? 'أنشئ حسابك بثواني'
                  : 'Create your account'
                : ar
                  ? 'أهلاً برجعتك'
                  : 'Welcome back'}
            </h2>
            <p className="mt-1.5 text-[11.5px] font-semibold leading-relaxed text-muted dark:text-white/45">
              {isUp
                ? ar
                  ? 'اسمك، إيميلك، ورقمك — وبتصير من عائلة BENOVA.'
                  : 'Your name, email and phone — and you are in.'
                : ar
                  ? 'زبون أو صاحب المحل — النظام بيعرف وين يودّيك.'
                  : 'Customer or owner — we will take you to the right place.'}
            </p>

          </div>

          {/* النموذج */}
          <form
            onSubmit={isUp ? submitSignUp : submitSignIn}
            className="mt-4 space-y-4"
            noValidate
          >
            {/* الاسم (تسجيل فقط) */}
            <AnimatePresence initial={false}>
              {isUp && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <AuthField
                    tone={tone}
                    id="account-name"
                    name="name"
                    label={ar ? 'الاسم الكامل' : 'Full name'}
                    icon={<IconUser size={16} />}
                    value={name}
                    onChange={(value) => {
                      setName(value)
                      clearErrors('name')
                    }}
                    onBlur={() => softValidate('name', name)}
                    placeholder={ar ? 'مثلاً: بسام الحاج' : 'e.g. Bassam El Hajj'}
                    autoComplete="name"
                    error={errors.name}
                    success={name.trim().length > 1 && !errors.name}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* الإيميل */}
            <AuthField
              tone={tone}
              id="account-email"
              name="email"
              label={
                isUp
                  ? ar
                    ? 'الإيميل'
                    : 'Email'
                  : ar
                    ? 'الإيميل أو اسم المستخدم'
                    : 'Email or username'
              }
              icon={<IconMail size={16} />}
              type="email"
              value={email}
              onChange={(value) => {
                setEmail(value)
                clearErrors('email')
              }}
              onBlur={() => softValidate('email', email)}
              placeholder="name@mail.com"
              autoComplete="email"
              inputMode="email"
              ltr
              error={errors.email}
              success={identifierOk && !errors.email}
            />

            {/* الهاتف (تسجيل فقط) */}
            <AnimatePresence initial={false}>
              {isUp && (
                <motion.div
                  key="phone-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <AuthField
                    tone={tone}
                    id="account-phone"
                    name="phone"
                    label={ar ? 'رقم الهاتف' : 'Phone number'}
                    icon={<IconPhone size={16} />}
                    type="tel"
                    value={phone}
                    onChange={(value) => {
                      setPhone(value)
                      clearErrors('phone')
                    }}
                    onBlur={() => softValidate('phone', phone)}
                    placeholder="+961 79 000 000"
                    autoComplete="tel"
                    inputMode="tel"
                    ltr
                    error={errors.phone}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* كلمة السر */}
            <AuthField
              tone={tone}
              id="account-password"
              name="password"
              label={ar ? 'كلمة السر' : 'Password'}
              icon={<IconLock size={16} />}
              type="password"
              value={password}
              onChange={(value) => {
                setPassword(value)
                clearErrors('password')
              }}
              onBlur={() => softValidate('password', password)}
              onKeyUp={(event) =>
                setCapsLock(event.getModifierState?.('CapsLock') || false)
              }
              placeholder={isUp ? '••••••' : '••••••••'}
              autoComplete={isUp ? 'new-password' : 'current-password'}
              hint={
                capsLock
                  ? ar
                    ? 'تنبيه: Caps Lock مفعّل'
                    : 'Heads up: Caps Lock is on'
                  : undefined
              }
              ltr
              error={errors.password}
            />

            {/* مقياس القوة — تسجيل فقط */}
            {isUp && <PasswordMeter value={password} ar={ar} />}

            {/* نسيت كلمة السر؟ */}
            {!isUp && settings.whatsapp && (
              <div className="-mt-1 text-end">
                <a
                  href={`https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(
                    ar
                      ? 'مرحبتين! نسيت كلمة سر حسابي بموقع BENOVA.'
                      : 'Hi! I forgot my BENOVA account password.',
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-muted/80 transition-colors hover:text-gold-deep dark:text-white/40 dark:hover:text-gold"
                >
                  <IconWhatsApp size={12} />
                  {ar ? 'نسيت كلمة السر؟ تواصل معنا' : 'Forgot password? Contact us'}
                </a>
              </div>
            )}

            {/* خطأ عام / تهدئة */}
            <AnimatePresence initial={false}>
              {formError && (
                <AuthAlert key="form-error" tone="error" dark={dark}>
                  {formError}
                </AuthAlert>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
              {locked && (
                <AuthAlert key="cooldown" tone="error" dark={dark}>
                  {ar
                    ? `تم إيقاف المحاولات مؤقتاً — عندك ${cooldown} ثانية`
                    : `Locked for now — ${cooldown}s remaining`}
                </AuthAlert>
              )}
            </AnimatePresence>

            {!locked && attempts > 1 && (
              <p className="text-center text-[10px] font-bold text-muted/70 dark:text-white/30">
                {ar
                  ? `محاولات متبقية قبل التهدئة: ${MAX_ATTEMPTS - attempts}`
                  : `Attempts left: ${MAX_ATTEMPTS - attempts}`}
              </p>
            )}

            {/* زر الإرسال */}
            <SubmitButton
              disabled={!isUp && (locked || !String(email).trim() || !password)}
            >
              {isUp ? <IconSparkle size={15} /> : <IconShield size={15} />}
              {isUp
                ? ar
                  ? 'إنشاء حسابي'
                  : 'Create my account'
                : locked
                  ? ar
                    ? `انتظر ${cooldown} ثانية`
                    : `Wait ${cooldown}s`
                  : ar
                    ? 'دخول آمن'
                    : 'Secure sign in'}
            </SubmitButton>

            {!isUp && (
              <p className="flex items-center justify-center gap-1.5 text-center text-[9.5px] font-bold text-muted/65 dark:text-white/30">
                <IconShield size={11} />
                {ar
                  ? 'يتم توجيهك تلقائياً حسب نوع الحساب'
                  : 'Automatically routed by account type'}
              </p>
            )}

            {/* تبديل الوضع */}
            <p className="text-center text-[10.5px] font-bold text-muted/75 dark:text-white/40">
              {isUp
                ? ar
                  ? 'عندك حساب من قبل؟ '
                  : 'Already have an account? '
                : ar
                  ? 'ما عندك حساب؟ '
                  : 'No account yet? '}
              <button
                type="button"
                onClick={() => switchMode(isUp ? 'signIn' : 'signUp')}
                className="font-black text-primary underline-offset-2 hover:underline dark:text-gold"
              >
                {isUp
                  ? ar
                    ? 'سجّل دخول'
                    : 'Sign in'
                  : ar
                    ? 'أنشئ حساب'
                    : 'Create one'}
              </button>
            </p>
          </form>

          {/* شروط */}
          <p className="mt-4 text-center text-[9.5px] leading-relaxed text-muted/70 dark:text-white/30">
            {ar
              ? 'بإنشاء الحساب بتوافق على استلام العروض — وتقدر توقفها بأي وقت.'
              : 'By creating an account you agree to receive offers — unsubscribe anytime.'}
          </p>
        </div>
      )}
    </AuthShell>
  )
}

/* ==================================================================== */
/*  👤 لوحة الحساب بعد الدخول                                           */
/* ==================================================================== */
function AccountPanel({ user, ar, dark, welcome, onLogout }) {
  const firstName = String(user.name || '').trim().split(/\s+/)[0] || user.email
  const initial = String(user.name || user.email || '?').trim().charAt(0).toUpperCase()

  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
      {/* ✅ رسالة ترحيب بعد التسجيل/الدخول */}
      <AnimatePresence>
        {welcome && (
          <motion.div
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <AuthAlert tone="success" dark={dark}>
              {welcome === 'signup'
                ? ar
                  ? `أهلاً ${firstName} — حسابك جاهز! هلأ فيك تكتب رأيك وشارك صورة طلبك ⭐`
                  : `Welcome ${firstName} — your account is ready! Write a review and add a photo ⭐`
                : ar
                  ? `أهلاً رجعت ${firstName} 👋`
                  : `Welcome back ${firstName} 👋`}
            </AuthAlert>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-[9px] font-black uppercase tracking-[0.28em] text-gold-deep dark:text-gold">
        {ar ? 'حسابي' : 'MY ACCOUNT'}
      </p>
      <h2
        className={`mt-2 text-[25px] leading-tight tracking-wide text-ink sm:text-[27px] dark:text-cream ${
          ar ? 'font-sans font-black' : 'font-display'
        }`}
      >
        {ar ? `أهلاً ${firstName} 👋` : `Hi ${firstName} 👋`}
      </h2>
      <p className="mt-1.5 text-[11.5px] font-semibold leading-relaxed text-muted dark:text-white/45">
        {ar
          ? 'حسابك محفوظ على هذا الجهاز — شارك رأيك أو تصفّح المنيو.'
          : 'Your account lives on this device — share a review or browse the menu.'}
      </p>

      {/* بطاقة الهوية */}
      <div className="mt-5 flex items-center gap-4 rounded-3xl border border-line bg-bg/70 p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl primary-bg font-display text-xl text-cream shadow-md">
          {initial}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[14px] font-black text-ink dark:text-cream">
              {user.name || firstName}
            </p>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider text-primary dark:bg-gold/10 dark:text-gold">
              ✦ {ar ? 'عضو BENOVA' : 'BENOVA member'}
            </span>
          </div>
          <p
            className="mt-1 flex items-center gap-1.5 truncate text-[11px] font-bold text-muted dark:text-white/40"
            dir="ltr"
          >
            <IconMail size={12} />
            {user.email}
          </p>
          {user.phone && (
            <p
              className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] font-bold text-muted dark:text-white/40"
              dir="ltr"
            >
              <IconPhone size={12} />
              {user.phone}
            </p>
          )}
        </div>
      </div>

      {/* نموذج التقييم */}
      <div className="mt-5">
        <ReviewForm email={user.email} ar={ar} compact />
      </div>

      {/* أزرار */}
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onLogout}
          className="rounded-2xl border border-line bg-surface px-5 py-3 text-[11.5px] font-black text-muted transition-all hover:border-red-300 hover:text-red-500 active:scale-[0.98] dark:border-white/10 dark:bg-white/[0.04] dark:text-white/45 dark:hover:border-red-400/40 dark:hover:text-red-300"
        >
          {ar ? 'تسجيل الخروج' : 'Log out'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="primary-bg flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-[11.5px] font-black text-cream shadow-md transition-all hover:brightness-105 active:scale-[0.98]"
        >
          {ar ? 'تصفّح المنيو' : 'Browse the menu'}
        </button>
      </div>
    </motion.div>
  )
}
