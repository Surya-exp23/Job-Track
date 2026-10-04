import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Spinner = () => (
  <div className="flex min-h-screen items-center justify-center bg-zinc-950">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-zinc-800 border-t-lime-400" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return <Spinner />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
