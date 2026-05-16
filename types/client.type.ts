import { meta } from "./other.type";


export type client = {
  id?: number;
  code?: string;
  civilite: number;
  typeId: number;
  professionId: number;
  nom: string;
  prenoms?: string;
  email: string;
  mobile?: string;
  tel: string;
  whatsapp?: string;
  bp: string;
  exoTaxe?: boolean;
	rccm?: string;
  professionNom?: string;
  typeNom?: string ;
};

export type listClients = {
  meta?: meta;
  data: client[];
};
