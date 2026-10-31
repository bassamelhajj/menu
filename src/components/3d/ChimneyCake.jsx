/**
 * ChimneyCake.jsx — كعكة المدخنة (تشنكي كيك)
 * ---------------------------------------------------------------------------
 * المبررات المقاسة من الفيديو `11.59.08 PM (3)`:
 *   hue = 28.5°  →  أدفأ صبغة بالمجموعة (كراميل محروق قليلاً)
 *   أعلى نسبة في نطاق الذهبي 30–60° = 25.6%
 *   whiteY = 0.335  →  بريق عالٍ في الثلث العلوي = لمعان السكر/الغليز
 *   تخطيط رأسي (ribs) ثابت يتكرر 25 صفاً  →  بنية مضلّعة ملفوفة  ←  اللف الحلزوني
 *   حركة وسطية بقمة عند 3–5 ث  →  دوران محور بطيء
 * ---------------------------------------------------------------------------
 */
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { PAL, useHeroMotion, helixCurve, readDamp } from './heroMotion'

const TURNS = 3.6
const R = 0.3
const H = 1.05

export default function ChimneyCake({ reduceMotion, damping = 0, activity = 0.5 }) {
  const root = useRef(null)
  const glaze = useRef(null)
  const sugar = useRef(null)
  const glint = useRef(null)
  useHeroMotion(root, { reduceMotion, damping, activity, spin: 0.08 })

  // اللفة الحلزونية = بنية الـ ribs المقاسة (TubeGeometry على منحنى حلزوني)
  const coil = useMemo(() => {
    const curve = helixCurve(TURNS, R, H, -H / 2, 0.06)
    return new THREE.TubeGeometry(curve, 90, 0.085, 10, false)
  }, [])

  // الداخلي الداكن (تجويف الدخنة)
  const core = useMemo(() => new THREE.CylinderGeometry(0.21, 0.21, H * 0.94, 20), [])

  // حبيبات السكر/القرفة بين اللفات
  const crumbs = useMemo(() => {
    const out = []
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 * TURNS + 0.2
      const y = -H / 2 + (i / 12) * H + 0.04
      const r = R * (1 - 0.06 * (i / 12))
      out.push({
        p: [Math.cos(a) * r, y, Math.sin(a) * r],
        s: 0.022 + (i % 3) * 0.008,
        color: i % 4 === 0 ? PAL.caramelDeep : i % 2 === 0 ? PAL.goldLight : PAL.gold,
      })
    }
    return out
  }, [])

  useFrame((state, delta) => {
    const damp = 1 - 0.82 * readDamp(damping)
    if (reduceMotion) return
    const t = state.clock.elapsedTime
    // لمعان السكرEgglings (whiteY = 0.335 ⇒ بريق عالٍ في الأعلى)
    if (sugar.current) {
      sugar.current.rotation.y += delta * 0.14 * damp
      // لمعان حبيبات السكر (على الـmesh نفسه لا المجموعة)
      const m = glint.current?.material
      if (m) m.emissiveIntensity = 0.1 + (0.5 + 0.5 * Math.sin((t / 4.2) * Math.PI * 2)) * 0.16 * damp
    }
    if (glaze.current) glaze.current.rotation.y -= delta * 0.08 * damp
  })

  return (
    <group ref={root} scale={0.82}>
      {/* النواة الداكنة */}
      <mesh geometry={core}>
        <meshStandardMaterial color={PAL.caramelDeep} roughness={0.72} flatShading />
      </mesh>
      {/* اللفة الحلزونية (الـ ribs) */}
      <mesh geometry={coil} castShadow>
        <meshStandardMaterial
          color={PAL.gold}
          roughness={0.6}
          metalness={0.03}
          flatShading
        />
      </mesh>
      {/* حبيبات السكر/القرفة */}
      <group ref={sugar}>
        {crumbs.map((c, i) => (
          <mesh key={i} ref={i === 0 ? glint : undefined} position={c.p} scale={c.s}>
            <sphereGeometry args={[1, 6, 5]} />
            <meshStandardMaterial
              color={c.color}
              roughness={0.5}
              emissive={PAL.goldLight}
              emissiveIntensity={0.1}
              flatShading
            />
          </mesh>
        ))}
      </group>
      {/* ت frosting القمة (بريق عالٍ في الثلث العلوي) */}
      <group ref={glaze} position={[0, H / 2 + 0.04, 0]}>
        <mesh scale={[0.27, 0.1, 0.27]}>
          <sphereGeometry args={[1, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial
            color={PAL.goldLight}
            roughness={0.3}
            emissive={PAL.goldLight}
            emissiveIntensity={0.16}
          />
        </mesh>
      </group>
      {/* تجويف الدخنة */}
      <mesh position={[0, H / 2 + 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.13, 0.21, 18]} />
        <meshStandardMaterial color={PAL.caramelDeep} roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* قاعدة */}
      <mesh position={[0, -H / 2 - 0.05, 0]}>
        <cylinderGeometry args={[0.32, 0.36, 0.06, 20]} />
        <meshStandardMaterial color={PAL.wood} roughness={0.7} />
      </mesh>
    </group>
  )
}