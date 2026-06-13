import {
  collection, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy, where, increment,
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "products";
const MOV = "stock_movements";

// ── Produits ──────────────────────────────────────
export async function addProduct(data) {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getProducts() {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getProduct(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateProduct(id, data) {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, COL, id));
}

export async function getLowStockProducts() {
  const products = await getProducts();
  return products.filter((p) => p.quantite <= p.quantiteMin);
}

// ── Mouvements de stock ───────────────────────────
export async function addStockMovement(productId, productNom, type, quantite, motif, userId) {
  // Enregistre le mouvement
  await addDoc(collection(db, MOV), {
    productId,
    productNom,
    type,
    quantite: Number(quantite),
    motif,
    createdBy: userId,
    createdAt: serverTimestamp(),
  });

  // Met à jour la quantité du produit
  const delta = type === "entree" ? Number(quantite) : -Number(quantite);
  await updateDoc(doc(db, COL, productId), {
    quantite: increment(delta),
    updatedAt: serverTimestamp(),
  });
}

export async function getStockMovements(productId = null) {
  let q;
  if (productId) {
    q = query(
      collection(db, MOV),
      where("productId", "==", productId),
      orderBy("createdAt", "desc")
    );
  } else {
    q = query(collection(db, MOV), orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}