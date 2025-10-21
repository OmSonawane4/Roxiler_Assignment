import React, { useState, useEffect } from 'react'
import {
  Box, TextField, Button, Typography, Alert, FormControl,
  InputLabel, Select, MenuItem, Grid, IconButton, InputAdornment
} from '@mui/material'
import { Visibility, VisibilityOff, Save, Cancel } from '@mui/icons-material'

const UserStoreForm = ({ type, data, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'customer',
    phone: ''
  })
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || '',
        email: data.email || '',
        address: data.address || '',
        password: '',
        role: data.role || 'customer',
        phone: data.phone || ''
      })
    }
  }, [data])

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.length < 20) {
      newErrors.name = 'Name must be at least 20 characters'
    } else if (formData.name.length > 60) {
      newErrors.name = 'Name must be at most 60 characters'
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Address validation
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    } else if (formData.address.length > 400) {
      newErrors.address = 'Address must be at most 400 characters'
    }

    // Password validation (only for new users or when changing password)
    if (!data || formData.password) {
      if (!formData.password.trim()) {
        newErrors.password = 'Password is required'
      } else if (formData.password.length < 8 || formData.password.length > 16) {
        newErrors.password = 'Password must be 8-16 characters'
      } else if (!/(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter'
      } else if (!/(?=.*[!@#$%^&*])/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one special character'
      }
    }

    // Phone validation (for stores)
    if (type === 'store' && !formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    })
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      })
    }
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (validateForm()) {
      onSave(formData)
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={handleChange('name')}
            error={!!errors.name}
            helperText={errors.name}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange('email')}
            error={!!errors.email}
            helperText={errors.email}
            required
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Address"
            multiline
            rows={3}
            value={formData.address}
            onChange={handleChange('address')}
            error={!!errors.address}
            helperText={errors.address}
            required
          />
        </Grid>

        {type === 'user' && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={handleChange('role')}
                label="Role"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="store_owner">Store Owner</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        )}

        {type === 'store' && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={handleChange('phone')}
              error={!!errors.phone}
              helperText={errors.phone}
              required
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={data ? "New Password (leave blank to keep current)" : "Password"}
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange('password')}
            error={!!errors.password}
            helperText={errors.password}
            required={!data}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Cancel />}
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          startIcon={<Save />}
        >
          {data ? 'Update' : 'Create'}
        </Button>
      </Box>
    </Box>
  )
}

export default UserStoreForm
