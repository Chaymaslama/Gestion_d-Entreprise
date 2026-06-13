import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "./firebase";

const COL = "employees";

// Ajouter un employé
export async function addEmployee(data) {
  const docRef = await addDoc(collection(db, COL), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

// Récupérer tous les employés
export async function getEmployees() {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Récupérer un employé par ID
export async function getEmployee(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

// Modifier un employé
export async function updateEmployee(id, data) {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Supprimer un employé
export async function deleteEmployee(id) {
  await deleteDoc(doc(db, COL, id));
}

// Filtrer par statut
export async function getEmployeesByStatus(statut) {
  const q = query(
    collection(db, COL),
    where("statut", "==", statut),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Filtrer par département
export async function getEmployeesByDepartment(departement) {
  const q = query(
    collection(db, COL),
    where("departement", "==", departement),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}