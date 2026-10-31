import { useRef, useState } from 'react'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { uid } from '../../lib/helpers'
import { fileToCompressedDataUrl } from '../../lib/auth'
import { Card, Field, IconBtn, SectionHead, Toggle, useConfirm } from './ui'
import {
  IconChevron,
  IconCog,
  IconEdit,
  IconImage,
  IconMail,
  IconPhone,
  IconPlus,
  IconTrash,
  IconUpload,
  IconWhatsApp,
} from '../../components/icons'

export default function PagesTab({ goTab }) {
  const { t, lang } = useApp()
  const { pages, setPages } = useContent()
  const ar = lang === 'ar'

  const onPage = (key, patch) =>
    setPages({ ...pages, [key]: { ...pages[key], ...patch } })

  return (
    <div className="space-y-4">
      <SectionHead
        title={ar ? 'الصفحات والوسائط' : 'Pages & media'}
        hint={
          ar
            ? 'تحكّم بصفحات «من نحن»، الأسئلة الشائعة، آراء المعرض، كتاب المنيو، وبيانات التواصل.'
            : 'Manage About, FAQ, showcase reviews, the menu book gallery, and contact details.'
        }
      />

      <div className="grid gap-4 2xl:grid-cols-2 2xl:items-start">
        <div className="space-y-4">
          <PageCard
            title={t('aboutPage')}
            active={pages.about.active}
            onToggle={(value) => onPage('about', { active: value })}
            render={() => (
              <>
                <Field
                  label={t('nameAr')}
                  value={pages.about.title.ar}
                  onChange={(value) =>
                    onPage('about', { title: { ...pages.about.title, ar: value } })
                  }
                />
                <Field
                  label={t('nameEn')}
                  value={pages.about.title.en}
                  onChange={(value) =>
                    onPage('about', { title: { ...pages.about.title, en: value } })
                  }
                />
                <Field
                  label={t('descAr')}
                  rows={5}
                  value={pages.about.body.ar}
                  onChange={(value) =>
                    onPage('about', { body: { ...pages.about.body, ar: value } })
                  }
                />
                <Field
                  label={t('descEn')}
                  rows={5}
                  value={pages.about.body.en}
                  onChange={(value) =>
                    onPage('about', { body: { ...pages.about.body, en: value } })
                  }
                />
              </>
            )}
          />

          <PageCard
            title={t('faqPage')}
            active={pages.faq.active}
            onToggle={(value) => onPage('faq', { active: value })}
            render={() => (
              <FaqEditor
                items={pages.faq.items}
                onSave={(items) => onPage('faq', { items })}
              />
            )}
          />

          <PageCard
            title={t('reviewsPage')}
            active={pages.reviews.active}
            onToggle={(value) => onPage('reviews', { active: value })}
            render={() => (
              <ReviewsEditor
                items={pages.reviews.items}
                onSave={(items) => onPage('reviews', { items })}
              />
            )}
          />
        </div>

        <div className="space-y-4">
          <GalleryEditor />
          <ContactCard goTab={goTab} />
        </div>
      </div>
    </div>
  )
}

function PageCard({ title, active, onToggle, render }) {
  const { t } = useApp()
  const [open, setOpen] = useState(false)
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-0 items-center gap-2.5 text-start"
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/[0.07] bg-white/[0.03] text-white/35">
            <IconChevron
              size={13}
              className={`transition-transform ${open ? 'rotate-180' : ''}`}
            />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[12px] font-black text-white/72">{title}</span>
            <span className={`mt-1 inline-block rounded-full border px-1.5 py-0.5 text-[7px] font-black ${
              active
                ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300/70'
                : 'border-white/10 bg-white/[0.03] text-white/25'
            }`}>
              {active ? t('active') : t('inactive')}
            </span>
          </span>
        </button>
        <Toggle checked={active} onChange={onToggle} />
      </div>
      {open && <div className="mt-4 space-y-3">{render()}</div>}
    </Card>
  )
}

/* ---------------- FAQ ---------------- */
const NewFaq = { id: '', q: { ar: '', en: '' }, a: { ar: '', en: '' }, active: true }

function FaqEditor({ items, onSave }) {
  const { t, lang } = useApp()
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(null)
  const [confirm, confirmDialog] = useConfirm()
  const ar = lang === 'ar'

  const save = () => {
    if (!draft) return
    const item = {
      ...draft,
      id: draft.id || uid('faq'),
      q: { ...draft.q },
      a: { ...draft.a },
    }
    onSave(
      editing === 'new'
        ? [...items, item]
        : items.map((entry) => (entry.id === item.id ? item : entry)),
    )
    setEditing(null)
  }

  const remove = async (item) => {
    const approved = await confirm({
      title: ar ? 'حذف هذا السؤال؟' : 'Delete this question?',
      message: ar
        ? 'رح ينحذف السؤال وجوابه من صفحة الأسئلة الشائعة.'
        : 'The question and its answer will be removed from the FAQ page.',
      confirmLabel: ar ? 'حذف السؤال' : 'Delete question',
      cancelLabel: ar ? 'إلغاء' : 'Cancel',
    })
    if (approved) onSave(items.filter((entry) => entry.id !== item.id))
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="btn-ghost"
        onClick={() => {
          setDraft(JSON.parse(JSON.stringify(NewFaq)))
          setEditing('new')
        }}
      >
        <IconPlus size={14} /> {t('addNew')}
      </button>

      {editing && draft && (
        <Card className="border-gold/50">
          <Field
            label={t('nameAr')}
            value={draft.q.ar}
            onChange={(value) => setDraft((current) => ({ ...current, q: { ...current.q, ar: value } }))}
          />
          <Field
            label={t('nameEn')}
            value={draft.q.en}
            onChange={(value) => setDraft((current) => ({ ...current, q: { ...current.q, en: value } }))}
          />
          <Field
            label={t('descAr')}
            rows={2}
            value={draft.a.ar}
            onChange={(value) => setDraft((current) => ({ ...current, a: { ...current.a, ar: value } }))}
          />
          <Field
            label={t('descEn')}
            rows={2}
            value={draft.a.en}
            onChange={(value) => setDraft((current) => ({ ...current, a: { ...current.a, en: value } }))}
          />
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
              {t('cancel')}
            </button>
            <button type="button" className="btn-primary" onClick={save}>
              {t('save')}
            </button>
          </div>
        </Card>
      )}

      {items.map((item) =>
        editing === item.id ? null : (
          <div
            key={item.id}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.022] px-3 py-2"
          >
            <p className="min-w-0 flex-1 truncate text-[10px] font-extrabold text-white/55">
              {item.q.ar} / {item.q.en}
            </p>
            <Toggle
              checked={item.active !== false}
              onChange={(value) =>
                onSave(items.map((entry) => (entry.id === item.id ? { ...entry, active: value } : entry)))
              }
            />
            <IconBtn
              title={t('edit')}
              onClick={() => {
                setDraft(item)
                setEditing(item.id)
              }}
            >
              <IconEdit size={14} />
            </IconBtn>
            <IconBtn title={t('delete')} danger onClick={() => remove(item)}>
              <IconTrash size={14} />
            </IconBtn>
          </div>
        ),
      )}

      {confirmDialog}
    </div>
  )
}

/* ---------------- Reviews ---------------- */
const NewRev = {
  id: '',
  name: '',
  rating: 5,
  date: new Date().toISOString().slice(0, 10),
  text: { ar: '', en: '' },
  active: true,
}

function ReviewsEditor({ items, onSave }) {
  const { t, lang } = useApp()
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(null)
  const [confirm, confirmDialog] = useConfirm()
  const ar = lang === 'ar'

  const save = () => {
    if (!draft) return
    const item = {
      ...draft,
      id: draft.id || uid('rev'),
      rating: Math.min(5, Math.max(1, Number(draft.rating) || 5)),
      text: { ...draft.text },
    }
    onSave(
      editing === 'new'
        ? [item, ...items]
        : items.map((entry) => (entry.id === item.id ? item : entry)),
    )
    setEditing(null)
  }

  const remove = async (item) => {
    const approved = await confirm({
      title: ar ? `حذف رأي ${item.name}؟` : `Delete ${item.name}'s review?`,
      message: ar
        ? 'رح ينحذف الرأي من صفحة آراء المعرض.'
        : 'The review will be removed from the showcase reviews page.',
      confirmLabel: ar ? 'حذف الرأي' : 'Delete review',
      cancelLabel: ar ? 'إلغاء' : 'Cancel',
    })
    if (approved) onSave(items.filter((entry) => entry.id !== item.id))
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="btn-ghost"
        onClick={() => {
          setDraft(JSON.parse(JSON.stringify(NewRev)))
          setEditing('new')
        }}
      >
        <IconPlus size={14} /> {t('addNew')}
      </button>

      {editing && draft && (
        <Card className="border-gold/50">
          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label={t('yourName')}
              value={draft.name}
              onChange={(value) => setDraft((current) => ({ ...current, name: value }))}
            />
            <Field
              label={ar ? 'التقييم (1-5)' : 'Rating (1-5)'}
              type="number"
              min={1}
              max={5}
              value={draft.rating}
              onChange={(value) =>
                setDraft((current) => ({
                  ...current,
                  rating: Math.min(5, Math.max(1, Number(value) || 1)),
                }))
              }
            />
            <Field
              label={ar ? 'التاريخ' : 'Date'}
              type="date"
              value={draft.date}
              onChange={(value) => setDraft((current) => ({ ...current, date: value }))}
            />
          </div>
          <Field
            label={t('descAr')}
            rows={2}
            value={draft.text.ar}
            onChange={(value) => setDraft((current) => ({ ...current, text: { ...current.text, ar: value } }))}
          />
          <Field
            label={t('descEn')}
            rows={2}
            value={draft.text.en}
            onChange={(value) => setDraft((current) => ({ ...current, text: { ...current.text, en: value } }))}
          />
          <div className="mt-3 flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
              {t('cancel')}
            </button>
            <button type="button" className="btn-primary" onClick={save}>
              {t('save')}
            </button>
          </div>
        </Card>
      )}

      {items.map((item) =>
        editing === item.id ? null : (
          <div
            key={item.id}
            className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.022] px-3 py-2"
          >
            <p className="min-w-0 flex-1 truncate text-[10px] font-extrabold text-white/55">
              {'★'.repeat(item.rating) || '—'} {item.name}
            </p>
            <Toggle
              checked={item.active !== false}
              onChange={(value) =>
                onSave(items.map((entry) => (entry.id === item.id ? { ...entry, active: value } : entry)))
              }
            />
            <IconBtn
              title={t('edit')}
              onClick={() => {
                setDraft(item)
                setEditing(item.id)
              }}
            >
              <IconEdit size={14} />
            </IconBtn>
            <IconBtn title={t('delete')} danger onClick={() => remove(item)}>
              <IconTrash size={14} />
            </IconBtn>
          </div>
        ),
      )}

      {confirmDialog}
    </div>
  )
}

/* ---------------- Gallery / menu media ---------------- */
function GalleryEditor() {
  const { lang, notify } = useApp()
  const { gallery, setGallery } = useContent()
  const ar = lang === 'ar'
  const [uploading, setUploading] = useState(false)
  const [confirm, confirmDialog] = useConfirm()
  const addRef = useRef(null)

  const addImage = async (file) => {
    if (!file) return
    setUploading(true)
    try {
      const src = await fileToCompressedDataUrl(file, 900, 0.74)
      const next = [
        ...gallery,
        {
          id: uid('gal'),
          src,
          ar: ar ? 'صفحة جديدة' : 'New page',
          en: ar ? 'New page' : 'New page',
        },
      ]
      setGallery(next)
      notify(ar ? 'تمت إضافة صفحة للمعرض ✓' : 'Gallery page added ✓')
    } catch {
      notify(ar ? 'تعذّر رفع الصورة' : 'Could not upload image')
    } finally {
      setUploading(false)
    }
  }

  const replaceImage = async (id, file) => {
    if (!file) return
    setUploading(true)
    try {
      const src = await fileToCompressedDataUrl(file, 900, 0.74)
      setGallery(gallery.map((item) => (item.id === id ? { ...item, src } : item)))
      notify(ar ? 'تم استبدال الصورة ✓' : 'Image replaced ✓')
    } catch {
      notify(ar ? 'تعذّر رفع الصورة' : 'Could not upload image')
    } finally {
      setUploading(false)
    }
  }

  const updateLabel = (id, key, value) => {
    setGallery(gallery.map((item) => (item.id === id ? { ...item, [key]: value } : item)))
  }

  const move = (index, direction) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= gallery.length) return
    const next = [...gallery]
    ;[next[index], next[nextIndex]] = [next[nextIndex], next[index]]
    setGallery(next)
  }

  const remove = async (item, index) => {
    const approved = await confirm({
      title: ar ? `حذف صفحة المعرض ${index + 1}؟` : `Delete gallery page ${index + 1}?`,
      message: ar
        ? 'رح تنحذف الصفحة من كتاب المنيو بعد النشر.'
        : 'This page will be removed from the menu book after publishing.',
      confirmLabel: ar ? 'حذف الصفحة' : 'Delete page',
      cancelLabel: ar ? 'إلغاء' : 'Cancel',
    })
    if (approved) setGallery(gallery.filter((entry) => entry.id !== item.id))
  }

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-gold/20 bg-gold/[0.08] text-gold">
            <IconImage size={16} />
          </span>
          <div>
            <h3 className="text-[12px] font-black text-white/72">
              {ar ? 'معرض المنيو / كتاب الصفحات' : 'Menu gallery / book pages'}
            </h3>
            <p className="mt-0.5 text-[8.5px] font-bold text-white/28">
              {gallery.length} {ar ? 'صفحة' : 'pages'} · {ar ? 'تظهر في الصفحة الرئيسية' : 'shown on the homepage'}
            </p>
          </div>
        </div>

        <input
          ref={addRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            addImage(event.target.files?.[0])
            event.target.value = ''
          }}
        />
        <button
          type="button"
          onClick={() => addRef.current?.click()}
          disabled={uploading}
          className="btn-primary !px-3 !py-2 disabled:opacity-40"
        >
          <IconUpload size={14} />
          {uploading ? (ar ? 'جارٍ الرفع…' : 'Uploading…') : ar ? 'إضافة صفحة' : 'Add page'}
        </button>
      </div>

      {gallery.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/[0.08] px-4 py-10 text-center">
          <IconImage size={22} className="mx-auto text-gold/40" />
          <p className="mt-2 text-[10px] font-bold text-white/30">
            {ar ? 'ما في صفحات بعد.' : 'No pages yet.'}
          </p>
        </div>
      )}

      <div className="grid gap-2.5 sm:grid-cols-2">
        {gallery.map((item, index) => (
          <div
            key={item.id}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.022] p-2.5"
          >
            <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/30">
              <img
                src={item.src}
                alt={item.en || item.ar}
                className="aspect-[3/4] w-full object-cover"
              />
              <span className="absolute start-2 top-2 rounded-full border border-white/15 bg-black/60 px-1.5 py-0.5 text-[7.5px] font-black text-white/75 backdrop-blur">
                {index + 1}
              </span>
            </div>

            <div className="mt-2 space-y-1.5">
              <input
                className="field !py-2 text-[10px]"
                value={item.ar || ''}
                placeholder={ar ? 'اسم الصفحة بالعربي' : 'Arabic label'}
                onChange={(event) => updateLabel(item.id, 'ar', event.target.value)}
              />
              <input
                className="field !py-2 text-[10px]"
                value={item.en || ''}
                placeholder={ar ? 'اسم الصفحة بالإنجليزي' : 'English label'}
                onChange={(event) => updateLabel(item.id, 'en', event.target.value)}
              />
            </div>

            <div className="mt-2 flex items-center justify-between gap-1">
              <div className="flex items-center gap-1">
                <IconBtn
                  title={ar ? 'تحريك للأعلى' : 'Move up'}
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                >
                  <IconChevron size={13} className="rotate-180" />
                </IconBtn>
                <IconBtn
                  title={ar ? 'تحريك للأسفل' : 'Move down'}
                  onClick={() => move(index, 1)}
                  disabled={index === gallery.length - 1}
                >
                  <IconChevron size={13} />
                </IconBtn>
              </div>

              <div className="flex items-center gap-1">
                <label
                  title={ar ? 'استبدال الصورة' : 'Replace image'}
                  className="grid h-9 w-9 cursor-pointer place-items-center rounded-xl border border-white/[0.08] bg-white/[0.035] text-white/45 transition-colors hover:border-gold/40 hover:text-gold"
                >
                  <IconUpload size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      replaceImage(item.id, event.target.files?.[0])
                      event.target.value = ''
                    }}
                  />
                </label>
                <IconBtn
                  title={ar ? 'حذف الصفحة' : 'Delete page'}
                  danger
                  onClick={() => remove(item, index)}
                >
                  <IconTrash size={14} />
                </IconBtn>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-[8px] font-semibold leading-relaxed text-white/22">
        {ar
          ? 'الصور تُضغط تلقائياً قبل الحفظ. الصور الكبيرة تستهلك مساحة LocalStorage — راقب المؤشر في الشريط العلوي.'
          : 'Images are compressed automatically before saving. Large files consume local storage — watch the meter in the top bar.'}
      </p>

      {confirmDialog}
    </Card>
  )
}

/* ---------------- Contact ---------------- */
function ContactCard({ goTab }) {
  const { lang, notify } = useApp()
  const { settings, setSettings } = useContent()
  const ar = lang === 'ar'

  const [draft, setDraft] = useState(() => ({
    whatsapp: settings.whatsapp || '',
    phone: settings.phone || '',
    email: settings.email || '',
    mapsUrl: settings.mapsUrl || '',
    addressAr: settings.address?.ar || '',
    addressEn: settings.address?.en || '',
    hoursAr: settings.hours?.ar || '',
    hoursEn: settings.hours?.en || '',
  }))

  const set = (key, value) => setDraft((current) => ({ ...current, [key]: value }))

  const save = () => {
    setSettings({
      whatsapp: String(draft.whatsapp || '').replace(/[^\d]/g, ''),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      mapsUrl: draft.mapsUrl.trim(),
      address: { ar: draft.addressAr.trim(), en: draft.addressEn.trim() },
      hours: { ar: draft.hoursAr.trim(), en: draft.hoursEn.trim() },
    })
    notify(ar ? 'تم حفظ بيانات التواصل ✓' : 'Contact details saved ✓')
  }

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-300/80">
            <IconWhatsApp size={16} />
          </span>
          <div>
            <h3 className="text-[12px] font-black text-white/72">
              {ar ? 'بيانات التواصل' : 'Contact details'}
            </h3>
            <p className="mt-0.5 text-[8.5px] font-bold text-white/28">
              {ar ? 'تظهر في صفحة التواصل والفوتر' : 'Used on the contact page and footer'}
            </p>
          </div>
        </div>
        {goTab && (
          <button
            type="button"
            onClick={() => goTab('settings')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-2 py-1.5 text-[8px] font-black text-white/30 transition-colors hover:text-gold"
          >
            <IconCog size={11} />
            {ar ? 'كل الإعدادات' : 'All settings'}
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="WhatsApp"
          value={draft.whatsapp}
          onChange={(value) => set('whatsapp', value)}
          hint={ar ? 'أرقام فقط بصيغة دولية' : 'Digits only, international format'}
        />
        <Field label={ar ? 'الهاتف' : 'Phone'} value={draft.phone} onChange={(value) => set('phone', value)} />
        <Field label="Email" type="email" value={draft.email} onChange={(value) => set('email', value)} />
        <Field label={ar ? 'رابط الخريطة' : 'Maps URL'} value={draft.mapsUrl} onChange={(value) => set('mapsUrl', value)} />
        <Field label={ar ? 'العنوان (عربي)' : 'Address (Arabic)'} value={draft.addressAr} onChange={(value) => set('addressAr', value)} />
        <Field label={ar ? 'العنوان (إنجليزي)' : 'Address (English)'} value={draft.addressEn} onChange={(value) => set('addressEn', value)} />
        <Field label={ar ? 'ساعات الدوام (عربي)' : 'Hours (Arabic)'} value={draft.hoursAr} onChange={(value) => set('hoursAr', value)} />
        <Field label={ar ? 'ساعات الدوام (إنجليزي)' : 'Hours (English)'} value={draft.hoursEn} onChange={(value) => set('hoursEn', value)} />
      </div>

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3">
        <span className="flex items-center gap-1.5 text-[8px] font-bold text-white/22">
          {draft.whatsapp ? <IconPhone size={11} /> : <IconMail size={11} />}
          {ar ? 'تُحدَّث فوراً على هذا الجهاز' : 'Updates instantly on this device'}
        </span>
        <button type="button" onClick={save} className="btn-primary px-4 py-2.5">
          {ar ? 'حفظ التواصل' : 'Save contact'}
        </button>
      </div>
    </Card>
  )
}
