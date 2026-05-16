  import { meta } from "./other.type";

export type utilisateur = {
  id?: number;
  login?: string;
  codeAsaci?: string;
  partenaireId?: number;
  compteActive?: boolean;
  superUser?: boolean;
  nom: string;
  typeUser?: number;
  email?: string;
  contacts?: string;
  whatsapp?: string;
  mobile?: string;
  agenceId?: number;
  listeDesPermissions?: string;
  listeDesIdAgences?: string;
  allAgences?: boolean;
  agenceNom?: string;
  partenaireNom?: string;
};

export type listUtilisateurs = {
  meta?: meta;
  data: utilisateur[];
};

