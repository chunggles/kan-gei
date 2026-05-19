import axios from 'axios'
import { useState, useEffect } from 'react'
import {
  TextField, Button, Select, MenuItem,
  Table, TableBody, TableCell, TableRow, TableHead,
  Box, Typography, Card, CardContent, Chip, Alert, Snackbar
} from '@mui/material'
import PeopleIcon from '@mui/icons-material/People'
import './AdminUsers.css'

function AdminUsers() {
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [role, setRole]           = useState('staff')
  const [users, setUsers]         = useState([])
  const [jsonUsers, setJsonUsers] = useState([])   // track data.json separately
  const [editId, setEditId]       = useState(null)
  const [editIndex, setEditIndex] = useState(null)
  const [snack, setSnack]         = useState({ open: false, msg: '', severity: 'success' })

  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}')

  useEffect(() => {
    fetchUsers()
  }, [])

  function fetchUsers() {
    axios
      .get('http://localhost:1337/users-db')
      .then((response) => setUsers(response.data))
      .catch((error) => console.error(error))

    // Also fetch JSON users so we can find the correct index
    axios
      .get('http://localhost:1337/users')
      .then((response) => setJsonUsers(response.data))
      .catch((error) => console.error(error))
  }

  const showSnack = (msg, severity = 'success') => {
    setSnack({ open: true, msg, severity })
  }

  // ADD USER 
  async function handleAddUser() {
    if (!name || !email || !password) {
      showSnack('Please fill in all required fields!', 'error')
      return
    }
    try {
      // Save to JSON file
      await axios.post('http://localhost:1337/add-user', { name, email, password, role })

      // Save to MongoDB
      await axios.post('http://localhost:1337/add-user-db', { name, email, password, role })

      showSnack('User added!')
      fetchUsers()
      clearForm()
    } catch (error) {
      console.error(error)
      showSnack(error.response?.data?.message || 'Error adding user.', 'error')
    }
  }

  // EDIT 
  function handleEdit(user, index) {
    if (user._id === loggedInUser.id) {
      showSnack('You cannot edit your own account here.', 'error')
      return
    }

    setName(user.name)
    setEmail(user.email)
    setPassword('')
    setRole(user.role)
    setEditId(user._id)

    const jsonIndex = jsonUsers.findIndex((u) => u.email === user.email)
    setEditIndex(jsonIndex !== -1 ? jsonIndex : index)
  }

  // UPDATE USER 
  async function handleUpdateUser() {
    if (!name || !email) {
      showSnack('Name and email are required!', 'error')
      return
    }
    try {
      const payload = { name, email, role }
      if (password) payload.password = password

      if (editIndex !== null && editIndex !== -1) {
        await axios.put(`http://localhost:1337/edit-user/${editIndex}`, payload)
      }

      await axios.put(`http://localhost:1337/edit-user-db/${editId}`, payload)

      showSnack('User updated')
      fetchUsers()
      clearForm()
    } catch (error) {
      console.error(error)
      showSnack(error.response?.data?.message || 'Error updating user.', 'error')
    }
  }

  // DELETE USER 
  async function handleDelete(userId, userEmail) {
    // Prevent logged-in user from deleting themselves
    if (userId === loggedInUser.id) {
      showSnack('You cannot delete your own account.', 'error')
      return
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this user?')
    if (!confirmDelete) return

    try {
      const jsonIndex = jsonUsers.findIndex((u) => u.email === userEmail)

      if (jsonIndex !== -1) {
        await axios.delete(`http://localhost:1337/delete-user/${jsonIndex}`)
      }

      await axios.delete(`http://localhost:1337/delete-user-db/${userId}`)

      showSnack('User deleted')
      fetchUsers()
    } catch (error) {
      console.error(error)
      showSnack('Error deleting user.', 'error')
    }
  }

  const clearForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setRole('staff')
    setEditId(null)
    setEditIndex(null)
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontFamily: "'Noto Serif JP', serif", color: '#1A1A1A' }}>
        User Management
      </Typography>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 4 }}>
        Manage admin and staff accounts.
      </Typography>

      <div className="users-main-content">

        {/* ── FORM ── */}
        <section className="users-form-section">
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1A1A1A' }}>
                {editId ? '✏️ Edit User' : '➕ Add New User'}
              </Typography>

              <div className="form-group">
                <label>Full Name *</label>
                <TextField fullWidth variant="outlined" size="small"
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name" />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <TextField fullWidth variant="outlined" size="small" type="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address" />
              </div>

              <div className="form-group">
                <label>{editId ? 'New Password (leave blank to keep)' : 'Password *'}</label>
                <TextField fullWidth variant="outlined" size="small" type="password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={editId ? 'Leave blank to keep current' : 'Enter password'} />
              </div>

              <div className="form-group">
                <label>Role *</label>
                <Select value={role} onChange={(e) => setRole(e.target.value)}
                  fullWidth size="small" variant="outlined">
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="staff">Staff</MenuItem>
                </Select>
              </div>

              <div className="form-actions">
                {editId === null ? (
                  <Button variant="contained" fullWidth onClick={handleAddUser}
                    sx={{ bgcolor: '#C0392B', '&:hover': { bgcolor: '#922B21' }, py: 1.3, fontWeight: 700 }}>
                    Add User
                  </Button>
                ) : (
                  <>
                    <Button variant="contained" fullWidth onClick={handleUpdateUser}
                      sx={{ bgcolor: '#C0392B', '&:hover': { bgcolor: '#922B21' }, py: 1.3, fontWeight: 700 }}>
                      Update User
                    </Button>
                    <Button variant="outlined" fullWidth onClick={clearForm} sx={{ mt: 1 }}>
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── TABLE ── */}
        <section className="users-list-section">
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1A1A1A' }}>
                System Users ({users.length})
              </Typography>

              {users.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>
                  <PeopleIcon sx={{ fontSize: 48, mb: 1, color: '#D1D5DB' }} />
                  <Typography>No users found. Add your first user!</Typography>
                </Box>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                      <TableCell><b>Name</b></TableCell>
                      <TableCell><b>Email</b></TableCell>
                      <TableCell><b>Role</b></TableCell>
                      <TableCell><b>Actions</b></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {users.map((user, index) => {
                      const isCurrentUser = user._id === loggedInUser.id
                      return (
                        <TableRow
                          key={user._id}
                          hover
                          sx={{ bgcolor: isCurrentUser ? '#FFF9F9' : 'inherit' }}
                        >
                          <TableCell sx={{ fontWeight: 600 }}>
                            {user.name}
                            {isCurrentUser && (
                              <Chip
                                label="You"
                                size="small"
                                sx={{ ml: 1, bgcolor: '#FEF9E7', color: '#D4AC0D', fontWeight: 600, fontSize: '0.65rem' }}
                              />
                            )}
                          </TableCell>
                          <TableCell sx={{ color: '#6B7280' }}>{user.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={user.role === 'admin' ? 'Admin' : 'Staff'}
                              size="small"
                              sx={{
                                bgcolor: user.role === 'admin' ? '#FADBD8' : '#EBF5FB',
                                color:   user.role === 'admin' ? '#C0392B' : '#2980B9',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="action-buttons">
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleEdit(user, index)}
                                disabled={isCurrentUser}
                                sx={{
                                  bgcolor: isCurrentUser ? '#E5E7EB' : '#2980B9',
                                  '&:hover': { bgcolor: isCurrentUser ? '#E5E7EB' : '#1F618D' },
                                  mr: 1
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleDelete(user._id, user.email)}
                                disabled={isCurrentUser}
                                sx={{
                                  bgcolor: isCurrentUser ? '#E5E7EB' : '#C0392B',
                                  '&:hover': { bgcolor: isCurrentUser ? '#E5E7EB' : '#922B21' },
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </section>
      </div>

      <Snackbar open={snack.open} autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snack.severity} onClose={() => setSnack({ ...snack, open: false })} sx={{ fontWeight: 600 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminUsers
