import {
  collection, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy, where,
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "transactions";

export async function addTransaction(data, userId) {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    montant: Number(data.montant),
    createdBy: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getTransactions() {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateTransaction(id, data) {
  await updateDoc(doc(db, COL, id), {
    ...data,
    montant: Number(data.montant),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteTransaction(id) {
  await deleteDoc(doc(db, COL, id));
}

export async function getTransactionsByType(type) {
  const q = query(
    collection(db, COL),
    where("type", "==", type),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Calcul des statistiques
export function calcStats(transactions) {
  const revenus = transactions
    .filter((t) => t.type === "revenu" && t.statut === "paye")
    .reduce((sum, t) => sum + t.montant, 0);

  const depenses = transactions
    .filter((t) => t.type === "depense" && t.statut === "paye")
    .reduce((sum, t) => sum + t.montant, 0);

  const benefice = revenus - depenses;

  const enAttente = transactions
    .filter((t) => t.statut === "en_attente")
    .reduce((sum, t) => sum + t.montant, 0);

  return { revenus, depenses, benefice, enAttente };
}

// Grouper par mois pour les graphiques
export function groupByMonth(transactions) {
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
                  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const result = months.map((mois) => ({ mois, revenus: 0, depenses: 0 }));

  transactions.forEach((t) => {
    if (!t.date) return;
    const month = new Date(t.date).getMonth();
    if (t.type === "revenu" && t.statut === "paye") {
      result[month].revenus += t.montant;
    } else if (t.type === "depense" && t.statut === "paye") {
      result[month].depenses += t.montant;
    }
  });

  return result;
}