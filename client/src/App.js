import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import NotificationBanner from './components/NotificationBanner';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Tournaments from './pages/Tournaments';
import Leaderboards from './pages/Leaderboards';
import UpcomingMatches from './pages/UpcomingMatches';
import AboutUs from './pages/AboutUs';
import Contact from './pages/Contact';
import Rules from './pages/Rules';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AccountantDashboard from './pages/AccountantDashboard';
import JoinTeam from './pages/JoinTeam';
import JoinTeamByCode from './pages/JoinTeamByCode';
import Wallet from './pages/Wallet';
import AllUserWallets from './pages/AllUserWallets';
import AllWithdrawalRequests from './pages/AllWithdrawalRequests';
import MyReferrals from './pages/MyReferrals';
import AllNotifications from './pages/AllNotifications';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-lava-black">
          <Navbar />
          <NotificationBanner />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/tournaments" element={<Tournaments />} />
              <Route path="/leaderboards" element={<Leaderboards />} />
              <Route path="/upcoming-matches" element={<UpcomingMatches />} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/rules" element={<Rules />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/wallet" 
                element={
                  <ProtectedRoute>
                    <Wallet />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/join-team/:code" 
                element={
                  <ProtectedRoute>
                    <JoinTeam />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/join-team" 
                element={
                  <ProtectedRoute>
                    <JoinTeamByCode />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'co-admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/accountant/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['accountant', 'admin']}>
                    <AccountantDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/user-wallets" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'accountant']}>
                    <AllUserWallets />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/withdrawal-requests" 
                element={
                  <ProtectedRoute allowedRoles={['admin', 'accountant']}>
                    <AllWithdrawalRequests />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-referrals" 
                element={
                  <ProtectedRoute>
                    <MyReferrals />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <AllNotifications />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;

