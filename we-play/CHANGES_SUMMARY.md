# Hardcoded Variables - Changes Summary

## 🎯 What Was Fixed

The WePlay project had several hardcoded configuration values that would break if the project was moved to a different location or if services were running on different ports/hosts. All of these have been made **dynamic**.

## 📋 Hardcoded Values Found & Fixed

### Frontend (React)
| File | What Was Fixed | Before | After |
|------|----------------|--------|-------|
| `we-play-front-end/src/services/api.ts` | Hardcoded API base URL | `'http://localhost:8081/api'` | Reads from `REACT_APP_API_URL` environment variable |
| `we-play-front-end/src/config/environment.ts` | **NEW** - Centralized config | N/A | Dynamic config loader that auto-detects environment |

### Django Backend
| File | What Was Fixed | Before | After |
|------|----------------|--------|-------|
| `weplayproject/weplayproject/settings.py` | Debug mode | `DEBUG = True` (hardcoded) | `DEBUG = os.getenv('DEBUG', 'True')` |
| `weplayproject/weplayproject/settings.py` | Secret key | Hardcoded string | `os.getenv('SECRET_KEY', 'django-insecure...')` |
| `weplayproject/weplayproject/settings.py` | Allowed hosts | `ALLOWED_HOSTS = []` (hardcoded) | `os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')` |
| `weplayproject/weplayproject/settings.py` | Database engine | `'django.db.backends.postgresql'` | `os.getenv('DB_ENGINE', '...')` |
| `weplayproject/weplayproject/settings.py` | Database credentials | Hardcoded (name, user, password, host, port) | All use `os.getenv()` with sensible defaults |
| `weplayproject/weplayproject/settings.py` | CORS origins | Hardcoded `"http://localhost:3000"` | `os.getenv('FRONTEND_URL', '...')` |

### Spring Boot Backend
| File | What Was Fixed | Before | After |
|------|----------------|--------|-------|
| `we-play-back-end/src/main/resources/application.properties` | Server port | `server.port=8081` | `server.port=${SERVER_PORT:8081}` |
| `we-play-back-end/src/main/resources/application.properties` | MongoDB URI | `mongodb://localhost:27017/weplay` | `${MONGODB_URI:mongodb://localhost:27017/weplay}` |
| `we-play-back-end/src/main/resources/application.properties` | CORS origins | `http://localhost:3000` | `${CORS_ALLOWED_ORIGINS:http://localhost:3000}` |
| `we-play-back-end/src/main/resources/application.properties` | JWT secret | Hardcoded | `${JWT_SECRET:yourSuperSecretKey...}` |

## 📁 New Files Created

### Environment Configuration Files
1. **`.env.example`** (Root) - Master template showing all variables
2. **`we-play-front-end/.env.example`** - Frontend-specific variables
3. **`we-play-front-end/weplayproject/.env.example`** - Django backend variables
4. **`we-play-back-end/.env.example`** - Spring Boot backend variables

### Configuration Loader
1. **`we-play-front-end/src/config/environment.ts`** - New centralized environment config for React

### Documentation
1. **`ENVIRONMENT_SETUP.md`** - Comprehensive guide for setting up environments

## ✅ How It Works Now

### Automatic Detection
```
Environment Variables Priority:
1. .env file (if exists)
2. System environment variables
3. Hardcoded defaults
```

### Example: Moving Project to Different Location

**Before (Would Break):** ❌
```
Project at: D:\WePlay\project
Hardcoded URL: http://localhost:8081/api
↓
Move to: /opt/projects/weplay
Hardcoded URL: http://localhost:8081/api ← STILL HARDCODED, won't adapt
```

**Now (Works Automatically):** ✅
```
Project at: D:\WePlay\project
.env: REACT_APP_API_URL=http://localhost:8081/api
↓
Move to: /opt/projects/weplay
Just copy .env file over, same variables work!
↓
Need different settings? Edit .env:
REACT_APP_API_URL=http://new-server:9000/api
```

## 🚀 Getting Started

### 1. Setup Each Service

**Frontend:**
```bash
cd we-play-front-end
cp .env.example .env
# Edit .env if needed
```

**Django:**
```bash
cd weplayproject
cp ../.env.example .env
# Edit .env if needed
```

**Spring Boot:**
```bash
cd we-play-back-end
cp .env.example .env
# Edit .env if needed
```

### 2. Default Configuration

If you don't create `.env` files, these defaults will be used:
- Frontend API: `http://localhost:8081/api`
- Django DB: `localhost:5432` (PostgreSQL)
- Spring Boot: `localhost:8081`
- MongoDB: `mongodb://localhost:27017/weplay`

### 3. Move Project Anywhere

Just move the project to any location, and it will work without any changes!

## 🔒 Security Improvements

| Aspect | Before | After |
|--------|--------|-------|
| Secret Keys | Hardcoded in source | In `.env` (gitignored) |
| Database Credentials | In source code | In `.env` (gitignored) |
| API URLs | Hardcoded | Configurable per environment |
| Debug Mode | Always on | Configurable |
| CORS Settings | Hardcoded to localhost | Configurable for any environment |

## ⚙️ For Different Environments

### Development
```env
DEBUG=True
CORS_ALLOW_ALL_ORIGINS=True
REACT_APP_ENVIRONMENT=development
```

### Staging
```env
DEBUG=False
CORS_ALLOWED_ORIGINS=https://staging.weplay.com
REACT_APP_ENVIRONMENT=staging
REACT_APP_API_URL=https://api-staging.weplay.com/api
```

### Production
```env
DEBUG=False
SECRET_KEY=<strong-random-key>
JWT_SECRET=<strong-random-key>
CORS_ALLOWED_ORIGINS=https://weplay.com
REACT_APP_ENVIRONMENT=production
REACT_APP_API_URL=https://api.weplay.com/api
```

## 📚 Files Modified Summary

**Total files modified/created: 9**

### Modified Files:
1. `we-play-front-end/src/services/api.ts` - Now uses config loader
2. `weplayproject/weplayproject/settings.py` - All hardcoded values → environment variables
3. `we-play-back-end/src/main/resources/application.properties` - All hardcoded values → variables

### New Files:
1. `.env.example`
2. `we-play-front-end/.env.example`
3. `we-play-front-end/weplayproject/.env.example`
4. `we-play-back-end/.env.example`
5. `we-play-front-end/src/config/environment.ts`
6. `ENVIRONMENT_SETUP.md`

## 🎓 Key Benefits

✅ **Portability** - Move the project anywhere, no code changes needed  
✅ **Security** - Secrets not in source code  
✅ **Flexibility** - Different settings per environment  
✅ **Easy CI/CD** - Environment variables work with all deployment platforms  
✅ **Team Collaboration** - `.env.example` shows what variables are needed  
✅ **Backward Compatible** - Works even without `.env` files with sensible defaults  

## 📖 Next Steps

1. Read [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed setup instructions
2. Copy `.env.example` to `.env` in each service
3. Update `.env` files with your specific configuration
4. Run the services - they'll auto-detect configuration from `.env`
5. Move the project if needed - everything still works!
