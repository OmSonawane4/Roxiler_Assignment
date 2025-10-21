import React, { useMemo, useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Layout from './components/Layout'
import StoreList from './pages/StoreList'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminDashboard from './pages/dashboard/AdminDashboard'
import StoreOwnerDashboard from './pages/dashboard/StoreOwnerDashboard'
import UserDashboard from './pages/dashboard/UserDashboard'
import { AuthProvider } from './context/AuthContext'
import ChangePassword from './pages/auth/ChangePassword'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/index'

function App() {
  const [mode, setMode] = useState('light')
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: { main: '#7b1fa2' },
      secondary: { main: '#ff6f00' },
    },
    shape: { borderRadius: 10 },
  }), [mode])

  const toggleTheme = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout onToggleTheme={toggleTheme} themeMode={mode}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/stores" element={<StoreList />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/change-password" element={<ChangePassword />} />
              <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/store-owner" element={<ProtectedRoute role="store_owner"><StoreOwnerDashboard /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
