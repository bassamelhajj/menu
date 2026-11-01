import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../store/AppContext'
import { navigate } from '../lib/hashRoute'
import { getAdminSession, logoutAdmin } from '../lib/adminApi'
import AccountPage from './AccountPage'
import AdminShell from './admin/AdminShell'
import DashboardTab from './admin/DashboardTab'
import CategoriesTab from './admin/CategoriesTab'
import ProductsTab from './admin/ProductsTab'
import ExtrasTab from './admin/ExtrasTab'
import OrdersTab from './admin/OrdersTab'
import CustomersTab from './admin/CustomersTab'
import ReviewsTab from './admin/ReviewsTab'
import SettingsTab from './admin/SettingsTab'
import DeliveryTab from './admin/DeliveryTab'
import PagesTab from './admin/PagesTab'
import PublishTab from './admin/PublishTab'

export default function Admin() {
  const { notify, lang } = useApp()
  const [authed, setAuthed] = useState(null)
  const [tab, setTab] = useState('dashboard')

  // الجلسة تُتحقق من السيرفر، وليس من sessionStorage القابل للتلاعب.
  useEffect(() => {
    let alive = true
    getAdminSession()
      .then((result) => {
        if (alive) setAuthed(Boolean(result.data?.authenticated))
      })
      .catch(() => {
        if (alive) setAuthed(false)
      })
    return () => {
      alive = false
    }
  }, [])

  if (authed === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-cocoa text-cream">
        <p className="text-xs font-bold text-cream/60">
          {lang === 'ar' ? 'جارٍ التحقق من الجلسة…' : 'Checking your session…'}
        </p>
      </div>
    )
  }

  // نفس شاشة الدخول الموحّدة — التوجيه للأدمن بيصير من الحساب نفسه.
  if (!authed) return <AccountPage adminEntry onAdminAuthed={() => setAuthed(true)} />

  const logout = async () => {
    await logoutAdmin()
    setAuthed(false)
    navigate('/')
  }

  const content = {
    dashboard: <DashboardTab goTab={setTab} />,
    products: <ProductsTab />,
    categories: <CategoriesTab />,
    extras: <ExtrasTab />,
    orders: <OrdersTab />,
    customers: <CustomersTab />,
    reviews: <ReviewsTab />,
    pages: <PagesTab goTab={setTab} />,
    settings: <SettingsTab notify={notify} />,
    delivery: <DeliveryTab notify={notify} />,
    publish: <PublishTab notify={notify} />,
  }

  return (
    <AdminShell tab={tab} onTab={setTab} onLogout={logout}>
      <motion.div
        key={tab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      >
        {content[tab] || content.dashboard}
      </motion.div>
    </AdminShell>
  )
}
