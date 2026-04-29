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
  