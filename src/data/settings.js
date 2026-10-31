// ⚙️ إعدادات المتجر — تُعدَّل من صفحة الأدمن (#/admin) ثم تُنشر للموقع
//
// 💡 ملاحظة: التعديلات هون هي القيم **الافتراضية** فقط.
//    إذا عدّلت شي من الأدمن وحفظت، بتختزن بالمتصفح وبتضل هي اللي ظاهرة.
//    لإرجاع القيم الي هون: الأدمن ← تبويب «النشر» ← استعادة / إعادة ضبط.
//
// 📌 روابط السوشيال ممكن تكتبها بدون https:// — بتتحوّل تلقائياً وقت العرض
//    (شوف normalizeUrl بالأسفل).
export const STORE = {
  name: { ar: 'BENOVA', en: 'BENOVA' },
  tagline: { ar: 'كريب وعصائر', en: 'Crepes & Juices' },

  // اللوغو والوصف القصير — بيتعدّلوا من لوحة التحكم ← الإعدادات
  logo: '/brand/benova-logo.png',
  bio: {
    ar: 'كريب طازج، شوكولاتة بلجيكية، عصائر فواكه، وافل وميلك شيك — كل شي يُحضَّر عند الطلب وبكل حب.',
    en: 'Fresh crepes, Belgian chocolate, fruit juices, waffles and shakes — everything made to order, with love.',
  },

  // ⚠️ رقم واتساب المحل: أرقام فقط، بصيغة دولية، بدون + وبدون مسافات.
  //    هاد الرقم اللي بتوصل عليه كل الطلبات (الزر والفوتر والسلة).
  whatsapp: '96179428527',

  phone: '+961 79 428 527',
  email: '',

  // صفحات التواصل الاجتماعي (فارغة = ما بتظهر بالفوتر)
  socials: {
    facebook: '',
    instagram: 'www.instagram.com/benova.lb',
    tiktok: 'www.tiktok.com/@benova_crepes',
  },

  // 📍 رابط الموقع على الخريطة (بينفتح عند الضغط على العنوان)
  mapsUrl: 'https://goo.gl/maps/4s6hNb7AT2MDgKgo9',

  hours: { ar: 'يومياً ١١:٠٠ ص – ١٢:٠٠ ليلاً', en: 'Daily 11:00 AM – 12:00 AM' },
  address: { ar: 'لبنان', en: 'Lebanon' },

  // سعر الصرف للعرض المزدوج ل.ل + دولار
  usdRate: 90000,

  /**
   * 🔴/🟢 حالة استقبال الطلبات.
   *   auto   = يتبع ساعات الدوام تلقائياً
   *   open   = مفتوح يدوياً حتى تتغيّر الحالة
   *   closed = مغلق يدوياً حتى تتغيّر الحالة
   */
  storeStatus: 'auto',

  // سعر التوصيل الافتراضي بالليرة (٠ = بلا سعر توصيل)
  deliveryFee: 0,

  // توصيل مجاني فوق هذا المبلغ بالليرة (٠ = غير مفعّل)
  freeDeliveryOver: 0,

  // Admin credentials and the optional site lock live in .env.local.
  // See src/lib/env.js and README.md before deploying.

  // 🎁 إعدادات العرض العام للمنيو
  // يُطبَّق أوتوماتيكياً على كل الأصناف إذا كان مفعّلاً.
  // إذا كان للمنتج عرض خاص بنفس الوقت، ينصبّط السعر الأقل بين الاثنين.
  globalOffer: {
    active: false,      // هل العرض مفعل أم لا
    percent: 0,         // نسبة الخصم (مثال: 20 = 20% خصم)
    labelAr: 'عرض خاص', // نص العرض بالعربي
    labelEn: 'Special Offer', // نص العرض بالإنجليزي
    startDate: '',      // تاريخ بداية العرض (اختياري، بصيغة YYYY-MM-DD)
    endDate: '',        // تاريخ نهاية العرض (اختياري)
  },
}

/**
 * يحوّل أي رابط لنسخة صالحة للمتصفح.
 * ليش؟ لأن لو حدا كتب "www.instagram.com/benova.lb" بدون https://
 * المتصفح بيعتبرها مسار داخلي بالموقع (مش رابط خارجي) وما بتفتح صح.
 *
 * ما بيأثر على google maps ولا روابط الـ tel / mailto / wa.me
 * لأنها فيها بروتوكول (Scheme) أصلاً.
 */
export function normalizeUrl(url) {
  const raw = String(url || '').trim()
  if (!raw) return ''
  // عندها بروتوكول صريح — رجّعتها كما هي
  if (/^(https?:|tel:|mailto:)/i.test(raw)) return raw
  return `https://${raw.replace(/^\/+/, '')}`
}
