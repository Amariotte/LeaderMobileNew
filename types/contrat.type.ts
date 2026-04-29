import { client } from "./client.type";
import { meta } from "./other.type";
import { vehicule } from "./vehicule.type";

export type contrat = {
  id: number;
  numeroContrat: string;
  categorie: string;
  dateContrat: Date;
  numeroPolice: string;
  numeroAttestation: string;

  immatriculation: string;
  vehiculeId?: number;
  clientId?: number;

  assureType: string;
  assureNom: string;
  assureTel: string;
  assureEmail: string;
  assureBp: string;
  assureProfession: string;

  souscripteurType: string;
  souscripteurNom: string;
  souscripteurTel: string;
  souscripteurEmail: string;
  souscripteurBp: string;

  agence: string;
  compagnie: string;
  duree: string;
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

  client?: client;
  vehicule?: vehicule;
};

export type listContrats = {
  meta?: meta;
  data: contrat[];
};
