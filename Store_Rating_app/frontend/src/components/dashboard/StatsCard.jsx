import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: ({ color }) => color,
  color: '#fff'
}));

const StatsCard = ({ title, value, icon, color }) => {
  return (
    <StyledPaper elevation={3} color={color}>
      <Box sx={{ fontSize: '2rem', mb: 1 }}>
        <span className="material-icons">{icon}</span>
      </Box>
      <Typography variant="h4" component="div" gutterBottom>
        {value}
      </Typography>
      <Typography variant="body1">{title}</Typography>
    </StyledPaper>
  );
};

export default StatsCard;