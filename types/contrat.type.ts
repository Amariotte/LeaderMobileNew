import { meta } from "./other.type";

export type contrat = {
  id: number;
  numeroContrat: string;
  categorie: string;
  numeroPolice: string;
  dateContrat: Date;

  clientId?: number;
  agenceId?: number;
  compagnieId?: number;
  baremeId?: number;
  couvertureId?: number;

  souscripteur: {
    typeId: number;
    type: string;
    nom: string;
    tel: string;
    email: string;
    bp: string;
  };

  agence: string;
  compagnie: string;
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
