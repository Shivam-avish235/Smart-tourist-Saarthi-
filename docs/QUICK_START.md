# Quick Start Guide for Smart Tourist Safety System

## Setting Up Development Environment

### 1. Install Prerequisites
```bash
# Install Node.js (v14+)
# Install MongoDB (v4+)
# Install Git
```

### 2. Clone and Setup
```bash
# Clone repository
git clone https://github.com/Shivam-avish235/Smart-tourist-Saarthi-.git
cd Smart-tourist-Saarthi-

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

### 3. Configure Environment
Edit `.env` file:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tourist-safety
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### 4. Start Development Server
```bash
# Start MongoDB (if not running)
mongod

# Start server in development mode
npm run dev

# Start server in production mode
npm start
```

## Testing the Setup

### 1. Health Check
```bash
curl http://localhost:5000/health
```

### 2. Create Test User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "nationality": "Indian",
    "phoneNumber": "+919876543210"
  }'
```

### 3. Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

## Common Operations

### Running Tests
```bash
# Run all tests
npm test

# Run API tests
npm run test:api

# Run database tests
npm run test:db

# Run load tests
npm run test:load
```

### Database Operations
```bash
# Seed database
npm run seed

# Refresh database with fresh data
npm run seed:refresh
```

### Debugging
```bash
# Start server in debug mode
npm run debug
```

## Additional Resources

- Full Documentation: See `/docs/PROJECT_DOCUMENTATION.md`
- API Documentation: See `/docs/API_DOCUMENTATION.md`
- Test Documentation: See `/docs/TESTING.md`
- Contributing Guide: See `/docs/CONTRIBUTING.md`
