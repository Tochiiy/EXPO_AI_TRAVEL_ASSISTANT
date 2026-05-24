import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
// Import our pages and components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Itineraries from './pages/Itineraries';
import About from './pages/About';
import NotFound from './pages/NotFound';
// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
    const auth = useContext(AuthContext);
    if (!auth?.token)
        return _jsx(Navigate, { to: "/login" });
    return children;
};
export default function App() {
    return (_jsx(AuthProvider, { children: _jsxs(BrowserRouter, { children: [_jsx(Navbar, {}), _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/signup", element: _jsx(Signup, {}) }), _jsx(Route, { path: "/forgot-password", element: _jsx(ForgotPassword, {}) }), _jsx(Route, { path: "/reset-password/:token", element: _jsx(ResetPassword, {}) }), _jsx(Route, { path: "/about", element: _jsx(About, {}) }), _jsx(Route, { path: "/dashboard", element: _jsx(ProtectedRoute, { children: _jsx(Dashboard, {}) }) }), _jsx(Route, { path: "/itineraries", element: _jsx(ProtectedRoute, { children: _jsx(Itineraries, {}) }) }), _jsx(Route, { path: "*", element: _jsx(NotFound, {}) })] })] }) }));
}
