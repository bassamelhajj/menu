import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { clampPercent } from '../../lib/format'
import { Card, Field, SectionHead } from './ui'
import { normalizeUrl } from '../../data/settings'
import {
  changeAdminPassword,
  hasAdminPasswordOverride,
  isAdminAuthConfigured,
  isSiteLockEnabled,
  resetAdminPassword,
  verifyAdminPassword,
} from '../../lib/env'

const FALLBACK_LOGO = '/brand/benova-logo.png'

/** مسار محلي أو رابط كامل — بدون ما نلمس /brand/... */
const normalizeLogoSrc = (value) => {
  const raw = String(value || '').trim()
  if (!raw) return FALLBACK_LOGO
  if (raw.startsWith('/') || /^(https?:)?\/\//i.test(raw)) return raw
  return normalizeUrl(raw)
}

export default function SettingsTab({ notify }) {
  const { t, lang } = useApp()
  const { settings, setSettings } = useContent()

  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' })
  const [passwordStatus, setPasswordStatus] = useState(null)
  const [savingPassword, setSavingPassword] = useState(false)
  const passwordOverrideActive = hasAdminPasswordOverride()

  const [draft, setDraft] = useState(() =>
    JSON.parse(
      JSON.stringify({
        name: settings.name,
        tagline: settings.tagline,
        logo: settings.logo || FALLBACK_LOGO,
        bio: settings.bio || { ar: '', en: '' },
        whatsapp: settings.whatsapp,
        phone: settings.phone,
        email: settings.email || '',
        socials: settings.socials || { facebook: '', instagram: '', tiktok: '' },
        mapsUrl: settings.mapsUrl || '',
        hours: settings.hours,
        address: settings.address,
        usdRate: settings.usdRate || 90000,
        storeStatus: settings.storeStatus || 'auto',
        deliveryFee: Math.max(0, Number(settings.deliveryFee) || 0),
        freeDeliveryOver: Math.max(0, Number(settings.freeDeliveryOver) || 0),
        // إعدادات العرض العام — نفس الشكل اللي بينحفظ بـ settings.globalOffer
        globalOfferActive: settings.globalOffer?.active || false,
        globalOfferPercent: clampPercent(settings.globalOffer?.percent || 0),
        globalOfferLabelAr: settings.globalOffer?.labelAr || 'عرض خاص',
        globalOfferLabelEn: settings.globalOffer?.labelEn || 'Special Offer',
        globalOfferStart: settings.globalOffer?.startDate || '',
        globalOfferEnd: settings.globalOffer?.endDate || '',
      }),
    ),
  )

  const set = (path, value) =>
    setDraft((d) => {
      const next = { ...d }
      const keys = path.split('.')
      let cur = next
      for (let i = 0; i < keys.length - 1; i += 1) cur = cur[keys[i]] = { ...(cur[keys[i]] || {}) }
      cur[keys[keys.length - 1]] = value
      return next
    })

  const handleChangePassword = async () => {
    setPasswordStatus(null)
    if (!passwordForm.current) {
      setPasswordStatus({ type: 'error', message: lang === 'ar' ? 'أدخل كلمة السر الحالية' : 'Enter the current password' })
      return
    }
    if (String(passwordForm.next || '').length < 4) {
      setPasswordStatus({ type: 'error', message: lang === 'ar' ? 'كلمة السر الجديدة 4 خانات على الأقل' : 'New password needs at least 4 characters' })
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordStatus({ type: 'error', message: lang === 'ar' ? 'تأكيد كلمة السر غير مطابق' : 'Password confirmation does not match' })
      return
    }

    setSavingPassword(true)
    try {
      const ok = await verifyAdminPassword(passwordForm.current)
      if (!ok) {
        setPasswordStatus({ type: 'error', message: lang === 'ar' ? 'كلمة السر الحالية غير صحيحة' : 'Current password is wrong' })
        return
      }
      await changeAdminPassword(passwordForm.next)
      setPasswordForm({ current: '', next: '', confirm: '' })
      setPasswordStatus({ type: 'success', message: lang === 'ar' ? 'تم تغيير كلمة السر بنجاح' : 'Password changed successfully' })
      notify(lang === 'ar' ? 'تم تغيير كلمة السر' : 'Password changed')
    } catch {
      setPasswordStatus({ type: 'error', message: lang === 'ar' ? 'تعذّر تغيير كلمة السر' : 'Could not change password' })
    } finally {
      setSavingPassword(false)
    }
  }

  const handleResetPassword = () => {
    resetAdminPassword()
    setPasswordForm({ current: '', next: '', confirm: '' })
    setPasswordStatus({ type: 'success', message: lang === 'ar' ? 'تمت استعادة كلمة السر الافتراضية' : 'Reset to the default password' })
    notify(lang === 'ar' ? 'تمت الاستعادة' : 'Reset complete')
  }

  const save = () => {
    setSettings({
      name: draft.name,
      tagline: draft.tagline,
      logo: normalizeLogoSrc(draft.logo),
      bio: {
        ar: String(draft.bio?.ar || '').trim(),
        en: String(draft.bio?.en || '').trim(),
      },
      whatsapp: String(draft.whatsapp).replace(/[^\d]/g, ''),
      phone: draft.phone,
      email: draft.email,
      socials: {
        facebook: normalizeUrl(String(draft.socials?.facebook || '').trim()),
        instagram: normalizeUrl(String(draft.socials?.instagram || '').trim()),
        tiktok: normalizeUrl(String(draft.socials?.tiktok || '').trim()),
      },
      mapsUrl: normalizeUrl(draft.mapsUrl),
      hours: draft.hours,
      address: draft.address,
      usdRate: Math.max(1, Number(draft.usdRate) || 90000),
      storeStatus: ['auto', 'open', 'closed'].includes(draft.storeStatus)
        ? draft.storeStatus
        : 'auto',
      deliveryFee: Math.max(0, Math.round(Number(draft.deliveryFee) || 0)),
      freeDeliveryOver: Math.max(0, Math.round(Number(draft.freeDeliveryOver) || 0)),
      // إعدادات العرض العام للمنيو — الشكل الموحّد (percent / labelAr / labelEn)
      globalOffer: {
        active: draft.globalOfferActive || false,
        percent: clampPercent(draft.globalOfferPercent),
        labelAr: draft.globalOfferLabelAr || 'عرض خاص',
        labelEn: draft.globalOfferLabelEn || 'Special Offer',
        startDate: draft.globalOfferStart || '',
        endDate: draft.globalOfferEnd || '',
      },
    })
    notify(t('save') + ' ✅')
  }

  return (
    <div className="space-y-4">
      <SectionHead
        title={t('settings')}
        hint={
          lang === 'ar'
            ? 'الهوية، التواصل، الأمان، العروض، وحالة المتجر — كل ما يلزم لإدارة الواجهة من مكان واحد.'
            : 'Identity, contact, security, offers and live status — everything the storefront needs in one place.'
        }
      />

      <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
      <Card>
        <p className="mb-3 text-[11px] font-black text-gold">🏷️ {t('nameAr')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label={lang === 'ar' ? 'الاسم (عربي)' : 'Name (AR)'} value={draft.name.ar} onChange={(v) => set('name.ar', v)} />
          <Field label={lang === 'ar' ? 'الاسم (إنجليزي)' : 'Name (EN)'} value={draft.name.en} onChange={(v) => set('name.en', v)} />
          <Field label={lang === 'ar' ? 'الشعار النصي (عربي)' : 'Tagline (AR)'} value={draft.tagline.ar} onChange={(v) => set('tagline.ar', v)} />
          <Field label={lang === 'ar' ? 'الشعار النصي (إنجليزي)' : 'Tagline (EN)'} value={draft.tagline.en} onChange={(v) => set('tagline.en', v)} />
        </div>

        {/* اللوغو: رابط كامل أو مسار محلي داخل public */}
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_4.25rem] sm:items-end">
          <Field
            label={lang === 'ar' ? 'رابط اللوغو أو مساره' : 'Logo URL / path'}
            value={draft.logo}
            onChange={(v) => set('logo', v)}
            placeholder="/brand/benova-logo.png"
          />
          <span className="grid h-16 w-16 place-items-center overflow-hidden rounded-2xl border border-line bg-[#f4ead3] p-1.5">
            <img
              src={normalizeLogoSrc(draft.logo)}
              alt="BENOVA logo preview"
              onError={(event) => {
                if (event.currentTarget.dataset.fallback) return
                event.currentTarget.dataset.fallback = 'true'
                event.currentTarget.src = FALLBACK_LOGO
              }}
              className="h-full w-full object-contain"
            />
          </span>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field
            rows={3}
            label={lang === 'ar' ? 'وصف قصير للفوتر (عربي)' : 'Footer bio (AR)'}
            value={draft.bio?.ar || ''}
            onChange={(v) => set('bio.ar', v)}
            placeholder="كريب طازج، شوكولاتة بلجيكية…"
          />
          <Field
            rows={3}
            label={lang === 'ar' ? 'وصف قصير للفوتر (إنجليزي)' : 'Footer bio (EN)'}
            value={draft.bio?.en || ''}
            onChange={(v) => set('bio.en', v)}
            placeholder="Fresh crepes, Belgian chocolate…"
          />
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-[11px] font-black text-gold">📞 {t('checkout')}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label={lang === 'ar' ? 'رقم واتساب (بصيغة دولية بدون +)' : 'WhatsApp (intl, no +)'}
            value={draft.whatsapp}
            onChange={(v) => set('whatsapp', v)}
            placeholder="96103090419"
          />
          <Field label="Phone" value={draft.phone} onChange={(v) => set('phone', v)} />
          <Field label="Email" value={draft.email} onChange={(v) => set('email', v)} />
          <Field label={lang === 'ar' ? 'رابط الخريطة (Google Maps)' : 'Maps URL'} value={draft.mapsUrl} onChange={(v) => set('mapsUrl', v)} />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field label={lang === 'ar' ? 'ساعات الدوام (عربي)' : 'Hours (AR)'} value={draft.hours.ar} onChange={(v) => set('hours.ar', v)} />
          <Field label={lang === 'ar' ? 'ساعات الدوام (إنجليزي)' : 'Hours (EN)'} value={draft.hours.en} onChange={(v) => set('hours.en', v)} />
          <Field label={lang === 'ar' ? 'العنوان (عربي)' : 'Address (AR)'} value={draft.address.ar} onChange={(v) => set('address.ar', v)} />
          <Field label={lang === 'ar' ? 'العنوان (إنجليزي)' : 'Address (EN)'} value={draft.address.en} onChange={(v) => set('address.en', v)} />
        </div>
      </Card>

      <Card>
        <p className="mb-3 text-[11px] font-black text-gold">
          🟢 {lang === 'ar' ? 'حالة استقبال الطلبات' : 'Live ordering status'}
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { id: 'auto', ar: 'تلقائي', en: 'Auto', subAr: 'حسب الدوام', subEn: 'By hours' },
            { id: 'open', ar: 'مفتوح', en: 'Open', subAr: 'استقبال', subEn: 'Accepting' },
            { id: 'closed', ar: 'مغلق', en: 'Closed', subAr: 'متوقف', subEn: 'Paused' },
          ].map((option) => {
            const selected = (draft.storeStatus || 'auto') === option.id
            const tone =
              option.id === 'open'
                ? 'border-emerald-400/30 bg-emerald-400/[0.09] text-emerald-300'
                : option.id === 'closed'
                  ? 'border-red-400/30 bg-red-500/[0.09] text-red-300'
                  : 'border-gold/30 bg-gold/[0.09] text-gold'
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => set('storeStatus', option.id)}
                className={`rounded-xl border px-2 py-2.5 text-center transition-colors ${
                  selected
                    ? tone
                    : 'border-white/[0.06] bg-white/[0.02] text-white/30 hover:border-white/15'
                }`}
              >
                <span className="block text-[10px] font-black">
                  {lang === 'ar' ? option.ar : option.en}
                </span>
                <span className="mt-0.5 block text-[7.5px] font-bold opacity-65">
                  {lang === 'ar' ? option.subAr : option.subEn}
                </span>
              </button>
            )
          })}
        </div>
        <p className="mt-2.5 rounded-xl border border-gold/12 bg-gold/[0.045] px-3 py-2 text-[9px] font-bold leading-relaxed text-white/32">
          {draft.storeStatus === 'auto'
            ? lang === 'ar'
              ? 'الحالة تتبع ساعات الدوام المكتوبة أعلاه، وتتحدّث تلقائياً.'
              : 'Status follows the business hours above and refreshes automatically.'
            : draft.storeStatus === 'open'
              ? lang === 'ar'
                ? 'المتجر مفتوح يدوياً — استقبال الطلبات مفعّل بغض النظر عن الوقت.'
                : 'Store is manually open — ordering stays enabled regardless of time.'
              : lang === 'ar'
                ? 'المتجر مغلق يدوياً — زر الطلب في السلة معطّل حتى تعيد الفتح.'
                : 'Store is manually closed — cart checkout is disabled until reopened.'}
        </p>
      </Card>

      <Card>
        <p className="mb-3 text-[11px] font-black text-gold">
          🛵 {lang === 'ar' ? 'رسوم التوصيل' : 'Delivery fees'}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label={lang === 'ar' ? 'سعر التوصيل (ل.ل)' : 'Delivery fee (LL)'}
            type="number"
            min={0}
            step={5000}
            value={draft.deliveryFee}
            onChange={(value) => set('deliveryFee', Math.max(0, Number(value) || 0))}
            hint={
              lang === 'ar'
                ? `≈ $${((Number(draft.deliveryFee) || 0) / (Number(draft.usdRate) || 90000)).toFixed(2)} · صفر = بدون رسوم`
                : `≈ $${((Number(draft.deliveryFee) || 0) / (Number(draft.usdRate) || 90000)).toFixed(2)} · zero disables`
            }
          />
          <Field
            label={lang === 'ar' ? 'توصيل مجاني فوق (ل.ل)' : 'Free delivery over (LL)'}
            type="number"
            min={0}
            step={50000}
            value={draft.freeDeliveryOver}
            onChange={(value) => set('freeDeliveryOver', Math.max(0, Number(value) || 0))}
            hint={lang === 'ar' ? 'صفر = غير مفعّل' : 'Zero disables free delivery'}
          />
        </div>
        <p className="mt-2.5 text-[9px] font-bold leading-relaxed text-white/28">
          {lang === 'ar'
            ? 'تُطبَّق الرسوم على التوصيل فقط، والاستلام من المحل مجاني. لنشر التفاصيل استخدم تبويب «التوصيل والرسوم».'
            : 'Fees apply to delivery only; pickup stays free. Use the dedicated Delivery & Fees tab for the full preview.'}
        </p>
      </Card>

      <Card>
        <p className="mb-3 text-[11px] font-black text-gold">🔒 {lang === 'ar' ? 'الأمان والوصول' : 'Security & Access'}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <span className="text-[10px] font-bold text-white/55">
              {lang === 'ar' ? 'دخول لوحة التحكم' : 'Admin access'}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                isAdminAuthConfigured
                  ? 'bg-emerald-400/15 text-emerald-300'
                  : 'bg-amber-400/15 text-amber-300'
              }`}
            >
              {isAdminAuthConfigured
                ? lang === 'ar'
                  ? 'مهيأ'
                  : 'Configured'
                : lang === 'ar'
                  ? 'غير مهيأ'
                  : 'Not configured'}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5">
            <span className="text-[10px] font-bold text-white/55">
              {lang === 'ar' ? 'قفل المنيو' : 'Menu lock'}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                isSiteLockEnabled
                  ? 'bg-emerald-400/15 text-emerald-300'
                  : 'bg-white/10 text-white/45'
              }`}
            >
              {isSiteLockEnabled
                ? lang === 'ar'
                  ? 'مفعّل'
                  : 'Enabled'
                : lang === 'ar'
                  ? 'مفتوح'
                  : 'Open'}
            </span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.025] p-3.5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-black text-white/65">
              {lang === 'ar' ? 'تغيير كلمة سر الأدمن' : 'Change admin password'}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider ${
                passwordOverrideActive
                  ? 'bg-gold/15 text-gold'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              {passwordOverrideActive
                ? lang === 'ar'
                  ? 'مخصّصة على هذا المتصفح'
                  : 'Local override'
                : lang === 'ar'
                  ? 'الافتراضية'
                  : 'Default'}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label={lang === 'ar' ? 'كلمة السر الحالية' : 'Current password'}
              type="password"
              value={passwordForm.current}
              onChange={(value) => setPasswordForm((form) => ({ ...form, current: value }))}
              placeholder="••••••••"
            />
            <Field
              label={lang === 'ar' ? 'كلمة السر الجديدة' : 'New password'}
              type="password"
              value={passwordForm.next}
              onChange={(value) => setPasswordForm((form) => ({ ...form, next: value }))}
              placeholder="••••••••"
              hint={lang === 'ar' ? '4 خانات على الأقل' : 'At least 4 characters'}
            />
            <Field
              label={lang === 'ar' ? 'تأكيد كلمة السر' : 'Confirm password'}
              type="password"
              value={passwordForm.confirm}
              onChange={(value) => setPasswordForm((form) => ({ ...form, confirm: value }))}
              placeholder="••••••••"
            />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleChangePassword}
              disabled={savingPassword}
              className="btn-primary px-4 py-2 text-[10px] disabled:opacity-55"
            >
              {savingPassword
                ? lang === 'ar'
                  ? 'جارٍ الحفظ…'
                  : 'Saving…'
                : lang === 'ar'
                  ? 'حفظ كلمة السر'
                  : 'Save password'}
            </button>
            {passwordOverrideActive && (
              <button
                type="button"
                onClick={handleResetPassword}
                className="rounded-xl border border-white/12 bg-white/[0.03] px-4 py-2 text-[10px] font-extrabold text-white/55 transition-colors hover:border-white/20 hover:text-white/75"
              >
                {lang === 'ar' ? 'استعادة الافتراضية' : 'Reset to default'}
              </button>
            )}
          </div>

          {passwordStatus && (
            <p
              className={`mt-2.5 rounded-xl border px-3 py-2 text-[9.5px] font-bold leading-relaxed ${
                passwordStatus.type === 'success'
                  ? 'border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-300'
                  : 'border-red-400/20 bg-red-500/[0.07] text-red-300'
              }`}
            >
              {passwordStatus.message}
            </p>
          )}

          <p className="mt-2.5 text-[9px] font-bold leading-relaxed text-white/32">
            {lang === 'ar'
              ? '🔐 تُحفظ كلمة السر الجديدة كـ SHA-256 في هذا المتصفح فقط، وتُستخدم عند الدخول التالي. لتغييرها على كل الأجهزة، حدّث VITE_ADMIN_PASSWORD_SHA256 في الاستضافة.'
              : '🔐 The new password is stored as SHA-256 in this browser only and is used for the next sign-in. To change it on every device, update VITE_ADMIN_PASSWORD_SHA256 on the host.'}
          </p>
        </div>

        <p className="mt-2.5 rounded-xl border border-gold/12 bg-gold/[0.045] px-3 py-2 text-[9px] font-bold leading-relaxed text-white/32">
          {lang === 'ar'
            ? '🔐 بيانات الدخول الأساسية تُضبط من متغيرات البيئة على الاستضافة. لا تُحفظ كلمات السر ولا بيانات الزبائن في content.json.'
            : '🔐 Base credentials are set through the host environment. Passwords and customer data are never stored in content.json.'}
        </p>
      </Card>

      <Card>
        <p className="mb-3 text-[11px] font-black text-gold">🎁 {lang === 'ar' ? 'العروض الخاصة' : 'Special Offers'}</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            label={lang === 'ar' ? 'عروض المنيو العام (%)' : 'Global Menu Discount (%)'}
            value={draft.globalOfferPercent ?? ''}
            type="number"
            min={0}
            max={99}
            step={1}
            onChange={(value) => set('globalOfferPercent', clampPercent(value))}
            hint={lang === 'ar' ? 'الحد الأقصى 99% — يمنع الأسعار السالبة' : 'Capped at 99% to prevent negative prices'}
          />
          <Field
            label={lang === 'ar' ? 'عنوان العرض (عربي) — مثل: عرض رمضان' : 'Offer Label (AR)'}
            value={draft.globalOfferLabelAr || 'عرض خاص'}
            onChange={(v) => set('globalOfferLabelAr', v)}
          />
          <Field
            label={lang === 'ar' ? 'عنوان العرض (إنجليزي)' : 'Offer Label (EN)'}
            value={draft.globalOfferLabelEn || 'Special Offer'}
            onChange={(v) => set('globalOfferLabelEn', v)}
          />
          <Field
            label={lang === 'ar' ? 'تاريخ بداية العرض' : 'Offer Start Date'}
            value={draft.globalOfferStart || ''}
            type="date"
            onChange={(v) => set('globalOfferStart', v)}
          />
          <Field
            label={lang === 'ar' ? 'تاريخ نهاية العرض' : 'Offer End Date'}
            value={draft.globalOfferEnd || ''}
            type="date"
            onChange={(v) => set('globalOfferEnd', v)}
          />
        </div>
        <label className="mt-3 flex cursor-pointer items-center gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
          <input
            type="checkbox"
            checked={draft.globalOfferActive || false}
            onChange={(e) => set('globalOfferActive', e.target.checked)}
            className="h-4 w-4 accent-[#d5b46a]"
          />
          <span className="text-[10px] font-extrabold text-white/55">
            {lang === 'ar' ? 'تفعيل عرض المنيو العام' : 'Enable global menu discount'}
          </span>
        </label>
        <p className="mt-2.5 rounded-xl border border-gold/12 bg-gold/[0.045] px-3 py-2 text-[9px] font-bold leading-relaxed text-white/32">
          {lang === 'ar'
            ? '💡 عرض المنيو العام يطبق على جميع الأصناف تلقائياً، وإذا كان للمنتج عرض خاص بنفس الوقت، ينُطبَّق السعر الأقل بين الاثنين. أي نسبة فوق 99% تنقصّ تلقائياً.'
            : '💡 Global menu discount applies to all items. If a product has its own offer, the lower price is applied. Any value above 99% is clamped automatically.'}
        </p>
      </Card>

      <Card>
        <p className="mb-3 text-[11px] font-black text-gold">🌐 {t('pages')}</p>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Facebook URL" value={draft.socials.facebook} onChange={(v) => set('socials.facebook', v)} />
          <Field label="Instagram URL" value={draft.socials.instagram} onChange={(v) => set('socials.instagram', v)} />
          <Field label="TikTok URL" value={draft.socials.tiktok} onChange={(v) => set('socials.tiktok', v)} />
          <div />
          <Field label="USD Rate (ل.ل per $)" type="number" value={draft.usdRate} onChange={(v) => set('usdRate', v)} />
        </div>
      </Card>

      <button
        type="button"
        className="btn-primary w-full py-3 xl:col-span-2"
        onClick={save}
      >
        💾 {t('save')}
      </button>
      </div>
    </div>
  )
}