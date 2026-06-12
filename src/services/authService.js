import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Inscription
export async function register(email, password, nom, prenom, role = "employe") {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Sauvegarde dans Firestore
  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    email,
    nom,
    prenom,
    role,
    statut: "actif",
    createdAt: serverTimestamp(),
  });

  return user;
}

// Connexion
export async function login(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

// Déconnexion
export async function logout() {
  await signOut(auth);
}

// Réinitialisation mot de passe
export async function resetPassword(email) {
  await sendPasswordResetEmail(auth, email);
}