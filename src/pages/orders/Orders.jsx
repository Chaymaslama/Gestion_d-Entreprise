import { useState } from "react";
import { useOrders } from "../../hooks/useOrders";
import { deleteOrder, updateOrderStatus } from "../../services/orderService";
import { STATUTS_COMMANDE } from "../../utils/constants";
import OrderForm from "./OrderForm";

export default function Orders() {
  const { orders, loading, refetch } = useOrders();
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = orders.filter((o) => {
    const matchSearch =
      o.numero?.toLowerCase().includes(search.toLowerCase()) ||
      o.clientNom?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut ? o.statut === filterStatut : true;
    return matchSearch && matchStatut;
  });

  async function handleDelete(id) {
    if (!window.confirm("Supprimer cette commande ?")) return;
    await deleteOrder(id);
    refetch();
  }

  async function handleStatusChange(id, statut) {
    await updateOrderStatus(id, statut);
    refetch();
  }

  function handleClose() {
    setShowForm(false);
    setSelected(null);
    refetch();
  }

  if (loading) return <p style={{ padding: "2rem" }}>Chargement...</p>;

  // Calcul des totaux
  const totalCA = orders
    .filter((o) => o.statut === "livree")
    .reduce((sum, o) => sum + (o.total || 0), 0);

  return (
    <div>
      {/* KPI */}
      <div style={styles.kpiGrid}>
        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>Total commandes</p>
          <p style={styles.kpiValue}>{orders.length}</p>
        </div>
        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>En attente</p>
          <p style={{ ...styles.kpiValue, color: "#D97706" }}>
            {orders.filter((o) => o.statut === "en_attente").length}
          </p>
        </div>
        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>Livrées</p>
          <p style={{ ...styles.kpiValue, color: "#059669" }}>
            {orders.filter((o) => o.statut === "livree").length}
          </p>
        </div>
        <div style={styles.kpiCard}>
          <p style={styles.kpiLabel}>Chiffre d'affaires</p>
          <p style={{ ...styles.kpiValue, color: "#4F46E5" }}>
            {totalCA.toFixed(2)} DT
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="🔍 Rechercher une commande..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={styles.select}
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {STATUTS_COMMANDE.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button style={styles.addBtn} onClick={() => { setSelected(null); setShowForm(true); }}>
          + Nouvelle commande
        </button>
      </div>

      <p style={styles.count}>{filtered.length} commande(s) trouvée(s)</p>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>N° Commande</th>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Articles</th>
              <th style={styles.th}>Total</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={styles.empty}>Aucune commande trouvée</td></tr>
            ) : (
              filtered.map((order) => {
                const statut = STATUTS_COMMANDE.find((s) => s.value === order.statut);
                return (
                  <tr key={order.id} style={styles.tr}>
                    <td style={styles.td}>
                      <code style={styles.numero}>{order.numero}</code>
                    </td>
                    <td style={styles.td}>
                      <p style={styles.clientNom}>{order.clientNom}</p>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.articleCount}>
                        {order.articles?.length || 0} article(s)
                      </span>
                    </td>
                    <td style={styles.td}>
                      <strong>{Number(order.total || 0).toFixed(2)} DT</strong>
                    </td>
                    <td style={styles.td}>
                      <select
                        style={{
                          ...styles.statusSelect,
                          background: statut?.bg || "#f1f5f9",
                          color: statut?.color || "#64748b",
                        }}
                        value={order.statut}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      >
                        {STATUTS_COMMANDE.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td style={styles.td}>
                      {order.createdAt?.toDate?.()?.toLocaleDateString("fr-FR") || "—"}
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => { setSelected(order); setShowForm(true); }}>✏️</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(order.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showForm && <OrderForm order={selected} onClose={handleClose} />}
    </div>
  );
}

const styles = {
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  kpiCard: { background: "#fff", borderRadius: "12px", padding: "1rem 1.25rem", border: "1px solid #e2e8f0" },
  kpiLabel: { margin: "0 0 4px", fontSize: "12px", color: "#64748b", fontWeight: 500 },
  kpiValue: { margin: 0, fontSize: "24px", fontWeight: 700, color: "#0f172a" },
  toolbar: { display: "flex", gap: "12px", marginBottom: "1rem", flexWrap: "wrap" },
  search: { flex: 1, minWidth: "200px", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px" },
  select: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", background: "#fff" },
  addBtn: { padding: "10px 18px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  count: { fontSize: "13px", color: "#64748b", marginBottom: "1rem" },
  tableWrapper: { background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  thead: { background: "#f8fafc" },
  th: { padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 16px", fontSize: "14px", color: "#0f172a", verticalAlign: "middle" },
  numero: { background: "#f1f5f9", padding: "3px 8px", borderRadius: "4px", fontSize: "12px", fontFamily: "monospace" },
  clientNom: { margin: 0, fontWeight: 600 },
  articleCount: { fontSize: "13px", color: "#64748b" },
  statusSelect: { border: "none", borderRadius: "20px", padding: "4px 10px", fontSize: "12px", fontWeight: 500, cursor: "pointer" },
  editBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", marginRight: "8px" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px" },
  empty: { textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "14px" },
};