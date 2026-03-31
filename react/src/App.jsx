import Home from "./pages/Home";
import {Routes, Route} from "react-router-dom"
import ExplorePage from "./pages/Explore";
import WritePage from "./pages/WritePage";
import ProfilePage from "./pages/ProfilePage";
import ReadPage from "./pages/ReadPage"
import AuthPage from "./pages/AuthPage";
import LibraryPage from "./pages/LibraryPage";
import SearchPage from "./pages/SearchPage";
export default function  App(){
  return(
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/write" element={<WritePage/>} />
      <Route path="/profile" element={<ProfilePage/>} />
      <Route path="/read/:id" element={<ReadPage />} />
      <Route path="/read" element={<ReadPage />} />
      <Route path="/auth" element={<AuthPage/>} />
      <Route path="library" element={<LibraryPage/>} />
      <Route path="search" element={<SearchPage />} />
    </Routes>
  )
}