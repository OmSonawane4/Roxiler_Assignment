import React, { useState } from 'react'
import { Card, CardContent, TextField, Button, Typography, Box, Alert, InputAdornment, IconButton } from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { api, initSeed } from '../../services/localApi'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer' // customer | store_owner
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validate = () => {
    const errs = {}
    // Name
    if (!formData.username.trim()) {
      errs.username = 'Name is required'
    } else if (formData.username.length < 2) {
      errs.username = 'Name must be at least 2 characters'
    } else if (formData.username.length > 60) {
      errs.username = 'Name must be at most 60 characters'
    }
    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      errs.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      errs.email = 'Please enter a valid email address'
    }
    // Address (optional in original form; enforce max if provided)
    if (formData.address && formData.address.length > 400) {
      errs.address = 'Address must be at most 400 characters'
    }
    // Password
    if (!formData.password) {
      errs.password = 'Password is required'
    } else if (formData.password.length < 8 || formData.password.length > 16) {
      errs.password = 'Password must be 8-16 characters'
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errs.password = 'Password must include at least one uppercase letter'
    } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
      errs.password = 'Password must include at least one special character'
    }
    // Confirm
    if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match'
    }
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validate()) {
      setLoading(false)
      return
    }

    try {
      // Persist user to localStorage through localApi so Login can authenticate later
      initSeed()
      const created = api.addUser({
        name: formData.username,
        email: formData.email,
        address: formData.address || '',
        role: formData.role,
        password: formData.password
      })
      // Option A: redirect to login so user can log in with saved credentials
      navigate('/login')
    } catch (err) {
      setError('Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" component="h1" gutterBottom align="center">
            Register
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
              error={!!fieldErrors.email}
              helperText={fieldErrors.email}
            />
            <TextField
              fullWidth
              label="Address (optional)"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
              error={!!fieldErrors.address}
              helperText={fieldErrors.address}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(v => !v)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              margin="normal"
              required
              error={!!fieldErrors.confirmPassword}
              helperText={fieldErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(v => !v)} edge="end">
                      {showConfirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              select
              fullWidth
              label="Register as"
              name="role"
              value={formData.role}
              onChange={handleChange}
              margin="normal"
              SelectProps={{ native: true }}
            >
              <option value="customer">Customer</option>
              <option value="store_owner">Store Owner</option>
              <option value="admin">Admin</option>
            </TextField>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Register
