import React, { useEffect, useState } from 'react'
import { Box, Rating, TextField, Button } from '@mui/material'
import { api } from '../services/localApi'

const RatingDialog = ({ store, onSubmit, onClose, userId = 3 }) => {
  const [value, setValue] = useState(5)
  const [comment, setComment] = useState('')

  useEffect(() => {
    const existing = api.getUserRatingForStore(store.id, userId)
    if (existing) {
      setValue(existing.rating)
      setComment(existing.comment || '')
    }
  }, [store.id, userId])

  return (
    <Box sx={{ pt: 1 }}>
      <Rating value={value} onChange={(_, v) => setValue(v)} precision={1} size="large" sx={{ mb: 2 }} />
      <TextField
        fullWidth
        label="Comment (optional)"
        multiline
        minRows={3}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={() => onSubmit(value, comment)}>{api.getUserRatingForStore(store.id, userId) ? 'Update' : 'Submit'}</Button>
      </Box>
    </Box>
  )
}

export default RatingDialog


