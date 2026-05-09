import { AuthResponse, user } from "@/types/user.type";


export const userDataFake: user = {
  id: "user-123",
  nom: "Ange mariotte",
  code: "AM123",
  ncc: "NCC123",
  telFixe: "0123456789",
  telMobile: "0987654321",
  nomRepresentantLegal: "BEUGRE AIKPA ANGE MARIOTTE",
  dateNaissance: new Date("1990-01-01"),
  adresse: "Abidjan, Cocody, Riviera 2",
  email: "ange.mariotte@example.com",
  nomAgence: "Agence Abidjan",
  photo: "https://example.com/photos/ange-mariotte.jpg",
  civilite: "M.",
  type: "PARTICULIER",
  dateAnniversaire: "26 avril",
  typePiece: "PASSEPORT",
  numPiece: "000  000000",
  plafond: 200000,
};

export const userDataFakeAuthResponse: AuthResponse = {
  access_token: "fake-token",
  token_type: "Bearer",
  expires_in: 3600,
  refresh_token: "fake-refresh-token",
  user: userDataFake,
};