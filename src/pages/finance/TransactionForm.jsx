import { useState } from "react";
import { addTransaction, updateTransaction } from "../../services/financeService";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES_FINANCE, STATUTS_TRANSACTION } from "../../utils/constants";

export default function TransactionForm({ transaction, onClose }) {
  const { currentUser } = useAuth();
  const isEdit = !!(transaction?.id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    type: transaction?.type || "revenu",
    categorie: transaction?.categorie || "",
    montant: transaction?.montant || "",
    description: transaction?.description || "",
    date: transaction?.date || new Date().toISOString().split("T")[0],
    statut: transaction?.statut || "paye",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const categories = CATEGORIES_FINANCE[form.type] || [];

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.montant || Number(form.montant) <= 0) {
      setError("Le montant doit être supérieur à 0.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isEdit) {
        await updateTransaction(transaction.id, form);
      } else {
        await addTransaction(form, currentUser.uid);
      }
      onClose();
    } catch {
      setError("Une erreur est survenue.");
    }
    setLoading(false);
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {isEdit ? "Modifier la transaction" : "Nouvelle transaction"}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Type */}
          <div style={styles.typeToggle}>
            <button
              type="button"
              style={{ ...styles.typeBtn, background: form.type === "revenu" ? "#059669" : "#f1f5f9", color: form.type === "revenu" ? "#fff" : "#64748b" }}
              onClick={() => setForm({ ...form, type: "revenu", categorie: "" })}
            >
              💰 Revenu
            </button>
            <button
              type="button"
              style={{ ...styles.typeBtn, background: form.type === "depense" ? "#DC2626" : "#f1f5f9", color: form.type === "depense" ? "#fff" : "#64748b" }}
              onClick={() => setForm({ ...form, type: "depense", categorie: "" })}
            >
              💸 Dépense
            </button>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Montant (DT) *</label>
              <input
                style={styles.input}
                type="number"
                name="montant"
                value={form.montant}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Date *</label>
              <input
                style={styles.input}
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Catégorie</label>
              <select style={styles.input} name="categorie" value={form.categorie} onChange={handleChange}>
                <option value="">Sélectionner</option>
                {categories.map((c) => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Statut</label>
              <select style={styles.input} name="statut" value={form.statut} onChange={handleChange}>
                {STATUTS_TRANSACTION.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Ex: Facture client ABC, Achat matériel..."
            />
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>Annuler</button>
            <button
              type="submit"
              style={{ ...styles.submitBtn, background: form.type === "revenu" ? "#059669" : "#DC2626" }}
              disabled={loading}
            >
              {loading ? "Enregistrement..." : isEdit ? "Modifier" : "Ajouter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" },
  modal: { background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "520px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" },
  modalTitle: { margin: 0, fontSize: "18px", fontWeight: 700 },
  closeBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" },
  form: { padding: "1.5rem" },
  typeToggle: { display: "flex", gap: "12px", marginBottom: "1.5rem" },
  typeBtn: { flex: 1, padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 600, fontSize: "15px", transition: "all 0.2s" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1rem" },
  label: { fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
  actions: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1rem" },
  cancelBtn: { padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "14px" },
  submitBtn: { padding: "10px 24px", borderRadius: "8px", border: "none", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  error: { color: "red", padding: "0 1.5rem", fontSize: "14px", marginBottom: "1rem" },
};