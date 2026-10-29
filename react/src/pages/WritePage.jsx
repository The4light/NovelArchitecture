import { useContext } from "react";
import { AuthContext } from "../context/AuthState";
import WriterInvitation from "../components/public/WriterInvitation";
import ManuscriptsPage from "./ManuscriptsPage";
export default function WritePage() {
  const { user } = useContext(AuthContext);
  return user ? <ManuscriptsPage /> : <WriterInvitation />;
}
