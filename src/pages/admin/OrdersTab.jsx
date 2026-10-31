import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { fmtAlt, fmtPrice } from '../../lib/format'
import { Card, IconBtn, SectionHead, useConfirm } from './ui'
import {
  IconCheck,
  IconChevron,
  IconReceipt,
  IconSearch,
  IconTrash,
  IconTruck,
} from '../../components/icons'

export default function OrdersTab() {
  const { t, lang, currency, notify } = useApp()
  const { orders, usdRate, setOrderStatus, deleteOrder } = useContent()
  const [openId, setOpenId] = useState(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [confirm, confirmDialog] = useConfirm()

  const newCount = orders.filter((order) => order.status === 'new').length
  const doneCount = orders.length - newCount

  const visibleOrders = useMemo(() => {
    const q = query.trim().toLowerCase()
    return orders.filter((order) => {
      if (filter === 'new' && order.status === 'done') return false
      if (filter === 'done' && order.status !== 'done') return false
      if (!q) return true
      return `${order.id} ${order.name || ''} ${order.requests || ''}`
        .toLowerCase()
        .includes(q)
    })
  }, [filter, orders, query])

  const fmtDate = (ts) =>
    new Date(ts).toLocaleString(lang === 'ar' ? 'ar-LB' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })

  const remove = async (order) => {
    const approved = await confirm({
      title: lang === 'ar' ? `حذف الطلب #${order.id}؟` : `Delete order #${order.id}?`,
      message:
        lang === 'ar'
          ? 'رح ينحذف سجل الطلب من هذا الجهاز نهائياً. تأكد إنك ما بحاجة ترجع له.'
          : 'This order record will be permanently removed from this device.',
      confirmLabel: lang === 'ar' ? 'حذف الطلب' : 'Delete order',
      cancelLabel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    })
    if (!approved) return
    deleteOrder(order.id)
    notify(lang === 'ar' ? 'تم حذف الطلب' : 'Order deleted')
  }

  return (
    <div className="space-y-3">
      <SectionHead
        title={t('orders')}
        hint={
          lang === 'ar'
            ? 'كل الطلبات المسجّلة على هذا الجهاز — راقب الجديد، علّم المكتمل، واحتفظ بالأرشيف.'
            : 'Every order logged on this device — track new, mark completed, keep the archive.'
        }
        action={
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-gold/20 bg-gold/[0.07] px-2.5 py-1.5 text-[8.5px] font-black text-gold/80">
              {newCount} {lang === 'ar' ? 'جديد' : 'new'}
            </span>
            <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.06] px-2.5 py-1.5 text-[8.5px] font-black text-emerald-300/70">
              {doneCount} {lang === 'ar' ? 'مكتمل' : 'done'}
            </span>
          </div>
        }
      />

      {orders.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <IconSearch size={15} className="absolute start-3 top-1/2 -translate-y-1/2 text-white/28" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={lang === 'ar' ? 'ابحث برقم الطلب أو الاسم…' : 'Search order number or name…'}
              className="field ps-9"
            />
          </label>
          <div className="flex gap-1.5 rounded-xl border border-white/[0.06] bg-white/[0.025] p-1">
            {[
              { id: 'all', ar: 'الكل', en: 'All' },
              { id: 'new', ar: 'جديد', en: 'New' },
              { id: 'done', ar: 'مكتمل', en: 'Done' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                className={`rounded-lg px-3 py-1.5 text-[9px] font-black transition-colors ${
                  filter === item.id
                    ? 'bg-gold/[0.14] text-gold'
                    : 'text-white/30 hover:text-white/60'
                }`}
              >
                {lang === 'ar' ? item.ar : item.en}
              </button>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <Card>
          <div className="py-12 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-gold/50">
              <IconReceipt size={23} />
            </span>
            <p className="mt-3 text-xs font-bold text-white/35">{t('emptyList')}</p>
            <p className="mt-1 text-[9px] font-semibold text-white/20">
              {lang === 'ar'
                ? 'الطلبات الجديدة من الزبائن رح تظهر هون.'
                : 'New customer orders will appear here.'}
            </p>
          </div>
        </Card>
      )}

      {orders.length > 0 && visibleOrders.length === 0 && (
        <Card>
          <p className="py-8 text-center text-xs font-bold text-white/30">
            {lang === 'ar' ? 'ما في طلبات مطابقة لهذا الفلتر.' : 'No orders match this filter.'}
          </p>
        </Card>
      )}

      {visibleOrders.map((order) => {
        const open = openId === order.id
        const done = order.status === 'done'
        const deliveryFee = Math.max(0, Number(order.deliveryFee) || 0)
        const subtotal = Math.max(0, (Number(order.totalLL) || 0) - deliveryFee)
        const savings = Math.max(0, Number(order.savingsLL) || 0)
        const modeLabel =
          order.mode === 'delivery'
            ? `🛵 ${lang === 'ar' ? 'توصيل' : 'Delivery'}`
            : order.mode === 'dinein'
              ? `🍽️ ${lang === 'ar' ? 'داخل المحل' : 'Dine-in'}`
              : `🛍️ ${lang === 'ar' ? 'تيك أواي' : 'Takeaway'}`
        const paymentLabel =
          order.payment === 'wish'
            ? lang === 'ar'
              ? '📱 ويش موني'
              : '📱 Wish Money'
            : lang === 'ar'
              ? '💵 كاش'
              : '💵 Cash'

        return (
          <Card key={order.id} className="overflow-hidden p-0">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : order.id)}
              className="flex w-full items-center gap-3 p-4 text-start"
            >
              <span
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${
                  done
                    ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                    : 'border-gold/20 bg-gold/10 text-gold'
                }`}
              >
                {done ? <IconCheck size={18} /> : <IconReceipt size={18} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-[12.5px] font-black text-white/80">
                  {t('orderNumber')} <span className="text-gold">#{order.id}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider ${
                      done
                        ? 'bg-emerald-400/10 text-emerald-300/70'
                        : 'bg-gold/10 text-gold/80'
                    }`}
                  >
                    {done ? (lang === 'ar' ? 'مكتمل' : 'Done') : lang === 'ar' ? 'جديد' : 'New'}
                  </span>
                </p>
                <p className="mt-0.5 text-[9px] font-semibold text-white/32">
                  {fmtDate(order.createdAt)} · {modeLabel}
                  {order.name ? ` · ${order.name}` : ''}
                </p>
                <p className="truncate text-[9px] font-semibold text-white/28">
                  {order.items.reduce((sum, item) => sum + item.qty, 0)}{' '}
                  {lang === 'ar' ? 'عنصر' : 'items'} ·{' '}
                  {fmtPrice(order.totalLL, currency, usdRate)}
                </p>
              </div>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                className="text-white/28"
              >
                <IconChevron size={16} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.22 }}
                >
                  <div className="border-t border-white/[0.06] bg-black/15 p-4">
                    <ul className="space-y-1.5">
                      {order.items.map((item, index) => (
                        <li key={index} className="text-[10px] font-bold text-white/60">
                          {item.emoji} {lang === 'ar' ? item.nameAr : item.nameEn} ×{item.qty} —{' '}
                          <span className="text-gold/75">
                            {fmtPrice(item.unitLL * item.qty, currency, usdRate)}
                          </span>
                          {item.bundleItems?.length > 0 && (
                            <span className="block text-[8.5px] font-semibold text-gold/55">
                              🎁 {item.bundleItems
                                .map((component) => `${component.qty}× ${lang === 'ar' ? component.ar : component.en}`)
                                .join(' + ')}
                            </span>
                          )}
                          {item.extras?.length > 0 && (
                            <span className="block text-[8.5px] font-semibold text-white/25">
                              + {item.extras.map((extra) => (lang === 'ar' ? extra.ar : extra.en)).join(' · ')}
                            </span>
                          )}
                          {item.note && (
                            <span className="block text-[8.5px] font-semibold text-white/35">
                              📝 {item.note}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-3 space-y-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                      <p className="flex items-center justify-between text-[9px] font-bold text-white/35">
                        <span>{t('subtotal')}</span>
                        <span>{fmtPrice(subtotal, currency, usdRate)}</span>
                      </p>
                      {savings > 0 && (
                        <p className="flex items-center justify-between text-[9px] font-bold text-emerald-300/65">
                          <span>
                            {lang === 'ar' ? 'التوفير' : 'Savings'}
                            {order.originalTotalLL ? (
                              <span className="ms-1 text-[8px] font-normal text-white/20 line-through">
                                {fmtPrice(order.originalTotalLL, currency, usdRate)}
                              </span>
                            ) : null}
                          </span>
                          <span>
                            -{fmtPrice(savings, currency, usdRate)} ·{' '}
                            {fmtAlt(savings, currency, usdRate)}
                          </span>
                        </p>
                      )}
                      {deliveryFee > 0 && (
                        <p className="flex items-center justify-between text-[9px] font-bold text-white/35">
                          <span className="flex items-center gap-1">
                            <IconTruck size={11} /> {t('deliveryFee')}
                          </span>
                          <span>{fmtPrice(deliveryFee, currency, usdRate)}</span>
                        </p>
                      )}
                      <p className="flex items-center justify-between border-t border-white/[0.06] pt-1.5 text-[10px] font-black text-white/70">
                        <span>{t('grandTotal')}</span>
                        <span className="text-gold">
                          {fmtPrice(order.totalLL, currency, usdRate)} ·{' '}
                          {fmtAlt(order.totalLL, currency, usdRate)}
                        </span>
                      </p>
                    </div>

                    <div className="mt-2 space-y-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-[9px] font-bold text-white/38">
                      {order.name && (
                        <p>👤 {order.name}{order.phone ? ` · ${order.phone}` : ''}</p>
                      )}
                      <p>{modeLabel} · {paymentLabel}</p>
                      {order.mode === 'delivery' && (
                        <p>📍 {order.address || order.area || '—'}{order.shareLocation ? ` · ${lang === 'ar' ? 'مشاركة الموقع مفعّلة' : 'Location shared'}` : ''}</p>
                      )}
                      {order.mode === 'pickup' && order.pickupTime && (
                        <p>⏰ {lang === 'ar' ? 'وقت الاستلام' : 'Pickup time'}: {order.pickupTime}</p>
                      )}
                      {order.requests && (
                        <p>📝 {order.requests}</p>
                      )}
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className={done ? 'btn-ghost flex-1' : 'btn-primary flex-1'}
                        onClick={() => setOrderStatus(order.id, done ? 'new' : 'done')}
                      >
                        {done
                          ? `↩ ${t('orderPending')}`
                          : `✅ ${t('markDone')}`}
                      </button>
                      <IconBtn title={t('delete')} danger onClick={() => remove(order)}>
                        <IconTrash size={15} />
                      </IconBtn>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        )
      })}

      {confirmDialog}
    </div>
  )
}
