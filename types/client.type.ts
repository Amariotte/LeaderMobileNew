import { meta } from "./other.type";
import { vehicule } from "./vehicule.type";

export type client = {
  id: number;
  civilite: number;
  type: number;
  code: string;
  nom: string;
  prenom: string;
  email: string;
  mobile: string;
  tel: string;
  whatsapp: string;
  boitePostale: string;

  libProfession?: string;
  libCivilite?: string;
  libtype?: string;
  solde?: number;
  statut?: string;

  vehicules?: vehicule[];
};

export type listClients = {
  meta?: meta;
  data: client[];
};
