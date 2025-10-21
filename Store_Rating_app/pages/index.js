import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" className="w-full h-full opacity-70">
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="g2" x1="1" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#84cc16" />
            </linearGradient>
          </defs>
          <circle cx="120" cy="80" r="180" fill="url(#g1)"/>
          <circle cx="700" cy="380" r="200" fill="url(#g2)"/>
        </svg>
      </div>

      <div className="container">
        <header className="nav">
          <span className="brand">Store Rater</span>
          <nav>
            <Link href="/login" className="link">Login</Link>
            <Link href="/stores" className="link">Explore Stores</Link>
          </nav>
        </header>

        <section className="hero">
          <h1 className="title">Rate. Discover. Improve.</h1>
          <p className="subtitle">
            A modern platform for transparent store ratings and actionable insights.
          </p>
          <div className="cta">
            <Link href="/login" className="btn primary">Get Started</Link>
            <Link href="/stores" className="btn ghost">Browse Stores</Link>
          </div>
        </section>

        <section className="features">
          <div className="feature">
            <div className="icon">⭐</div>
            <h3>Authentic Ratings</h3>
            <p>Real feedback from real customers — no noise, just signal.</p>
          </div>
          <div className="feature">
            <div className="icon">📊</div>
            <h3>Actionable Analytics</h3>
            <p>Track trends and make data-driven decisions with ease.</p>
          </div>
          <div className="feature">
            <div className="icon">🛍️</div>
            <h3>Store Discovery</h3>
            <p>Find top-rated stores tailored to your preferences.</p>
          </div>
        </section>

        <footer className="footer">
          <span>© {new Date().getFullYear()} Store Rater</span>
          <span className="dot">•</span>
          <span>Built with Next.js</span>
        </footer>
      </div>

      <style jsx>{`
        .container { max-width: 1100px; margin: 0 auto; padding: 24px; }
        .nav { display:flex; align-items:center; justify-content:space-between; }
        .brand { font-weight: 800; font-size: 20px; letter-spacing: 0.3px; }
        .link { margin-left: 18px; color: #0f172a; text-decoration: none; font-weight: 600; }
        .link:hover { opacity: 0.8; }

        .hero { text-align:center; padding: 120px 0 64px; }
        .title { font-size: clamp(32px, 6vw, 56px); line-height:1.05; margin: 0; }
        .subtitle { max-width: 700px; margin: 18px auto 0; color:#334155; font-size: clamp(16px, 2vw, 20px); }
        .cta { margin-top: 28px; display:flex; gap:14px; justify-content:center; flex-wrap:wrap; }
        .btn { padding: 12px 18px; border-radius: 12px; font-weight: 700; text-decoration:none; transition: all .2s ease; }
        .btn.primary { background: linear-gradient(135deg,#4f46e5,#06b6d4); color:white; box-shadow: 0 10px 30px rgba(79,70,229,.25); }
        .btn.primary:hover { transform: translateY(-1px); box-shadow: 0 14px 34px rgba(79,70,229,.32); }
        .btn.ghost { border: 2px solid #0ea5e9; color: #0ea5e9; }
        .btn.ghost:hover { background:#e0f2fe; }

        .features { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin: 72px 0; }
        .feature { background:white; border-radius: 16px; padding: 20px; box-shadow: 0 6px 24px rgba(2,6,23,.06); }
        .icon { font-size: 28px; }
        .footer { display:flex; align-items:center; justify-content:center; gap:10px; color:#475569; padding: 28px 0 10px; }
        .dot { opacity:.5; }

        @media (prefers-color-scheme: dark) {
          main { color: #e5e7eb; background: #0b1220; }
          .link { color: #e5e7eb; }
          .feature { background: #111827; box-shadow: 0 10px 30px rgba(0,0,0,.3); }
          .subtitle { color: #94a3b8; }
          .footer { color: #94a3b8; }
        }
      `}</style>
    </main>
  );
}
