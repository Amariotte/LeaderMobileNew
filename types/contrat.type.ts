import { meta } from "./other.type";

export type contrat = {
  id: number;
  numeroContrat: string;
  categorie: string;
  numeroPolice: string;
  numeroAttestation?: string;
  dateContrat: Date;

  clientId?: number;
  agenceId?: number;
  compagnieId?: number;
  baremeId?: number;
  couvertureId?: number;
  vehiculeId?: number;

  // Flat vehicle field
  immatriculation?: string;

  // Flat assure fields
  assureType?: string;
  assureNom?: string;
  assureTel?: string;
  assureEmail?: string;
  assureBp?: string;
  assureProfession?: string;

  // Flat souscripteur fields
  souscripteurType?: string;
  souscripteurNom?: string;
  souscripteurTel?: string;
  souscripteurEmail?: string;
  souscripteurBp?: string;

  // Nested souscripteur (API format)
  souscripteur?: {
    typeId: number;
    professionId: number;
    type: string;
    nom: string;
    tel: string;
    email: string;
    bp: string;
    profession: string;
  };

  agence: string;
  compagnie: string;
  duree?: string;
  nombreJours: number;
  couverture: string;
  dateEffet?: Date;
  dateEcheance?: Date;

  primeNette?: number;
  accessoires?: number;
  taxe?: number;
  taxeFga?: number;
  cedeao?: number;
  netAPayer?: number;

  // Linked objects
  client?: Record<string, unknown>;
  vehicule?: Record<string, unknown>;

  contratVehicule?: contratVehicule[];
};

export type listContrats = {
  meta?: meta;
  data: contrat[];
};


export type contratVehicule = {
  id: number;
  vehiculeId?: number;
  categorie: string;
  numeroPolice: string;
  numeroAttestation: string;

  assure: {
    typeId: number;
    professionId: number;
    type: string;
    nom: string;
    tel: string;
    email: string;
    bp: string;
    profession: string;
  };


  garanties?: garantieVehicule[];
};



export type garantieVehicule = {
  id?: number;
  nomGarantie: string;
  codeGarantie: string;
};
