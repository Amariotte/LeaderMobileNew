import { userDataFake } from "@/data/datas.fake";
import { setCacheUserCode } from "@/services/cache-service";
import {
  fetchConnectedUser,
  refreshAccessTokenApi,
  signInApi,
  signOutApi,
} from "@/services/user-service";
import { user } from "@/types/user.type";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const DEMO_DELAY_MS = 700;
const DEMO_TOKEN = "demo-token";
const AUTH_TOKEN_STORAGE_KEY = "auth.token";
const AUTH_REFRESH_TOKEN_STORAGE_KEY = "auth.refresh-token";
const AUTH_USER_STORAGE_KEY = "auth.user";

export const DEMO_ACCOUNT = {
  login: "demo",
  password: "demo123",
};

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface AuthState {
  isLoading: boolean;
  isSignout: boolean;
  userToken: string | null;
  refreshToken: string | null;
  user: user | null;
  profilePhotoVersion: number;
}

export interface UseAuthReturn extends AuthState {
  signIn: (login: string, password: string) => Promise<void>;
  signInDemo: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthSession: () => void;
  refreshAccessToken: () => Promise<string | null>;
  refreshUserProfile: () => Promise<void>;
  refreshProfilePhoto: () => void;
  error: string | null;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    isSignout: false,
    userToken: null,
    refreshToken: null,
    user: null,
    profilePhotoVersion: 0,
  });

  const [error, setError] = useState<string | null>(null);

  const persistAuthSession = useCallback(
    async (
      token: string | null,
      refreshToken: string | null,
      authenticatedUser: AuthState["user"],
    ) => {
      await Promise.all([
        token
          ? AsyncStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token)
          : AsyncStorage.removeItem(AUTH_TOKEN_STORAGE_KEY),
        refreshToken
          ? AsyncStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, refreshToken)
          : AsyncStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY),
        authenticatedUser
          ? AsyncStorage.setItem(
              AUTH_USER_STORAGE_KEY,
              JSON.stringify(authenticatedUser),
            )
          : AsyncStorage.removeItem(AUTH_USER_STORAGE_KEY),
      ]);
    },
    [],
  );

  const applyAuthenticatedState = (
    token: string,
    refreshToken: string | null,
    authenticatedUser: AuthState["user"],
  ) => {
    setCacheUserCode(authenticatedUser?.code ?? null);
    void persistAuthSession(token, refreshToken, authenticatedUser);
    setState({
      isLoading: false,
      isSignout: false,
      userToken: token,
      refreshToken,
      user: authenticatedUser,
      profilePhotoVersion: 0,
    });
  };

  const clearAuthSession = useCallback(() => {
    setCacheUserCode(null);
    void persistAuthSession(null, null, null);
    setState({
      isLoading: false,
      isSignout: true,
      userToken: null,
      refreshToken: null,
      user: null,
      profilePhotoVersion: 0,
    });
    setError(null);
  }, [persistAuthSession]);

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const [storedToken, storedRefreshToken, storedUserRaw] =
          await Promise.all([
            AsyncStorage.getItem(AUTH_TOKEN_STORAGE_KEY),
            AsyncStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY),
            AsyncStorage.getItem(AUTH_USER_STORAGE_KEY),
          ]);

        if (!storedToken) {
          if (isMounted) {
            setState((prev) => ({ ...prev, isLoading: false }));
          }
          return;
        }

        if (storedToken === DEMO_TOKEN) {
          const demoUser = storedUserRaw
            ? (JSON.parse(storedUserRaw) as user)
            : userDataFake;

          setCacheUserCode(demoUser?.code ?? null);

          if (isMounted) {
            setState({
              isLoading: false,
              isSignout: false,
              userToken: storedToken,
              refreshToken: storedRefreshToken,
              user: demoUser,
              profilePhotoVersion: 0,
            });
          }

          if (!storedUserRaw) {
            await persistAuthSession(
              storedToken,
              storedRefreshToken,
              userDataFake,
            );
          }

          return;
        }

        let nextToken = storedToken;
        let nextRefreshToken = storedRefreshToken;
        let authenticatedUser = storedUserRaw
          ? (JSON.parse(storedUserRaw) as user)
          : null;

        try {
          authenticatedUser = await fetchConnectedUser(storedToken);
        } catch {
          if (!storedRefreshToken) {
            throw new Error("Session expirée");
          }

          const refreshedSession = await refreshAccessTokenApi(storedRefreshToken);
          nextToken = refreshedSession.access_token;
          nextRefreshToken = refreshedSession.refresh_token || storedRefreshToken;
          authenticatedUser =
            refreshedSession.user ?? (await fetchConnectedUser(nextToken));
        }

        await persistAuthSession(
          nextToken,
          nextRefreshToken,
          authenticatedUser,
        );
        setCacheUserCode(authenticatedUser?.code ?? null);

        if (isMounted) {
          setState({
            isLoading: false,
            isSignout: false,
            userToken: nextToken,
            refreshToken: nextRefreshToken,
            user: authenticatedUser,
            profilePhotoVersion: Date.now(),
          });
        }
      } catch {
        setCacheUserCode(null);
        await persistAuthSession(null, null, null);
        if (isMounted) {
          setState({
            isLoading: false,
            isSignout: true,
            userToken: null,
            refreshToken: null,
            user: null,
            profilePhotoVersion: 0,
          });
        }
      }
    };

    void restoreSession();

    return () => {
      isMounted = false;
    };
  }, [persistAuthSession]);

  const refreshAccessToken = useCallback(async () => {
    if (!state.refreshToken) {
      return null;
    }

    if (state.userToken === DEMO_TOKEN) {
      return state.userToken;
    }

    try {
      const authRes = await refreshAccessTokenApi(state.refreshToken);
      const nextAccessToken =
        typeof authRes?.access_token === "string" ? authRes.access_token : "";

      if (!nextAccessToken) {
        throw new Error("Réponse invalide du serveur de rafraîchissement");
      }

      await persistAuthSession(
        nextAccessToken,
        authRes.refresh_token || state.refreshToken,
        authRes.user ?? state.user,
      );
      setCacheUserCode(authRes.user?.code ?? state.user?.code ?? null);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        isSignout: false,
        userToken: nextAccessToken,
        refreshToken: authRes.refresh_token || prev.refreshToken,
        user: authRes.user ?? prev.user,
      }));

      return nextAccessToken;
    } catch {
      return null;
    }
  }, [persistAuthSession, state.refreshToken, state.user, state.userToken]);

  const loadUserProfile = async (
    token: string,
    refreshToken?: string | null,
  ) => {
    try {
      const profile =
        token === DEMO_TOKEN ? userDataFake : await fetchConnectedUser(token);

      await persistAuthSession(
        token,
        refreshToken ?? state.refreshToken,
        profile,
      );
      setCacheUserCode(profile?.code ?? null);
      setState((prev) => ({ ...prev, user: profile }));
    } catch {
      // profil non critique, on ne bloque pas l'appli
    }
  };

  const refreshUserProfile = useCallback(async () => {
    if (!state.userToken) {
      return;
    }
    await loadUserProfile(state.userToken);
  }, [loadUserProfile, state.userToken]);

  const refreshProfilePhoto = useCallback(() => {
    setState((prev) => ({ ...prev, profilePhotoVersion: Date.now() }));
  }, []);

  const signInDemo = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      await wait(DEMO_DELAY_MS);

      applyAuthenticatedState(DEMO_TOKEN, null, userDataFake);
      await loadUserProfile(DEMO_TOKEN, null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur de connexion en mode demo";
      setCacheUserCode(null);
      await persistAuthSession(null, null, null);
      setState({
        isLoading: false,
        isSignout: true,
        userToken: null,
        refreshToken: null,
        user: null,
        profilePhotoVersion: 0,
      });
      setError(errorMessage);
      throw err;
    }
  };

  const signIn = async (login: string, password: string) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setError(null);

    try {
      // Validate input
      if (!login || !password) {
        throw new Error("Veuillez entrer votre login et mot de passe");
      }

      if (
        login.trim().toLowerCase() === DEMO_ACCOUNT.login &&
        password === DEMO_ACCOUNT.password
      ) {
        await wait(DEMO_DELAY_MS);
        applyAuthenticatedState(DEMO_TOKEN, null, userDataFake);
        await loadUserProfile(DEMO_TOKEN);
        return;
      }

      const authRes = await signInApi(login, password);
      applyAuthenticatedState(
        authRes.access_token,
        authRes.refresh_token,
        authRes.user,
      );
      if (!authRes.user) {
        await loadUserProfile(authRes.access_token, authRes.refresh_token);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur de connexion";
      setCacheUserCode(null);
      await persistAuthSession(null, null, null);
      setState({
        isLoading: false,
        isSignout: true,
        userToken: null,
        refreshToken: null,
        user: null,
        profilePhotoVersion: 0,
      });
      setError(errorMessage);
      throw err;
    }
  };

  const signOut = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      if (state.userToken === DEMO_TOKEN) {
        await wait(250);

        clearAuthSession();
        return;
      }

      // Call API
      await signOutApi(state.userToken ?? "");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de la déconnexion";
      setError(errorMessage);
    } finally {
      clearAuthSession();
    }
  };

  return {
    ...state,
    signIn,
    signInDemo,
    signOut,
    clearAuthSession,
    refreshAccessToken,
    refreshUserProfile,
    refreshProfilePhoto,
    error,
  };
}
