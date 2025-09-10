# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication Endpoints

### Register New Tourist
```http
POST /auth/register
Content-Type: application/json

{
  "email": "tourist@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-01",
  "nationality": "Indian",
  "phoneNumber": "+919876543210",
  "documentType": "Passport",
  "documentNumber": "P1234567"
}

Response (200 OK):
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "tourist@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "tourist@example.com",
  "password": "securePassword123"
}

Response (200 OK):
{
  "success": true,
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "tourist@example.com"
  }
}
```

## Emergency Endpoints

### Create Emergency Alert
```http
POST /emergency/alert
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "MEDICAL",
  "location": {
    "latitude": 12.9716,
    "longitude": 77.5946
  },
  "description": "Medical emergency need immediate assistance"
}

Response (200 OK):
{
  "success": true,
  "alertId": "alert-id",
  "status": "ACTIVE"
}
```

### Get Active Emergency Alerts
```http
GET /emergency/active
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "alerts": [
    {
      "id": "alert-id",
      "type": "MEDICAL",
      "status": "ACTIVE",
      "location": {
        "latitude": 12.9716,
        "longitude": 77.5946
      },
      "timestamp": "2025-09-11T10:00:00Z"
    }
  ]
}
```

## Location Endpoints

### Update Tourist Location
```http
POST /location/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "accuracy": 10
}

Response (200 OK):
{
  "success": true,
  "timestamp": "2025-09-11T10:00:00Z"
}
```

### Get Location History
```http
GET /location/history
Authorization: Bearer <token>
Query Parameters:
- startDate (optional): ISO date
- endDate (optional): ISO date

Response (200 OK):
{
  "success": true,
  "locations": [
    {
      "latitude": 12.9716,
      "longitude": 77.5946,
      "timestamp": "2025-09-11T10:00:00Z"
    }
  ]
}
```

## KYC Verification Endpoints

### Submit KYC
```http
POST /kyc/verify
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- documentType: "Passport"
- documentNumber: "P1234567"
- documentImage: <file>
- selfie: <file>

Response (200 OK):
{
  "success": true,
  "verificationId": "verification-id",
  "status": "PENDING"
}
```

### Check KYC Status
```http
GET /kyc/status
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "status": "VERIFIED",
  "verifiedAt": "2025-09-11T10:00:00Z"
}
```

## Geofence Endpoints

### Check Geofence Status
```http
POST /geofence/check
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 12.9716,
  "longitude": 77.5946
}

Response (200 OK):
{
  "success": true,
  "inSafeZone": true,
  "nearestSafePoint": {
    "latitude": 12.9720,
    "longitude": 77.5950,
    "distance": 100
  }
}
```

## Error Responses

### Validation Error
```http
Status: 400 Bad Request
{
  "success": false,
  "error": "Validation Error",
  "details": [
    "Email is required",
    "Password must be at least 8 characters"
  ]
}
```

### Authentication Error
```http
Status: 401 Unauthorized
{
  "success": false,
  "error": "Invalid token"
}
```

### Not Found Error
```http
Status: 404 Not Found
{
  "success": false,
  "error": "Resource not found"
}
```

### Server Error
```http
Status: 500 Internal Server Error
{
  "success": false,
  "error": "Internal server error"
}
```
