export type user = {
  nom: string;
  codeAsaci: string;
  type: string;
  telFixe: string;
  whatsApp: string;
  telMobile: string;
  typeId: number;
  agenceId: number;
  partenaireId: number;
  courtierId: number;
  login: string;
  email: string;
  courtierNom: string;
  partenaireNom: string;
  agenceNom: string;
  photo: string;
};

export type AuthResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  user: user | null;
};