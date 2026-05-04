  import { meta } from "./other.type";


export type compagnie = {
  id?: number;
  code?: string;
  nom: string;
  email?: string;
  tel?: string;
  mobile?: string;
  nomRepresentant?: string;
  adresse?: string;
};

export type listCompagnies = {
  meta?: meta;
  data: compagnie[];
};
