import { AuthResponse, user } from "@/types/user.type";
import { listUtilisateurs, utilisateur } from "@/types/utilisateurs";
import { metaFakeData } from "./params.fake";


export const userDataFake: user = {
  nom: "Ange mariotte",
  codeAsaci: "AM123",
  telFixe: "0123456789",
  telMobile: "0987654321",
  email: "ange.mariotte@example.com",
  courtierNom: "LEADER ASSURANCE",
  partenaireNom: "LEADER ASSUR",
  agenceNom: "SCA NOUVELLE ERE",
  photo: "https://example.com/photos/ange-mariotte.jpg",
  type: "PARTICULIER",
  whatsApp: "0123456789",
  typeId: 1,
  login: "amariotte",
  agenceId: 1,
  partenaireId: 1,
  courtierId: 1,
};


export const userDataFakeAuthResponse: AuthResponse = {
  access_token: "fake-token",
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "fake-refresh-token",
  user: userDataFake,
};



export const utilisateursFake: utilisateur[] = [
  {
    id: 1,
    nom: "Jean-Paul Kouassi",
    login: "jkouassi",
    email: "jkouassi@leader.ci",
    contacts: "0102030405",
    compteActive: true,
    superUser: false,
    typeUser: 1,
    partenaireNom: "Agence Abidjan",
  },
  {
    id: 2,
    nom: "Marie Adjoua",
    login: "madjoua",
    email: "madjoua@leader.ci",
    contacts: "0506070809",
    compteActive: true,
    superUser: true,
    typeUser: 2,
    partenaireNom: "Siège",
  },
  {
    id: 3,
    nom: "Koné Ibrahim",
    login: "kibrahim",
    email: "kibrahim@leader.ci",
    contacts: "",
    compteActive: false,
    superUser: false,
    typeUser: 1,
    partenaireNom: "Agence Gombe",
  },
];


export const listUtilisateursFake: listUtilisateurs = {
  meta: metaFakeData,
  data: utilisateursFake,
};

