import { Navigate } from "react-router-dom";
import authService from "@/services/auth.service";

interface PublicRouteProps {
    children: React.ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const isAuthenticated = authService.isAuthenticated();

    if (isAuthenticated) {
        // If authenticated, redirect to /dashboard
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;
