import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scissors, ArrowRight, ArrowLeft, Check, Loader2, MapPin, Phone, Mail, User, Lock, Store } from "lucide-react";
import { API_URL, decodeToken, saveSession } from "../lib/api";

const INK = "#1A1614";
const CREAM = "#F5F0EA";
const GOLD = "#C9A876";
const ROSE = "#D9B8AC";
const MUTED = "#6B5F58";
const FAINT = "#9C9085";

export default function RegisterSalonPage({ onAuthenticated }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    // Infos personnelles
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    // Infos salon
    salonNom: "",
    salonTelephone: "",
    salonRue: "",
    salonVille: "",
    salonCodePostal: "",
    salonPays: "Côte d'Ivoire"
  });

  const update = (field, value) => setForm({ ...form, [field]: value });

  const nextStep = () => {
    setError("");
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.email || !form.password) {
        setError("Tous les champs obligatoires doivent être remplis.");
        return;
      }
      if (form.password.length < 6) {
        setError("Le mot de passe doit contenir au moins 6 caractères.");
        return;
      }
    }
    if (step === 2) {
      if (!form.salonNom || !form.salonRue || !form.salonVille) {
        setError("Veuillez remplir le nom et l'adresse du salon.");
        return;
      }
    }
    setStep(step + 1);
  };

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register-salon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          phone: form.phone,
          salonNom: form.salonNom,
          salonTelephone: form.salonTelephone,
          salonAdresse: {
            rue: form.salonRue,
            ville: form.salonVille,
            codePostal: form.salonCodePostal,
            pays: form.salonPays
          }
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la création");

      // Connexion automatique
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password })
      });
      const loginData = await loginRes.json();
      if (loginRes.ok) {
        saveSession(loginData.token);
        onAuthenticated(loginData.token);
        navigate("/admin");
      } else {
        navigate("/connexion");
      }
    } catch (err) {
      setError(err.message);
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      {/* Header */}
      <nav className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #E8E1D6" }}>
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: INK }}>
            <Scissors className="h-3.5 w-3.5" style={{ color: GOLD }} />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "1.1rem" }}>Glow Salon</span>
        </Link>
        <Link to="/connexion" className="text-sm" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
          Déjà un compte ? Se connecter
        </Link>
      </nav>

      <div className="max-w-lg mx-auto px-6 py-12">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2 flex-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium shrink-0"
                  style={{
                    backgroundColor: step >= s ? INK : "rgba(26,22,20,0.06)",
                    color: step >= s ? CREAM : FAINT,
                    fontFamily: "'Inter', sans-serif"
                  }}>
                  {step > s ? <Check className="h-4 w-4" /> : s}
                </div>
                <div className="flex-1 h-1 rounded-full" style={{ backgroundColor: step > s ? GOLD : "#E8E1D6" }} />
              </div>
            </div>
          ))}
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium shrink-0"
            style={{
              backgroundColor: step >= 3 ? INK : "rgba(26,22,20,0.06)",
              color: step >= 3 ? CREAM : FAINT,
              fontFamily: "'Inter', sans-serif"
            }}>
            {step > 3 ? <Check className="h-4 w-4" /> : 3}
          </div>
        </div>

        {/* Étape 1 — Infos personnelles */}
        {step === 1 && (
          <div>
            <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: GOLD, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
              Étape 1 sur 3
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "1.75rem" }}>
              Vos informations
            </h1>
            <p className="mt-2 text-sm mb-8" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
              Ces informations seront utilisées pour votre compte administrateur.
            </p>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field icon={<User className="h-4 w-4" />} placeholder="Prénom *" value={form.firstName} onChange={v => update("firstName", v)} />
                <Field icon={<User className="h-4 w-4" />} placeholder="Nom *" value={form.lastName} onChange={v => update("lastName", v)} />
              </div>
              <Field icon={<Mail className="h-4 w-4" />} placeholder="Email *" type="email" value={form.email} onChange={v => update("email", v)} />
              <Field icon={<Phone className="h-4 w-4" />} placeholder="Téléphone" value={form.phone} onChange={v => update("phone", v)} />
              <Field icon={<Lock className="h-4 w-4" />} placeholder="Mot de passe * (6 caractères min)" type="password" value={form.password} onChange={v => update("password", v)} />
            </div>

            {error && <ErrorMsg message={error} />}

            <button onClick={nextStep} className="w-full mt-6 flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-medium"
              style={{ backgroundColor: INK, color: CREAM, fontFamily: "'Inter', sans-serif" }}>
              Continuer <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Étape 2 — Infos salon */}
        {step === 2 && (
          <div>
            <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: GOLD, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
              Étape 2 sur 3
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "1.75rem" }}>
              Votre salon
            </h1>
            <p className="mt-2 text-sm mb-8" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
              Informations sur votre établissement.
            </p>

            <div className="space-y-3">
              <Field icon={<Store className="h-4 w-4" />} placeholder="Nom du salon *" value={form.salonNom} onChange={v => update("salonNom", v)} />
              <Field icon={<Phone className="h-4 w-4" />} placeholder="Téléphone du salon" value={form.salonTelephone} onChange={v => update("salonTelephone", v)} />
              <Field icon={<MapPin className="h-4 w-4" />} placeholder="Rue et numéro *" value={form.salonRue} onChange={v => update("salonRue", v)} />
              <div className="grid grid-cols-2 gap-3">
                <Field icon={<MapPin className="h-4 w-4" />} placeholder="Ville *" value={form.salonVille} onChange={v => update("salonVille", v)} />
                <Field icon={<MapPin className="h-4 w-4" />} placeholder="Code postal" value={form.salonCodePostal} onChange={v => update("salonCodePostal", v)} />
              </div>
              <Field icon={<MapPin className="h-4 w-4" />} placeholder="Pays" value={form.salonPays} onChange={v => update("salonPays", v)} />
            </div>

            {error && <ErrorMsg message={error} />}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 px-5 py-3.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: "rgba(26,22,20,0.06)", color: INK, fontFamily: "'Inter', sans-serif" }}>
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <button onClick={nextStep} className="flex-1 flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-medium"
                style={{ backgroundColor: INK, color: CREAM, fontFamily: "'Inter', sans-serif" }}>
                Continuer <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 — Confirmation */}
        {step === 3 && (
          <div>
            <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: GOLD, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
              Étape 3 sur 3
            </p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "1.75rem" }}>
              Confirmation
            </h1>
            <p className="mt-2 text-sm mb-8" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
              Vérifiez vos informations avant de créer votre salon.
            </p>

            <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "white" }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>Compte administrateur</h3>
              <Row label="Nom" value={`${form.firstName} ${form.lastName}`} />
              <Row label="Email" value={form.email} />
              <Row label="Téléphone" value={form.phone || "—"} last />
            </div>

            <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: "white" }}>
              <h3 className="text-sm font-semibold mb-4" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>Salon</h3>
              <Row label="Nom" value={form.salonNom} />
              <Row label="Adresse" value={`${form.salonRue}, ${form.salonVille}`} />
              <Row label="Téléphone" value={form.salonTelephone || "—"} />
              <Row label="Pays" value={form.salonPays} last />
            </div>

            {error && <ErrorMsg message={error} />}

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 px-5 py-3.5 rounded-lg text-sm font-medium"
                style={{ backgroundColor: "rgba(26,22,20,0.06)", color: INK, fontFamily: "'Inter', sans-serif" }}>
                <ArrowLeft className="h-4 w-4" /> Retour
              </button>
              <button onClick={submit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-medium disabled:opacity-60"
                style={{ backgroundColor: GOLD, color: INK, fontFamily: "'Inter', sans-serif" }}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Créer mon salon</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ icon, placeholder, value, onChange, type = "text" }) {
  return (
    <div className="relative">
      <span className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: FAINT }}>{icon}</span>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg pl-11 pr-4 py-3 text-sm outline-none"
        style={{ backgroundColor: "rgba(26,22,20,0.04)", color: INK, fontFamily: "'Inter', sans-serif" }}
        onFocus={e => e.target.style.boxShadow = "0 0 0 2px #C9A876"}
        onBlur={e => e.target.style.boxShadow = "none"} />
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div className="flex items-center justify-between py-2" style={{ borderBottom: last ? "none" : "1px solid #F5F0EA" }}>
      <span className="text-sm" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>{value}</span>
    </div>
  );
}

function ErrorMsg({ message }) {
  return (
    <p className="mt-4 text-sm rounded-lg px-4 py-3" style={{ backgroundColor: "#FBE9E7", color: "#9B4234", fontFamily: "'Inter', sans-serif" }}>
      {message}
    </p>
  );
}
