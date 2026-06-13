import { useState, useEffect } from "react";
import { addOrder, updateOrder } from "../../services/orderService";
import { getClients } from "../../services/clientService";
import { getProducts } from "../../services/productService";
import { useAuth } from "../../context/AuthContext";
import { TVA_OPTIONS } from "../../utils/constants";

export default function OrderForm({ order, onClose }) {
  const { currentUser } = useAuth();
  const isEdit = !!order;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  const [clientId, setClientId] = useState(order?.clientId || "");
  const [clientNom, setClientNom] = useState(order?.clientNom || "");
  const [tva, setTva] = useState(order?.tva ?? 19);
  const [notes, setNotes] = useState(order?.notes || "");
  const [articles, setArticles] = useState(
    order?.articles || [{ productId: "", productNom: "", quantite: 1, prixUnitaire: 0, total: 0 }]
  );

  useEffect(() => {
    getClients().then(setClients);
    getProducts().then(setProducts);
  }, []);

  function handleClientChange(e) {
    const client = clients.find((c) => c.id === e.target.value);
    setClientId(e.target.value);
    setClientNom(client?.nom || "");
  }

  function handleArticleChange(index, field, value) {
    const updated = [...articles];
    updated[index][field] = value;

    if (field === "productId") {
      const product = products.find((p) => p.id === value);
      updated[index].productNom = product?.nom || "";
      updated[index].prixUnitaire = product?.prix || 0;
    }

    updated[index].total =
      Number(updated[index].quantite) * Number(updated[index].prixUnitaire);
    setArticles(updated);
  }

  function addArticle() {
    setArticles([...articles, { productId: "", productNom: "", quantite: 1, prixUnitaire: 0, total: 0 }]);
  }

  function removeArticle(index) {
    setArticles(articles.filter((_, i) => i !== index));
  }

  const sousTotal = articles.reduce((sum, a) => sum + (a.total || 0), 0);
  const montantTVA = (sousTotal * tva) / 100;
  const total = sousTotal + montantTVA;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!clientId) { setError("Veuillez sélectionner un client."); return; }
    if (articles.some((a) => !a.productId)) { setError("Veuillez sélectionner un produit pour chaque article."); return; }
    setLoading(true);
    setError("");
    try {
      const data = {
        clientId, clientNom, articles,
        sousTotal, tva: Number(tva),
        montantTVA, total, notes,
      };
      if (isEdit) {
        await updateOrder(order.id, data);
      } else {
        await addOrder(data, currentUser.uid);
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
            {isEdit ? "Modifier la commande" : "Nouvelle commande"}
          </h2>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Client */}
          <div style={styles.field}>
            <label style={styles.label}>Client *</label>
            <select style={styles.input} value={clientId} onChange={handleClientChange} required>
              <option value="">Sélectionner un client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.nom}</option>
              ))}
            </select>
          </div>

          {/* Articles */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Articles</h3>
              <button type="button" style={styles.addArticleBtn} onClick={addArticle}>
                + Ajouter un article
              </button>
            </div>

            {articles.map((article, index) => (
              <div key={index} style={styles.articleRow}>
                <div style={{ flex: 2 }}>
                  <label style={styles.label}>Produit</label>
                  <select
                    style={styles.input}
                    value={article.productId}
                    onChange={(e) => handleArticleChange(index, "productId", e.target.value)}
                  >
                    <option value="">Sélectionner</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.nom}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Prix unitaire (DT)</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="0"
                    step="0.01"
                    value={article.prixUnitaire}
                    onChange={(e) => handleArticleChange(index, "prixUnitaire", e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Quantité</label>
                  <input
                    style={styles.input}
                    type="number"
                    min="1"
                    value={article.quantite}
                    onChange={(e) => handleArticleChange(index, "quantite", e.target.value)}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={styles.label}>Total</label>
                  <input style={{ ...styles.input, background: "#f8fafc" }} value={`${Number(article.total).toFixed(2)} DT`} readOnly />
                </div>
                {articles.length > 1 && (
                  <button type="button" style={styles.removeBtn} onClick={() => removeArticle(index)}>✕</button>
                )}
              </div>
            ))}
          </div>

          {/* TVA & Totaux */}
          <div style={styles.totalsSection}>
            <div style={styles.tvaRow}>
              <label style={styles.label}>TVA (%)</label>
              <select style={{ ...styles.input, width: "120px" }} value={tva} onChange={(e) => setTva(e.target.value)}>
                {TVA_OPTIONS.map((t) => <option key={t} value={t}>{t}%</option>)}
              </select>
            </div>
            <div style={styles.totalRows}>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Sous-total</span>
                <span style={styles.totalValue}>{sousTotal.toFixed(2)} DT</span>
              </div>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>TVA ({tva}%)</span>
                <span style={styles.totalValue}>{montantTVA.toFixed(2)} DT</span>
              </div>
              <div style={{ ...styles.totalRow, borderTop: "2px solid #e2e8f0", paddingTop: "8px" }}>
                <span style={{ ...styles.totalLabel, fontWeight: 700, fontSize: "16px" }}>Total TTC</span>
                <span style={{ ...styles.totalValue, fontWeight: 700, fontSize: "18px", color: "#4F46E5" }}>
                  {total.toFixed(2)} DT
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={styles.field}>
            <label style={styles.label}>Notes</label>
            <textarea
              style={{ ...styles.input, minHeight: "70px", resize: "vertical" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Informations complémentaires..."
            />
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>Annuler</button>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? "Enregistrement..." : isEdit ? "Modifier" : "Créer la commande"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" },
  modal: { background: "#fff", borderRadius: "16px", width: "100%", maxWidth: "780px", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.25rem 1.5rem", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, background: "#fff", zIndex: 1 },
  modalTitle: { margin: 0, fontSize: "18px", fontWeight: 700 },
  closeBtn: { background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#64748b" },
  form: { padding: "1.5rem" },
  field: { display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1rem" },
  label: { fontSize: "13px", fontWeight: 600, color: "#374151" },
  input: { padding: "10px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", width: "100%", boxSizing: "border-box" },
  section: { marginBottom: "1.5rem" },
  sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" },
  sectionTitle: { margin: 0, fontSize: "15px", fontWeight: 600, color: "#0f172a" },
  addArticleBtn: { background: "none", border: "1px solid #4F46E5", color: "#4F46E5", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: 600 },
  articleRow: { display: "flex", gap: "12px", alignItems: "flex-end", marginBottom: "12px", background: "#f8fafc", padding: "12px", borderRadius: "8px" },
  removeBtn: { background: "none", border: "none", color: "#DC2626", cursor: "pointer", fontSize: "16px", padding: "8px", alignSelf: "flex-end" },
  totalsSection: { background: "#f8fafc", borderRadius: "10px", padding: "1rem 1.25rem", marginBottom: "1rem" },
  tvaRow: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "1rem" },
  totalRows: { display: "flex", flexDirection: "column", gap: "8px" },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: "14px", color: "#64748b" },
  totalValue: { fontSize: "14px", color: "#0f172a", fontWeight: 500 },
  actions: { display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "1rem" },
  cancelBtn: { padding: "10px 20px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: "14px" },
  submitBtn: { padding: "10px 24px", borderRadius: "8px", border: "none", background: "#4F46E5", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "14px" },
  error: { color: "red", padding: "0 1.5rem", fontSize: "14px", marginBottom: "1rem" },
};