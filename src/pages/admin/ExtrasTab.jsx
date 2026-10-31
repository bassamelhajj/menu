import { useState } from 'react'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { uid } from '../../lib/helpers'
import { fmtLL } from '../../lib/format'
import { Card, Field, IconBtn, SectionHead, Toggle, useConfirm } from './ui'
import {
  IconEdit,
  IconLayers,
  IconPlus,
  IconSparkle,
  IconTrash,
} from '../../components/icons'

const Empty = { id: '', ar: '', en: '', priceLL: 50000, active: true, catIds: [] }

export default function ExtrasTab() {
  const { t, lang, notify } = useApp()
  const { extras, categories, setExtras } = useContent()
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(Empty)
  const [confirm, confirmDialog] = useConfirm()

  const startNew = () => {
    setDraft({ ...Empty, catIds: [] })
    setEditing('new')
  }
  const startEdit = (extra) => {
    setDraft({ ...extra, catIds: [...(extra.catIds || [])] })
    setEditing(extra.id)
  }
  const save = () => {
    if (!draft.ar.trim() && !draft.en.trim()) return
    const item = {
      ...draft,
      id: draft.id || uid('ex'),
      priceLL: Math.max(0, Number(draft.priceLL) || 0),
      catIds: [...(draft.catIds || [])],
    }
    setExtras(
      editing === 'new'
        ? [...extras, item]
        : extras.map((extra) => (extra.id === item.id ? item : extra)),
    )
    setEditing(null)
    notify(lang === 'ar' ? 'تم حفظ الإضافة ✓' : 'Extra saved ✓')
  }

  const remove = async (extra) => {
    const approved = await confirm({
      title:
        lang === 'ar'
          ? `حذف إضافة ${extra.ar || extra.en}؟`
          : `Delete ${extra.en || extra.ar}?`,
      message:
        lang === 'ar'
          ? 'رح تنحذف الإضافة من كل المنتجات المرتبطة فيها بعد النشر. السلال المحفوظة محلياً ما تتأثر.'
          : 'The add-on will be removed from every linked product after publishing. Saved local carts are unaffected.',
      confirmLabel: lang === 'ar' ? 'حذف الإضافة' : 'Delete extra',
      cancelLabel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    })
    if (!approved) return
    setExtras(extras.filter((item) => item.id !== extra.id))
    notify(lang === 'ar' ? 'تم حذف الإضافة' : 'Extra deleted')
  }

  const scopedCategories = (extra) =>
    (extra.catIds || [])
      .map((id) => categories.find((category) => category.id === id))
      .filter(Boolean)

  return (
    <div className="space-y-3">
      <SectionHead
        title={t('extrasLabel')}
        hint={
          lang === 'ar'
            ? 'أضف إضافات للمنتجات، وحدّد إن كانت متاحة لكل الأقسام أو لأقسام معيّنة فقط.'
            : 'Add product extras globally, or restrict each add-on to specific menu categories.'
        }
        action={
          <button type="button" onClick={startNew} className="btn-primary">
            <IconPlus size={15} /> {t('addNew')}
          </button>
        }
      />

      {editing && (
        <Card className="border-gold/50">
          <div className="mb-4 flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl border border-gold/20 bg-gold/10 text-gold">
              <IconSparkle size={15} />
            </span>
            <p className="text-xs font-black text-gold">
              {editing === 'new' ? t('addNew') : t('edit')}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field
              label={t('nameAr')}
              value={draft.ar}
              onChange={(v) => setDraft((d) => ({ ...d, ar: v }))}
            />
            <Field
              label={t('nameEn')}
              value={draft.en}
              onChange={(v) => setDraft((d) => ({ ...d, en: v }))}
            />
            <Field
              label={t('priceLL')}
              type="number"
              min={0}
              step={1000}
              value={draft.priceLL}
              onChange={(v) =>
                setDraft((d) => ({ ...d, priceLL: Math.max(0, Number(v) || 0) }))
              }
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/[0.06] bg-white/[0.022] p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-black text-white/65">
                  {lang === 'ar' ? 'تخصيص لأقسام معيّنة' : 'Restrict to categories'}
                </p>
                <p className="mt-1 text-[8.5px] font-semibold leading-relaxed text-white/28">
                  {lang === 'ar'
                    ? 'إذا كان مفعّلاً، تظهر الإضافة فقط داخل الأقسام المختارة.'
                    : 'When enabled, this add-on appears only inside the selected categories.'}
                </p>
              </div>
              <Toggle
                checked={(draft.catIds || []).length > 0}
                onChange={(enabled) =>
                  setDraft((d) => ({
                    ...d,
                    catIds: enabled
                      ? [categories[0]?.id].filter(Boolean)
                      : [],
                  }))
                }
                label={
                  (draft.catIds || []).length > 0
                    ? lang === 'ar'
                      ? 'مخصّص'
                      : 'Scoped'
                    : lang === 'ar'
                      ? 'لكل الأقسام'
                      : 'All categories'
                }
              />
            </div>

            {(draft.catIds || []).length > 0 && (
              <div className="mt-3 grid gap-1.5 border-t border-white/[0.06] pt-3 sm:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => {
                  const checked = (draft.catIds || []).includes(category.id)
                  return (
                    <label
                      key={category.id}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 transition-colors ${
                        checked
                          ? 'border-gold/30 bg-gold/[0.07]'
                          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setDraft((d) => ({
                            ...d,
                            catIds: checked
                              ? (d.catIds || []).filter((id) => id !== category.id)
                              : [...(d.catIds || []), category.id],
                          }))
                        }
                        className="h-3.5 w-3.5 accent-[#d5b46a]"
                      />
                      <span className="text-sm">{category.icon}</span>
                      <span className="truncate text-[9.5px] font-extrabold text-white/55">
                        {lang === 'ar' ? category.ar : category.en}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}

            {(draft.catIds || []).length > 0 && (
              <p className="mt-2 text-[8px] font-bold text-gold/45">
                {lang === 'ar'
                  ? 'ملاحظة: إذا شلت كل الأقسام، ترجع الإضافة متاحة للكل.'
                  : 'Tip: removing every category makes the add-on global again.'}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Toggle
              checked={draft.active !== false}
              onChange={(value) => setDraft((d) => ({ ...d, active: value }))}
              label={draft.active !== false ? t('active') : t('inactive')}
            />
            <div className="flex gap-2">
              <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
                {t('cancel')}
              </button>
              <button type="button" className="btn-primary" onClick={save}>
                {t('save')}
              </button>
            </div>
          </div>
        </Card>
      )}

      {extras.length === 0 && (
        <Card>
          <p className="py-8 text-center text-xs font-bold text-white/35">{t('emptyList')}</p>
        </Card>
      )}

      <div className="grid gap-2.5 xl:grid-cols-2">
        {extras.map((extra) => {
          const scoped = scopedCategories(extra)
          return (
            <Card
              key={extra.id}
              className={`flex flex-col gap-2.5 p-3.5 sm:flex-row sm:items-center ${
                editing === extra.id ? 'ring-1 ring-gold/35' : ''
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-gold/15 bg-gold/[0.07] font-black text-gold">
                  +
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-extrabold text-white/78">
                    {extra.ar} · {extra.en}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[9px] font-semibold text-gold/55">
                      {fmtLL(extra.priceLL)}
                    </span>
                    {scoped.length > 0 ? (
                      scoped.slice(0, 2).map((category) => (
                        <span
                          key={category.id}
                          className="rounded-full border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 text-[7.5px] font-black text-white/35"
                        >
                          {category.icon} {lang === 'ar' ? category.ar : category.en}
                        </span>
                      ))
                    ) : (
                      <span className="rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-1.5 py-0.5 text-[7.5px] font-black text-emerald-300/55">
                        {lang === 'ar' ? 'كل الأقسام' : 'All categories'}
                      </span>
                    )}
                    {scoped.length > 2 && (
                      <span className="text-[7.5px] font-black text-white/25">
                        +{scoped.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 border-t border-white/[0.05] pt-2.5 sm:border-0 sm:pt-0">
                <Toggle
                  checked={extra.active !== false}
                  onChange={(value) =>
                    setExtras(
                      extras.map((item) =>
                        item.id === extra.id ? { ...item, active: value } : item,
                      ),
                    )
                  }
                />
                <IconBtn title={t('edit')} onClick={() => startEdit(extra)}>
                  <IconEdit size={15} />
                </IconBtn>
                <IconBtn title={t('delete')} danger onClick={() => remove(extra)}>
                  <IconTrash size={15} />
                </IconBtn>
              </div>
            </Card>
          )
        })}
      </div>

      {extras.length > 0 && (
        <div className="flex items-start gap-2 rounded-2xl border border-white/[0.055] bg-white/[0.02] px-3.5 py-3 text-[8.5px] font-semibold leading-relaxed text-white/28">
          <IconLayers size={14} className="mt-0.5 shrink-0 text-gold/45" />
          {lang === 'ar'
            ? 'الإضافات العامة تظهر مع كل المنتجات. المخصّصة تظهر فقط عند فتح منتج من الأقسام المختارة.'
            : 'Global add-ons appear with every product. Scoped add-ons appear only when opening a product from the selected categories.'}
        </div>
      )}

      {confirmDialog}
    </div>
  )
}
