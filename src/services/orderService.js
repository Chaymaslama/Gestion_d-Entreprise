import {
  collection, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy, where,
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "orders";

// Génère un numéro de commande unique
function generateOrderNumber() {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `CMD-${year}-${rand}`;
}

export async function addOrder(data, userId) {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    numero: generateOrderNumber(),
    statut: "en_attente",
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getOrders() {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getOrder(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateOrderStatus(id, statut) {
  await updateDoc(doc(db, COL, id), {
    statut,
    updatedAt: serverTimestamp(),
  });
}

export async function updateOrder(id, data) {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteOrder(id) {
  await deleteDoc(doc(db, COL, id));
}

export async function getOrdersByStatus(statut) {
  const q = query(
    collection(db, COL),
    where("statut", "==", statut),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}