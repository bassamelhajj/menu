import { useMemo, useState } from 'react'
import { useApp } from '../../store/AppContext'
import { useContent } from '../../store/ContentContext'
import { Card, IconBtn, SectionHead, useConfirm } from './ui'
import { IconCheck, IconClose, IconStar, IconTrash } from '../../components/icons'

/** ⭐ نجوم */
function Stars({ rating }) {
  return (
    <div className="flex gap-0.5 text-gold">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? 'opacity-100' : 'opacity-20'}>
          <IconStar size={11} />
        </span>
      ))}
    </div>
  )
}

/** 🃏 بطاقة رأي واحد */
function ReviewCard({ review, ar, onStatus, onDelete }) {
  const pending = review.status === 'pending'
  const approved = review.status === 'approved'

  const tones = {
    pending: 'border-gold/30',
    approved: 'border-emerald-400/20',
    rejected: 'border-white/[0.05] opacity-70',
  }
  const badges = {
    pending: {
      txt: ar ? 'بانتظار الموافقة' : 'Pending',
      cls: 'border-gold/25 bg-gold/[0.12] text-gold',
    },
    approved: {
      txt: ar ? 'منشور' : 'Published',
      cls: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    },
    rejected: {
      txt: ar ? 'مرفوض' : 'Rejected',
      cls: 'border-white/10 bg-white/[0.04] text-white/35',
    },
  }
  const badge = badges[review.status] || badges.pending

  return (
    <Card className={tones[review.status] || tones.pending}>
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-gold to-gold-deep text-[12px] font-black text-[#1a130b] shadow-[0_10px_25px_-16px_rgba(231,201,123,0.9)]">
          {(review.name || '?').slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[12px] font-extrabold text-white/78">
              {review.name || '—'}
            </p>
            <span className={`rounded-full border px-1.5 py-0.5 text-[7.5px] font-black ${badge.cls}`}>
              {badge.txt}
            </span>
          </div>
          {review.email && (
            <a
              href={`mailto:${review.email}`}
              dir="ltr"
              className="mt-0.5 block truncate text-[9px] font-bold text-gold/65 hover:text-gold hover:underline"
            >
              {review.email}
            </a>
          )}
          <div className="mt-1.5 flex items-center gap-2">
            <Stars rating={review.rating} />
            <span className="text-[8.5px] font-semibold text-white/25">
              {(review.createdAt || review.date || '').slice(0, 10)}
            </span>
          </div>
        </div>
      </div>

      <p className="mt-3 rounded-2xl border border-white/[0.05] bg-white/[0.022] px-3.5 py-3 text-[11px] font-semibold leading-6 text-white/55">
        {review.text}
      </p>

      {review.image && (
        <a href={review.image} target="_blank" rel="noreferrer" className="mt-2.5 block">
          <img
            src={review.image}
            alt={ar ? 'صورة الطلب' : 'Order photo'}
            className="max-h-64 w-full rounded-2xl border border-white/[0.07] object-cover transition-opacity hover:opacity-90"
          />
        </a>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {pending && (
          <>
            <button
              type="button"
              onClick={() => onStatus(review.id, 'approved')}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-emerald-400/25 bg-emerald-400/12 px-4 py-2.5 text-[10px] font-black text-emerald-200 transition hover:bg-emerald-400/20 active:scale-95"
            >
              <IconCheck size={14} />
              {ar ? 'وافق وانشر' : 'Approve & publish'}
            </button>
            <button
              type="button"
              onClick={() => onStatus(review.id, 'rejected')}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-[10px] font-black text-white/38 transition hover:border-red-400/35 hover:text-red-300 active:scale-95"
            >
              <IconClose size={14} />
              {ar ? 'رفض' : 'Reject'}
            </button>
          </>
        )}

        {approved && (
          <button
            type="button"
            onClick={() => onStatus(review.id, 'pending')}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-[10px] font-black text-white/38 transition hover:border-gold/30 hover:text-gold active:scale-95"
          >
            {ar ? 'إخفاء مؤقت' : 'Unpublish'}
          </button>
        )}

        <IconBtn title={ar ? 'حذف' : 'Delete'} danger onClick={onDelete}>
          <IconTrash size={15} />
        </IconBtn>
      </div>
    </Card>
  )
}

export default function ReviewsTab() {
  const { lang, notify } = useApp()
  const { reviews, setReviewStatus, deleteReview } = useContent()
  const [filter, setFilter] = useState('pending')
  const [confirm, confirmDialog] = useConfirm()
  const ar = lang === 'ar'

  const counts = useMemo(
    () => ({
      pending: reviews.filter((review) => review.status === 'pending').length,
      approved: reviews.filter((review) => review.status === 'approved').length,
      rejected: reviews.filter((review) => review.status === 'rejected').length,
    }),
    [reviews],
  )

  const list = useMemo(
    () => reviews.filter((review) => review.status === filter),
    [reviews, filter],
  )

  const tabs = [
    { id: 'pending', ar: 'بانتظار الموافقة', en: 'Pending', n: counts.pending },
    { id: 'approved', ar: 'منشور', en: 'Published', n: counts.approved },
    { id: 'rejected', ar: 'مرفوض', en: 'Rejected', n: counts.rejected },
  ]

  const remove = async (review) => {
    const approved = await confirm({
      title: ar ? `حذف رأي ${review.name || ''}؟` : `Delete ${review.name || 'this'} review?`,
      message: ar
        ? 'رح ينحذف الرأي نهائياً من هذا الجهاز ومن الموقع بعد النشر.'
        : 'The review will be permanently removed from this device and the published site.',
      confirmLabel: ar ? 'حذف الرأي' : 'Delete review',
      cancelLabel: ar ? 'إلغاء' : 'Cancel',
    })
    if (!approved) return
    deleteReview(review.id)
    notify(ar ? 'تم حذف الرأي' : 'Review deleted')
  }

  return (
    <div className="space-y-3">
      <SectionHead
        title={ar ? 'آراء الزبائن' : 'Customer reviews'}
        hint={
          ar
            ? 'الأراء بتنكتب من صفحة الآراء، وبتظهر للناس بعد ما توافق عليها.'
            : 'Reviews come from the public reviews page and go live only after your approval.'
        }
      />

      <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-[10px] font-black transition-colors ${
              filter === tab.id
                ? 'border-gold/30 bg-gold/[0.12] text-gold'
                : 'border-white/[0.07] bg-white/[0.025] text-white/30 hover:text-white/60'
            }`}
          >
            {ar ? tab.ar : tab.en}
            <span className="ms-1 opacity-70">({tab.n})</span>
          </button>
        ))}
      </div>

      {list.length === 0 && (
        <Card>
          <div className="py-12 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.03] text-gold/50">
              <IconStar size={23} />
            </span>
            <p className="mt-3 text-xs font-black text-white/35">
              {ar ? 'ما في آراء بهالقسم' : 'No reviews here'}
            </p>
            <p className="mt-1 text-[9px] font-bold text-white/20">
              {ar
                ? 'لما زبون يكتب رأي من صفحة «الآراء» بيظهر هون'
                : 'When a customer writes one it shows up here'}
            </p>
          </div>
        </Card>
      )}

      <div className="grid gap-2.5 xl:grid-cols-2">
        {list.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            ar={ar}
            onStatus={setReviewStatus}
            onDelete={() => remove(review)}
          />
        ))}
      </div>

      {confirmDialog}
    </div>
  )
}
