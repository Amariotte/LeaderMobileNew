import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { PopupProvider, usePopup } from "@/hooks/use-popup";
import {
  setApiErrorPopupHandler,
  setTokenRefreshHandler,
  setUnauthorizedHandler,
} from "@/services/api-client";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <PopupProvider>
          <RootNavigator />
          <StatusBar style="auto" />
        </PopupProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { isLoading, userToken, clearAuthSession, refreshAccessToken } =
    useAuthContext();
  const { showMessage } = usePopup();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthSession();
    });

    setTokenRefreshHandler(async () => {
      return refreshAccessToken();
    });

    setApiErrorPopupHandler(({ title, message }) => {
      showMessage("error", title, message);
    });

    return () => {
      setUnauthorizedHandler(null);
      setTokenRefreshHandler(null);
      setApiErrorPopupHandler(null);
    };
  }, [clearAuthSession, refreshAccessToken]);

  if (isLoading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#1F8B82" />
      </View>
    );
  }

  if (!userToken) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(commerce)/ventes" options={{ headerShown: false }} />
      <Stack.Screen
        name="(commerce)/clients"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/clients/details"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/vehicules"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/vehicules/index"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/vehicules/details"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/vehicules/form"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/contrats"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/contrats/form"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/fournisseurs"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/ventes/details"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/ventes/saisie"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/encaissements-primes"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/operations-diverses"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/stock-mon"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/stock-courtiers"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/stock-partenaires"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/stock-producteurs"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", headerShown: false }}
      />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
