import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { AppProvider, useApp } from './store/AppContext'
import { ContentProvider, useContent } from './store/ContentContext'
import { UIProvider, useUI } from './store/UIContext'
import { navigate, useHashRoute } from './lib/hashRoute'
import SiteChrome from './components/SiteChrome'
import Hero from './components/Hero'
import Gallery from './components/Gallery'
import CategoryNav from './components/CategoryNav'
import ProductCard from './components/ProductCard'
import BottomNav from './components/BottomNav'
import Footer from './components/Footer'
import FavoritesPage from './pages/FavoritesPage'
import AboutPage from './pages/AboutPage'
import FAQPage from './pages/FAQPage'
import ReviewsPage from './pages/ReviewsPage'
import ContactPage from './pages/ContactPage'
import AccountPage from './pages/AccountPage'
import PasswordGate from './components/PasswordGate'

const Admin = lazy(() => import('./pages/Admin'))

/**
 * كم كرت نعرض أول مرة بكل قسم.
 * 14 قسم × 4 = 56 كرت — أسرع بكتير من رسم 153 كرت دفعة واحدة،
 * وكل قسم فيه زر «عرض المزيد» مستقل.
 */
const SECTION_PAGE = 4
const GRID_PAGE = 20

/** عنوان قسم داخل صفحة المنيو */
function CategorySection({ cat, lang, limit, active, onShowMore, onOpen, register }) {
  const shown = cat.items.slice(0, limit)
  const ar = lang === 'ar'

  return (
    <section
      id={`cat-${cat.id}`}
      ref={(node) => register(cat.id, node)}
      data-category={cat.id}
      aria-labelledby={`cat-title-${cat.id}`}
      className="menu-section py-7 first:pt-2 sm:py-9"
      style={{
        scrollMarginTop:
          'calc(var(--site-header-h, 4rem) + var(--category-nav-h, 3.25rem) + 0.75rem)',
      }}
    >
      <div className="mb-4 flex items-center gap-3 sm:mb-5">
        <span
          className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl shadow-[0_10px_24px_-16px_rgba(44,29,18,0.7)] ring-1 transition-colors sm:h-12 sm:w-12 sm:text-[22px] ${
            active
              ? 'bg-gold/18 ring-gold/35'
              : 'bg-panel ring-line/70'
          }`}
        >
          {cat.icon}
          {active && (
            <span className="absolute -bottom-0.5 -end-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-bg" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <h3
              id={`cat-title-${cat.id}`}
              className="truncate font-display text-lg leading-tight tracking-wide text-ink sm:text-xl"
            >
              {ar ? cat.ar : cat.en}
            </h3>
            <span className="shrink-0 rounded-full border border-line bg-surface/70 px-2 py-0.5 text-[9px] font-black text-muted">
              {cat.items.length}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[10px] font-semibold tracking-wide text-muted/80">
            {ar ? cat.en : cat.ar}
          </p>
        </div>

        <span className="hidden h-px flex-1 bg-gradient-to-r from-gold/35 via-line to-transparent sm:block" />
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
        {shown.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            index={index}
            onOpen={onOpen}
          />
        ))}
      </div>

      {limit < cat.items.length && (
        <button
          type="button"
          onClick={() => onShowMore(cat.id, limit + SECTION_PAGE)}
          className="btn-ghost mx-auto mt-5 block px-6 py-3 text-[11px]"
        >
          {ar
            ? `عرض المزيد من ${cat.ar} (${shown.length} من ${cat.items.length})`
            : `More ${cat.en} (${shown.length} of ${cat.items.length})`}
        </button>
      )}
    </section>
  )
}

function HomeShell({ route }) {
  const { t, lang, favorites } = useApp()
  const { activeProducts, activeCategories, offers } = useContent()
  const { openProduct, openSearch } = useUI()

  const view =
    route === '/offers' ? 'offers' : route === '/favorites' ? 'favorites' : 'home'

  const [activeCategory, setActiveCategory] = useState(null)
  const [sectionCounts, setSectionCounts] = useState({})
  const [visibleCount, setVisibleCount] = useState(GRID_PAGE)
  const sectionRefs = useRef(new Map())

  /* أقسام المنيو + منتجاتها — من حالة الأدمن مباشرة */
  const categorySections = useMemo(
    () =>
      activeCategories
        .map((cat) => ({
          ...cat,
          items: activeProducts.filter((product) => product.cat === cat.id),
        }))
        .filter((cat) => cat.items.length > 0),
    [activeCategories, activeProducts],
  )

  const favoriteProducts = useMemo(
    () => activeProducts.filter((product) => favorites.includes(product.id)),
    [activeProducts, favorites],
  )

  const flatList = view === 'offers' ? offers : favoriteProducts
  const visibleList = flatList.slice(0, visibleCount)

  /* رجّعنا لأول دفعة عند تبديل العرض */
  useEffect(() => {
    setVisibleCount(GRID_PAGE)
  }, [view])

  /* عند فتح #/menu انزل مباشرة عالمينو */
  useEffect(() => {
    if (route === '/menu') {
      let second = 0
      const first = window.requestAnimationFrame(() => {
        second = window.requestAnimationFrame(() => {
          document.getElementById('menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      })
      return () => {
        window.cancelAnimationFrame(first)
        if (second) window.cancelAnimationFrame(second)
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
    return undefined
  }, [route])

  /* ضمان وجود قسم نشط حتى لو تغيّرت الأقسام من الأدمن */
  useEffect(() => {
    if (view !== 'home') return
    if (!categorySections.some((cat) => cat.id === activeCategory)) {
      setActiveCategory(categorySections[0]?.id ?? null)
    }
  }, [activeCategory, categorySections, view])

  /* Scrollspy — القسم النشط بيتغيّر مع السكرول */
  useEffect(() => {
    if (view !== 'home' || categorySections.length === 0) return undefined

    let frame = 0
    const update = () => {
      frame = 0
      const header = document.querySelector('[data-site-header]')
      const bar = document.getElementById('category-nav')
      const offset =
        (header?.getBoundingClientRect().height || 0) +
        (bar?.getBoundingClientRect().height || 0) +
        14

      let current = categorySections[0].id
      for (const cat of categorySections) {
        const node = sectionRefs.current.get(cat.id)
        if (!node) continue
        if (node.getBoundingClientRect().top <= offset) current = cat.id
        else break
      }
      setActiveCategory((previous) => (previous === current ? previous : current))
    }

    const onScroll = () => {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [categorySections, view])

  const registerSection = (id, node) => {
    if (node) sectionRefs.current.set(id, node)
    else sectionRefs.current.delete(id)
  }

  const handleCategory = (id) => {
    setActiveCategory(id)
    document.getElementById(`cat-${id}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const showMore = (id, nextLimit) => {
    setSectionCounts((previous) => ({ ...previous, [id]: nextLimit }))
  }

  const totalHomeItems = categorySections.reduce((sum, cat) => sum + cat.items.length, 0)
  const totalList = view === 'offers' ? offers.length : favoriteProducts.length
  const headerTitle =
    view === 'favorites' ? t('favorites') : view === 'offers' ? t('offers') : t('menu')

  return (
    <div className="min-h-screen bg-bg">
      {view === 'home' && (
        <CategoryNav
          categories={categorySections}
          active={activeCategory}
          onChange={handleCategory}
        />
      )}

      {view === 'home' && (
        <>
          <Hero category={activeCategory || 'all'} />
          <Gallery />
        </>
      )}

      <section
        id="menu"
        className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:pt-10"
        style={{
          scrollMarginTop:
            'calc(var(--site-header-h, 4rem) + var(--category-nav-h, 3.25rem) + 0.75rem)',
        }}
      >
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold tracking-[0.26em] text-gold-deep uppercase">
              {view === 'home' ? t('heroKicker') : 'BENOVA'}
            </span>
            <h2 className="mt-1 font-display text-2xl tracking-wide text-ink sm:text-3xl">
              {headerTitle}
            </h2>
            <p className="mt-1.5 max-w-md text-[11px] font-semibold leading-relaxed text-muted sm:text-xs">
              {view === 'favorites'
                ? lang === 'ar'
                  ? 'كل الأصناف اللي حبيتها محفوظة هون.'
                  : 'Everything you loved, saved in one place.'
                : view === 'offers'
                  ? lang === 'ar'
                    ? 'أقوى العروض محدّثة مباشرة من لوحة التحكم.'
                    : 'The latest offers, synced directly from the dashboard.'
                  : lang === 'ar'
                    ? 'اختار قسم، تصفّح، واطلب مباشرة عبر واتساب.'
                    : 'Pick a section, browse, and order straight on WhatsApp.'}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-[10px] font-extrabold text-muted">
              {view === 'home' ? totalHomeItems : totalList} {t('results')}
            </span>
            <button
              type="button"
              onClick={openSearch}
              aria-label={lang === 'ar' ? 'بحث سريع' : 'Quick search'}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-gold/8 px-3 py-1.5 text-[10px] font-black text-gold-deep transition-colors hover:border-gold/65 hover:bg-gold/12"
            >
              🔍 {lang === 'ar' ? 'بحث' : 'Search'}
            </button>
          </div>
        </div>

        {view === 'home' ? (
          categorySections.length > 0 ? (
            categorySections.map((cat) => (
              <CategorySection
                key={cat.id}
                cat={cat}
                lang={lang}
                limit={sectionCounts[cat.id] || SECTION_PAGE}
                active={activeCategory === cat.id}
                onShowMore={showMore}
                onOpen={openProduct}
                register={registerSection}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line py-20 text-center">
              <span className="text-5xl">🍽️</span>
              <p className="mt-4 text-sm font-extrabold text-ink">{t('emptyList')}</p>
            </div>
          )
        ) : flatList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line py-20 text-center">
            <span className="text-5xl">{view === 'favorites' ? '💚' : '🎁'}</span>
            <p className="mt-4 text-sm font-extrabold text-ink">
              {view === 'favorites' ? t('favEmpty') : t('noOffers')}
            </p>
            {view === 'favorites' && (
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn-primary mt-4 px-5 py-2.5 text-xs"
              >
                {t('viewMenu')}
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {visibleList.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={index}
                  onOpen={openProduct}
                />
              ))}
            </div>

            {visibleCount < flatList.length && (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + GRID_PAGE)}
                className="btn-ghost mx-auto mt-6 block px-7 py-3.5"
              >
                {lang === 'ar'
                  ? `حمّل المزيد (${visibleList.length} من ${flatList.length})`
                  : `Load more (${visibleList.length} of ${flatList.length})`}
              </button>
            )}
          </>
        )}
      </section>

      <BottomNav />
    </div>
  )
}

/**
 * 🔒 القفل بيغلّف كل شي بما فيه لوحة التحكم:
 * يعني حدا فاصل كلمة سر المنيو ما بيقدر يوصل للأدمن كمان
 * إلا إذا عرف كلمة سر الموقع هي.
 */
function Root() {
  return (
    <PasswordGate>
      <Routed />
    </PasswordGate>
  )
}

/** المحتوى الفعلي (بعد ما يتفتح القفل) */
function Routed() {
  const route = useHashRoute()
  const isAuthPage = route === '/account'

  useEffect(() => {
    if (route === '/menu') return
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [route])

  if (route === '/admin') {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-bg">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-line border-t-primary" />
          </div>
        }
      >
        <Admin />
      </Suspense>
    )
  }

  /* 📄 كل صفحات الموقع بتحصل على الفوتر — ما عدا لوحة التحكم */
  const page =
    route === '/favorites' ? (
      <FavoritesPage />
    ) : route === '/about' ? (
      <AboutPage />
    ) : route === '/faq' ? (
      <FAQPage />
    ) : route === '/reviews' ? (
      <ReviewsPage />
    ) : route === '/contact' ? (
      <ContactPage />
    ) : route === '/account' ? (
      <AccountPage />
    ) : (
      <HomeShell route={route} />
    )

  return (
    <>
      {!isAuthPage && <SiteChrome />}
      {page}
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <ContentProvider>
      <AppProvider>
        <UIProvider>
          <Root />
        </UIProvider>
      </AppProvider>
    </ContentProvider>
  )
}
