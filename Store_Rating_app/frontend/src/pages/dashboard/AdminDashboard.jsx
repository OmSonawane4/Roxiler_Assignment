import React, { useState, useEffect } from 'react'
import { 
  Card, CardContent, Typography, Box, Grid, Button, Chip, 
  Tabs, Tab, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, TextField, InputAdornment,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Menu, MenuItem, Avatar, Rating, Alert, Snackbar, Divider
} from '@mui/material'
import { 
  People, Store, Star, TrendingUp, Add, Search, FilterList,
  Edit, Delete, Visibility, AdminPanelSettings, Storefront,
  Person, Email, LocationOn, Phone, MoreVert
} from '@mui/icons-material'
import { initSeed, api } from '../../services/localApi'

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0,
    averageRating: 0
  })
  const [users, setUsers] = useState([])
  const [stores, setStores] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [filteredStores, setFilteredStores] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [searchEmail, setSearchEmail] = useState('')
  const [searchAddress, setSearchAddress] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogType, setDialogType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [userDetailsOpen, setUserDetailsOpen] = useState(false)

  // Mock data initialization
  useEffect(() => {
    initSeed()
    const mockUsers = [
      ...api.listUsers()
    ]

    const mockStores = [
      ...api.listStores()
    ]

    setUsers(mockUsers)
    setStores(mockStores)
    setFilteredUsers(mockUsers)
    setFilteredStores(mockStores)
    
    const totalRatings = mockStores.reduce((sum, s) => sum + (s.reviews || 0), 0)
    const averageRating = mockStores.length ?
      (mockStores.reduce((sum, s) => sum + (s.rating || 0), 0) / mockStores.length).toFixed(1) : 0
    setStats({
      totalUsers: mockUsers.length,
      totalStores: mockStores.length,
      totalRatings,
      averageRating: Number(averageRating)
    })
  }, [])

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const recomputeUsersFilter = (term, emailTerm, addrTerm, role) => {
    const t = term.toLowerCase(), e = emailTerm.toLowerCase(), a = addrTerm.toLowerCase()
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(t) &&
      user.email.toLowerCase().includes(e) &&
      user.address.toLowerCase().includes(a) &&
      (role === 'all' || user.role === role)
    )
    setFilteredUsers(filtered)
  }

  const recomputeStoresFilter = (term, emailTerm, addrTerm) => {
    const t = term.toLowerCase(), e = emailTerm.toLowerCase(), a = addrTerm.toLowerCase()
    const filtered = stores.filter(store => 
      (store.name.toLowerCase().includes(t)) &&
      (store.email.toLowerCase().includes(e)) &&
      (store.address.toLowerCase().includes(a))
    )
    setFilteredStores(filtered)
  }

  const handleSearch = (event) => {
    const term = event.target.value
    setSearchTerm(term)
    if (activeTab === 0) recomputeUsersFilter(term, searchEmail, searchAddress, filterRole)
    else recomputeStoresFilter(term, searchEmail, searchAddress)
  }

  const handleSearchEmail = (event) => {
    const term = event.target.value
    setSearchEmail(term)
    if (activeTab === 0) recomputeUsersFilter(searchTerm, term, searchAddress, filterRole)
    else recomputeStoresFilter(searchTerm, term, searchAddress)
  }

  const handleSearchAddress = (event) => {
    const term = event.target.value
    setSearchAddress(term)
    if (activeTab === 0) recomputeUsersFilter(searchTerm, searchEmail, term, filterRole)
    else recomputeStoresFilter(searchTerm, searchEmail, term)
  }

  const handleFilterChange = (event) => {
    const role = event.target.value
    setFilterRole(role)
    recomputeUsersFilter(searchTerm, searchEmail, searchAddress, role)
  }

  const handleAddNew = (type) => {
    setDialogType(type)
    setSelectedItem(null)
    setOpenDialog(true)
  }

  const handleEdit = (item, type) => {
    setDialogType(type)
    setSelectedItem(item)
    setOpenDialog(true)
  }

  const handleView = (item) => {
    setSelectedItem(item)
    setUserDetailsOpen(true)
  }

  const handleDelete = (id, type) => {
    if (type === 'user') {
      setUsers(users.filter(user => user.id !== id))
      setFilteredUsers(filteredUsers.filter(user => user.id !== id))
    } else {
      setStores(stores.filter(store => store.id !== id))
      setFilteredStores(filteredStores.filter(store => store.id !== id))
    }
    setSnackbar({ open: true, message: `${type === 'user' ? 'User' : 'Store'} deleted successfully`, severity: 'success' })
  }

  const handleCloseDialog = () => {
    setOpenDialog(false)
    setSelectedItem(null)
  }

  const handleSave = (data) => {
    if (dialogType === 'user') {
      if (selectedItem) {
        // Edit existing user
        api.updateUser(selectedItem.id, data)
        const updatedUsers = api.listUsers()
        setUsers(updatedUsers)
        setFilteredUsers(updatedUsers)
      } else {
        // Add new user
        api.addUser(data)
        const updatedUsers = api.listUsers()
        setUsers(updatedUsers)
        setFilteredUsers(updatedUsers)
      }
    } else {
      if (selectedItem) {
        // Edit existing store
        api.updateStore(selectedItem.id, data)
        const updatedStores = api.listStores()
        setStores(updatedStores)
        setFilteredStores(updatedStores)
      } else {
        // Add new store
        api.addStore({ ...data, owner: 'Admin' })
        const updatedStores = api.listStores()
        setStores(updatedStores)
        setFilteredStores(updatedStores)
      }
    }
    // update stats reactively
    setStats((prev) => ({
      ...prev,
      totalUsers: dialogType === 'user' ? (selectedItem ? prev.totalUsers : prev.totalUsers + 1) : prev.totalUsers,
      totalStores: dialogType === 'store' ? (selectedItem ? prev.totalStores : prev.totalStores + 1) : prev.totalStores,
    }))

    setSnackbar({ open: true, message: `${dialogType === 'user' ? 'User' : 'Store'} ${selectedItem ? 'updated' : 'added'} successfully`, severity: 'success' })
    handleCloseDialog()
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: 'text.primary' }}>
        System Administrator Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Complete control over your store rating platform
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2, background: 'linear-gradient(135deg, #90caf9 0%, #b39ddb 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                  <People />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.totalUsers}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Users</Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2, background: 'linear-gradient(135deg, #a5d6a7 0%, #80cbc4 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                  <Store />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.totalStores}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Stores</Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2, background: 'linear-gradient(135deg, #ffe082 0%, #ffab91 100%)', color: 'white' }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                  <Star />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.totalRatings}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Ratings</Typography>
                </Box>
              </Box>
            </Box>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            color: 'white',
            '&:hover': { transform: 'translateY(-4px)', transition: 'all 0.3s ease' }
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.averageRating}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Avg Rating</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Management Tabs */}
      <Card sx={{ mt: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="👥 User Management" />
            <Tab label="🏪 Store Management" />
          </Tabs>
        </Box>

        <CardContent>
          {/* Search and Filter Controls */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            <TextField
              placeholder={activeTab === 0 ? 'Filter by email' : 'Filter store email'}
              value={searchEmail}
              onChange={handleSearchEmail}
              sx={{ minWidth: 200 }}
            />
            <TextField
              placeholder={activeTab === 0 ? 'Filter by address' : 'Filter store address'}
              value={searchAddress}
              onChange={handleSearchAddress}
              sx={{ minWidth: 220 }}
            />
            {activeTab === 0 && (
              <TextField
                select
                label="Filter by Role"
                value={filterRole}
                onChange={handleFilterChange}
                sx={{ minWidth: 150 }}
              >
                <MenuItem value="all">All Roles</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="store_owner">Store Owner</MenuItem>
                <MenuItem value="customer">Customer</MenuItem>
              </TextField>
            )}
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleAddNew(activeTab === 0 ? 'user' : 'store')}
              sx={{ ml: 'auto' }}
            >
              Add {activeTab === 0 ? 'User' : 'Store'}
            </Button>
          </Box>

          {/* Users Table */}
          {activeTab === 0 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'primary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Address</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rating</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          {user.name}
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.address}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          color={user.role === 'admin' ? 'error' : user.role === 'store_owner' ? 'warning' : 'default'}
                          icon={user.role === 'admin' ? <AdminPanelSettings /> : user.role === 'store_owner' ? <Storefront /> : <Person />}
                        />
                      </TableCell>
                      <TableCell>
                        {user.rating ? (
                          <Rating value={user.rating} precision={0.1} readOnly size="small" />
                        ) : (
                          <Typography variant="body2" color="text.secondary">N/A</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleView(user)}>
                            <Visibility />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleEdit(user, 'user')}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(user.id, 'user')}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Stores Table */}
          {activeTab === 1 && (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'secondary.main' }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Store Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Email</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Address</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Owner</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rating</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStores.map((store) => (
                    <TableRow key={store.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ mr: 2, bgcolor: 'secondary.main' }}>
                            <Store />
                          </Avatar>
                          {store.name}
                        </Box>
                      </TableCell>
                      <TableCell>{store.email}</TableCell>
                      <TableCell>{store.address}</TableCell>
                      <TableCell>{store.owner}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Rating value={store.rating} precision={0.1} readOnly size="small" />
                          <Typography variant="body2" sx={{ ml: 1 }}>({store.rating})</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton size="small" onClick={() => handleEdit(store, 'store')}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(store.id, 'store')}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedItem ? 'Edit' : 'Add New'} {dialogType === 'user' ? 'User' : 'Store'}
        </DialogTitle>
        <DialogContent>
          <UserStoreForm 
            type={dialogType} 
            data={selectedItem} 
            onSave={handleSave}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* User Details Dialog */}
      <Dialog open={userDetailsOpen} onClose={() => setUserDetailsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>{selectedItem.name?.charAt(0)}</Avatar>
                <Box>
                  <Typography variant="h6">{selectedItem.name}</Typography>
                  <Chip size="small" label={selectedItem.role} sx={{ mt: 0.5 }} />
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', rowGap: 1.2, columnGap: 1 }}>
                <Typography variant="body2" color="text.secondary">Email</Typography>
                <Typography variant="body2">{selectedItem.email}</Typography>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography variant="body2">{selectedItem.address}</Typography>
                {selectedItem.role === 'store_owner' && (
                  <>
                    <Typography variant="body2" color="text.secondary">Rating</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {selectedItem.rating ? <Rating size="small" readOnly value={selectedItem.rating} /> : <Typography variant="body2">N/A</Typography>}
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDetailsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default AdminDashboard
