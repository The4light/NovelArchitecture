import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import ExplorePage from "./pages/Explore";
import WritePage from "./pages/WritePage";
import CreateStoryPage from "./pages/CreateStoryPage"; // New setup import
import ProfilePage from "./pages/ProfilePage";
import ReadPage from "./pages/ReadPage";
import AuthPage from "./pages/AuthPage";
import LibraryPage from "./pages/LibraryPage";
import SearchPage from "./pages/SearchPage";
import { AuthProvider } from './context/AuthContext.jsx';
import PublishStoryPage from "./pages/PublishStoryPage.jsx";
import CreationWorkspacePage from "./pages/CreateWorkSpacePage.jsx";
import AuthCallback from "./pages/AuthCallback";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/write/create" element={<CreateStoryPage />} /> {/* Registered configuration path */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/read/:id" element={<ReadPage />} />
        <Route path="/write/edit/:id" element={<CreationWorkspacePage />} />
        <Route path="/read" element={<ReadPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/publish" element= {<PublishStoryPage/>} />
      </Routes>
    </AuthProvider>
  );
}