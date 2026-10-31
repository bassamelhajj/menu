/**
 * components/ReviewForm.jsx — ⭐ نموذج كتابة التقييم
 * ===========================================================================
 * 📌 ليش مكوّن منفصل؟
 *   لأنه بنستعمله في **مكانين**:
 *     • صفحة الآراء (#/reviews)  ← هنا مباشرةً
 *     • صفحة الحساب (#/account)
 *   فبدل ما نكتبه مرتين، عملنا مكوّن واحد.
 *
 * 📌 ليش نسأل عن الصورة؟
 *   لأن صورة الطلب هي **أقوى دليل** على إنو الزبون جرّب فعلاً.
 *   وبتعطي ثقة أكبر لبقية الزبائن.
 */
import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useContent } from '../store/ContentContext'
import { fileToCompressedDataUrl } from '../lib/auth'
import { IconClose, IconSparkle, IconStar } from './icons'

export default function ReviewForm({ email, onSent, ar = true, compact = false }) {
  const { addReview } = useContent()
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)
  const [text, setText] = useState('')
  const [image, setImage] = useState('')
  const [busy, setBusy] = useState(false)
  const [thanks, setThanks] = useState(false)
  const fileRef = useRef(null)

  const shown = hover || rating

  const pickImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    try {
      // 📦 نصغّر الصورة قبل الحفظ (900px / JPEG 72%)
      //    بدون هاي الخطوة، صورة وحدة ممكن تملأ التخزين كله.
      setImage(await fileToCompressedDataUrl(file, 900, 0.72))
    } catch {
      /* صورة غير صالحة — المستخدم بيختار وحدة تانية */
    } finally {
      setBusy(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    if (!text.trim() || busy) return
    setBusy(true)
    const res = addReview({ email, rating, text, image })
    setBusy(false)
    if (!res.ok) return

    // ✅ نرتّب الواجهة: رسالة شكر + إفراغ الحقول
    setThanks(true)
    setText('')
    setImage('')
    setRating(5)
    onSent?.(res.review)
  }

  /* ✅ بعد الإرسال */
  if (thanks) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`rounded-[28px] border border-primary/35 bg-primary/8 text-center ${compact ? 'p-6' : 'p-8'}`}
      >
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 14, delay: 0.1 }}
          className="mx-auto grid h-14 w-14 place-items-center rounded-full primary-bg text-2xl"
        >
          ⭐
        </motion.span>
        <h3 className="mt-3 text-sm font-black text-ink">
          {ar ? 'وصلنا رأيك!' : 'Thanks for your review!'}
        </h3>
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted">
          {ar
            ? 'رأيك هلق عند صاحب المحل، ورح ينشر بعد ما يوافق عليه.'
            : 'The owner has your review. It goes live after they approve it.'}
        </p>
        <button
          type="button"
          onClick={() => setThanks(false)}
          className="mt-4 text-[11px] font-black text-primary underline-offset-2 hover:underline"
        >
          {ar ? 'اكتب رأي ثاني' : 'Write another'}
        </button>
      </motion.div>
    )
  }

  /* 📝 النموذج */
  return (
    <form
      onSubmit={submit}
      className={`rounded-[28px] border border-line bg-surface ${compact ? 'p-5' : 'p-6'}`}
    >
      <h3 className="text-center font-display text-lg text-ink">
        {ar ? 'شارك رأيك' : 'Share your experience'}
      </h3>
      <p className="mt-1 text-center text-[11px] font-bold text-muted">
        {ar ? 'رأيك بينشر بعد موافقة صاحب المحل' : 'Published after the owner approves it'}
      </p>

      {/* ⭐ النجوم */}
      <div className="mt-4 flex justify-center gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.button
            key={n}
            type="button"
            aria-label={`${n}`}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.88 }}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className="transition-transform"
          >
            <IconStar size={compact ? 28 : 32} filled={n <= shown} />
          </motion.button>
        ))}
      </div>

      {/* ✍️ النص */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={compact ? 3 : 4}
        placeholder={ar ? 'شو كانت تجربتك؟ الطعم، الخدمة، النظافة…' : 'How was your order?'}
        className="mt-4 w-full resize-none rounded-2xl border border-line bg-bg px-4 py-3.5 text-[13px] leading-relaxed text-ink outline-none transition-all placeholder:text-muted/60 focus:border-gold"
      />

      {/* 📷 صورة الطلب */}
      <div className="mt-3">
        {image ? (
          <div className="relative overflow-hidden rounded-2xl border border-line">
            <img src={image} alt="" className="max-h-56 w-full object-cover" />
            <button
              type="button"
              onClick={() => setImage('')}
              aria-label={ar ? 'احذف الصورة' : 'Remove photo'}
              className="absolute top-2 end-2 grid h-8 w-8 place-items-center rounded-full bg-cocoa/80 text-cream backdrop-blur active:scale-90"
            >
              <IconClose size={15} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-line bg-bg px-4 py-3.5 text-[12px] font-black text-muted transition-colors hover:border-gold hover:text-gold-deep"
          >
            {busy
              ? ar ? 'جاري التجهيز…' : 'Preparing…'
              : `📷 ${ar ? 'ضيف صورة للطلب (اختياري)' : 'Add a photo (optional)'}`}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={pickImage} className="hidden" />
      </div>

      <motion.button
        type="submit"
        whileTap={{ scale: 0.97 }}
        disabled={!text.trim() || busy}
        className="btn-primary mt-4 w-full py-3.5 disabled:opacity-40"
      >
        <IconSparkle size={16} />
        {ar ? 'أرسل رأيي' : 'Send review'}
      </motion.button>
    </form>
  )
}