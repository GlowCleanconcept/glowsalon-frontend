import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Scissors, Loader2 } from "lucide-react";
import ShowcasePage from "./pages/ShowcasePage";
import AuthPage from "./pages/AuthPage";
import BookingPage from "./pages/BookingPage";
import AdminDashboard from "./pages/AdminDashboard";
import { decodeToken, clearSession, saveSession, restoreSession } from "./lib/api";

const INK = "#1A1614";
const GOLD = "#C9A876";
const CREAM = "#F5F0EA";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession().then((restored) => {
      if (restored) setSession(restored);
      setLoading(false);
    });
  }, []);

  const handleAuthenticated = (token) => {
    const payload = decodeToken(token);
    saveSession(token);
    setSession({ token, role: payload.role, email: payload.email });
  };

  const handleLogout = () => {
    setSession(null);
    clearSession();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: CREAM }}>
        <Loader2 className="h-6 w-6 animate-spin" style={{ color: GOLD }} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ShowcasePage />} />
        <Route
          path="/connexion"
          element={
            session ? (
              <Navigate to={session.role === "admin" ? "/admin" : "/reserver"} replace />
            ) : (
              <AuthPage onAuthenticated={handleAuthenticated} />
            )
          }
        />
        <Route
          path="/reserver"
          element={
            session ? (
              <BookingPage token={session.token} user={session} onLogout={handleLogout} />
            ) : (
              <Navigate to="/connexion" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            session && session.role === "admin" ? (
              <AdminDashboard initialToken={session.token} onLogout={handleLogout} />
            ) : (
              <Navigate to="/connexion" replace />
            )
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: CREAM }}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: INK }}>
        <Scissors className="h-5 w-5" style={{ color: GOLD }} />
      </div>
      <p style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "1.5rem" }}>Page introuvable</p>
      <Link to="/" className="text-sm underline" style={{ color: "#6B5F58", fontFamily: "'Inter', sans-serif" }}>
        Retour à l'accueil
      </Link>
    </div>
  );
}
