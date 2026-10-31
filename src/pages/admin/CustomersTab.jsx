/**
 * pages/admin/CustomersTab.jsx — 👥 الزبائن المسجّلون
 * ===========================================================================
 * 🎯 ليش هالتبويب مهم؟
 *   كل واحد عم يعمل حساب، إيميله بينحفظ هون.
 *   صاحب المحل بيقدر:
 *     • يشوف كل الزبائن (اسم + إيميل + هاتف + تاريخ)
 *     • يبحث فيهم بالاسم أو الإيميل
 *     • ⬇️ ينزّلهم ملف CSV — بيفتح مباشرة بـ Excel و Google Sheets
 *     • 🗑️ يمسح زبون
 *
 * 📌 ليش CSV وليس Excel (xlsx)؟
 *   لأن ملف xlsx بيلزمنا مكتبة كبيرة زيادة، و CSV بيفتح بالاثنين
 *   (Excel + Google Sheets) بدون أي مكتبة.
 *   وبحطين \uFEFF بالبداية عشان العربية تنفتح صح بالـ Excel.
 */
import { useMemo, useState } from 'react'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { Card, IconBtn, SectionHead, useConfirm } from './ui'
import { IconDownload, IconTrash, IconUsers } from '../../components/icons'

export default function CustomersTab() {
  const { t, lang, notify } = useApp()
  const { customers, deleteCustomer, exportCustomersCsv } = useContent()
  const [query, setQuery] = useState('')
  const [confirm, confirmDialog] = useConfirm()

  const ar = lang === 'ar'

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) =>
      `${c.name} ${c.email} ${c.phone} ${c.note}`.toLowerCase().includes(q),
    )
  }, [customers, query])

  const doExport = () => {
    if (customers.length === 0) {
      notify(ar ? 'ما في زبائن بعد' : 'No customers yet')
      return
    }
    exportCustomersCsv()
    notify(ar ? 'تم تنزيل الملف ✅' : 'File downloaded ✅')
  }

  const remove = async (customer) => {
    const approved = await confirm({
      title: ar
        ? `حذف الزبون ${customer.name || customer.email}؟`
        : `Delete ${customer.name || customer.email}?`,
      message: ar
        ? 'رح ينحذف حساب الزبون من هذا الجهاز. ما رح يقدر يسجّل دخول بنفس الحساب بعد الحذف.'
        : 'The customer account will be removed from this device and can no longer sign in.',
      confirmLabel: ar ? 'حذف الزبون' : 'Delete customer',
      cancelLabel: ar ? 'إلغاء' : 'Cancel',
    })
    if (!approved) return
    deleteCustomer(customer.id)
    notify(ar ? 'تم حذف الزبون' : 'Customer deleted')
  }

  return (
    <div className="space-y-3">
      <SectionHead
        title={ar ? 'الزبائن' : 'Customers'}
        hint={
          ar
            ? 'كل زبون عم يسجّل حساب — إيميله محفوظ محلياً على هذا الجهاز لإعلاناتك.'
            : 'Everyone who signed up — emails are stored locally on this device for your campaigns.'
        }
      />

      {/* الإحصائيات */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label={ar ? 'المجموع' : 'Total'} value={customers.length} tone="gold" />
        <Stat
          label={ar ? 'هذا الشهر' : 'This month'}
          value={customers.filter((c) => (c.createdAt || '').slice(0, 7) === new Date().toISOString().slice(0, 7)).length}
          tone="green"
        />
        <Stat
          label={ar ? 'بدون هاتف' : 'No phone'}
          value={customers.filter((c) => !c.phone).length}
          tone="muted"
        />
      </div>

      {/* البحث + التنزيل */}
      <Card>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className="field flex-1"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ar ? '🔍 ابحث بالاسم أو الإيميل…' : '🔍 Search name or email…'}
          />
          <button type="button" onClick={doExport} className="btn-primary shrink-0 py-3">
            <IconDownload size={16} />
            {ar ? 'تنزيل Excel / Sheets' : 'Export CSV'}
          </button>
        </div>

        <p className="mt-2.5 rounded-xl border border-gold/12 bg-gold/[0.055] px-3 py-2 text-[9px] font-bold leading-relaxed text-white/35">
          {ar
            ? '💡 الملف بينفتح مباشرة بـ Excel و Google Sheets (File → Import). استعمله للرسائل والإعلانات.'
            : '💡 Opens directly in Excel and Google Sheets (File → Import). Use it for email campaigns.'}
        </p>
      </Card>

      {list.length === 0 && (
        <Card>
          <div className="py-12 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-gold/50">
              <IconUsers size={23} />
            </span>
            <p className="mt-3 text-xs font-black text-white/35">
              {customers.length === 0
                ? ar
                  ? 'ما في زبائن مسجّلين بعد'
                  : 'No customers yet'
                : ar
                  ? 'ما في نتائج'
                  : 'No matches'}
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-2.5 xl:grid-cols-2">
        {list.map((c) => (
          <Card key={c.id} className="p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-deep text-sm font-black text-[#1a130b] shadow-[0_10px_25px_-16px_rgba(231,201,123,0.9)]">
                {(c.name || c.email || '?').slice(0, 1).toUpperCase()}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[12.5px] font-extrabold text-white/78">
                  {c.name || '—'}
                </p>
                <a
                  href={`mailto:${c.email}`}
                  dir="ltr"
                  className="mt-0.5 block truncate text-[10px] font-bold text-gold/70 hover:text-gold hover:underline"
                >
                  {c.email}
                </a>
                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[9px] font-semibold text-white/28">
                  {c.phone && <span dir="ltr">📱 {c.phone}</span>}
                  <span>📅 {(c.createdAt || '').slice(0, 10)}</span>
                </div>
                {c.note && (
                  <p className="mt-2 rounded-lg border border-white/[0.05] bg-white/[0.025] px-2.5 py-1.5 text-[9px] font-semibold text-white/35">
                    {c.note}
                  </p>
                )}
              </div>

              <IconBtn title={t('delete')} danger onClick={() => remove(c)}>
                <IconTrash size={15} />
              </IconBtn>
            </div>
          </Card>
        ))}
      </div>

      {list.length > 0 && (
        <p className="pt-2 text-center text-[9px] font-bold text-white/22">
          {ar ? 'عرض ' : 'Showing '}
          {list.length}
          {ar ? ' من ' : ' of '}
          {customers.length}
        </p>
      )}

      {confirmDialog}
    </div>
  )
}

/** بطاقة إحصائية صغيرة */
function Stat({ label, value, tone }) {
  const tones = {
    gold: 'from-gold/[0.12] to-transparent border-gold/25 text-gold',
    green: 'from-emerald-400/[0.09] to-transparent border-emerald-400/20 text-emerald-300',
    muted: 'from-white/[0.04] to-transparent border-white/10 text-white/45',
  }
  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-3 text-center ${tones[tone]}`}
    >
      <p className="text-xl font-black">{value}</p>
      <p className="mt-0.5 text-[8px] font-black uppercase tracking-wide opacity-80">
        {label}
      </p>
    </div>
  )
}