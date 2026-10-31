import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { makeT } from '../lib/i18n'
import {
  calcDeliveryFee,
  isBundleProduct,
  productUnitPricing,
} from '../lib/format'
import { useContent } from './ContentContext'

const AppContext = createContext(null)

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}

const readLS = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const makeLineKey = (id, sizeIdx, extras, note = '') =>
  `${id}__${sizeIdx}__${extras.map((e) => e.id).sort().join('-')}__${note.trim()}`

export function AppProvider({ children }) {
  const { settings, usdRate, createOrder, globalOffer, products } = useContent()
  const [lang, setLang] = useState(() => readLS('benova:lang', 'ar'))
  const [currency, setCurrency] = useState(() => readLS('benova:currency', 'LL'))
  const [dark, setDark] = useState(() => readLS('benova:dark', false))
  const [cart, setCart] = useState(() => readLS('benova:cart', []))
  const [favorites, setFavorites] = useState(() => readLS('benova:fav', []))
  const [toast, setToast] = useState(null)
  const [lastOrder, setLastOrder] = useState(null)

  // ---- side effects -------------------------------------------------------
  useEffect(() => {
    const el = document.documentElement
    el.dir = lang === 'ar' ? 'rtl' : 'ltr'
    el.lang = lang
    localStorage.setItem('benova:lang', JSON.stringify(lang))
  }, [lang])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('benova:dark', JSON.stringify(dark))
  }, [dark])

  useEffect(() => {
    localStorage.setItem('benova:currency', JSON.stringify(currency))
  }, [currency])

  useEffect(() => {
    localStorage.setItem('benova:cart', JSON.stringify(cart))
  }, [cart])

  useEffect(() => {
    localStorage.setItem('benova:fav', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  // ---- helpers ------------------------------------------------------------
  const t = useMemo(() => makeT(lang), [lang])

  const notify = useCallback((message) => {
    setToast({ id: Date.now(), message })
  }, [])

  const toggleLang = useCallback(
    () => setLang((l) => (l === 'ar' ? 'en' : 'ar')),
    [],
  )
  const toggleCurrency = useCallback(
    () => setCurrency((c) => (c === 'LL' ? 'USD' : 'LL')),
    [],
  )
  const toggleDark = useCallback(() => setDark((d) => !d), [])

  const isFavorite = useCallback(
    (id) => favorites.includes(id),
    [favorites],
  )

  const toggleFavorite = useCallback(
    (id) => {
      setFavorites((prev) => {
        const exists = prev.includes(id)
        notify(exists ? t('favRemoved') : t('favAdded'))
        return exists ? prev.filter((x) => x !== id) : [...prev, id]
      })
    },
    [notify, t],
  )

  // ---- cart ---------------------------------------------------------------
  const addToCart = useCallback(
    ({ product, sizeIdx = 0, size, extras = [], qty = 1, note = '' }) => {
      const cleanNote = note.trim()
      const lineKey = makeLineKey(product.id, sizeIdx, extras, cleanNote)
      const pricing = productUnitPricing({
        product,
        size,
        allProducts: products,
        globalOffer,
      })
      const extrasTotal = extras.reduce((sum, extra) => sum + extra.priceLL, 0)
      const unitLL = pricing.finalLL + extrasTotal
      const originalUnitLL = pricing.originalLL + extrasTotal
      const bundleItems = isBundleProduct(product)
        ? (product.bundleItems || []).map((item) => {
            const component = products.find((entry) => entry.id === item.productId)
            return {
              ar: component?.ar || 'عنصر محذوف',
              en: component?.en || 'Removed item',
              qty: Math.max(1, Number(item.qty) || 1),
            }
          })
        : []

      setCart((prev) => {
        const existing = prev.find((l) => l.key === lineKey)
        if (existing) {
          return prev.map((l) =>
            l.key === lineKey
              ? {
                  ...l,
                  qty: l.qty + qty,
                  unitLL,
                  originalUnitLL,
                }
              : l,
          )
        }
        return [
          ...prev,
          {
            key: lineKey,
            id: product.id,
            ar: product.ar,
            en: product.en,
            emoji: product.emoji,
            sizeIdx,
            sizeLabelAr: size.labelAr,
            sizeLabelEn: size.labelEn,
            extras: extras.map((e) => ({ id: e.id, ar: e.ar, en: e.en, priceLL: e.priceLL })),
            bundleItems,
            note: cleanNote,
            unitLL,
            originalUnitLL,
            qty,
          },
        ]
      })
      notify(`${product.emoji} ${t('added')}`)
    },
    [notify, t, globalOffer, products],
  )

  const changeQty = useCallback((key, delta) => {
    setCart((prev) =>
      prev
        .map((l) => (l.key === key ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0),
    )
  }, [])

  const removeLine = useCallback((key) => {
    setCart((prev) => prev.filter((l) => l.key !== key))
  }, [])

  const clearCart = useCallback(() => setCart([]), [])

  const cartCount = useMemo(
    () => cart.reduce((sum, l) => sum + l.qty, 0),
    [cart],
  )
  const cartTotalLL = useMemo(
    () => cart.reduce((sum, l) => sum + l.unitLL * l.qty, 0),
    [cart],
  )
  const cartOriginalTotalLL = useMemo(
    () =>
      cart.reduce(
        (sum, line) =>
          sum + (Number(line.originalUnitLL) || Number(line.unitLL) || 0) * line.qty,
        0,
      ),
    [cart],
  )
  const cartSavingsLL = Math.max(0, cartOriginalTotalLL - cartTotalLL)

  // ---- checkout -----------------------------------------------------------
  const buildOrderMessage = useCallback(
    (order) => {
      const divider = '━━━━━━━━━━━━━━━━━━'
      const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
      const money = (value) => {
        const ll = Math.max(0, Math.round(Number(value) || 0))
        return `$${(ll / usdRate).toFixed(2)} · ${ll.toLocaleString('en-US')} ل.ل`
      }

      const sourceItems = Array.isArray(order?.items) && order.items.length
        ? order.items
        : cart.map((line) => ({
            nameAr: line.ar,
            nameEn: line.en,
            sizeAr: line.sizeLabelAr,
            sizeEn: line.sizeLabelEn,
            extras: line.extras,
            bundleItems: line.bundleItems,
            note: line.note,
            unitLL: line.unitLL,
            qty: line.qty,
          }))

      const itemBlocks = sourceItems.map((item, index) => {
        const name = item.nameAr || item.nameEn || '—'
        const size = item.sizeAr || item.sizeEn || ''
        const qty = Math.max(1, Number(item.qty) || 1)
        const unitLL = Math.max(0, Number(item.unitLL) || 0)
        const extraNames = (item.extras || [])
          .map((extra) => extra.ar || extra.en)
          .filter(Boolean)
        const bundleNames = (item.bundleItems || []).map(
          (component) =>
            `${Math.max(1, Number(component.qty) || 1)}× ${component.ar || component.en || '—'}`,
        )
        const block = [
          `${numbers[index] || `${index + 1}.`} *${name}*${size ? ` (${size})` : ''}`,
          `   • الكمية: ${qty}`,
          `   • السعر: ${money(unitLL * qty)}`,
        ]
        if (bundleNames.length > 0) {
          block.push(`   • المحتويات: ${bundleNames.join(' + ')}`)
        }
        block.push(`   • الإضافات: ${extraNames.length ? extraNames.join('، ') : 'بدون إضافات'}`)
        block.push(`   • ملاحظات: ${item.note || '—'}`)
        return block.join('\n')
      })

      const modeLabel =
        order?.mode === 'delivery'
          ? '🛵 توصيل للمنزل'
          : order?.mode === 'dinein'
            ? '🍽️ داخل المحل'
            : '🛍️ تيك أواي'

      const deliveryDetails =
        order?.mode === 'delivery'
          ? [order?.address || order?.area || '', order?.shareLocation ? 'مشاركة الموقع مفعّلة' : '']
              .filter(Boolean)
              .join(' — ') || '—'
          : order?.mode === 'dinein'
            ? 'متواجد بقلب المحل'
            : order?.pickupTime || 'أقرب وقت متاح'
      const contactDetails = order?.requests
        ? `${deliveryDetails} — ${order.requests}`
        : deliveryDetails

      const totalLL = Math.max(0, Number(order?.totalLL) || cartTotalLL)
      const feeLL = Math.max(0, Number(order?.deliveryFee) || 0)
      const subtotalLL = Math.max(0, totalLL - feeLL)
      const savingsLL = Math.max(0, Number(order?.savingsLL) || cartSavingsLL)
      const paymentLabel = order?.payment === 'wish' ? '📱 ويش موني' : '💵 كاش'

      const createdAt = new Date(order?.createdAt || Date.now())
      const dateTime = Number.isNaN(createdAt.getTime())
        ? '—'
        : new Intl.DateTimeFormat('ar-LB', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }).format(createdAt)

      return [
        '🧾 *فاتورة طلب جديدة من BENOVA*',
        divider,
        `🆔 *رقم الطلب:* #${order?.id ?? '—'}`,
        `📅 *التاريخ والوقت:* ${dateTime}`,
        `📌 *نوع الطلب:* ${modeLabel}`,
        '',
        '👤 *بيانات الزبون:*',
        `• *الاسم:* ${order?.name || '—'}`,
        `• *رقم الهاتف:* ${order?.phone || '—'}`,
        `• *العنوان/التفاصيل:* ${contactDetails}`,
        '',
        '🍔 *تفاصيل الطلب:*',
        divider,
        itemBlocks.join('\n\n'),
        '',
        divider,
        '💵 *الملخص المالي:*',
        `• *المجموع الفرعي:* ${money(subtotalLL)}`,
        `• *رسوم التوصيل:* ${order?.mode === 'delivery' ? money(feeLL) : 'لا يوجد'}`,
        `• *إجمالي التوفير/الخصم:* ${money(savingsLL)}`,
        '',
        '🏷️ *الإجمالي النهائي للدفعة:*',
        `👉 *$${(totalLL / usdRate).toFixed(2)}*`,
        `👉 *${Math.round(totalLL).toLocaleString('en-US')} LBP*`,
        '',
        `💳 *طريقة الدفع:* ${paymentLabel}`,
        divider,
        'شكرًا لطلبكم من **BENOVA**! 🌟',
      ].join('\n')
    },
    [cart, cartTotalLL, cartSavingsLL, usdRate],
  )

  const checkout = useCallback(
    ({
      mode = 'pickup',
      name = '',
      phone = '',
      address = '',
      pickupTime = '',
      payment = 'cash',
      requests = '',
      shareLocation = false,
    } = {}) => {
      if (cart.length === 0) return
      if (settings.storeStatus === 'closed') {
        notify(lang === 'ar' ? 'المحل مغلق حالياً — استقبال الطلبات متوقف' : 'The store is closed — orders are paused')
        return
      }
      const deliveryFee = calcDeliveryFee(settings, cartTotalLL, mode)
      const totalLL = cartTotalLL + deliveryFee
      const order = createOrder({
        items: cart.map((l) => ({
          nameAr: l.ar,
          nameEn: l.en,
          emoji: l.emoji,
          sizeAr: l.sizeLabelAr,
          sizeEn: l.sizeLabelEn,
          extras: l.extras.map((e) => ({ ar: e.ar, en: e.en })),
          bundleItems: l.bundleItems || [],
          note: l.note || '',
          unitLL: l.unitLL,
          originalUnitLL: l.originalUnitLL || l.unitLL,
          qty: l.qty,
        })),
        totalLL,
        originalTotalLL: cartOriginalTotalLL,
        savingsLL: cartSavingsLL,
        deliveryFee,
        mode,
        name,
        phone,
        address,
        pickupTime,
        payment,
        requests,
        shareLocation,
      })
      const message = buildOrderMessage(order)
      const url = `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(message)}`
      // open reliably via a real anchor (window.open + noopener returns null in most browsers)
      try {
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        document.body.appendChild(a)
        a.click()
        a.remove()
      } catch {
        window.open(url, '_blank')
      }
      setCart([])
      setLastOrder(order)
      notify(`${t('orderNumber')} ${order.id} — ${t('orderPlaced')} ✅`)
    },
    [
      buildOrderMessage,
      cart,
      cartOriginalTotalLL,
      cartSavingsLL,
      cartTotalLL,
      createOrder,
      lang,
      notify,
      settings,
      t,
    ],
  )

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      currency,
      setCurrency,
      toggleCurrency,
      dark,
      toggleDark,
      t,
      toast,
      notify,
      cart,
      addToCart,
      changeQty,
      removeLine,
      clearCart,
      cartCount,
      cartTotalLL,
      cartOriginalTotalLL,
      cartSavingsLL,
      favorites,
      isFavorite,
      toggleFavorite,
      checkout,
      buildOrderMessage,
      lastOrder,
    }),
    [
      lang, toggleLang, currency, setCurrency, toggleCurrency, dark, toggleDark, t, toast,
      notify, cart, addToCart, changeQty, removeLine, clearCart, cartCount,
      cartTotalLL, cartOriginalTotalLL, cartSavingsLL, favorites, isFavorite,
      toggleFavorite, checkout, buildOrderMessage, lastOrder,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}