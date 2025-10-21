import '../styles/Home.css';
import { Box, Button, Card, CardContent, Grid, Rating, Typography, Chip, Fade } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function HomePage() {
  const featured = [
    { id: 101, name: 'Tech Store', blurb: 'Latest gadgets and accessories', rating: 4.6, reviews: 120 },
    { id: 102, name: 'Coffee Corner', blurb: 'Artisan coffee & cozy vibes', rating: 4.8, reviews: 240 },
    { id: 103, name: 'Fashion Boutique', blurb: 'Trendy fits you will love', rating: 4.4, reviews: 86 },
    { id: 104, name: 'Book Haven', blurb: 'Stories for every mood', rating: 4.9, reviews: 64 },
    { id: 105, name: 'Gamer Hub', blurb: 'Consoles, games and gear', rating: 4.7, reviews: 190 },
    { id: 106, name: 'Green Grocers', blurb: 'Fresh organic produce daily', rating: 4.5, reviews: 72 }
  ]

  return (
    <>
      {/* Hero */}
      <section className="home-hero">
        <div className="home-hero__gradient" aria-hidden />
        <div className="home-hero__content">
          <h1 className="home-title">Rate. Discover. Improve.</h1>
          <p className="home-subtitle">Your place to explore stores and share authentic reviews.</p>
          <div className="home-actions">
            <Button component={RouterLink} to="/login" variant="contained" className="btn primary">Get Started</Button>
            <Button component={RouterLink} to="/stores" variant="outlined" className="btn ghost">Browse Stores</Button>
          </div>
        </div>
      </section>

      {/* Featured stores */}
      <Box className="home-section">
        <Box className="home-section__header">
          <Typography variant="h5" className="home-section__title">Featured stores</Typography>
          <Button size="small" component={RouterLink} to="/stores">View all</Button>
        </Box>

        <Grid container spacing={2}>
          {featured.map((s, idx) => (
            <Grid key={s.id} item xs={12} sm={6} md={4}>
              <Fade in timeout={350 + (idx % 6) * 90}>
                <Card className="store-card">
                  <CardContent>
                    <Typography variant="h6" className="store-card__title">{s.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{s.blurb}</Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Rating value={s.rating} precision={0.1} readOnly />
                      <Chip size="small" color="primary" label={`${s.rating.toFixed(1)}`} />
                      <Typography variant="caption" color="text.secondary">({s.reviews} reviews)</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
}
