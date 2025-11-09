import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EmployeesLanding from './pages/EmployeesLanding';
import EmployeeDetails from './pages/EmployeeDetails';
import AddEmployee from './pages/AddEmployee';
import Departments from './pages/Departments';
import Attendance from './pages/Attendance';
import Leave from './pages/Leave';
import PayrollDashboard from './pages/PayrollDashboard';
import PayrunGeneration from './pages/PayrunGeneration';
import PayslipDetails from './pages/PayslipDetails';
import SalaryStatementReport from './pages/SalaryStatementReport';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import LoginManagement from './pages/LoginManagement';
import PasswordReset from './pages/PasswordReset';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/employees" element={<EmployeesLanding />} />
            <Route path="/employees/add" element={<AddEmployee />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/leave" element={<Leave />} />
            <Route path="/payroll" element={<PayrollDashboard />} />
            <Route path="/payroll/payrun/:month/:year" element={<PayrunGeneration />} />
            <Route path="/payroll/payslip/:id" element={<PayslipDetails />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/reports/salary-statement" element={<SalaryStatementReport />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/settings/login-management" element={<LoginManagement />} />
            <Route path="/settings/password-reset" element={<PasswordReset />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
