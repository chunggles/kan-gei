import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, Typography, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Divider
} from '@mui/material'
import DashboardIcon      from '@mui/icons-material/Dashboard'
import MenuBookIcon       from '@mui/icons-material/MenuBook'
import PeopleIcon         from '@mui/icons-material/People'
import LogoutIcon         from '@mui/icons-material/Logout'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import OpenInNewIcon      from '@mui/icons-material/OpenInNew'
import kanGeiLogo from './kangei-logo.png'  // ← NEW

const SIDEBAR_W = 260

const navItems = [
  { label: 'Dashboard',  path: '/admin',       icon: <DashboardIcon /> },
  { label: 'Menu Items', path: '/admin/menu',  icon: <MenuBookIcon /> },
  { label: 'Users',      path: '/admin/users', icon: <PeopleIcon /> },
]

function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user     = JSON.parse(localStorage.getItem('user') || '{}')

  const handleSignOut = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* ── SIDEBAR ── */}
      <Box sx={{
        width: SIDEBAR_W, flexShrink: 0,
        background: 'linear-gradient(180deg, #1A1A1A 0%, #2C2C2C 100%)',
        color: '#fff', display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, height: '100vh',
        zIndex: 100, boxShadow: '2px 0 12px rgba(0,0,0,0.3)',
      }}>
        {/* Brand */}
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <img src={kanGeiLogo} alt="Kan-Gei Logo" style={{ width: 40, height: 40, objectFit: 'contain' }} />
            <Typography sx={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 700, fontSize: '1.3rem' }}>
              Kan-Gei
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', letterSpacing: 2, display: 'block' }}>
            ADMIN PANEL
          </Typography>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', mt: 1, display: 'block' }}>
            {user.name || 'Admin'}
          </Typography>
        </Box>

        {/* Nav */}
        <List sx={{ flex: 1, px: 1.5, pt: 2 }}>
          {navItems.map((item) => {
            const active = location.pathname === item.path
            return (
              <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: 2,
                    color: active ? '#fff' : 'rgba(255,255,255,0.65)',
                    background: active ? 'rgba(192,57,43,0.85)' : 'transparent',
                    '&:hover': {
                      background: active ? 'rgba(192,57,43,0.85)' : 'rgba(255,255,255,0.06)',
                      color: '#fff',
                    },
                    transition: 'all 0.2s',
                  }}
                >
                  <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}>{item.icon}</ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: active ? 600 : 400, fontSize: '0.95rem' }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', my: 2 }} />

          {/* View Site */}
          <ListItem disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton component="a" href="/" target="_blank" sx={{
              borderRadius: 2, color: 'rgba(255,255,255,0.55)',
              '&:hover': { background: 'rgba(255,255,255,0.06)', color: '#fff' },
            }}>
              <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}><OpenInNewIcon /></ListItemIcon>
              <ListItemText primary="View Website" primaryTypographyProps={{ fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>

          {/* Sign Out */}
          <ListItem disablePadding>
            <ListItemButton onClick={handleSignOut} sx={{
              borderRadius: 2, color: 'rgba(255,255,255,0.55)',
              '&:hover': { background: 'rgba(192,57,43,0.2)', color: '#C0392B' },
            }}>
              <ListItemIcon sx={{ color: 'inherit', minWidth: 38 }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize: '0.95rem' }} />
            </ListItemButton>
          </ListItem>
        </List>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.08)', textAlign: 'center' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.25)' }}>
            © 2026 Kan-Gei Restaurant
          </Typography>
        </Box>
      </Box>

      {/* ── MAIN CONTENT ── */}
      <Box sx={{
        ml: `${SIDEBAR_W}px`, flex: 1, minHeight: '100vh',
        background: 'linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)',
        overflow: 'auto',
      }}>
        <Outlet />
      </Box>
    </Box>
  )
}

export default AdminLayout
