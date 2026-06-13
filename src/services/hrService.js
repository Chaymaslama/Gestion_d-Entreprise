import {
  collection, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy, where,
} from "firebase/firestore";
import { db } from "./firebase";

// ── CONGÉS ────────────────────────────────────────

export async function addLeave(data) {
  const docRef = await addDoc(collection(db, "leaves"), {
    ...data,
    statut: "en_attente",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getLeaves() {
  const q = query(collection(db, "leaves"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getLeavesByEmployee(employeeId) {
  const q = query(
    collection(db, "leaves"),
    where("employeeId", "==", employeeId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateLeaveStatus(id, statut, commentaire = "") {
  await updateDoc(doc(db, "leaves", id), {
    statut,
    commentaireRH: commentaire,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteLeave(id) {
  await deleteDoc(doc(db, "leaves", id));
}

// Calcul du nombre de jours ouvrables
export function calcWorkDays(dateDebut, dateFin) {
  const start = new Date(dateDebut);
  const end = new Date(dateFin);
  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

// ── PRÉSENCES ─────────────────────────────────────

export async function addAttendance(data) {
  const docRef = await addDoc(collection(db, "attendance"), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAttendance() {
  const q = query(collection(db, "attendance"), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAttendanceByEmployee(employeeId) {
  const q = query(
    collection(db, "attendance"),
    where("employeeId", "==", employeeId),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getTodayAttendance() {
  const today = new Date().toISOString().split("T")[0];
  const q = query(
    collection(db, "attendance"),
    where("date", "==", today)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function updateAttendance(id, data) {
  await updateDoc(doc(db, "attendance", id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}