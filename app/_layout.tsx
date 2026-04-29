import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import "react-native-reanimated";

import { AuthProvider, useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <RootNavigator />
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootNavigator() {
  const { isLoading, userToken } = useAuthContext();

  if (isLoading) {
    return (
      <View style={styles.loaderWrap}>
        <ActivityIndicator size="large" color="#1F8B82" />
      </View>
    );
  }

  if (!userToken) {
    return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    );
  }

  return (
    <Stack>
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
        name="(commerce)/proformas"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(commerce)/produits"
        options={{ headerShown: false }}
      />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{ presentation: "modal", title: "Modal" }}
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
