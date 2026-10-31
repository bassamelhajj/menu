import React, { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Sparkles, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { CYCLE } from './3d/heroMotion'
import { HERO_ITEMS } from './3d/heroItems'
import { CategoryScene } from './3d/categoryProps'

const GOLD = '#c39a4e'
const GOLD_LIGHT = '#eac96f'

/** كاميرا تتكيّف مع حجم الشاشة حتى يضل المشهد كامل على الموبايل والكمبيوتر */
function ResponsiveCamera({ fit = 2.7 }) {
  const { camera, size } = useThree()
  useEffect(() => {
    const aspect = (size.width || 1) / (size.height || 1)
    const halfTan = Math.tan((camera.fov * Math.PI) / 180 / 2)
    const zV = fit / halfTan
    const zH = fit / (halfTan * aspect)
    camera.position.set(0, 0.3, Math.max(zV, zH) * 1.03)
    camera.updateProjectionMatrix()
  }, [camera, size, fit])
  return null
}

/* ------------------------------------------------------------------ */
/*  🪙 اللوغو — الميدالية الذهبية الفخمة بلوغو المحل الحقيقي            */
/* ------------------------------------------------------------------ */

/**
 * 🎯 الفكرة: لوغو المحل (benova-logo.png) ظاهر صافي وبأبعاده الأصلية،
 *    عائم فوق ميدالية ذهبية بثلاث طبقات عمق.
 *
 * شو بيميّزه:
 *   1. **قاعدة ذهبية سميكة** — لوح فخم بيعطي عمق
 *   2. **وجه عاجي (cream)** — اللوغو القاتم بيبرز عليه زي خاتم فخم
 *   3. **اللوغو بطبقتين بس** — ظل غامق ورا + نسخة صافية قدّام
 *      (بدل الطبقات الشبحية القديم اللي كانت تعمل blur)
 *   4. **بأبعاده الصحيحة** — النسبة تنحسب من ملف الصورة نفسها (بدون تشويه)
 *   5. **تلتفّ مع المؤشر** — بحركة ناعمة مرجّحة
 */
function LogoEmblem({ reduceMotion }) {
  const tex = useTexture('/brand/benova-logo.png', (t) => {
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
  })
  const g = useRef()
  const rim = useRef()
  const glow = useRef()

  // 📐 نسبة أبعاد اللوغو من الملف نفسه (1242×1080 ≈ 1.15) — بدون تشويه
  const aspect = tex.image ? tex.image.width / tex.image.height : 1.15
  const LOGO_W = 1.56
  const LOGO_H = LOGO_W / aspect

  useFrame((state, delta) => {
    const el = g.current
    if (!el) return
    const t = state.clock.elapsedTime
    const px = state.pointer.x
    const py = state.pointer.y

    // ── تلتفّ مع حركة المؤشر بشكل ناعم
    const targetY = reduceMotion ? 0 : Math.sin(t * 0.4) * 0.07 + px * 0.6
    const targetX = reduceMotion ? 0 : py * -0.4
    el.rotation.y += (targetY - el.rotation.y) * Math.min(1, delta * 3.2)
    el.rotation.x += (targetX - el.rotation.x) * Math.min(1, delta * 3.2)

    // طفو بطيء جداً
    el.position.y = THREE.MathUtils.lerp(
      el.position.y,
      0.62 + (reduceMotion ? 0 : Math.sin(t * 0.6) * 0.05),
      0.06,
    )

    // ✨ الحافة بتلمّع حسب الزاوية
    if (rim.current && !reduceMotion) {
      const shine = 0.4 + Math.abs(Math.sin(t * 0.5 + px)) * 0.5
      rim.current.material.emissiveIntensity = shine
      rim.current.rotation.z += delta * 0.06
    }
    // ⟳ الهالة الخلفية
    if (glow.current && !reduceMotion) {
      glow.current.rotation.z -= delta * 0.05
      glow.current.material.opacity = 0.3 + Math.abs(Math.sin(t * 0.7)) * 0.22
    }
  })

  return (
    <group ref={g} position={[0, 0.62, 0]}>
      {/* ✨ هالة دوّارة خلف اللوغو */}
      <mesh ref={glow} position={[0, 0, -0.3]}>
        <ringGeometry args={[0.95, 1.35, 64]} />
        <meshBasicMaterial
          color={GOLD_LIGHT}
          transparent
          opacity={0.4}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>

      {/* ── 🔲 صفيحة خلفية داكنة — تعطي إحساس سماكة الميدالية عند الميل */}
      <mesh position={[0, 0, -0.05]}>
        <circleGeometry args={[1.02, 64]} />
        <meshStandardMaterial color="#2a1c0a" metalness={0.3} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* ── 🥛 الوجه العاجي (تواجه الكاميرا مباشرة — بدون دوران أسطوانة) */}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[0.95, 64]} />
        <meshStandardMaterial
          color="#f4ead3"
          metalness={0.05}
          roughness={0.6}
          emissive={GOLD}
          emissiveIntensity={0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 🏅 إطار ذهبي خارجي (torus بيواجه الكاميرا افتراضياً) */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.98, 0.045, 16, 80]} />
        <meshStandardMaterial
          color={GOLD_LIGHT}
          metalness={0.65}
          roughness={0.28}
          emissive={GOLD}
          emissiveIntensity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* إطار داخلي أرفع — عمق إضافي */}
      <mesh position={[0, 0, 0.01]}>
        <torusGeometry args={[0.89, 0.012, 8, 64]} />
        <meshStandardMaterial
          color={GOLD}
          metalness={0.7}
          roughness={0.3}
          emissive={GOLD}
          emissiveIntensity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 🖼️ لوغو المحل — طبقة الظل (تعطي إحساس السماكة/extrusion) */}
      <mesh position={[0, 0, 0.025]}>
        <planeGeometry args={[LOGO_W, LOGO_H]} />
        <meshBasicMaterial
          map={tex}
          color="#7a642c"
          transparent
          alphaTest={0.05}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* ── 🖼️ لوغو المحل — النسخة الصافية الحادة */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[LOGO_W, LOGO_H]} />
        <meshBasicMaterial
          map={tex}
          transparent
          alphaTest={0.05}
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 💡 rim light — حافة بتلمّع مع المؤشر */}
      <mesh ref={rim} position={[0, 0, 0.06]}>
        <ringGeometry args={[1.03, 1.1, 64]} />
        <meshBasicMaterial
          color="#fff3d0"
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
          toneMapped={false}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/*  عناصر المنيو — استُبدلت بالمكوّنات الإجرائية المستخرجة من الفيديوهات */
/* ------------------------------------------------------------------ */

/**
 * يوزّع العناصر على قوس أنيق (ابتسامة) **تحت** اللوغو،
 * بدل الدوران حوالينه — عشان يضل الشعار واضح 100% كبراند.
 */
function useArcLayout(count) {
  const { size } = useThree()
  return (i) => {
    const aspect = (size.width || 1) / (size.height || 1)
    // على الموبايل نضيّق القوس حتى لا تختفي العناصر
    const spread = aspect < 0.85 ? 0.62 : aspect < 1.3 ? 0.78 : 0.95
    const step = count > 1 ? (i / (count - 1) - 0.5) * 2 : 0 // من -1 إلى 1
    const x = step * spread
    // شكل الابتسامة: العناصر بأطراف القوس بينزلوا شوي (curve)
    const curve = 1 - step * step
    return {
      x,
      y: -1.05 + curve * 0.3,
      z: -Math.abs(step) * 0.35, // أطراف أبعد = عمق
      base: 0.52 - Math.abs(step) * 0.06,
    }
  }
}

/** عنصر على القوس: طفو دقيق + دوران بطيء، والمُركَّز يكبر ويرتفع */
function ArcItem({ index, layout, children, focus = 0, reduceMotion }) {
  const ref = useRef()
  const pos = layout(index)

  useFrame((state, delta) => {
    const g = ref.current
    if (!g) return
    const t = state.clock.elapsedTime
    if (reduceMotion) {
      g.position.set(pos.x, pos.y, pos.z)
      g.scale.setScalar(pos.base)
      return
    }
    // الطفو الدقيق (0.9 ثانية كما في التحليل) بطور مختلف لكل عنصر
    const phase = index * 0.7
    const bob = Math.sin((t / 0.9 + phase) * Math.PI * 2) * 0.035
    const lift = focus * 0.26
    g.position.set(pos.x, pos.y + bob + lift, pos.z)
    g.scale.setScalar(pos.base * (1 + focus * 0.42))
    // دوران بطيء سلس
    g.rotation.y += delta * 0.18 * (1 + focus)
  })

  return <group ref={ref}>{children}</group>
}

/** يشغّل تخميد الإيقاع أثناء تفاعل المستخدم (يجب أن يكون داخل Canvas) */
function DampingBridge({ shared, reduceMotion }) {
  useFrame((state, delta) => {
    const target = reduceMotion
      ? 0
      : Math.min(1, Math.abs(state.pointer.x) + Math.abs(state.pointer.y) * 0.5)
    const cur = shared.current
    cur.current += (target - cur.current) * Math.min(1, delta * 2.4)
  })
  return null
}

/** يوزّع كل الأصناف على القوس */
function ShowcaseItems({ focusIdx, damping, reduceMotion }) {
  const layout = useArcLayout(HERO_ITEMS.length)
  return HERO_ITEMS.map((item, i) => (
    <ArcItem
      key={item.id}
      index={i}
      count={HERO_ITEMS.length}
      layout={layout}
      focus={i === focusIdx ? 1 : 0}
      reduceMotion={reduceMotion}
    >
      <item.Comp
        reduceMotion={reduceMotion}
        damping={damping}
        activity={i === focusIdx ? 1 : 0.45}
      />
    </ArcItem>
  ))
}

/**
 * ⚡ إيقاف العرض خارج الشاشة (إصلاح مهم للأداء **وللأمان**):
 *   الـ Canvas كان يرسم 60 إطار بالثانية حتى لو الهيدر طالع من الشاشة.
 *
 * ⚠️ ليش القيمة الابتدائية `true` مش `false`؟
 *   لأن `frameloop='never'` قبل ما الـ observer يشتغل = ما في رسم أبداً،
 *   فبتظهر شاشة فاضية لحظة (وهاد كان ب-causing bug فعلي).
 *   فبنبدأ متفائلين (نعتبره ظاهر) ونتوقّف بس لمّا **نتأكد** إنه طالع.
 */
function useInView(margin = '200px') {
  const ref = useRef(null)
  // نبدأ بـ true: أفضل نشتغل زيادة على إطار زايد من إننا نعرض فاضي
  const [seen, setSeen] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setSeen(entry.isIntersecting), {
      rootMargin: margin,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [margin])
  return [ref, seen]
}

/**
 * @param {{ category?: string }} props
 *   category = القسم المختار بالأسفل.
 *   لمّا يكون قسماً حقيقي (مش 'all') — بيختفي القوس وتحطّ مكانه
 *   **مشهد تفاعلي**: العملة الذهبية + الصنف جنبها (شوكولا سايحة، لفّ، كوب…).
 */
/**
 * 🛡️ فحص دعم WebGL قبل ما نرسم.
 *
 * ⚠️ ليش هاي الخطوة مهمة؟
 *   بعض الأجهزة (قديمة، او المتصفح مع كرت شاشة معطّل/محجوب، او وضع
 *   توفير الطاقة) ما بتقدر تنشئ WebGL context.
 *   و R3F لمّا تفشل الإنشاء **بيرمي استثناء** والـ React بيعمل crash
 *   للصفحة كلها ← المستخدم بشوف **شاشة بيضا**.
 *
 *   الحل: نفحص قبل، وIf ما في WebGL → نعرض نسخة بديلة خفيفة (صورة الشعار)
 *   بدل ما نخلي الموقع يطيح.
 */
function hasWebGL() {
  if (typeof window === 'undefined') return false
  try {
    const canvas = document.createElement('canvas')
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')
    return !!gl
  } catch {
    return false
  }
}

/** 🖼️ البديل لمّا WebGL مش متوفر — شعار ثابت بدل المشهد */
function StaticFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <img
          src="/brand/benova-logo.png"
          alt="BENOVA"
          className="h-24 w-auto object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)] sm:h-28"
        />
        {/* شريط الأصناف — نفس أزرار المشهد، بس بدون 3D */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 px-4">
          {HERO_ITEMS.map((item) => (
            <span
              key={item.id}
              className="rounded-full border border-cream/25 bg-cream/10 px-2.5 py-1 text-[10px] font-black text-cream/85"
            >
              {item.ar}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

/** ⛔ يلتقط أي خطأ داخل الـ Canvas بدل ما يطيح الموقع كله */
class CanvasBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error) {
    // نطبع الخطأ بس ما نخلي الموقع ينهار
    console.warn('[Hero3D] تعذّر رسم المشهد ثلاثي الأبعاد:', error)
  }

  render() {
    if (this.state.failed) return <StaticFallback />
    return this.props.children
  }
}

export default function Hero3D({ category = 'all' }) {
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const [webgl, setWebgl] = useState(null) // null = ما عرف بعد
  useEffect(() => {
    setWebgl(hasWebGL())
  }, [])

  const [focusIdx, setFocusIdx] = useState(0)
  // ref مشترك: تتحدّث قيمته كل إطار داخل Canvas بدون إعادة رسم
  const damping = useRef({ current: 0 })
  // ⚡ هل المشهد ظاهر؟ (لإيقاف الرسم خارج الشاشة)
  const [wrapRef, inView] = useInView()

  // القسم المختار (عدا "الكل") = مشهد تفاعلي بدل القوس
  const sceneMode = category && category !== 'all'

  // تبديل آلي للعنصر المُركَّز كل دورة (4.2 ثانية كما في التحليل)
  useEffect(() => {
    if (reduceMotion || sceneMode) return
    const id = setInterval(
      () => setFocusIdx((i) => (i + 1) % HERO_ITEMS.length),
      CYCLE * 1000,
    )
    return () => clearInterval(id)
  }, [reduceMotion, sceneMode])

  // 🛡️ إذا الجهاز ما يدعم WebGL → البديل الخفيف
  if (webgl === false) {
    return (
      <div className="absolute inset-0">
        <StaticFallback />
      </div>
    )
  }

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <CanvasBoundary>
        <Canvas
          // 🛡️ R3F بيستخدم هاد لو فشل إنشاء الـ context بدل ما يرمي
          fallback={<StaticFallback />}
          // ⚡ آخر ما كان يرسم بالمئات وهو مش ظاهر — هلق بيقف تماً
          frameloop={inView ? 'always' : 'never'}
          dpr={[1, 1.8]}
          camera={{ position: [0, 0.3, 7], fov: 42 }}
          gl={{ antialias: true, alpha: true }}
          style={{ touchAction: 'pan-y' }}
          performance={{ min: 0.6 }}
        >
        <Suspense fallback={null}>
          <ResponsiveCamera fit={2.9} />
          <DampingBridge shared={damping} reduceMotion={reduceMotion} />
          <ambientLight intensity={1.2} />
          <hemisphereLight intensity={0.5} color="#f6efdd" groundColor="#2c1d12" />
          <directionalLight position={[4.5, 6, 5]} intensity={2.2} color="#fff2dd" />
          <directionalLight position={[-3, 1.5, -2]} intensity={0.7} color="#ffb066" />
          <pointLight position={[0, 3, 3]} intensity={16} color={GOLD_LIGHT} />

          <group>
            {/* اللوغو (العملة النادرة) — موجود بكل الحالات */}
            <LogoEmblem reduceMotion={reduceMotion} />

            {/* 🎯 لمّا يختار الزبون قسم: يظهر مشهد تفاعلي بدل القوس */}
            {sceneMode ? (
              <group position={[0.75, -0.95, 0.35]} key={category}>
                <CategoryScene category={category} damping={damping} />
              </group>
            ) : (
              /* ⭕ وضع الافتراضي: الأصناف على قوس تحت اللوغو */
              <ShowcaseItems
                focusIdx={focusIdx}
                damping={damping}
                reduceMotion={reduceMotion}
              />
            )}

            <Sparkles
              count={46}
              scale={[6, 5, 3]}
              size={3.2}
              speed={reduceMotion ? 0 : 0.35}
              opacity={0.75}
              color={GOLD_LIGHT}
            />
          </group>

          <ContactShadows
            position={[0, -2.1, 0]}
            opacity={0.3}
            scale={9}
            blur={2.8}
            far={3.6}
            color="#1b1207"
          />
        </Suspense>
        </Canvas>
      </CanvasBoundary>

      {/* أزرار تبديل العنصر — تظهر فقط بوضع "الكل" */}
      {!reduceMotion && !sceneMode && (
        <div className="absolute inset-x-0 bottom-0.5 z-10 flex flex-wrap items-center justify-center gap-1.5 px-2 sm:bottom-1.5">
          {HERO_ITEMS.map((item, i) => (
            <button
              key={item.id}
              type="button"
              aria-label={item.en}
              title={item.ar}
              onClick={() => setFocusIdx(i)}
              className={`rounded-full px-2 py-0.5 text-[9px] font-black whitespace-nowrap transition-all duration-300 ${
                i === focusIdx
                  ? 'bg-gold text-ink shadow-sm'
                  : 'bg-cream/25 text-cream/85 backdrop-blur-sm hover:bg-cream/45'
              }`}
            >
              {item.ar}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
