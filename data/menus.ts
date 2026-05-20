export type menuItem = {
  id: string;
  title: string;
  icon: string;
  tint: string;
  featured?: boolean;
};

export const menuItems = [
  {
    id: "devis",
    title: "Faire un devis",
    icon: "request-quote",
    tint: "#d97706",
    featured: true,
  },
  {
    id: "produits",
    title: "Produits",
    icon: "shopping-bag",
    tint: "#10b981",
    featured: true,
  },
  {
    id: "ventes",
    title: "Ventes",
    icon: "receipt",
    tint: "#4f46e5",
    featured: true,
  },

  {
    id: "reglements",
    title: "Règlements",
    icon: "account-balance-wallet",
    tint: "#7c3aed",
    featured: true,
  },
  {
    id: "proformas",
    title: "Proformas",
    icon: "description",
    tint: "#ef4444",
    featured: true,
  },
  {
    id: "bons",
    title: "Bons de livraison",
    icon: "local-shipping",
    tint: "#f59e0b",
    featured: true,
  },

  {
    id: "bonsAchats",
    title: "Bon d'achats",
    icon: "description",
    tint: "#fb7185",
    featured: true,
  },
  {
    id: "promotions",
    title: "Promotions",
    icon: "redeem",
    tint: "#f97316",
    featured: true,
  },
  {
    id: "operations",
    title: "Opérations",
    icon: "trending-down",
    tint: "#eab308",
    featured: true,
  },
  {
    id: "commissions",
    title: "Commissions",
    icon: "percent",
    tint: "#ec4899",
    featured: true,
  },
  {
    id: "sous-comptes",
    title: "Sous comptes",
    icon: "account",
    tint: "#06b6d4",
    featured: true,
  },
];
