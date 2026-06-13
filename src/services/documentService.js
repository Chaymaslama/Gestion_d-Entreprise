import {
  collection, addDoc, getDocs, getDoc,
  updateDoc, deleteDoc, doc,
  serverTimestamp, query, orderBy, where,
} from "firebase/firestore";
import {
  ref, uploadBytesResumable, getDownloadURL, deleteObject,
} from "firebase/storage";
import { db, storage } from "./firebase";

const COL = "documents";

// Upload fichier + sauvegarde Firestore
export async function uploadDocument(file, metadata, userId, onProgress) {
  // 1. Upload vers Firebase Storage
  const storageRef = ref(storage, `documents/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      (error) => reject(error),
      async () => {
        // 2. Récupère l'URL publique
        const fichierURL = await getDownloadURL(uploadTask.snapshot.ref);

        // 3. Sauvegarde dans Firestore
        const docRef = await addDoc(collection(db, COL), {
          ...metadata,
          fichierURL,
          fichierNom: file.name,
          fichierTaille: file.size,
          fichierType: file.type,
          uploadedBy: userId,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        resolve(docRef.id);
      }
    );
  });
}

export async function getDocuments() {
  const q = query(collection(db, COL), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getDocument(id) {
  const snap = await getDoc(doc(db, COL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateDocument(id, data) {
  await updateDoc(doc(db, COL, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDocument(id, fichierURL) {
  // Supprime de Firestore
  await deleteDoc(doc(db, COL, id));

  // Supprime de Storage
  try {
    const fileRef = ref(storage, fichierURL);
    await deleteObject(fileRef);
  } catch {
    // Fichier déjà supprimé ou URL invalide
  }
}

export async function getDocumentsByCategory(categorie) {
  const q = query(
    collection(db, COL),
    where("categorie", "==", categorie),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Formate la taille du fichier
export function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}