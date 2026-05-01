import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

import AppHeaderDrawer from "@/components/app-header-drawer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAuthContext } from "@/hooks/auth-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { usePopup } from "@/hooks/use-popup";
import { getfetchEncaissementsPrimes } from "@/services/api-service";
import { formatDate, formatNumber } from "@/tools/tools";
import { encaissementPrime } from "@/types/encaissementPrime.type";

export default function EncaissementsPrimesScreen() {
  const scheme = useColorScheme() ?? "light";
  const isDark = scheme === "dark";
  const { userToken } = useAuthContext();
  const { showMessage } = usePopup();
  const [encaissements, setEncaissements] = useState<encaissementPrime[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userToken) {
      setEncaissements([]);
      return;
    }

    setLoading(true);
    getfetchEncaissementsPrimes(userToken)
      .then((response) => setEncaissements(response?.data ?? []))
      .catch(() => {
        showMessage("error", "Erreur", "Impossible de charger les encaissements.");
        setEncaissements([]);
      })
      .finally(() => setLoading(false));
  }, [showMessage, userToken]);

  const metrics = useMemo(() => {
    const total = encaissements.reduce(
      (acc, item) => acc + (Number(item.montant) || 0),
      0,
    );
    const moyenne = encaissements.length > 0 ? total / encaissements.length : 0;

    return [
      { label: "Total encaissé", value: formatNumber(total), icon: "payments" as const },
      { label: "Prime moyenne", value: formatNumber(Math.round(moyenne)), icon: "speed" as const },
      { label: "Dossiers", value: formatNumber(encaissements.length), icon: "description" as const },
    ];
  }, [encaissements]);

  const pageBackground = isDark ? "#11131A" : "#F4F4F7";
  const cardBackground = isDark ? "#1B1E28" : "#FFFFFF";
  const muted = isDark ? "#A8AEC7" : "#61637A";
  const borderColor = isDark ? "#363A4C" : "#E7EAF5";

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBackground }]}> 
      <View style={styles.headerWrap}>
        <AppHeaderDrawer title="Encaissements primes" />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.subtitle, { color: muted }]}>Suivi des primes encaissées</ThemedText>

        {metrics.map((item) => (
          <View key={item.label} style={[styles.card, { backgroundColor: cardBackground }]}> 
            <View style={styles.cardRow}>
              <MaterialIcons name={item.icon} size={18} color="#1F8B82" />
              <ThemedText style={styles.cardLabel}>{item.label}</ThemedText>
            </View>
            <ThemedText style={styles.cardValue}>{item.value} XOF</ThemedText>
          </View>
        ))}

        {loading ? (
          <ActivityIndicator size="small" color="#1F8B82" style={styles.loader} />
        ) : encaissements.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBackground, borderColor }]}>
            <MaterialIcons name="payments" size={24} color={muted} />
            <ThemedText style={[styles.emptyText, { color: muted }]}>Aucun encaissement enregistré</ThemedText>
          </View>
        ) : (
          <View style={styles.listWrap}>
            {encaissements.map((item) => (
              <View
                key={String(item.id)}
                style={[styles.itemCard, { backgroundColor: cardBackground, borderColor }]}
              >
                <View style={styles.itemHead}>
                  <ThemedText style={styles.itemNumero}>{item.numero || `ENC-${item.id}`}</ThemedText>
                  <ThemedText style={styles.itemAmount}>{formatNumber(item.montant)} XOF</ThemedText>
                </View>
                <ThemedText style={[styles.itemMeta, { color: muted }]}>
                  {item.clientNom || "Client non défini"}
                </ThemedText>
                <ThemedText style={[styles.itemMeta, { color: muted }]}>Date: {formatDate(item.date)}</ThemedText>
                <ThemedText style={[styles.itemMeta, { color: muted }]}>Mode: {item.modeNom || "Non défini"}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 16, paddingHorizontal: 12 },
  headerWrap: { marginTop: -16, marginHorizontal: -12, marginBottom: 14 },
  content: { gap: 12, paddingBottom: 24 },
  subtitle: { fontSize: 13, marginBottom: 4 },
  card: { borderRadius: 14, padding: 14 },
  cardRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardLabel: { fontSize: 14, fontWeight: "600" },
  cardValue: { marginTop: 10, fontSize: 20, fontWeight: "800", color: "#1F8B82" },
  loader: { marginTop: 8 },
  emptyCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyText: { fontSize: 13, fontWeight: "600" },
  listWrap: { gap: 10 },
  itemCard: { borderRadius: 12, padding: 12, borderWidth: 1 },
  itemHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  itemNumero: { fontSize: 13, fontWeight: "700" },
  itemAmount: { fontSize: 13, fontWeight: "800", color: "#1F8B82" },
  itemMeta: { fontSize: 12, marginTop: 4 },
});
