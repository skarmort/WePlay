# 🚀 WePlay Setup Quick Reference

## One-Time Setup

```bash
# 1. Clone repository
git clone <url>
cd we-play

# 2. Frontend setup
cd we-play-front-end
npm install
cp .env.example .env
npm start  # Runs on http://localhost:3000

# 3. Django backend setup (new terminal)
cd weplayproject
pip install -r requirements.txt
cp ../.env.example .env
python manage.py migrate
python manage.py runserver  # Runs on http://localhost:8000

# 4. Spring Boot backend setup (new terminal)
cd we-play-back-end
cp .env.example .env
mvn spring-boot:run  # Runs on http://localhost:8081
```

## Environment Variables

### Frontend (`.env` in `we-play-front-end/`)
```env
REACT_APP_API_URL=http://localhost:8081/api
REACT_APP_ENVIRONMENT=development
```

### Django (`.env` in `weplayproject/`)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DB_HOST=localhost
DB_PORT=5432
DB_NAME=weplay_users
DB_USER=postgres
DB_PASSWORD=akanabor
FRONTEND_URL=http://localhost:3000
```

### Spring Boot (`.env` in `we-play-back-end/`)
```env
SERVER_PORT=8081
MONGODB_URI=mongodb://localhost:27017/weplay
CORS_ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET=your-secret-key
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Port 8081 in use | Change `SERVER_PORT` in `.env` |
| Port 3000 in use | `PORT=3001 npm start` |
| Cannot connect to API | Check `REACT_APP_API_URL` matches backend port |
| Database connection error | Verify DB credentials in `.env` |
| CORS errors | Ensure `CORS_ALLOWED_ORIGINS` includes frontend URL |

## Change Backend Port

Edit `we-play-back-end/.env`:
```env
SERVER_PORT=9000
```
Then update frontend `we-play-front-end/.env`:
```env
REACT_APP_API_URL=http://localhost:9000/api
```

## Move Project to Different Location

Just copy the entire folder - **no code changes needed!** 🎉

Variables in `.env` files will still work because they're **location-independent**.

## Key Files

| Path | Purpose |
|------|---------|
| `ENVIRONMENT_SETUP.md` | Detailed setup guide |
| `CHANGES_SUMMARY.md` | What was changed & why |
| `.env.example` | Template for all variables |
| `we-play-front-end/src/config/environment.ts` | Frontend config loader |

## Verify Setup

```bash
# Frontend should load on http://localhost:3000
# Try login/register - should connect to backend

# Backend logs should show:
# Spring Boot: "Started Application..."
# Django: "Starting development server at http://127.0.0.1:8000/"

# Test API connection:
curl http://localhost:8081/api/health
```

## For Production

Before deploying, update `.env`:
```env
DEBUG=False
REACT_APP_ENVIRONMENT=production
SECRET_KEY=<generate-strong-key>
JWT_SECRET=<generate-strong-key>
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

---
**Need help?** See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)
