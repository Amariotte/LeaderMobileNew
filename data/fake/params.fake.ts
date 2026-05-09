import { itemDefaut, meta, parametresData } from "@/types/other.type";
import { SoldeResponse } from "@/types/solde.type";

export const soldeFake: SoldeResponse = {
  solde: 100000,
};

export const metaFakeData: meta = {
  page: 1,
  next: 2,
  totalPages: 12,
  total: 1116,
  size: 100,
};



export const professionsFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "PROF-001",
    libelle: "Agriculteur",
  },
  {
    id: 2,
    code: "PROF-002",
    libelle: "Commerçant",
  },
  {
    id: 3,
    code: "PROF-003",
    libelle: "Artisan",
  },
  {
    id: 4,
    code: "PROF-004",
    libelle: "Profession libérale",
  },
];

export const genresFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "GEN-001",
    libelle: "Tourisme",
  },
  {
    id: 2,
    code: "GEN-002",
    libelle: "Utilitaire",
  },
  {
    id: 3,
    code: "GEN-003",
    libelle: "Camion",
  },
  {
    id: 4,
    code: "GEN-004",
    libelle: "Moto",
  },
];

export const carroreseriesFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "CAR-001",
    libelle: "Berline",
  },
  {
    id: 2,
    code: "CAR-002",
    libelle: "SUV",
  },
  {
    id: 3,
    code: "CAR-003",
    libelle: "Break",
  },
  {
    id: 4,
    code: "CAR-004",
    libelle: "Pickup",
  },
];

export const energiesFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "ENE-001",
    libelle: "Essence",
  },
  {
    id: 2,
    code: "ENE-002",
    libelle: "Diesel",
  },
  {
    id: 3,
    code: "ENE-003",
    libelle: "Hybride",
  },
  {
    id: 4,
    code: "ENE-004",
    libelle: "Electrique",
  },
];

export const marquesFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "MAR-001",
    libelle: "Toyota",
  },
  {
    id: 2,
    code: "MAR-002",
    libelle: "Hyundai",
  },
  {
    id: 3,
    code: "MAR-003",
    libelle: "Peugeot",
  },
  {
    id: 4,
    code: "MAR-004",
    libelle: "Renault",
  },
];

export const couleursFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "COU-001",
    libelle: "Blanc",
  },
  {
    id: 2,
    code: "COU-002",
    libelle: "Noir",
  },
  {
    id: 3,
    code: "COU-003",
    libelle: "Gris",
  },
  {
    id: 4,
    code: "COU-004",
    libelle: "Bleu",
  },
];

export const UsagesFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "USA-001",
    libelle: "Affaire",
  },
  {
    id: 2,
    code: "USA-002",
    libelle: "Personnel",
  },
  {
    id: 3,
    code: "USA-003",
    libelle: "Transport",
  },
  {
    id: 4,
    code: "USA-004",
    libelle: "Mixte",
  },
];

export const VehiculeTypesFakeData: itemDefaut [] = [
   {
    id: 1,
    code: "VP",
    libelle: "VP  (Véhicule de tourisme)",
  },
  {
    id: 2,
    code: "VUL",
    libelle: "VUL (Véhicule utilitaire léger)",
  },
  {
    id: 3,
    code: "PL",
    libelle: "PL (Poids lourd)",
  },
];

export const zonesFakeData: itemDefaut [] = [
   {
    id: 1,
    code: "Abidjan",
    libelle: "Abidjan",
  },
  {
    id: 2,
    code: "Yamoussoukro",
    libelle: "Yamoussoukro",
  },
  {
    id: 3,
    code: "Bouake",
    libelle: "Bouake",
  },
];


export const categorieVehiculeFakeData: itemDefaut [] = [
   {
    id: 1,
    code: "Promenade et affaires",
    libelle: "Promenade et affaires",
  },
  {
    id: 2,
    code: "Véhicule de transport",
    libelle: "Véhicule de transport",
  },
  {
    id: 3,
    code: "Véhcule professionnel",
    libelle: "Véhcule professionnel",
  },
];





export const sousCategoriesFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "Standard",
    libelle: "Standard",
  },
  {
    id: 2,
    code: "Premium",
    libelle: "Premium",
  },
  {
    id: 3,
    code: "Entreprise",
    libelle: "Entreprise",
  },
];

export const GroupesZonesFakeData: itemDefaut [] = [
  {
    id: 1,
    code: "Urbain",
    libelle: "Urbain",
  },
  {
    id: 2,
    code: "Inter-urbain",
    libelle: "Inter-urbain",
  },
  {
    id: 3,
    code: "National",
    libelle: "National",
  },
];


export const CompagnieFakeData: itemDefaut [] = [
 {
    id: 1,
    code: "COMP-001",
    libelle: "Compagnie d'assurance XYZ",
  },
  {
    id: 2,
    code: "COMP-002",
    libelle: "Compagnie d'assurance ABC",
 },
  {
    id: 3,
    code: "COMP-003",
    libelle: "Compagnie d'assurance DEF",
  },
];



export const parametresFakeData: parametresData = {
  couvertures: { data: [] },
  baremes: { data: UsagesFakeData },
  types: { data: VehiculeTypesFakeData },
  genres: { data: genresFakeData },
  carrosseries: { data: carroreseriesFakeData },
  marques: { data: marquesFakeData },
  energies: { data: energiesFakeData },
  usages: { data: UsagesFakeData },
  couleurs: { data: couleursFakeData },
  professions: { data: professionsFakeData },
  zones_circulations: { data: zonesFakeData },
  groupes_zones: { data: GroupesZonesFakeData },
  compagnies: { data: CompagnieFakeData },
  motifs_annulations: { data: [] }
}
