const resolvedBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

const apiConfig = {
  baseURL: resolvedBaseUrl ? resolvedBaseUrl : undefined,
  endpoints: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    currentUser: "/auth/me",
    profilePhoto: "/auth/photos",
    stockMe: "/stocks/me",
    stockCourtiers: "/stocks/courtiers",
    stockPartenaires: "/stocks/partenaires",
    stockProducteurs: "/stocks/producteurs",
    mouvements: "/mouvements",
    changePassword: "/auth/update-password",
    contrats: "/contrats",
    stats: "/stats",
    encaissementsPrimes : "/encaissements-primes",
    operations: "/operations",
    cotations: "/cotations",
    clients: "/clients",
    vehicules: "/vehicules",
    produits: "/produits",
    statistiques: "/statistiques",
  },
};

export function getApiUrl(endpoint: string): string {
  if (!apiConfig.baseURL) {
    throw new Error(
      "EXPO_PUBLIC_API_BASE_URL is missing. Set it before creating a production build.",
    );
  }

  return `${apiConfig.baseURL}${endpoint}`;
}

export default apiConfig;
