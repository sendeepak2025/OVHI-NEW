# Healthcare Appointments Backend API

A comprehensive Node.js backend for healthcare appointment management system built with Express.js, Prisma ORM, and PostgreSQL.

## Features

### Core Functionality
- **Appointment Management**: Complete CRUD operations with conflict detection
- **Provider Management**: Provider schedules, availability, and calendar views
- **Location Management**: Multi-location support with capacity tracking
- **Real-time Updates**: Socket.io integration for live notifications
- **Advanced Search**: Multi-criteria filtering and searching
- **Audit Logging**: Comprehensive activity tracking for compliance

### Security & Compliance
- JWT-based authentication and authorization
- Role-based access control
- HIPAA-compliant audit trails
- Rate limiting and security headers
- Input validation and sanitization
- Error handling and logging

### Advanced Features
- Conflict detection and resolution
- Bulk operations support
- Availability optimization
- Performance monitoring
- Automated cleanup routines

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL database (v8.0 or higher)
- Redis (optional, for caching)

### Setup

1. **Clone and install dependencies**
```bash
npm install
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
DATABASE_URL="mysql://username:password@localhost:3306/healthcare_appointments"
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="24h"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:8080"
```

3. **Database Setup**
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

4. **Start the server**
```bash
# Development
npm run dev

# Production
npm start
```

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password.
```json
{
  "email": "doctor@clinic.com",
  "password": "password123"
}
```

#### POST /api/auth/register
Register new provider account.
```json
{
  "email": "doctor@clinic.com",
  "password": "password123",
  "name": "Dr. John Smith"
}
```

#### POST /api/auth/refresh
Refresh JWT token.

#### GET /api/auth/me
Get current user information.

### Appointment Endpoints

#### GET /api/appointments
Get appointments with filtering options.
- **Query Parameters**: `date`, `startDate`, `endDate`, `providerId`, `locationId`, `status`, `type`, `page`, `limit`

#### POST /api/appointments
Create new appointment.
```json
{
  "patientId": "patient-id",
  "providerId": "provider-id",
  "locationId": "location-id",
  "date": "2024-03-15T10:30:00Z",
  "duration": "30 minutes",
  "type": "TELEHEALTH",
  "status": "CONFIRMED",
  "notes": "Follow-up appointment"
}
```

#### PUT /api/appointments/:id
Update existing appointment.

#### PATCH /api/appointments/:id/status
Update appointment status only.

#### DELETE /api/appointments/:id
Delete appointment.

#### GET /api/appointments/search
Advanced search with multiple criteria.

#### GET /api/appointments/calendar
Calendar view data grouped by date.

#### GET /api/appointments/availability
Check provider/location availability.

#### POST /api/appointments/bulk
Bulk operations (delete, update status).

#### GET /api/appointments/conflicts
Detect scheduling conflicts.

### Provider Endpoints

#### GET /api/providers
Get all providers with pagination.

#### GET /api/providers/:id
Get specific provider details.

#### POST /api/providers
Create new provider.

#### PUT /api/providers/:id
Update provider information.

#### DELETE /api/providers/:id
Soft delete provider.

#### GET /api/providers/:id/availability
Get provider availability schedule.

#### PUT /api/providers/:id/availability
Update provider availability.

#### GET /api/providers/:id/schedule
Get provider schedule for date range.

#### GET /api/providers/stats/overview
Get provider statistics.

### Location Endpoints

#### GET /api/locations
Get all locations.

#### GET /api/locations/:id
Get specific location details.

#### POST /api/locations
Create new location.

#### PUT /api/locations/:id
Update location information.

#### DELETE /api/locations/:id
Soft delete location.

#### GET /api/locations/:id/schedule
Get location schedule for date range.

#### GET /api/locations/:id/availability
Check location availability.

#### GET /api/locations/stats/overview
Get location statistics.

## Database Schema

### Core Models

- **User**: Authentication and user management
- **Provider**: Healthcare provider information and availability
- **Location**: Medical facility locations
- **Patient**: Patient information
- **Appointment**: Appointment records with relationships
- **AuditLog**: Comprehensive audit trail

### Key Relationships
- Users → Providers (1:1)
- Providers → Appointments (1:N)
- Locations → Appointments (1:N)
- Patients → Appointments (1:N)

## Real-time Features

The API includes Socket.io integration for real-time updates:

- **appointment-created**: New appointment notifications
- **appointment-updated**: Appointment changes
- **appointment-status-updated**: Status changes
- **appointment-deleted**: Deletion notifications
- **provider-availability-updated**: Availability changes

### Client Connection Example
```javascript
const socket = io('http://localhost:5000');
socket.emit('join-provider-room', providerId);
socket.on('appointment-created', (appointment) => {
  // Handle new appointment
});
```

## Security Features

### Authentication & Authorization
- JWT-based authentication
- Role-based access control (RBAC)
- Provider-specific data access
- Token refresh mechanism

### Security Middleware
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation (Joi)
- SQL injection prevention (Prisma)

### Audit & Compliance
- Comprehensive audit logging
- HIPAA-compliant data handling
- Activity tracking
- Performance monitoring

## Error Handling

The API includes comprehensive error handling:
- Structured error responses
- Prisma error translations
- Validation error formatting
- Security event logging
- Performance monitoring

## Performance Features

### Optimization
- Database query optimization
- Pagination for large datasets
- Efficient filtering and searching
- Connection pooling
- Request/response caching headers

### Monitoring
- Winston logging with multiple transports
- Performance timing
- Database query logging
- Security event tracking
- Audit trail maintenance

## Development

### Database Operations
```bash
# Reset database
npx prisma migrate reset

# Deploy migrations
npx prisma migrate deploy

# Generate client
npx prisma generate

# View data
npx prisma studio
```

### Logging
Logs are stored in the `logs/` directory:
- `combined.log`: All log entries
- `error.log`: Error-level logs only
- `exceptions.log`: Uncaught exceptions
- `rejections.log`: Unhandled promise rejections

### Testing
```bash
# Run tests (when implemented)
npm test

# Run with coverage
npm run test:coverage
```

## Production Deployment

### Environment Variables
Ensure all required environment variables are set:
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Strong secret key for JWT signing
- `NODE_ENV=production`
- `PORT`: Server port (default: 5000)

### Database Migration
```bash
npx prisma migrate deploy
```

### Process Management
Use PM2 for production process management:
```bash
npm install -g pm2
pm2 start ecosystem.config.js
```

### Monitoring
- Monitor logs in `logs/` directory
- Set up log rotation
- Monitor database performance
- Track API response times
- Monitor error rates

## API Client Integration

### JavaScript/TypeScript Example
```javascript
const API_BASE = 'http://localhost:5000/api';

class AppointmentAPI {
  constructor(token) {
    this.token = token;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAppointments(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE}/appointments?${params}`, {
      headers: this.headers
    });
    return response.json();
  }

  async createAppointment(appointmentData) {
    const response = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(appointmentData)
    });
    return response.json();
  }
}
```

## Support

For support and questions:
1. Check the API documentation above
2. Review the codebase comments
3. Check logs for error details
4. Verify database connectivity
5. Ensure environment variables are correct

## License

This project is licensed under the MIT License.