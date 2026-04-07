import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import { Sidebar } from './components/layout/Sidebar'
import { MobileNav } from './components/layout/MobileNav'
import { ROUTES } from './lib/constants'

import LoginPage from './app/(auth)/login'
import RegisterPage from './app/(auth)/register'

const ElderDashboard = React.lazy(() => import('./app/dashboard/index'))
const CaregiverDashboard = React.lazy(() => import('./app/dashboard/caregiver'))
const DoctorDashboard = React.lazy(() => import('./app/dashboard/doctor'))
const FamilyDashboard = React.lazy(() => import('./app/dashboard/family'))

const DashboardRouter: React.FC = () => {
  const { user } = useAuthStore()
  
  if (user?.role === 'caregiver') return <CaregiverDashboard />
  if (user?.role === 'doctor') return <DoctorDashboard />
  if (user?.role === 'family') return <FamilyDashboard />
  return <ElderDashboard />
}
const ElderPage = React.lazy(() => import('./app/elder/[id]'))
const CaregiversPage = React.lazy(() => import('./app/caregivers/index'))
const DoctorsPage = React.lazy(() => import('./app/doctors/index'))
const MedicationsPage = React.lazy(() => import('./app/medications/index'))
const DocumentsPage = React.lazy(() => import('./app/documents/index'))
const ExpensesPage = React.lazy(() => import('./app/expenses/index'))
const AlertsPage = React.lazy(() => import('./app/alerts/index'))
const CompanionPage = React.lazy(() => import('./app/companion/index'))

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="hidden md:flex">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-auto pb-16 md:pb-0">
        <React.Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        }>
          {children}
        </React.Suspense>
      </main>
      <MobileNav />
    </div>
  )
}

export default function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path={ROUTES.LOGIN} element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} /> : <LoginPage />} />
        <Route path={ROUTES.REGISTER} element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} /> : <RegisterPage />} />

        <Route path={ROUTES.DASHBOARD} element={<ProtectedLayout><DashboardRouter /></ProtectedLayout>} />
        <Route path={ROUTES.ELDER} element={<ProtectedLayout><ElderPage /></ProtectedLayout>} />
        <Route path={ROUTES.CAREGIVERS} element={<ProtectedLayout><CaregiversPage /></ProtectedLayout>} />
        <Route path={ROUTES.DOCTORS} element={<ProtectedLayout><DoctorsPage /></ProtectedLayout>} />
        <Route path={ROUTES.MEDICATIONS} element={<ProtectedLayout><MedicationsPage /></ProtectedLayout>} />
        <Route path={ROUTES.DOCUMENTS} element={<ProtectedLayout><DocumentsPage /></ProtectedLayout>} />
        <Route path={ROUTES.EXPENSES} element={<ProtectedLayout><ExpensesPage /></ProtectedLayout>} />
        <Route path={ROUTES.ALERTS} element={<ProtectedLayout><AlertsPage /></ProtectedLayout>} />
        <Route path={ROUTES.COMPANION} element={<ProtectedLayout><CompanionPage /></ProtectedLayout>} />

        <Route path="/" element={<Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} />} />
      </Routes>
    </>
  )
}