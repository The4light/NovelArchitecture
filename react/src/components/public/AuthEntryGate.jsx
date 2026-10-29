import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthState";
import PublicLayout, { PublicState } from "./PublicLayout";

export default function AuthEntryGate({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading)
    return (
      <PublicLayout>
        <PublicState title="Finding your writing space…" loading />
      </PublicLayout>
    );
  return user ? children : <Navigate to="/auth" replace />;
}

