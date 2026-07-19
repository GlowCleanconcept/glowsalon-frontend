import { useState, useEffect, useCallback } from "react";
import {
  Scissors, LayoutGrid, Users, Calendar, CreditCard, Store,
  LogOut, Loader2, Search, AlertCircle, TrendingUp, Mail, Clock, BarChart2
} from "lucide-react";
import { API_URL } from "../lib/api";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const INK = "#1A1614";
const CREAM = "#F5F0EA";
const GOLD = "#C9A876";
const ROSE = "#D9B8AC";
const MUTED = "#6B5F58";
const FAINT = "#9C9085";

export default function AdminDashboard({ initialToken, onLogout }) {
  const token = initialToken;
  const [view, setView] = useState("overview");

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: CREAM }}>
      <Sidebar view={view} setView={setView} onLogout={onLogout} />
      <main className="flex-1 min-w-0">
        {view === "overview" && <Overview token={token} />}
        {view === "rendezvous" && <RendezvousView token={token} />}
        {view === "salons" && <SalonsView token={token} />}
        {view === "users" && <UsersView token={token} />}
        {view === "paiements" && <PaiementsView token={token} />}
        {view === "analytics" && <AnalyticsView token={token} />}
      </main>
    </div>
  );
}

function Sidebar({ view, setView, onLogout }) {
  const items = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutGrid },
    { id: "rendezvous", label: "Rendez-vous", icon: Calendar },
    { id: "salons", label: "Salons", icon: Store },
    { id: "users", label: "Utilisateurs", icon: Users },
    { id: "paiements", label: "Paiements", icon: CreditCard },
    { id: "analytics", label: "Analytics", icon: BarChart2 }
  ];

  return (
    <aside className="w-64 shrink-0 flex flex-col justify-between px-5 py-7" style={{ backgroundColor: INK }}>
      <div>
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: GOLD }}>
            <Scissors className="h-4 w-4" style={{ color: INK }} />
          </div>
          <span style={{ fontFamily: "'Playfair Display', serif", color: CREAM, fontSize: "1.1rem" }}>Glow Salon</span>
        </div>
        <nav className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button key={item.id} onClick={() => setView(item.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors duration-150"
                style={{ backgroundColor: active ? "rgba(201,168,118,0.15)" : "transparent", color: active ? GOLD : ROSE, fontFamily: "'Inter', sans-serif", fontWeight: active ? 600 : 400 }}>
                <Icon className="h-4 w-4" />{item.label}
              </button>
            );
          })}
        </nav>
      </div>
      <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>
        <LogOut className="h-4 w-4" />Déconnexion
      </button>
    </aside>
  );
}

function useFetch(token, endpoint, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}${endpoint}`, { headers: { Authorization: `Bearer ${token}` } });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Erreur de chargement");
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, endpoint]);

  useEffect(() => { refetch(); }, deps);
  return { data, loading, error, refetch };
}

function PageHeader({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-8">
      <p className="text-xs tracking-[0.2em] uppercase mb-2" style={{ color: GOLD, fontFamily: "'Inter', sans-serif", fontWeight: 600 }}>{eyebrow}</p>
      <h1 style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "2rem" }}>{title}</h1>
      {subtitle && <p className="mt-1 text-sm" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>{subtitle}</p>}
    </div>
  );
}

function StatusBadge({ statut }) {
  const map = {
    en_attente: { label: "En attente", bg: "#FBF1DD", text: "#9C7A1F" },
    confirme: { label: "Confirmé", bg: "#E2EFE3", text: "#3E6B4A" },
    annule: { label: "Annulé", bg: "#FBE9E7", text: "#9B4234" },
    termine: { label: "Terminé", bg: "#E8E5E1", text: MUTED },
    paye: { label: "Payé", bg: "#E2EFE3", text: "#3E6B4A" },
    rembourse: { label: "Remboursé", bg: "#E8E5E1", text: MUTED }
  };
  const s = map[statut] || { label: statut, bg: "#E8E5E1", text: MUTED };
  return (
    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ backgroundColor: s.bg, color: s.text, fontFamily: "'Inter', sans-serif" }}>
      {s.label}
    </span>
  );
}

function LoadingBlock() {
  return <div className="flex items-center justify-center py-24" style={{ color: FAINT }}><Loader2 className="h-5 w-5 animate-spin" /></div>;
}

function ErrorBlock({ message }) {
  return (
    <div className="flex items-center gap-2 rounded-lg px-4 py-3 text-sm" style={{ backgroundColor: "#FBE9E7", color: "#9B4234", fontFamily: "'Inter', sans-serif" }}>
      <AlertCircle className="h-4 w-4 shrink-0" />{message}
    </div>
  );
}

function Overview({ token }) {
  const { data: rdvs, loading: l1 } = useFetch(token, "/rendezvous", [token]);
  const { data: paiements, loading: l2 } = useFetch(token, "/paiements", [token]);
  const { data: users, loading: l3 } = useFetch(token, "/users", [token]);
  const loading = l1 || l2 || l3;

  const stats = !loading && rdvs && paiements && users ? {
    totalRdv: rdvs.length,
    enAttente: rdvs.filter(r => r.statut === "en_attente").length,
    revenus: paiements.filter(p => p.statut === "paye" || p.statut === "en_attente").reduce((sum, p) => sum + p.montant, 0),
    totalUsers: users.length
  } : null;

  return (
    <div className="px-10 py-10 max-w-6xl">
      <PageHeader eyebrow="Tableau de bord" title="Vue d'ensemble" subtitle="L'activité de votre réseau de salons, en un coup d'œil." />
      {loading ? <LoadingBlock /> : (
        <>
          <div className="grid grid-cols-4 gap-4 mb-10">
            <StatCard icon={Calendar} label="Rendez-vous" value={stats.totalRdv} />
            <StatCard icon={Clock} label="En attente" value={stats.enAttente} accent />
            <StatCard icon={TrendingUp} label="Revenus" value={`${stats.revenus} €`} />
            <StatCard icon={Users} label="Utilisateurs" value={stats.totalUsers} />
          </div>
          <div className="rounded-2xl p-6" style={{ backgroundColor: "white" }}>
            <h3 className="mb-4 text-sm font-medium" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>Derniers rendez-vous</h3>
            <div className="space-y-3">
              {rdvs.slice(0, 5).map((r) => (
                <div key={r._id} className="flex items-center justify-between py-2" style={{ borderBottom: "1px solid #F0EBE3" }}>
                  <div>
                    <p className="text-sm" style={{ color: INK, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                      {r.prestation?.nom} — {r.client?.firstName || "Client"} {r.client?.lastName || ""}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>
                      {new Date(r.date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <StatusBadge statut={r.statut} />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: accent ? INK : "white" }}>
      <Icon className="h-5 w-5 mb-4" style={{ color: accent ? GOLD : MUTED }} />
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", color: accent ? CREAM : INK }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: accent ? ROSE : FAINT, fontFamily: "'Inter', sans-serif" }}>{label}</p>
    </div>
  );
}

function RendezvousView({ token }) {
  const { data: rdvs, loading, error, refetch } = useFetch(token, "/rendezvous", [token]);
  const [updating, setUpdating] = useState(null);

  const updateStatut = async (id, statut) => {
    setUpdating(id);
    try {
      await fetch(`${API_URL}/rendezvous/${id}/statut`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ statut })
      });
      refetch();
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="px-10 py-10 max-w-6xl">
      <PageHeader eyebrow="Planning" title="Rendez-vous" subtitle="Confirmez, terminez ou annulez les réservations clients." />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {rdvs && (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "white" }}>
          <table className="w-full text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8F5F0" }}>
                {["Client", "Prestation", "Date", "Statut", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wide font-medium" style={{ color: FAINT }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rdvs.map((r) => (
                <tr key={r._id} style={{ borderTop: "1px solid #F0EBE3" }}>
                  <td className="px-5 py-4" style={{ color: INK }}>{r.client?.firstName} {r.client?.lastName}</td>
                  <td className="px-5 py-4" style={{ color: MUTED }}>{r.prestation?.nom}</td>
                  <td className="px-5 py-4" style={{ color: MUTED }}>{new Date(r.date).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-4"><StatusBadge statut={r.statut} /></td>
                  <td className="px-5 py-4">
                    {updating === r._id ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: FAINT }} /> : (
                      <div className="flex gap-2">
                        {r.statut === "en_attente" && <ActionBtn onClick={() => updateStatut(r._id, "confirme")} label="Confirmer" />}
                        {r.statut === "confirme" && <ActionBtn onClick={() => updateStatut(r._id, "termine")} label="Terminer" />}
                        {r.statut !== "annule" && r.statut !== "termine" && <ActionBtn onClick={() => updateStatut(r._id, "annule")} label="Annuler" danger />}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ onClick, label, danger }) {
  return (
    <button onClick={onClick} className="text-xs px-3 py-1.5 rounded-full font-medium"
      style={{ backgroundColor: danger ? "#FBE9E7" : "rgba(201,168,118,0.15)", color: danger ? "#9B4234" : "#8A6D3B", fontFamily: "'Inter', sans-serif" }}>
      {label}
    </button>
  );
}

function SalonsView({ token }) {
  const { data: salons, loading, error } = useFetch(token, "/salons", [token]);
  return (
    <div className="px-10 py-10 max-w-6xl">
      <PageHeader eyebrow="Réseau" title="Salons" subtitle="Les établissements rattachés à votre réseau." />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {salons && (
        <div className="grid grid-cols-2 gap-5">
          {salons.map((s) => (
            <div key={s._id} className="rounded-2xl p-6" style={{ backgroundColor: "white" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", color: INK, fontSize: "1.25rem" }}>{s.nom}</h3>
                  <p className="text-sm mt-1" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>{s.adresse?.ville}, {s.adresse?.codePostal}</p>
                </div>
                <Store className="h-5 w-5" style={{ color: GOLD }} />
              </div>
              <div className="mt-5 pt-5 space-y-2" style={{ borderTop: "1px solid #F0EBE3" }}>
                {s.prestations?.slice(0, 3).map((p) => (
                  <div key={p._id} className="flex items-center justify-between text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <span style={{ color: INK }}>{p.nom}</span>
                    <span style={{ color: GOLD, fontWeight: 600 }}>{p.prix} €</span>
                  </div>
                ))}
                {s.prestations?.length > 3 && (
                  <p className="text-xs" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>+{s.prestations.length - 3} autres prestations</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersView({ token }) {
  const { data: users, loading, error } = useFetch(token, "/users", [token]);
  const [search, setSearch] = useState("");

  const filtered = users?.filter(u =>
    `${u.firstName || ""} ${u.lastName || ""} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleColors = {
    admin: { bg: "#1A1614", text: CREAM },
    coiffeur: { bg: "#FBF1DD", text: "#9C7A1F" },
    client: { bg: "#E2EFE3", text: "#3E6B4A" },
    user: { bg: "#E8E5E1", text: MUTED }
  };

  return (
    <div className="px-10 py-10 max-w-6xl">
      <PageHeader eyebrow="Communauté" title="Utilisateurs" subtitle="Clients, coiffeurs et administrateurs de la plateforme." />
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: FAINT }} />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un utilisateur..."
          className="w-full rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none"
          style={{ backgroundColor: "white", color: INK, fontFamily: "'Inter', sans-serif" }} />
      </div>
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {filtered && (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "white" }}>
          {filtered.map((u, i) => {
            const rc = roleColors[u.role] || roleColors.user;
            return (
              <div key={u._id} className="flex items-center justify-between px-5 py-4" style={{ borderTop: i === 0 ? "none" : "1px solid #F0EBE3" }}>
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ backgroundColor: "#F0EBE3", color: MUTED, fontFamily: "'Inter', sans-serif" }}>
                    {(u.firstName?.[0] || u.email[0]).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: INK, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                      {u.firstName ? `${u.firstName} ${u.lastName}` : u.email}
                    </p>
                    <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>
                      <Mail className="h-3 w-3" /> {u.email}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
                  style={{ backgroundColor: rc.bg, color: rc.text, fontFamily: "'Inter', sans-serif" }}>
                  {u.role}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PaiementsView({ token }) {
  const { data: paiements, loading, error } = useFetch(token, "/paiements", [token]);
  return (
    <div className="px-10 py-10 max-w-6xl">
      <PageHeader eyebrow="Finances" title="Paiements" subtitle="Suivi des transactions liées aux rendez-vous." />
      {loading && <LoadingBlock />}
      {error && <ErrorBlock message={error} />}
      {paiements && (
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "white" }}>
          <table className="w-full text-sm" style={{ fontFamily: "'Inter', sans-serif" }}>
            <thead>
              <tr style={{ backgroundColor: "#F8F5F0" }}>
                {["Référence", "Client", "Montant", "Méthode", "Statut"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs uppercase tracking-wide font-medium" style={{ color: FAINT }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paiements.map((p) => (
                <tr key={p._id} style={{ borderTop: "1px solid #F0EBE3" }}>
                  <td className="px-5 py-4" style={{ color: MUTED, fontSize: "0.8rem" }}>{p.reference}</td>
                  <td className="px-5 py-4" style={{ color: INK }}>{p.client?.firstName} {p.client?.lastName}</td>
                  <td className="px-5 py-4" style={{ color: GOLD, fontWeight: 600 }}>{p.montant} €</td>
                  <td className="px-5 py-4 capitalize" style={{ color: MUTED }}>{p.methode}</td>
                  <td className="px-5 py-4"><StatusBadge statut={p.statut} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AnalyticsView({ token }) {
  const { data: rdvs, loading: l1 } = useFetch(token, "/rendezvous", [token]);
  const { data: paiements, loading: l2 } = useFetch(token, "/paiements", [token]);
  const { data: users, loading: l3 } = useFetch(token, "/users", [token]);
  const loading = l1 || l2 || l3;

  if (loading) return <div className="px-10 py-10"><LoadingBlock /></div>;

  // Revenus par mois
  const revenusParMois = () => {
    if (!paiements) return [];
    const mois = {};
    paiements.forEach(p => {
      const date = new Date(p.createdAt);
      const key = date.toLocaleDateString("fr-FR", { month: "short", year: "2-digit" });
      mois[key] = (mois[key] || 0) + p.montant;
    });
    return Object.entries(mois).map(([mois, revenus]) => ({ mois, revenus })).slice(-6);
  };

  // RDV par statut
  const rdvParStatut = () => {
    if (!rdvs) return [];
    const statuts = {};
    rdvs.forEach(r => {
      statuts[r.statut] = (statuts[r.statut] || 0) + 1;
    });
    const labels = {
      en_attente: "En attente",
      confirme: "Confirmé",
      annule: "Annulé",
      termine: "Terminé"
    };
    const colors = {
      en_attente: "#FBF1DD",
      confirme: "#E2EFE3",
      annule: "#FBE9E7",
      termine: "#E8E5E1"
    };
    return Object.entries(statuts).map(([statut, count]) => ({
      name: labels[statut] || statut,
      value: count,
      color: colors[statut] || "#E8E5E1"
    }));
  };

  // Top prestations
  const topPrestations = () => {
    if (!rdvs) return [];
    const prestations = {};
    rdvs.forEach(r => {
      const nom = r.prestation?.nom || "Inconnu";
      prestations[nom] = (prestations[nom] || 0) + 1;
    });
    return Object.entries(prestations)
      .map(([nom, count]) => ({ nom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const totalRevenus = paiements?.reduce((sum, p) => sum + p.montant, 0) || 0;
  const tauxConfirmation = rdvs?.length
    ? Math.round((rdvs.filter(r => r.statut === "confirme" || r.statut === "termine").length / rdvs.length) * 100)
    : 0;

  return (
    <div className="px-10 py-10 max-w-6xl">
      <PageHeader eyebrow="Statistiques" title="Analytics" subtitle="Vue détaillée des performances de votre salon." />

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4 mb-10">
        <KpiCard label="Revenus totaux" value={`${totalRevenus} €`} icon={TrendingUp} />
        <KpiCard label="Rendez-vous" value={rdvs?.length || 0} icon={Calendar} accent />
        <KpiCard label="Clients" value={users?.length || 0} icon={Users} />
        <KpiCard label="Taux confirmation" value={`${tauxConfirmation}%`} icon={BarChart2} />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Revenus par mois */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "white" }}>
          <h3 className="text-sm font-semibold mb-6" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>
            Revenus par mois
          </h3>
          {revenusParMois().length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenusParMois()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0EBE3" />
                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: FAINT }} />
                <YAxis tick={{ fontSize: 11, fill: FAINT }} />
                <Tooltip
                  contentStyle={{ backgroundColor: INK, border: "none", borderRadius: 8, color: CREAM, fontSize: 12 }}
                  formatter={(value) => [`${value} €`, "Revenus"]}
                />
                <Bar dataKey="revenus" fill={GOLD} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-center py-10" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>
              Aucune donnée disponible
            </p>
          )}
        </div>

        {/* RDV par statut */}
        <div className="rounded-2xl p-6" style={{ backgroundColor: "white" }}>
          <h3 className="text-sm font-semibold mb-6" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>
            Rendez-vous par statut
          </h3>
          {rdvParStatut().length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={rdvParStatut()} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                  {rdvParStatut().map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: INK, border: "none", borderRadius: 8, color: CREAM, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-center py-10" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>
              Aucune donnée disponible
            </p>
          )}
        </div>
      </div>

      {/* Top prestations */}
      <div className="rounded-2xl p-6" style={{ backgroundColor: "white" }}>
        <h3 className="text-sm font-semibold mb-6" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>
          Top prestations
        </h3>
        {topPrestations().length > 0 ? (
          <div className="space-y-3">
            {topPrestations().map((p, i) => (
              <div key={p.nom} className="flex items-center gap-4">
                <span className="text-sm w-4 shrink-0" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: INK, fontFamily: "'Inter', sans-serif" }}>{p.nom}</span>
                    <span className="text-sm" style={{ color: MUTED, fontFamily: "'Inter', sans-serif" }}>{p.count} RDV</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#F0EBE3" }}>
                    <div className="h-full rounded-full" style={{
                      backgroundColor: GOLD,
                      width: `${(p.count / topPrestations()[0].count) * 100}%`
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-6" style={{ color: FAINT, fontFamily: "'Inter', sans-serif" }}>
            Aucune donnée disponible
          </p>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="rounded-2xl p-5" style={{ backgroundColor: accent ? INK : "white" }}>
      <Icon className="h-5 w-5 mb-4" style={{ color: accent ? GOLD : MUTED }} />
      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.75rem", color: accent ? CREAM : INK }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: accent ? ROSE : FAINT, fontFamily: "'Inter', sans-serif" }}>{label}</p>
    </div>
  );
}
