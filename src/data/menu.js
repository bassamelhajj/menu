// BENOVA — Crepes & Juices
// Prices are stored in Lebanese Lira (L.L.). Menu numbers are in thousands,
// e.g. "300" on the printed menu => 300000 L.L.

const s = (labelAr, labelEn, priceLL) => ({ labelAr, labelEn, priceLL })
const one = (p) => [s('عادي', 'Standard', p)]
const ml = (medium, large) => [s('وسط', 'Medium', medium), s('كبير', 'Large', large)]
const mxl = (medium, large, xl) => [
  s('وسط', 'Medium', medium),
  s('كبير', 'Large', large),
  s('1.5 لتر', '1.5 L', xl),
]

export const OFFERS_CATEGORY_ID = 'offers'

export const CATEGORIES = [
  { id: 'all', ar: 'الكل', en: 'All', icon: '✨' },
  { id: OFFERS_CATEGORY_ID, ar: 'العروضات', en: 'Special Offers', icon: '🔥' },
  { id: 'simple', ar: 'كريب عادي', en: 'Regular Crepe', icon: '🥞' },
  { id: 'belgian', ar: 'شوكولاتة بلجيكية', en: 'Belgian Chocolate', icon: '🍫' },
  { id: 'special', ar: 'كريب مميز', en: 'Special Crepe', icon: '👑' },
  { id: 'patissiere', ar: 'كريم باتيسيير', en: 'Pastry Cream', icon: '🍰' },
  { id: 'waffle', ar: 'وافل', en: 'Waffles', icon: '🧇' },
  { id: 'pancake', ar: 'بانكيك', en: 'Pancakes', icon: '🥞' },
  { id: 'chimney', ar: 'تشيمني كيك', en: 'Chimney Cakes', icon: '🥐' },
  { id: 'cups', ar: 'أكواب', en: 'Cups', icon: '🥤' },
  { id: 'chocolamou', ar: 'شوكولامو', en: 'Chocolamou', icon: '🍨' },
  { id: 'cone', ar: 'كون', en: 'Cones', icon: '🍦' },
  { id: 'smoothie', ar: 'سموثي', en: 'Smoothies', icon: '🥤' },
  { id: 'milkshake', ar: 'ميلك شيك', en: 'Milkshakes', icon: '🥛' },
  { id: 'juice', ar: 'عصائر طازجة', en: 'Fresh Juices', icon: '🧃' },
  { id: 'avoca', ar: 'أفوكادو', en: 'Avocado', icon: '🥑' },
]

const REGULAR_PRODUCTS = [
  // ===================== SIMPLE CREPE =====================
  { id: 'sc-nutella', cat: 'simple', ar: 'كريب نوتيلا', en: 'Nutella Crepe', emoji: '🥞', tags: ['best'], descAr: 'كريب طازج محشو نوتيلا غنية', descEn: 'Fresh crepe loaded with rich Nutella', sizes: one(300000) },
  { id: 'sc-kinder-finger', cat: 'simple', ar: 'كريب كيندر فينجر', en: 'Kinder Finger Crepe', emoji: '🍫', descAr: 'كريب مع أصابع كيندر المقرمشة', descEn: 'Crepe with crunchy Kinder sticks', sizes: one(400000) },
  { id: 'sc-kinder-bueno', cat: 'simple', ar: 'كريب كيندر بوينو', en: 'Kinder Bueno Crepe', emoji: '🍫', tags: ['best'], descAr: 'كريب محشو كيندر بوينو', descEn: 'Crepe filled with Kinder Bueno', sizes: one(400000) },
  { id: 'sc-caramel', cat: 'simple', ar: 'كريب كراميل', en: 'Caramel Crepe', emoji: '🍯', descAr: 'كريب بصوص الكراميل الغني', descEn: 'Crepe with rich caramel sauce', sizes: one(400000) },
  { id: 'sc-lotus', cat: 'simple', ar: 'كريب لوتس', en: 'Lotus Crepe', emoji: '🍪', tags: ['best'], descAr: 'كريب بصوص وبسكويت اللوتس', descEn: 'Crepe with Lotus spread and biscuits', sizes: one(400000) },
  { id: 'sc-oreo', cat: 'simple', ar: 'كريب أوريو', en: 'Oreo Crepe', emoji: '🍪', descAr: 'كريب مع أوريو مقرمش', descEn: 'Crepe with crunchy Oreo', sizes: one(400000) },
  { id: 'sc-kitkat', cat: 'simple', ar: 'كريب كيت كات', en: 'KitKat Crepe', emoji: '🍫', descAr: 'كريب مع شوكولاتة كيت كات', descEn: 'Crepe with KitKat chocolate', sizes: one(400000) },
  { id: 'sc-brownie', cat: 'simple', ar: 'كريب براوني', en: 'Brownie Crepe', emoji: '🍰', descAr: 'كريب مع قطع براوني طرية', descEn: 'Crepe with soft brownie chunks', sizes: one(400000) },
  { id: 'sc-crunch', cat: 'simple', ar: 'كريب كرانش', en: 'Crunch Crepe', emoji: '🍫', descAr: 'كريب بشوكولاتة كرانش المقرمشة', descEn: 'Crepe with crunchy chocolate', sizes: one(400000) },
  { id: 'sc-choco-hazelnut', cat: 'simple', ar: 'كريب شوكو بندق', en: 'Choco Hazelnut Crepe', emoji: '🌰', descAr: 'كريب بصوص الشوكولاتة والبندق', descEn: 'Crepe with chocolate hazelnut spread', sizes: one(450000) },
  { id: 'sc-lotus-kinder', cat: 'simple', ar: 'كريب لوتس كيندر', en: 'Lotus Kinder Crepe', emoji: '🍫', descAr: 'مزيج اللوتس والكيندر', descEn: 'Lotus and Kinder mix', sizes: one(450000) },
  { id: 'sc-lotus-crunch', cat: 'simple', ar: 'كريب لوتس كرانش', en: 'Lotus Crunch Crepe', emoji: '🍪', descAr: 'لوتس مع قطع كرانش', descEn: 'Lotus with Crunch pieces', sizes: one(450000) },
  { id: 'sc-lotus-oreo', cat: 'simple', ar: 'كريب لوتس أوريو', en: 'Lotus Oreo Crepe', emoji: '🍪', descAr: 'مزيج اللوتس والأوريو', descEn: 'Lotus and Oreo mix', sizes: one(450000) },
  { id: 'sc-pistachio-butter', cat: 'simple', ar: 'كريب زبدة الفستق', en: 'Pistachio Butter Crepe', emoji: '🌰', descAr: 'كريب بزبدة الفستق الحلبي', descEn: 'Crepe with pistachio butter', sizes: one(450000) },
  { id: 'sc-milka', cat: 'simple', ar: 'كريب ميلكا', en: 'Milka Crepe', emoji: '🍫', descAr: 'كريب بشوكولاتة ميلكا', descEn: 'Crepe with Milka chocolate', sizes: one(450000) },
  { id: 'sc-maltesers', cat: 'simple', ar: 'كريب مالتيزرز', en: 'Maltesers Crepe', emoji: '🟤', descAr: 'كريب مع كرات مالتيزرز', descEn: 'Crepe with Maltesers', sizes: one(450000) },
  { id: 'sc-galaxy', cat: 'simple', ar: 'كريب جالكسي', en: 'Galaxy Crepe', emoji: '🍫', descAr: 'كريب بشوكولاتة جالكسي', descEn: 'Crepe with Galaxy chocolate', sizes: one(400000) },
  { id: 'sc-hershey', cat: 'simple', ar: 'كريب هيرشي', en: 'Hershey Crepe', emoji: '🍫', descAr: 'كريب بصوص هيرشي', descEn: 'Crepe with Hershey sauce', sizes: one(450000) },
  { id: 'sc-peanut-butter', cat: 'simple', ar: 'كريب زبدة الفول السوداني', en: 'Peanut Butter Crepe', emoji: '🥜', descAr: 'كريب بزبدة الفول السوداني', descEn: 'Crepe with peanut butter', sizes: one(450000) },
  { id: 'sc-choco-pistachio', cat: 'simple', ar: 'كريب شوكو فستق', en: 'Choco Pistachio Crepe', emoji: '🌰', tags: ['new'], descAr: 'كريب شوكولاتة مع فستق حلبي', descEn: 'Crepe with chocolate and pistachio', sizes: one(450000) },

  // ===================== BELGIAN CREPE =====================
  { id: 'be-nutella', cat: 'belgian', ar: 'بلجيكي نوتيلا', en: 'Belgian Nutella', emoji: '🍫', tags: ['best'], descAr: 'شوكولاتة بلجيكية فاخرة مع نوتيلا', descEn: 'Real Belgian chocolate with Nutella', sizes: one(500000) },
  { id: 'be-kinder-finger', cat: 'belgian', ar: 'بلجيكي كيندر فينجر', en: 'Belgian Kinder Finger', emoji: '🍫', descAr: 'بلجيكي غني بأصابع كيندر', descEn: 'Belgian chocolate with Kinder sticks', sizes: one(550000) },
  { id: 'be-kinder-bueno', cat: 'belgian', ar: 'بلجيكي كيندر بوينو', en: 'Belgian Kinder Bueno', emoji: '🍫', descAr: 'بلجيكي بكيندر بوينو', descEn: 'Belgian chocolate with Kinder Bueno', sizes: one(550000) },
  { id: 'be-caramel', cat: 'belgian', ar: 'بلجيكي كراميل', en: 'Belgian Caramel', emoji: '🍯', descAr: 'بلجيكي بصوص الكراميل', descEn: 'Belgian chocolate with caramel', sizes: one(550000) },
  { id: 'be-lotus', cat: 'belgian', ar: 'بلجيكي لوتس', en: 'Belgian Lotus', emoji: '🍪', descAr: 'بلجيكي بصوص وبسكويت اللوتس', descEn: 'Belgian chocolate with Lotus', sizes: one(550000) },
  { id: 'be-oreo', cat: 'belgian', ar: 'بلجيكي أوريو', en: 'Belgian Oreo', emoji: '🍪', descAr: 'بلجيكي بقطع الأوريو', descEn: 'Belgian chocolate with Oreo', sizes: one(550000) },
  { id: 'be-kitkat', cat: 'belgian', ar: 'بلجيكي كيت كات', en: 'Belgian KitKat', emoji: '🍫', descAr: 'بلجيكي بشوكولاتة كيت كات', descEn: 'Belgian chocolate with KitKat', sizes: one(550000) },
  { id: 'be-brownie', cat: 'belgian', ar: 'بلجيكي براوني', en: 'Belgian Brownie', emoji: '🍰', descAr: 'بلجيكي مع قطع البراوني', descEn: 'Belgian chocolate with brownie', sizes: one(550000) },
  { id: 'be-crunch', cat: 'belgian', ar: 'بلجيكي كرانش', en: 'Belgian Crunch', emoji: '🍫', descAr: 'بلجيكي بشوكولاتة كرانش', descEn: 'Belgian chocolate with Crunch', sizes: one(550000) },
  { id: 'be-choco-hazelnut', cat: 'belgian', ar: 'بلجيكي شوكو بندق', en: 'Belgian Choco Hazelnut', emoji: '🌰', descAr: 'بلجيكي بصوص شوكو بندق', descEn: 'Belgian chocolate hazelnut', sizes: one(650000) },
  { id: 'be-choco-pistachio', cat: 'belgian', ar: 'بلجيكي شوكو فستق', en: 'Belgian Choco Pistachio', emoji: '🌰', descAr: 'بلجيكي بصوص شوكو فستق', descEn: 'Belgian chocolate pistachio', sizes: one(650000) },
  { id: 'be-lotus-kinder', cat: 'belgian', ar: 'بلجيكي لوتس كيندر', en: 'Belgian Lotus Kinder', emoji: '🍫', descAr: 'بلجيكي مكس لوتس وكيندر', descEn: 'Belgian Lotus and Kinder mix', sizes: one(600000) },
  { id: 'be-lotus-crunch', cat: 'belgian', ar: 'بلجيكي لوتس كرانش', en: 'Belgian Lotus Crunch', emoji: '🍪', descAr: 'بلجيكي مكس لوتس وكرانش', descEn: 'Belgian Lotus and Crunch mix', sizes: one(600000) },
  { id: 'be-lotus-oreo', cat: 'belgian', ar: 'بلجيكي لوتس أوريو', en: 'Belgian Lotus Oreo', emoji: '🍪', descAr: 'بلجيكي مكس لوتس وأوريو', descEn: 'Belgian Lotus and Oreo mix', sizes: one(600000) },
  { id: 'be-lotus-brownie', cat: 'belgian', ar: 'بلجيكي لوتس براوني', en: 'Belgian Lotus Brownie', emoji: '🍰', descAr: 'بلجيكي مكس لوتس وبراوني', descEn: 'Belgian Lotus and brownie mix', sizes: one(650000) },
  { id: 'be-milka', cat: 'belgian', ar: 'بلجيكي ميلكا', en: 'Belgian Milka', emoji: '🍫', descAr: 'بلجيكي بشوكولاتة ميلكا', descEn: 'Belgian chocolate with Milka', sizes: one(550000) },
  { id: 'be-maltesers', cat: 'belgian', ar: 'بلجيكي مالتيزرز', en: 'Belgian Maltesers', emoji: '🟤', descAr: 'بلجيكي بكرات مالتيزرز', descEn: 'Belgian chocolate with Maltesers', sizes: one(600000) },
  { id: 'be-galaxy', cat: 'belgian', ar: 'بلجيكي جالكسي', en: 'Belgian Galaxy', emoji: '🍫', descAr: 'بلجيكي بشوكولاتة جالكسي', descEn: 'Belgian chocolate with Galaxy', sizes: one(550000) },
  { id: 'be-hershey', cat: 'belgian', ar: 'بلجيكي هيرشي', en: 'Belgian Hershey', emoji: '🍫', descAr: 'بلجيكي بصوص هيرشي', descEn: 'Belgian chocolate with Hershey', sizes: one(600000) },
  { id: 'be-pistachio-butter', cat: 'belgian', ar: 'بلجيكي زبدة الفستق', en: 'Belgian Pistachio Butter', emoji: '🌰', descAr: 'بلجيكي بزبدة الفستق الحلبي', descEn: 'Belgian chocolate with pistachio butter', sizes: one(650000) },
  { id: 'be-fettuccine', cat: 'belgian', ar: 'بلجيكي فيتوتشيني', en: 'Belgian Fettuccine', emoji: '🍝', descAr: 'شرائح كريب فيتوتشيني بالبلجيكي', descEn: 'Fettuccine crepe strips in Belgian chocolate', sizes: one(500000) },
  { id: 'be-p-kunafa', cat: 'belgian', ar: 'بلجيكي كنافة فستق', en: 'Belgian P. Kunafa', emoji: '🥮', tags: ['best'], descAr: 'كريب بلجيكي محشو بالكنافة والفستق', descEn: 'Belgian crepe with pistachio kunafa', sizes: one(600000) },
  { id: 'be-peanut-butter', cat: 'belgian', ar: 'بلجيكي زبدة الفول السوداني', en: 'Belgian Peanut Butter', emoji: '🥜', descAr: 'بلجيكي بزبدة الفول السوداني', descEn: 'Belgian chocolate with peanut butter', sizes: one(600000) },

  // ===================== SPECIAL CREPE =====================
  { id: 'sp-signature', cat: 'special', ar: 'كريب بنوفا المميز', en: 'BENOVA Signature', emoji: '👑', tags: ['best'], descAr: 'التشكيلة الملكية الخاصة من BENOVA', descEn: 'BENOVA royal signature creation', sizes: one(900000) },
  { id: 'sp-tiramisu', cat: 'special', ar: 'كريب تيراميسو', en: 'Tiramisu Crepe', emoji: '☕', tags: ['new'], descAr: 'نكهة التيراميسو الإيطالية الشهية', descEn: 'Delicious Italian tiramisu flavour', sizes: one(750000) },

  // ===================== CREME PATISSIERE =====================
  { id: 'pa-pistachio-kunafa', cat: 'patissiere', ar: 'باتيسيير فستق كنافة', en: 'Pistachio Kunafa', emoji: '🥮', descAr: 'كريم باتيسيير مع فستق وكنافة', descEn: 'Pastry cream with pistachio and kunafa', sizes: one(600000) },
  { id: 'pa-pk-brownie', cat: 'patissiere', ar: 'باتيسيير براوني فستق', en: 'P.K Brownie', emoji: '🍰', tags: ['best'], descAr: 'كريم باتيسيير مع براوني وفستق', descEn: 'Pastry cream with brownie and pistachio', sizes: one(700000) },
  { id: 'pa-classic', cat: 'patissiere', ar: 'باتيسيير كلاسيك', en: 'Classic Patissière', emoji: '🍰', descAr: 'كريم باتيسيير كلاسيكي', descEn: 'Classic pastry cream crepe', sizes: one(550000) },
  { id: 'pa-nuts', cat: 'patissiere', ar: 'باتيسيير مكسرات', en: 'Patissière Nuts', emoji: '🌰', descAr: 'كريم باتيسيير مع مكسرات مشكّلة', descEn: 'Pastry cream with mixed nuts', sizes: one(800000) },

  // ===================== WAFFLE =====================
  { id: 'wa-nutella', cat: 'waffle', ar: 'وافل نوتيلا', en: 'Nutella Waffle', emoji: '🧇', tags: ['best'], descAr: 'وافل مقرمش بنوتيلا', descEn: 'Crispy waffle with Nutella', sizes: one(350000) },
  { id: 'wa-white', cat: 'waffle', ar: 'وافل شوكولاتة بيضاء', en: 'White Chocolate Waffle', emoji: '🧇', descAr: 'وافل بشوكولاتة بيضاء', descEn: 'Waffle with white chocolate', sizes: one(350000) },
  { id: 'wa-oreo', cat: 'waffle', ar: 'وافل أوريو', en: 'Oreo Waffle', emoji: '🧇', descAr: 'وافل أوريو مقرمش', descEn: 'Waffle with Oreo', sizes: one(450000) },
  { id: 'wa-kinder', cat: 'waffle', ar: 'وافل كيندر', en: 'Kinder Waffle', emoji: '🧇', descAr: 'وافل كيندر', descEn: 'Waffle with Kinder', sizes: one(450000) },
  { id: 'wa-lotus', cat: 'waffle', ar: 'وافل لوتس', en: 'Lotus Waffle', emoji: '🧇', tags: ['best'], descAr: 'وافل لوتس', descEn: 'Waffle with Lotus', sizes: one(450000) },
  { id: 'wa-maltesers', cat: 'waffle', ar: 'وافل مالتيزرز', en: 'Maltesers Waffle', emoji: '🧇', descAr: 'وافل مالتيزرز', descEn: 'Waffle with Maltesers', sizes: one(500000) },
  { id: 'wa-milka', cat: 'waffle', ar: 'وافل ميلكا', en: 'Milka Waffle', emoji: '🧇', descAr: 'وافل ميلكا', descEn: 'Waffle with Milka', sizes: one(500000) },
  { id: 'wa-hazelnut', cat: 'waffle', ar: 'وافل بندق', en: 'Hazelnut Waffle', emoji: '🧇', descAr: 'وافل بندق', descEn: 'Waffle with hazelnut', sizes: one(550000) },
  { id: 'wa-lotus-kinder', cat: 'waffle', ar: 'وافل لوتس كيندر', en: 'Lotus Kinder Waffle', emoji: '🧇', descAr: 'مزيج لوتس وكيندر', descEn: 'Lotus and Kinder mix', sizes: one(500000) },
  { id: 'wa-lotus-oreo', cat: 'waffle', ar: 'وافل لوتس أوريو', en: 'Lotus Oreo Waffle', emoji: '🧇', descAr: 'مزيج لوتس وأوريو', descEn: 'Lotus and Oreo mix', sizes: one(500000) },
  { id: 'wa-oreo-kinder', cat: 'waffle', ar: 'وافل أوريو كيندر', en: 'Oreo Kinder Waffle', emoji: '🧇', descAr: 'مزيج أوريو وكيندر', descEn: 'Oreo and Kinder mix', sizes: one(500000) },
  { id: 'wa-pistachio-white', cat: 'waffle', ar: 'وافل فستق وشوكولا بيضاء', en: 'Pistachio White Waffle', emoji: '🧇', descAr: 'فستق حلبي وشوكولاتة بيضاء', descEn: 'Pistachio and white chocolate', sizes: one(550000) },
  { id: 'wa-pistachio-lotus', cat: 'waffle', ar: 'وافل فستق ولوتس', en: 'Pistachio Lotus Waffle', emoji: '🧇', descAr: 'فستق حلبي ولوتس', descEn: 'Pistachio and Lotus', sizes: one(550000) },
  { id: 'wa-big-4', cat: 'waffle', ar: 'وافل كبير ٤ نكهات', en: 'Big Waffle · 4 Flavours', emoji: '🧇', tags: ['new'], descAr: 'وافل عائلي كبير بأربع نكهات', descEn: 'Big sharing waffle with 4 flavours', sizes: one(600000) },

  // ===================== PANCAKE =====================
  { id: 'pc-nutella', cat: 'pancake', ar: 'بانكيك ١٨ قطعة نوتيلا', en: 'Pancakes Nutella · 18 pcs', emoji: '🥞', tags: ['best'], descAr: '١٨ قطعة ميني بانكيك نوتيلا', descEn: '18 mini pancakes with Nutella', sizes: one(350000) },
  { id: 'pc-white', cat: 'pancake', ar: 'بانكيك ١٨ قطعة شوكولاتة بيضاء', en: 'Pancakes White · 18 pcs', emoji: '🥞', descAr: '١٨ قطعة ميني بانكيك شوكولاتة بيضاء', descEn: '18 mini pancakes with white chocolate', sizes: one(350000) },
  { id: 'pc-oreo', cat: 'pancake', ar: 'بانكيك ١٨ قطعة أوريو', en: 'Pancakes Oreo · 18 pcs', emoji: '🥞', descAr: '١٨ قطعة ميني بانكيك أوريو', descEn: '18 mini pancakes with Oreo', sizes: one(400000) },
  { id: 'pc-kinder', cat: 'pancake', ar: 'بانكيك ١٨ قطعة كيندر', en: 'Pancakes Kinder · 18 pcs', emoji: '🥞', descAr: '١٨ قطعة ميني بانكيك كيندر', descEn: '18 mini pancakes with Kinder', sizes: one(450000) },
  { id: 'pc-lotus', cat: 'pancake', ar: 'بانكيك ١٨ قطعة لوتس', en: 'Pancakes Lotus · 18 pcs', emoji: '🥞', descAr: '١٨ قطعة ميني بانكيك لوتس', descEn: '18 mini pancakes with Lotus', sizes: one(400000) },
  { id: 'pc-caramel', cat: 'pancake', ar: 'بانكيك ١٨ قطعة كراميل', en: 'Pancakes Caramel · 18 pcs', emoji: '🥞', descAr: '١٨ قطعة ميني بانكيك كراميل', descEn: '18 mini pancakes with caramel', sizes: one(400000) },
  { id: 'pc-milka', cat: 'pancake', ar: 'بانكيك ١٨ قطعة ميلكا', en: 'Pancakes Milka · 18 pcs', emoji: '🥞', descAr: '١٨ قطعة ميني بانكيك ميلكا', descEn: '18 mini pancakes with Milka', sizes: one(450000) },
  { id: 'pc-maltesers', cat: 'pancake', ar: 'بانكيك ١٨ قطعة مالتيزرز', en: 'Pancakes Maltesers · 18 pcs', emoji: '🥞', descAr: '١٨ قطعة ميني بانكيك مالتيزرز', descEn: '18 mini pancakes with Maltesers', sizes: one(450000) },
  { id: 'pc-brownie', cat: 'pancake', ar: 'بانكيك ١٨ قطعة براوني', en: 'Pancakes Brownie · 18 pcs', emoji: '🥞', descAr: '١٨ قطعة ميني بانكيك براوني', descEn: '18 mini pancakes with brownie', sizes: one(400000) },
  { id: 'pc-pistachio', cat: 'pancake', ar: 'بانكيك ١٨ قطعة فستق', en: 'Pancakes Pistachio · 18 pcs', emoji: '🥞', tags: ['best'], descAr: '١٨ قطعة ميني بانكيك فستق', descEn: '18 mini pancakes with pistachio', sizes: one(500000) },
  { id: 'pc-hazelnut', cat: 'pancake', ar: 'بانكيك ١٨ قطعة بندق', en: 'Pancakes Hazelnut · 18 pcs', emoji: '🥞', descAr: '١٨ قطعة ميني بانكيك بندق', descEn: '18 mini pancakes with hazelnut', sizes: one(500000) },
  { id: 'pc-big-nutella', cat: 'pancake', ar: 'بانكيك طبقات مع فواكه · نوتيلا', en: 'Big Pancake Nutella', emoji: '🥞', descAr: 'بانكيك طبقات مسطّحة نوتيلا مع فواكه', descEn: 'Flat layered pancakes, Nutella and fruits', sizes: one(500000) },
  { id: 'pc-big-lotus', cat: 'pancake', ar: 'بانكيك طبقات مع فواكه · لوتس', en: 'Big Pancake Lotus', emoji: '🥞', descAr: 'بانكيك طبقات مسطّحة لوتس مع فواكه', descEn: 'Flat layered pancakes, Lotus and fruits', sizes: one(550000) },
  { id: 'pc-big-pistachio', cat: 'pancake', ar: 'بانكيك طبقات مع فواكه · فستق', en: 'Big Pancake Pistachio', emoji: '🥞', descAr: 'بانكيك طبقات مسطّحة فستق مع فواكه', descEn: 'Flat layered pancakes, pistachio and fruits', sizes: one(600000) },
  { id: 'pc-big-mix', cat: 'pancake', ar: 'بانكيك طبقات · مكس نكهات', en: 'Big Pancake · Mix Flavours', emoji: '🥞', tags: ['new'], descAr: 'بانكيك طبقات مسطّحة بمكس نكهات مع فواكه', descEn: 'Flat layered pancakes, mixed flavours and fruits', sizes: one(700000) },

  // ===================== CUPS =====================
  { id: 'cu-brownie', cat: 'cups', ar: 'كوب براوني', en: 'Brownie Cup', emoji: '🥤', tags: ['best'], descAr: 'كوب طبقات براوني وكريمة', descEn: 'Layered brownie and cream cup', sizes: ml(350000, 450000) },
  { id: 'cu-brownie-lotus', cat: 'cups', ar: 'كوب براوني لوتس', en: 'Brownie Lotus Cup', emoji: '🥤', descAr: 'كوب براوني مع لوتس', descEn: 'Brownie cup with Lotus', sizes: ml(400000, 500000) },
  { id: 'cu-pistachio-brownie', cat: 'cups', ar: 'كوب براوني فستق', en: 'Pistachio Brownie Cup', emoji: '🥤', descAr: 'كوب براوني بفستق حلبي', descEn: 'Brownie cup with pistachio', sizes: ml(450000, 550000) },
  { id: 'cu-oreo', cat: 'cups', ar: 'كوب أوريو', en: 'Oreo Cup', emoji: '🥤', descAr: 'كوب أوريو طازج', descEn: 'Fresh Oreo cup', sizes: ml(350000, 450000) },
  { id: 'cu-lotus-oreo', cat: 'cups', ar: 'كوب لوتس أوريو', en: 'Lotus Oreo Cup', emoji: '🥤', descAr: 'مزيج لوتس وأوريو بالكوب', descEn: 'Lotus and Oreo cup', sizes: ml(450000, 550000) },
  { id: 'cu-kinder-brownie', cat: 'cups', ar: 'كوب كيندر براوني', en: 'Kinder Brownie Cup', emoji: '🥤', descAr: 'كوب براوني مع كيندر', descEn: 'Brownie cup with Kinder', sizes: ml(450000, 550000) },

  // ===================== CHOCOLAMOU =====================
  { id: 'chm-chocolat', cat: 'chocolamou', ar: 'شوكولامو شوكولات', en: 'Chocolamou Chocolat', emoji: '🍨', tags: ['best'], descAr: 'شوكولامو مثلّج بارد', descEn: 'Classic iced Chocolamou', sizes: ml(300000, 400000) },
  { id: 'chm-oreo', cat: 'chocolamou', ar: 'شوكولامو أوريو', en: 'Chocolamou Oreo', emoji: '🍨', descAr: 'شوكولامو بقطع الأوريو', descEn: 'Chocolamou with Oreo', sizes: ml(350000, 450000) },
  { id: 'chm-brownie', cat: 'chocolamou', ar: 'شوكولامو براوني', en: 'Chocolamou Brownie', emoji: '🍨', descAr: 'شوكولامو مع براوني', descEn: 'Chocolamou with brownie', sizes: ml(350000, 450000) },
  { id: 'chm-kitkat', cat: 'chocolamou', ar: 'شوكولامو كيت كات', en: 'Chocolamou KitKat', emoji: '🍨', descAr: 'شوكولامو بكيت كات', descEn: 'Chocolamou with KitKat', sizes: ml(350000, 450000) },
  { id: 'chm-lotus', cat: 'chocolamou', ar: 'شوكولامو لوتس', en: 'Chocolamou Lotus', emoji: '🍨', descAr: 'شوكولامو باللوتس', descEn: 'Chocolamou with Lotus', sizes: ml(400000, 500000) },
  { id: 'chm-kinder', cat: 'chocolamou', ar: 'شوكولامو كيندر', en: 'Chocolamou Kinder', emoji: '🍨', descAr: 'شوكولامو مع كيندر', descEn: 'Chocolamou with Kinder', sizes: ml(400000, 500000) },
  { id: 'chm-maltesers', cat: 'chocolamou', ar: 'شوكولامو مالتيزرز', en: 'Chocolamou Maltesers', emoji: '🍨', descAr: 'شوكولامو مع مالتيزرز', descEn: 'Chocolamou with Maltesers', sizes: ml(400000, 500000) },
  { id: 'chm-kaju', cat: 'chocolamou', ar: 'شوكولامو كاجو', en: 'Chocolamou Kaju', emoji: '🍨', descAr: 'شوكولامو مع كاجو محمّص', descEn: 'Chocolamou with roasted cashew', sizes: ml(400000, 500000) },
  { id: 'chm-hazelnut', cat: 'chocolamou', ar: 'شوكولامو بندق', en: 'Chocolamou Hazelnut', emoji: '🍨', descAr: 'شوكولامو مع بندق', descEn: 'Chocolamou with hazelnut', sizes: ml(450000, 550000) },
  { id: 'chm-pistachio', cat: 'chocolamou', ar: 'شوكولامو فستق', en: 'Chocolamou Pistachio', emoji: '🍨', descAr: 'شوكولامو بزبدة الفستق', descEn: 'Chocolamou with pistachio', sizes: ml(450000, 550000) },

  // ===================== CHIMNEY CAKE =====================
  { id: 'ch-classic', cat: 'chimney', ar: 'تشيمني كيك كلاسيك', en: 'Chimney Cake Classic', emoji: '🥐', tags: ['best'], descAr: 'تشيمني كيك نوتيلا وكريمة', descEn: 'Chimney cake with Nutella and cream', sizes: one(500000) },
  { id: 'ch-oreo', cat: 'chimney', ar: 'تشيمني كيك أوريو', en: 'Chimney Cake Oreo', emoji: '🥐', descAr: 'تشيمني كيك بقطع الأوريو', descEn: 'Chimney cake with Oreo', sizes: one(550000) },
  { id: 'ch-lotus', cat: 'chimney', ar: 'تشيمني كيك لوتس', en: 'Chimney Cake Lotus', emoji: '🥐', descAr: 'تشيمني كيك باللوتس', descEn: 'Chimney cake with Lotus', sizes: one(550000) },
  { id: 'ch-kinder', cat: 'chimney', ar: 'تشيمني كيك كيندر', en: 'Chimney Cake Kinder', emoji: '🥐', descAr: 'تشيمني كيك مع كيندر', descEn: 'Chimney cake with Kinder', sizes: one(550000) },
  { id: 'ch-pistachio', cat: 'chimney', ar: 'تشيمني كيك فستق', en: 'Chimney Cake Pistachio', emoji: '🥐', descAr: 'تشيمني كيك بزبدة الفستق', descEn: 'Chimney cake with pistachio', sizes: one(650000) },
  { id: 'ch-hazelnut', cat: 'chimney', ar: 'تشيمني كيك بندق', en: 'Chimney Cake Hazelnut', emoji: '🥐', descAr: 'تشيمني كيك بالبندق', descEn: 'Chimney cake with hazelnut', sizes: one(650000) },

  // ===================== CONE =====================
  { id: 'co-nutella', cat: 'cone', ar: 'كون نوتيلا', en: 'Cone Nutella', emoji: '🍦', tags: ['best'], descAr: 'كون محشو نوتيلا', descEn: 'Cone filled with Nutella', sizes: one(300000) },
  { id: 'co-oreo', cat: 'cone', ar: 'كون أوريو', en: 'Cone Oreo', emoji: '🍦', descAr: 'كون محشو بالأوريو', descEn: 'Cone filled with Oreo', sizes: one(350000) },
  { id: 'co-lotus', cat: 'cone', ar: 'كون لوتس', en: 'Cone Lotus', emoji: '🍦', descAr: 'كون محشو باللوتس', descEn: 'Cone filled with Lotus', sizes: one(350000) },
  { id: 'co-kinder', cat: 'cone', ar: 'كون كيندر', en: 'Cone Kinder', emoji: '🍦', descAr: 'كون محشو بالكيندر', descEn: 'Cone filled with Kinder', sizes: one(350000) },
  { id: 'co-pistachio', cat: 'cone', ar: 'كون فستق', en: 'Cone Pistachio', emoji: '🍦', descAr: 'كون محشو بالفستق', descEn: 'Cone filled with pistachio', sizes: one(400000) },
  { id: 'co-hazelnut', cat: 'cone', ar: 'كون بندق', en: 'Cone Hazelnut', emoji: '🍦', descAr: 'كون محشو بالبندق', descEn: 'Cone filled with hazelnut', sizes: one(400000) },

  // ===================== SMOOTHIE =====================
  { id: 'sm-oreo', cat: 'smoothie', ar: 'سموثي أوريو', en: 'Oreo Smoothie', emoji: '🥤', tags: ['best'], descAr: 'سموثي أوريو مثلّج', descEn: 'Iced Oreo smoothie', sizes: ml(400000, 500000) },
  { id: 'sm-lotus', cat: 'smoothie', ar: 'سموثي لوتس', en: 'Lotus Smoothie', emoji: '🥤', descAr: 'سموثي لوتس مثلّج', descEn: 'Iced Lotus smoothie', sizes: ml(400000, 500000) },
  { id: 'sm-brownie', cat: 'smoothie', ar: 'سموثي براوني', en: 'Brownie Smoothie', emoji: '🥤', descAr: 'سموثي براوني مثلّج', descEn: 'Iced brownie smoothie', sizes: ml(400000, 500000) },
  { id: 'sm-kitkat', cat: 'smoothie', ar: 'سموثي كيت كات', en: 'KitKat Smoothie', emoji: '🥤', descAr: 'سموثي كيت كات', descEn: 'KitKat smoothie', sizes: ml(400000, 500000) },
  { id: 'sm-choco', cat: 'smoothie', ar: 'سموثي شوكو', en: 'Choco Smoothie', emoji: '🥤', descAr: 'سموثي شوكولاتة غني', descEn: 'Rich chocolate smoothie', sizes: ml(350000, 450000) },
  { id: 'sm-vanilla', cat: 'smoothie', ar: 'سموثي فانيلا', en: 'Vanilla Smoothie', emoji: '🥤', descAr: 'سموثي فانيلا', descEn: 'Vanilla smoothie', sizes: ml(350000, 450000) },
  { id: 'sm-pistachio', cat: 'smoothie', ar: 'سموثي فستق', en: 'Pistachio Smoothie', emoji: '🥤', descAr: 'سموثي فستق حلبي', descEn: 'Pistachio smoothie', sizes: ml(450000, 550000) },
  { id: 'sm-hazelnut', cat: 'smoothie', ar: 'سموثي بندق', en: 'Hazelnut Smoothie', emoji: '🥤', descAr: 'سموثي بندق', descEn: 'Hazelnut smoothie', sizes: ml(450000, 550000) },
  { id: 'sm-strawberry', cat: 'smoothie', ar: 'سموثي فراولة', en: 'Strawberry Smoothie', emoji: '🥤', descAr: 'سموثي فراولة منعش', descEn: 'Refreshing strawberry smoothie', sizes: ml(400000, 500000) },
  { id: 'sm-blueberry', cat: 'smoothie', ar: 'سموثي بلوبيري', en: 'Blueberry Smoothie', emoji: '🥤', descAr: 'سموثي توت أزرق', descEn: 'Blueberry smoothie', sizes: ml(400000, 500000) },
  { id: 'sm-lemon', cat: 'smoothie', ar: 'سموثي ليمون', en: 'Lemon Smoothie', emoji: '🥤', descAr: 'سموثي ليمون مثلّج', descEn: 'Iced lemon smoothie', sizes: ml(400000, 500000) },
  { id: 'sm-banana', cat: 'smoothie', ar: 'سموثي موز', en: 'Banana Smoothie', emoji: '🥤', descAr: 'سموثي موز طبيعي', descEn: 'Natural banana smoothie', sizes: ml(400000, 500000) },
  { id: 'sm-mango', cat: 'smoothie', ar: 'سموثي مانجو', en: 'Mango Smoothie', emoji: '🥤', descAr: 'سموثي مانجو استوائي', descEn: 'Tropical mango smoothie', sizes: ml(400000, 500000) },
  { id: 'sm-avoca', cat: 'smoothie', ar: 'سموثي أفوكادو', en: 'Avocado Smoothie', emoji: '🥤', descAr: 'سموثي أفوكادو كريمي', descEn: 'Creamy avocado smoothie', sizes: ml(450000, 550000) },
  { id: 'sm-mixed', cat: 'smoothie', ar: 'سموثي فواكه مشكّلة', en: 'Mixed Fruit Smoothie', emoji: '🥤', descAr: 'سموثي فواكه مشكّلة', descEn: 'Mixed fruit smoothie', sizes: ml(450000, 550000) },

  // ===================== MILKSHAKE =====================
  { id: 'ms-choco', cat: 'milkshake', ar: 'ميلك شيك شوكو', en: 'Choco Milkshake', emoji: '🥛', tags: ['best'], descAr: 'ميلك شيك شوكولاتة غني', descEn: 'Rich chocolate milkshake', sizes: ml(300000, 400000) },
  { id: 'ms-vanilla', cat: 'milkshake', ar: 'ميلك شيك فانيلا', en: 'Vanilla Milkshake', emoji: '🥛', descAr: 'ميلك شيك فانيلا', descEn: 'Vanilla milkshake', sizes: ml(300000, 400000) },
  { id: 'ms-oreo', cat: 'milkshake', ar: 'ميلك شيك أوريو', en: 'Oreo Milkshake', emoji: '🥛', descAr: 'ميلك شيك أوريو', descEn: 'Oreo milkshake', sizes: ml(300000, 400000) },
  { id: 'ms-lotus', cat: 'milkshake', ar: 'ميلك شيك لوتس', en: 'Lotus Milkshake', emoji: '🥛', descAr: 'ميلك شيك لوتس', descEn: 'Lotus milkshake', sizes: ml(300000, 400000) },
  { id: 'ms-brownie', cat: 'milkshake', ar: 'ميلك شيك براوني', en: 'Brownie Milkshake', emoji: '🥛', descAr: 'ميلك شيك براوني', descEn: 'Brownie milkshake', sizes: ml(300000, 400000) },
  { id: 'ms-kitkat', cat: 'milkshake', ar: 'ميلك شيك كيت كات', en: 'KitKat Milkshake', emoji: '🥛', descAr: 'ميلك شيك كيت كات', descEn: 'KitKat milkshake', sizes: ml(300000, 400000) },
  { id: 'ms-caramel', cat: 'milkshake', ar: 'ميلك شيك كراميل', en: 'Caramel Milkshake', emoji: '🥛', descAr: 'ميلك شيك كراميل', descEn: 'Caramel milkshake', sizes: ml(300000, 400000) },
  { id: 'ms-strawberry', cat: 'milkshake', ar: 'ميلك شيك فراولة', en: 'Strawberry Milkshake', emoji: '🥛', descAr: 'ميلك شيك فراولة', descEn: 'Strawberry milkshake', sizes: ml(300000, 400000) },
  { id: 'ms-blueberry', cat: 'milkshake', ar: 'ميلك شيك بلوبيري', en: 'Blueberry Milkshake', emoji: '🥛', descAr: 'ميلك شيك توت أزرق', descEn: 'Blueberry milkshake', sizes: ml(300000, 400000) },
  { id: 'ms-banana', cat: 'milkshake', ar: 'ميلك شيك موز', en: 'Banana Milkshake', emoji: '🥛', descAr: 'ميلك شيك موز', descEn: 'Banana milkshake', sizes: ml(300000, 400000) },

  // ===================== FRESH JUICE =====================
  { id: 'ju-lemon', cat: 'juice', ar: 'عصير ليمون', en: 'Lemon Juice', emoji: '🍋', descAr: 'عصير ليمون طازج', descEn: 'Fresh lemon juice', sizes: mxl(200000, 300000, 500000) },
  { id: 'ju-lemon-mint', cat: 'juice', ar: 'عصير ليمون نعناع', en: 'Lemon Mint Juice', emoji: '🍹', tags: ['best'], descAr: 'ليمون ونعناع منعش', descEn: 'Refreshing lemon and mint', sizes: mxl(220000, 320000, 520000) },
  { id: 'ju-lemon-brazil', cat: 'juice', ar: 'عصير ليمون برازيل', en: 'Lemon Brazil', emoji: '🍋', descAr: 'ليمون على الطريقة البرازيلية', descEn: 'Brazilian style lemonade', sizes: mxl(250000, 350000, 550000) },
  { id: 'ju-mango', cat: 'juice', ar: 'عصير مانجو', en: 'Mango Juice', emoji: '🥭', descAr: 'عصير مانجو طازج ١٠٠٪', descEn: '100% fresh mango juice', sizes: mxl(300000, 400000, 600000) },
  { id: 'ju-strawberry', cat: 'juice', ar: 'عصير فراولة', en: 'Strawberry Juice', emoji: '🍓', descAr: 'عصير فراولة طبيعي', descEn: 'Natural strawberry juice', sizes: mxl(300000, 400000, 600000) },
  { id: 'ju-blueberry', cat: 'juice', ar: 'عصير بلوبيري', en: 'Blueberry Juice', emoji: '🫐', descAr: 'عصير توت أزرق طازج', descEn: 'Fresh blueberry juice', sizes: mxl(300000, 400000, 600000) },
  { id: 'ju-melon', cat: 'juice', ar: 'عصير شمام', en: 'Melon Juice', emoji: '🍈', descAr: 'عصير شمام طبيعي', descEn: 'Natural melon juice', sizes: mxl(300000, 400000, 600000) },
  { id: 'ju-kiwi', cat: 'juice', ar: 'عصير كيوي', en: 'Kiwi Juice', emoji: '🥝', descAr: 'عصير كيوي منعش', descEn: 'Refreshing kiwi juice', sizes: mxl(300000, 400000, 600000) },
  { id: 'ju-guava', cat: 'juice', ar: 'عصير جوافة', en: 'Guava Juice', emoji: '🍐', descAr: 'عصير جوافة طبيعي', descEn: 'Natural guava juice', sizes: mxl(300000, 400000, 600000) },
  { id: 'ju-banana-milk', cat: 'juice', ar: 'عصير موز بالحليب', en: 'Banana Milk Juice', emoji: '🍌', descAr: 'موز مع حليب طازج', descEn: 'Banana with fresh milk', sizes: mxl(250000, 350000, 550000) },
  { id: 'ju-bm', cat: 'juice', ar: 'كوكتيل B.M', en: 'B.M Cocktail', emoji: '🍹', tags: ['best'], descAr: 'الخلطة الشهيرة من BENOVA', descEn: 'BENOVA famous juice mix', sizes: mxl(300000, 400000, 600000) },
  { id: 'ju-avoca', cat: 'juice', ar: 'عصير أفوكادو', en: 'Avocado Juice', emoji: '🥑', descAr: 'عصير أفوكادو طازج', descEn: 'Fresh avocado juice', sizes: mxl(350000, 450000, 650000) },
  { id: 'ju-pomegranate', cat: 'juice', ar: 'عصير رمان', en: 'Pomegranate Juice', emoji: '🍎', descAr: 'عصير رمان طازج', descEn: 'Fresh pomegranate juice', sizes: mxl(300000, 400000, 600000) },
  { id: 'ju-mixed', cat: 'juice', ar: 'فواكه مشكّلة', en: 'Mixed Fruits Juice', emoji: '🍹', descAr: 'كوكتيل فواكه مشكّلة', descEn: 'Mixed fruit cocktail', sizes: mxl(350000, 450000, 650000) },

  // ===================== AVOCADO =====================
  { id: 'av-classic', cat: 'avoca', ar: 'أفوكادو كلاسيك', en: 'Classic Avocado', emoji: '🥑', descAr: 'أفوكادو طبيعي طازج', descEn: 'Natural fresh avocado', sizes: ml(400000, 500000) },
  { id: 'av-nutella', cat: 'avoca', ar: 'أفوكادو نوتيلا', en: 'Avocado Nutella', emoji: '🥑', tags: ['best'], descAr: 'أفوكادو مع نوتيلا غنية', descEn: 'Avocado with rich Nutella', sizes: ml(500000, 600000) },
  { id: 'av-lotus', cat: 'avoca', ar: 'أفوكادو لوتس', en: 'Avocado Lotus', emoji: '🥑', descAr: 'أفوكادو بصوص اللوتس', descEn: 'Avocado with Lotus spread', sizes: ml(500000, 600000) },
  { id: 'av-fruit', cat: 'avoca', ar: 'أفوكادو فواكه', en: 'Avocado Fruit', emoji: '🥑', descAr: 'أفوكادو مع قطع فواكه مشكّلة', descEn: 'Avocado with mixed fruits', sizes: ml(450000, 550000) },
  { id: 'av-frutine-avoca', cat: 'avoca', ar: 'فروتين أفوكادو', en: 'Frutine + Avocado', emoji: '🥑', descAr: 'مزيج الفروتين والأفوكادو', descEn: 'Frutine and avocado mix', sizes: ml(550000, 650000) },
  { id: 'av-frutine', cat: 'avoca', ar: 'فروتين', en: 'Frutine', emoji: '🥑', descAr: 'فروتين طازج', descEn: 'Fresh frutine', sizes: ml(350000, 450000) },
  { id: 'av-frutine-extra', cat: 'avoca', ar: 'فروتين إكسترا', en: 'Frutine Extra', emoji: '🥑', descAr: 'فروتين إكسترا مع إضافات', descEn: 'Frutine extra with toppings', sizes: ml(450000, 550000) },
  { id: 'av-ashtavoca', cat: 'avoca', ar: 'قشطة أفوكادو', en: 'Ashtavoca', emoji: '🥑', tags: ['new'], descAr: 'أفوكادو بالقشطة والمكسرات', descEn: 'Avocado with cream and nuts', sizes: ml(550000, 650000) },
]

/**
 * 🎁 عروض الباقات — عناصر مستقلة تماماً عن خصومات المنتجات الفردية.
 * المنتج العادي يضل بقسمه الأصلي (وافل، عصائر…) حتى لو عليه خصم.
 * الباقة فقط بتظهر بقسم «العروضات 🔥».
 */
export const SAMPLE_BUNDLES = [
  {
    id: 'bundle-crepe-juice',
    kind: 'bundle',
    cat: OFFERS_CATEGORY_ID,
    ar: 'عرض الكريب والعصير',
    en: 'Crepe & Juice Combo',
    emoji: '🔥',
    tags: [],
    descAr: 'كريب نوتيلا طازج + عصير ليمون نعناع — بسعر الباقة',
    descEn: 'Fresh Nutella crepe + lemon-mint juice — bundle price',
    sizes: [{ labelAr: 'باقة', labelEn: 'Combo', priceLL: 450000 }],
    bundleItems: [
      { productId: 'sc-nutella', qty: 1 },
      { productId: 'ju-lemon-mint', qty: 1 },
    ],
    offer: { active: false, percent: 0, labelAr: 'عرض', labelEn: 'Offer' },
    active: true,
  },
  {
    id: 'bundle-chimney-smoothie',
    kind: 'bundle',
    cat: OFFERS_CATEGORY_ID,
    ar: 'عرض التشيمني والسمـوثي',
    en: 'Chimney & Smoothie Combo',
    emoji: '🎁',
    tags: [],
    descAr: 'تشيمني كيك كلاسيك + سموثي أوريو مثلّج — بسعر الباقة',
    descEn: 'Classic chimney cake + iced Oreo smoothie — bundle price',
    sizes: [{ labelAr: 'باقة', labelEn: 'Combo', priceLL: 749000 }],
    bundleItems: [
      { productId: 'ch-classic', qty: 1 },
      { productId: 'sm-oreo', qty: 1 },
    ],
    offer: { active: false, percent: 0, labelAr: 'عرض', labelEn: 'Offer' },
    active: true,
  },
]

export const PRODUCTS = [...REGULAR_PRODUCTS, ...SAMPLE_BUNDLES]

export const EXTRAS = [
  { id: 'ex-fruits', ar: 'فواكه إضافية', en: 'Extra Fruits', priceLL: 200000 },
  { id: 'ex-nuts', ar: 'مكسرات', en: 'Nuts', priceLL: 200000 },
  { id: 'ex-strawberry', ar: 'فراولة إضافية', en: 'Extra Strawberry', priceLL: 150000 },
  { id: 'ex-icecream', ar: 'بوظة (آيس كريم)', en: 'Ice Cream', priceLL: 100000 },
  { id: 'ex-nutella', ar: 'كأس نوتيلا', en: 'Cup of Nutella', priceLL: 100000 },
  { id: 'ex-brownie', ar: 'براوني إضافي', en: 'Extra Brownie', priceLL: 80000 },
  { id: 'ex-banana', ar: 'موز إضافي', en: 'Extra Banana', priceLL: 50000 },
]

export const GALLERY = Array.from({ length: 9 }, (_, i) => ({
  id: i + 1,
  src: `/menu/section-${i + 1}.jpeg`,
  ar: `قسم ${i + 1}`,
  en: `Section ${i + 1}`,
}))

export const CATEGORY_LABEL = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
)

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id)
