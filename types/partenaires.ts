  import { meta } from "./other.type";

export type partenaire = {
  id?: number;
  code?: string;
  codeAsaci?: string;
  codeAsaciProducteur?: string;
  dateDemandeCreationCompte?: Date;
  dateActivationCompte?: Date;
  etat?: number;
  nom: string;
  email?: string;
  contacts?: string;
  whatsapp?: string;
  mobile?: string;
  nomRepresentant?: string;
  adresse?: string;
  rccm?: string;
  allUseCodeAsaci?: boolean;
};

export type listPartenaires = {
  meta?: meta;
  data: partenaire[];
};
