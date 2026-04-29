import { meta } from "./other.type";

export type devisStatus = 'En saisie' | 'Validé' | 'Transformé' | 'En attente' | 'En saisie (opérateur)' | 'Inconnu';

export const statusDevisColorMap: Record<devisStatus, string> = {
  'En saisie': '#f50b0b',
  'Validé': '#e47e08',
  'Transformé': '#16a34a',
  'En attente': '#f5a623',
  'En saisie (opérateur)': '#50b0f5',
  'Inconnu': '#9e9e9e',
};


export type cotation = {
  id: string;
  codeDevis: string;
  nomSousCompte?: string;
  nomAgence?: string;
  operateurSaisie?: string;
  operateurValidation?: string;
  dateDevis: string;
  montant: number;
  status: devisStatus;
  totalRemCciale: number;
  totalRemCialeTTC: number;
  totalRemCialeHT: number;
  totalTaxe: number;
  totalNetPayer: number;
  totalHTBrut: number;
  totalHT: number;
  totalTTCBrut: number;
  nbProduits: number;
  details?: detailsDevis[];
};

export type detailsDevis = {
  id: string;
  qteLivree: number;
  prixVenteTTC: number;
  prixVenteHT: number;
  qteVendue: number;
  txTaxe: number;
  txRemise: number;
  remisePrix: number;
  montantRemiseHT: number;
  montantRemiseTTC: number;
  montantTTC: number;
  montantHT: number;
  montantBrutHT: number;
  montantBrutTTC: number;
  montantTaxe: number;
  qteGratuite: number;
  nomSuplementaire: string;
  reference: string;
  descPackage: string;
  designation: string;
  idProduit: string;
}

export type listCotation = {
  meta?:meta;
  data: cotation[];
};


export type cotationLigneEdit = {
  qte: number;
  produitId?: string;
  sousCompteId?: string;
};

export type deleteCotationLigneEdit = {
  sousCompteId?: string;
};

