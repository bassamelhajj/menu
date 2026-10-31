import { useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { uid } from '../../lib/helpers'
import { Card, Field, IconBtn, SectionHead, Toggle, useConfirm } from './ui'
import {
  IconEdit,
  IconGrip,
  IconPlus,
  IconTrash,
} from '../../components/icons'

const Empty = { id: '', icon: '🍽️', ar: '', en: '', active: true }

function SortableCategory({ cat, lang, editing, locked, onEdit, onDelete, onToggle, t }) {
  const controls = useDragControls()

  return (
    <Reorder.Item
      value={cat}
      dragListener={false}
      dragControls={controls}
      whileDrag={{
        scale: 1.012,
        boxShadow: '0 28px 70px -32px rgba(0,0,0,0.95)',
      }}
      className={`admin-card flex items-center gap-2.5 p-3.5 sm:gap-3 ${
        editing ? 'ring-1 ring-gold/35' : ''
      }`}
    >
      <button
        type="button"
        onPointerDown={(event) => controls.start(event)}
        title={lang === 'ar' ? 'اسحب لإعادة الترتيب' : 'Drag to reorder'}
        aria-label={lang === 'ar' ? 'اسحب لإعادة الترتيب' : 'Drag to reorder'}
        className="grid h-9 w-7 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-white/20 transition-colors hover:bg-white/[0.04] hover:text-gold/70 active:cursor-grabbing"
      >
        <IconGrip size={16} />
      </button>

      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.035] text-2xl">
        {cat.icon}
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-extrabold text-white/80">
          {lang === 'ar' ? cat.ar : cat.en}
        </p>
        <p className="mt-0.5 truncate text-[9px] font-semibold text-white/28">
          {cat.en} · {cat.id}
        </p>
      </div>

      <div className="shrink-0">
        {locked ? (
          <span className="rounded-full border border-gold/20 bg-gold/10 px-2 py-1 text-[7.5px] font-black text-gold/80">
            {lang === 'ar' ? 'أساسي' : 'Core'}
          </span>
        ) : (
          <Toggle checked={cat.active !== false} onChange={onToggle} />
        )}
      </div>

      <IconBtn title={t('edit')} onClick={onEdit}>
        <IconEdit size={15} />
      </IconBtn>
      {!locked && (
        <IconBtn title={t('delete')} danger onClick={onDelete}>
          <IconTrash size={15} />
        </IconBtn>
      )}
    </Reorder.Item>
  )
}

export default function CategoriesTab() {
  const { t, lang, notify } = useApp()
  const { categories, setCategories } = useContent()
  const [editing, setEditing] = useState(null) // category id or 'new'
  const [draft, setDraft] = useState(Empty)
  const [confirm, confirmDialog] = useConfirm()

  const startEdit = (cat) => {
    setEditing(cat.id)
    setDraft({ ...cat })
  }
  const startNew = () => {
    setEditing('new')
    setDraft({ ...Empty })
  }
  const cancel = () => setEditing(null)

  const save = () => {
    if (!draft.ar.trim() && !draft.en.trim()) return
    const item = { ...draft, id: draft.id || uid('cat') }
    setCategories(
      editing === 'new'
        ? [...categories, item]
        : categories.map((c) => (c.id === item.id ? item : c)),
    )
    setEditing(null)
    notify(lang === 'ar' ? 'تم حفظ القسم ✓' : 'Category saved ✓')
  }

  const remove = async (cat) => {
    const approved = await confirm({
      title: lang === 'ar' ? `حذف قسم ${cat.ar || cat.en}؟` : `Delete ${cat.en || cat.ar}?`,
      message:
        lang === 'ar'
          ? 'رح يختفي القسم من المنيو. المنتجات التابعة له ما بتنحذف، بس بتصير غير ظاهرة حتى تنقلها لقسم تاني.'
          : 'The category will disappear from the menu. Its products stay stored but become hidden until reassigned.',
      confirmLabel: lang === 'ar' ? 'حذف القسم' : 'Delete category',
      cancelLabel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    })
    if (!approved) return
    setCategories(categories.filter((c) => c.id !== cat.id))
    notify(lang === 'ar' ? 'تم حذف القسم' : 'Category deleted')
  }

  const reorder = (next) => {
    setCategories(next)
  }

  return (
    <div className="space-y-3">
      <SectionHead
        title={t('categories')}
        hint={
          lang === 'ar'
            ? 'ترتيب الأقسام هنا هو ترتيب المنيو عند الزبون. اسحب المقبض لإعادة الترتيب بسلاسة.'
            : 'The order here is the customer menu order. Drag the handle to reorder smoothly.'
        }
        action={
          <button type="button" onClick={startNew} className="btn-primary">
            <IconPlus size={15} /> {t('addNew')}
          </button>
        }
      />

      {editing && (
        <CategoryEditor
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onCancel={cancel}
          isNew={editing === 'new'}
        />
      )}

      {categories.length === 0 && (
        <Card>
          <p className="py-8 text-center text-xs font-bold text-white/35">{t('emptyList')}</p>
        </Card>
      )}

      {categories.length > 0 && (
        <div className="rounded-[1.35rem] border border-white/[0.055] bg-black/10 p-2">
          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            <span className="text-[7.5px] font-black uppercase tracking-[0.18em] text-white/22">
              {lang === 'ar' ? 'ترتيب العرض' : 'Display order'}
            </span>
            <span className="text-[7.5px] font-bold text-white/18">
              {lang === 'ar' ? 'اسحب وأفلت' : 'Drag & drop'}
            </span>
          </div>

          <Reorder.Group axis="y" values={categories} onReorder={reorder} className="space-y-2">
            {categories.map((cat) => (
              <SortableCategory
                key={cat.id}
                cat={cat}
                lang={lang}
                t={t}
                editing={editing === cat.id}
                locked={cat.id === 'offers'}
                onEdit={() => startEdit(cat)}
                onDelete={() => remove(cat)}
                onToggle={(value) =>
                  setCategories(
                    categories.map((c) => (c.id === cat.id ? { ...c, active: value } : c)),
                  )
                }
              />
            ))}
          </Reorder.Group>
        </div>
      )}

      {confirmDialog}
    </div>
  )
}

function CategoryEditor({ draft, setDraft, onSave, onCancel, isNew }) {
  const { t } = useApp()
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))
  return (
    <Card className="border-gold/50">
      <p className="mb-3 text-xs font-black text-gold">
        ✏️ {isNew ? t('addNew') : t('edit')}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t('emoji')} value={draft.icon} onChange={(v) => set('icon', v)} />
        <div className="hidden sm:block" />
        <Field label={t('nameAr')} value={draft.ar} onChange={(v) => set('ar', v)} />
        <Field label={t('nameEn')} value={draft.en} onChange={(v) => set('en', v)} />
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button type="button" className="btn-ghost" onClick={onCancel}>
          {t('cancel')}
        </button>
        <button type="button" className="btn-primary" onClick={onSave}>
          <IconPlus size={15} /> {t('save')}
        </button>
      </div>
    </Card>
  )
}
