import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage    from './pages/LandingPage'
import Login          from './pages/Login'
import AdminLayout    from './pages/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import AdminMenu      from './pages/AdminMenu'
import AdminUsers     from './pages/AdminUsers'

function App() {
  const isAuthenticated = !!localStorage.getItem('token')

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"      element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Admin - protected */}
        {!isAuthenticated ? (
          <Route path="/admin/*" element={<Navigate to="/login" />} />
        ) : (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index        element={<AdminDashboard />} />
            <Route path="menu"  element={<AdminMenu />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  )
}

export default App
