const resolvedBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

const apiConfig = {
  baseURL: resolvedBaseUrl ? resolvedBaseUrl : undefined,
  endpoints: {
    login: "/auth/login",
    refresh: "/auth/refresh",
    logout: "/auth/logout",
    currentUser: "/auth/me",
    profilePhoto: "/auth/photos",
    stockMe: "/stock-me",
      stockCourtier: "/stock-courtier",
      stockPartenaires: "/stock-partenaires",
       stockProducteurs: "/stock-producteurs",
    mouvements: "/mouvements",
    changePassword: "/auth/update-password",
    contrats: "/contrats",
    stats: "/stats",
    encaissementsPrimes : "/encaissements-primes",
    operations: "/operations",
    cotations: "/cotations",
    clients: "/clients",
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
