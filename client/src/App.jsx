import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import { AnalyticsProvider } from './context/AnalyticsContext';

// Splash Screen
import SplashScreen from './components/common/SplashScreen';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ProfilePage from './pages/profile/ProfilePage';
import EditProfilePage from './pages/profile/EditProfilePage';
import NetworkPage from './pages/network/NetworkPage';
import JobsPage from './pages/jobs/JobsPage';
import JobRecommendationsPage from './pages/jobs/JobRecommendationsPage';
import SavedJobsPage from './pages/jobs/SavedJobsPage';
import CompaniesPage from './pages/companies/CompaniesPage';
import CompanyDetailPage from './pages/companies/CompanyDetailPage';
import CreateCompanyPage from './pages/companies/CreateCompanyPage';
import ArticlesPage from './pages/articles/ArticlesPage';
import ArticleDetailPage from './pages/articles/ArticleDetailPage';
import CreateArticlePage from './pages/articles/CreateArticlePage';
import MessagesPage from './pages/messages/MessagesPage';
import NotificationsPage from './pages/notifications/NotificationsPage';
import SearchPage from './pages/search/SearchPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';

// Recruiter Pages
import RecruiterDashboardPage from './pages/recruiter/RecruiterDashboardPage';
import RecruiterJobsPage from './pages/recruiter/RecruiterJobsPage';
import CreateJobPage from './pages/recruiter/CreateJobPage';
import RecruiterApplicantsPage from './pages/recruiter/RecruiterApplicantsPage';
import CandidateSearchPage from './pages/recruiter/CandidateSearchPage';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const isCinematicAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isCinematicAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen bg-black text-slate-100 font-sans selection:bg-pro-500/30 selection:text-white">
      {/* 1. Global Fixed Full-Screen Animated Video Background */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          src={VIDEO_URL}
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover translate-y-[17%]"
        />
      </div>

      {/* 2. Global Fixed Dark Cinematic Overlays & Vignette */}
      <div className="fixed inset-0 pointer-events-none z-1 bg-gradient-to-b from-black/80 via-black/55 to-black/90" />
      <div className="fixed inset-0 pointer-events-none z-1 bg-[radial-gradient(circle_at_center,_rgba(29,78,216,0.15)_0%,_rgba(15,23,42,0.1)_50%,_transparent_100%)]" />
      <div className="fixed inset-0 pointer-events-none z-1 shadow-[inset_0_0_140px_rgba(0,0,0,0.85)]" />

      {/* 3. Scrolling Application Content on top of fixed background */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 py-4">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSplashFinish = () => {
    setShowSplash(false);
    // Smooth auto-routing based on session state on root navigation
    if (location.pathname === '/' || location.pathname === '/login') {
      if (isAuthenticated) {
        navigate('/feed', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  };

  return (
    <>
      {showSplash && (
        <SplashScreen
          onFinish={handleSplashFinish}
          isAuthenticated={isAuthenticated}
        />
      )}

      <AppLayout>
        <Routes>
          {/* Public & Feed */}
          <Route path="/" element={<HomePage />} />
          <Route path="/feed" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Profiles */}
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/profile/:identifier" element={<ProfilePage />} />
          <Route path="/in/:id" element={<ProfilePage />} />
          <Route path="/in/:identifier" element={<ProfilePage />} />
          <Route
            path="/profile/edit"
            element={
              <ProtectedRoute>
                <EditProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Network */}
          <Route
            path="/network"
            element={
              <ProtectedRoute>
                <NetworkPage />
              </ProtectedRoute>
            }
          />

          {/* Jobs & Recommendations */}
          <Route path="/jobs" element={<JobsPage />} />
          <Route
            path="/jobs/recommendations"
            element={
              <ProtectedRoute>
                <JobRecommendationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved-jobs"
            element={
              <ProtectedRoute>
                <SavedJobsPage />
              </ProtectedRoute>
            }
          />

          {/* Companies */}
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/company/:id" element={<CompanyDetailPage />} />
          <Route
            path="/companies/create"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                <CreateCompanyPage />
              </ProtectedRoute>
            }
          />

          {/* Articles */}
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
          <Route
            path="/articles/create"
            element={
              <ProtectedRoute>
                <CreateArticlePage />
              </ProtectedRoute>
            }
          />

          {/* Messages & Notifications */}
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          {/* Global Search & Analytics */}
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />

          {/* Recruiter ATS Suite */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                <RecruiterDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                <RecruiterJobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/create"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                <CreateJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/applicants"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                <RecruiterApplicantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/candidates"
            element={
              <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                <CandidateSearchPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/feed" replace />} />
        </Routes>
      </AppLayout>
    </>
  );
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <AnalyticsProvider>
            <SocketProvider>
              <NotificationProvider>
                <AppContent />
              </NotificationProvider>
            </SocketProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
