import {
  collection, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy, where,
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "clients";

export async function addClient(data) {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getClients() {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getClient(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateClient(id, data) {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteClient(id) {
  await deleteDoc(doc(db, COL, id));
}

export async function getClientsByStatus(statut) {
  const q = query(
    collection(db, COL),
    where("statut", "==", statut),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}