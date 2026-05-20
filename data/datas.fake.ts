import { client, listClients } from "@/types/client.type";
import { contrat, listContrats } from "@/types/contrat.type";
import { cotation, listCotation } from "@/types/devis.type";
import { listVehicules, vehicule } from "@/types/vehicule.type";
import { metaFakeData } from "./fake/params.fake";



export const cotations: cotation[] = [];

export const vehicules: vehicule[] = [
];


export const clients: client[] = [
  {
    id: 1,
    civilite: 1,
    typeId: 1,
    nom: "Ange mariotte",
    prenoms: "Ange",
    code: "CODE-001",
    email: "email@example.com",
    mobile: "0123456789",
    tel: "0123456789",
    whatsapp: "0123456789",
    bp: "Adresse 1",
    professionId: 1,
    professionNom: "Agriculteur"
  },
  {
    id: 2,
    civilite: 2,
    typeId: 2,
    nom: "Jean Dupont",
    prenoms: "Jean",
    code: "CODE-002",
    email: "jean.dupont@example.com",
    mobile: "0987654321",
    tel: "0987654321",
    whatsapp: "0987654321",
    bp: "Adresse 2",
    professionId: 2,
    professionNom: "Commerçant"
  },
  {
    id: 3,
    civilite: 1,
    typeId: 1,
    nom: "Alice Martin",
    prenoms: "Alice" ,
    code: "CODE-003",
    email: "alice.martin@example.com",
    mobile: "0123456789",
    tel: "0123456789",
    whatsapp: "0123456789",
    bp: "Adresse 3",
    professionId: 3,
    professionNom: "Enseignant"
    },
];



export const contrats: contrat[] = [
];

export const contratsFakeData: listContrats = {
  meta: metaFakeData,
  data: contrats,
};


export const cotationsFakeData: listCotation = {
  meta: metaFakeData,
  data: cotations,
};

export const clientsFakeData: listClients = {
  meta: metaFakeData,
  data: clients,
};


export const vehiculesFakeData: listVehicules = {
  meta: metaFakeData,
  data: vehicules,
};
