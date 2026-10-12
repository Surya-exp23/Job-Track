import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetail from "./pages/JobDetail";
import MyApplications from "./pages/MyApplications";
import SavedJobs from "./pages/SavedJobs";
import Profile from "./pages/Profile";
import Resumes from "./pages/Resumes";
import Companies from "./pages/Companies";
import JobForm from "./pages/JobForm";
import MyJobs from "./pages/MyJobs";
import Applicants from "./pages/Applicants";

// Auth pages get a clean layout without the navbar
const HIDE_NAV_ON = ["/login", "/register", "/verify-email"];

const Shell = () => {
  const location = useLocation();
  const { user, authLoading } = useAuth();

  // Logged-in users don't need the marketing landing — send them home
  if (!authLoading && user && location.pathname === "/") {
    return <Navigate to={user.role === "RECRUITER" ? "/dashboard" : "/jobs"} replace />;
  }

  return (
    <>
      {!HIDE_NAV_ON.includes(location.pathname) && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route
          path="/jobs/new"
          element={
            <ProtectedRoute>
              <JobForm />
            </ProtectedRoute>
          }
        />
        <Route path="/jobs/:id" element={<JobDetail />} />
        <Route
          path="/jobs/:id/edit"
          element={
            <ProtectedRoute>
              <JobForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-jobs"
          element={
            <ProtectedRoute>
              <MyJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:id/applicants"
          element={
            <ProtectedRoute>
              <Applicants />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-jobs"
          element={
            <ProtectedRoute>
              <SavedJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resumes"
          element={
            <ProtectedRoute>
              <Resumes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/companies"
          element={
            <ProtectedRoute>
              <Companies />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Shell />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
