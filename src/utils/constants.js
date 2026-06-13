export const STATUTS_EMPLOYE = [
  { value: "actif", label: "Actif", color: "#059669", bg: "#ECFDF5" },
  { value: "conge", label: "En congé", color: "#D97706", bg: "#FFFBEB" },
  { value: "suspendu", label: "Suspendu", color: "#DC2626", bg: "#FEF2F2" },
  { value: "demissionnaire", label: "Démissionnaire", color: "#64748b", bg: "#F1F5F9" },
];

export const TYPES_CONTRAT = ["CDI", "CDD", "Stage", "Freelance"];

export const DEPARTEMENTS = [
  "Informatique",
  "Ressources Humaines",
  "Commercial",
  "Finance",
  "Marketing",
  "Logistique",
  "Direction",
];

export const ROLES = [
  { value: "admin", label: "Administrateur" },
  { value: "manager", label: "Manager" },
  { value: "employe", label: "Employé" },
  { value: "client", label: "Client" },
];
export const STATUTS_CLIENT = [
  { value: "actif", label: "Actif", color: "#059669", bg: "#ECFDF5" },
  { value: "inactif", label: "Inactif", color: "#DC2626", bg: "#FEF2F2" },
  { value: "prospect", label: "Prospect", color: "#D97706", bg: "#FFFBEB" },
];

export const TYPES_CLIENT = [
  { value: "entreprise", label: "Entreprise" },
  { value: "particulier", label: "Particulier" },
];

export const SECTEURS = [
  "Informatique", "Commerce", "Industrie", "Santé",
  "Education", "Finance", "Tourisme", "Agriculture", "Autre",
];
export const CATEGORIES_PRODUIT = [
  "Informatique", "Bureautique", "Mobilier", "Électronique",
  "Fournitures", "Outillage", "Alimentaire", "Textile", "Autre",
];

export const STATUTS_PRODUIT = [
  { value: "disponible", label: "Disponible", color: "#059669", bg: "#ECFDF5" },
  { value: "rupture", label: "Rupture", color: "#DC2626", bg: "#FEF2F2" },
  { value: "discontinue", label: "Discontinué", color: "#64748b", bg: "#F1F5F9" },
];

export const UNITES = ["pièce", "kg", "litre", "boîte", "carton", "mètre", "lot"];
export const STATUTS_COMMANDE = [
  { value: "en_attente", label: "En attente", color: "#D97706", bg: "#FFFBEB" },
  { value: "confirmee", label: "Confirmée", color: "#2563EB", bg: "#EFF6FF" },
  { value: "en_cours", label: "En cours", color: "#7C3AED", bg: "#F5F3FF" },
  { value: "livree", label: "Livrée", color: "#059669", bg: "#ECFDF5" },
  { value: "annulee", label: "Annulée", color: "#DC2626", bg: "#FEF2F2" },
];

export const TVA_OPTIONS = [0, 7, 13, 19];
export const CATEGORIES_DOCUMENT = [
  { value: "contrat", label: "Contrat", icon: "📝", color: "#4F46E5", bg: "#EEF2FF" },
  { value: "facture", label: "Facture", icon: "🧾", color: "#059669", bg: "#ECFDF5" },
  { value: "cv", label: "CV", icon: "👤", color: "#0891b2", bg: "#ECFEFF" },
  { value: "attestation", label: "Attestation", icon: "🏅", color: "#D97706", bg: "#FFFBEB" },
  { value: "rapport", label: "Rapport", icon: "📊", color: "#7C3AED", bg: "#F5F3FF" },
  { value: "autre", label: "Autre", icon: "📄", color: "#64748b", bg: "#F1F5F9" },
];