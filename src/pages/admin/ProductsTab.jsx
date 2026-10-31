import { useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { uid } from '../../lib/helpers'
import {
  bundleOriginalLL,
  clampPercent,
  fmtLL,
  isBundleProduct,
} from '../../lib/format'
import { Card, Field, IconBtn, SectionHead, Toggle, useConfirm } from './ui'
import {
  IconCopy,
  IconEdit,
  IconPlus,
  IconSearch,
  IconTrash,
  IconUpload,
} from '../../components/icons'

const fileToThumb = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const MAX = 520
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.onerror = reject
      img.src = String(reader.result)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })

const emptyProduct = (cat) => ({
  id: '',
  kind: 'single',
  cat: cat || '',
  ar: '',
  en: '',
  emoji: '🍽️',
  image: '',
  descAr: '',
  descEn: '',
  sizes: [{ labelAr: 'عادي', labelEn: 'Standard', priceLL: 50000 }],
  bundleItems: [],
  tags: [],
  offer: { active: false, percent: 10, labelAr: 'عرض', labelEn: 'Offer' },
  active: true,
})

/**
 * ⚡ تقسيم القائمة لسبب الأداء:
 *   عندنا ~153 منتج، وكل واحد فيه كرت + أزرار + أحياناً نموذج تعديل.
 *   عرضهم كلهم دفعة وحدة بيصنع lag واضح على الموبايل.
 *   فنعرض 30 بالبداية ونضيف 30 مع كل ضغطة "حمّل المزيد".
 *   (قيمة ثابتة فوق-list فوق-CONSTANT ملفوفة بـ useMemo لتفادي إعادة الإنشاء)
 */
const PAGE = 30

export default function ProductsTab() {
  const { t, lang, notify } = useApp()
  const { products, categories, setProducts } = useContent()
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [visible, setVisible] = useState(PAGE)
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState(null)
  const [confirm, confirmDialog] = useConfirm()

  // أي بحث/فلتر جديد يرجّعنا لأول صفحة
  useEffect(() => {
    setVisible(PAGE)
  }, [query, catFilter])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (catFilter !== 'all' && p.cat !== catFilter) return false
      if (!q) return true
      return `${p.ar} ${p.en} ${p.descAr}`.toLowerCase().includes(q)
    })
  }, [products, query, catFilter])

  /** الجزء الي رح ينرسم فعلاً (للأداء) */
  const shown = useMemo(() => list.slice(0, visible), [list, visible])

  const startNew = () => {
    setDraft(
      emptyProduct(
        categories.find((category) => category.id !== 'offers')?.id ||
          categories[0]?.id ||
          '',
      ),
    )
    setEditing('new')
  }
  const startEdit = (p) => {
    setDraft({
      ...p,
      kind: isBundleProduct(p) ? 'bundle' : 'single',
      bundleItems: (p.bundleItems || []).map((item) => ({ ...item })),
      sizes: p.sizes.map((s) => ({ ...s })),
      offer: {
        active: false,
        labelAr: 'عرض',
        labelEn: 'Offer',
        ...(p.offer || {}),
        percent: clampPercent(p.offer?.percent),
      },
      tags: [...(p.tags || [])],
    })
    setEditing(p.id)
  }
  const cancel = () => setEditing(null)

  const save = () => {
    if (!draft?.ar.trim() && !draft?.en.trim()) return
    const bundle = draft.kind === 'bundle'
    if (bundle && !draft.bundleItems?.length) {
      notify(
        lang === 'ar'
          ? 'اختر منتجاً واحداً على الأقل لمحتويات الباقة'
          : 'Pick at least one product for the bundle',
      )
      return
    }
    const firstRegularCategory =
      categories.find((category) => category.id !== 'offers')?.id || ''
    const item = {
      ...draft,
      id: draft.id || uid('prod'),
      kind: bundle ? 'bundle' : 'single',
      cat: bundle
        ? 'offers'
        : draft.cat === 'offers'
          ? firstRegularCategory
          : draft.cat,
      offer: bundle
        ? { ...draft.offer, active: false, percent: 0 }
        : { ...draft.offer, percent: clampPercent(draft.offer?.percent) },
      sizes: bundle
        ? [
            {
              labelAr: 'باقة',
              labelEn: 'Combo',
              priceLL: Math.max(0, Number(draft.sizes?.[0]?.priceLL) || 0),
            },
          ]
        : draft.sizes.map((size) => ({
            ...size,
            priceLL: Math.max(0, Number(size.priceLL) || 0),
          })),
      bundleItems: bundle
        ? draft.bundleItems.map((entry) => ({
            productId: entry.productId,
            qty: Math.max(1, Number(entry.qty) || 1),
          }))
        : [],
    }
    setProducts(
      editing === 'new'
        ? [item, ...products]
        : products.map((p) => (p.id === item.id ? item : p)),
    )
    setEditing(null)
    notify(
      bundle
        ? lang === 'ar'
          ? 'تم حفظ عرض الباقة ✓'
          : 'Bundle offer saved ✓'
        : lang === 'ar'
          ? 'تم حفظ المنتج ✓'
          : 'Product saved ✓',
    )
  }

  const duplicate = (product) => {
    const copy = JSON.parse(JSON.stringify(product))
    copy.id = uid('prod')
    copy.ar = product.ar ? `${product.ar} ${lang === 'ar' ? '(نسخة)' : '(Copy)'}` : ''
    copy.en = product.en ? `${product.en} ${lang === 'ar' ? '(Copy)' : '(Copy)'}` : ''
    copy.sizes = (product.sizes || []).map((size) => ({ ...size }))
    copy.tags = [...(product.tags || [])]
    copy.offer = { ...(product.offer || {}) }
    setProducts((current) => {
      const index = current.findIndex((entry) => entry.id === product.id)
      const next = [...current]
      next.splice(index < 0 ? 0 : index + 1, 0, copy)
      return next
    })
    notify(
      lang === 'ar'
        ? 'تم تكرار المنتج بكل أحجامه وخصائصه ✓'
        : 'Product duplicated with all sizes and options ✓',
    )
  }

  const remove = async (id) => {
    const approved = await confirm({
      title: lang === 'ar' ? 'حذف المنتج؟' : 'Delete product?',
      message:
        lang === 'ar'
          ? 'رح ينحذف المنتج من المنيو ومن كل الأجهزة بعد النشر. ما في تراجع.'
          : 'This product will be removed from the menu and customer devices after publishing. This cannot be undone.',
      confirmLabel: lang === 'ar' ? 'حذف المنتج' : 'Delete product',
      cancelLabel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    })
    if (!approved) return
    setProducts(products.filter((p) => p.id !== id))
    notify(lang === 'ar' ? 'تم حذف المنتج' : 'Product deleted')
  }

  return (
    <div className="space-y-3">
      <SectionHead
        title={t('products')}
        hint={`${products.length} ${t('totalProducts')}`}
        action={
          <button type="button" onClick={startNew} className="btn-primary">
            <IconPlus size={15} /> {t('addNew')}
          </button>
        }
      />

      {editing && draft && (
        <ProductEditor
          draft={draft}
          setDraft={setDraft}
          categories={categories}
          products={products}
          onSave={save}
          onCancel={cancel}
          isNew={editing === 'new'}
        />
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <IconSearch size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/28" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPh')}
            className="field ps-9"
          />
        </label>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="field w-full shrink-0 sm:w-48"
        >
          <option value="all">✨ {lang === 'ar' ? 'كل الأقسام' : 'All categories'}</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {lang === 'ar' ? c.ar : c.en}
            </option>
          ))}
        </select>
      </div>

      {shown.length === 0 && (
        <Card>
          <p className="py-8 text-center text-xs font-bold text-white/35">{t('emptyList')}</p>
        </Card>
      )}

      <div className="grid gap-2.5 xl:grid-cols-2">
        {shown.map((p) => {
          const cat = categories.find((c) => c.id === p.cat)
          return (
            <Card
              key={p.id}
              className="flex flex-col gap-2.5 p-3.5 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] text-2xl">
                  {p.image ? (
                    <img src={p.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    p.emoji
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 truncate text-[12.5px] font-extrabold text-white/80">
                    <span className="truncate">{lang === 'ar' ? p.ar : p.en}</span>
                    {isBundleProduct(p) && (
                      <span className="shrink-0 rounded-md border border-gold/20 bg-gold/15 px-1.5 py-0.5 text-[8px] font-black text-gold">
                        🎁 {lang === 'ar' ? 'باقة' : 'Bundle'}
                      </span>
                    )}
                    {!isBundleProduct(p) && p.offer?.active && (
                      <span className="shrink-0 rounded-md border border-red-400/20 bg-red-500/15 px-1.5 py-0.5 text-[8px] font-black text-red-200">
                        🔥 {p.offer.labelAr}
                      </span>
                    )}
                    {p.active === false && (
                      <span className="shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[8px] font-black text-white/30">
                        {lang === 'ar' ? 'مخفي' : 'Hidden'}
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-[9px] font-semibold text-white/32">
                    {cat && (
                      <span className="truncate">
                        {cat.icon} {lang === 'ar' ? cat.ar : cat.en}
                      </span>
                    )}
                    <span className="text-white/15">·</span>
                    <span>{fmtLL(p.sizes[0]?.priceLL || 0)}</span>
                    {p.sizes.length > 1 && (
                      <span className="text-white/20">
                        · {p.sizes.length} {lang === 'ar' ? 'أحجام' : 'sizes'}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 border-t border-white/[0.05] pt-2.5 sm:border-0 sm:pt-0">
                <div className="me-auto sm:me-1">
                  <Toggle
                    checked={p.active !== false}
                    onChange={(v) =>
                      setProducts(
                        products.map((x) => (x.id === p.id ? { ...x, active: v } : x)),
                      )
                    }
                  />
                </div>
                <IconBtn title={lang === 'ar' ? 'تكرار المنتج' : 'Duplicate product'} onClick={() => duplicate(p)}>
                  <IconCopy size={14} />
                </IconBtn>
                <IconBtn title={t('edit')} onClick={() => startEdit(p)}>
                  <IconEdit size={15} />
                </IconBtn>
                <IconBtn title={t('delete')} danger onClick={() => remove(p.id)}>
                  <IconTrash size={15} />
                </IconBtn>
              </div>
            </Card>
          )
        })}
      </div>

      {/* زر «حمّل المزيد» — بيقلّل الـ lag لما يكون في منتجات كتير */}
      {visible < list.length && (
        <button
          type="button"
          onClick={() => setVisible((v) => v + PAGE)}
          className="btn-ghost w-full py-3"
        >
          {lang === 'ar'
            ? `حمّل المزيد (${shown.length} من ${list.length})`
            : `Load more (${shown.length} of ${list.length})`}
        </button>
      )}

      {confirmDialog}
    </div>
  )
}

function ProductEditor({ draft, setDraft, categories, products, onSave, onCancel, isNew }) {
  const { t, lang } = useApp()
  const fileRef = useRef(null)
  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }))
  const bundle = draft.kind === 'bundle'
  const regularProducts = useMemo(
    () => products.filter((product) => !isBundleProduct(product)),
    [products],
  )
  const bundleOriginal = bundleOriginalLL(draft, products)
  const bundlePrice = Math.max(0, Number(draft.sizes?.[0]?.priceLL) || 0)
  const bundleSaving = Math.max(0, bundleOriginal - bundlePrice)
  const bundleDiscountPercent = bundleOriginal
    ? Math.min(99, Math.round((bundleSaving / bundleOriginal) * 100))
    : 0
  const regularCategories = categories.filter((category) => category.id !== 'offers')

  const setKind = (kind) =>
    setDraft((current) => {
      if (kind === 'bundle') {
        return {
          ...current,
          kind: 'bundle',
          cat: 'offers',
          bundleItems: current.bundleItems || [],
          offer: { ...current.offer, active: false, percent: 0 },
          sizes: [
            {
              labelAr: 'باقة',
              labelEn: 'Combo',
              priceLL: current.sizes?.[0]?.priceLL || 0,
            },
          ],
        }
      }
      return {
        ...current,
        kind: 'single',
        cat:
          current.cat === 'offers'
            ? regularCategories[0]?.id || ''
            : current.cat,
        bundleItems: [],
        sizes: current.kind === 'bundle'
          ? [{ labelAr: 'عادي', labelEn: 'Standard', priceLL: current.sizes?.[0]?.priceLL || 50000 }]
          : current.sizes,
      }
    })

  const addBundleItem = (productId) => {
    if (!productId) return
    setDraft((current) => {
      if ((current.bundleItems || []).some((item) => item.productId === productId)) {
        return current
      }
      return {
        ...current,
        bundleItems: [...(current.bundleItems || []), { productId, qty: 1 }],
      }
    })
  }

  const setBundleQty = (productId, delta) =>
    setDraft((current) => ({
      ...current,
      bundleItems: (current.bundleItems || []).map((item) =>
        item.productId === productId
          ? { ...item, qty: Math.max(1, (Number(item.qty) || 1) + delta) }
          : item,
      ),
    }))

  const removeBundleItem = (productId) =>
    setDraft((current) => ({
      ...current,
      bundleItems: (current.bundleItems || []).filter(
        (item) => item.productId !== productId,
      ),
    }))
  const setSize = (i, key, value) =>
    setDraft((d) => ({
      ...d,
      sizes: d.sizes.map((s, idx) => (idx === i ? { ...s, [key]: value } : s)),
    }))
  const addSize = () =>
    setDraft((d) => ({
      ...d,
      sizes: [
        ...d.sizes,
        { labelAr: 'حجم', labelEn: 'Size', priceLL: d.sizes[d.sizes.length - 1]?.priceLL || 50000 },
      ],
    }))
  const removeSize = (i) =>
    setDraft((d) => ({ ...d, sizes: d.sizes.filter((_, idx) => idx !== i) }))

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await fileToThumb(file)
      set('image', url)
    } catch {
      /* ignore */
    }
    e.target.value = ''
  }

  const toggleTag = (tag) =>
    setDraft((d) => ({
      ...d,
      tags: d.tags.includes(tag) ? d.tags.filter((x) => x !== tag) : [...d.tags, tag],
    }))

  return (
    <Card className="border-gold/50">
      <p className="mb-3 text-xs font-black text-gold">
        ✏️ {isNew ? t('addNew') : t('edit')}
      </p>

      <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.025] p-1">
        {[
          { id: 'single', ar: 'منتج عادي', en: 'Regular product' },
          { id: 'bundle', ar: 'عرض باقة', en: 'Bundle offer' },
        ].map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => setKind(type.id)}
            className={`rounded-lg px-3 py-1.5 text-[9px] font-black transition-colors ${
              (type.id === 'bundle' ? bundle : !bundle)
                ? 'bg-gold/[0.14] text-gold'
                : 'text-white/30 hover:text-white/60'
            }`}
          >
            {type.id === 'bundle' ? '🎁 ' : '🍽️ '}
            {lang === 'ar' ? type.ar : type.en}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={t('nameAr')} value={draft.ar} onChange={(v) => set('ar', v)} />
        <Field label={t('nameEn')} value={draft.en} onChange={(v) => set('en', v)} />
        <Field label={t('descAr')} rows={2} value={draft.descAr} onChange={(v) => set('descAr', v)} />
        <Field label={t('descEn')} rows={2} value={draft.descEn} onChange={(v) => set('descEn', v)} />

        {bundle ? (
          <div className="block">
            <span className="label-in">{t('categoryLabel')}</span>
            <div className="field flex items-center justify-between gap-2 text-gold">
              <span>🔥 {lang === 'ar' ? 'العروضات' : 'Special Offers'}</span>
              <span className="text-[9px] font-bold text-white/25">
                {lang === 'ar' ? 'تلقائي' : 'Automatic'}
              </span>
            </div>
          </div>
        ) : (
          <label className="block">
            <span className="label-in">{t('categoryLabel')}</span>
            <select
              className="field"
              value={draft.cat}
              onChange={(e) => set('cat', e.target.value)}
            >
              <option value="">—</option>
              {regularCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {lang === 'ar' ? c.ar : c.en}
                </option>
              ))}
            </select>
          </label>
        )}

        <Field label={t('emoji')} value={draft.emoji} onChange={(v) => set('emoji', v)} />
      </div>

      {bundle && (
        <div className="mt-3 rounded-2xl border border-gold/25 bg-gold/[0.045] p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-[11px] font-black text-gold">
              🎁 {lang === 'ar' ? 'محتويات الباقة' : 'Bundle contents'}
            </p>
            <select
              className="field w-full py-2 text-[10px] sm:w-auto"
              value=""
              onChange={(event) => addBundleItem(event.target.value)}
            >
              <option value="">
                + {lang === 'ar' ? 'أضف منتجاً للباقة' : 'Add a product'}
              </option>
              {regularProducts
                .filter(
                  (product) =>
                    !(draft.bundleItems || []).some(
                      (entry) => entry.productId === product.id,
                    ),
                )
                .map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.emoji} {lang === 'ar' ? product.ar : product.en}
                  </option>
                ))}
            </select>
          </div>

          {(draft.bundleItems || []).length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/10 py-4 text-center text-[9px] font-bold text-white/25">
              {lang === 'ar'
                ? 'اختر منتجاً أو أكثر لتظهر الباقة بقسم العروضات.'
                : 'Pick one or more products to publish this combo under Special Offers.'}
            </p>
          ) : (
            <div className="space-y-1.5">
              {(draft.bundleItems || []).map((entry) => {
                const product = products.find((item) => item.id === entry.productId)
                return (
                  <div
                    key={entry.productId}
                    className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-black/15 px-2.5 py-2"
                  >
                    <span className="text-lg">{product?.emoji || '🍽️'}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] font-extrabold text-white/65">
                        {product ? (lang === 'ar' ? product.ar : product.en) : '—'}
                      </p>
                      <p className="text-[8px] font-semibold text-white/25">
                        {fmtLL(product?.sizes?.[0]?.priceLL || 0)}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 rounded-lg border border-white/[0.08] bg-white/[0.03] p-0.5">
                      <button
                        type="button"
                        onClick={() => setBundleQty(entry.productId, -1)}
                        className="grid h-6 w-6 place-items-center rounded-md text-white/50 hover:bg-white/[0.06] hover:text-white"
                      >
                        −
                      </button>
                      <span className="w-5 text-center text-[9px] font-black text-white/70">
                        {entry.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBundleQty(entry.productId, 1)}
                        className="grid h-6 w-6 place-items-center rounded-md text-white/50 hover:bg-white/[0.06] hover:text-white"
                      >
                        +
                      </button>
                    </div>
                    <IconBtn
                      title={t('delete')}
                      danger
                      onClick={() => removeBundleItem(entry.productId)}
                    >
                      <IconTrash size={12} />
                    </IconBtn>
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-2.5 grid grid-cols-3 gap-2 rounded-xl border border-white/[0.06] bg-black/15 p-2">
            <div>
              <p className="text-[8px] font-bold text-white/25">
                {lang === 'ar' ? 'القيمة الأصلية' : 'Original value'}
              </p>
              <p className="mt-0.5 text-[9.5px] font-black text-white/45 line-through">
                {fmtLL(bundleOriginal)}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-white/25">
                {lang === 'ar' ? 'سعر الباقة' : 'Bundle price'}
              </p>
              <p className="mt-0.5 text-[9.5px] font-black text-amber-300">
                {fmtLL(bundlePrice)}
              </p>
            </div>
            <div>
              <p className="text-[8px] font-bold text-white/25">
                {lang === 'ar' ? 'الخصم' : 'Discount'}
              </p>
              <p className="mt-0.5 text-[9.5px] font-black text-emerald-300">
                {bundleDiscountPercent}% · {fmtLL(bundleSaving)}
              </p>
            </div>
          </div>
          {bundleOriginal > 0 && bundlePrice >= bundleOriginal && (
            <p className="mt-2 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-2 py-1.5 text-[8.5px] font-bold text-amber-200/70">
              {lang === 'ar'
                ? 'سعر الباقة لازم يكون أقل من القيمة الأصلية ليظهر كعرض.'
                : 'The bundle price must be below the original value to read as an offer.'}
            </p>
          )}
        </div>
      )}

      {/* image */}
      <div className="mt-3 flex items-center gap-3">
        <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] text-3xl">
          {draft.image ? (
            <img src={draft.image} alt="" className="h-full w-full object-cover" />
          ) : (
            draft.emoji
          )}
        </span>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} className="btn-ghost">
          <IconUpload size={15} /> {t('uploadImage')}
        </button>
        {draft.image && (
          <button type="button" onClick={() => set('image', '')} className="btn-ghost">
            {t('remove')}
          </button>
        )}
      </div>

      {/* السعر: باقة واحدة، أو أحجام للمنتج العادي */}
      {bundle ? (
        <div className="mt-4">
          <Field
            label={lang === 'ar' ? 'سعر الباقة (ل.ل)' : 'Bundle price (LL)'}
            type="number"
            min={0}
            step={1000}
            value={bundlePrice}
            onChange={(value) =>
              setDraft((current) => ({
                ...current,
                sizes: [
                  {
                    labelAr: 'باقة',
                    labelEn: 'Combo',
                    priceLL: Math.max(0, Number(value) || 0),
                  },
                ],
              }))
            }
            hint={
              lang === 'ar'
                ? 'السعر النهائي للباقة كاملة. الأسعار الأصلية تُحسب تلقائياً من المنتجات المختارة.'
                : 'Final price for the whole bundle. Original value is calculated from the selected products.'
            }
          />
        </div>
      ) : (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="label-in mb-0">{t('sizePrice')}</span>
            <button type="button" onClick={addSize} className="text-[10px] font-black text-gold">
              + {t('addNew')}
            </button>
          </div>
          <div className="space-y-2">
            {draft.sizes.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1.4fr_auto] gap-2">
                <input
                  className="field"
                  value={s.labelAr}
                  placeholder={t('nameAr')}
                  onChange={(e) => setSize(i, 'labelAr', e.target.value)}
                />
                <input
                  className="field"
                  value={s.labelEn}
                  placeholder={t('nameEn')}
                  onChange={(e) => setSize(i, 'labelEn', e.target.value)}
                />
                <input
                  className="field"
                  type="number"
                  step="1000"
                  min="0"
                  value={s.priceLL}
                  placeholder={t('priceLL')}
                  onChange={(e) => setSize(i, 'priceLL', Number(e.target.value) || 0)}
                />
                <IconBtn title={t('delete')} danger onClick={() => removeSize(i)}>
                  <IconTrash size={14} />
                </IconBtn>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* tags + offer */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
        <label className="flex items-center gap-2 text-xs font-extrabold text-white/65">
          <input
            type="checkbox"
            checked={draft.tags.includes('best')}
            onChange={() => toggleTag('best')}
            className="h-4 w-4 accent-[#d5b46a]"
          />
          ⭐ {t('bestSeller')}
        </label>
        <label className="flex items-center gap-2 text-xs font-extrabold text-white/65">
          <input
            type="checkbox"
            checked={draft.tags.includes('new')}
            onChange={() => toggleTag('new')}
            className="h-4 w-4 accent-[#d5b46a]"
          />
          ✨ {t('isNew')}
        </label>
        {!bundle && (
          <Toggle
            checked={draft.offer.active}
            onChange={(v) => setDraft((d) => ({ ...d, offer: { ...d.offer, active: v } }))}
            label={t('offerBadge')}
          />
        )}
      </div>

      {!bundle && draft.offer.active && (
        <div className="mt-3 grid gap-3 rounded-2xl border border-red-400/20 bg-red-500/[0.055] p-3 sm:grid-cols-3">
          <Field
            label={t('offerPercent')}
            type="number"
            min={0}
            max={99}
            value={draft.offer.percent}
            onChange={(v) =>
              setDraft((d) => ({
                ...d,
                offer: { ...d.offer, percent: clampPercent(v) },
              }))
            }
            hint={lang === 'ar' ? 'الحد الأقصى 99%' : 'Maximum 99%'}
          />
          <Field label={t('nameAr')} value={draft.offer.labelAr} onChange={(v) => setDraft((d) => ({ ...d, offer: { ...d.offer, labelAr: v } }))} />
          <Field label={t('nameEn')} value={draft.offer.labelEn} onChange={(v) => setDraft((d) => ({ ...d, offer: { ...d.offer, labelEn: v } }))} />
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <Toggle
          checked={draft.active !== false}
          onChange={(v) => set('active', v)}
          label={draft.active !== false ? t('active') : t('inactive')}
        />
        <div className="flex gap-2">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            {t('cancel')}
          </button>
          <button type="button" className="btn-primary" onClick={onSave}>
            <IconPlus size={15} /> {t('save')}
          </button>
        </div>
      </div>
    </Card>
  )
}