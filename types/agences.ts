import { meta } from "./other.type";


export type agence = {
  id?: number;
  nom: string;
  email?: string;
  tel?: string;
  adresse?: string;
};

export type listAgences = {
  meta?: meta;
  data: agence[];
};
