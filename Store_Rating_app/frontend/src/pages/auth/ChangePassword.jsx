import React, { useState } from 'react'
import { Card, CardContent, TextField, Button, Typography, Box, Alert, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

const ChangePassword = () => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({ current: '', next: '', confirm: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState({ current: false, next: false, confirm: false })

  const validate = () => {
    setError('')
    setSuccess('')
    if (!formData.current || !formData.next || !formData.confirm) {
      setError('All fields are required')
      return false
    }
    if (formData.next !== formData.confirm) {
      setError('New passwords do not match')
      return false
    }
    if (formData.next.length < 8 || formData.next.length > 16) {
      setError('Password must be 8-16 characters')
      return false
    }
    if (!/(?=.*[A-Z])/.test(formData.next)) {
      setError('Password must include at least one uppercase letter')
      return false
    }
    if (!/(?=.*[!@#$%^&*])/.test(formData.next)) {
      setError('Password must include at least one special character')
      return false
    }
    return true
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    // Mock update
    setTimeout(() => {
      setLoading(false)
      setSuccess('Password updated successfully')
      setFormData({ current: '', next: '', confirm: '' })
    }, 700)
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Change Password
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Box component="form" onSubmit={onSubmit}>
            <TextField
              fullWidth
              label="Current Password"
              type={show.current ? 'text' : 'password'}
              value={formData.current}
              onChange={(e) => setFormData({ ...formData, current: e.target.value })}
              margin="normal"
              required
              InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShow({ ...show, current: !show.current })}>{show.current ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={show.next ? 'text' : 'password'}
              value={formData.next}
              onChange={(e) => setFormData({ ...formData, next: e.target.value })}
              margin="normal"
              required
              InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShow({ ...show, next: !show.next })}>{show.next ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={show.confirm ? 'text' : 'password'}
              value={formData.confirm}
              onChange={(e) => setFormData({ ...formData, confirm: e.target.value })}
              margin="normal"
              required
              InputProps={{ endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShow({ ...show, confirm: !show.confirm })}>{show.confirm ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>) }}
            />
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }} disabled={loading}>
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default ChangePassword


