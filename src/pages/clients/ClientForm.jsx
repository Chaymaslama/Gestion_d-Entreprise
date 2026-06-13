import { useState } from "react";
import { addClient, updateClient } from "../../services/clientService";
import { STATUTS_CLIENT, TYPES_CLIENT, SECTEURS } from "../../utils/constants";

export default function ClientForm({ client, onClose }) {
  const isEdit = !!client;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: client?.nom || "",
    contact: client?.contact || "",
    email: client?.email || "",
    telephone: client?.telephone || "",
    adresse: client?.adresse || "",
    secteur: client?.secteur || "",
    type: client?.type || "entreprise",
    statut: client?.statut || "prospect",
    notes: client?.notes || "",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isEdit) {
        await updateClient(client.id, form);
      } else {
        await addClient(form);
      }
      onClose();
    } catch {
      setError("Une erreur est survenue. Réessayez.");
    }
    setLoading(false);
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>
            {isEdit ? "Modifier le client" : "Ajouter un client"}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Nom / Société *</label>
              <input style={styles.input} name="nom" value={form.nom} onChange={handleChange} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Personne de contact</label>
              <input style={styles.input} name="contact" value={form.contact} onChange={handleChange} />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} type="email" name="email" value={form.email} onChange={handleChange} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Téléphone</label>
              <input style={styles.input} name="telephone" value={form.telephone} onChange={handleChange} />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Type</label>
              <select style={styles.input} name="type" value={form.type} onChange={handleChange}>
                {TYPES_CLIENT.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Secteur</label>
              <select style={styles.input} name="secteur" value={form.secteur} onChange={handleChange}>
                <option value="">Sélectionner</option>
                {SECTEURS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Statut</label>
              <select style={styles.input} name="statut" value={form.statut} onChange={handleChange}>
                {STATUTS_CLIENT.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Adresse</label>
              <input style={styles.input} name="adresse" value={form.adresse} onChange={handleChange} />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Notes internes</label>
            <textarea
              style={{ ...styles.input, minHeight: "80px", resize: "vertical" }}
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Informations complémentaires..."
            />
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>Annuler</button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
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
  modal: { background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "620px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0" },
  modalTitle: { margin: 0, fontSize: "18px", fontWeight: 700 },
  closeBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" },
  form: { padding: "1.5rem" },
  row: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" },
  field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1rem" },
  label: { fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
  actions: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1rem" },
  cancelBtn: { padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "14px" },
  submitBtn: { padding: "10px 24px", borderRadius: "8px", border: "none", background: "#4F46E5", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  error: { color: "red", padding: "0 1.5rem", fontSize: "14px" },
};