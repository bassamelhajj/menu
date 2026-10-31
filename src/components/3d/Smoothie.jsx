/**
 * Smoothie.jsx — سموذي فواكه
 * ---------------------------------------------------------------------------
 * المبررات المقاسة من الفيديو `11.59.08 PM (1)`:
 *   white% = 3.7  (الأدنى في المجموعة)  →  جسم فواكه مشبع بلا كريمة
 *   chroma = 36.3%  |  sat = 0.384  |  hue = 26°  →  عنبري/مانجو
 *   MAD المستقر 2.0..4.4  →  أنعم مقطع في المجموعة (سائل شبه ساكن)
 *   الحركة متمركزة في الشرائط الوسطى  →  الدوّامة على السطح فقط
 * ---------------------------------------------------------------------------
 */
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { PAL, CYCLE, useHeroMotion, readDamp } from './heroMotion'

export default function Smoothie({ reduceMotion, damping = 0, activity = 0.5 }) {
  const root = useRef(null)
  const swirl = useRef(null)
  const surface = useRef(null)
  useHeroMotion(root, { reduceMotion, damping, activity })

  // قطع الفواكه/الثلج — تُوزّع بزاوية ذهبية حول محور السطح
  const chunks = useMemo(() => {
    const out = []
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4
      const r = 0.13 + (i % 2) * 0.05
      out.push({
        p: [Math.cos(a) * r, -0.05 + (i % 3) * 0.06, Math.sin(a) * r],
        s: 0.05 + (i % 2) * 0.018,
        color: i % 3 === 0 ? PAL.mango : i % 3 === 1 ? PAL.amber : PAL.gold,
      })
    }
    return out
  }, [])

  // دوّامة السطح الحلزونية (بديل رخيص عن السائل الحقيقي)
  useFrame((state, delta) => {
    const damp = 1 - 0.82 * readDamp(damping)
    if (swirl.current && !reduceMotion) swirl.current.rotation.y += delta * 0.55 * damp
    if (surface.current && !reduceMotion) {
      surface.current.rotation.y -= delta * 0.3 * damp
      // تمايل خفيف جداً يعطي إحساس السائل (0.9 ث كما في التحليل)
      const t = state.clock.elapsedTime
      surface.current.rotation.x = Math.sin((t / 0.9) * Math.PI * 2) * 0.03 * damp
    }
  })

  return (
    <group ref={root} scale={0.92}>
      {/* جسم الكوب (زجاج فاتح) */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.24, 0.86, 28, 1, true]} />
        <meshStandardMaterial
          color={PAL.glass}
          roughness={0.16}
          metalness={0.05}
          transparent
          opacity={0.34}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* قاعدة الكوب */}
      <mesh position={[0, -0.44, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.05, 28]} />
        <meshStandardMaterial color={PAL.cream} roughness={0.42} />
      </mesh>
      {/* السائل (عنبري مشبع) */}
      <mesh position={[0, -0.04, 0]}>
        <cylinderGeometry args={[0.272, 0.216, 0.7, 26]} />
        <meshStandardMaterial color={PAL.amber} roughness={0.28} metalness={0.08} />
      </mesh>
      {/* سطح السائل — يدور ببطء (المهمة الأساسية لهذا المقطع) */}
      <group ref={surface} position={[0, 0.31, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.272, 26]} />
          <meshStandardMaterial color={PAL.mango} roughness={0.18} metalness={0.1} />
        </mesh>
        {/* دوّامة حلزونية */}
        <group ref={swirl}>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[Math.cos((i / 3) * 6.28) * 0.14, 0.012, Math.sin((i / 3) * 6.28) * 0.14]}
              rotation={[-Math.PI / 2, 0, (i / 3) * 6.28]}
              scale={[1, 0.5 + i * 0.28, 1]}
            >
              <planeGeometry args={[0.2, 0.06]} />
              <meshStandardMaterial
                color={PAL.goldLight}
                roughness={0.3}
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
      </group>
      {/* قطع الفواكه داخل السائل */}
      {chunks.map((c, i) => (
        <mesh key={i} position={c.p} scale={c.s}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={c.color} roughness={0.55} flatShading />
        </mesh>
      ))}
      {/* القشة الذهبية */}
      <mesh position={[0.07, 0.62, 0.02]} rotation={[0, 0, 0.26]}>
        <cylinderGeometry args={[0.022, 0.022, 0.62, 10]} />
        <meshStandardMaterial color={PAL.gold} roughness={0.26} metalness={0.72} />
      </mesh>
      {/* حافة زجاجية */}
      <mesh position={[0, 0.43, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.3, 0.014, 8, 28]} />
        <meshStandardMaterial color={PAL.cream} roughness={0.25} />
      </mesh>
    </group>
  )
}

export const SMOOTHIE_CYCLE = CYCLE