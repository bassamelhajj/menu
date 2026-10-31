import { AnimatePresence, motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { useContent } from '../store/ContentContext'
import { useUI } from '../store/UIContext'
import { navigate, useHashRoute } from '../lib/hashRoute'
import { IconCart, IconGrid, IconHeart, IconTag } from './icons'

const Item = ({ active, icon, label, badge, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="relative flex flex-1 flex-col items-center gap-1 py-1.5"
  >
    <span
      className={`relative grid h-10 w-12 place-items-center rounded-2xl transition-colors ${
        active ? 'bg-primary/12 text-primary' : 'text-muted'
      }`}
    >
      {icon}
      <AnimatePresence>
        {badge > 0 && (
          <motion.span
            key={badge}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className="absolute -top-0.5 end-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold px-1 text-[10px] font-black text-cocoa shadow"
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
    <span
      className={`text-[10px] font-extrabold tracking-wide ${
        active ? 'text-primary' : 'text-muted'
      }`}
    >
      {label}
    </span>
    {active && (
      <motion.span
        layoutId="bottom-nav-active"
        className="absolute -top-[6px] h-1 w-8 rounded-full bg-gold"
      />
    )}
  </button>
)

export default function BottomNav() {
  const { t, cartCount } = useApp()
  const { offers } = useContent()
  const { cartOpen, openCart } = useUI()
  const route = useHashRoute()

  const isHome = route === '/' || route === '/menu'
  const isFavorites = route === '/favorites'
  const isOffers = route === '/offers'

  const go = (target) => {
    if (route === target) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    navigate(target)
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/80 glass pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex max-w-md items-stretch gap-1 px-3 pt-1.5">
        <Item
          active={isHome && !cartOpen}
          icon={<IconGrid size={21} />}
          label={t('home')}
          onClick={() => go('/')}
        />
        <Item
          active={isFavorites && !cartOpen}
          icon={<IconHeart size={21} filled={isFavorites} />}
          label={t('favorites')}
          onClick={() => go('/favorites')}
        />
        <Item
          active={isOffers && !cartOpen}
          icon={<IconTag size={21} />}
          label={t('offers')}
          badge={offers.length}
          onClick={() => go('/offers')}
        />
        <Item
          active={cartOpen}
          icon={<IconCart size={21} />}
          label={t('cart')}
          badge={cartCount}
          onClick={openCart}
        />
      </div>
    </nav>
  )
}
