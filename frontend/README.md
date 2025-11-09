# WorkZen HRMS - Frontend

A modern, responsive Human Resource Management System frontend built with React, Tailwind CSS, and Vite.

## Features

- **Dashboard**: Overview of key HR metrics and statistics
- **Employee Management**: View and manage employee information
- **Department Management**: Organize company structure
- **Attendance System**: Track employee attendance with check-in/check-out
- **Leave Management**: Apply, approve, and track leave requests
- **Payroll Management**: View and manage employee payroll
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- React 18
- React Router v6
- Tailwind CSS
- Axios for API calls
- React Icons
- Chart.js for data visualization
- React Toastify for notifications
- date-fns for date formatting
- Vite for fast development

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README)

## Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will start on `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The production-ready files will be in the `dist` directory.

## Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/      # Reusable components
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Layout.jsx
│   │   └── PrivateRoute.jsx
│   ├── context/         # Context API providers
│   │   └── AuthContext.jsx
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Employees.jsx
│   │   ├── EmployeeDetails.jsx
│   │   ├── Departments.jsx
│   │   ├── Attendance.jsx
│   │   ├── Leave.jsx
│   │   ├── Payroll.jsx
│   │   └── Profile.jsx
│   ├── utils/           # Utility functions
│   │   └── api.js       # Axios configuration
│   ├── App.jsx          # Main app component
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Features by Module

### Authentication
- Login with email and password
- JWT token-based authentication
- Protected routes
- Auto-redirect on session expiry

### Dashboard
- Total employees, departments, attendance stats
- Employees by department chart
- Recent leave requests
- Monthly payroll summary

### Employee Management
- Search and filter employees
- View employee details
- Paginated employee list
- Employee status badges

### Department Management
- View all departments
- Department employee count
- Manager information
- Status indicators

### Attendance
- Check-in/check-out functionality
- Real-time work hours calculation
- Attendance history
- Status indicators (Present, Absent, Late)

### Leave Management
- Apply for leave
- View leave history
- Approve/reject leave (HR/Manager)
- Leave status tracking

### Payroll
- View salary slips
- Detailed breakdown (allowances, deductions)
- Payment status tracking
- Monthly payroll records

## User Roles

The UI adapts based on user role:

- **Employee**: Limited to personal data (attendance, leave, payroll)
- **Manager**: Can approve team leave requests
- **HR**: Full access to employee management and payroll
- **Admin**: Complete system access

## Default Credentials

For testing purposes, you can use:
- Email: `admin@workzen.com`
- Password: `admin123`

(Note: Create this user in the backend first)

## API Integration

The frontend communicates with the backend API running on `http://localhost:5000`. The proxy is configured in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
  },
}
```

## Styling

The project uses Tailwind CSS for styling with a custom configuration:

- Primary color: Blue (customizable in `tailwind.config.js`)
- Responsive breakpoints
- Custom utility classes for buttons, cards, inputs

## State Management

- **AuthContext**: Manages authentication state globally
- Local state with React hooks for component-specific data
- Token stored in localStorage

## Error Handling

- API errors displayed via toast notifications
- Form validation
- Loading states
- 404 and error pages

## Performance Optimizations

- Code splitting with React lazy loading
- Vite's fast HMR (Hot Module Replacement)
- Optimized production builds
- Image optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### Port already in use
If port 3000 is already in use, Vite will automatically use the next available port.

### API connection issues
Make sure the backend is running on `http://localhost:5000` before starting the frontend.

### Build errors
Try deleting `node_modules` and `package-lock.json`, then run `npm install` again.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
