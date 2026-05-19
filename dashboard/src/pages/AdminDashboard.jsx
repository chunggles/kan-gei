import { useState, useEffect } from 'react'
import axios from 'axios'
import { Box, Typography, Grid, Card, CardContent, Chip } from '@mui/material'
import MenuBookIcon    from '@mui/icons-material/MenuBook'
import PeopleIcon      from '@mui/icons-material/People'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CategoryIcon    from '@mui/icons-material/Category'

function AdminDashboard() {
  const [menuItems, setMenuItems] = useState([])
  const [users, setUsers]         = useState([])
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    axios.get('http://localhost:1337/menu-db-all')
      .then((res) => setMenuItems(res.data))
      .catch(console.error)

    axios.get('http://localhost:1337/users-db')
      .then((res) => setUsers(res.data))
      .catch(console.error)
  }, [])

  const availableCount = menuItems.filter(i => i.available).length
  const categories     = [...new Set(menuItems.map(i => i.category))].length

  const stats = [
    { label: 'Total Menu Items', value: menuItems.length, icon: <MenuBookIcon    sx={{ fontSize: 32, color: '#C0392B' }} />, color: '#FADBD8' },
    { label: 'Available Items',  value: availableCount,   icon: <CheckCircleIcon sx={{ fontSize: 32, color: '#27AE60' }} />, color: '#D5F5E3' },
    { label: 'Categories',       value: categories,       icon: <CategoryIcon    sx={{ fontSize: 32, color: '#D4AC0D' }} />, color: '#FEF9E7' },
    { label: 'System Users',     value: users.length,     icon: <PeopleIcon      sx={{ fontSize: 32, color: '#2980B9' }} />, color: '#D6EAF8' },
  ]

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A1A1A', fontFamily: "'Noto Serif JP', serif" }}>
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: '#6B7280', mt: 0.5 }}>
          Welcome back, {user.name || 'Admin'} 👋
        </Typography>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} lg={3} key={s.label}>
            <Card sx={{
              borderRadius: 3, border: '1px solid #E5E7EB',
              boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }
            }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 3 }}>
                <Box sx={{ width: 60, height: 60, borderRadius: 2, bgcolor: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1A1A1A', lineHeight: 1 }}>
                    {s.value}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6B7280', mt: 0.5 }}>
                    {s.label}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recent Items */}
      <Card sx={{ borderRadius: 3, border: '1px solid #E5E7EB', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1A1A1A' }}>
            Recent Menu Items
          </Typography>

          {menuItems.length === 0 ? (
            <Typography variant="body2" sx={{ color: '#9CA3AF', textAlign: 'center', py: 4 }}>
              No menu items yet. Add your first item!
            </Typography>
          ) : (
            menuItems.slice(0, 5).map((item) => (
              <Box key={item._id} sx={{
                display: 'flex', alignItems: 'center', gap: 2,
                py: 1.5, borderBottom: '1px solid #F3F4F6',
                '&:last-child': { borderBottom: 'none' }
              }}>
                {item.photo ? (
                  <img
                    src={item.photo}
                    alt={item.name}
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                ) : (
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                    🍱
                  </Box>
                )}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>{item.name}</Typography>
                  <Typography variant="caption" sx={{ color: '#6B7280' }}>{item.category}</Typography>
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 700, color: '#C0392B' }}>
                  ₱{Number(item.price).toFixed(2)}
                </Typography>
                <Chip
                  label={item.available ? 'Available' : 'Hidden'}
                  size="small"
                  sx={{
                    bgcolor: item.available ? '#D5F5E3' : '#F3F4F6',
                    color:   item.available ? '#27AE60' : '#6B7280',
                    fontWeight: 600,
                  }}
                />
              </Box>
            ))
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default AdminDashboard
