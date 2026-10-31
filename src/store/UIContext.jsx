import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

/**
 * store/UIContext.jsx — الحالة المشتركة لواجهة الموقع
 * ===========================================================================
 * السلة، البحث، ونافذة المنتج صاروا عالميين. هيك زر السلة بالهيدر بيفتح نفس
 * الدرج من أي صفحة، ونتيجة البحث بتفتح نفس نافذة المنتج بدون تكرار المكوّنات.
 * 
 * NEW: دعم وضع التحرير (editLine) لإعادة فتح المودال مع اختيارات المستخدم السابقة.
 */
const UIContext = createContext(null)

export const useUI = () => {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be used inside <UIProvider>')
  return ctx
}

export function UIProvider({ children }) {
  const [cartOpen, setCartOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [product, setProduct] = useState(null)
  const [editLine, setEditLine] = useState(null)

  const openCart = useCallback(() => {
    setSearchOpen(false)
    setProduct(null)
    setEditLine(null)
    setCartOpen(true)
  }, [])

  const closeCart = useCallback(() => setCartOpen(false), [])

  const openSearch = useCallback(() => {
    setCartOpen(false)
    setProduct(null)
    setEditLine(null)
    setSearchOpen(true)
  }, [])

  const closeSearch = useCallback(() => setSearchOpen(false), [])

  const openProduct = useCallback((nextProduct, forEdit = null) => {
    if (!nextProduct) return
    setSearchOpen(false)
    setCartOpen(false)
    setProduct(nextProduct)
    setEditLine(forEdit)
  }, [])

  const closeProduct = useCallback(() => {
    setProduct(null)
    setEditLine(null)
  }, [])

  const value = useMemo(
    () => ({
      cartOpen,
      openCart,
      closeCart,
      searchOpen,
      openSearch,
      closeSearch,
      product,
      editLine,
      openProduct,
      closeProduct,
    }),
    [
      cartOpen,
      openCart,
      closeCart,
      searchOpen,
      openSearch,
      closeSearch,
      product,
      editLine,
      openProduct,
      closeProduct,
    ],
  )

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}