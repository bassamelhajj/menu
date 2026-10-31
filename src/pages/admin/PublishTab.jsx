import { useRef, useState } from 'react'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { Card, SectionHead, useConfirm } from './ui'
import {
  IconCheck,
  IconDatabase,
  IconDownload,
  IconLock,
  IconRefresh,
  IconShield,
  IconTrash,
  IconUpload,
} from '../../components/icons'

export default function PublishTab({ notify }) {
  const { t, lang, notify: appNotify } = useApp()
  const {
    exportJson,
    importJson,
    resetContent,
    restorePublished,
    published,
    products,
    categories,
    gallery,
    reviews,
  } = useContent()
  const ar = lang === 'ar'
  const toast = notify || appNotify
  const fileRef = useRef(null)
  const [status, setStatus] = useState(null)
  const [confirm, confirmDialog] = useConfirm()

  const approvedReviews = reviews.filter((review) => review.status === 'approved').length

  const showStatus = (type) => {
    setStatus(type)
    window.setTimeout(() => setStatus(null), 3200)
  }

  const onExport = () => {
    exportJson()
    toast(ar ? 'تم تصدير content.json العام ✓' : 'Public content.json exported ✓')
    showStatus('ok')
  }

  const onFile = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    importJson(file, (ok) => {
      showStatus(ok ? 'ok' : 'error')
      toast(
        ok
          ? ar
            ? 'تم استيراد المحتوى العام ✓'
            : 'Public content imported ✓'
          : ar
            ? 'ملف content.json غير صالح'
            : 'Invalid content.json file',
      )
    })
    event.target.value = ''
  }

  const askReset = async () => {
    const approved = await confirm({
      title: ar ? 'استعادة المحتوى الافتراضي؟' : 'Reset content to defaults?',
      message: ar
        ? 'رح تنحذف كل تعديلات المنيو والإعدادات المحلية، بما فيها الطلبات والزبائن والآراء. ما في تراجع.'
        : 'All local menu and settings changes will be deleted, including orders, customers and reviews. This cannot be undone.',
      confirmLabel: ar ? 'استعادة الافتراضي' : 'Reset everything',
      cancelLabel: ar ? 'إلغاء' : 'Cancel',
    })
    if (!approved) return
    resetContent()
    toast(ar ? 'تمت استعادة المحتوى الافتراضي' : 'Content reset to defaults')
  }

  const askRestore = async () => {
    const approved = await confirm({
      title: ar ? 'استرجاع المحتوى المنشور؟' : 'Restore published content?',
      message: ar
        ? 'رح تُلغى تعديلات هذا الجهاز وتُستبدل بآخر نسخة منشورة. بيانات الزبائن والطلبات وكلمات السر المحلية تبقى محفوظة.'
        : 'Local edits will be replaced with the last published version. Local customers, orders and credentials are preserved.',
      confirmLabel: ar ? 'استرجاع' : 'Restore',
      cancelLabel: ar ? 'إلغاء' : 'Cancel',
      danger: false,
    })
    if (!approved) return
    await restorePublished()
    toast(ar ? 'تم استرجاع المحتوى المنشور' : 'Published content restored')
  }

  return (
    <div className="space-y-4">
      <SectionHead
        title={ar ? 'النسخ والنشر' : 'Backup & publish'}
        hint={
          ar
            ? 'صدّر نسخة عامة نظيفة من المنيو والإعدادات، أو استورد نسخة معدّلة — مع حماية كاملة للبيانات الخاصة.'
            : 'Export a clean public menu and store configuration, or import an edited copy — with private data fully protected.'
        }
      />

      {status && (
        <div
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-[10px] font-black ${
            status === 'ok'
              ? 'border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-300'
              : 'border-red-400/25 bg-red-500/[0.08] text-red-300'
          }`}
        >
          {status === 'ok' ? <IconCheck size={15} /> : <IconShield size={15} />}
          {status === 'ok'
            ? ar
              ? 'تمت العملية بنجاح ✓'
              : 'Operation completed successfully ✓'
            : ar
              ? 'تعذّرت العملية — تحقّق من الملف'
              : 'Operation failed — check the file'}
        </div>
      )}

      <section className="exec-glass relative overflow-hidden rounded-[1.6rem] p-5 sm:p-6">
        <div className="pointer-events-none absolute -end-20 -top-24 h-64 w-64 rounded-full border border-gold/10" />
        <div className="pointer-events-none absolute -start-16 bottom-[-8rem] h-52 w-52 rounded-full bg-gold/[0.06] blur-3xl" />

        <div className="relative grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)] xl:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.08] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-gold">
              <IconDatabase size={12} />
              Public release
            </span>
            <h2 className="mt-3 font-display text-[25px] font-semibold tracking-wide text-[#f7f1e5] sm:text-[30px]">
              {ar ? 'نسخة عامة، بلا أسرار' : 'A public build, without secrets'}
            </h2>
            <p className="mt-1.5 max-w-xl text-[10.5px] font-semibold leading-relaxed text-white/35">
              {ar
                ? 'content.json يحتوي فقط على المنيو والإعدادات العامة. كلمات السر، الزبائن، الطلبات، وإيميلات الآراء تُستبعد تلقائياً قبل التنزيل.'
                : 'content.json contains only the menu and public configuration. Passwords, customers, orders and review emails are stripped automatically before download.'}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={onExport} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5">
                <IconDownload size={15} />
                {ar ? 'تصدير النسخة العامة' : 'Export public content'}
              </button>
              <button
                type="button"
                className="btn-ghost inline-flex items-center gap-2 px-4 py-2.5"
                onClick={() => fileRef.current?.click()}
              >
                <IconUpload size={14} />
                {ar ? 'استيراد ملف' : 'Import file'}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                onChange={onFile}
                className="hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { value: products.length, label: ar ? 'منتج' : 'products' },
              { value: categories.length, label: ar ? 'قسم' : 'categories' },
              { value: gallery.length, label: ar ? 'صفحة معرض' : 'gallery pages' },
              { value: approvedReviews, label: ar ? 'رأي منشور' : 'live reviews' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/[0.07] bg-black/15 px-3.5 py-3 text-center backdrop-blur-xl"
              >
                <p className="text-[20px] font-black text-gold/85">{item.value}</p>
                <p className="mt-0.5 text-[7.5px] font-black uppercase tracking-[0.12em] text-white/25">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2 xl:items-start">
        <Card>
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-gold/20 bg-gold/[0.08] text-gold">
              <IconShield size={18} />
            </span>
            <div>
              <h3 className="font-display text-[17px] font-semibold tracking-wide text-[#f7f1e5]">
                {ar ? 'حماية البيانات الخاصة' : 'Private data protection'}
              </h3>
              <p className="mt-1 text-[9px] font-bold leading-relaxed text-white/30">
                {ar
                  ? 'هذه الحقول لا تُكتب في content.json أبداً.'
                  : 'These fields are never written to content.json.'}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            {[
              ar ? 'بيانات دخول الأدمن (متغيرات البيئة)' : 'Admin credentials (environment variables)',
              ar ? 'بصمة قفل المنيو' : 'Menu lock hash',
              ar ? 'قائمة الزبائن وبياناتهم' : 'Customer list and details',
              ar ? 'الطلبات وأرقامها' : 'Orders and order counter',
              ar ? 'إيميلات الآراء ومعرّفات الزبائن' : 'Review emails and customer IDs',
            ].map((line) => (
              <div
                key={line}
                className="flex items-center gap-2 rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2"
              >
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-400/10 text-emerald-300">
                  <IconCheck size={9} />
                </span>
                <span className="text-[9px] font-bold text-white/38">{line}</span>
                <span className="ms-auto rounded-full border border-emerald-400/15 bg-emerald-400/[0.05] px-1.5 py-0.5 text-[6.5px] font-black uppercase tracking-wider text-emerald-300/60">
                  stripped
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 flex items-start gap-2 rounded-xl border border-gold/12 bg-gold/[0.045] px-3 py-2.5">
            <IconLock size={13} className="mt-0.5 shrink-0 text-gold/60" />
            <p className="text-[8.5px] font-semibold leading-relaxed text-white/30">
              {ar
                ? 'احتفظ دائمًا بنسخة خاصة من بيانات الزبائن إن كنت بحاجة لأرشيف — التصدير العام ليس نسخة احتياطية كاملة.'
                : 'Keep a private export of customer data if you need an archive — the public export is not a full backup.'}
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <h3 className="font-display text-[17px] font-semibold tracking-wide text-[#f7f1e5]">
              {ar ? 'استيراد نسخة عامة' : 'Import a public copy'}
            </h3>
            <p className="mt-1.5 text-[9.5px] font-bold leading-relaxed text-white/30">
              {ar
                ? 'استورد content.json معدّلاً من جهاز آخر. بياناتك الخاصة (الزبائن، الطلبات، وكلمات السر) تبقى كما هي.'
                : 'Import a content.json edited on another device. Your private data (customers, orders, credentials) stays intact.'}
            </p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="btn-ghost mt-4 flex w-full items-center justify-center gap-2 py-3"
            >
              <IconUpload size={14} />
              {ar ? 'اختيار ملف content.json' : 'Choose content.json'}
            </button>
          </Card>

          {published && (
            <Card>
              <h3 className="font-display text-[17px] font-semibold tracking-wide text-[#f7f1e5]">
                {ar ? 'استرجاع المحتوى المنشور' : 'Restore published content'}
              </h3>
              <p className="mt-1.5 text-[9.5px] font-bold leading-relaxed text-white/30">
                {ar
                  ? 'إلغاء تعديلات هذا الجهاز والعودة إلى آخر محتوى منشور على السيرفر.'
                  : 'Discard edits on this device and revert to the server-published content.'}
              </p>
              <button
                type="button"
                onClick={askRestore}
                className="btn-ghost mt-4 flex w-full items-center justify-center gap-2 py-3"
              >
                <IconRefresh size={14} />
                {ar ? 'استرجاع النسخة المنشورة' : 'Restore published version'}
              </button>
            </Card>
          )}

          <Card className="border-red-400/15">
            <h3 className="flex items-center gap-2 font-display text-[17px] font-semibold tracking-wide text-red-200/80">
              <IconTrash size={15} />
              {ar ? 'استعادة الافتراضي' : 'Reset to defaults'}
            </h3>
            <p className="mt-1.5 text-[9.5px] font-bold leading-relaxed text-white/30">
              {ar
                ? 'حذف كل التعديلات من هذا الجهاز والعودة للمنيو والتكوين الأصليين. هذه العملية نهائية.'
                : 'Delete every local edit and restore the original menu and configuration. This is permanent.'}
            </p>
            <button
              type="button"
              onClick={askReset}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/[0.06] py-3 text-[10px] font-black text-red-300/75 transition-colors hover:border-red-400/40 hover:bg-red-500/[0.1] hover:text-red-200"
            >
              <IconTrash size={14} />
              {t('resetContent')}
            </button>
          </Card>
        </div>
      </div>

      {confirmDialog}
    </div>
  )
}
