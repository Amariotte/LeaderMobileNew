import { meta } from "./other.type";

export type client = {
  id: number;
  civilite: number;
  typeId: number;
  professionId: number;
  code: string;
  nom: string;
  prenoms?: string;
  email: string;
  mobile: string;
  tel: string;
  whatsapp: string;
  bP: string;
  exoTaxe?	: boolean
	rccm?: string;

  libProfession?: string;
};

export type listClients = {
  meta?: meta;
  data: client[];
};
