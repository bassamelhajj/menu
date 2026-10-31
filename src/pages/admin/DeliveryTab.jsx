import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { fmtPrice } from '../../lib/format'
import { Card, Field, SectionHead } from './ui'
import { IconCheck, IconCoin, IconTruck } from '../../components/icons'

const clampMoney = (value) => Math.max(0, Math.round(Number(value) || 0))

export default function DeliveryTab({ notify }) {
  const { lang, currency, notify: appNotify } = useApp()
  const { settings, setSettings, usdRate } = useContent()
  const ar = lang === 'ar'
  const toast = notify || appNotify

  const [fee, setFee] = useState(() => clampMoney(settings.deliveryFee))
  const [freeOver, setFreeOver] = useState(() => clampMoney(settings.freeDeliveryOver))

  const dirty =
    clampMoney(fee) !== clampMoney(settings.deliveryFee) ||
    clampMoney(freeOver) !== clampMoney(settings.freeDeliveryOver)

  const sampleSubtotal = 300000
  const sampleFee =
    freeOver > 0 && sampleSubtotal >= freeOver ? 0 : clampMoney(fee)

  const usdFee = useMemo(
    () => (Number(fee) || 0) / (Number(usdRate) || 1),
    [fee, usdRate],
  )
  const usdThreshold = useMemo(
    () => (Number(freeOver) || 0) / (Number(usdRate) || 1),
    [freeOver, usdRate],
  )

  const save = () => {
    const nextFee = clampMoney(fee)
    const nextThreshold = clampMoney(freeOver)
    setSettings({ deliveryFee: nextFee, freeDeliveryOver: nextThreshold })
    setFee(nextFee)
    setFreeOver(nextThreshold)
    toast(
      ar ? 'تم حفظ إعدادات التوصيل ✓' : 'Delivery settings saved ✓',
    )
  }

  const reset = () => {
    setFee(clampMoney(settings.deliveryFee))
    setFreeOver(clampMoney(settings.freeDeliveryOver))
  }

  return (
    <div className="space-y-4">
      <SectionHead
        title={ar ? 'التوصيل والرسوم' : 'Delivery & fees'}
        hint={
          ar
            ? 'تحكّم بسعر التوصيل وحدّ التوصيل المجاني. تُطبّق القيم تلقائياً على سلة الزبون ورسالة واتساب.'
            : 'Control the delivery fee and free-delivery threshold. Values apply to the cart and WhatsApp order message.'
        }
      />

      <section className="exec-glass relative overflow-hidden rounded-[1.6rem] p-5 sm:p-6">
        <div className="pointer-events-none absolute -end-16 -top-20 h-56 w-56 rounded-full border border-gold/10" />
        <div className="pointer-events-none absolute -start-12 bottom-[-6rem] h-40 w-40 rounded-full bg-gold/[0.07] blur-3xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/[0.08] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.18em] text-gold">
              <IconTruck size={12} />
              {ar ? 'منطقة التوصيل' : 'Delivery engine'}
            </span>
            <h2 className="mt-3 font-display text-[25px] font-semibold tracking-wide text-[#f7f1e5] sm:text-[30px]">
              {ar ? 'توصيل واضح من أول نظرة' : 'Delivery, crystal clear'}
            </h2>
            <p className="mt-1.5 max-w-xl text-[10.5px] font-semibold leading-relaxed text-white/35">
              {ar
                ? 'الرسوم تُضاف فقط عند اختيار الزبون للتوصيل. الاستلام من المحل يبقى مجانياً، وحدّ التوصيل المجاني اختياري.'
                : 'The fee is added only when the customer chooses delivery. Pickup remains free; the free-delivery threshold is optional.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:min-w-[20rem]">
            <div className="rounded-2xl border border-gold/15 bg-gold/[0.055] px-3.5 py-3">
              <p className="text-[7.5px] font-black uppercase tracking-[0.18em] text-gold/50">
                {ar ? 'سعر التوصيل' : 'Delivery fee'}
              </p>
              <p className="mt-1.5 text-[16px] font-black text-gold">
                {Number(fee) > 0 ? fmtPrice(clampMoney(fee), currency, usdRate) : ar ? 'مجاني' : 'Free'}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3.5 py-3">
              <p className="text-[7.5px] font-black uppercase tracking-[0.18em] text-white/25">
                {ar ? 'توصيل مجاني فوق' : 'Free over'}
              </p>
              <p className="mt-1.5 text-[16px] font-black text-white/70">
                {Number(freeOver) > 0 ? fmtPrice(clampMoney(freeOver), currency, usdRate) : '—'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-[17px] font-semibold tracking-wide text-[#f7f1e5]">
                {ar ? 'إعدادات الرسوم' : 'Fee settings'}
              </h3>
              <p className="mt-0.5 text-[9px] font-bold text-white/30">
                {ar ? 'كل الأسعار بالليرة اللبنانية' : 'All values are in Lebanese Lira'}
              </p>
            </div>
            {dirty && (
              <span className="rounded-full border border-gold/25 bg-gold/[0.08] px-2 py-1 text-[7.5px] font-black uppercase tracking-wider text-gold">
                {ar ? 'غير محفوظ' : 'Unsaved'}
              </span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label={ar ? 'سعر التوصيل (ل.ل)' : 'Delivery fee (LL)'}
              type="number"
              min={0}
              step={5000}
              value={fee}
              onChange={setFee}
              hint={
                ar
                  ? `ما يعادل ≈ $${usdFee.toFixed(2)} · صفر = بدون رسوم`
                  : `≈ $${usdFee.toFixed(2)} · zero means no fee`
              }
            />
            <Field
              label={ar ? 'توصيل مجاني فوق (ل.ل)' : 'Free delivery over (LL)'}
              type="number"
              min={0}
              step={50000}
              value={freeOver}
              onChange={setFreeOver}
              hint={
                ar
                  ? `≈ $${usdThreshold.toFixed(2)} · صفر = غير مفعّل`
                  : `≈ $${usdThreshold.toFixed(2)} · zero disables it`
              }
            />
          </div>

          <div className="mt-4">
            <p className="label-in">{ar ? 'قيم سريعة' : 'Quick presets'}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[0, 50000, 100000, 150000, 200000].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFee(value)}
                  className={`rounded-full border px-2.5 py-1.5 text-[9px] font-black transition-colors ${
                    clampMoney(fee) === value
                      ? 'border-gold/35 bg-gold/[0.12] text-gold'
                      : 'border-white/[0.07] bg-white/[0.025] text-white/35 hover:border-white/15 hover:text-white/60'
                  }`}
                >
                  {value === 0 ? (ar ? 'بدون' : 'None') : `${value.toLocaleString('en-US')} LL`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <p className="label-in">{ar ? 'حدود التوصيل المجاني' : 'Free-delivery thresholds'}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[0, 500000, 750000, 1000000, 1500000].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setFreeOver(value)}
                  className={`rounded-full border px-2.5 py-1.5 text-[9px] font-black transition-colors ${
                    clampMoney(freeOver) === value
                      ? 'border-gold/35 bg-gold/[0.12] text-gold'
                      : 'border-white/[0.07] bg-white/[0.025] text-white/35 hover:border-white/15 hover:text-white/60'
                  }`}
                >
                  {value === 0 ? (ar ? 'غير مفعّل' : 'Off') : `${value.toLocaleString('en-US')} LL`}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-white/[0.06] pt-4">
            {dirty && (
              <button type="button" onClick={reset} className="btn-ghost px-4 py-2.5">
                {ar ? 'تراجع' : 'Reset'}
              </button>
            )}
            <motion.button
              type="button"
              onClick={save}
              whileTap={{ scale: 0.97 }}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5"
            >
              <IconCheck size={15} />
              {ar ? 'حفظ إعدادات التوصيل' : 'Save delivery settings'}
            </motion.button>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="relative overflow-hidden">
            <div className="pointer-events-none absolute -end-12 -top-12 h-32 w-32 rounded-full bg-emerald-400/[0.07] blur-3xl" />
            <div className="relative flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                <IconCoin size={16} />
              </span>
              <div>
                <h3 className="font-display text-[16px] font-semibold tracking-wide text-[#f7f1e5]">
                  {ar ? 'معاينة حيّة' : 'Live preview'}
                </h3>
                <p className="text-[8.5px] font-bold text-white/30">
                  {ar ? 'طلب بقيمة 300,000 ل.ل' : 'A 300,000 LL order'}
                </p>
              </div>
            </div>

            <div className="relative mt-4 space-y-2 rounded-2xl border border-white/[0.06] bg-black/15 p-3.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-white/40">
                <span>{ar ? 'المجموع الفرعي' : 'Subtotal'}</span>
                <span>{fmtPrice(sampleSubtotal, currency, usdRate)}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-white/40">
                <span>🛵 {ar ? 'التوصيل' : 'Delivery'}</span>
                <span className={sampleFee === 0 ? 'text-emerald-300' : 'text-gold'}>
                  {sampleFee === 0
                    ? ar
                      ? 'مجاني'
                      : 'Free'
                    : fmtPrice(sampleFee, currency, usdRate)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-2 text-[11px] font-black text-white/75">
                <span>{ar ? 'الإجمالي' : 'Total'}</span>
                <span>{fmtPrice(sampleSubtotal + sampleFee, currency, usdRate)}</span>
              </div>
            </div>

            {Number(freeOver) > 0 && (
              <p className="relative mt-3 text-[8.5px] font-bold leading-relaxed text-emerald-300/60">
                {ar
                  ? `الطلبات فوق ${fmtPrice(freeOver, currency, usdRate)} تحصل على توصيل مجاني.`
                  : `Orders above ${fmtPrice(freeOver, currency, usdRate)} receive free delivery.`}
              </p>
            )}
          </Card>

          <Card>
            <h3 className="font-display text-[16px] font-semibold tracking-wide text-[#f7f1e5]">
              {ar ? 'كيف بتنعكس على الزبون؟' : 'How customers see it'}
            </h3>
            <ul className="mt-3 space-y-2.5">
              {[
                ar
                  ? 'تظهر الرسوم كسطر مستقل داخل السلة عند اختيار التوصيل.'
                  : 'The fee appears as a separate line in the cart for delivery.',
                ar
                  ? 'تضاف الرسوم إلى إجمالي الطلب في رسالة واتساب.'
                  : 'The fee is included in the WhatsApp order total.',
                ar
                  ? 'الاستلام من المحل لا يتأثر بأي رسوم.'
                  : 'Pickup orders are never charged a delivery fee.',
                ar
                  ? 'عند إغلاق المتجر من الشريط العلوي، يتوقف الطلب فوراً.'
                  : 'Closing the store from the top bar instantly pauses ordering.',
              ].map((line) => (
                <li key={line} className="flex items-start gap-2 text-[9.5px] font-semibold leading-relaxed text-white/38">
                  <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                    <IconCheck size={9} />
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
