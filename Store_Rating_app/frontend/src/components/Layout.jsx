import React from 'react'
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Divider, TextField, InputAdornment } from '@mui/material'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import DashboardIcon from '@mui/icons-material/Dashboard'
import PeopleIcon from '@mui/icons-material/People'
import StoreIcon from '@mui/icons-material/Store'
import LogoutIcon from '@mui/icons-material/Logout'
import SearchIcon from '@mui/icons-material/Search'

const Layout = ({ children, onToggleTheme, themeMode }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const drawerWidth = 220

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Store Rating App
          </Typography>
          <TextField
            size="small"
            placeholder="Search..."
            sx={{ mr: 2, width: 320, display: { xs: 'none', md: 'block' } }}
            InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          />
          <Tooltip title={themeMode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            <IconButton color="inherit" onClick={onToggleTheme} sx={{ mr: 1 }}>
              {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          {user ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body1">
                Welcome, {user.username}
              </Typography>
              <Button color="inherit" onClick={() => navigate('/change-password')}>
                Change Password
              </Button>
              {user.role === 'admin' && (
                <Button color="inherit" onClick={() => navigate('/admin')}>
                  Admin
                </Button>
              )}
              {user.role === 'store_owner' && (
                <Button color="inherit" onClick={() => navigate('/store-owner')}>
                  Store Owner
                </Button>
              )}
              {user.role === 'customer' && (
                <Button color="inherit" onClick={() => navigate('/dashboard')}>
                  My Dashboard
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0, [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' } }}>
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            <ListItemButton onClick={() => navigate('/')}> 
              <ListItemIcon><DashboardIcon /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
            {/* Admin-only Users */}
            {user?.role === 'admin' && (
              <ListItemButton onClick={() => navigate('/admin')}>
                <ListItemIcon><PeopleIcon /></ListItemIcon>
                <ListItemText primary="Users" />
              </ListItemButton>
            )}
            {/* Stores visible to everyone */}
            <ListItemButton onClick={() => navigate('/stores')}>
              <ListItemIcon><StoreIcon /></ListItemIcon>
              <ListItemText primary="Stores" />
            </ListItemButton>
            {/* Optional role shortcuts */}
            {user?.role === 'store_owner' && (
              <ListItemButton onClick={() => navigate('/store-owner')}>
                <ListItemIcon><StoreIcon /></ListItemIcon>
                <ListItemText primary="My Store" />
              </ListItemButton>
            )}
            {user?.role === 'customer' && (
              <ListItemButton onClick={() => navigate('/dashboard')}>
                <ListItemIcon><DashboardIcon /></ListItemIcon>
                <ListItemText primary="My Dashboard" />
              </ListItemButton>
            )}
          </List>
          <Divider />
          <List>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  )
}

export default Layout
