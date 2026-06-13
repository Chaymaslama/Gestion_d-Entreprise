import { useState } from "react";
import { useClients } from "../../hooks/useClients";
import { deleteClient } from "../../services/clientService";
import { STATUTS_CLIENT } from "../../utils/constants";
import ClientForm from "./ClientForm";

export default function Clients() {
  const { clients, loading, refetch } = useClients();
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.nom?.toLowerCase().includes(search.toLowerCase()) ||
      c.contact?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatut = filterStatut ? c.statut === filterStatut : true;
    return matchSearch && matchStatut;
  });

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce client ?")) return;
    await deleteClient(id);
    refetch();
  }

  function handleEdit(client) {
    setSelected(client);
    setShowForm(true);
  }

  function handleClose() {
    setShowForm(false);
    setSelected(null);
    refetch();
  }

  if (loading) return <p style={{ padding: "2rem" }}>Chargement...</p>;

  return (
    <div>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="🔍 Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={styles.select}
          value={filterStatut}
          onChange={(e) => setFilterStatut(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          {STATUTS_CLIENT.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button style={styles.addBtn} onClick={() => { setSelected(null); setShowForm(true); }}>
          + Ajouter un client
        </button>
      </div>

      <p style={styles.count}>{filtered.length} client(s) trouvé(s)</p>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Client</th>
              <th style={styles.th}>Contact</th>
              <th style={styles.th}>Téléphone</th>
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Secteur</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={styles.empty}>Aucun client trouvé</td>
              </tr>
            ) : (
              filtered.map((client) => {
                const statut = STATUTS_CLIENT.find((s) => s.value === client.statut);
                return (
                  <tr key={client.id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.clientCell}>
                        <div style={styles.avatar}>
                          {client.nom?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={styles.clientName}>{client.nom}</p>
                          <p style={styles.clientEmail}>{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>{client.contact || "—"}</td>
                    <td style={styles.td}>{client.telephone || "—"}</td>
                    <td style={styles.td}>
                      <span style={styles.typeBadge}>
                        {client.type === "entreprise" ? "🏢 Entreprise" : "👤 Particulier"}
                      </span>
                    </td>
                    <td style={styles.td}>{client.secteur || "—"}</td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: statut?.bg || "#f1f5f9",
                        color: statut?.color || "#64748b",
                      }}>
                        {statut?.label || client.statut}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.editBtn} onClick={() => handleEdit(client)}>✏️</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(client.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showForm && <ClientForm client={selected} onClose={handleClose} />}
    </div>
  );
}

const styles = {
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
  clientCell: { display: "flex", alignItems: "center", gap: "10px" },
  avatar: { width: "36px", height: "36px", borderRadius: "50%", background: "#ECFEFF", color: "#0891b2", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "14px", flexShrink: 0 },
  clientName: { margin: 0, fontWeight: 600, fontSize: "14px" },
  clientEmail: { margin: 0, fontSize: "12px", color: "#64748b" },
  badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500 },
  typeBadge: { fontSize: "13px", color: "#475569" },
  editBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", marginRight: "8px" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px" },
  empty: { textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "14px" },
};