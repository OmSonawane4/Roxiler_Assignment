import React, { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, Typography, Box, Grid, Button, Rating, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, TextField, InputAdornment } from '@mui/material'
import { Store, Star, TrendingUp, People, Search } from '@mui/icons-material'

const StoreOwnerDashboard = () => {
  const [storeStats, setStoreStats] = useState({ totalStores: 1, totalRatings: 0, averageRating: 0, totalCustomers: 0 })
  const [ratings, setRatings] = useState([])
  const [query, setQuery] = useState('')

  useEffect(() => {
    // Mock single-store perspective
    const mockRatings = [
      { id: 1, user: 'John Doe', rating: 5, comment: 'Excellent service!', date: '2025-09-01' },
      { id: 2, user: 'Amanda Ray', rating: 4, comment: 'Nice atmosphere', date: '2025-09-09' },
      { id: 3, user: 'Mike Johnson', rating: 5, comment: 'Amazing quality', date: '2025-09-10' },
      { id: 4, user: 'Chris Paul', rating: 3, comment: 'Okay experience', date: '2025-09-12' }
    ]
    setRatings(mockRatings)
    const avg = (mockRatings.reduce((s, r) => s + r.rating, 0) / mockRatings.length).toFixed(1)
    setStoreStats({ totalStores: 1, totalRatings: mockRatings.length, averageRating: Number(avg), totalCustomers: mockRatings.length })
  }, [])

  const filteredRatings = useMemo(() => {
    const q = query.toLowerCase()
    return ratings.filter(r => r.user.toLowerCase().includes(q) || r.comment.toLowerCase().includes(q))
  }, [ratings, query])

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Store Owner Dashboard</Typography>
      
      <Box sx={{ maxWidth: 720, mx: 'auto', mb: 3 }}>
        <Card sx={{ background: 'linear-gradient(135deg, #bbdefb 0%, #e1bee7 100%)' }}>
          <CardContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{storeStats.averageRating} / 5</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                <Rating value={Number(storeStats.averageRating)} precision={0.1} readOnly size="large" />
              </Box>
              <Typography color="text.secondary">Average Store Rating</Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h6" gutterBottom>Recent Customer Ratings</Typography>
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User Name</TableCell>
                  <TableCell>User Email</TableCell>
                  <TableCell>Rating Value</TableCell>
                  <TableCell>Date Submitted</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredRatings.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.user}</TableCell>
                    <TableCell>{r.user.toLowerCase().replace(/ /g, '.')}@email.com</TableCell>
                    <TableCell>{r.rating}</TableCell>
                    <TableCell>{r.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}

export default StoreOwnerDashboard
