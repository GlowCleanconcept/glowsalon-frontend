import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scissors, Mail, Lock, User, Phone, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { API_URL, decodeToken } from "../lib/api";

export default function AuthPage({ onAuthenticated }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({ email: "", password: "", firstName: "", lastName: "", phone: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (mode === "register") {
        const res = await fetch(`${API_URL}/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form)
        });
        const data = await res.json();
        if (!res.ok) {
          const message = data.errors ? data.errors.map(e => e.message).join(", ") : data.error || "Erreur";
          throw new Error(message);
        }
        setSuccess("Compte créé. Vous pouvez vous connecter.");
        setMode("login");
        setForm({ ...form, password: "" });
      } else {
        const res = await fetch(`${API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Identifiants incorrects");
        const payload = decodeToken(data.token);
        onAuthenticated(data.token);
        navigate(payload.role === "admin" ? "/admin" : "/reserver");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => { setMode(newMode); setError(""); setSuccess(""); };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row" style={{ backgroundColor: "#F5F0EA" }}>
      <div className="relative lg:w-[46%] flex flex-col justify-between overflow-hidden px-10 py-12 lg:px-16 lg:py-16"
        style={{ backgroundColor: "#1A1614" }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #C9A876 0%, transparent 35%), radial-gradient(circle at 85% 75%, #D9B8AC 0%, transparent 40%)" }} />
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full" style={{ backgroundColor: "#C9A876" }}>
            <Scissors className="h-5 w-5" style={{ color: "#1A1614" }} strokeWidth={2} />
          </div>
          <span className="text-sm tracking-[0.25em] uppercase" style={{ color: "#D9B8AC", fontFamily: "'Inter', sans-serif" }}>
            Glow Salon
          </span>
        </div>
        <div className="relative z-10 mt-16 lg:mt-0">
          <h1 className="leading-[0.95] tracking-tight"
            style={{ fontFamily: "'Playfair Display', serif", color: "#F5F0EA", fontSize: "clamp(2.75rem, 6vw, 4.5rem)", fontWeight: 600 }}>
            L'art de<br />
            <span style={{ color: "#C9A876", fontStyle: "italic" }}>sublimer</span><br />
            chaque visage.
          </h1>
          <p className="mt-7 max-w-sm text-base leading-relaxed" style={{ color: "#D9B8AC", fontFamily: "'Inter', sans-serif" }}>
            Réservez vos prestations, suivez vos rendez-vous et retrouvez votre salon préféré, en un seul endroit.
          </p>
        </div>
        <div className="relative z-10 hidden lg:flex items-center gap-8 pt-10 mt-10"
          style={{ borderTop: "1px solid rgba(217, 184, 172, 0.2)" }}>
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif", color: "#F5F0EA", fontSize: "1.75rem" }}>12+</p>
            <p className="text-xs tracking-wide uppercase mt-1" style={{ color: "#D9B8AC", fontFamily: "'Inter', sans-serif" }}>Salons partenaires</p>
          </div>
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif", color: "#F5F0EA", fontSize: "1.75rem" }}>4.9</p>
            <p className="text-xs tracking-wide uppercase mt-1" style={{ color: "#D9B8AC", fontFamily: "'Inter', sans-serif" }}>Note moyenne</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-14 lg:px-16">
        <div className="w-full max-w-md">
          <div className="inline-flex rounded-full p-1 mb-10" style={{ backgroundColor: "rgba(26, 22, 20, 0.06)" }}>
            <button type="button" onClick={() => switchMode("login")} className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{ fontFamily: "'Inter', sans-serif", backgroundColor: mode === "login" ? "#1A1614" : "transparent", color: mode === "login" ? "#F5F0EA" : "#1A1614" }}>
              Connexion
            </button>
            <button type="button" onClick={() => switchMode("register")} className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-200"
              style={{ fontFamily: "'Inter', sans-serif", backgroundColor: mode === "register" ? "#1A1614" : "transparent", color: mode === "register" ? "#F5F0EA" : "#1A1614" }}>
              Inscription
            </button>
          </div>

          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#1A1614", fontSize: "2rem" }}>
            {mode === "login" ? "Heureux de vous revoir" : "Créer votre compte"}
          </h2>
          <p className="mt-2 text-sm" style={{ color: "#6B5F58", fontFamily: "'Inter', sans-serif" }}>
            {mode === "login" ? "Connectez-vous pour gérer vos rendez-vous." : "Quelques informations pour commencer."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <Field icon={<User className="h-4 w-4" />} name="firstName" placeholder="Prénom" value={form.firstName} onChange={handleChange} required />
                <Field icon={<User className="h-4 w-4" />} name="lastName" placeholder="Nom" value={form.lastName} onChange={handleChange} required />
              </div>
            )}
            <Field icon={<Mail className="h-4 w-4" />} name="email" type="email" placeholder="Adresse email" value={form.email} onChange={handleChange} required />
            {mode === "register" && (
              <Field icon={<Phone className="h-4 w-4" />} name="phone" placeholder="Téléphone" value={form.phone} onChange={handleChange} />
            )}
            <Field icon={<Lock className="h-4 w-4" />} name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} required />

            {error && (
              <p className="text-sm rounded-lg px-4 py-3" style={{ backgroundColor: "#FBE9E7", color: "#9B4234", fontFamily: "'Inter', sans-serif" }}>{error}</p>
            )}
            {success && (
              <p className="text-sm rounded-lg px-4 py-3 flex items-center gap-2" style={{ backgroundColor: "#EAF3EA", color: "#3E6B4A", fontFamily: "'Inter', sans-serif" }}>
                <CheckCircle2 className="h-4 w-4 shrink-0" />{success}
              </p>
            )}

            <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 rounded-lg py-3.5 mt-2 text-sm font-medium transition-opacity duration-150 disabled:opacity-60"
              style={{ backgroundColor: "#1A1614", color: "#F5F0EA", fontFamily: "'Inter', sans-serif" }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>{mode === "login" ? "Se connecter" : "Créer mon compte"}<ArrowRight className="h-4 w-4" /></>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-xs" style={{ color: "#9C9085", fontFamily: "'Inter', sans-serif" }}>
            En continuant, vous acceptez nos conditions d'utilisation<br />et notre politique de confidentialité.
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ icon, ...props }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "#9C9085" }}>{icon}</span>
      <input {...props} className="w-full rounded-lg pl-11 pr-4 py-3 text-sm outline-none transition-all duration-150"
        style={{ backgroundColor: "rgba(26, 22, 20, 0.04)", color: "#1A1614", fontFamily: "'Inter', sans-serif" }}
        onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #C9A876")}
        onBlur={(e) => (e.target.style.boxShadow = "none")} />
    </div>
  );
}
