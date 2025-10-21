import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Rating,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { format } from 'date-fns';
import PhotoIcon from '@mui/icons-material/Photo';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';

const StoreRatingsTable = ({ ratings }) => {
  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Store</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Comment</TableCell>
            <TableCell>Sentiment</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ratings.map((rating) => (
            <TableRow key={rating.id}>
              <TableCell>{rating.store_name}</TableCell>
              <TableCell>
                <Rating value={rating.rating} readOnly size="small" />
              </TableCell>
              <TableCell>{rating.comment}</TableCell>
              <TableCell>
                <Chip
                  label={rating.sentiment}
                  color={
                    rating.sentiment === 'positive' ? 'success' :
                    rating.sentiment === 'negative' ? 'error' : 'default'
                  }
                  size="small"
                />
              </TableCell>
              <TableCell>{rating.user_name}</TableCell>
              <TableCell>{format(new Date(rating.created_at), 'MMM dd, yyyy')}</TableCell>
              <TableCell>
                {rating.photos && (
                  <Tooltip title="View Photos">
                    <IconButton size="small">
                      <PhotoIcon />
                    </IconButton>
                  </Tooltip>
                )}
                <Tooltip title={`${rating.helpful_count} found this helpful`}>
                  <IconButton size="small">
                    <ThumbUpIcon />
                    <span style={{ fontSize: '12px', marginLeft: '4px' }}>
                      {rating.helpful_count}
                    </span>
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StoreRatingsTable;