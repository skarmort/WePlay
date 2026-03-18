# WePlay AI Coding Agent Instructions

## Architecture Overview

WePlay is a **multi-stack monorepo** with three independent services:

1. **React Frontend** (`we-play-front-end/src/`) - TypeScript/React 19 with React Router, Tailwind CSS, Redux, Three.js for 3D sports visualizations
2. **Spring Boot Backend** (`we-play-back-end/WePlay-Backend/`) - Java 17, Spring Boot 4.0.2 with Spring Security, JPA, MongoDB support
3. **Django Backend** (`we-play-front-end/weplayproject/`) - Python 5.2.6 with Django REST Framework for user authentication & profiles

## Key Architecture Patterns

### Frontend API Integration
- **Login endpoint**: `http://localhost:5000/api/login` (Spring Boot - not yet implemented)
- **Register endpoint**: `http://localhost:5432/api/register` (Django REST Framework)
- **HTTP client**: Axios (see `Login.tsx`, `Register.tsx` for examples)
- **State management**: Redux + React Router for client-side routing
- **Styling**: Tailwind CSS (`tailwind.config.js`) + component-scoped CSS in `src/components/styles.css`

### Component Structure
- Layout wrapper in [src/components/Layout.tsx](src/components/Layout.tsx) provides shared UI
- Auth flows: [src/components/AuthPage.tsx](src/components/AuthPage.tsx) routes to Login/Register based on URL
- 3D visualization: [src/components/SportObject3D.tsx](src/components/SportObject3D.tsx) uses Three.js with sport-specific geometries (ball, boxing gloves, etc.)
- Landing page: [src/components/SportsLandingPage.tsx](src/components/SportsLandingPage.tsx) with header/footer layout

### Backend API Pattern (Django)
- DRF `generics.CreateAPIView` for RESTful endpoints (see [weplay/views.py](weplayproject/weplay/views.py))
- User model validation includes email, phone, country code with computed properties
- Serializer-based request/response handling

### Database Models (Django)
- `UserProfile` in [weplay/models.py](weplayproject/weplay/models.py) stores user credentials with hashed passwords
- Phone number stored separately from country code for flexibility
- Email and username must be unique across the system

## Critical Commands & Workflows

### Frontend Development
```bash
# From we-play-front-end/
npm start          # Dev server on http://localhost:3000 with hot reload
npm run build      # Production bundle to build/
npm test           # Jest test runner in watch mode
```

### Spring Boot Backend
```bash
# From WePlay-Backend/
mvn clean install  # Build with Maven, Java 17 required
mvn spring-boot:run # Start server (check application.yaml for config)
```

### Django Backend
```bash
# From weplayproject/
python manage.py runserver            # Dev server on http://localhost:8000
python manage.py makemigrations       # Create migration for model changes
python manage.py migrate              # Apply migrations to SQLite (db.sqlite3)
python manage.py test                 # Run Django tests
```

## Important Conventions & Gotchas

- **Port conflicts**: Django defaults to 8000, Register component assumes 5432 (inconsistent - verify actual port in Spring Boot config)
- **TypeScript strict mode enabled** in [tsconfig.json](tsconfig.json) - all types must be explicit
- **Component mounting**: SportObject3D clears existing DOM children on mount to prevent duplicate Three.js renderers
- **Django SECRET_KEY is hardcoded** in `settings.py` - replace before production
- **No authentication token handling** yet - localStorage commented out in Login component
- **React Router v7** uses newer hooks API - prefer `useNavigate()` over `useHistory()`

## Cross-Component Dependencies

1. **Auth flows depend on backend API timing** - Register redirects to Login, but no token validation exists
2. **3D components require container dimensions** - SportObject3D uses `clientWidth/clientHeight` with 320px fallback
3. **Redux state not yet wired** - imported but no store setup visible; ensure actions/reducers match component dispatch patterns

## File Organization by Purpose

| Purpose | Location | Key Files |
|---------|----------|-----------|
| Form validation & submission | Frontend components | `Login.tsx`, `Register.tsx` |
| 3D visualization logic | `SportObject3D.tsx` | Creates geometries per sport, animates based on `animationType` prop |
| User data models | `weplay/models.py` | `UserProfile` with phone/country normalization |
| Django API routes | `weplay/urls.py` | Maps endpoints to view classes |
| React routing config | `App.tsx` | Protected routes not yet implemented |
| Styling config | `tailwind.config.js` | Scan `src/` for class names |

## Next Steps for AI Agents

1. Implement Spring Boot login endpoint to match Django register pattern
2. Add JWT token handling to Login/Register flows with localStorage
3. Implement protected routes in React Router (check auth token before rendering)
4. Wire Redux store to persist auth state across page refreshes
5. Add error boundaries around 3D components to prevent full page crashes
