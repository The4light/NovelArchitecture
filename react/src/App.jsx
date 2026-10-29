import Home from "./pages/Home";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthState";
import AppShell from "./components/studio/AppShell";
import StudioHome from "./pages/StudioHome";
import StudioAnalytics from "./pages/StudioAnalytics";
import StudioSettings from "./pages/StudioSettings";
import ExplorePage from "./pages/Explore";
import WritePage from "./pages/WritePage";
import CreateStoryPage from "./pages/CreateStoryPage"; // New setup import
import ProfilePage from "./pages/ProfilePage";
import ReadPage from "./pages/ReadPage";
import AuthPage from "./pages/AuthPage";
import LibraryPage from "./pages/LibraryPage";
import SearchPage from "./pages/SearchPage";
import { AuthProvider } from "./context/AuthContext.jsx";
import CreationWorkspacePage from "./pages/CreateWorkSpacePage.jsx";
import AuthCallback from "./pages/AuthCallback";
import AuthEntryGate from "./components/public/AuthEntryGate";
import PublicLayout, { PublicState } from "./components/public/PublicLayout";
import PersistentNotes from "./components/studio/PersistentNotes";
import ScrollToTop from "./components/ScrollToTop";
import "./components/studio/BlueTheme.css";
import "./components/FloatingNavigation.css";

export default function App() {
  return (
    <AuthProvider>
      <AppExperience />
    </AuthProvider>
  );
}

export function AppExperience() {
  return (
    <PersistentNotes>
      <AppRoutes />
      <ScrollToTop />
    </PersistentNotes>
  );
}
function AppRoutes() {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  if (loading && location.pathname !== "/auth/callback")
    return (
      <div className="nf-public">
        <PublicState title="Opening your world…" loading />
      </div>
    );
  const immersive =
    location.pathname.startsWith("/write/edit/") ||
    (location.pathname.startsWith("/read/") &&
      new URLSearchParams(location.search).has("chapter"));
  const authPage = location.pathname.startsWith("/auth");
  const content = (
    <Routes>
      <Route path="/" element={user ? <StudioHome /> : <Home />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route
        path="/analytics"
        element={
          <AuthEntryGate>
            <StudioAnalytics />
          </AuthEntryGate>
        }
      />
      <Route
        path="/settings"
        element={
          <AuthEntryGate>
            <StudioSettings />
          </AuthEntryGate>
        }
      />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/write" element={<WritePage />} />
      <Route
        path="/write/create"
        element={
          <AuthEntryGate>
            <CreateStoryPage />
          </AuthEntryGate>
        }
      />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/profile/:username" element={<ProfilePage />} />
      <Route path="/read/:id" element={<ReadPage />} />
      <Route
        path="/write/edit/:id"
        element={
          <AuthEntryGate>
            <CreationWorkspacePage />
          </AuthEntryGate>
        }
      />
      <Route path="/read" element={<ReadPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/library" element={<LibraryPage />} />
      <Route path="/search" element={<SearchPage />} />
      <Route
        path="/publish"
        element={
          <AuthEntryGate>
            <Navigate to="/write/create" replace />
          </AuthEntryGate>
        }
      />
      <Route
        path="*"
        element={
          <PublicLayout>
            <PublicState title="A page still waiting to be written.">
              This path doesn’t lead to a story yet. Let’s find you another
              beginning.
            </PublicState>
          </PublicLayout>
        }
      />
    </Routes>
  );
  return user && !immersive && !authPage ? (
    <AppShell>{content}</AppShell>
  ) : (
    content
  );
}
