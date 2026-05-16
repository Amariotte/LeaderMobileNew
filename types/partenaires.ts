  import { meta } from "./other.type";

export type statusPartenaires = "Activé" | "Désativé" | "En attente";

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
  etatLib?: statusPartenaires;
};


export type listPartenaires = {
  meta?: meta;
  data: partenaire[];
};
