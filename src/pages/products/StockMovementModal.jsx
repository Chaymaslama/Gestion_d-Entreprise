import { useState } from "react";
import { addStockMovement } from "../../services/productService";
import { useAuth } from "../../context/AuthContext";
import { useStockMovements } from "../../hooks/useStockMovements";

export default function StockMovementModal({ product, onClose }) {
  const { currentUser } = useAuth();
  const { movements, loading } = useStockMovements(product.id);
  const [form, setForm] = useState({ type: "entree", quantite: "", motif: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.quantite || Number(form.quantite) <= 0) {
      setError("La quantité doit être supérieure à 0.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await addStockMovement(
        product.id, product.nom,
        form.type, form.quantite,
        form.motif, currentUser.uid
      );
      onClose();
    } catch {
      setError("Erreur lors de l'enregistrement.");
    }
    setSaving(false);
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>Mouvement de stock</h2>
            <p style={styles.productName}>{product.nom}</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={styles.body}>
          {/* Stock actuel */}
          <div style={styles.stockInfo}>
            <span style={styles.stockLabel}>Stock actuel</span>
            <span style={styles.stockValue}>{product.quantite} {product.unite}</span>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            {error && <p style={styles.error}>{error}</p>}

            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Type de mouvement</label>
                <select
                  style={styles.input}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="entree">📥 Entrée (ajout)</option>
                  <option value="sortie">📤 Sortie (retrait)</option>
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Quantité *</label>
                <input
                  style={styles.input}
                  type="number"
                  min="1"
                  value={form.quantite}
                  onChange={(e) => setForm({ ...form, quantite: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Motif</label>
              <input
                style={styles.input}
                placeholder="Ex: Achat fournisseur, Vente client..."
                value={form.motif}
                onChange={(e) => setForm({ ...form, motif: e.target.value })}
              />
            </div>

            <button type="submit" style={styles.submitBtn} disabled={saving}>
              {saving ? "Enregistrement..." : "Valider le mouvement"}
            </button>
          </form>

          {/* Historique */}
          <div style={styles.historySection}>
            <h3 style={styles.historyTitle}>Historique des mouvements</h3>
            {loading ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>Chargement...</p>
            ) : movements.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>Aucun mouvement enregistré</p>
            ) : (
              movements.slice(0, 8).map((m) => (
                <div key={m.id} style={styles.movementRow}>
                  <span style={{ fontSize: "16px" }}>
                    {m.type === "entree" ? "📥" : "📤"}
                  </span>
                  <div style={{ flex: 1 }}>
                    <p style={styles.movementText}>
                      <strong style={{ color: m.type === "entree" ? "#059669" : "#DC2626" }}>
                        {m.type === "entree" ? "+" : "-"}{m.quantite}
                      </strong>
                      {m.motif && ` — ${m.motif}`}
                    </p>
                  </div>
                  <span style={styles.movementDate}>
                    {m.createdAt?.toDate?.()?.toLocaleDateString("fr-FR") || "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" },
  modal: { background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "560px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" },
  modalTitle: { margin: 0, fontSize: "18px", fontWeight: 700 },
  productName: { margin: "4px 0 0", fontSize: "13px", color: "#64748b" },
  closeBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" },
  body: { padding: "1.5rem" },
  stockInfo: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC", borderRadius: "8px", padding: "12px 16px", marginBottom: "1.5rem" },
  stockLabel: { fontSize: "13px", color: "#64748b" },
  stockValue: { fontSize: "20px", fontWeight: 700, color: "#0f172a" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1rem" },
  label: { fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
  submitBtn: { width: "100%", padding: "11px", background: "#4F46E5", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600, fontSize: "14px", marginBottom: "1.5rem" },
  error: { color: "red", fontSize: "13px", marginBottom: "1rem" },
  historySection: { borderTop: "1px solid #e2e8f0", paddingTop: "1rem" },
  historyTitle: { fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "0.75rem" },
  movementRow: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 0", borderBottom: "1px solid #f1f5f9" },
  movementText: { margin: 0, fontSize: "13px", color: "#0f172a" },
  movementDate: { fontSize: "12px", color: "#94a3b8", whiteSpace: "nowrap" },
};