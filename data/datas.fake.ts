import { client, listClients } from "@/types/client.type";
import { contrat, listContrats } from "@/types/contrat.type";
import { cotation, listCotation } from "@/types/devis.type";
import { listVehicules, vehicule } from "@/types/vehicule.type";
import { metaFakeData } from "./fake/params.fake";



export const cotations: cotation[] = [];

export const vehicules: vehicule[] = [
];


export const clients: client[] = [
  {
    id: 1,
    civilite: 1,
    typeId: 1,
    nom: "Ange mariotte",
    prenoms: "Ange",
    code: "CODE-001",
    email: "email@example.com",
    mobile: "0123456789",
    tel: "0123456789",
    whatsapp: "0123456789",
    bP: "Adresse 1",
    professionId: 1,
    libProfession: "Agriculteur"
  },
  {
    id: 2,
    civilite: 2,
    typeId: 2,
    nom: "Jean Dupont",
    prenoms: "Jean",
    code: "CODE-002",
    email: "jean.dupont@example.com",
    mobile: "0987654321",
    tel: "0987654321",
    whatsapp: "0987654321",
    bP: "Adresse 2",
    professionId: 2,
    libProfession: "Commerçant"
  },
  {
    id: 3,
    civilite: 1,
    typeId: 1,
    nom: "Alice Martin",
    prenoms: "Alice" ,
    code: "CODE-003",
    email: "alice.martin@example.com",
    mobile: "0123456789",
    tel: "0123456789",
    whatsapp: "0123456789",
    bP : "Adresse 3",
    professionId: 3,
    libProfession: "Enseignant"
    },
];



export const contrats: contrat[] = [
  {
    id: 1,
    numeroContrat: "CTR-2026-001",
    categorie: "NOUVELLE AFFAIRE",
    dateContrat: new Date("2026-01-15"),
    numeroPolice: "POL-2026-0001",
    numeroAttestation: "ATT-2026-0001",
    immatriculation: "AB-123-CI",
    assureType: "PERSONNE PHYSIQUE",
    assureNom: "KONAN Jean Paul",
    assureTel: "+225 07 00 11 22",
    assureEmail: "konan@example.com",
    assureBp: "01 BP 1234 Abidjan",
    assureProfession: "Commerçant",
    souscripteurType: "PERSONNE PHYSIQUE",
    souscripteurNom: "KONAN Jean Paul",
    souscripteurTel: "+225 07 00 11 22",
    souscripteurEmail: "konan@example.com",
    souscripteurBp: "01 BP 1234 Abidjan",
    agence: "SCA NOUVELLE ERE",
    compagnie: "NSIA",
    duree: "12 mois",
    nombreJours: 365,
    couverture: "Tous Risques",
    dateEffet: new Date("2026-01-15"),
    dateEcheance: new Date("2027-01-14"),
    primeNette: 120000,
    accessoires: 5000,
    taxe: 15000,
    taxeFga: 2000,
    cedeao: 5000,
    netAPayer: 147000,
  },
  {
    id: 2,
    numeroContrat: "CTR-2026-002",
    categorie: "RENOUVELLEMENT",
    dateContrat: new Date("2026-02-01"),
    numeroPolice: "POL-2026-0002",
    numeroAttestation: "ATT-2026-0002",
    immatriculation: "CD-456-CI",
    assureType: "PERSONNE PHYSIQUE",
    assureNom: "BAMBA Aminata",
    assureTel: "+225 05 44 55 66",
    assureEmail: "bamba@example.com",
    assureBp: "Cocody, Abidjan",
    assureProfession: "Infirmière",
    souscripteurType: "PERSONNE PHYSIQUE",
    souscripteurNom: "BAMBA Aminata",
    souscripteurTel: "+225 05 44 55 66",
    souscripteurEmail: "bamba@example.com",
    souscripteurBp: "Cocody, Abidjan",
    agence: "AGENCE PLATEAU",
    compagnie: "AXA",
    duree: "12 mois",
    nombreJours: 365,
    couverture: "Tierce Collision",
    dateEffet: new Date("2026-02-01"),
    dateEcheance: new Date("2027-01-31"),
    primeNette: 95000,
    accessoires: 4000,
    taxe: 12000,
    taxeFga: 1500,
    cedeao: 5000,
    netAPayer: 117500,
  },
  {
    id: 3,
    numeroContrat: "CTR-2026-003",
    categorie: "NOUVELLE AFFAIRE",
    dateContrat: new Date("2026-03-10"),
    numeroPolice: "POL-2026-0003",
    numeroAttestation: "ATT-2026-0003",
    immatriculation: "EF-789-CI",
    assureType: "PERSONNE MORALE",
    assureNom: "TRANSPORT RAPIDE SARL",
    assureTel: "+225 21 30 40 50",
    assureEmail: "transport@example.com",
    assureBp: "Marcory, Abidjan",
    assureProfession: "Transport",
    souscripteurType: "PERSONNE MORALE",
    souscripteurNom: "TRANSPORT RAPIDE SARL",
    souscripteurTel: "+225 21 30 40 50",
    souscripteurEmail: "transport@example.com",
    souscripteurBp: "Marcory, Abidjan",
    agence: "AGENCE YOPOUGON",
    compagnie: "SUNU",
    duree: "12 mois",
    nombreJours: 365,
    couverture: "RC Simple",
    dateEffet: new Date("2026-03-10"),
    dateEcheance: new Date("2027-03-09"),
    primeNette: 45000,
    accessoires: 3000,
    taxe: 6000,
    taxeFga: 800,
    cedeao: 5000,
    netAPayer: 59800,
  },
  {
    id: 4,
    numeroContrat: "CTR-2025-088",
    categorie: "ANNULÉ",
    dateContrat: new Date("2025-06-01"),
    numeroPolice: "POL-2025-0088",
    numeroAttestation: "ATT-2025-0088",
    immatriculation: "GH-321-CI",
    assureType: "PERSONNE PHYSIQUE",
    assureNom: "OUATTARA Moussa",
    assureTel: "+225 07 77 88 99",
    assureEmail: "ouattara@example.com",
    assureBp: "Abobo, Abidjan",
    assureProfession: "Agriculteur",
    souscripteurType: "PERSONNE PHYSIQUE",
    souscripteurNom: "OUATTARA Moussa",
    souscripteurTel: "+225 07 77 88 99",
    souscripteurEmail: "ouattara@example.com",
    souscripteurBp: "Abobo, Abidjan",
    agence: "SCA NOUVELLE ERE",
    compagnie: "ALLIANZ",
    duree: "6 mois",
    nombreJours: 183,
    couverture: "RC Simple",
    dateEffet: new Date("2025-06-01"),
    dateEcheance: new Date("2025-11-30"),
    primeNette: 25000,
    accessoires: 2000,
    taxe: 3500,
    taxeFga: 500,
    cedeao: 5000,
    netAPayer: 36000,
  },
];

export const contratsFakeData: listContrats = {
  meta: metaFakeData,
  data: contrats,
};


export const cotationsFakeData: listCotation = {
  meta: metaFakeData,
  data: cotations,
};

export const clientsFakeData: listClients = {
  meta: metaFakeData,
  data: clients,
};


export const vehiculesFakeData: listVehicules = {
  meta: metaFakeData,
  data: vehicules,
};
