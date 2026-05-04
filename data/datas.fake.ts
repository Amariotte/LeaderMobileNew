import { client, listClients } from "@/types/client.type";
import { contrat, listContrats } from "@/types/contrat.type";
import { cotation, listCotation } from "@/types/devis.type";
import { encaissementPrime, listEncaissementsPrimes } from "@/types/encaissementPrime.type";
import { listMouvements } from "@/types/mouvements.type";
import { listOperations, operation } from "@/types/operations.type";
import { dataChart, itemDefaut, meta, parametresData, stat } from "@/types/other.type";
import { SoldeResponse } from "@/types/solde.type";
import { stockCourtier, stockProducteur } from "@/types/stock.type";
import { AuthResponse, user } from "@/types/user.type";
import { listVehicules, vehicule } from "@/types/vehicule.type";

export const soldeFake: SoldeResponse = {
  solde: 100000,
};

export const metaFakeData: meta = {
  page: 1,
  next: 2,
  totalPages: 12,
  total: 1116,
  size: 100,
};

export const statsFake: stat = {
  venteNonSoldee: {
    total: 50,
    nbre: 30,
  },
  venteEchue: {
    nbre: 20,
    total: 100000,
  },
  promotionActive: 5,
  sousCompte: 10,
};

export const userDataFake: user = {
  id: "user-123",
  nom: "Ange mariotte",
  code: "AM123",
  ncc: "NCC123",
  telFixe: "0123456789",
  telMobile: "0987654321",
  nomRepresentantLegal: "BEUGRE AIKPA ANGE MARIOTTE",
  dateNaissance: new Date("1990-01-01"),
  adresse: "Abidjan, Cocody, Riviera 2",
  email: "ange.mariotte@example.com",
  nomAgence: "Agence Abidjan",
  photo: "https://example.com/photos/ange-mariotte.jpg",
  civilite: "M.",
  type: "PARTICULIER",
  dateAnniversaire: "26 avril",
  typePiece: "PASSEPORT",
  numPiece: "000  000000",
  plafond: 200000,
};

export const userDataFakeAuthResponse: AuthResponse = {
  access_token: "fake-token",
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "fake-refresh-token",
  user: userDataFake,
};


export const mouvementsFakeData: listMouvements = {
  meta: metaFakeData,
  data: [
    {
      id: "1",
      codeOp: "OP001",
      libType: "Vente",
      dateOp: "17/03/2026",
      montant: 15000,
      type: 1,
      nomAgence: "Agence Centrale",
      nomSousCompte: "Sous-compte A",
    },
    {
      id: "2",
      codeOp: "OP002",
      libType: "Commission",
      dateOp: "18/03/2026",
      montant: 5000,
      type: 1,
      nomAgence: "Agence Centrale",
      nomSousCompte: "Sous-compte B",
    },
    {
      id: "3",
      codeOp: "OP003",
      libType: "Vente",
      dateOp: "19/03/2026",
      montant: 20000,
      type: 1,
      nomAgence: "Agence Centrale",
      nomSousCompte: "Sous-compte C",
    },
    {
      id: "4",
      codeOp: "OP004",
      libType: "Vente",
      dateOp: "20/03/2026",
      montant: 30000,
      type: 2,
      nomAgence: "Agence Centrale",
      nomSousCompte: "Sous-compte D",
    },
  ],
};

export const reglements: encaissementPrime[] = [
  {
    id: 1,
    numero: "ENC-001",
    clientId: 1,
    agenceId: 1,
    banqueId: 1,
    modeId: 1,
    clientCode: "CODE-001",
    agenceNom: "Agence Gombe",
    banqueNom: "Sous-compte A",
    operateurNom: "M. Ilunga",
    date: new Date("2026-03-17"),
    montant: 150000,
    montantUtilise: 50000,
    solde: 100000,
    obs: "Encaissement de la facture FAC-2026-001",
    ref: "FAC-2026-001",

  },
];

 

export const operations: operation[] = [
  {
    id: 1,
    numero: "OP001",
    date: new Date("2026-03-17"),
    montant: 150000,
    agenceNom: "Agence Gombe",
    banqueNom: "Sous-compte A",
    modeNom: "Espèces",
    operateurNom: "M. Ilunga",
    objetOp: "Paiement de la facture FAC-2026-001",
    beneOrDep: "Encaissement",
    bEnc: true,
    desc: "Encaissement de la facture FAC-2026-001",
    modeId: 1,
    agenceId: 1,
    banqueId: 1,
  },
];

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

export const dataChartsFakeData: dataChart[] = [
  {
    mois: "Janvier",
    vente: 150000,
    decaissement: 50000,
    commission: 7500,
    reglement: 120000,
    encaissement: 100000,
    entree: 150000,
    sortie: 50000,
  },
  {
    mois: "Février",
    vente: 200000,
    decaissement: 80000,
    commission: 10000,
    reglement: 180000,
    encaissement: 150000,
    entree: 200000,
    sortie: 80000,
  },
  {
    mois: "Mars",
    vente: 250000,
    decaissement: 120000,
    commission: 12500,
    reglement: 220000,
    encaissement: 200000,
    entree: 250000,
    sortie: 120000,
  },
];


reglements



export const contratsFakeData: listContrats = {
  meta: metaFakeData,
  data: contrats,
};



export const reglementsFakeData: listEncaissementsPrimes = {
  meta: metaFakeData,
  data: reglements,
};

export const operationsFakeData: listOperations = {
  meta: metaFakeData,
  data: operations,
};


export const cotationsFakeData: listCotation = {
  meta: metaFakeData,
  data: cotations,
};
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

export const clientsFakeData: listClients = {
  meta: metaFakeData,
  data: clients,
};


export const vehiculesFakeData: listVehicules = {
  meta: metaFakeData,
  data: vehicules,
};

export const professionsFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "PROF-001",
    libelle: "Agriculteur",
  },
  {
    id: 2,
    code: "PROF-002",
    libelle: "Commerçant",
  },
  {
    id: 3,
    code: "PROF-003",
    libelle: "Artisan",
  },
  {
    id: 4,
    code: "PROF-004",
    libelle: "Profession libérale",
  },
];

export const genresFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "GEN-001",
    libelle: "Tourisme",
  },
  {
    id: 2,
    code: "GEN-002",
    libelle: "Utilitaire",
  },
  {
    id: 3,
    code: "GEN-003",
    libelle: "Camion",
  },
  {
    id: 4,
    code: "GEN-004",
    libelle: "Moto",
  },
];

export const carroreseriesFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "CAR-001",
    libelle: "Berline",
  },
  {
    id: 2,
    code: "CAR-002",
    libelle: "SUV",
  },
  {
    id: 3,
    code: "CAR-003",
    libelle: "Break",
  },
  {
    id: 4,
    code: "CAR-004",
    libelle: "Pickup",
  },
];

export const energiesFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "ENE-001",
    libelle: "Essence",
  },
  {
    id: 2,
    code: "ENE-002",
    libelle: "Diesel",
  },
  {
    id: 3,
    code: "ENE-003",
    libelle: "Hybride",
  },
  {
    id: 4,
    code: "ENE-004",
    libelle: "Electrique",
  },
];

export const marquesFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "MAR-001",
    libelle: "Toyota",
  },
  {
    id: 2,
    code: "MAR-002",
    libelle: "Hyundai",
  },
  {
    id: 3,
    code: "MAR-003",
    libelle: "Peugeot",
  },
  {
    id: 4,
    code: "MAR-004",
    libelle: "Renault",
  },
];

export const couleursFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "COU-001",
    libelle: "Blanc",
  },
  {
    id: 2,
    code: "COU-002",
    libelle: "Noir",
  },
  {
    id: 3,
    code: "COU-003",
    libelle: "Gris",
  },
  {
    id: 4,
    code: "COU-004",
    libelle: "Bleu",
  },
];

export const UsagesFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "USA-001",
    libelle: "Affaire",
  },
  {
    id: 2,
    code: "USA-002",
    libelle: "Personnel",
  },
  {
    id: 3,
    code: "USA-003",
    libelle: "Transport",
  },
  {
    id: 4,
    code: "USA-004",
    libelle: "Mixte",
  },
];

export const VehiculeTypesFakeData: itemDefaut [] = [
   {
    id: 1,
    code: "VP",
    libelle: "VP  (Véhicule de tourisme)",
  },
  {
    id: 2,
    code: "VUL",
    libelle: "VUL (Véhicule utilitaire léger)",
  },
  {
    id: 3,
    code: "PL",
    libelle: "PL (Poids lourd)",
  },
];

export const zonesFakeData: itemDefaut [] = [
   {
    id: 1,
    code: "Abidjan",
    libelle: "Abidjan",
  },
  {
    id: 2,
    code: "Yamoussoukro",
    libelle: "Yamoussoukro",
  },
  {
    id: 3,
    code: "Bouake",
    libelle: "Bouake",
  },
];


export const categorieVehiculeFakeData: itemDefaut [] = [
   {
    id: 1,
    code: "Promenade et affaires",
    libelle: "Promenade et affaires",
  },
  {
    id: 2,
    code: "Véhicule de transport",
    libelle: "Véhicule de transport",
  },
  {
    id: 3,
    code: "Véhcule professionnel",
    libelle: "Véhcule professionnel",
  },
];




export const sousCategoriesFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "Standard",
    libelle: "Standard",
  },
  {
    id: 2,
    code: "Premium",
    libelle: "Premium",
  },
  {
    id: 3,
    code: "Entreprise",
    libelle: "Entreprise",
  },
];

export const GroupesZonesFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "Urbain",
    libelle: "Urbain",
  },
  {
    id: 2,
    code: "Inter-urbain",
    libelle: "Inter-urbain",
  },
  {
    id: 3,
    code: "National",
    libelle: "National",
  },
];


export const parametresFakeData: parametresData = {
  couvertures: { data: [] },
  baremes: { data: UsagesFakeData },
  types: { data: VehiculeTypesFakeData },
  genres: { data: genresFakeData },
  carrosseries: { data: carroreseriesFakeData },
  marques: { data: marquesFakeData },
  energies: { data: energiesFakeData },
  usages: { data: UsagesFakeData },
  couleurs: { data: couleursFakeData },
  professions: { data: professionsFakeData },
  zonesCirculations: { data: zonesFakeData },
  groupesZones: { data: GroupesZonesFakeData },
  motifsAnnulations: { data: [] }
}
