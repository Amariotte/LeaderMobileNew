import { meta } from "./other.type";

export type typeMouvements =
  | "Vente"
  | "Décaissement"
  | "Réglement"
  | "Commission";

export const typeMouvementColorMap: Record<typeMouvements, string> = {
  Vente: "#3b82f6",
  Décaissement: "#f59e0b",
  Réglement: "#16a34a",
  Commission: "#f59e0b",
};

export const typeMouvementIconMap: Record<typeMouvements, string> = {
  Vente: "receipt",
  Décaissement: "arrow-upward",
  Réglement: "check-circle",
  Commission: "percent",
};

export type Mouvement = {
  id: string;
  codeOp: string;
  dateOp: string;
  montant: number;
  type: number;
  nomAgence: string;
  nomSousCompte: string;
  libType: typeMouvements;
};

export type listMouvements = {
  meta?: meta;
  data: Mouvement[];
};
