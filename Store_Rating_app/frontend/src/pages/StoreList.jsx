import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, Typography, Button, Box, Rating, Chip, TextField, InputAdornment, MenuItem, Grid, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Avatar, Fade } from '@mui/material'
import { Star, Search, Store, Place, Phone, Email } from '@mui/icons-material'
// inline rating UI (no modal)
import { api as localApi, initSeed as initLocalSeed } from '../services/localApi'
import { useAuth } from '../context/AuthContext'

const StoreList = () => {
  const [stores, setStores] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('name')
  const [sortDir, setSortDir] = useState('asc')
  const [selectedStore, setSelectedStore] = useState(null)
  const [ratingDialogOpen, setRatingDialogOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const { user } = useAuth()

  // Add-store dialog state
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', address: '', phone: '', email: '' })
  const [formErr, setFormErr] = useState({})
  const [adding, setAdding] = useState(false)

  // Inline rating editor state
  const [editingId, setEditingId] = useState(null)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState('')
  useEffect(() => {
    initLocalSeed()
    const locals = localApi.listStores()
    setStores(locals)
    setLoading(false)
  }, [])
  // Migration removed in local-only mode
  const openEditor = async (store) => {
    setEditingId(store.id)
    const mine = localApi.getUserRatingForStore(store.id, user?.id || 3)
    setMyRating(mine?.rating || 0)
    setMyComment(mine?.comment || '')
  }

  const submitRating = async (store) => {
    localApi.upsertRating({ storeId: store.id, userId: user?.id || 3, rating: myRating || 0, comment: myComment })
    const refreshed = localApi.listStores()
    setStores(refreshed)
    setEditingId(null)
    setMyComment('')
  }

  const filteredAndSorted = useMemo(() => {
    const q = (query || '').toString().toLowerCase().trim()
    const safe = (v) => (v ?? '').toString().toLowerCase()
    // Remove duplicates by name (keep first occurrence)
    const unique = []
    const seen = new Set()
    for (const s of stores) {
      const key = (s.name || '').toLowerCase()
      if (!seen.has(key)) { seen.add(key); unique.push(s) }
    }
    const filtered = unique.filter(s => safe(s.name).includes(q) || safe(s.address).includes(q))
    const dir = sortDir === 'desc' ? -1 : 1
    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name) * dir
      if (sortBy === 'rating') return (Number(a.rating || 0) - Number(b.rating || 0)) * dir
      if (sortBy === 'reviews') return (Number(a.reviews || 0) - Number(b.reviews || 0)) * dir
      return 0
    })
    return sorted
  }, [stores, query, sortBy, sortDir])

  const canDelete = (store) => {
    if (!user) return false
    if (user.role === 'admin') return true
    // Local stores use owner name
    return user.role === 'store_owner' && store?.owner && (user?.username || user?.name) && store.owner === (user.username || user.name)
  }
  const handleDelete = async (store) => {
    if (!canDelete(store)) return
    localApi.deleteStore(store.id)
    const refreshed = localApi.listStores()
    setStores(refreshed)
  }

  const handleAddStore = async () => {
    if (!user || (user.role !== 'store_owner' && user.role !== 'admin')) return
    const errs = {}
    if (!form.name?.trim()) errs.name = 'Name is required'
    if (!form.address?.trim()) errs.address = 'Address is required'
    setFormErr(errs)
    if (Object.keys(errs).length) return

    // Local add with owner name
    const payload = { ...form, owner: (user?.username || user?.name || 'Owner') }
    try {
      setAdding(true)
      localApi.addStore(payload)
      const refreshed = localApi.listStores()
      setStores(refreshed)
      setForm({ name: '', description: '', address: '', phone: '', email: '' })
      setFormErr({})
      setAddOpen(false)
    } catch (e) {
      setFormErr({ general: 'Failed to add store. Please try again.' })
    } finally {
      setAdding(false)
    }
  }

  if (loading) {
    return <Typography>Loading stores...</Typography>
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Store Directory
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body1" color="text.secondary">
          Discover and rate your favorite stores
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {(user?.role === 'store_owner' || user?.role === 'admin') && (
            <Button size="small" variant="contained" onClick={() => setAddOpen(true)}>Add store</Button>
          )}
          {/* Migration button removed to keep previous local behavior */}
        </Box>
      </Box>
      {/* Controls */}
      <Grid container spacing={2} sx={{ mt: 1, mb: 1 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Search by name or address"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField select label="Sort by" fullWidth value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="rating">Rating</MenuItem>
            <MenuItem value="reviews">Reviews</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={6} md={3}>
          <TextField select label="Direction" fullWidth value={sortDir} onChange={(e) => setSortDir(e.target.value)}>
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {filteredAndSorted.map((store, idx) => (
          <Grid item xs={12} md={6} lg={4} key={store.id}>
            <Fade in timeout={400 + (idx % 6) * 80}>
              <Card sx={{
                height: '100%',
                background: (() => {
                  const gradients = [
                    'linear-gradient(180deg, rgba(25,118,210,0.08) 0%, rgba(25,118,210,0.02) 100%)',
                    'linear-gradient(180deg, rgba(220,0,78,0.08) 0%, rgba(220,0,78,0.02) 100%)',
                    'linear-gradient(180deg, rgba(67,233,123,0.12) 0%, rgba(56,249,215,0.06) 100%)',
                    'linear-gradient(180deg, rgba(240,147,251,0.12) 0%, rgba(245,87,108,0.06) 100%)',
                    'linear-gradient(180deg, rgba(79,172,254,0.12) 0%, rgba(0,242,254,0.06) 100%)',
                    'linear-gradient(180deg, rgba(255,193,7,0.12) 0%, rgba(255,213,79,0.06) 100%)'
                  ]
                  return gradients[idx % gradients.length]
                })(),
                border: '1px solid',
                borderColor: 'divider',
                transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: 6 }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 1 }} src={`https://picsum.photos/seed/store-${store.id}/64/64`}>
                      <Store />
                    </Avatar>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                      {store.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {store.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, color: 'text.secondary' }}>
                    <Place fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{store.address}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, color: 'text.secondary' }}>
                    <Phone fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{store.phone}</Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Rating value={Number(store.rating) || 0} precision={0.1} readOnly />
                    <Chip size="small" color="primary" label={`${Number(store.rating || 0).toFixed(1)}`} />
                    <Typography variant="body2" color="text.secondary">
                      ({store.reviews || 0} reviews)
                    </Typography>
                  </Box>

                  {/* Your rating summary */}
                  {user && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">Your Rating</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={localApi.getUserRatingForStore(store.id, user?.id || 3)?.rating || 0} readOnly size="small" />
                        <Chip size="small" variant="outlined" label={localApi.getUserRatingForStore(store.id, user?.id || 3) ? 'Rated' : 'Not rated'} />
                      </Box>
                    </Box>
                  )}
                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="contained" size="small" onClick={() => { setSelectedStore(store); setDetailsOpen(true) }}>
                      View Details
                    </Button>
                    <Button variant="outlined" size="small" onClick={() => openEditor(store)}>
                      {localApi.getUserRatingForStore(store.id, user?.id || 3) ? 'Modify Rating' : 'Rate Store'}
                    </Button>
                    {canDelete(store) && (
                      <Button color="error" variant="text" size="small" onClick={() => handleDelete(store)}>
                        Delete
                      </Button>
                    )}
                  </Box>

                  {/* Inline rating editor */}
                  {editingId === store.id && (
                    <Box sx={{ mt: 1.5, p: 1.5, border: '1px dashed', borderColor: 'divider', borderRadius: 1.5 }}>
                      <Rating value={myRating} onChange={(_, v) => setMyRating(v)} size="large" />
                      <TextField
                        placeholder="Comment (optional)"
                        value={myComment}
                        onChange={(e) => setMyComment(e.target.value)}
                        multiline rows={2} fullWidth sx={{ mt: 1 }}
                      />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
                        <Button onClick={() => { setEditingId(null); setMyComment('') }}>
                          Cancel
                        </Button>
                        <Button variant="contained" onClick={() => submitRating(store)}>
                          Submit
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>


      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
              <Store />
            </Avatar>
            {selectedStore?.name}
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedStore && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Rating value={Number(selectedStore.rating) || 0} precision={0.1} readOnly />
                <Chip size="small" label={`${Number(selectedStore.rating || 0).toFixed(1)} avg`} color="warning" />
                <Chip size="small" label={`${selectedStore.reviews || 0} reviews`} variant="outlined" />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                {selectedStore.description}
              </Typography>
              <Divider sx={{ mb: 1.5 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 1, columnGap: 1 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Place fontSize="small" style={{ marginRight: 6 }} /> Address
                </Typography>
                <Typography variant="body2">{selectedStore.address}</Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Phone fontSize="small" style={{ marginRight: 6 }} /> Phone
                </Typography>
                <Typography variant="body2">{selectedStore.phone}</Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Email fontSize="small" style={{ marginRight: 6 }} /> Email
                </Typography>
                <Typography variant="body2">{selectedStore.email || 'contact@store.com'}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button variant="contained" onClick={() => { setDetailsOpen(false); setRatingDialogOpen(true) }}>Rate</Button>
        </DialogActions>
      </Dialog>

      {/* Add Store Dialog (Store Owners) */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add a new store</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.2, mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required error={!!formErr.name} helperText={formErr.name} />
            <TextField label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} multiline rows={2} />
            <TextField label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required error={!!formErr.address} helperText={formErr.address} />
            <TextField label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <TextField label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {formErr.general && (
              <Typography variant="body2" color="error">{formErr.general}</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddStore} disabled={!user || (user.role !== 'store_owner' && user.role !== 'admin') || adding}>{adding ? 'Adding...' : 'Add Store'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StoreList
