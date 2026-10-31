/**
 * pages/ContactPage.jsx — اتصل بنا
 * ===========================================================================
 * • نموذج تفاعلي كامل مع validate وإرسال مباشر عبر واتساب (أو الإيميل كبديل).
 * • أزرار وصول سريع: واتساب · إنستغرام · الموقع.
 * • بطاقة تفاصيل المحل مع حالة الفتح/الإغلاق الحيّة من إعدادات الأدمن.
 */
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { normalizeUrl } from '../data/settings'
import { useBusinessStatus } from '../lib/hours'
import { isEmail, isPhone } from '../lib/auth'
import { navigate } from '../lib/hashRoute'
import PageBanner from '../components/PageBanner'
import BottomNav from '../components/BottomNav'
import {
  IconAlert,
  IconCheck,
  IconChevron,
  IconClock,
  IconInstagram,
  IconMail,
  IconPhone,
  IconPin,
  IconSparkle,
  IconWhatsApp,
} from '../components/icons'

const TOPICS = [
  { id: 'order', ar: 'سؤال عن طلب', en: 'Order question' },
  { id: 'delivery', ar: 'توصيل واستلام', en: 'Delivery & pickup' },
  { id: 'items', ar: 'الأصناف والمكوّنات', en: 'Items & ingredients' },
  { id: 'feedback', ar: 'ملاحظة أو اقتراح', en: 'Feedback' },
]

const openExternal = (url) => {
  try {
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
  } catch {
    window.open(url, '_blank')
  }
}

function FormField({
  id,
  label,
  hint,
  error,
  required,
  children,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 flex items-center justify-between gap-2 text-[9.5px] font-black uppercase tracking-[0.16em] text-muted"
      >
        <span>
          {label}
          {required && <span className="ms-1 text-red-500">*</span>}
        </span>
        {hint && <span className="font-bold normal-case tracking-normal text-muted/55">{hint}</span>}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p
            id={`${id}-error`}
            role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 flex items-center gap-1.5 overflow-hidden text-[10px] font-bold text-red-500"
          >
            <IconAlert size={11} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

function QuickAction({ href, icon, label, value, tone, ar }) {
  const tones = {
    whatsapp: {
      chip: 'bg-[#25D366] text-white shadow-[0_12px_24px_-14px_rgba(37,211,102,0.8)]',
      card: 'hover:border-[#25D366]/45',
    },
    instagram: {
      chip: 'bg-gradient-to-br from-[#f9a03f] via-[#e1306c] to-[#8a3ab9] text-white shadow-[0_12px_24px_-14px_rgba(225,48,108,0.8)]',
      card: 'hover:border-[#e1306c]/40',
    },
    location: {
      chip: 'bg-gradient-to-br from-[#d8b86f] to-[#9a7333] text-[#2a1b0d] shadow-[0_12px_24px_-14px_rgba(176,138,69,0.9)]',
      card: 'hover:border-gold/55',
    },
    phone: {
      chip: 'bg-gradient-to-br from-[#478566] to-[#1e4633] text-cream shadow-[0_12px_24px_-14px_rgba(30,70,51,0.8)]',
      card: 'hover:border-primary/45',
    },
    email: {
      chip: 'bg-gradient-to-br from-[#6b4a2a] to-[#3a2717] text-[#f3ddb4] shadow-[0_12px_24px_-14px_rgba(58,39,23,0.8)]',
      card: 'hover:border-gold/45',
    },
  }
  const palette = tones[tone] || tones.location
  const Tag = href ? motion.a : motion.div
  const linkProps = href
    ? { href, target: '_blank', rel: 'noreferrer' }
    : {}

  return (
    <Tag
      {...linkProps}
      whileHover={href ? { y: -3 } : undefined}
      whileTap={href ? { scale: 0.985 } : undefined}
      aria-disabled={!href || undefined}
      className={`group flex items-center gap-3 rounded-[22px] border border-line/80 bg-surface/65 p-3.5 backdrop-blur transition-[border-color,box-shadow] duration-300 dark:border-white/10 dark:bg-white/[0.035] ${
        href ? palette.card : 'cursor-not-allowed opacity-55'
      }`}
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ring-1 ring-black/5 ${palette.chip}`}>
        {icon}
      </span>
      <span className="min-w-0 flex-1 text-start">
        <span className="block text-[11.5px] font-black text-ink dark:text-cream">
          {label}
        </span>
        <span
          className="mt-0.5 block truncate text-[9.5px] font-semibold text-muted"
          dir={tone === 'whatsapp' || tone === 'phone' || tone === 'email' ? 'ltr' : undefined}
          style={tone === 'whatsapp' || tone === 'phone' || tone === 'email' ? { textAlign: ar ? 'right' : 'left' } : undefined}
        >
          {value}
        </span>
      </span>
      <span
        className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line/70 text-muted transition-colors group-hover:border-gold/40 group-hover:text-gold-deep dark:border-white/10 ${
          ar ? 'rotate-90' : '-rotate-90'
        }`}
      >
        <IconChevron size={12} />
      </span>
    </Tag>
  )
}

export default function ContactPage() {
  const { lang } = useApp()
  const { settings } = useContent()
  const ar = lang === 'ar'
  const status = useBusinessStatus(settings.hours, lang, settings.storeStatus)
  const socials = settings.socials || {}

  const waLink = settings.whatsapp ? `https://wa.me/${settings.whatsapp}` : ''
  const igLink = socials.instagram ? normalizeUrl(socials.instagram) : ''
  const mapsLink = settings.mapsUrl ? normalizeUrl(settings.mapsUrl) : ''
  const phoneLink = settings.phone
    ? `tel:${String(settings.phone).replace(/\s/g, '')}`
    : ''
  const emailLink = settings.email ? `mailto:${settings.email}` : ''

  const emptyForm = useMemo(
    () => ({ name: '', phone: '', email: '', topic: 'order', message: '' }),
    [],
  )

  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [sent, setSent] = useState(null) // 'whatsapp' | 'email'

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: '' }))
    if (formError) setFormError('')
  }

  const validate = () => {
    const next = {}

    if (!form.name.trim()) {
      next.name = ar ? 'اكتب اسمك من فضلك' : 'Please enter your name'
    }

    if (!form.message.trim()) {
      next.message = ar ? 'اكتب رسالتك من فضلك' : 'Please write your message'
    } else if (form.message.trim().length < 10) {
      next.message = ar
        ? 'خلّي رسالتك ١٠ أحرف على الأقل'
        : 'Message needs at least 10 characters'
    }

    if (form.email.trim() && !isEmail(form.email)) {
      next.email = ar
        ? 'إيميل غير صالح — مثال: name@mail.com'
        : 'Enter a valid email — e.g. name@mail.com'
    }

    if (form.phone.trim() && !isPhone(form.phone)) {
      next.phone = ar
        ? 'رقم الهاتف غير صالح — ٧ أرقام على الأقل'
        : 'Enter a valid phone number (7+ digits)'
    }

    setErrors(next)
    return Object.keys(next).length === 0
  }

  const submit = (event) => {
    event.preventDefault()
    setFormError('')
    if (!validate()) return

    const topic = TOPICS.find((item) => item.id === form.topic) || TOPICS[0]
    const intro = ar ? 'رسالة جديدة من موقع BENOVA' : 'New message from the BENOVA website'
    const body = [
      intro,
      `${ar ? 'الموضوع' : 'Topic'}: ${ar ? topic.ar : topic.en}`,
      `${ar ? 'الاسم' : 'Name'}: ${form.name.trim()}`,
      form.phone.trim() ? `${ar ? 'الهاتف' : 'Phone'}: ${form.phone.trim()}` : '',
      form.email.trim() ? `${ar ? 'الإيميل' : 'Email'}: ${form.email.trim()}` : '',
      '',
      form.message.trim(),
    ]
      .filter(Boolean)
      .join('\n')

    const cleanWhatsapp = String(settings.whatsapp || '').replace(/\D/g, '')

    if (cleanWhatsapp) {
      openExternal(`https://wa.me/${cleanWhatsapp}?text=${encodeURIComponent(body)}`)
      setSent('whatsapp')
      setForm(emptyForm)
      return
    }

    if (settings.email) {
      const subject = `${ar ? 'رسالة من الموقع' : 'Website message'} — ${
        ar ? topic.ar : topic.en
      }`
      openExternal(
        `mailto:${settings.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
      )
      setSent('email')
      setForm(emptyForm)
      return
    }

    setFormError(
      ar
        ? 'ما في وسيلة تواصل مفعّلة من لوحة التحكم — ضيف رقم واتساب أو إيميل.'
        : 'No contact channel is enabled in the dashboard — add WhatsApp or email.',
    )
  }

  const statusTone =
    status.open === true
      ? 'border-emerald-400/30 bg-emerald-400/[0.08] text-emerald-600 dark:text-emerald-300'
      : status.open === false
        ? 'border-red-400/25 bg-red-400/[0.06] text-red-500 dark:text-red-300'
        : 'border-gold/30 bg-gold/8 text-gold-deep dark:text-gold'

  const inputClass = (key) =>
    `w-full rounded-2xl border bg-bg/50 px-4 py-3.5 text-[12.5px] font-semibold text-ink shadow-sm outline-none transition-all placeholder:text-muted/45 focus:ring-4 dark:bg-black/10 dark:text-cream ${
      errors[key]
        ? 'border-red-400/60 focus:border-red-400 focus:ring-red-400/10'
        : 'border-line/80 focus:border-gold/70 focus:ring-gold/10 dark:border-white/10'
    }`

  return (
    <div className="min-h-screen bg-bg pb-16">
      <PageBanner
        title={ar ? 'اتصل بنا' : 'Contact us'}
        kicker={ar ? 'BENOVA · تواصل' : 'BENOVA · CONTACT'}
        icon={<IconPhone size={24} />}
        subtitle={
          ar
            ? 'عندك سؤال، طلب خاص، أو بس بدك تقول مرحبا؟ نحنا قريبين منك — اختار الطريقة اللي بتريحك.'
            : 'A question, a special order, or just want to say hello? We are close by — pick whatever feels easy.'
        }
      >
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[10px] font-black ${statusTone}`}
        >
          <span className="relative flex h-2 w-2">
            {status.open === true && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                status.open === true
                  ? 'bg-emerald-500'
                  : status.open === false
                    ? 'bg-red-500'
                    : 'bg-gold'
              }`}
            />
          </span>
          {status.label}
        </span>
      </PageBanner>

      <div className="mx-auto max-w-6xl px-4 pt-8 sm:px-6 sm:pt-10 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:gap-6">
          {/* ─── النموذج ─── */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="order-2 min-w-0 overflow-hidden rounded-[30px] border border-line/75 bg-surface/70 p-5 shadow-[0_26px_58px_-42px_rgba(22,33,26,0.7)] backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-7 lg:order-1"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.26em] text-gold-deep dark:text-gold/80">
                  {ar ? 'ارسلي رسالة' : 'SEND A NOTE'}
                </span>
                <h2 className="mt-1 font-display text-[24px] tracking-wide text-ink dark:text-cream sm:text-[28px]">
                  {ar ? 'خلّينا نسمع منك' : 'Let’s hear from you'}
                </h2>
                <p className="mt-1.5 max-w-md text-[11px] font-semibold leading-relaxed text-muted">
                  {ar
                    ? 'عبّي الحقول ومنرسل رسالتك مباشرة لواتساب المحل — أسرع طريقة للرد.'
                    : 'Fill the fields and we will open your message in the shop WhatsApp — the fastest reply.'}
                </p>
              </div>
              <span className="hidden h-11 w-11 shrink-0 place-items-center rounded-2xl border border-gold/25 bg-gold/10 text-gold-deep dark:text-gold sm:grid">
                <IconSparkle size={19} />
              </span>
            </div>

            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="mt-6 rounded-[26px] border border-primary/30 bg-primary/[0.07] p-6 text-center"
                >
                  <motion.span
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                    className="mx-auto grid h-16 w-16 place-items-center rounded-full primary-bg text-cream shadow-lg"
                  >
                    <IconCheck size={28} />
                  </motion.span>
                  <h3 className="mt-4 font-display text-xl text-ink dark:text-cream">
                    {ar ? 'رسالتك جاهزة!' : 'Your message is ready!'}
                  </h3>
                  <p className="mx-auto mt-2 max-w-sm text-[11.5px] font-semibold leading-6 text-muted">
                    {sent === 'whatsapp'
                      ? ar
                        ? 'فتحنا واتساب المحل مع نص الرسالة — بس اضغط إرسال وهنكون معك.'
                        : 'We opened the shop WhatsApp with your message — just press send and we are on it.'
                      : ar
                        ? 'فتحنا تطبيق الإيميل مع نص رسالتك — بس اضغط إرسال.'
                        : 'We opened your email app with the message — just press send.'}
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSent(null)}
                      className="btn-ghost px-5 py-3"
                    >
                      {ar ? 'أرسل رسالة ثانية' : 'Send another'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/menu')}
                      className="btn-primary px-5 py-3"
                    >
                      {ar ? 'تصفّح المنيو' : 'Browse the menu'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={submit}
                  noValidate
                  className="mt-6 space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      id="contact-name"
                      label={ar ? 'الاسم' : 'Name'}
                      required
                      error={errors.name}
                      ar={ar}
                    >
                      <input
                        id="contact-name"
                        type="text"
                        value={form.name}
                        onChange={(event) => update('name', event.target.value)}
                        autoComplete="name"
                        placeholder={ar ? 'اسمك الكريم' : 'Your name'}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={errors.name ? 'contact-name-error' : undefined}
                        className={inputClass('name')}
                      />
                    </FormField>

                    <FormField
                      id="contact-phone"
                      label={ar ? 'الهاتف' : 'Phone'}
                      hint={ar ? 'اختياري' : 'optional'}
                      error={errors.phone}
                      ar={ar}
                    >
                      <input
                        id="contact-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(event) => update('phone', event.target.value)}
                        autoComplete="tel"
                        inputMode="tel"
                        dir="ltr"
                        placeholder="+961 70 000 000"
                        aria-invalid={Boolean(errors.phone)}
                        aria-describedby={errors.phone ? 'contact-phone-error' : undefined}
                        className={`${inputClass('phone')} text-start`}
                      />
                    </FormField>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      id="contact-email"
                      label={ar ? 'الإيميل' : 'Email'}
                      hint={ar ? 'اختياري' : 'optional'}
                      error={errors.email}
                      ar={ar}
                    >
                      <input
                        id="contact-email"
                        type="email"
                        value={form.email}
                        onChange={(event) => update('email', event.target.value)}
                        autoComplete="email"
                        inputMode="email"
                        dir="ltr"
                        placeholder="name@mail.com"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={errors.email ? 'contact-email-error' : undefined}
                        className={`${inputClass('email')} text-start`}
                      />
                    </FormField>

                    <FormField
                      id="contact-topic"
                      label={ar ? 'الموضوع' : 'Topic'}
                      required
                      ar={ar}
                    >
                      <div className="relative">
                        <select
                          id="contact-topic"
                          value={form.topic}
                          onChange={(event) => update('topic', event.target.value)}
                          className={`${inputClass('topic')} appearance-none pe-10`}
                        >
                          {TOPICS.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                              {ar ? topic.ar : topic.en}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 text-muted">
                          <IconChevron size={14} />
                        </span>
                      </div>
                    </FormField>
                  </div>

                  <FormField
                    id="contact-message"
                    label={ar ? 'رسالتك' : 'Message'}
                    required
                    error={errors.message}
                    ar={ar}
                  >
                    <textarea
                      id="contact-message"
                      rows={5}
                      value={form.message}
                      onChange={(event) => update('message', event.target.value)}
                      placeholder={
                        ar
                          ? 'اكتب تفاصيل طلبك أو سؤالك…'
                          : 'Tell us about your order or question…'
                      }
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={errors.message ? 'contact-message-error' : undefined}
                      className={`${inputClass('message')} min-h-[132px] resize-y leading-7`}
                    />
                  </FormField>

                  <AnimatePresence initial={false}>
                    {formError && (
                      <motion.p
                        role="alert"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-start gap-2 overflow-hidden rounded-2xl border border-red-400/30 bg-red-500/[0.06] px-3.5 py-3 text-[10.5px] font-bold leading-relaxed text-red-500"
                      >
                        <IconAlert size={13} className="mt-0.5 shrink-0" />
                        {formError}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col gap-3 border-t border-line/70 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                    <p className="flex items-center gap-1.5 text-[9px] font-semibold leading-relaxed text-muted/65">
                      <IconCheck size={11} />
                      {ar
                        ? 'بياناتك بتوصل للمحل فقط — بلا نشر أو مشاركة.'
                        : 'Your details go to the shop only — never shared.'}
                    </p>
                    <motion.button
                      type="submit"
                      whileHover={{ y: -1 }}
                      whileTap={{ scale: 0.985 }}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl gold-bg px-6 py-3.5 text-[12.5px] font-black text-cocoa shadow-[0_16px_34px_-16px_rgba(192,154,78,0.8)] transition-shadow hover:shadow-[0_20px_38px_-14px_rgba(192,154,78,0.65)]"
                    >
                      <IconWhatsApp size={16} />
                      {ar ? 'أرسل عبر واتساب' : 'Send on WhatsApp'}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.section>

          {/* ─── الوصول السريع + التفاصيل ─── */}
          <aside className="order-1 space-y-4 lg:order-2">
            <div className="rounded-[30px] border border-line/75 bg-surface/55 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03] sm:p-5">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-[0.25em] text-gold-deep dark:text-gold/80">
                    {ar ? 'وصول سريع' : 'QUICK REACH'}
                  </span>
                  <h3 className="mt-1 font-display text-lg tracking-wide text-ink dark:text-cream">
                    {ar ? 'احكي معنا مباشرة' : 'Talk to us directly'}
                  </h3>
                </div>
                <span className="h-2 w-2 rounded-full bg-gold" />
              </div>

              <div className="space-y-2.5">
                <QuickAction
                  href={waLink}
                  icon={<IconWhatsApp size={19} />}
                  label={ar ? 'واتساب' : 'WhatsApp'}
                  value={settings.whatsapp || (ar ? 'غير مفعّل' : 'Not configured')}
                  tone="whatsapp"
                  ar={ar}
                />
                <QuickAction
                  href={igLink}
                  icon={<IconInstagram size={19} />}
                  label="Instagram"
                  value={socials.instagram || (ar ? 'غير مفعّل' : 'Not configured')}
                  tone="instagram"
                  ar={ar}
                />
                <QuickAction
                  href={mapsLink}
                  icon={<IconPin size={19} />}
                  label={ar ? 'موقعنا على الخريطة' : 'Our location'}
                  value={(ar ? settings.address?.ar : settings.address?.en) || (ar ? 'لبنان' : 'Lebanon')}
                  tone="location"
                  ar={ar}
                />
              </div>
            </div>

            <div className="overflow-hidden rounded-[30px] border border-line/75 bg-surface/55 backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.03]">
              <div className={`border-b p-4 ${statusTone}`}>
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    {status.open === true && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-65" />
                    )}
                    <span
                      className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                        status.open === true
                          ? 'bg-emerald-500'
                          : status.open === false
                            ? 'bg-red-500'
                            : 'bg-gold'
                      }`}
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11.5px] font-black">{status.label}</p>
                    <p className="mt-0.5 truncate text-[9px] font-semibold opacity-70">
                      {status.detail || (ar ? settings.hours?.ar : settings.hours?.en)}
                    </p>
                  </div>
                  <IconClock size={16} className="shrink-0 opacity-60" />
                </div>
              </div>

              <div className="space-y-1 p-3.5">
                {settings.hours && (
                  <div className="flex items-start gap-2.5 rounded-2xl px-2.5 py-2.5">
                    <span className="mt-0.5 shrink-0 text-gold">
                      <IconClock size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[8.5px] font-black uppercase tracking-[0.16em] text-muted/70">
                        {ar ? 'ساعات العمل' : 'Opening hours'}
                      </p>
                      <p className="mt-0.5 text-[10.5px] font-bold leading-relaxed text-ink/80 dark:text-cream/75">
                        {ar ? settings.hours?.ar : settings.hours?.en}
                      </p>
                    </div>
                  </div>
                )}

                {settings.phone && (
                  <a
                    href={phoneLink}
                    className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2.5 transition-colors hover:bg-panel/55 dark:hover:bg-white/[0.04]"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                      <IconPhone size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[8.5px] font-black uppercase tracking-[0.16em] text-muted/70">
                        {ar ? 'هاتف' : 'Phone'}
                      </span>
                      <span className="mt-0.5 block truncate text-[10.5px] font-bold text-ink/80 dark:text-cream/75" dir="ltr">
                        {settings.phone}
                      </span>
                    </span>
                    <IconChevron size={12} className="text-muted/50" />
                  </a>
                )}

                {settings.email && (
                  <a
                    href={emailLink}
                    className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2.5 transition-colors hover:bg-panel/55 dark:hover:bg-white/[0.04]"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold-deep dark:text-gold">
                      <IconMail size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[8.5px] font-black uppercase tracking-[0.16em] text-muted/70">
                        {ar ? 'إيميل' : 'Email'}
                      </span>
                      <span className="mt-0.5 block truncate text-[10.5px] font-bold text-ink/80 dark:text-cream/75" dir="ltr">
                        {settings.email}
                      </span>
                    </span>
                    <IconChevron size={12} className="text-muted/50" />
                  </a>
                )}

                {mapsLink && (
                  <a
                    href={mapsLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-2xl px-2.5 py-2.5 transition-colors hover:bg-panel/55 dark:hover:bg-white/[0.04]"
                  >
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold-deep dark:text-gold">
                      <IconPin size={14} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[8.5px] font-black uppercase tracking-[0.16em] text-muted/70">
                        {ar ? 'العنوان' : 'Address'}
                      </span>
                      <span className="mt-0.5 block truncate text-[10.5px] font-bold text-ink/80 dark:text-cream/75">
                        {ar ? settings.address?.ar : settings.address?.en}
                      </span>
                    </span>
                    <IconChevron size={12} className="text-muted/50" />
                  </a>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
