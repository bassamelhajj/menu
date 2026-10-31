import { useEffect, useMemo, useState } from 'react'

/**
 * lib/hours.js — حالة فتح/إغلاق المحل
 * ===========================================================================
 * ساعات العمل بتتعدّل من لوحة التحكم كنص حر (عربي/إنجليزي)، فما فينا نعتمد
 * على تنسيق واحد. هون بنقرأ أول وقتين من النص وبنستنتج منهم الحالة.
 *
 * بيدعم:
 *   • 11:00 AM – 12:00 AM
 *   • ١١:٠٠ ص – ١٢:٠٠ م
 *   • 11:00 - 23:30
 *   • 24/7
 * وإذا النص غير قابل للقراءة، بنرجّع حالة محيّدة بدل ما نعطي معلومة غلط.
 */

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩'
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹'

const toWesternDigits = (value) =>
  String(value ?? '').replace(/[٠-٩۰-۹]/g, (char) => {
    const ar = AR_DIGITS.indexOf(char)
    if (ar >= 0) return String(ar)
    return String(FA_DIGITS.indexOf(char))
  })

const parseClock = (hour, minute, marker) => {
  let h = Number(hour)
  const m = Number(minute || 0)
  if (!Number.isFinite(h) || !Number.isFinite(m) || h > 23 || m > 59) return null

  const mark = String(marker || '').toLowerCase().replace(/\./g, '')
  if (mark) {
    const isPm =
      mark === 'pm' ||
      mark === 'م' ||
      mark.startsWith('مساء') ||
      mark.startsWith('ليل')
    const isAm =
      mark === 'am' ||
      mark === 'ص' ||
      mark.startsWith('صباح')
    if (!isPm && !isAm) return null
    h %= 12
    if (isPm) h += 12
  }

  return h * 60 + m
}

const unknown = () => ({ known: false, openMin: null, closeMin: null, always: false })

/** يقرأ أول وقتين من نص واحد */
const parseText = (value) => {
  const text = toWesternDigits(value).replace(/[–—−]/g, '-').trim()
  if (!text) return unknown()

  // 24/7 أو «على مدار الساعة»
  if (/(^|\D)24\s*\/\s*7(\D|$)/.test(text) || /24\s*ساعة|على\s*مدار\s*الساعة/i.test(text)) {
    return { known: true, openMin: 0, closeMin: 24 * 60, always: true }
  }

  const re =
    /(\d{1,2})(?:\s*:\s*(\d{2}))?\s*(a\.?m\.?|p\.?m\.?|ص|م|صباح(?:اً|ا)?|مساء(?:ً|ا)?|ليل(?:اً|ا)?)?/gi
  const times = []
  let match
  while ((match = re.exec(text)) && times.length < 2) {
    const parsed = parseClock(match[1], match[2], match[3])
    if (parsed != null) times.push(parsed)
  }

  if (times.length < 2) return unknown()
  return { known: true, openMin: times[0], closeMin: times[1], always: false }
}

/**
 * يقرأ أول وقتين من ساعات العمل.
 * بنفضّل النص الإنجليزي لأنه أوضح بـ AM/PM، وبنرجع للعربي إذا الإنجليزي فاضي
 * أو غير قابل للقراءة. هيك الحالة بتضل صحيحة حتى لو النص العربي استعمل
 * «١٢:٠٠ م» بمعنى منتصف الليل.
 */
export function parseBusinessHours(hours, lang = 'ar') {
  if (hours && typeof hours === 'object') {
    const english = parseText(hours.en)
    if (english.known) return english
    const localized = parseText(hours[lang])
    if (localized.known) return localized
    return parseText(hours.ar || hours.en)
  }

  return parseText(hours)
}

/**
 * حالة المحل حسب الوقت الحالي، مع إمكانية تجاوزها يدوياً من الأدمن.
 * @param {'auto'|'open'|'closed'} override
 */
export function getBusinessStatus(hours, lang = 'ar', now = new Date(), override = 'auto') {
  const parsed = parseBusinessHours(hours, lang)
  const ar = lang === 'ar'

  if (override === 'open' || override === 'closed') {
    const forcedOpen = override === 'open'
    return {
      known: true,
      open: forcedOpen,
      label: forcedOpen ? (ar ? 'مفتوح الآن' : 'Open now') : ar ? 'مغلق حالياً' : 'Closed now',
      detail: forcedOpen
        ? ar ? 'استقبال الطلبات مفعّل يدوياً' : 'Orders are open manually'
        : ar ? 'استقبال الطلبات متوقف يدوياً' : 'Orders are paused manually',
      manual: true,
    }
  }

  if (!parsed.known) {
    return {
      known: false,
      open: null,
      label: ar ? 'ساعات العمل' : 'Business hours',
      detail: ar ? hours?.ar || '' : hours?.en || '',
    }
  }

  if (parsed.always) {
    return {
      known: true,
      open: true,
      label: ar ? 'مفتوح الآن' : 'Open now',
      detail: ar ? 'على مدار الساعة' : 'Open 24/7',
    }
  }

  const nowMin = now.getHours() * 60 + now.getMinutes()
  const { openMin, closeMin } = parsed
  if (openMin === closeMin) {
    return {
      known: false,
      open: null,
      label: ar ? 'ساعات العمل' : 'Business hours',
      detail: ar ? hours?.ar || '' : hours?.en || '',
    }
  }

  const open =
    closeMin > openMin
      ? nowMin >= openMin && nowMin < closeMin
      : nowMin >= openMin || nowMin < closeMin

  return {
    known: true,
    open,
    label: open ? (ar ? 'مفتوح الآن' : 'Open now') : ar ? 'مغلق حالياً' : 'Closed now',
    detail: ar ? hours?.ar || '' : hours?.en || '',
  }
}

/** hook بيحدّث الحالة كل دقيقة */
export function useBusinessStatus(hours, lang, override = 'auto') {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  return useMemo(
    () => getBusinessStatus(hours, lang, now, override),
    [hours, lang, now, override],
  )
}
