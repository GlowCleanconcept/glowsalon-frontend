import { useState, useEffect, useCallback } from "react";
import {
  Scissors, MapPin, Clock, ChevronRight, ChevronLeft, Check,
  Calendar as CalendarIcon, Loader2, AlertCircle, LogOut, CheckCircle2
} from "lucide-react";
import { API_URL } from "../lib/api";

const INK = "#1A1614";
const CREAM = "#F5F0EA";
const GOLD = "#C9A876";
const ROSE = "#D9B8AC";
const MUTED = "#6B5F58";
const FAINT = "#9C9085";

export default function BookingPage({ token, user, onLogout }) {
  return <BookingFlow token={token} user={user} onLogout={onLogout} />;
}

function BookingFlow({ token, user, onLogout }) {
  const [step, setStep] = useState("salons");
  const [salons, setSalons] = useState(null);
  const [loadingSalons, setLoadingSalons] = useState(true);
  const [selectedSalon, setSelectedSalon] = useState(null);
  const [selectedPrestation, setSelectedPrestation] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [myRdvs, setMyRdvs] = useState(null);
  const [view, setView] = useState("book");

  useEffect(() => {
    fetch(`${API_URL}/salons`)
      .then(r => r.json())
      .then(d => { setSalons(d); setLoadingSalons(false); })
      .catch(() => setLoadingSalons(false));
  }, []);

  const loadMyRdvs = useCallback(() => {
    fetch(`${API_URL}/rendezvous/mes-rdv`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(setMyRdvs);
  }, [token]);

  useEffect(() => { if (view === "mine") loadMyRdvs(); }, [view, loadMyRdvs]);

  const resetFlow = () => {
    setStep("salons");
    setSelectedSalon(null);
    setSelectedPrestation(null);
    setSelectedDate("");
    setSelectedTime("");
    setError("");
  };

  const confirmBooking = async () => {
    setSubmitting(true);
    setError("");
    try {
      const isoDate = `${selectedDate}T${selectedTime}:00.000Z`;
      const res = await fetch(`${API_URL}/rendezvous`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          salonId: selectedSalon._id,
          prestationId: selectedPrestation._id,
          coiffeurId: selectedSalon.proprietaire?._id || selectedSalon.proprietaire || "6a4390cfb420cf72169d5a96",
          date: isoDate
        })
      });
      const data = await res.json();
      if (!res.ok) {
        const message = data.errors ? data.errors.map(e => e.message).join(", ") : data.error;
        throw new Error(message);
      }
      setStep("done");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const todayISO = new Date().toISOString().split("T")[0];
  const timeSlots = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00"];

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM }}>
      <header className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid #E8E1D6" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: INK }}>
            <Scissors className="h-3.5 w-3.5" style={{ color: GOLD }} />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "1.1rem" }}>Glow Salon</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setView(view === "book" ? "mine" : "book"); resetFlow(); }}
            className="text-xs px-3.5 py-2 rounded-full font-medium"
            style={{ backgroundColor: "rgba(26,22,20,0.06)", color: INK, fontFamily: "'Inter', sans-serif" }}>
            {view === "book" ? "Mes rendez-vous" : "Réserver"}
          </button>
          <button onClick={onLogout} style={{ color: FAINT }}>
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {view === "mine" ? (
          <MyRendezvous rdvs={myRdvs} token={token} onCancelled={loadMyRdvs} />
        ) : (
          <>
            {step !== "done" && <ProgressSteps step={step} />}
            {step === "salons" && <SalonsStep salons={salons} loading={loadingSalons} onSelect={(s) => { setSelectedSalon(s); setStep("prestation"); }} />}
            {step === "prestation" && selectedSalon && <PrestationStep salon={selectedSalon} onBack={() => setStep("salons")} onSelect={(p) => { setSelectedPrestation(p); setStep("date"); }} />}
            {step === "date" && <DateStep todayISO={todayISO} timeSlots={timeSlots} selectedDate={selectedDate} selectedTime={selectedTime} setSelectedDate={setSelectedDate} setSelectedTime={setSelectedTime} onBack={() => setStep("prestation")} onNext={() => setStep("confirm")} />}
            {step === "confirm" && <ConfirmStep salon={selectedSalon} prestation={selectedPrestation} date={selectedDate} time={selectedTime} error={error} submitting={submitting} onBack={() => setStep("date")} onConfirm={confirmBooking} />}
            {step === "done" && <DoneStep onNewBooking={resetFlow} salon={selectedSalon} prestation={selectedPrestation} date={selectedDate} time={selectedTime} />}
          </>
        )}
      </div>
    </div>
  );
}

function ProgressSteps({ step }) {
  const steps = ["salons", "prestation", "date", "confirm"];
  const idx = steps.indexOf(step);
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex-1">
          <div className="h-1.5 rounded-full transition-all duration-300" style={{ backgroundColor: i <= idx ? GOLD : "#E8E1D6" }} />
        </div>
      ))}
    </div>
  );
}

function SalonsStep({ salons, loading, onSelect }) {
  if (loading) return <LoadingBlock />;
  if (!salons || salons.length === 0) return <p style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>Aucun salon disponible.</p>;
  return (
    <div>
      <Eyebrow>Étape 1</Eyebrow>
      <Title>Choisissez votre salon</Title>
      <div className="mt-6 space-y-3">
        {salons.map((s) => (
          <button key={s._id} onClick={() => onSelect(s)} className="w-full text-left rounded-2xl p-5 flex items-center justify-between" style={{ backgroundColor: "white" }}>
            <div>
              <h3 style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "1.15rem" }}>{s.nom}</h3>
              <p className="flex items-center gap-1.5 text-sm mt-1.5" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
                <MapPin className="h-3.5 w-3.5" />{s.adresse?.ville}
              </p>
              <p className="text-xs mt-2" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>{s.prestations?.length || 0} prestations disponibles</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0" style={{ color: GOLD }} />
          </button>
        ))}
      </div>
    </div>
  );
}

function PrestationStep({ salon, onBack, onSelect }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <Eyebrow>Étape 2 · {salon.nom}</Eyebrow>
      <Title>Choisissez une prestation</Title>
      <div className="mt-6 space-y-3">
        {salon.prestations?.map((p) => (
          <button key={p._id} onClick={() => onSelect(p)} className="w-full text-left rounded-2xl p-5 flex items-center justify-between" style={{ backgroundColor: "white" }}>
            <div>
              <h3 style={{ fontFamily: "'Inter', sans-serif", color: INK, fontSize: "1rem", fontWeight: 600 }}>{p.nom}</h3>
              <p className="flex items-center gap-1.5 text-xs mt-1.5" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>
                <Clock className="h-3.5 w-3.5" /> {p.duree} min
              </p>
            </div>
            <span style={{ fontFamily: "'Playfair Display', serif", color: GOLD, fontSize: "1.3rem" }}>{p.prix} €</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DateStep({ todayISO, timeSlots, selectedDate, selectedTime, setSelectedDate, setSelectedTime, onBack, onNext }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <Eyebrow>Étape 3</Eyebrow>
      <Title>Choisissez une date</Title>
      <div className="mt-6 rounded-2xl p-5" style={{ backgroundColor: "white" }}>
        <label className="text-xs uppercase tracking-wide" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>Date</label>
        <input type="date" min={todayISO} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full mt-2 rounded-lg px-4 py-3 text-sm outline-none"
          style={{ backgroundColor: "rgba(26,22,20,0.04)", color: INK, fontFamily: "'Inter', sans-serif" }} />
        <label className="text-xs uppercase tracking-wide mt-5 block" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>Heure</label>
        <div className="grid grid-cols-4 gap-2 mt-2">
          {timeSlots.map((t) => (
            <button key={t} onClick={() => setSelectedTime(t)} className="rounded-lg py-2.5 text-sm font-medium"
              style={{ backgroundColor: selectedTime === t ? INK : "rgba(26,22,20,0.04)", color: selectedTime === t ? CREAM : INK, fontFamily: "'Inter', sans-serif" }}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onNext} disabled={!selectedDate || !selectedTime}
        className="w-full mt-6 flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-medium disabled:opacity-40"
        style={{ backgroundColor: INK, color: CREAM, fontFamily: "'Inter', sans-serif" }}>
        Continuer <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function ConfirmStep({ salon, prestation, date, time, error, submitting, onBack, onConfirm }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <Eyebrow>Étape 4</Eyebrow>
      <Title>Confirmez votre rendez-vous</Title>
      <div className="mt-6 rounded-2xl p-6" style={{ backgroundColor: "white" }}>
        <Row label="Salon" value={salon.nom} />
        <Row label="Prestation" value={prestation.nom} />
        <Row label="Durée" value={`${prestation.duree} min`} />
        <Row label="Date" value={new Date(`${date}T${time}`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} />
        <Row label="Heure" value={time} last />
        <div className="flex items-center justify-between mt-5 pt-5" style={{ borderTop: "1px solid #F0EBE3" }}>
          <span style={{ fontFamily: "'Inter', sans-serif", color: INK, fontWeight: 600 }}>Total</span>
          <span style={{ fontFamily: "'Playfair Display', serif", color: GOLD, fontSize: "1.5rem" }}>{prestation.prix} €</span>
        </div>
      </div>
      {error && (
        <p className="mt-4 text-sm rounded-lg px-4 py-3 flex items-center gap-2" style={{ backgroundColor: "#FBE9E7", color: "#9B4234", fontFamily: "'Inter', sans-serif" }}>
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
      <button onClick={onConfirm} disabled={submitting}
        className="w-full mt-6 flex items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-medium disabled:opacity-60"
        style={{ backgroundColor: GOLD, color: INK, fontFamily: "'Inter', sans-serif" }}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4" /> Confirmer le rendez-vous</>}
      </button>
    </div>
  );
}

function DoneStep({ onNewBooking, salon, prestation }) {
  return (
    <div className="text-center py-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full mb-6" style={{ backgroundColor: "#E2EFE3" }}>
        <CheckCircle2 className="h-8 w-8" style={{ color: "#3E6B4A" }} />
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "1.6rem" }}>Rendez-vous confirmé</h2>
      <p className="mt-2 text-sm max-w-xs mx-auto" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
        Votre rendez-vous pour {prestation.nom} chez {salon.nom} a bien été enregistré.
      </p>
      <button onClick={onNewBooking} className="mt-8 px-6 py-3 rounded-full text-sm font-medium"
        style={{ backgroundColor: INK, color: CREAM, fontFamily: "'Inter', sans-serif" }}>
        Prendre un autre rendez-vous
      </button>
    </div>
  );
}

function MyRendezvous({ rdvs, token, onCancelled }) {
  const [cancelling, setCancelling] = useState(null);

  const cancel = async (id) => {
    setCancelling(id);
    try {
      await fetch(`${API_URL}/rendezvous/${id}/annuler`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      onCancelled();
    } finally {
      setCancelling(null);
    }
  };

  if (!rdvs) return <LoadingBlock />;
  if (rdvs.length === 0) {
    return (
      <div className="text-center py-16">
        <CalendarIcon className="h-8 w-8 mx-auto mb-4" style={{ color: FAINT }} />
        <p style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>Vous n'avez aucun rendez-vous pour le moment.</p>
      </div>
    );
  }

  const statusMap = {
    en_attente: { label: "En attente", bg: "#FBF1DD", text: "#9C7A1F" },
    confirme: { label: "Confirmé", bg: "#E2EFE3", text: "#3E6B4A" },
    annule: { label: "Annulé", bg: "#FBE9E7", text: "#9B4234" },
    termine: { label: "Terminé", bg: "#E8E5E1", text: MUTED }
  };

  return (
    <div>
      <Eyebrow>Vos réservations</Eyebrow>
      <Title>Mes rendez-vous</Title>
      <div className="mt-6 space-y-3">
        {rdvs.map((r) => {
          const s = statusMap[r.statut] || statusMap.en_attente;
          return (
            <div key={r._id} className="rounded-2xl p-5" style={{ backgroundColor: "white" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 style={{ fontFamily: "'Inter', sans-serif", color: INK, fontWeight: 600 }}>{r.prestation?.nom}</h3>
                  <p className="text-sm mt-1" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>{r.salon?.nom}</p>
                  <p className="text-xs mt-1.5" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>
                    {new Date(r.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.text, fontFamily: "'Inter', sans-serif" }}>
                  {s.label}
                </span>
              </div>
              {(r.statut === "en_attente" || r.statut === "confirme") && (
                <button onClick={() => cancel(r._id)} disabled={cancelling === r._id}
                  className="mt-4 text-xs px-3 py-1.5 rounded-full font-medium"
                  style={{ backgroundColor: "#FBE9E7", color: "#9B4234", fontFamily: "'Inter', sans-serif" }}>
                  {cancelling === r._id ? "Annulation..." : "Annuler"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Eyebrow({ children }) {
  return <p className="text-xs tracking-[0.2em] uppercase" style={{ color: GOLD, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{children}</p>;
}
function Title({ children }) {
  return <h1 className="mt-2" style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "1.75rem" }}>{children}</h1>;
}
function BackButton({ onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm mb-4" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
      <ChevronLeft className="h-4 w-4" /> Retour
    </button>
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
function LoadingBlock() {
  return <div className="flex justify-center py-20"><Loader2 className="h-5 w-5 animate-spin" style={{ color: FAINT }} /></div>;
}
