import React, { useEffect, useMemo, useState } from 'react'
import { Box, Card, CardContent, Typography, Grid, Rating, TextField, InputAdornment, Avatar, Fade, Button, Divider } from '@mui/material'
import { Search, Store } from '@mui/icons-material'
import { api, initSeed } from '../../services/localApi'
import RatingDialog from '../../components/RatingDialog'

const UserDashboard = () => {
  const [stores, setStores] = useState([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)
  const userId = 3 // demo user id

  useEffect(() => {
    initSeed()
    setStores(api.listStores())
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return stores.filter(s => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q))
  }, [stores, query])

  const getUserRating = (storeId) => api.getUserRatingForStore(storeId, userId)

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Explore Stores</Typography>
      <TextField
        fullWidth
        placeholder="Search by Name or Address..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{ startAdornment: (<InputAdornment position="start"><Search /></InputAdornment>) }}
        sx={{ maxWidth: 520, mb: 2 }}
      />

      <Typography variant="subtitle1" sx={{ mb: 1 }}>Stores List</Typography>
      <Grid container spacing={2}>
        {filtered.map((store, idx) => {
          const ur = getUserRating(store.id)
          return (
            <Grid item xs={12} key={store.id}>
              <Fade in timeout={300 + (idx % 6) * 60}>
                <Card>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2 }} src={`https://picsum.photos/seed/store-${store.id}/64/64`}>
                            <Store />
                          </Avatar>
                          <Box>
                            <Typography variant="h6">{store.name}</Typography>
                            <Typography variant="body2" color="text.secondary">Address: {store.address}</Typography>
                            <Typography variant="caption" color="text.disabled">{store.reviews ? `${store.reviews} ratings` : 'Not rated'}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary">Your Rating</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating value={ur?.rating || 0} readOnly precision={0.5} />
                              <Typography variant="caption" color="text.secondary">{ur ? 'Rated' : 'Not Rated'}</Typography>
                            </Box>
                          </Box>
                          <Button variant={ur ? 'contained' : 'outlined'} onClick={() => { setSelected(store); setOpen(true) }}>
                            {ur ? 'Modify Rating' : 'Submit Rating'}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          )
        })}
      </Grid>

      <RatingDialog
        store={selected || { id: 0, name: '' }}
        onClose={() => setOpen(false)}
        userId={userId}
        onSubmit={(rating, comment) => {
          if (!selected) return
          api.upsertRating({ storeId: selected.id, userId, rating, comment })
          setStores(api.listStores())
          setOpen(false)
        }}
      />
    </Box>
  )
}

export default UserDashboard