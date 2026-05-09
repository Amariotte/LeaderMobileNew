import { meta } from "./other.type";

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
