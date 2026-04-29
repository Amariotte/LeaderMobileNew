import { client, listClients } from "@/types/client.type";
import { contrat, listContrats } from "@/types/contrat.type";
import { cotation, listCotation } from "@/types/devis.type";
import { encaissementPrime, listEncaissementsPrimes } from "@/types/encaissementPrime.type";
import { listMouvements } from "@/types/mouvements.type";
import { listOperations, operation } from "@/types/operations.type";
import { dataChart, itemDefaut, meta, stat } from "@/types/other.type";
import { listProduits } from "@/types/produits.type";
import { listPromotions } from "@/types/promotions.type";
import { SoldeResponse } from "@/types/solde.type";
import { stockCourtier, stockProducteur } from "@/types/stock.type";
import { AuthResponse, user } from "@/types/user.type";
import { listVehicules, vehicule } from "@/types/vehicule.type";
import { detailsVente, listVentes } from "@/types/ventes.type";

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

export const produitsFakeData: listProduits = {
  meta: metaFakeData,
  data: [
    {
      id: "prod-001",
      designation: "Ciment gris 50kg",
      reference: "CIM-50-001",
      nomfamille: "Construction",
      prixVenteTTC: 18500,
      stockMini: 10,
      stockMaxi: 100,
      stock: 25,
    },
    {
      id: "prod-002",
      designation: "Peinture acrylique 5L",
      reference: "PEI-5L-002",
      nomfamille: "Peinture",
      prixVenteTTC: 45000,
      stockMini: 5,
      stockMaxi: 50,
      stock: 20,
    },
    {
      id: "prod-003",
      designation: "Fer à béton 12mm",
      reference: "FER-12-003",
      nomfamille: "Construction",
      prixVenteTTC: 750000,
      stockMini: 20,
      stockMaxi: 200,
      stock: 150,
    },
    {
      id: "prod-004",
      designation: "Interrupteur simple",
      reference: "INT-S-004",
      nomfamille: "Électricité",
      prixVenteTTC: 1500,
      stockMini: 10,
      stockMaxi: 100,
      stock: 30,
    },
    {
      id: "prod-005",
      designation: "Prise électrique double",
      reference: "PRI-D-005",
      nomfamille: "Électricité",
      prixVenteTTC: 2500,
      stockMini: 5,
      stockMaxi: 50,
      stock: 20,
    },
    {
      id: "prod-006",
      designation: "Vernis bois 1L",
      reference: "VER-1L-006",
      nomfamille: "Peinture",
      prixVenteTTC: 30000,
      stockMini: 5,
      stockMaxi: 50,
      stock: 100,
    },
  ],
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

export const fallbackItems: detailsVente[] = [
  {
    id: "1",
    qteLivree: 0,
    prixVenteTTC: 0,
    prixVenteHT: 0,
    qteVendue: 0,
    txTaxe: 0,
    txRemise: 0,
    remisePrix: 0,
    montantRemiseHT: 0,
    montantRemiseTTC: 0,
    montantTTC: 0,
    montantHT: 0,
    montantBrutHT: 0,
    montantBrutTTC: 0,
    montantTaxe: 0,
    qteGratuite: 0,
    reference: "",
    descPackage: "",
    designation: "",
  },
];

export const ventesFakeData: listVentes = {
  meta: metaFakeData,
  data: [
    {
      id: "fac-001",
      codeVente: "FAC-2026-001",
      descVente: "Vente de matériaux de construction",
      nomClient: "Ets Mavungu Construction",
      nomSite: "Agence Gombe",
      nomUser: "M. Ilunga",
      dateVente: new Date("2026-03-17"),
      dateEchVente: new Date("2026-04-17"),
      dateLivSouhaite: new Date("2026-03-25"),
      lieuLivSouhaite: "Chantier Mavungu, Gombe",
      soldeVente: 50000,
      nbProduits: 3,
      totalHT: 125000,
      totalTaxe: 25000,
      totalNetPayer: 150000,
      totalBrutHT: 125000,
      totalBrutTTC: 150000,
      totalRemCialeHT: 0,
      totalRemCialeTTC: 0,
      status: "Non soldée",
      details: fallbackItems,
    },
    {
      id: "fac-002",
      codeVente: "FAC-2026-002",
      descVente: "Vente de peintures et accessoires",
      nomClient: "Société Lumière Services",
      nomSite: "Agence Limete",
      nomUser: "Mme Kanku",
      dateVente: new Date("2026-03-16"),
      dateEchVente: new Date("2026-04-16"),
      dateLivSouhaite: new Date("2026-03-26"),
      lieuLivSouhaite: "Bureau Lumière Services, Limete",
      soldeVente: 0,
      nbProduits: 5,
      totalHT: 200000,
      totalTaxe: 40000,
      totalNetPayer: 240000,
      totalBrutHT: 200000,
      totalBrutTTC: 240000,
      totalRemCialeHT: 0,
      totalRemCialeTTC: 0,
      status: "Soldée",
      details: fallbackItems,
    },
  ],
};

export const promotionsFakeData: listPromotions = {
  meta: metaFakeData,
  data: [
    {
      id: "promo-001",
      description: "Promotion spéciale sur les produits de construction",
      nomProduit: "Ciment gris 50kg",
      dateDebut: new Date("2026-03-01"),
      dateFin: new Date("2026-03-31"),
      nbMax: 100,
      status: "En cours",
    },
    {
      id: "promo-002",
      description: "Offre de printemps sur les peintures",
      nomProduit: "Peinture blanche 20L",
      dateDebut: new Date("2026-04-01"),
      dateFin: new Date("2026-04-30"),
      nbMax: 50,
      status: "A venir",
    },
    {
      id: "promo-003",
      description: "Remise sur les équipements électriques",
      nomProduit: "Interrupteur double",
      dateDebut: new Date("2026-03-15"),
      dateFin: new Date("2026-03-25"),
      nbMax: 200,
      status: "En cours",
    },
  ],
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
    id: "reg-001",
    codeReg: "REG-2026-001",
    nomClient: "Ets Mavungu Construction",
    nomSite: "Agence Gombe",
    nomUser: "M. Ilunga",
    dateReg: new Date("2026-03-17"),
    montantReg: 150000,
    refReg: "REF-REG-001",
    nomModePaiement: "Espèces",
  },
  {
    id: "reg-002",
    codeReg: "REG-2026-002",
    nomClient: "Société Lumière Services",
    nomSite: "Agence Limete",
    nomUser: "Mme Kanku",
    dateReg: new Date("2026-03-16"),
    montantReg: 89000,
    refReg: "REF-REG-002",
    nomModePaiement: "Virement",
  },
];

export const operations: operation[] = [
  {
    id: "op-001",
    codeOp: "OP-2026-001",
    dateOp: new Date("2026-03-17"),
    montantOp: 150000,
    libType: "Décaissement",
    nomAgence: "Agence Gombe",
    nomSousCompte: "Ets Mavungu Construction",
    solliciteurOp: "M. Ilunga",
    descOp: "",
    depoOrBene: "Ange",
  },
  {
    id: "op-002",
    codeOp: "OP-2026-002",
    dateOp: new Date("2026-03-16"),
    montantOp: 7500,
    libType: "Décaissement",
    nomAgence: "Agence Gombe",
    nomSousCompte: "Ets Mavungu Construction",
    solliciteurOp: "M. Ilunga",
    descOp: "",
    depoOrBene: "Ange",
  },
  {
    id: "op-003",
    codeOp: "OP-2026-003",
    dateOp: new Date("2026-03-16"),
    montantOp: 89000,
    libType: "Décaissement",
    nomAgence: "Agence Limete",
    nomSousCompte: "Société Lumière Services",
    solliciteurOp: "Mme Kanku",
    descOp: "",
    depoOrBene: "Ange",
  },
  {
    id: "op-004",
    codeOp: "OP-2026-004",
    dateOp: new Date("2026-03-15"),
    montantOp: 4450,
    libType: "Décaissement",
    nomAgence: "Agence Limete",
    nomSousCompte: "Société Lumière Services",
    solliciteurOp: "Mme Kanku",
    descOp: "",
    depoOrBene: "Ange",
  },
];

export const cotations: cotation[] = [];

export const vehicules: vehicule[] = [
  
      {
        id: 1,
        numImmatriculation: "AB-123-CD",
        dateImmatriculation: new Date("2020-01-01"),
        dateMiseEnCirculation: new Date("2020-02-01"),
        numSerie: "SERIE123",  
        numCarteGrise: "CARTE123",
        nbPlaces: 5,
        chargeUtile: 500,
        cylindree: 2000,
        puissance: 150,
        nbCartes : 1,
        valeurNeuve: 20000,
        valeurVenale: 15000,
        modele: "Toyota Corolla",
        typeCommercial: "Berline",
        commentaires : "Véhicule en bon état",
        usageId: 1,
        genreId : 1,
        typeId : 1,
        carrosserieId : 1,
        energieId : 1,
        marqueId : 1,
        couleurId : 1,
        categorieId: 1,
        sousCategorieId: 1,
        villeId: 1,
        zoneCirculationId: 1,
        conducteurLuiMeme: true,
  },
  {
    id: 2,
    numImmatriculation: "EF-456-GH",
    dateImmatriculation: new Date("2019-05-15"),
    dateMiseEnCirculation: new Date("2019-06-01"),
    numSerie: "SERIE456",
    numCarteGrise: "CARTE456",
    nbPlaces: 2,
    chargeUtile: 300,
    cylindree: 1500,
    puissance: 100,
    nbCartes : 1,
    valeurNeuve: 15000,
    valeurVenale: 12000,
    modele: "Honda Civic",
    typeCommercial: "Coupe",
    commentaires : "Véhicule en bon état",
    usageId: 2,
    genreId : 2,
    typeId : 2,
    carrosserieId : 2,
    energieId : 2,
    marqueId : 2,
    couleurId : 2,
    categorieId: 2,
    sousCategorieId: 2,
    villeId: 2,
    zoneCirculationId: 2,
    conducteurLuiMeme: false,
    typeConducteur: 1,
    idProfessionConducteur: 1,
    libTypeConducteur: "Chauffeur professionnel",
    nomConducteur: "Michel",
    emailConducteur: "michel@example.com"
  },
  
];


export const clients: client[] = [
  {
    id: 1,
    civilite: 1,
    type: 1,
    nom: "Ange mariotte",
    prenom: "Ange",
    code: "CODE-001",
    email: "email@example.com",
    mobile: "0123456789",
    tel: "0123456789",
    whatsapp: "0123456789",
    boitePostale: "Adresse 1",
    vehicules: vehicules 
  },
  {
    id: 2,
    civilite: 2,
    type: 2,
    nom: "Jean Dupont",
    prenom: "Jean",
    code: "CODE-002",
    email: "jean.dupont@example.com",
    mobile: "0987654321",
    tel: "0987654321",
    whatsapp: "0987654321",
    boitePostale: "Adresse 2",
    vehicules: vehicules 

  },
  {
    id: 3,
    civilite: 1,
    type: 1,
    nom: "Alice Martin",
    prenom: "Alice" ,
    code: "CODE-003",
    email: "alice.martin@example.com",
    mobile: "0123456789",
    tel: "0123456789",
    whatsapp: "0123456789",
    boitePostale : "Adresse 3",
    vehicules: vehicules 
  },
];



export const contrats: contrat[] = [

  {
    id: 1,
  numeroContrat: "CONTRAT-001",
  categorie: "Assurance auto",
  dateContrat: new Date("2026-01-01"),
  numeroPolice: "POLICE-001",
  numeroAttestation: "ATTESTATION-001",
  immatriculation: "AB-123-CD",
  vehiculeId: 1,
  clientId: 1,
  assureType: "Particulier",
  assureNom: "Ange mariotte",
  assureTel: "0123456789",
  assureEmail: "",
  assureBp: "Boîte postale 123",
  assureProfession: "Agriculteur",
  souscripteurType: "Particulier",
  souscripteurNom: "Ange mariotte",
  souscripteurTel: "0123456789",
  souscripteurEmail: "",
  souscripteurBp: "Boîte postale 123",
  agence: "Agence Abidjan",
  compagnie: "Compagnie d'assurance XYZ",
  duree: "1 an",
  nombreJours: 365,
  couverture: "Tous risques",
  dateEffet: new Date("2026-01-01"),
  dateEcheance: new Date("2026-12-31"),
  primeNette: 20000,
  accessoires: 5000,
  taxe: 3000,
  taxeFga: 1000,
  cedeao: 500,
  netAPayer: 28500,
  client: clients[0],
  vehicule: vehicules[0],
  },
  {
    id: 2,
  numeroContrat: "CONTRAT-002",
  categorie: "Assurance auto",
  dateContrat: new Date("2026-02-01"),
  numeroPolice: "POLICE-002",
  numeroAttestation: "ATTESTATION-002",
  immatriculation: "EF-456-GH",
  vehiculeId: 2,
  clientId: 2,
  assureType: "Particulier",
  assureNom: "Jean Dupont",
  assureTel: "0987654321",
  assureEmail: "",
  assureBp: "Boîte postale 456",
  assureProfession: "Commerçant",
  souscripteurType: "Particulier",
  souscripteurNom: "Jean Dupont",
  souscripteurTel: "0987654321",
  souscripteurEmail: "",
  souscripteurBp: "Boîte postale 456",
  agence: "Agence Limete",
  compagnie: "Compagnie d'assurance ABC",
  duree: "1 an",
  nombreJours: 365,
  couverture: "Tiers",
  dateEffet: new Date("2026-02-01"),
  dateEcheance: new Date("2027-01-31"),
  primeNette: 15000,
  accessoires: 3000,
  taxe: 2000,
  taxeFga: 500,
  cedeao: 200,
  netAPayer: 20200,
  client: clients[1],
  vehicule: vehicules[1],
  }
 
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
    nomCompagnie: "Compagnie d'assurance XYZ",
    nomPartenaire: "Agence Abidjan",
    nomProducteur: "Ange mariotte",
    typeAttestation: "Jaune",
    qteDisponibles: 500000,
    qteRecues: 1000000,
    qteRetirees: 250000,
    qteProduites: 750000,
  },
  {
    nomCompagnie: "Compagnie d'assurance ABC",
    nomPartenaire: "Agence Limete",
    nomProducteur: "Jean Dupont",
    typeAttestation: "Jaune",
    qteDisponibles: 300000,
    qteRecues: 500000,
    qteRetirees: 100000,
    qteProduites: 400000,
  },
  {
    nomCompagnie: "Compagnie d'assurance DEF",
    nomPartenaire: "Agence Gombe",
    nomProducteur: "Alice Martin",  
    typeAttestation: "Jaune",
    qteDisponibles: 200000,
    qteRecues: 300000,
    qteRetirees: 50000,
    qteProduites: 250000,
  }
];

export const soldeCourtierFakeData : stockCourtier [] = [
  {
    nomCompagnie: "Compagnie d'assurance XYZ",
    qteDisponibles: 500000,
    qteRecues: 1000000,
    qteRetirees: 250000,
    qteRetireesAfterDistribuees: 0,
    qteDistribuees: 750000,
  },
  {
    nomCompagnie: "Compagnie d'assurance ABC",
    qteDisponibles: 300000,
    qteRecues: 500000,
    qteRetirees: 100000,
    qteRetireesAfterDistribuees: 0,
    qteDistribuees: 400000,
  },
  {
    nomCompagnie: "Compagnie d'assurance DEF",
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

export const villesFakeData: itemDefaut [] = [
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

export const zonesFakeData: itemDefaut [] = [
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

