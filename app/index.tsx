import { sharedStyles } from "@/styles/shared.js";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useEffect, useState } from "react";

import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { useAuthContext } from "@/hooks/auth-context";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

export default function LoginScreen() {
  const { signIn, userToken, isLoading } = useAuthContext();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && userToken) {
      router.replace("/(tabs)");
    }
  }, [isLoading, userToken]);

  const handleSignIn = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Veuillez remplir votre nom d'utilisateur et mot de passe.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await signIn(username.trim(), password);
      router.replace("/(tabs)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient
      colors={["#1F8B82", "#1F8B82", "#2A9F95"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <SafeAreaView style={sharedStyles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardContainer}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.topArea}>
            <View style={styles.decorCircleLeft} />
            <View style={styles.decorCircleRight} />

            <View style={styles.centerContent}>
              <View style={styles.logoRow}>
                <MaterialIcons name="blur-on" size={30} color="#FFFFFF" />
                <ThemedText style={styles.logoText}>Kanakku</ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.formCard}>
            <ThemedText style={styles.welcomeTitle}>Bienvenue </ThemedText>
            <ThemedText style={styles.welcomeSubtitle}>
              Connectez-vous pour accéder à votre compte
            </ThemedText>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.fieldLabel}>
                Nom d'utilisateur
              </ThemedText>
              <View style={styles.inputWrap}>
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  keyboardType="default"
                  placeholder="Nom d'utilisateur"
                  placeholderTextColor="#B1B5C8"
                  style={styles.input}
                />
                <MaterialIcons
                  name="person-outline"
                  size={16}
                  color="#B1B5C8"
                />
              </View>
            </View>

            <View style={styles.fieldBlock}>
              <ThemedText style={styles.fieldLabel}>Mot de passe</ThemedText>
              <View style={styles.inputWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={hidePassword}
                  placeholder="Mot de passe"
                  placeholderTextColor="#B1B5C8"
                  style={styles.input}
                />
                <Pressable onPress={() => setHidePassword((prev) => !prev)}>
                  <MaterialIcons
                    name={hidePassword ? "visibility-off" : "visibility"}
                    size={16}
                    color="#B1B5C8"
                  />
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.forgotWrap}>
              <ThemedText style={styles.forgotText}>
                Mot de passe oublié ?
              </ThemedText>
            </Pressable>

            {error ? (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : null}

            <Pressable
              onPress={handleSignIn}
              disabled={submitting || isLoading}
              style={[
                styles.signInButton,
                submitting || isLoading ? styles.signInButtonDisabled : null,
              ]}
            >
              {submitting || isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.signInContent}>
                  <ThemedText style={styles.signInText}>
                    Se connecter
                  </ThemedText>
                  <MaterialIcons
                    name="arrow-forward"
                    size={15}
                    color="#FFFFFF"
                  />
                </View>
              )}
            </Pressable>

            <Pressable style={styles.backWrap}>
              <ThemedText style={styles.backText}>Retour</ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>

        <View style={styles.iosHandle}>
          <View style={styles.iosHandleBar} />
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  keyboardContainer: {
    flex: 1,
  },
  topArea: {
    flex: 1,
    minHeight: 280,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  decorCircleLeft: {
    position: "absolute",
    top: -88,
    left: -55,
    width: 165,
    height: 165,
    borderRadius: 82.5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },
  decorCircleRight: {
    position: "absolute",
    top: -115,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.20)",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  formCard: {
    backgroundColor: "#F5F5F8",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 30,
    paddingHorizontal: 22,
    paddingBottom: 24,
  },
  welcomeTitle: {
    fontSize: 42,
    lineHeight: 48,
    color: "#2D3044",
    fontWeight: "800",
  },
  welcomeSubtitle: {
    marginTop: 6,
    marginBottom: 18,
    fontSize: 18,
    color: "#7B8096",
    lineHeight: 24,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#32364A",
    marginBottom: 8,
  },
  inputWrap: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#DBDDE7",
    backgroundColor: "#EEF0F5",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    color: "#2B2F43",
    fontSize: 15,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 14,
  },
  forgotText: {
    color: "#777D96",
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    color: "#C23535",
    fontSize: 13,
    marginBottom: 10,
  },
  signInButton: {
    height: 48,
    borderRadius: 11,
    backgroundColor: "#6B3CFF",
    alignItems: "center",
    justifyContent: "center",
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  signInText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  backWrap: {
    marginTop: 18,
    alignItems: "center",
  },
  backText: {
    color: "#767C94",
    fontSize: 15,
    fontWeight: "600",
  },
  iosHandle: {
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 8,
  },
  iosHandleBar: {
    width: 52,
    height: 5,
    borderRadius: 3,
    backgroundColor: "rgba(20,20,24,0.38)",
  },
});
