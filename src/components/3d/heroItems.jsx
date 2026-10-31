/**
 * 3d/heroItems.jsx — تعريف أصناف الهيدر
 * ===========================================================================
 * ⚠️ لماذا في ملف منفصل عن Hero3D.jsx؟
 *   Vite React Fast Refresh يفشل عندما يصدّر ملف React **مكوّن + قيم غير
 *   مكوّن** (مثل الثوابت). عندها يفسد شجرة React وتظهر أخطاء وهمية مثل
 *   "useApp must be used inside AppProvider" حتى لو الكود سليم 100%.
 *   الحل: المكوّن في Hero3D.jsx، والثوابت هنا.
 */
import Smoothie3D from './Smoothie'
import Milkshake3D from './Milkshake'
import Crepe3D from './Crepe'
import ChimneyCake3D from './ChimneyCake'
import Waffle3D from './Waffle'

export const HERO_ITEMS = [
  { id: 'smoothie', ar: 'سموذي', en: 'Smoothie', Comp: Smoothie3D },
  { id: 'milkshake', ar: 'ميلك شيك', en: 'Milkshake', Comp: Milkshake3D },
  { id: 'crepe', ar: 'كريب', en: 'Crepe', Comp: Crepe3D },
  { id: 'chimney', ar: 'تشنكي كيك', en: 'Chimney Cake', Comp: ChimneyCake3D },
  { id: 'waffle', ar: 'وافل', en: 'Waffle', Comp: Waffle3D },
]
