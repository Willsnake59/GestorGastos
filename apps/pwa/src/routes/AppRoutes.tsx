import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '../pages/LoginPage'
import { DashboardPage } from '../pages/DashboardPage'
import { MovementsPage } from '../pages/MovementsPage'
import { MovementCreatePage } from '../pages/MovementCreatePage'
import { MovementDetailPage } from '../pages/MovementDetailPage'
import { MovementEditPage } from '../pages/MovementEditPage'
import { DebtsPage } from '../pages/DebtsPage'
import { SavingsPage } from '../pages/SavingsPage'
import { AnalyticsPage } from '../pages/AnalyticsPage'
import { SettingsPage } from '../pages/SettingsPage'
import { HelpPage } from '../pages/HelpPage'
import { NotFoundPage } from '../pages/NotFoundPage'

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="movements" element={<MovementsPage />} />
            <Route path="movements/new" element={<MovementCreatePage />} />
            <Route path="movements/:id" element={<MovementDetailPage />} />
            <Route path="movements/:id/edit" element={<MovementEditPage />} />
            <Route path="debts" element={<DebtsPage />} />
            <Route path="savings" element={<SavingsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
