import { client } from "./client.type";
import { meta } from "./other.type";

export type vehicule = {
  id: number;
  numImmatriculation: string;
  dateImmatriculation: Date;
  dateMiseEnCirculation: Date;
  numSerie: string;
  numCarteGrise: string;
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
  genreId : number;
  typeId : number;
  carrosserieId : number;
  energieId : number;
  marqueId : number;
  couleurId : number;
  categorieId: number;
  sousCategorieId: number;
  villeId: number;
  zoneCirculationId: number;

  libGenre?: string;
  libType?: string;
  libCarrosserie?: string;
  libEnergie?: string;
  libMarque?: string;
  libCouleur?: string;
  libUsage?: string;
  libCategorie?: string;
  libSousCategorie?: string;
  libVille?: string;
  libZoneCirculation?: string;

  conducteurLuiMeme: boolean;
  typeConducteur?: number;
  idProfessionConducteur?: number;
  libTypeConducteur?: string;
  nomConducteur?: string;
  emailConducteur?: string;
  telConducteur?: string;
  boitePostaleConducteur?: string;
  libProfessionConducteur?: string;

  client? : client;
};

export type listVehicules = {
  meta?: meta;
  data: vehicule[];
};
