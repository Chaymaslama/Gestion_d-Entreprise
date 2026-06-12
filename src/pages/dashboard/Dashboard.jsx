import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { mois: "Jan", commandes: 12 },
  { mois: "Fév", commandes: 19 },
  { mois: "Mar", commandes: 15 },
  { mois: "Avr", commandes: 25 },
  { mois: "Mai", commandes: 22 },
  { mois: "Jun", commandes: 30 },
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    employes: 0,
    clients: 0,
    produits: 0,
    commandes: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      const collections = ["employees", "clients", "products", "orders"];
      const counts = await Promise.all(
        collections.map(async (col) => {
          const snap = await getDocs(collection(db, col));
          return snap.size;
        })
      );
      setStats({
        employes: counts[0],
        clients: counts[1],
        produits: counts[2],
        commandes: counts[3],
      });
    }
    fetchStats();
  }, []);

  const cards = [
    { label: "Employés", value: stats.employes, icon: "👥", color: "#4F46E5", bg: "#EEF2FF" },
    { label: "Clients", value: stats.clients, icon: "🤝", color: "#0891b2", bg: "#ECFEFF" },
    { label: "Produits", value: stats.produits, icon: "📦", color: "#059669", bg: "#ECFDF5" },
    { label: "Commandes", value: stats.commandes, icon: "🛒", color: "#D97706", bg: "#FFFBEB" },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div style={styles.grid}>
        {cards.map((card) => (
          <div key={card.label} style={styles.card}>
            <div style={{ ...styles.iconBox, background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <p style={styles.cardLabel}>{card.label}</p>
              <p style={{ ...styles.cardValue, color: card.color }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={styles.chartCard}>
        <h3 style={styles.chartTitle}>Commandes par mois</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mois" tick={{ fontSize: 13 }} />
            <YAxis tick={{ fontSize: 13 }} />
            <Tooltip />
            <Bar dataKey="commandes" fill="#4F46E5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const styles = {
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  card: { background: "#fff", borderRadius: "12px", padding: "1.25rem", display: "flex", alignItems: "center", gap: "1rem", border: "1px solid #e2e8f0" },
  iconBox: { width: "48px", height: "48px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 },
  cardLabel: { margin: 0, fontSize: "13px", color: "#64748b" },
  cardValue: { margin: 0, fontSize: "28px", fontWeight: 700 },
  chartCard: { background: "#fff", borderRadius: "12px", padding: "1.5rem", border: "1px solid #e2e8f0" },
  chartTitle: { margin: "0 0 1.5rem", fontSize: "15px", fontWeight: 600, color: "#0f172a" },
};