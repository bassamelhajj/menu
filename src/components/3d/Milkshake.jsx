/**
 * Milkshake.jsx — ميلك شيك
 * ---------------------------------------------------------------------------
 * المبررات المقاسة من الفيديو `11.59.08 PM` (base):
 *   white% = 21.1  →  كتلة كريمية بيضاء فوق جسم ملوّن  =  رأس كريمة مخفوقة
 *   chroma% = 46.2  |  sat = 0.437  →  أعلى تشبّع بالمجموعة  (كراميل غني)
 *   أعلى حركة مستمرة 12 → 29.5 MAD
 *   تباين قصّي متدرّج عند 4.11ث  →  ميل/دوران بمحور سفلي (خضّ/تزيين)
 *   whiteY = 0.456  →  الكريمة فوق منتصف الكتلة
 * ---------------------------------------------------------------------------
 */
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { PAL, useHeroMotion, readDamp } from './heroMotion'

export default function Milkshake({ reduceMotion, damping = 0, activity = 0.5 }) {
  const root = useRef(null)
  const cream = useRef(null)
  const drizzle = useRef(null)
  const glaze = useRef(null)
  useHeroMotion(root, { reduceMotion, damping, activity, spin: 0.05 })

  // رذاذ السكر/المكسرات فوق القبة
  const sprinkles = useMemo(() => {
    const out = []
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2 + 0.7
      const r = 0.1 + (i % 3) * 0.045
      out.push({
        p: [Math.cos(a) * r, 0.42 + (i % 2) * 0.07, Math.sin(a) * r],
        rot: [i * 0.5, i * 0.9, i * 0.3],
        color: i % 2 === 0 ? PAL.gold : PAL.doughLight,
      })
    }
    return out
  }, [])

  useFrame((state, delta) => {
    const damp = 1 - 0.82 * readDamp(damping)
    if (reduceMotion) return
    const t = state.clock.elapsedTime
    // ميكرو-باونس للكريمة (1.8 ث كما في المواصفات) + نبض خفيف جداً
    if (cream.current) {
      cream.current.position.y = 0.36 + Math.sin((t / 1.8) * Math.PI * 2) * 0.008 * damp
      cream.current.rotation.y += delta * 0.18 * damp
    }
    if (drizzle.current) {
      drizzle.current.rotation.y -= delta * 0.12 * damp
      // لمعان متقطّع على الصوص (على الـmesh نفسه لا المجموعة)
      const m = glaze.current?.material
      if (m) m.emissiveIntensity = 0.06 + Math.abs(Math.sin(t * 0.9)) * 0.12 * damp
    }
  })

  return (
    <group ref={root} scale={0.9}>
      {/* الكوب */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.25, 0.84, 26, 1, true]} />
        <meshStandardMaterial
          color={PAL.milk}
          roughness={0.3}
          metalness={0.04}
          transparent
          opacity={0.55}
          side={THREE.DoubleSide}
        />
      </mesh>
      <mesh position={[0, -0.43, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 26]} />
        <meshStandardMaterial color={PAL.caramelDeep} roughness={0.55} />
      </mesh>
      {/* السائل الكثيف */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.272, 0.228, 0.68, 24]} />
        <meshStandardMaterial color={PAL.caramel} roughness={0.34} />
      </mesh>
      {/* قبة الكريمة المخفوقة */}
      <group ref={cream} position={[0, 0.36, 0]}>
        <mesh scale={[0.3, 0.24, 0.3]}>
          <sphereGeometry args={[1, 20, 16]} />
          <meshStandardMaterial
            color={PAL.creamBright}
            roughness={0.62}
            emissive={PAL.cream}
            emissiveIntensity={0.05}
          />
        </mesh>
        {/* لفة كريمة جانبية */}
        <mesh position={[0.16, -0.02, 0.04]} rotation={[0.3, 0, 0.6]} scale={0.075}>
          <torusGeometry args={[1, 0.55, 10, 20]} />
          <meshStandardMaterial color={PAL.cream} roughness={0.6} />
        </mesh>
      </group>
      {/* صوص كراميل حلزوني */}
      <group ref={drizzle} position={[0, 0.3, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh
            key={i}
            ref={i === 0 ? glaze : undefined}
            position={[Math.cos((i / 4) * 6.28) * 0.22, -i * 0.045, Math.sin((i / 4) * 6.28) * 0.22]}
            rotation={[Math.PI / 2, 0, (i / 4) * 6.28]}
            scale={[0.1, 0.5 - i * 0.06, 1]}
          >
            <capsuleGeometry args={[0.5, 1, 4, 8]} />
            <meshStandardMaterial
              color={PAL.caramelDeep}
              roughness={0.24}
              emissive={PAL.caramel}
              emissiveIntensity={0.08}
            />
          </mesh>
        ))}
      </group>
      {/* الرذاذ */}
      {sprinkles.map((s, i) => (
        <mesh key={i} position={s.p} rotation={s.rot} scale={[1, 0.5, 1]}>
          <boxGeometry args={[0.05, 0.022, 0.022]} />
          <meshStandardMaterial color={s.color} roughness={0.7} />
        </mesh>
      ))}
      {/* حافة الكوب */}
      <mesh position={[0, 0.42, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.016, 8, 26]} />
        <meshStandardMaterial color={PAL.cream} roughness={0.3} />
      </mesh>
      {/* إضاءة حافة دافئة */}
      <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.2, 0.008, 6, 20]} />
        <meshStandardMaterial
          color={PAL.goldLight}
          emissive={PAL.goldLight}
          emissiveIntensity={0.4}
          roughness={0.4}
        />
      </mesh>
    </group>
  )
}