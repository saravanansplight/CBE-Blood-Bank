import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

import Home from './pages/Home'
import Login from './pages/Login'
import DonorRegister from './pages/DonorRegister'
import RequesterRegister from './pages/RequesterRegister'

import DonorDashboard from './pages/donor/Dashboard'
import ActiveRequests from './pages/donor/ActiveRequests'
import MatchingRequests from './pages/donor/MatchingRequests'
import DonorNotifications from './pages/donor/Notifications'
import DonorProfile from './pages/donor/Profile'
import DonorRequestDetails from './pages/donor/RequestDetails'

import RequesterDashboard from './pages/requester/Dashboard'
import CreateRequest from './pages/requester/CreateRequest'
import MyRequests from './pages/requester/MyRequests'
import RequesterRequestDetails from './pages/requester/RequestDetails'
import RequesterNotifications from './pages/requester/Notifications'

import AdminDashboard from './pages/admin/Dashboard'
import AdminDonors from './pages/admin/Donors'
import AdminRequests from './pages/admin/Requests'
import AdminLocations from './pages/admin/Locations'
import AdminAnalytics from './pages/admin/Analytics'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/donor-register" element={<DonorRegister />} />
      <Route path="/requester-register" element={<RequesterRegister />} />

      {/* DONOR */}
      <Route path="/donor" element={<ProtectedRoute role="donor" />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/donor/dashboard" replace />} />
          <Route path="dashboard" element={<DonorDashboard />} />
          <Route path="active-requests" element={<ActiveRequests />} />
          <Route path="matching-requests" element={<MatchingRequests />} />
          <Route path="notifications" element={<DonorNotifications />} />
          <Route path="profile" element={<DonorProfile />} />
          <Route path="request/:id" element={<DonorRequestDetails />} />
        </Route>
      </Route>

      {/* REQUESTER */}
      <Route path="/requester" element={<ProtectedRoute role="requester" />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/requester/dashboard" replace />} />
          <Route path="dashboard" element={<RequesterDashboard />} />
          <Route path="create-request" element={<CreateRequest />} />
          <Route path="my-requests" element={<MyRequests />} />
          <Route path="notifications" element={<RequesterNotifications />} />
          <Route path="request/:id" element={<RequesterRequestDetails />} />
        </Route>
      </Route>

      {/* ADMIN */}
      <Route path="/admin" element={<ProtectedRoute role="admin" />}>
        <Route element={<Layout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="donors" element={<AdminDonors />} />
          <Route path="requests" element={<AdminRequests />} />
          <Route path="locations" element={<AdminLocations />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
