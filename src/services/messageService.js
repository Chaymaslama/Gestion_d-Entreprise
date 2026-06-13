import {
  collection, addDoc, getDocs, doc,
  serverTimestamp, query, orderBy, where,
  onSnapshot, updateDoc, getDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Créer ou récupérer une conversation entre 2 utilisateurs
export async function getOrCreateConversation(currentUser, otherUser) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", currentUser.uid)
  );
  const snap = await getDocs(q);

  // Cherche si conversation existe déjà
  const existing = snap.docs.find((d) =>
    d.data().participants.includes(otherUser.uid)
  );
  if (existing) return { id: existing.id, ...existing.data() };

  // Sinon crée une nouvelle
  const docRef = await addDoc(collection(db, "conversations"), {
    participants: [currentUser.uid, otherUser.uid],
    participantsInfo: {
      [currentUser.uid]: {
        nom: currentUser.displayName || currentUser.email,
        email: currentUser.email,
      },
      [otherUser.uid]: {
        nom: otherUser.nom || otherUser.email,
        email: otherUser.email,
      },
    },
    lastMessage: "",
    lastMessageAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  const newDoc = await getDoc(docRef);
  return { id: newDoc.id, ...newDoc.data() };
}

// Envoyer un message
export async function sendMessage(conversationId, text, senderId, senderNom) {
  await addDoc(
    collection(db, "conversations", conversationId, "messages"),
    {
      text,
      senderId,
      senderNom,
      read: false,
      createdAt: serverTimestamp(),
    }
  );

  // Met à jour le dernier message
  await updateDoc(doc(db, "conversations", conversationId), {
    lastMessage: text,
    lastMessageAt: serverTimestamp(),
  });
}

// Écouter les conversations en temps réel
export function listenConversations(userId, callback) {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("lastMessageAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

// Écouter les messages en temps réel
export function listenMessages(conversationId, callback) {
  const q = query(
    collection(db, "conversations", conversationId, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

// Récupérer tous les utilisateurs
export async function getAllUsers() {
  const snap = await getDocs(collection(db, "users"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}