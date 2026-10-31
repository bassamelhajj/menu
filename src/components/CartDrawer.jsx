import { useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { useUI } from '../store/UIContext'
import { calcDeliveryFee, fmtAlt, fmtPrice } from '../lib/format'
import {
  IconCart,
  IconClose,
  IconMinus,
  IconPin,
  IconPlus,
  IconTrash,
  IconWhatsApp,
  IconEdit,
} from './icons'

export default function CartDrawer({ onClose }) {
  const {
    lang,
    currency,
    t,
    cart,
    changeQty,
    removeLine,
    clearCart,
    cartTotalLL,
    cartOriginalTotalLL,
    cartSavingsLL,
    cartCount,
    checkout,
    lastOrder,
    notify,
  } = useApp()
  const { products, usdRate, settings } = useContent()
  const { openProduct } = useUI()
  const [mode, setMode] = useState('pickup')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [pickupTime, setPickupTime] = useState('')
  const [payment, setPayment] = useState('cash')
  const [requests, setRequests] = useState('')
  const [shareLocation, setShareLocation] = useState(false)
  const deliveryFee = calcDeliveryFee(settings, cartTotalLL, mode)
  const grandTotalLL = cartTotalLL + deliveryFee
  const storeClosed = settings.storeStatus === 'closed'

  const submit = () => {
    if (storeClosed) return
    if (!name.trim()) {
      notify(t('nameNeeded'))
      return
    }
    if (!phone.trim()) {
      notify(lang === 'ar' ? 'اكتب رقم هاتفك من فضلك' : 'Please enter your phone number')
      return
    }
    if (mode === 'delivery' && !address.trim() && !shareLocation) {
      notify(t('areaNeeded'))
      return
    }
    checkout({
      mode,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      pickupTime: pickupTime.trim(),
      payment,
      requests: requests.trim(),
      shareLocation,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-cocoa/70 backdrop-blur-md"
      />

      <motion.div
        initial={{ y: '100%', opacity: 0.6 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0.4 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
        className="relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[2rem] border border-line bg-bg shadow-2xl sm:max-w-lg sm:rounded-[2rem]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-2xl primary-bg text-cream">
              <IconCart size={20} />
            </span>
            <div>
              <h2 className="text-base font-black text-ink">{t('cart')}</h2>
              <span className="text-[11px] font-bold text-muted">
                {cartCount} {lang === 'ar' ? 'عنصر' : 'items'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {cart.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="rounded-xl px-3 py-2 text-[11px] font-extrabold text-muted transition-colors hover:bg-panel hover:text-red-500"
              >
                {t('clear')}
              </button>
            )}
            <button
              type="button"
              aria-label={t('close')}
              onClick={onClose}
              className="grid h-10 w-10 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:text-primary active:scale-90"
            >
              <IconClose size={18} />
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="no-scrollbar flex-1 overflow-y-auto px-4 py-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <span className="text-5xl">🛒</span>
              <p className="mt-4 text-sm font-extrabold text-ink">
                {t('cartEmpty')}
              </p>
              <p className="mt-1 text-xs text-muted">{t('cartEmptyHint')}</p>
            </div>
          ) : (
            <>
              <ul className="space-y-2.5">
                {cart.map((line) => (
                  <motion.li
                    layout
                    key={line.key}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-3"
                  >
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-panel text-2xl">
                      {line.emoji}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-[13px] font-extrabold leading-snug text-ink">
                          {lang === 'ar' ? line.ar : line.en}
                        </h3>

                        {/* أزرار التحرير والحذف */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            aria-label={lang === 'ar' ? 'تعديل' : 'Edit'}
                            onClick={() => {
                              const fullProduct = products.find((product) => product.id === line.id)
                              if (fullProduct) openProduct(fullProduct, line)
                            }}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-gold/10 hover:text-gold-deep active:scale-90"
                          >
                            <IconEdit size={15} />
                          </button>
                          <button
                            type="button"
                            aria-label={t('clear')}
                            onClick={() => removeLine(line.key)}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-500 active:scale-90"
                          >
                            <IconTrash size={15} />
                          </button>
                        </div>
                      </div>

                      {line.sizeLabelAr !== 'عادي' && (
                        <span className="mt-0.5 inline-block rounded-md bg-panel px-1.5 py-0.5 text-[10px] font-bold text-muted">
                          {lang === 'ar' ? line.sizeLabelAr : line.sizeLabelEn}
                        </span>
                      )}

                      {line.bundleItems?.length > 0 && (
                        <p className="mt-1 text-[10px] font-bold text-gold-deep">
                          🎁 {line.bundleItems
                            .map((item) => `${item.qty}× ${lang === 'ar' ? item.ar : item.en}`)
                            .join(' + ')}
                        </p>
                      )}

                      {line.extras?.length > 0 && (
                        <p className="mt-1 text-[10px] font-bold text-primary/90">
                          + {line.extras.map((e) => (lang === 'ar' ? e.ar : e.en)).join(' · ')}
                        </p>
                      )}

                      {line.note && (
                        <p className="mt-1 rounded-lg bg-panel/70 px-2 py-1 text-[9px] font-semibold text-muted">
                          📝 {line.note}
                        </p>
                      )}

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1 rounded-xl border border-line bg-bg p-0.5">
                          <button
                            type="button"
                            aria-label="-"
                            onClick={() => changeQty(line.key, -1)}
                            className="grid h-7 w-7 place-items-center rounded-lg text-ink transition-colors hover:bg-panel active:scale-90"
                          >
                            <IconMinus size={14} />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-ink">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            aria-label="+"
                            onClick={() => changeQty(line.key, 1)}
                            className="grid h-7 w-7 place-items-center rounded-lg text-ink transition-colors hover:bg-panel active:scale-90"
                          >
                            <IconPlus size={14} />
                          </button>
                        </div>

                        <div className="text-end">
                          {(line.originalUnitLL || line.unitLL) > line.unitLL && (
                            <span className="block text-[10px] text-stone-400 font-normal line-through opacity-70">
                              {fmtPrice((line.originalUnitLL || line.unitLL) * line.qty, currency, usdRate)}
                            </span>
                          )}
                          <span className="block text-[13px] font-bold text-amber-500">
                            {fmtPrice(line.unitLL * line.qty, currency, usdRate)}
                          </span>
                          {(line.originalUnitLL || line.unitLL) > line.unitLL && (
                            <span className="block text-[8px] text-stone-400 font-normal line-through opacity-70">
                              {fmtAlt((line.originalUnitLL || line.unitLL) * line.qty, currency, usdRate)}
                            </span>
                          )}
                          <span className="block text-[9px] font-bold text-amber-500/85">
                            {fmtAlt(line.unitLL * line.qty, currency, usdRate)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>

              {/* Order Details */}
              <div className="mt-4 rounded-2xl border border-gold/40 bg-gold/8 p-3">
                <p className="mb-2 text-[10px] font-black tracking-wide text-gold-deep">
                  {t('details')} · {t('confirmSend')}
                </p>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'delivery', icon: '🛵', ar: 'توصيل', en: 'Delivery' },
                    { id: 'dinein', icon: '🍽️', ar: 'داخل المحل', en: 'Dine-in' },
                    { id: 'pickup', icon: '🛍️', ar: 'تيك أواي', en: 'Takeaway' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setMode(type.id)}
                      className={`rounded-xl border px-2 py-2.5 text-[10px] font-extrabold transition-all ${
                        mode === type.id
                          ? 'border-transparent primary-bg text-cream shadow'
                          : 'border-line bg-bg text-ink hover:border-gold/50'
                      }`}
                    >
                      {type.icon} {lang === 'ar' ? type.ar : type.en}
                    </button>
                  ))}
                </div>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('nameLabel')}
                  className="field mt-2"
                />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  inputMode="tel"
                  placeholder={lang === 'ar' ? 'رقم الهاتف' : 'Phone number'}
                  className="field mt-2"
                />

                {mode === 'delivery' && (
                  <>
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={t('areaAddress')}
                      className="field mt-2"
                    />
                    <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-line bg-bg px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={shareLocation}
                        onChange={(e) => setShareLocation(e.target.checked)}
                        className="h-4 w-4 accent-[#607848]"
                      />
                      <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-ink">
                        <IconPin size={14} className="text-primary" />
                        {t('shareLocation')}
                      </span>
                    </label>
                  </>
                )}

                {mode === 'pickup' && (
                  <label className="mt-2 block">
                    <span className="mb-1 block text-[10px] font-black text-muted">
                      {lang === 'ar' ? 'وقت الاستلام' : 'Pickup time'}
                    </span>
                    <input
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      type="time"
                      className="field"
                    />
                  </label>
                )}

                {mode === 'dinein' && (
                  <p className="mt-2 rounded-xl border border-line bg-bg px-3 py-2.5 text-[10px] font-bold text-muted">
                    🍽️ {lang === 'ar' ? 'متواجد بقلب المحل — منحضّر طلبك على الطاولة.' : 'Dine-in — we will serve your order at the table.'}
                  </p>
                )}

                <div className="mt-2">
                  <p className="mb-1 text-[10px] font-black text-muted">
                    {lang === 'ar' ? 'طريقة الدفع' : 'Payment method'}
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'cash', icon: '💵', ar: 'كاش', en: 'Cash' },
                      { id: 'wish', icon: '📱', ar: 'ويش موني', en: 'Wish Money' },
                    ].map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPayment(method.id)}
                        className={`rounded-xl border px-2 py-2 text-[10px] font-extrabold transition-all ${
                          payment === method.id
                            ? 'border-gold/60 bg-gold/15 text-gold-deep'
                            : 'border-line bg-bg text-muted hover:border-gold/40'
                        }`}
                      >
                        {method.icon} {lang === 'ar' ? method.ar : method.en}
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={requests}
                  onChange={(e) => setRequests(e.target.value)}
                  placeholder={t('specialRequests')}
                  className="field mt-2"
                  rows={2}
                />
              </div>

              {lastOrder && (
                <p className="mt-3 rounded-xl bg-primary/8 px-3 py-2 text-center text-[11px] font-black text-primary">
                  {t('orderNumber')}: {lastOrder.id}
                </p>
              )}
            </>
          )}
        </div>

        {/* Footer - Total & Checkout */}
        {cart.length > 0 && (
          <div className="shrink-0 border-t border-line bg-surface px-5 py-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-muted">
                <span>{t('subtotal')}</span>
                <span>{fmtPrice(cartTotalLL, currency, usdRate)}</span>
              </div>

              {cartSavingsLL > 0 && (
                <div className="flex items-center justify-between text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  <span>
                    {lang === 'ar' ? 'إجمالي التوفير' : 'Total savings'}
                    <span className="ms-1 text-[9px] font-normal text-stone-400 line-through opacity-70">
                      {fmtPrice(cartOriginalTotalLL, currency, usdRate)}
                    </span>
                  </span>
                  <span>
                    -{fmtPrice(cartSavingsLL, currency, usdRate)} ·{' '}
                    {fmtAlt(cartSavingsLL, currency, usdRate)}
                  </span>
                </div>
              )}

              {mode === 'delivery' && (
                <div className="flex items-center justify-between text-[11px] font-bold text-muted">
                  <span>🛵 {t('delivery')}</span>
                  <span className={deliveryFee === 0 ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                    {deliveryFee === 0
                      ? lang === 'ar'
                        ? 'مجاني'
                        : 'Free'
                      : fmtPrice(deliveryFee, currency, usdRate)}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-line/80 pt-2">
                <span className="text-sm font-extrabold text-ink">{t('grandTotal')}</span>
                <div className="text-end">
                  <span className="block text-xl font-black text-primary">
                    {fmtPrice(grandTotalLL, currency, usdRate)}
                  </span>
                  <span className="block text-[10px] font-semibold text-muted/80">
                    {fmtAlt(grandTotalLL, currency, usdRate)}
                  </span>
                </div>
              </div>
            </div>

            <p className="mt-2 text-center text-[10px] font-bold text-muted">
              {lang === 'ar'
                ? `سعر الصرف: ١$ = ${usdRate.toLocaleString('en-US')} ل.ل`
                : `Exchange rate: $1 = ${usdRate.toLocaleString('en-US')} L.L.`}
            </p>

            {storeClosed && (
              <p className="mt-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-center text-[10px] font-black text-red-500">
                {lang === 'ar'
                  ? 'المحل مغلق حالياً — استقبال الطلبات متوقف'
                  : 'The store is currently closed — orders are paused'}
              </p>
            )}

            <motion.button
              type="button"
              whileTap={storeClosed ? undefined : { scale: 0.97 }}
              onClick={submit}
              disabled={storeClosed}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25d366] py-3.5 text-sm font-black text-white shadow-[0_12px_30px_-10px_rgba(37,211,102,0.7)] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              <IconWhatsApp size={19} />
              {storeClosed
                ? lang === 'ar'
                  ? 'الطلبات متوقفة مؤقتاً'
                  : 'Ordering is paused'
                : t('checkout')}
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  )
}