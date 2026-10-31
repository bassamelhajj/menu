/**
 * heroMotion.js — قيم الحركة مشتقّة من تحليل فيديوهات BENOVA الستّة
 * ---------------------------------------------------------------------------
 * الجذر المشترك لكل الأرقام (مشتق من تحليل الفيديوهات):
 *   معدل الإطارات      24.000 fps (فيديوهات عمودية 9:16)
 *   دخول قَطعي         دفعة حركة عالية في أول 0.1–0.5 ث  →  دخول 0.62 ث
 *   مغلف الحركة        ذروة عند ~48% من المدة ثم استقرار  (دورة 4.2 ث)
 *   التذبذب الدقيق      ≈ 0.9 ث  (طفو دقيق)
 *   سعة الإزاحة        < 2% من عرض الإطار  →  سعات صغيرة ومتحفّظة
 *   مركز الكتلة        ثابت  →  الكاميرا ساكنة والحركة داخل المنتج
 *   تحليل الصبغة       كل الفيديوهات داخل 0°–60° (عنبري/كراميل/ذهبي)
 *   ⛔ لا أحمر / وردي / أخضر / أزرق في أي مادة  →  الالتزام بلوحة BENOVA
 * ---------------------------------------------------------------------------
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/** لوحة الألوان المقاسة من الفيديوهات (كراميل/فانيلا/ذهبي فقط) */
export const PAL = {
  amber: '#d98e2b',
  mango: '#e0a32c',
  caramel: '#b9762f',
  caramelDeep: '#7a4a22',
  gold: '#d9a03c',
  goldLight: '#e8be72',
  dough: '#e7c79a',
  doughLight: '#f2dcb6',
  cream: '#f6ecd9',
  creamBright: '#fdf6ea',
  milk: '#f2e4ce',
  chocolate: '#4a2c16',
  glass: '#e8f2f4',
  wood: '#6b4a2e',
}

/** توقيتات مستخرجة من الفيديوهات */
export const CYCLE = 4.2 // الدورة الأساسية (ثانية)
export const MICRO = 0.9 // دورة الطفو الدقيقة
export const BREATHE = 1.6 // دورة التنفّس
export const ENTER = 0.62 // مدة الدخول
export const DAMP = 0.82 // نسبة خمد الإيقاع عند تدوير المستخدم

/** منحنيات التسهيل */
export const power3Out = (t) => 1 - Math.pow(1 - t, 3)
export const sineInOut = (t) => -(Math.cos(Math.PI * t) - 1) / 2

/**
 * يقرأ قيمة التخميد سواء كانت رقمًا أو ref.
 * مهم: لأن القيمة تتغيّر كل إطار داخل useFrame دون إعادة رسم،
 * نمرّر الـ ref نفسه بدل القيمة.
 */
export const readDamp = (d) =>
  typeof d === 'number' ? d : (d?.current ?? 0)

/**
 * يحرّك مجموعة (group) بمغلف مطابق للفيديوهات:
 *   دخول 0.62 ث power3.out  ←  هدوء 4.2 ث (yaw) + 0.9 ث (طفو) + 1.6 ث (تنفّس)
 * مع خمد تلقائي للإيقاع الهادئ أثناء تدوير المستخدم (damping 0..1).
 *
 * @param {import('react').RefObject<THREE.Group>} ref المجموعة المستهدفة
 * @param {{reduceMotion?:boolean, damping?:number, activity?:number, spin?:number}} opts
 */
export function useHeroMotion(ref, opts = {}) {
  const { reduceMotion = false, damping = 0, activity = 0.5, spin = 0 } = opts
  const born = useRef(null)

  useFrame((state) => {
    const g = ref.current
    if (!g) return

    if (born.current === null) born.current = state.clock.elapsedTime
    const t = state.clock.elapsedTime - born.current

    if (reduceMotion) {
      g.rotation.set(0, 0, 0)
      g.position.y = 0
      g.scale.setScalar(1)
      return
    }

    /* ---------- الدخول: قطع حاد ثم استقرار ---------- */
    const p = Math.min(1, t / ENTER)
    const e = power3Out(p)
    // ارتداد دقيق بعد الوصول (مشتق من تسوية الخ })
    const bounce = p < 1 ? Math.sin(p * Math.PI * 3) * (1 - p) * 0.05 : 0

    /* ---------- الإيقاع الهادئ ---------- */
    const damp = 1 - DAMP * THREE.MathUtils.clamp(readDamp(damping), 0, 1)
    const act = 0.6 + 0.4 * THREE.MathUtils.clamp(activity, 0, 1)

    const yaw =
      Math.sin((t / CYCLE) * Math.PI * 2) * 0.061 * damp * act +
      t * spin * damp
    const sway = Math.sin((t / CYCLE) * Math.PI * 2 + 0.4) * 0.035 * damp * act
    const nod = Math.sin((t / (CYCLE * 1.3)) * Math.PI * 2) * 0.02 * damp
    const bob = sineInOut(((t % MICRO) / MICRO) * Math.PI) * 0.012 * damp * act
    const pulse =
      1 + sineInOut(((t % BREATHE) / BREATHE) * Math.PI) * 0.022 * damp

    /* ---------- التطبيق ---------- */
    g.rotation.y = (1 - e) * -0.42 + yaw
    g.rotation.z = sway
    g.rotation.x = nod
    g.position.y = (1 - e) * -0.42 + bob
    g.scale.setScalar((0.86 + 0.14 * e + bounce) * pulse)
  })
}

/** يبني منحنى حلزوني (للفائف / الصوص) — رخيص وجميل */
export function helixCurve(turns, radius, height, y0 = 0, taper = 0) {
  const pts = []
  const steps = Math.max(24, Math.round(turns * 16))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const a = t * Math.PI * 2 * turns
    const r = radius * (1 - taper * t)
    pts.push(new THREE.Vector3(Math.cos(a) * r, y0 + t * height, Math.sin(a) * r))
  }
  return new THREE.CatmullRomCurve3(pts)
}