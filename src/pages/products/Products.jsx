import { useState } from "react";
import { useProducts } from "../../hooks/useProducts";
import { deleteProduct } from "../../services/productService";
import { STATUTS_PRODUIT, CATEGORIES_PRODUIT } from "../../utils/constants";
import ProductForm from "./ProductForm";
import StockMovementModal from "./StockMovementModal";

export default function Products() {
  const { products, loading, refetch } = useProducts();
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [selected, setSelected] = useState(null);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.nom?.toLowerCase().includes(search.toLowerCase()) ||
      p.reference?.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat ? p.categorie === filterCat : true;
    return matchSearch && matchCat;
  });

  const lowStock = products.filter((p) => p.quantite <= p.quantiteMin);

  async function handleDelete(id) {
    if (!window.confirm("Supprimer ce produit ?")) return;
    await deleteProduct(id);
    refetch();
  }

  function handleClose() {
    setShowForm(false);
    setShowStock(false);
    setSelected(null);
    refetch();
  }

  if (loading) return <p style={{ padding: "2rem" }}>Chargement...</p>;

  return (
    <div>
      {/* Alerte stock faible */}
      {lowStock.length > 0 && (
        <div style={styles.alert}>
          ⚠️ <strong>{lowStock.length} produit(s)</strong> en stock faible :&nbsp;
          {lowStock.map((p) => p.nom).join(", ")}
        </div>
      )}

      {/* Toolbar */}
      <div style={styles.toolbar}>
        <input
          style={styles.search}
          placeholder="🔍 Rechercher un produit..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          style={styles.select}
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="">Toutes les catégories</option>
          {CATEGORIES_PRODUIT.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button style={styles.addBtn} onClick={() => { setSelected(null); setShowForm(true); }}>
          + Ajouter un produit
        </button>
      </div>

      <p style={styles.count}>{filtered.length} produit(s) trouvé(s)</p>

      {/* Table */}
      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Produit</th>
              <th style={styles.th}>Référence</th>
              <th style={styles.th}>Catégorie</th>
              <th style={styles.th}>Prix</th>
              <th style={styles.th}>Stock</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} style={styles.empty}>Aucun produit trouvé</td></tr>
            ) : (
              filtered.map((product) => {
                const statut = STATUTS_PRODUIT.find((s) => s.value === product.statut);
                const isLow = product.quantite <= product.quantiteMin;
                return (
                  <tr key={product.id} style={styles.tr}>
                    <td style={styles.td}>
                      <p style={styles.productName}>{product.nom}</p>
                      <p style={styles.productDesc}>{product.description?.slice(0, 40)}</p>
                    </td>
                    <td style={styles.td}>
                      <code style={styles.ref}>{product.reference || "—"}</code>
                    </td>
                    <td style={styles.td}>{product.categorie || "—"}</td>
                    <td style={styles.td}>
                      <strong>{Number(product.prix || 0).toFixed(2)} DT</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{ color: isLow ? "#DC2626" : "#059669", fontWeight: 600 }}>
                        {product.quantite} {product.unite}
                        {isLow && " ⚠️"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.badge,
                        background: statut?.bg || "#f1f5f9",
                        color: statut?.color || "#64748b",
                      }}>
                        {statut?.label || product.statut}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        style={styles.stockBtn}
                        title="Mouvement de stock"
                        onClick={() => { setSelected(product); setShowStock(true); }}
                      >📦</button>
                      <button style={styles.editBtn} onClick={() => { setSelected(product); setShowForm(true); }}>✏️</button>
                      <button style={styles.deleteBtn} onClick={() => handleDelete(product.id)}>🗑️</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showForm && <ProductForm product={selected} onClose={handleClose} />}
      {showStock && <StockMovementModal product={selected} onClose={handleClose} />}
    </div>
  );
}

const styles = {
  alert: { background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "8px", padding: "12px 16px", marginBottom: "1rem", fontSize: "14px", color: "#92400E" },
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
  productName: { margin: 0, fontWeight: 600 },
  productDesc: { margin: 0, fontSize: "12px", color: "#64748b" },
  ref: { background: "#f1f5f9", padding: "2px 8px", borderRadius: "4px", fontSize: "12px" },
  badge: { padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 500 },
  stockBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", marginRight: "4px" },
  editBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px", marginRight: "4px" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: "16px" },
  empty: { textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "14px" },
};