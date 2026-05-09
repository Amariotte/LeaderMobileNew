
export type TypeAttestation = {
  id: number;
  code: string;
  libelle: string;
};

export enum Params {
  BAREMES = "BAREMES",
  COUVERTURES = "COUVERTURES",
  TYPES = "TYPES",
  GENRES = "GENRES",
  CARROSSERIES = "CARROSSERIES",
  MARQUES = "MARQUES",
  ENERGIES = "ENERGIES",
  USAGES = "USAGES",
  COULEURS = "COULEURS",
  PROFESSIONS = "PROFESSIONS",
  ZONES_CIRCULATIONS = "ZONES_CIRCULATIONS",
  GROUPES_ZONES = "GROUPES_ZONES",
  MOTIFS_ANNULATIONS = "MOTIF_ANNULATIONS",
  COMPAGNIES  = "COMPAGNIES",
}

export { Params as params };


export type meta = {
  page: number;
  next: number;
  totalPages: number;
  total: number;
  size: number;
};


export type itemDefaut = {
  code: string;
  libelle: string;
  id: number;
};


export type PaginationParams = {
  page?: number;
  size?: number;
};

export type PaginatedResponse<T> = {
  meta?: meta;
  data: T[];
};

export type stat = {
  venteNonSoldee: {
    total: number;
    nbre: number;
  };
  venteEchue: {
    nbre: number;
    total: number;
  };
  promotionActive: number;
  sousCompte: number;
};


export type dataChart = {
  mois: string;
  vente: number;
  decaissement: number;
  commission: number;
  reglement: number;
  encaissement: number;
  entree: number;
  sortie: number;
};
  

export type parametresData = {
  couvertures? : { data: itemDefaut[] };
  baremes?: { data: itemDefaut[] };
  types?: { data: itemDefaut[] };
  genres?: { data: itemDefaut[] };
  carrosseries?: { data: itemDefaut[] };
  marques?: { data: itemDefaut[] };
  energies?: { data: itemDefaut[] };
  usages?: { data: itemDefaut[] };
  couleurs?: { data: itemDefaut[] };
  professions?: { data: itemDefaut[] };
  zones_circulations?: { data: itemDefaut[] };
  groupes_zones?: { data: itemDefaut[] };
  motifs_annulations?: { data: itemDefaut[] };
  compagnies?: { data: itemDefaut[] };
};