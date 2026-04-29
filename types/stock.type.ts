
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
  nomCompagnie: string 
  nomPartenaire: string
  nomProducteur: string
  typeAttestation: string
  qteRecues?: number
  qteRetirees?: number
  qteProduites?: number
  qteDisponibles?: number
};