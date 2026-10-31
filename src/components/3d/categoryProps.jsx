/**
 * 3d/categoryProps.jsx — مشاهد تفاعلية مع اللوغو حسب القسم المختار
 * ===========================================================================
 * 🎯 الفكرة:
 *   لمّا الزبون يضغط على قسم (كريب، عصير، تشنكي كيك، سموذي…)،
 *   المشهد بالهيدر بينتحوّل: **العملة الذهبية + نفس الصنف جنبها**،
 *   ولكل صنف حركة «مميزة» تمثّل شي بينعمل مع اللوغو:
 *
 *   🥞 كريب      → شوكولا **سايحة** تنزل فوق الكريب + فواكه مقطعة
 *   🥐 تشنكي كيك → اللف الحلزوني **بيتحشّ** حوالين اللوغو
 *   🧃 عصير      → **كوب عصير** جنب العملة مع شرائح فاكهة
 *   🥤 سموذي     → **كوب سموذي** مع الدوّامة والمThrown السائل
 *   🧇 وافل      → **وافل** مع قطر و بوظة
 *   📦fagments أخرى → عملة اللوغو + الكوب/الطبق المميّز للبند
 *
 * 📌 ليش ملفات منفصلة؟
 *   لأن كل مشهد منطقي لحاله، وبيساعدنا نعدّل مشهد بدون ما نلمس التاني.
 *   وكل شي إجرائي (بدون ملفات GLB) عشان يبقى الموقع سريع وخفيف.
 */
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { PAL, useHeroMotion, helixCurve, readDamp } from './heroMotion'

/* ================================================================== */
/*  🥞 كريب — شوكولا سايحة + فواكه مقطعة                              */
/* ================================================================== */
export function CrepeWithLogo({ damping = 0, activity = 1 }) {
  const root = useRef(null)
  const drizzle = useRef(null)
  const fruit = useRef(null)
  const crepe = useRef(null)
  useHeroMotion(root, { damping, activity, spin: 0.06 })

  // نقاط الشوكولا اللي بتسقط (مسار سيلاني)
  const drops = useMemo(
    () =>
      [0, 1, 2, 3, 4].map((i) => ({
        r: 0.08 + (i % 3) * 0.07,
        phase: i * 0.55,
        size: 0.026 + (i % 2) * 0.012,
      })),
    [],
  )

  // قطع الفاكهة (مانجو/فراولة مقطعة)
  const fruits = useMemo(
    () =>
      [0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 + 0.4
        return {
          p: [Math.cos(a) * (0.16 + (i % 2) * 0.08), 0.28 + (i % 3) * 0.03, Math.sin(a) * 0.16],
          rot: [i * 0.5, i * 0.9, i * 0.3],
          color: i % 3 === 0 ? PAL.mango : i % 3 === 1 ? PAL.caramel : PAL.gold,
        }
      }),
    [],
  )

  useFrame((state, delta) => {
    const d = 1 - 0.82 * readDamp(damping)
    const t = state.clock.elapsedTime

    // الشوكولا "سايحة": كل قطرة تنزل وتلتف (loop لا نهائي)
    if (drizzle.current) {
      drizzle.current.children.forEach((child, i) => {
        const drop = drops[i % drops.length]
        // دورة السقوط ~1.2s
        const cycle = ((t / 1.2 + drop.phase) % 1)
        child.position.y = 0.55 - cycle * 0.5 // تنزل من فوق
        // تختفي لما توصل تحت وتطلع من فوق
        const vis = cycle < 0.82
        child.visible = vis
        // القطرة بتتكبّر شوي وهي بتنزل
        child.scale.setScalar(drop.size * (1 - cycle * 0.4))
        child.rotation.x += delta * 2 * d
      })
    }
    // الفواكه تتمايل
    if (fruit.current && !drizzle) fruit.current.rotation.y += delta * 0.2 * d
    // الكريب يتموّج خفيف
    if (crepe.current) crepe.current.rotation.z = Math.sin(t * 0.7) * 0.03 * d
  })

  return (
    <group ref={root} scale={0.92}>
      {/* طبق الكريب المطوي (أساس ثابت) */}
      <group ref={crepe} position={[0, -0.45, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.9, 0.5, 0.12]} />
          <meshStandardMaterial color={PAL.dough} roughness={0.62} />
        </mesh>
        {/* الطيّة (شكل مثلث ملفوف) */}
        <mesh position={[0, 0.22, 0]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.34, 0.34, 0.12, 3]} />
          <meshStandardMaterial color={PAL.doughLight} roughness={0.6} />
        </mesh>
        {/* حافة مقرمشة */}
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.92, 0.06, 0.14]} />
          <meshStandardMaterial color={PAL.caramel} roughness={0.72} />
        </mesh>
      </group>

      {/* الشوكولا السايحة */}
      <group ref={drizzle} position={[0.12, 0, 0.05]}>
        {drops.map((dr, i) => (
          <mesh key={i} position={[Math.cos(i * 1.4) * dr.r, 0.5, Math.sin(i * 1.4) * dr.r]}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshStandardMaterial
              color={PAL.chocolate}
              roughness={0.25}
              metalness={0.12}
              emissive={PAL.caramelDeep}
              emissiveIntensity={0.05}
            />
          </mesh>
        ))}
        {/* خط الشوكولا على الكريب */}
        <mesh position={[0, 0.3, 0]} rotation={[-0.3, 0.4, 0]}>
          <capsuleGeometry args={[0.022, 0.4, 4, 8]} />
          <meshStandardMaterial color={PAL.chocolate} roughness={0.22} />
        </mesh>
      </group>

      {/* الفواكه المقطعة */}
      <group ref={fruit}>
        {fruits.map((f, i) => (
          <mesh key={i} position={f.p} rotation={f.rot}>
            <boxGeometry args={[0.07, 0.05, 0.05]} />
            <meshStandardMaterial color={f.color} roughness={0.5} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ================================================================== */
/*  🥐 تشنكي كيك — اللف الحلزوني بيحش اللوغو                           */
/* ================================================================== */
export function ChimneyWrap({ damping = 0, activity = 1 }) {
  const root = useRef(null)
  const coil = useRef(null)
  useHeroMotion(root, { damping, activity, spin: 0.03 })

  const coilGeo = useMemo(() => {
    const curve = helixCurve(2.6, 0.62, 1.5, -0.75, 0.05)
    return new THREE.TubeGeometry(curve, 80, 0.09, 10, false)
  }, [])

  useFrame((state, delta) => {
    const d = 1 - 0.82 * readDamp(damping)
    // اللف بيلف حوالين اللوغو ببطء (سايحة حلزونية)
    if (coil.current && !d) coil.current.rotation.y += delta * 0.25 * d
  })

  return (
    <group ref={root} scale={0.9}>
      <group ref={coil} position={[0, 0.05, 0]}>
        <mesh geometry={coilGeo}>
          <meshStandardMaterial color={PAL.gold} roughness={0.6} flatShading />
        </mesh>
        {/* لمعة السكر على اللف */}
        <mesh geometry={coilGeo} position={[0, 0.005, 0]} scale={1.01}>
          <meshStandardMaterial
            color={PAL.goldLight}
            roughness={0.35}
            transparent
            opacity={0.4}
            emissive={PAL.goldLight}
            emissiveIntensity={0.12}
          />
        </mesh>
      </group>
      {/* حبيبات السكر */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2 * 2.6 + 0.3
        return (
          <mesh key={i} position={[Math.cos(a) * 0.62, -0.75 + (i / 6) * 1.5, Math.sin(a) * 0.62]} scale={0.025}>
            <sphereGeometry args={[1, 6, 5]} />
            <meshStandardMaterial color={PAL.goldLight} roughness={0.5} flatShading />
          </mesh>
        )
      })}
    </group>
  )
}

/* ================================================================== */
/*  🧃 عصير / 🥤 سموذي — كوب جنب العملة                               */
/* ================================================================== */
function CupBase({ color, straw, liquidColor }) {
  return (
    <group scale={0.9}>
      {/* الكوب */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.32, 0.26, 0.9, 24, 1, true]} />
        <meshStandardMaterial
          color={PAL.glass}
          roughness={0.15}
          transparent
          opacity={0.32}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* السائل */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.295, 0.238, 0.72, 22]} />
        <meshStandardMaterial color={liquidColor} roughness={0.28} metalness={0.06} />
      </mesh>
      {/* سطح */}
      <mesh position={[0, 0.31, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.29, 22]} />
        <meshStandardMaterial color={color} roughness={0.2} />
      </mesh>
      {/* قشة */}
      <mesh position={[0.06, 0.62, 0.02]} rotation={[0, 0, 0.28]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color={straw} metalness={0.5} roughness={0.35} />
      </mesh>
      {/* حافة */}
      <mesh position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.32, 0.014, 8, 24]} />
        <meshStandardMaterial color={PAL.cream} roughness={0.25} />
      </mesh>
    </group>
  )
}

export function JuiceWithLogo({ damping = 0, activity = 1 }) {
  const root = useRef(null)
  const chunks = useRef(null)
  useHeroMotion(root, { damping, activity, spin: 0.07 })

  useFrame((state, delta) => {
    const d = 1 - 0.82 * readDamp(damping)
    if (chunks.current && !damping) chunks.current.rotation.y += delta * 0.4 * d
  })

  const fruitChunks = useMemo(
    () =>
      [0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2 + 0.3
        return {
          p: [Math.cos(a) * 0.16, -0.08 + (i % 3) * 0.07, Math.sin(a) * 0.16],
          color: i % 2 === 0 ? PAL.mango : PAL.gold,
        }
      }),
    [],
  )

  return (
    <group ref={root} scale={0.95}>
      <group position={[0, -0.05, 0]}>
        <CupBase color={PAL.mango} liquidColor={PAL.mango} straw={PAL.gold} />
      </group>
      {/* قطع الفاكهة داخل العصير */}
      <group ref={chunks}>
        {fruitChunks.map((c, i) => (
          <mesh key={i} position={c.p} scale={0.05}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={c.color} roughness={0.5} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  )
}

export function SmoothieWithLogo({ damping = 0, activity = 1 }) {
  const root = useRef(null)
  const swirl = useRef(null)
  useHeroMotion(root, { damping, activity, spin: 0.07 })

  useFrame((state, delta) => {
    const d = 1 - 0.82 * readDamp(damping)
    // الدوّامة (السائل بينلف)
    if (swirl.current && !damping) swirl.current.rotation.y += delta * 0.7 * d
  })

  return (
    <group ref={root} scale={0.95}>
      <group position={[0, -0.05, 0]}>
        <CupBase color={PAL.amber} liquidColor={PAL.amber} straw={PAL.caramel} />
      </group>
      {/* الدوّامة على السطح */}
      <group ref={swirl} position={[0, 0.31, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh
            key={i}
            position={[Math.cos((i / 3) * 6.28) * 0.14, 0.01, Math.sin((i / 3) * 6.28) * 0.14]}
            rotation={[-Math.PI / 2, 0, (i / 3) * 6.28]}
            scale={[1, 0.6 + i * 0.3, 1]}
          >
            <planeGeometry args={[0.2, 0.07]} />
            <meshStandardMaterial color={PAL.goldLight} roughness={0.3} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ================================================================== */
/*  🧇 وافل — مع قطر وبوظة (اختياري، نفس المكوّن الأساسي)             */
/* ================================================================== */
export function WaffleWithLogo({ damping = 0, activity = 1 }) {
  const root = useRef(null)
  const scoop = useRef(null)
  useHeroMotion(root, { damping, activity, spin: 0.05 })

  useFrame((state) => {
    const d = 1 - 0.82 * readDamp(damping)
    const t = state.clock.elapsedTime
    if (scoop.current) scoop.current.position.y = 0.38 + Math.sin((t / 1.8) * 6.28) * 0.01 * d
  })

  return (
    <group ref={root} scale={0.85}>
      {/* جسم الوافل */}
      <mesh>
        <boxGeometry args={[0.7, 0.55, 0.7]} />
        <meshStandardMaterial color={PAL.gold} roughness={0.62} flatShading />
      </mesh>
      {/* حواف */}
      {[0, 1, 2, 3].map((i) => (
        <mesh
          key={i}
          position={i < 2 ? [0, 0, (i ? -1 : 1) * 0.355] : [(i === 2 ? 1 : -1) * 0.355, 0, 0]}
        >
          <boxGeometry args={i < 2 ? [0.7, 0.55, 0.02] : [0.02, 0.55, 0.7]} />
          <meshStandardMaterial color={PAL.caramelDeep} roughness={0.7} />
        </mesh>
      ))}
      {/* قطر */}
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 20]} />
        <meshStandardMaterial
          color={PAL.caramel}
          roughness={0.18}
          emissive={PAL.goldLight}
          emissiveIntensity={0.08}
        />
      </mesh>
      {/* بوظة */}
      <group ref={scoop} position={[0, 0.38, 0]}>
        <mesh scale={[0.26, 0.24, 0.26]}>
          <sphereGeometry args={[1, 16, 14]} />
          <meshStandardMaterial color={PAL.creamBright} roughness={0.6} />
        </mesh>
      </group>
    </group>
  )
}

/**
 * 🎯 الخريطة: أي قسم → أي مشهد
 * ⚠️ `damping` لازم يكون **ref** مش رقم، لأن قيمته تتغيّر كل إطار
 *    بدون إعادة رسم — لو مرّرنا الرقم وقت الرسم بيكون قديم.
 */
export const CATEGORY_SCENES = {
  simple: CrepeWithLogo,
  belgian: CrepeWithLogo,
  special: CrepeWithLogo,
  patissiere: CrepeWithLogo,
  waffle: WaffleWithLogo,
  pancake: WaffleWithLogo,
  cups: JuiceWithLogo,
  chocolamou: SmoothieWithLogo,
  chimney: ChimneyWrap,
  cone: WaffleWithLogo,
  smoothie: SmoothieWithLogo,
  milkshake: SmoothieWithLogo,
  juice: JuiceWithLogo,
  avoca: JuiceWithLogo,
}

export function CategoryScene({ category, damping = 0 }) {
  const Comp = CATEGORY_SCENES[category]
  if (!Comp) return null
  return <Comp damping={damping} activity={1} />
}