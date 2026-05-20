import { agence, listAgences } from "@/types/agences";
import { listPartenaires, partenaire } from "@/types/partenaires";
import { metaFakeData } from "./params.fake";



export const partenairesDataFake : partenaire [] = [
  {
    id: 1,
    code: "PART-001",
    codeAsaci: "ASACI-001",
    codeAsaciProducteur: "ASACI-PROD-001",
    dateDemandeCreationCompte: new Date("2023-01-01"),
    dateActivationCompte: new Date("2023-01-15"),
    etat: 1,
    nom: "Agence Abidjan",
    email: "",
    contacts: "",
    whatsapp: "",
    mobile: "",
    nomRepresentant: "",
    adresse: "",
  },
  {
    id: 2,
    code: "PART-002",
    codeAsaci: "ASACI-002",
    codeAsaciProducteur: "ASACI-PROD-002",
    dateDemandeCreationCompte: new Date("2023-02-01"),
    dateActivationCompte: new Date("2023-02-15"),
    etat: 1,
    nom: "Agence Gombe",
    email: "",
    contacts: "",
    whatsapp: "",
    mobile: "",
    nomRepresentant: "",
    adresse: "",
  },
]

export const agencesDataFake : agence [] = [
 {
    id: 1,
    nom: "Agence Abidjan",
    adresse: "Abidjan, Cocody, Riviera 2",
    tel: "0123456789",
    email: "",
  },
  {
    id: 2,
    nom: "Agence Gombe",
    adresse: "Gombe, Kinshasa",
    tel: "0987654321",
    email: "",
  },
]

export const listPartenairesDataFake: listPartenaires = {
  meta: metaFakeData,
  data: partenairesDataFake,
};

export const listAgencesDataFake: listAgences = {
  meta: metaFakeData,
  data: agencesDataFake,
};

