# WorkZen HRMS - Backend

A comprehensive Human Resource Management System backend built with Node.js, Express, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **Employee Management**: Complete employee lifecycle management
- **Department Management**: Organization structure management
- **Attendance Tracking**: Check-in/check-out system with work hours calculation
- **Leave Management**: Leave application and approval workflow
- **Payroll Processing**: Salary calculation with allowances and deductions

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the backend directory with the following:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/workzen_hrms
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development
```

4. Start MongoDB:
```bash
# Make sure MongoDB is running on your system
mongod
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new employee
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Employees
- `GET /api/employees` - Get all employees (with pagination & search)
- `GET /api/employees/:id` - Get employee by ID
- `POST /api/employees` - Create new employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Departments
- `GET /api/departments` - Get all departments
- `GET /api/departments/:id` - Get department by ID
- `POST /api/departments` - Create department
- `PUT /api/departments/:id` - Update department
- `DELETE /api/departments/:id` - Delete department

### Attendance
- `GET /api/attendance` - Get attendance records
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `POST /api/attendance` - Mark attendance (Admin/HR)
- `PUT /api/attendance/:id` - Update attendance

### Leave
- `GET /api/leave` - Get leave requests
- `GET /api/leave/:id` - Get leave by ID
- `POST /api/leave` - Apply for leave
- `PUT /api/leave/:id/approve` - Approve leave
- `PUT /api/leave/:id/reject` - Reject leave
- `DELETE /api/leave/:id` - Delete leave request

### Payroll
- `GET /api/payroll` - Get payroll records
- `GET /api/payroll/:id` - Get payroll by ID
- `POST /api/payroll` - Create payroll
- `PUT /api/payroll/:id` - Update payroll
- `PUT /api/payroll/:id/process` - Process payroll
- `PUT /api/payroll/:id/pay` - Mark as paid

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/attendance-summary` - Get attendance summary

## User Roles

- **admin**: Full system access
- **hr**: HR operations access
- **manager**: Team management access
- **employee**: Limited access to own data

## Database Models

### Employee
- Personal information
- Contact details
- Employment details
- Bank information
- Emergency contact

### Department
- Name and description
- Manager assignment
- Employee count

### Attendance
- Check-in/check-out times
- Work hours calculation
- Status tracking

### Leave
- Leave type and duration
- Approval workflow
- Status tracking

### Payroll
- Salary breakdown
- Allowances and deductions
- Payment tracking

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Testing the API

You can test the API using tools like Postman or cURL.

Example login request:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@workzen.com","password":"admin123"}'
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control
- Input validation on all endpoints

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
