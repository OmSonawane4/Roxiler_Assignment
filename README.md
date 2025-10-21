# Store Rating App

Monorepo containing a Vite React frontend and an Express + MySQL backend.

- Frontend: `Store_Rating_app/frontend/`
- Backend: `Store_Rating_app/backend/`

## Prerequisites
- Node.js 18+
- MySQL 8+

## Backend setup

# Set to your Vite origin
CORS_ORIGIN=http://localhost:3001
```

 # Install and run:
```
cd Store_Rating_app/backend
npm install
npm run seed   # creates DB/tables and inserts sample users, stores, ratings
npm run dev    # starts the API on http://localhost:5000
```


## Frontend setup
```
cd Store_Rating_app/frontend
npm install
npm run dev   # Vite dev server (check terminal for the exact URL, e.g. http://localhost:3001)
```



```
