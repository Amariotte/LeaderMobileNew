import { encaissementPrime, listEncaissementsPrimes } from "@/types/encaissementPrime.type";
import { listOperations, operation } from "@/types/operations.type";
import { metaFakeData } from "./params.fake";


export const reglements: encaissementPrime[] = [
  {
    id: 1,
    numero: "ENC-001",
    clientId: 1,
    agenceId: 1,
    banqueId: 1,
    modeId: 1,
    clientCode: "CODE-001",
    agenceNom: "Agence Gombe",
    banqueNom: "Sous-compte A",
    operateurNom: "M. Ilunga",
    date: new Date("2026-03-17"),
    montant: 150000,
    montantUtilise: 50000,
    solde: 100000,
    obs: "Encaissement de la facture FAC-2026-001",
    ref: "FAC-2026-001",

  },
];

 

export const operations: operation[] = [
  {
    id: 1,
    numero: "OP001",
    date: new Date("2026-03-17"),
    montant: 150000,
    agenceNom: "Agence Gombe",
    banqueNom: "Sous-compte A",
    modeNom: "Espèces",
    operateurNom: "M. Ilunga",
    objetOp: "Paiement de la facture FAC-2026-001",
    beneOrDep: "Encaissement",
    bEnc: true,
    desc: "Encaissement de la facture FAC-2026-001",
    modeId: 1,
    agenceId: 1,
    banqueId: 1,
  },
];



export const reglementsFakeData: listEncaissementsPrimes = {
  meta: metaFakeData,
  data: reglements,
};

export const operationsFakeData: listOperations = {
  meta: metaFakeData,
  data: operations,
};

