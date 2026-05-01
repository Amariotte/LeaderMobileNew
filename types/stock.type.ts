
export type stockCourtier = {
  nomCompagnie: string 
  qteRecues?: number
  qteRetirees?: number
  qteDistribuees?: number
  qteRetireesAfterDistribuees?: number
  qteDisponibles?: number
};

export type stockPartenaire = {
  nomCompagnie: string 
  nomPartenaire: string
  typeAttestation: string
  qteRecues?: number
  qteRetirees?: number
  qteProduites?: number
  qteDisponibles?: number
};

export type stockProducteur = {
  compagnieNom: string 
  compagnieId: number
  partenaireId: number
  producteurId: number
  partenaireNom: string
  producteurNom: string
  typeNom: string
  typeId: number
  qteRecues?: number
  qteRetirees?: number
  qteProduites?: number
  qteDisponibles?: number
};
