import { useState } from "react";
import { addProduct, updateProduct } from "../../services/productService";
import { CATEGORIES_PRODUIT, STATUTS_PRODUIT, UNITES } from "../../utils/constants";

export default function ProductForm({ product, onClose }) {
  const isEdit = !!product;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: product?.nom || "",
    description: product?.description || "",
    reference: product?.reference || "",
    categorie: product?.categorie || "",
    prix: product?.prix || "",
    quantite: product?.quantite || 0,
    quantiteMin: product?.quantiteMin || 1,
    unite: product?.unite || "pièce",
    statut: product?.statut || "disponible",
  });

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = {
        ...form,
        prix: Number(form.prix),
        quantite: Number(form.quantite),
        quantiteMin: Number(form.quantiteMin),
      };
      if (isEdit) {
        await updateProduct(product.id, data);
      } else {
        await addProduct(data);
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
            {isEdit ? "Modifier le produit" : "Ajouter un produit"}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Nom du produit *</label>
              <input style={styles.input} name="nom" value={form.nom} onChange={handleChange} required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Référence</label>
              <input style={styles.input} name="reference" value={form.reference} onChange={handleChange} />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea style={{ ...styles.input, minHeight: "70px", resize: "vertical" }} name="description" value={form.description} onChange={handleChange} />
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Catégorie</label>
              <select style={styles.input} name="categorie" value={form.categorie} onChange={handleChange}>
                <option value="">Sélectionner</option>
                {CATEGORIES_PRODUIT.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Prix (DT) *</label>
              <input style={styles.input} type="number" name="prix" value={form.prix} onChange={handleChange} min="0" step="0.01" required />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Quantité en stock</label>
              <input style={styles.input} type="number" name="quantite" value={form.quantite} onChange={handleChange} min="0" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Seuil alerte stock faible</label>
              <input style={styles.input} type="number" name="quantiteMin" value={form.quantiteMin} onChange={handleChange} min="0" />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Unité</label>
              <select style={styles.input} name="unite" value={form.unite} onChange={handleChange}>
                {UNITES.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Statut</label>
              <select style={styles.input} name="statut" value={form.statut} onChange={handleChange}>
                {STATUTS_PRODUIT.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
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