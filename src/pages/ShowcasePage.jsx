import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Scissors, MapPin, Star, Clock, ArrowRight, Loader2, Instagram, Phone } from "lucide-react";
import { API_URL } from "../lib/api";

const INK = "#1A1614";
const CREAM = "#F5F0EA";
const GOLD = "#C9A876";
const ROSE = "#D9B8AC";
const MUTED = "#6B5F58";
const FAINT = "#9C9085";

export default function ShowcasePage() {
  const [salons, setSalons] = useState(null);

  const [avis, setAvis] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/salons`)
      .then(r => r.json())
      .then(data => {
        setSalons(data);
        if (data?.[0]?._id) {
          fetch(`${API_URL}/avis/salon/${data[0]._id}`)
            .then(r => r.json())
            .then(setAvis)
            .catch(() => {});
        }
      })
      .catch(() => setSalons([]));
  }, []);

  const salon = salons?.[0];

  return (
    <div style={{ backgroundColor: CREAM }}>
      <nav className="flex items-center justify-between px-6 lg:px-12 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: INK }}>
            <Scissors className="h-4 w-4" style={{ color: GOLD }} />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "1.2rem" }}>Glow Salon</span>
        </div>
        <Link to="/connexion" className="text-sm px-5 py-2.5 rounded-full font-medium"
          style={{ backgroundColor: INK, color: CREAM, fontFamily: "'Inter', sans-serif" }}>
          Réserver
        </Link>
      </nav>

      <section className="relative overflow-hidden" style={{ backgroundColor: INK }}>
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: "radial-gradient(circle at 15% 25%, #C9A876 0%, transparent 35%), radial-gradient(circle at 85% 80%, #D9B8AC 0%, transparent 40%)" }} />
        <div className="relative max-w-6xl mx-auto px-6 lg:px-12 py-20 lg:py-32 text-center">
          <p className="text-xs tracking-[0.3em] uppercase mb-6" style={{ color: GOLD, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
            Salon de coiffure & beauté
          </p>
          <h1 className="leading-[0.95] tracking-tight mx-auto max-w-3xl"
            style={{ fontFamily: "'Playfair Display', serif", color: CREAM, fontSize: "clamp(2.75rem, 7vw, 5.5rem)", fontWeight: 600 }}>
            L'art de<br />
            <span style={{ color: GOLD, fontStyle: "italic" }}>sublimer</span><br />
            chaque visage.
          </h1>
          <p className="mt-8 max-w-md mx-auto text-base leading-relaxed" style={{ color: ROSE, fontFamily: "'Inter', sans-serif" }}>
            Un savoir-faire artisanal au service de votre image, dans un cadre pensé pour le calme et la précision.
          </p>
          <Link to="/connexion" className="mt-10 inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-sm font-medium"
            style={{ backgroundColor: GOLD, color: INK, fontFamily: "'Inter', sans-serif" }}>
            Prendre rendez-vous <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="border-b" style={{ borderColor: "#E8E1D6" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-10 grid grid-cols-3 gap-6 text-center">
          <Stat value="4.9" label="Note moyenne" />
          <Stat value="2 400+" label="Clients satisfaits" />
          <Stat value="12" label="Années d'expérience" />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: GOLD, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
          Nos prestations
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "2.25rem" }}>
          Un savoir-faire sur mesure
        </h2>
        {!salons ? (
          <div className="flex justify-center py-16"><Loader2 className="h-5 w-5 animate-spin" style={{ color: FAINT }} /></div>
        ) : salon ? (
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {salon.prestations?.map((p) => (
              <div key={p._id} className="rounded-2xl p-6 flex items-center justify-between" style={{ backgroundColor: "white" }}>
                <div>
                  <h3 style={{ fontFamily: "'Inter', sans-serif", color: INK, fontSize: "1.05rem", fontWeight: 600 }}>{p.nom}</h3>
                  <p className="flex items-center gap-1.5 text-xs mt-2" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>
                    <Clock className="h-3.5 w-3.5" /> {p.duree} min
                  </p>
                </div>
                <span style={{ fontFamily: "'Playfair Display', serif", color: GOLD, fontSize: "1.5rem" }}>{p.prix} €</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-8" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>Aucune prestation disponible.</p>
        )}
      </section>


      <section className="max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: GOLD, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
          Notre espace
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "2.25rem" }}>
          En images
        </h2>
        {salon?.photos?.length > 0 && (
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {salon.photos.map((photo) => (
              <div key={photo._id} className="rounded-2xl overflow-hidden aspect-square">
                <img src={photo.url} alt="Glow Salon" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section style={{ backgroundColor: INK }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-12 py-24 text-center">
          <Star className="h-5 w-5 mx-auto mb-6" style={{ color: GOLD }} fill={GOLD} />
          <p style={{ fontFamily: "'Playfair Display', serif", color: CREAM, fontSize: "clamp(1.5rem, 3vw, 2rem)", fontStyle: "italic", lineHeight: 1.5 }}>
            "Chaque coupe raconte une histoire. La nôtre commence par vous écouter, avant même de toucher un ciseau."
          </p>
          <p className="mt-6 text-sm tracking-wide" style={{ color: ROSE, fontFamily: "'Inter', sans-serif" }}>
            — L'équipe Glow Salon
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: GOLD, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
          Nous trouver
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "2.25rem" }}>
          {salon?.nom || "Glow Salon"}
        </h2>
        {salon && (
          <div className="mt-8 rounded-2xl p-7 grid sm:grid-cols-3 gap-6" style={{ backgroundColor: "white" }}>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 shrink-0 mt-0.5" style={{ color: GOLD }} />
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>Adresse</p>
                <p className="text-sm mt-1" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>
                  {salon.adresse?.rue}<br />{salon.adresse?.codePostal} {salon.adresse?.ville}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 shrink-0 mt-0.5" style={{ color: GOLD }} />
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>Téléphone</p>
                <p className="text-sm mt-1" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>{salon.telephone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Instagram className="h-5 w-5 shrink-0 mt-0.5" style={{ color: GOLD }} />
              <div>
                <p className="text-xs uppercase tracking-wide" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>Email</p>
                <p className="text-sm mt-1" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>{salon.email}</p>
              </div>
            </div>
          </div>
        )}
      </section>


      <section className="max-w-6xl mx-auto px-6 lg:px-12 py-20">
        <p className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: GOLD, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>
          Témoignages
        </p>
        <h2 style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "2.25rem" }}>
          Ce que disent nos clients
        </h2>
        {avis.length > 0 ? (
          <div className="mt-10 grid sm:grid-cols-2 gap-4">
            {avis.map((a) => (
              <div key={a._id} className="rounded-2xl p-6" style={{ backgroundColor: "white" }}>
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <span key={s} style={{ color: s <= a.note ? GOLD : "#E8E1D6", fontSize: "1.1rem" }}>★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>
                  "{a.commentaire}"
                </p>
                <p className="text-xs mt-3 font-medium" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>
                  — {a.client?.firstName} {a.client?.lastName}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-8 text-sm" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>Aucun avis pour le moment.</p>
        )}
      </section>

      <footer className="border-t" style={{ borderColor: "#E8E1D6" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-12 py-10 flex items-center justify-between">
          <span className="text-xs" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>© 2026 Glow Salon. Tous droits réservés.</span>
          <div className="flex items-center gap-2">
            <Scissors className="h-3.5 w-3.5" style={{ color: GOLD }} />
            <span className="text-xs" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>L'art de sublimer chaque visage</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "2.25rem" }}>{value}</p>
      <p className="text-xs mt-1 tracking-wide uppercase" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>{label}</p>
    </div>
  );
}
