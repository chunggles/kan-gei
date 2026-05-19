import axios from 'axios'
import { useState } from 'react'
import {
  Button, TextField, Box, Typography, Container, CssBaseline, Alert
} from '@mui/material'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import kanGeiLogo from './kangei-logo.png'  // ← NEW

const theme = createTheme({
  palette: { primary: { main: '#C0392B' } },
})

function Login() {
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(event.currentTarget)
    const email    = formData.get('email')?.toString().trim()
    const password = formData.get('password')?.toString()

    if (!email || !password) {
      setError('Please enter both email and password.')
      setLoading(false)
      return
    }

    try {
      const response = await axios.post('http://localhost:1337/login', { email, password })
      const data = response.data

      localStorage.setItem('token', data.user.id)
      localStorage.setItem('user', JSON.stringify({
        id:    data.user.id,
        name:  data.user.name,
        email: data.user.email,
        role:  data.user.role,
      }))

      window.location.href = '/admin'
    } catch (err) {
      console.error('Login Error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Unable to reach the server. Please check if your backend is running.')
      }
      setLoading(false)
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 50%, #C0392B22 100%)',
        }}
      >
        <CssBaseline />
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              p: 4,
              boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
              borderRadius: 3,
              bgcolor: 'white',
            }}
          >
            {/* Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
              <img src={kanGeiLogo} alt="Kan-Gei Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontFamily: "'Noto Serif JP', serif", fontWeight: 700, lineHeight: 1, color: '#1A1A1A' }}
                >
                  Kan-Gei
                </Typography>
                
              </Box>
            </Box>

            <Typography variant="body2" sx={{ color: '#6B7280', mb: 3 }}>
              Admin Panel - Sign in to continue
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
              <TextField
                margin="normal" required fullWidth
                id="email" label="Email Address" name="email"
                autoComplete="email" autoFocus
              />
              <TextField
                margin="normal" required fullWidth
                name="password" label="Password" type="password"
                id="password" autoComplete="current-password"
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
              )}

              <Button
                type="submit" fullWidth variant="contained" color="primary"
                disabled={loading}
                sx={{ mt: 3, mb: 2, py: 1.3, fontWeight: 700, fontSize: '1rem' }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>

              <Button
                fullWidth variant="outlined" href="/"
                sx={{ color: '#6B7280', borderColor: '#D1D5DB' }}
              >
                Back to Website
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  )
}

export default Login
