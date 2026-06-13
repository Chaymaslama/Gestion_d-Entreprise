import {
  collection, getDocs, query,
  orderBy, limit, where, onSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";

// Stats générales en temps réel
export function listenDashboardStats(callback) {
  const collections = ["employees", "clients", "products", "orders"];
  const stats = { employes: 0, clients: 0, produits: 0, commandes: 0 };
  let loaded = 0;

  collections.forEach((col) => {
    const q = query(collection(db, col));
    onSnapshot(q, (snap) => {
      if (col === "employees") stats.employes = snap.size;
      if (col === "clients") stats.clients = snap.size;
      if (col === "products") stats.produits = snap.size;
      if (col === "orders") stats.commandes = snap.size;
      loaded++;
      if (loaded >= 1) callback({ ...stats });
    });
  });
}

// Chiffre d'affaires du mois
export async function getMonthlyRevenue() {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString().split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString().split("T")[0];

  const q = query(
    collection(db, "transactions"),
    where("type", "==", "revenu"),
    where("statut", "==", "paye"),
    where("date", ">=", firstDay),
    where("date", "<=", lastDay)
  );
  const snap = await getDocs(q);
  return snap.docs.reduce((sum, d) => sum + (d.data().montant || 0), 0);
}

// Commandes par mois (6 derniers mois)
export async function getOrdersByMonth() {
  const months = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
                  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
  const now = new Date();
  const result = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({ mois: months[d.getMonth()], commandes: 0, _month: d.getMonth(), _year: d.getFullYear() });
  }

  const snap = await getDocs(collection(db, "orders"));
  snap.docs.forEach((doc) => {
    const data = doc.data();
    const date = data.createdAt?.toDate?.();
    if (!date) return;
    const entry = result.find(
      (r) => r._month === date.getMonth() && r._year === date.getFullYear()
    );
    if (entry) entry.commandes++;
  });

  return result;
}

// Transactions récentes
export async function getRecentTransactions(n = 5) {
  const q = query(
    collection(db, "transactions"),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Produits en stock faible
export async function getLowStockAlerts() {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .filter((p) => p.quantite <= p.quantiteMin);
}

// Commandes récentes
export async function getRecentOrders(n = 5) {
  const q = query(
    collection(db, "orders"),
    orderBy("createdAt", "desc"),
    limit(n)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}