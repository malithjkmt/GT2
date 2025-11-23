import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RouteManagement from './pages/RouteManagement';
import AddRoute from './pages/AddRoute';
import EditRoute from './pages/EditRoute';
import TruckManagement from './pages/TruckManagement';
import DriverManagement from './pages/DriverManagement';
import FeedbackManagement from './pages/FeedbackManagement';
import UserManagement from './pages/UserManagement';
import LiveMap from './pages/LiveMap';

// Layout
import AdminLayout from './components/AdminLayout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
    },
    secondary: {
      main: '#4CAF50',
    },
  },
});

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return user ? children : <Navigate to="/login" />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

      <Route
        path="/*"
        element={
          <PrivateRoute>
            <AdminLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/routes" element={<RouteManagement />} />
                <Route path="/routes/add" element={<AddRoute />} />
                <Route path="/routes/edit/:id" element={<EditRoute />} />
                <Route path="/trucks" element={<TruckManagement />} />
                <Route path="/drivers" element={<DriverManagement />} />
                <Route path="/feedback" element={<FeedbackManagement />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="/map" element={<LiveMap />} />
              </Routes>
            </AdminLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
