import { client } from "./client.type";
import { meta } from "./other.type";

export type vehicule = {
  id: number;
  numImmatriculation: string;
  dateImmatriculation: Date;
  dateMiseEnCirculation: Date;
  numSerie: string;
  numCarteGrise: string;
  numMoteur: string;
  nbPlaces: number;
  chargeUtile: number;
  cylindree: number;
  puissance: number;
  nbCartes : number;
  valeurNeuve: number;
  valeurVenale: number;
  modele: string;
  typeCommercial: string;
  commentaires :  string;

  usageId: number;
  groupeZoneId: number;
  genreId : number;
  typeId : number;
  carrosserieId : number;
  energieId : number;
  marqueId : number;
  couleurId : number;
  categorieId: number;
  sousCategorieId: number;
  villeId: number;
  clientId: number;
  zoneCirculationId: number;

  libGenre?: string;
  libGroupeZone?: string;
  libType?: string;
  libCarrosserie?: string;
  libEnergie?: string;
  libMarque?: string;
  libCouleur?: string;
  libUsage?: string;
  libCategorie?: string;
  libSousCategorie?: string;
  libZoneCirculation?: string;

  luiMemeAssure: boolean;

  assure? : {
    nom: string;
    email: string;
    typeId?: number;
    professionId?: number;
    tel?: string;
    bP?: string;
    libProfession?: string;
  }

  client? : client;
};

export type VehicleFormData = {
  numImmatriculation: string;
  dateImmatriculation?: Date;
  dateMiseEnCirculation?: Date;
  numMoteur?: string;
  numSerie: string;
  numCarteGrise: string;
  nbPlaces: number;
  chargeUtile: number;
  cylindree: number;
  puissance: number;
  valeurNeuve: number;
  valeurVenale: number;
  modele: string;
  typeCommercial: string;
  nbCartes: number;
  commentaires: string;
  luiMemeAssure: boolean;

  usageId: number;
  groupeZoneId: number;
  genreId : number;
  typeId : number;
  carrosserieId : number;
  energieId : number;
  marqueId : number;
  couleurId : number;
  categorieId: number;
  sousCategorieId: number;
  villeId: number;
  clientId: number;
  zoneCirculationId: number;

  assure? : {
    nom: string;
    email: string;
    typeId?: number;
    professionId?: number;
    tel?: string;
    bP?: string;
    libProfession?: string;
  }
};


export type listVehicules = {
  meta?: meta;
  data: vehicule[];
};
