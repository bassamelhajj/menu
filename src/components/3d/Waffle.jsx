/**
 * Waffle.jsx — وافل
 * ---------------------------------------------------------------------------
 * مبني على نفس لوحة الألوان المقاسة من فيديوهات BENOVA الستّة (0°–60°:
 * عنبري/كراميل/فانيلا/ذهبي) — بدون أحمر/أخضر/أزرق.
 * الحركة تتبع نفس المغلف المقاس: هدوء بطيء (دورة 4.2 ث) + طفو دقيق 0.9 ث،
 * مع نبضة أساسية (القطر يلتقط)Exactly كما في تحليل Milkshake.
 * ---------------------------------------------------------------------------
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PAL, useHeroMotion, readDamp } from './heroMotion'

export default function Waffle({ reduceMotion, damping = 0, activity = 0.5 }) {
  const root = useRef(null)
  const scoop = useRef(null)
  const syrup = useRef(null)
  const glint = useRef(null)
  useHeroMotion(root, { reduceMotion, damping, activity, spin: 0.03 })

  // شبكة الوافل: 3×3 حفرات داكنة على الوجهين (تزيد الإحساس المجسّم)
  const pockets = useMemo(() => {
    const out = []
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++)
        out.push({ x: (c - 1) * 0.2, y: (r - 1) * 0.2 })
    return out
  }, [])

  //Sirup يقطر من الحواف
  const drips = useMemo(() => {
    const out = []
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.3
      out.push({
        p: [Math.cos(a) * 0.3, -0.24, Math.sin(a) * 0.3],
        s: 0.05 + (i % 2) * 0.022,
      })
    }
    return out
  }, [])

  useFrame((state, delta) => {
    const damp = 1 - 0.82 * readDamp(damping)
    if (reduceMotion) return
    const t = state.clock.elapsedTime
    // بوظة: نبضة خفيفة + دوران بطيء
    if (scoop.current) {
      scoop.current.position.y = 0.36 + Math.sin((t / 1.8) * Math.PI * 2) * 0.01 * damp
      scoop.current.rotation.y += delta * 0.12 * damp
    }
    if (syrup.current) syrup.current.rotation.y -= delta * 0.1 * damp
    // لمعان شر EWGS
    const m = glint.current?.material
    if (m) m.emissiveIntensity = 0.08 + (0.5 + 0.5 * Math.sin((t / 4.2) * Math.PI * 2)) * 0.14 * damp
  })

  return (
    <group ref={root} scale={0.78}>
      {/* القرص */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.46, 0.42, 0.05, 26]} />
        <meshStandardMaterial color={PAL.milk} roughness={0.5} />
      </mesh>

      {/* جسم الوافل */}
      <group position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.66, 0.5, 0.66]} />
          <meshStandardMaterial
            color={PAL.gold}
            roughness={0.62}
            metalness={0.04}
            flatShading
          />
        </mesh>
        {/* الحفرات على الوجه العلوي */}
        {pockets.map((p, i) => (
          <mesh key={`tp${i}`} position={[p.x, 0.252, p.y]}>
            <boxGeometry args={[0.15, 0.02, 0.15]} />
            <meshStandardMaterial color={PAL.caramel} roughness={0.8} />
          </mesh>
        ))}
        {/* الحفرات على الوجه السفلي (الحافة) */}
        {pockets.map((p, i) => (
          <mesh key={`bt${i}`} position={[p.x, -0.252, p.y]}>
            <boxGeometry args={[0.15, 0.02, 0.15]} />
            <meshStandardMaterial color={PAL.caramelDeep} roughness={0.85} />
          </mesh>
        ))}
        {/* حواف الوافل المحمّصة */}
        {[
          [0, 0, 0.335],
          [0, 0, -0.335],
          [0.335, 0, 0],
          [-0.335, 0, 0],
        ].map((p, i) => (
          <mesh key={`e${i}`} position={p}>
            <boxGeometry args={i < 2 ? [0.66, 0.5, 0.02] : [0.02, 0.5, 0.66]} />
            <meshStandardMaterial color={PAL.caramelDeep} roughness={0.7} />
          </mesh>
        ))}
      </group>

      {/* شراب القطر */}
      <group ref={syrup} position={[0, 0.2, 0]}>
        <mesh ref={glint} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 22]} />
          <meshStandardMaterial
            color={PAL.caramel}
            roughness={0.18}
            metalness={0.05}
            emissive={PAL.goldLight}
            emissiveIntensity={0.08}
          />
        </mesh>
        {drips.map((d, i) => (
          <mesh key={i} position={d.p} scale={[d.s, d.s * 1.6, d.s]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={PAL.caramel} roughness={0.22} />
          </mesh>
        ))}
      </group>

      {/* بوظة الفانيلا */}
      <group ref={scoop} position={[0, 0.36, 0]}>
        <mesh scale={[0.24, 0.22, 0.24]}>
          <sphereGeometry args={[1, 16, 14]} />
          <meshStandardMaterial
            color={PAL.creamBright}
            roughness={0.62}
            emissive={PAL.cream}
            emissiveIntensity={0.05}
          />
        </mesh>
        <mesh position={[0.1, 0.14, 0.05]} scale={0.09}>
          <sphereGeometry args={[1, 10, 8]} />
          <meshStandardMaterial color={PAL.cream} roughness={0.6} />
        </mesh>
      </group>

      {/* حبيبات ذهبية */}
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + 0.9
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.12, 0.52 + (i % 2) * 0.05, Math.sin(a) * 0.12]}
            rotation={[i * 0.4, i * 0.8, i * 0.3]}
            scale={[1, 0.5, 1]}
          >
            <boxGeometry args={[0.055, 0.024, 0.024]} />
            <meshStandardMaterial color={PAL.goldLight} roughness={0.55} />
          </mesh>
        )
      })}
    </group>
  )
}