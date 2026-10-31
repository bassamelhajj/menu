/**
 * Crepe.jsx — كريب
 * ---------------------------------------------------------------------------
 * المبررات المقاسة من الفيديو `11.59.08 PM (2)`:
 *   sat = 0.333  |  chroma = 31.9% (الأدنى بالمجموعة)  →  عجينة باهتة لا فاكهة
 *   تدرّج رأسي قوي: قمة داكنة #443428 → وسط فاتح #A89687 → قاع غامق
 *                 = طبقات مطوية + حشوة كريمية على سطح داكن
 *   whiteY = 0.546  →  الحشوة في منتصف الكتلة
 *   MAD 1.5..3.9  →  استقرار طبق (أهدأ حركة) ⇒ طيّ بطيء وrocking خفيف
 *   + `11.59.10 PM` (base): whiteY = 0.823 ⇒ قاعدة/طبق فاتح يُقدَّم عليه المنتج
 * ---------------------------------------------------------------------------
 */
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { PAL, useHeroMotion, readDamp } from './heroMotion'

export default function Crepe({ reduceMotion, damping = 0, activity = 0.5 }) {
  const root = useRef(null)
  const top = useRef(null)
  const drizzle = useRef(null)
  useHeroMotion(root, { reduceMotion, damping, activity, spin: 0.035 })

  // طبقات العجينة المطوية (من التدرّج الرأسي المقاس)
  const layers = useMemo(
    () => [
      { y: 0.0, r: 0.46, c: PAL.dough, rot: 0 },
      { y: 0.085, r: 0.44, c: PAL.doughLight, rot: 0.14 },
      { y: 0.165, r: 0.42, c: PAL.dough, rot: -0.1 },
      { y: 0.245, r: 0.4, c: PAL.doughLight, rot: 0.08 },
    ],
    [],
  )

  // حشوة كريمية على السطح + شوكولاتة
  const filling = useMemo(() => {
    const out = []
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.5
      const r = 0.1 + (i % 2) * 0.07
      out.push({
        p: [Math.cos(a) * r, 0.3 + (i % 2) * 0.03, Math.sin(a) * r],
        s: 0.075 + (i % 2) * 0.02,
        color: i % 2 === 0 ? PAL.creamBright : PAL.cream,
      })
    }
    return out
  }, [])

  useFrame((state, delta) => {
    const damp = 1 - 0.82 * readDamp(damping)
    if (reduceMotion) return
    const t = state.clock.elapsedTime
    // rocking خفيف جداً يعكس استقرار الطبق (دورة 4.2 ث)
    if (top.current) {
      top.current.rotation.z = Math.sin((t / 4.2) * Math.PI * 2) * 0.035 * damp
    }
    if (drizzle.current) drizzle.current.rotation.y += delta * 0.22 * damp
  })

  return (
    <group ref={root} scale={0.9}>
      {/* الطبق/القاعدة الفاتحة (whiteY = 0.823 في الزاوية الثانية) */}
      <mesh position={[0, -0.34, 0]}>
        <cylinderGeometry args={[0.58, 0.52, 0.05, 30]} />
        <meshStandardMaterial color={PAL.milk} roughness={0.5} />
      </mesh>
      {/* الطبق الداكن تحت العجينة */}
      <mesh position={[0, -0.28, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.08, 28]} />
        <meshStandardMaterial color={PAL.caramelDeep} roughness={0.6} />
      </mesh>

      {/* الطبقات المطوية */}
      <group ref={top}>
        {layers.map((l, i) => (
          <mesh key={i} position={[0, l.y, 0]} rotation={[0, l.rot, 0]}>
            <cylinderGeometry args={[l.r, l.r * 0.97, 0.075, 26]} />
            <meshStandardMaterial
              color={l.c}
              roughness={0.6}
              metalness={0.02}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        {/* حافة العجينة الملفوفة (تُظهر الطيّات) */}
        {[0, 1, 2].map((i) => (
          <mesh key={`e${i}`} position={[0.34, 0.05 + i * 0.08, 0.12]} rotation={[0, 0, 0.5 + i * 0.2]}>
            <torusGeometry args={[0.12, 0.032, 8, 18, 3.6]} />
            <meshStandardMaterial color={PAL.doughLight} roughness={0.62} />
          </mesh>
        ))}

        {/* الحشوة الكريمة على السطح */}
        {filling.map((f, i) => (
          <mesh key={`f${i}`} position={f.p} scale={f.s}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial color={f.color} roughness={0.6} />
          </mesh>
        ))}

        {/* صوص شوكولاتة (غراميل/حبيبات) */}
        <group ref={drizzle} position={[0, 0.31, 0]}>
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2 + 0.3
            const r = 0.17 + (i % 3) * 0.045
            return (
              <mesh key={i} position={[Math.cos(a) * r, (i % 2) * 0.04, Math.sin(a) * r]} scale={0.03}>
                <sphereGeometry args={[1, 6, 5]} />
                <meshStandardMaterial color={PAL.chocolate} roughness={0.3} metalness={0.1} />
              </mesh>
            )
          })}
        </group>

        {/* شوكولاتة حالّة على الجنب */}
        <mesh position={[0.24, 0.28, -0.16]} scale={[0.1, 0.02, 0.14]} rotation={[0.2, 0.5, 0]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color={PAL.chocolate} roughness={0.28} metalness={0.14} />
        </mesh>
      </group>
    </group>
  )
}