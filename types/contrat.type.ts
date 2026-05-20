import { meta } from "./other.type";



export type personne = {
    typeId: number;
    id?: number;
    professionId: number;
    type: string;
    nom: string;
    tel: string;
    email: string;
    bp: string;
    profession?: string;
  };


export type contrat = {
  id: number;
  numeroContrat: string;
  categorie: number;
  type: number;
  numeroPolice: string;
  dateContrat: Date;
  commentaires?: string;
  descriptionRisques?: string;



  clientId?: number;
  agenceId?: number;
  compagnieId?: number;
  baremeId?: number;
  couvertureId?: number;
  partenaireId?: number;
  operateurId?: number;
  txTaxe?: number;
  txFGA?: number;
  txBareme?: number;
  bAnnulee?: boolean;
  annuleLe?: Date;
  annulePar?: number;
  dateAnnulation?: Date;
  motifAnnulationId?: number;

  // Nested souscripteur (API format)
  souscripteur?: personne;

  agenceNom: string;
  compagnieNom: string;
  partenaireNom: string;
  typeNom: string;
  categorieNom: string;
  baremeNom: string;
  nbJours: number;
  couvertureNom: string;
  dateEffet?: Date;
  dateEcheance?: Date;

  primeNette?: number;
  accessoires?: number;
  taxe?: number;
  taxeFga?: number;
  cedeao?: number;
  netAPayer?: number;
  frais?: number;
  regle :number;   

  contratDetails?: contratVehicule[];
};

export type listContrats = {
  meta?: meta;
  data: contrat[];
};


export type contratVehicule = {
  id: number;
  vehiculeId?: number;
  usageId?: number;
  genreId?: number;
  marqueId?: number;
  modele?: string;
  typeId?: number;
  groupeZoneId?: number;
  energieId?: number;
  nbPlaces?: number;
  carrosserieId?: number;
  valeurVenale?: number;
  valeurNeuve?: number;
  puissance?: number;
  categorieId?: number;
  numeroPolice: string;
  numeroAttestation: string;
  immatriculation: string;
  dateImmatriculation: Date;
  date1ereMiseEnCirculation: Date;
  numSerieOuChassis: string;
  chargeUtile: number;
  cylindree: number;
  nbCarte: number;
  zoneCirculationId: number;
  typeAttestationId: number;
  numCedeao: string;
  numMoteur: string;
  montantRc: number;

  usageNom?: string;
  typeNom?: string;
  energieNom?: string;
  carrosserieNom?: string;
  marqueNom?: string;
  categorieNom?: string;
  genreNom?: string;
  groupeZoneNom?: string;

  primeNette?: number;
  accessoires?: number;
  taxe?: number;
  taxeFga?: number;
  cedeao?: number;
  netAPayer?: number;
  frais?: number;

  assure: personne;

  garanties?: garantieVehicule[];
};



export type garantieVehicule = {
  id?: number;
  nomGarantie: string;
  codeGarantie: string;
};


export type police = contratVehicule & {
  id: number;
  numeroContrat: string;
  categorie: number;
  type: number;
  numeroPolice: string;
  dateContrat: Date;
  commentaires?: string;
  descriptionRisques?: string;
  clientId?: number;
  agenceId?: number;
  compagnieId?: number;
  baremeId?: number;
  couvertureId?: number;
  partenaireId?: number;
  operateurId?: number;
  txTaxe?: number;
  txFGA?: number;
  txBareme?: number;
  bAnnulee?: boolean;
  annuleLe?: Date;
  annulePar?: number;
  dateAnnulation?: Date;
  motifAnnulationId?: number;

  souscripteur?: personne;
 
  agenceNom: string;
  compagnieNom: string;
  partenaireNom: string;
  typeNom: string;
  categorieNom: string;
  baremeNom: string;
  nbJours: number;
  couvertureNom: string;
  dateEffet?: Date;
  dateEcheance?: Date;
  primeNette?: number;
  accessoires?: number;
  taxe?: number;
  taxeFga?: number;
  cedeao?: number;
  netAPayer?: number;
  frais?: number;
  regle: number;
};