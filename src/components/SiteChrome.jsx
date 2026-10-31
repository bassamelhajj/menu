/**
 * components/SiteChrome.jsx — الهيدر والنوافذ العالمية
 * ===========================================================================
 * بينتركّب مرة واحدة بجذر الموقع (ما عدا الإدارة وصفحة الدخول)، حتى:
 *   • يضل الهيدر موجود بكل الصفحات
 *   • السلة والبحث والمنتج يشتغلوا من أي صفحة بنفس الحالة
 *   • الـ Toast يظهر دايماً
 */
import { AnimatePresence } from 'framer-motion'
import Header from './Header'
import SearchModal from './SearchModal'
import ProductModal from './ProductModal'
import CartDrawer from './CartDrawer'
import ScrollJump from './ScrollJump'
import Toast from './Toast'
import { useUI } from '../store/UIContext'

export default function SiteChrome() {
  const { product, editLine, closeProduct, cartOpen, closeCart } = useUI()

  return (
    <>
      <Header />
      <SearchModal />

      <AnimatePresence>
        {product && (
          <ProductModal
            key={product.id}
            product={product}
            editLine={editLine}
            onClose={closeProduct}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cartOpen && <CartDrawer key="cart" onClose={closeCart} />}
      </AnimatePresence>

      <ScrollJump />
      <Toast />
    </>
  )
}