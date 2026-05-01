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
  bP: string;
  exoTaxe?: boolean;
	rccm?: string;
  libProfession?: string;
};

export type listClients = {
  meta?: meta;
  data: client[];
};
