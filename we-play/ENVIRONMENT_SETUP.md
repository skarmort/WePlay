# WePlay Environment Configuration Guide

## Overview
This guide explains how to set up environment variables for the WePlay project. The project has been refactored to use dynamic configuration, so it can work regardless of where you install it or what ports/hosts you use.

## Quick Start

### 1. Clone/Setup the Project
```bash
git clone <repository-url>
cd we-play
```

### 2. Install Dependencies

#### Frontend (React)
```bash
cd we-play-front-end
npm install
```

#### Backend (Django)
```bash
cd weplayproject
pip install -r requirements.txt
```

#### Backend (Spring Boot)
```bash
cd we-play-back-end
mvn clean install
```

### 3. Configure Environment Variables

Each service has a `.env.example` file. Copy and customize it:

#### Frontend Configuration
```bash
cd we-play-front-end
cp .env.example .env
```

Edit `.env` and change the API URL if needed:
```env
REACT_APP_API_URL=http://localhost:8081/api
REACT_APP_ENVIRONMENT=development
```

#### Django Backend Configuration
```bash
cd weplayproject
cp ../.env.example .env
```

Edit `.env`:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DB_ENGINE=django.db.backends.postgresql
DB_NAME=weplay_users
DB_USER=postgres
DB_PASSWORD=akanabor
DB_HOST=localhost
DB_PORT=5432
FRONTEND_URL=http://localhost:3000
```

#### Spring Boot Backend Configuration
```bash
cd we-play-back-end
cp .env.example .env
```

Edit `.env`:
```env
SERVER_PORT=8081
MONGODB_URI=mongodb://localhost:27017/weplay
MONGODB_DATABASE=weplay
CORS_ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET=your-secret-key-here
ENVIRONMENT=development
```

## Variable Definitions

### Frontend Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:8081/api` | Backend API endpoint - Change this if your backend is on a different host/port |
| `REACT_APP_ENVIRONMENT` | `development` | Environment type: `development`, `staging`, `production` |

### Django Backend Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DEBUG` | `True` | Debug mode - Set to `False` in production |
| `SECRET_KEY` | (hardcoded) | Django secret key - **CHANGE IN PRODUCTION** |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated list of allowed hosts |
| `DB_ENGINE` | `django.db.backends.postgresql` | Database engine |
| `DB_NAME` | `weplay_users` | Database name |
| `DB_USER` | `postgres` | Database username |
| `DB_PASSWORD` | `akanabor` | Database password |
| `DB_HOST` | `localhost` | Database host |
| `DB_PORT` | `5432` | Database port |
| `FRONTEND_URL` | `http://localhost:3000` | Frontend URL for CORS |
| `CORS_ALLOW_ALL_ORIGINS` | `True` | Allow all origins (development only) |

### Spring Boot Backend Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `8081` | Server port - Change if port is already in use |
| `MONGODB_URI` | `mongodb://localhost:27017/weplay` | MongoDB connection string |
| `MONGODB_DATABASE` | `weplay` | MongoDB database name |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS origins |
| `JWT_SECRET` | (hardcoded) | JWT signing secret - **CHANGE IN PRODUCTION** |
| `JWT_EXPIRATION` | `86400000` | JWT token expiration in milliseconds (24 hours) |
| `LOGGING_LEVEL_COM_WEPLAY` | `DEBUG` | Logging level for WePlay classes |
| `LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY` | `DEBUG` | Logging level for Spring Security |
| `ENVIRONMENT` | `development` | Environment type |

## Running the Services

### Frontend (React)
```bash
cd we-play-front-end
npm start
```
Runs on `http://localhost:3000`

### Django Backend
```bash
cd weplayproject
python manage.py runserver
```
Runs on `http://localhost:8000`

### Spring Boot Backend
```bash
cd we-play-back-end
mvn spring-boot:run
```
Runs on `http://localhost:8081` (or your configured `SERVER_PORT`)

## Deployment Considerations

### Production Setup
1. **Never commit `.env` files** - They're ignored by `.gitignore`
2. **Change all secrets** - Update `SECRET_KEY` for Django and `JWT_SECRET` for Spring Boot
3. **Update database credentials** - Use production database credentials
4. **Update CORS origins** - Set specific allowed origins instead of `*`
5. **Set DEBUG to False** - Django should never run with `DEBUG=True` in production
6. **Use environment variables** - On your hosting platform (AWS, Azure, Heroku, etc.), set these variables directly

### Docker/Container Deployment
Each service can be containerized:
- Frontend: Build and serve via nginx
- Django: Use gunicorn or uWSGI
- Spring Boot: JAR file with environment variables

## Moving the Project to Another Location

If you move the project to a different folder:

1. **The application will automatically work** - No hardcoded paths!
2. **Just update the `.env` files** if:
   - You're using a different host/port
   - You're using a different database
   - You're using different credentials

Example: If moving to `/opt/projects/weplay`:
```bash
# Frontend still expects API at localhost:8081
# If backend is also on same server, no changes needed

# If backend is on different server:
cd /opt/projects/weplay/we-play-front-end
# Edit .env
REACT_APP_API_URL=http://new-backend-server:8081/api
```

## Troubleshooting

### "Cannot connect to API"
- Check `REACT_APP_API_URL` in frontend `.env` matches your backend URL
- Ensure backend is running on the configured port
- Check CORS configuration in backend

### "Database connection failed"
- Verify database host, port, username, password in `.env`
- Ensure database service is running
- Check database exists and user has permissions

### "Port already in use"
- Change `SERVER_PORT` in Spring Boot `.env`
- Change Django port: `python manage.py runserver 8001`
- Frontend uses port 3000 by default (change with `PORT=3001 npm start`)

### "CORS errors"
- Update `CORS_ALLOWED_ORIGINS` in backend to match frontend URL
- For development, `http://localhost:3000` should work

## Environment Variable Priority

The application loads variables in this order:
1. `.env` file (highest priority)
2. System environment variables
3. Hardcoded defaults (lowest priority)

This means:
- `.env` file overrides everything
- System env vars override defaults
- Defaults are used if nothing else is set

## Best Practices

✅ **DO:**
- Copy `.env.example` to `.env` for each service
- Change secrets in production
- Document any custom environment variables
- Use `.env` for development
- Use system environment variables for production/CI

❌ **DON'T:**
- Commit `.env` files to git
- Use same secret keys across environments
- Leave DEBUG=True in production
- Use CORS_ALLOW_ALL_ORIGINS in production
- Hardcode configuration in code

## See Also
- [Frontend Config](../we-play-front-end/.env.example)
- [Django Config](../we-play-front-end/weplayproject/.env.example)
- [Spring Boot Config](../we-play-back-end/.env.example)
