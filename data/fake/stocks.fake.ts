import { stockCourtier, stockProducteur } from "@/types/stock.type";


export const MonSoldeFakeData : stockProducteur [] = [
  {
    compagnieId : 1,
    partenaireId: 1,
    producteurId: 1,
    typeId : 1,
   compagnieNom: "Compagnie d'assurance XYZ",
    partenaireNom: "Agence Abidjan",
    producteurNom: "Ange mariotte",
    typeNom: "Jaune",
    qteDisponibles: 500000,
    qteRecues: 1000000,
    qteRetirees: 250000,
    qteProduites: 750000,
  },
  {
    compagnieId : 2,
    partenaireId: 2,
    producteurId: 2,
    typeId : 1,
    compagnieNom: "Compagnie d'assurance ABC",
    partenaireNom: "Agence Gombe",
    producteurNom: "Jean Dupont",
    typeNom: "Rouge",
    qteDisponibles: 300000,
    qteRecues: 500000,
    qteRetirees: 100000,
    qteProduites: 400000,
  },
];

export const soldeCourtierFakeData : stockCourtier [] = [
  {
    compagnieNom: "Compagnie d'assurance XYZ",
    compagnieId: 1,
    qteDisponibles: 500000,
    qteRecues: 1000000,
    qteRetirees: 250000,
    qteRetireesAfterDistribuees: 0,
    qteDistribuees: 750000,
  },
  {
    compagnieNom: "Compagnie d'assurance ABC",
    compagnieId: 2,
    qteDisponibles: 300000,
    qteRecues: 500000,
    qteRetirees: 100000,
    qteRetireesAfterDistribuees: 0,
    qteDistribuees: 400000,
  },
  {
    compagnieNom: "Compagnie d'assurance DEF",
    compagnieId: 3,
    qteDisponibles: 200000,
    qteRecues: 300000,
    qteRetirees: 50000,
    qteRetireesAfterDistribuees: 0,
    qteDistribuees: 250000,
  }
];

