import axios from 'axios'
import { useState, useEffect } from 'react'
import {
  TextField, Button, Select, MenuItem, Box,
  Table, TableBody, TableCell, TableRow, TableHead,
  Chip, FormControlLabel, Switch, Typography,
  Card, CardContent, Alert, Snackbar
} from '@mui/material'
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate'
import './AdminMenu.css'

const CATEGORIES = [
  'Rice Bowls', 
  'Ramen & Noodles', 
  'Taiyaki', 
  'Combo Meals', 
  'Burgers', 
  'Cold Noodles', 
  'Dango', 
  'Milk Tea', 
  'Drinks'
]

function AdminMenu() {
  const [name, setName]                 = useState('')
  const [description, setDescription]   = useState('')
  const [price, setPrice]               = useState('')
  const [category, setCategory]         = useState('')
  const [available, setAvailable]       = useState(true)
  const [photoFile, setPhotoFile]       = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [menuItems, setMenuItems]       = useState([])
  const [editId, setEditId]             = useState(null)
  const [editIndex, setEditIndex]       = useState(null)
  const [snack, setSnack]               = useState({ open: false, msg: '', severity: 'success' })
  const [loading, setLoading]           = useState(false)

  useEffect(() => {
    fetchMenuItems()
  }, [])

  function fetchMenuItems() {
    axios
      .get('http://localhost:1337/menu-db-all')
      .then((response) => setMenuItems(response.data))
      .catch((error) => console.error(error))
  }

  const showSnack = (msg, severity = 'success') => {
    setSnack({ open: true, msg, severity })
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (event) => setPhotoPreview(event.target.result)
      reader.readAsDataURL(file)
    }
  }

  const clearForm = () => {
    setName('')
    setDescription('')
    setPrice('')
    setCategory('')
    setAvailable(true)
    setPhotoFile(null)
    setPhotoPreview(null)
    setEditId(null)
    setEditIndex(null)
  }

  // ADD MENU ITEM
  async function handleAddItem() {
    if (!name || !description || !price || !category) {
      showSnack('Please fill in all required fields!', 'error')
      return
    }
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('available', available)
      if (photoFile) formData.append('photo', photoFile)

      // Save to JSON file
      await axios.post('http://localhost:1337/add-menu', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Save to MongoDB
      await axios.post('http://localhost:1337/add-menu-db', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      showSnack('Menu item added!')
      fetchMenuItems()
      clearForm()
    } catch (error) {
      console.error(error)
      showSnack('Error adding menu item.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // EDIT
  function handleEdit(item, index) {
    setName(item.name)
    setDescription(item.description)
    setPrice(item.price.toString())
    setCategory(item.category)
    setAvailable(item.available)
    setEditId(item._id)
    setEditIndex(index)
    setPhotoPreview(item.photo ? item.photo : null)
    setPhotoFile(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // UPDATE MENU ITEM
  async function handleUpdateItem() {
    if (!name || !description || !price || !category) {
      showSnack('Please fill in all required fields!', 'error')
      return
    }
    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('name', name)
      formData.append('description', description)
      formData.append('price', price)
      formData.append('category', category)
      formData.append('available', available)
      if (photoFile) formData.append('photo', photoFile)

      // Update JSON file (by index)
      await axios.put(`http://localhost:1337/edit-menu/${editIndex}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      // Update MongoDB (by _id)
      await axios.put(`http://localhost:1337/edit-menu-db/${editId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      showSnack('Menu item updated!')
      fetchMenuItems()
      clearForm()
    } catch (error) {
      console.error(error)
      showSnack('Error updating menu item.', 'error')
    } finally {
      setLoading(false)
    }
  }

  // DELETE MENU ITEM
  async function handleDelete(itemId, index) {
    const confirmDelete = window.confirm('Are you sure you want to delete this menu item?')
    if (!confirmDelete) return
    try {
      // Delete from JSON file (by index)
      await axios.delete(`http://localhost:1337/delete-menu/${index}`)

      // Delete from MongoDB (by _id)
      await axios.delete(`http://localhost:1337/delete-menu-db/${itemId}`)

      showSnack('Menu item deleted')
      fetchMenuItems()
    } catch (error) {
      console.error(error)
      showSnack('Error deleting menu item.', 'error')
    }
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, fontFamily: "'Noto Serif JP', serif", color: '#1A1A1A' }}>
        Menu Management
      </Typography>
      <Typography variant="body2" sx={{ color: '#6B7280', mb: 4 }}>
        Add, edit, or remove dishes. 
      </Typography>

      <div className="menu-main-content">

        {/* ── FORM ── */}
        <section className="menu-form-section">
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: '#1A1A1A' }}>
                {editId ? '✏️ Edit Item' : '➕ Add New Item'}
              </Typography>

              <div className="form-group">
                <label>Dish Name *</label>
                <TextField fullWidth variant="outlined" size="small"
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tonkotsu Ramen" />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <TextField fullWidth variant="outlined" size="small" multiline rows={3}
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the dish..." />
              </div>

              <div className="form-group">
                <label>Price (₱) *</label>
                <TextField fullWidth variant="outlined" size="small" type="number"
                  value={price} onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00" inputProps={{ min: 0, step: '0.01' }} />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}
                  displayEmpty fullWidth size="small" variant="outlined">
                  <MenuItem value=""><em>Select Category</em></MenuItem>
                  {CATEGORIES.map((c) => (
                    <MenuItem key={c} value={c}>{c}</MenuItem>
                  ))}
                </Select>
              </div>

              {/* Photo Upload */}
              <div className="form-group">
                <label>Dish Photo</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange}
                  style={{ display: 'none' }} id="menu-photo-input" />
                <label htmlFor="menu-photo-input">
                  <Button component="span" variant="outlined" fullWidth
                    startIcon={<AddPhotoAlternateIcon />}
                    sx={{ borderStyle: 'dashed', color: '#6B7280', borderColor: '#D1D5DB' }}>
                    {photoFile ? photoFile.name : 'Choose Photo'}
                  </Button>
                </label>
                {photoPreview && (
                  <Box sx={{ textAlign: 'center', mt: 1.5 }}>
                    <img src={photoPreview} alt="Preview"
                      style={{ maxWidth: '100%', maxHeight: 160, borderRadius: 8, border: '2px solid #C0392B', objectFit: 'cover' }} />
                    <Typography variant="caption" sx={{ display: 'block', color: '#6B7280', mt: 0.5 }}>
                      {photoFile ? 'New photo selected' : 'Current photo'}
                    </Typography>
                  </Box>
                )}
              </div>

              {/* Availability Toggle */}
              <div className="form-group">
                <FormControlLabel
                  control={<Switch checked={available} onChange={(e) => setAvailable(e.target.checked)} color="success" />}
                  label={
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {available ? 'Visible on menu' : 'Hidden from menu'}
                    </Typography>
                  }
                />
              </div>

              {/* Actions */}
              <div className="form-actions">
                {editId === null ? (
                  <Button variant="contained" fullWidth onClick={handleAddItem} disabled={loading}
                    sx={{ bgcolor: '#C0392B', '&:hover': { bgcolor: '#922B21' }, py: 1.3, fontWeight: 700 }}>
                    {loading ? 'Adding...' : 'Add Menu Item'}
                  </Button>
                ) : (
                  <>
                    <Button variant="contained" fullWidth onClick={handleUpdateItem} disabled={loading}
                      sx={{ bgcolor: '#C0392B', '&:hover': { bgcolor: '#922B21' }, py: 1.3, fontWeight: 700 }}>
                      {loading ? 'Saving...' : 'Update Item'}
                    </Button>
                    <Button variant="outlined" fullWidth onClick={clearForm} sx={{ mt: 1 }}>
                      Cancel Edit
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* ── TABLE ── */}
        <section className="menu-list-section">
          <Card sx={{ borderRadius: 3, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #E5E7EB' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#1A1A1A' }}>
                Menu Items ({menuItems.length})
              </Typography>

              {menuItems.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6, color: '#9CA3AF' }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>🍱</Typography>
                  <Typography>No menu items yet. Add your first dish!</Typography>
                </Box>
              ) : (
                <div className="menu-table-wrapper">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                        <TableCell><b>Photo</b></TableCell>
                        <TableCell><b>Name</b></TableCell>
                        <TableCell><b>Description</b></TableCell>
                        <TableCell><b>Price</b></TableCell>
                        <TableCell><b>Category</b></TableCell>
                        <TableCell><b>Status</b></TableCell>
                        <TableCell><b>Actions</b></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {menuItems.map((item, index) => (
                        <TableRow key={item._id} hover>
                          <TableCell>
                            {item.photo ? (
                              <img src={item.photo} alt={item.name}
                                style={{ width: 56, height: 56, borderRadius: 8, objectFit: 'cover' }} />
                            ) : (
                              <Box sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                                🍽️
                              </Box>
                            )}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, maxWidth: 140 }}>{item.name}</TableCell>
                          <TableCell sx={{ color: '#6B7280', maxWidth: 200 }}>
                            <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              {item.description}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: '#C0392B', whiteSpace: 'nowrap' }}>
                            ₱{Number(item.price).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Chip label={item.category} size="small"
                              sx={{ bgcolor: '#FEF9E7', color: '#D4AC0D', fontWeight: 600, fontSize: '0.7rem' }} />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={item.available ? 'Visible' : 'Hidden'} size="small"
                              sx={{
                                bgcolor: item.available ? '#D5F5E3' : '#F3F4F6',
                                color:   item.available ? '#27AE60' : '#9CA3AF',
                                fontWeight: 600,
                              }} />
                          </TableCell>
                          <TableCell>
                            <div className="action-buttons">
                              <Button variant="contained" size="small"
                                onClick={() => handleEdit(item, index)}
                                sx={{ bgcolor: '#2980B9', '&:hover': { bgcolor: '#1F618D' }, mr: 1 }}>
                                Edit
                              </Button>
                              <Button variant="contained" size="small"
                                onClick={() => handleDelete(item._id, index)}
                                sx={{ bgcolor: '#C0392B', '&:hover': { bgcolor: '#922B21' } }}>
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
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

export default AdminMenu
